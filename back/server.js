const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // .envファイルからAPIキーを読み込みます

const app = express();
const port = 3000;

// JSON形式のリクエストを解釈し、静的ファイルを提供するための設定
app.use(express.json());
app.use(express.static('.'));

// Gemini APIのセットアップ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// '/api/generate-recipe'というURLでフロントエンドからのリクエストを待つ
app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients, cookingStyle, time, method, seasoning } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: '材料が指定されていません' });
        }

        const prompt = `あなたは天才料理人です。以下の条件と材料だけで作れる、最高のレシピを考えてください。料理名は必ず独創的で面白い名前にしてください。

        # 条件
        - 調理法: ${cookingStyle}
        - 調理時間: ${time}
        - 材料の切り方: ${method}
        - 味付け: ${seasoning}

        # 材料
        - ${ingredients.join('\n- ')}

        # 回答の形式 (必ずこのJSON形式でお願いします)
        {
          "recipeName": "独創的な料理名",
          "description": "20文字程度のキャッチーな説明",
          "steps": ["手順1", "手順2", "手順3"]
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json(JSON.parse(responseText));

    } catch (error) {
        console.error("エラー:", error);
        res.status(500).json({ error: 'レシピの生成に失敗しました。' });
    }
});

// サーバーを起動します
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});