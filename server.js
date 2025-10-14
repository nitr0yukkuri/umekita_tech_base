// 必要なライブラリを読み込む
const express = require('express');
const { HfInference } = require("@huggingface/inference"); // ★追加
require('dotenv').config(); // ★追加

const hf = new HfInference(process.env.HF_TOKEN); // ★追加
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Expressアプリを初期化
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // すべてのネットワークからの接続を許可

app.use(express.json());

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ これが最もシンプルで確実な方法です ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 'public'フォルダの中身を、Webサイトのルートとして公開します
app.use(express.static('public'));


// データベースに接続
const db = new sqlite3.Database(path.join(__dirname, 'yaminabe.db'), (err) => {
    if (err) {
        return console.error('データベース接続エラー:', err.message);
    }
    console.log('データベース (yaminabe.db) に正常に接続しました。');
});

// --- APIエンドポイント ---

<<<<<<< HEAD
// 5. APIエンドポイントの作成

// 完成したレシピをDBに保存するAPIエンドポイント
// server.js の /api/generate-image エンドポイントを丸ごと置き換え

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

        const buffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        res.json({ imageUrl: imageUrl });

    } catch (error) {
        // ★★★ 変更点: エラーの詳細を出力するようにする ★★★
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('Hugging Face APIでエラーが発生しました:');
        console.error(error); // エラーオブジェクト全体を出力
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        
        // エラー時はサンプル画像を返す
        res.status(500).json({ imageUrl: '/img/1402858_s.jpg' });
    }
});

// ガチャAPIエンドポイント
=======
// ガチャAPI (/api/gacha)
>>>>>>> main
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
// server.js の末尾（app.listen の前）に、以下のコードを追加してください。

<<<<<<< HEAD
// 画像生成APIエンドポイント（シミュレーション）
app.post('/api/generate-image', (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: '画像生成のためのプロンプトが必要です。' });
    }

    console.log('受け取った画像生成プロンプト:', prompt);

    //
    // ★★★ ここに、将来的に画像生成AI（DALL-E, Stability AIなど）のAPIを呼び出すコードを書きます ★★★
    //
    
    // 今回はシミュレーションとして、常に同じ画像URLを返す
    const imageUrl = '/img/1402858_s.jpg'; // プロジェクト内の画像パス

    // 少し待ったように見せかける（0.5秒の遅延）
    setTimeout(() => {
        console.log(`画像URL "${imageUrl}" を返します。`);
        res.json({ imageUrl: imageUrl });
    }, 500);
});

// server.js の末尾に追加

// 画像生成APIエンドポイント
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'プロンプトが必要です。' });
    }
    console.log('Hugging Faceへのプロンプト:', prompt);

    try {
        // Hugging FaceのAPIを呼び出して画像を生成
        const imageBlob = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            inputs: prompt,
        });

        // BlobをBase64形式のデータURIに変換
        const buffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        // フロントエンドにデータURIを返す
        res.json({ imageUrl: imageUrl });

    } catch (error) {
        console.error('Hugging Face APIエラー:', error);
        res.status(500).json({ imageUrl: '/img/1402858_s.jpg' }); // エラー時はサンプル画像
    }
});
// 6. サーバーを起動
app.listen(PORT, () => {
    console.log(`サーバーが起動しました。 http://localhost:${PORT} でアクセスできます。`);
=======
// レシピ生成API (/api/generate-recipe)
app.post('/api/generate-recipe', (req, res) => {
    // (中身は変更なし)
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


// サーバーを起動
app.listen(PORT, HOST, () => {
    console.log(`サーバーが http://${HOST}:${PORT} で起動しました`);
>>>>>>> main
});

