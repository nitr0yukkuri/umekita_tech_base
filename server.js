// 必要なライブラリを読み込む
const express = require('express');
const { HfInference } = require("@huggingface/inference");
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Hugging Faceのクライアントを初期化
const hf = new HfInference(process.env.HF_TOKEN);

// Expressアプリを初期化
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // すべてのネットワークからの接続を許可

app.use(express.json());
// 'public'フォルダの中身を、Webサイトのルートとして公開
app.use(express.static('public'));

// データベースに接続
const db = new sqlite3.Database(path.join(__dirname, 'yaminabe.db'), (err) => {
    if (err) {
        return console.error('データベース接続エラー:', err.message);
    }
    console.log('データベース (yaminabe.db) に正常に接続しました。');
});

// --- APIエンドポイント ---

// 1. 画像生成API (/api/generate-image)
// Hugging FaceのAIを使って、プロンプトから画像を生成します。
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'プロンプトが必要です。' });
    }
    console.log('Hugging Faceへのプロンプト:', prompt);

    try {
        console.log('Hugging Face APIに画像生成をリクエストします...');
        const imageBlob = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            inputs: prompt,
        });
        console.log('画像の生成に成功しました。');

        // 画像データをWebで表示できる形式（Base64）に変換
        const buffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        res.json({ imageUrl: imageUrl });

    } catch (error) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('Hugging Face APIでエラーが発生しました:');
        console.error(error); // エラーの詳細を出力
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        
        // エラーが発生した場合は、代わりにサンプル画像を返す
        res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
    }
});

// 2. ガチャAPI (/api/gacha)
// データベースからランダムにレシピを1つ取得します。
app.get('/api/gacha', (req, res) => {
    const sql = `SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1;`;
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// 3. レシピ生成API (/api/generate-recipe)
// スロット画面で決まった材料などから、レシピ名や説明文を生成します。
app.post('/api/generate-recipe', (req, res) => {
    try {
        const { ingredients, cookingStyle, time, method, seasoning } = req.body;
        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: '材料が指定されていません' });
        }
        const recipe = {
            recipeName: `「${ingredients.join('と')}」の${cookingStyle}風 ${seasoning}仕立て`,
            description: `約${time}で完成！${method}の食感が楽しい、珠玉の一品。`,
            steps: [
                `材料（${ingredients.join('、')}など）をすべて${method}にする。`,
                `フライパンや鍋を使い、調理法「${cookingStyle}」で${time}じっくり火を通す。`,
                `最後に${seasoning}を加えて味を整え、お皿に盛り付けたら完成！`
            ]
        };
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: 'レシピの生成に失敗しました。' });
    }
});

// 4. 【追加】レシピ保存API (/api/save-recipe)
// 完成したレシピをデータベースに保存します。
app.post('/api/save-recipe', (req, res) => {
    const { recipeName, description, steps } = req.body;

    // バリデーション
    if (!recipeName || !description || !steps) {
        return res.status(400).json({ success: false, error: '必要なデータが不足しています。' });
    }

    // stepsが配列の場合は、文字列に変換してDBに保存
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