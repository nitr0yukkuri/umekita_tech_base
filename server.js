// server.js

// 1. 必要なライブラリを読み込む
const express = require('express');
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
app.post('/api/save-recipe', (req, res) => {
    const { recipeName, description, steps } = req.body;

    if (!recipeName || !description || !steps) {
        return res.status(400).json({ error: 'レシピ情報が不足しています。' });
    }

    const sql = `INSERT INTO recipes (recipeName, description, steps) VALUES (?, ?, ?)`;
    const stepsJson = JSON.stringify(steps);

    db.run(sql, [recipeName, description, stepsJson], function(err) {
        if (err) {
            console.error('データベース挿入エラー:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`新しいレシピがID ${this.lastID} で保存されました。`);
        res.json({ success: true, recipeId: this.lastID, message: 'レシピが正常に保存されました。' });
    });
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