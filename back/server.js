// back/server.js

const express = require('express');
// const { GoogleGenerativeAI } = require('@google/generative-ai'); // ← 削除
// require('dotenv').config(); // ← 削除

const app = express();
const port = 3000;

// JSON形式のリクエストを解釈し、静的ファイルを提供するための設定
app.use(express.json());
app.use(express.static('.'));

// Gemini APIのセットアップを削除

// '/api/generate-recipe'というURLでフロントエンドからのリクエストを待つ
app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients, cookingStyle, time, method, seasoning } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: '材料が指定されていません' });
        }

        // ▼▼▼ Gemini APIの呼び出しを、固定のレシピ生成ロジックに変更 ▼▼▼
        const recipe = {
            recipeName: `「${ingredients.join('と')}」の${cookingStyle}風 ${seasoning}仕立て`,
            description: `約${time}で完成！${method}の食感が楽しい、珠玉の一品。`,
            steps: [
                `材料（${ingredients.join('、')}など）をすべて${method}にする。`,
                `フライパンや鍋を使い、調理法「${cookingStyle}」で${time}じっくり火を通す。`,
                `最後に${seasoning}を加えて味を整え、お皿に盛り付けたら完成！`
            ]
        };

        // 生成したJSONをフロントエンドに返す
        res.json(recipe);

    } catch (error) {
        console.error("エラー:", error);
        res.status(500).json({ error: 'レシピの生成に失敗しました。' });
    }
});

// サーバーを起動します
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});