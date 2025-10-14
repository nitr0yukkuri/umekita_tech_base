// 必要なライブラリを読み込む
const express = require('express');
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

// ガチャAPI (/api/gacha)
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
});

