// server.js

// 1. 必要なライブラリを読み込む
const express = require('express');
const { HfInference } = require("@huggingface/inference"); // ★追加
require('dotenv').config(); // ★追加

const hf = new HfInference(process.env.HF_TOKEN); // ★追加
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 2. Expressアプリの初期化
const app = express();
const PORT = 3000;

// POSTリクエストのJSONボディを解析するためのミドルウェア
app.use(express.json());

// 3. データベースに接続
const db = new sqlite3.Database('./yaminabe.db', (err) => {
    if (err) {
        return console.error('データベース接続エラー:', err.message);
    }
    console.log('データベース (yaminabe.db) に正常に接続しました。');
});

// 4. 静的ファイル（HTML, CSS, JS, 画像など）を提供するための設定
app.use(express.static(__dirname));

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
app.get('/api/gacha', (req, res) => {
    const sql = `SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1;`;

    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('データベースクエリエラー:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            return res.status(404).json({ error: 'ガチャで引けるレシピがありません。' });
        }
        console.log('ガチャ結果:', row);
        res.json(row);
    });
});
// server.js の末尾（app.listen の前）に、以下のコードを追加してください。

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
});

// サーバー終了時にデータベース接続を閉じる
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('データベース接続を閉じました。');
        process.exit(0);
    });
});