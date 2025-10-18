// 必要なライブラリを読み込む
const express = require('express');
const https = require('https'); // Node.js 標準のhttpsモジュール
const path = require('path');
const FormData = require('form-data'); // Clipdropの時にインストールしたライブラリ
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Expressアプリを初期化
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static('public'));

// データベースに接続
const db = new sqlite3.Database(path.join(__dirname, 'yaminabe.db'), (err) => {
    if (err) return console.error('データベース接続エラー:', err.message);
    console.log('データベース (yaminabe.db) に正常に接続しました。');
});

// --- ヘルパー関数 (レシピ名生成) ---
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function generateCoolRecipeName(ingredients, cookingStyle) {
    const mainIngredient = ingredients[0] || '奇跡の食材';
    const subIngredient = ingredients[1] || '謎の具材';
    const prefixes = ['奇跡の', '禁断の', '深淵の', '時空を超える', '伝説の', 'ネオ・', 'サイバー', '漆黒の', '閃光の', '混沌の', '終焉の', '絶対零度の'];
    const suffixes = ['〜暗黒仕立て〜', '〜光と闇の融合〜', '〜深淵より愛を込めて〜', '・インフェルノ', '・アビス', '・カタストロフィ', '・ジェネシス', '・黙示録'];
    let styleName = cookingStyle;
    if (cookingStyle === '焼く') styleName = 'アビス・ロースト';
    else if (cookingStyle === '煮る') styleName = 'カオティック・シチュー';
    else if (cookingStyle === '鍋') styleName = 'ネオ・闇鍋';
    const prefix = Math.random() < 0.5 ? getRandomElement(prefixes) : '';
    const suffix = Math.random() < 0.5 ? getRandomElement(suffixes) : '';
    return `${prefix}${mainIngredient}と${subIngredient}の${styleName}${suffix}`;
}
// --- ヘルパー関数ここまで ---


// --- APIエンドポイント ---

// 1. 画像生成API (Stability AI・SDK不要版)
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'プロンプトが必要です。' });
    }
    console.log('Stability AIへのプロンプト:', prompt);

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
        console.error('Stability AI APIキーが.envファイルに設定されていません。');
        return res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
    }

    try {
        console.log('Stability AI APIに画像生成をリクエストします...');
        
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('output_format', 'png');
        // 使用するモデルを指定
        const model = 'stable-diffusion-3-medium'; 

        const request = https.request({
            hostname: 'api.stability.ai',
            path: `/v2beta/stable-image/generate/core`,
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${apiKey}`, // APIキーをBearerトークンとして送信
                'Accept': 'image/*' // 画像データを受け取る
            }
        });

        form.pipe(request); // データを送信

        let responseData = [];
        request.on('response', (response) => {
            if (response.statusCode === 200) {
                response.on('data', (chunk) => responseData.push(chunk));
                response.on('end', () => {
                    console.log('画像の生成に成功しました。');
                    const buffer = Buffer.concat(responseData);
                    const imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
                    res.json({ imageUrl });
                });
            } else {
                 console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                 console.error(`Stability AI APIエラー: Status Code ${response.statusCode}`);
                 response.on('data', (chunk) => console.error('エラー詳細:', chunk.toString()));
                 console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                 res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
            }
        });

        request.on('error', (error) => {
            console.error('Stability AI APIでリクエストエラーが発生しました:', error);
            res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
        });

    } catch (error) {
        console.error('サーバー内部でエラーが発生しました:', error);
        res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
    }
});

// 2. ガチャAPI (変更なし)
app.get('/api/gacha', (req, res) => {
    const sql = `SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1;`;
    db.get(sql, [], (err, row) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(row);
    });
});

// 3. レシピ生成API (変更なし)
app.post('/api/generate-recipe', (req, res) => {
    try {
        const { ingredients, cookingStyle, recipeData } = req.body;
        if (!ingredients || !cookingStyle || !recipeData) {
            return res.status(400).json({ error: '必要なデータが不足しています' });
        }
        const recipeName = generateCoolRecipeName(ingredients, cookingStyle);
        const description = `主な材料は${ingredients.join('、')}。調理法は「${cookingStyle}」。`;
        const steps = recipeData.map(step => {
            const seasoningText = step.seasoning ? `(味付け: ${step.seasoning})` : '';
            return `${step.ingredient}を「${step.time}」で「${step.cutting}」にする${seasoningText}`;
        });
        res.json({ recipeName, description, steps });
    } catch (error) {
        res.status(500).json({ error: 'レシピの生成に失敗しました。' });
    }
});

// 4. レシピ保存API (変更なし)
app.post('/api/save-recipe', (req, res) => {
    const { recipeName, description, steps } = req.body;
    if (!recipeName || !description || !steps) {
        return res.status(400).json({ success: false, error: '必要なデータが不足しています。' });
    }
    const stepsString = Array.isArray(steps) ? steps.join('\n') : steps;
    const sql = `INSERT INTO recipes (recipeName, description, steps) VALUES (?, ?, ?)`;
    db.run(sql, [recipeName, description, stepsString], function(err) {
        if (err) {
            console.error('DB保存エラー:', err.message);
            return res.status(500).json({ success: false, error: 'データベースへの保存に失敗しました。' });
        }
        console.log(`新しいレシピがID ${this.lastID} で保存されました。`);
        res.json({ success: true, id: this.lastID });
    });
});

// サーバーを起動
app.listen(PORT, HOST, () => {
    console.log(`サーバーが http://${HOST}:${PORT} で起動しました`);
});