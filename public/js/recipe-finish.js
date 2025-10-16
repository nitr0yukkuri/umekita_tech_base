document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('recipe-title');
    const imageElement = document.getElementById('recipe-image');
    const detailsElement = document.getElementById('recipe-details');
    const shareButton = document.getElementById('share-button');
    const returnButton = document.getElementById('return-button');
    const saveButton = document.getElementById('save-button'); // Added this line

    async function generateAndDisplayRecipe() {
        const recipeData = JSON.parse(sessionStorage.getItem('finalRecipe'));
        const styleData = JSON.parse(sessionStorage.getItem('cookingStyle'));

        if (!recipeData || !styleData || recipeData.length === 0) {
            titleElement.textContent = "レシピ情報がありません";
            return;
        }

        // 1. レシピ名をローカルの関数で生成
        const ingredients = recipeData.map(r => r.ingredient.split('(')[0]);
        const cookingStyle = styleData.name;
        const recipeName = generateRecipeName(ingredients, cookingStyle);
        titleElement.textContent = recipeName;

        // 2. 画像生成APIを呼び出し
        try {
            // 画像生成中はローディング表示
            imageElement.src = ""; // 古い画像をクリア
            imageElement.alt = "画像を生成中...";

            const imagePrompt = generateImagePrompt(recipeName, ingredients, cookingStyle);
            
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt }),
            });

            if (!response.ok) {
                throw new Error(`APIサーバーがエラーを返しました: ${response.status}`);
            }

            const data = await response.json();

            // サーバーから返ってきた画像(データURI)をセット
            if (data.imageUrl) {
                imageElement.src = data.imageUrl;
                imageElement.alt = recipeName;
            }
        } catch (error) {
            console.error('画像生成に失敗しました:', error);
            imageElement.src = '/img/1402858_s.jpg'; // エラー時はサンプル画像
            imageElement.alt = '画像の読み込みに失敗しました';
        }

        // 3. レシピ詳細の表示
        let detailsHtml = '<h4>調理工程</h4><ul>';
        recipeData.forEach(step => {
            const seasoningText = step.seasoning ? `, 味付け: ${step.seasoning}` : '';
            detailsHtml += `<li>${step.ingredient} → 時間:${step.time}, 切り方:${step.cutting}${seasoningText}</li>`;
        });
        detailsHtml += '</ul>';
        detailsElement.innerHTML = detailsHtml;

         // ★★★ ここからが保存処理の追加箇所 ★★★
        saveButton.addEventListener('click', async () => {
            // 1. 保存用のデータを作成
            const description = `主な材料は${ingredients.join('、')}。調理法は「${cookingStyle}」。`;
            const steps = recipeData.map(step => {
                const seasoningText = step.seasoning ? `(味付け: ${step.seasoning})` : '';
                return `${step.ingredient}を「${step.time}」で「${step.cutting}」にする${seasoningText}`;
            });
            
            const recipeToSave = {
                recipeName: recipeName,
                description: description,
                steps: steps,
            };

            // 2. /api/save-recipe エンドポイントにデータを送信
            try {
                const saveResponse = await fetch('/api/save-recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeToSave),
                });
                
                const result = await saveResponse.json();
                if (result.success) {
                    alert('レシピがガチャに追加されました！');
                    saveButton.disabled = true; // 2重保存を防ぐためにボタンを無効化
                    saveButton.textContent = '追加済み';
                } else {
                    throw new Error(result.error || '保存に失敗しました。');
                }
            } catch (err) {
                console.error('保存エラー:', err);
                alert('エラーによりレシピを保存できませんでした。');
            }
        });
        // ★★★ 保存処理ここまで ★★★
        // 4. ボタンのイベントリスナー設定
        shareButton.addEventListener('click', () => {
            const shareText = `奇跡のレシピ「${recipeName}」が完成！\n主な材料: ${ingredients.join(', ')}\n#グルメイカー #AIレシピ`;
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(shareUrl, '_blank');
        });

        returnButton.addEventListener('click', () => {
            window.location.href = 'title.html';
        });
    }

    generateAndDisplayRecipe();
});

// --- ヘルパあああー関数 (ファイルの下部に配置) ---

function generateRecipeName(ingredients, cookingStyle) {
    const mainIngredient = ingredients[0] || '奇跡';
    const subIngredient = ingredients[1] || '謎';
    return `${mainIngredient}と${subIngredient}の${cookingStyle}`;
}

function generateImagePrompt(recipeName, ingredients, cookingStyle) {
    // 重要なキーワードを英語で伝え、強調するプロンプト
    // (word:1.2) のように書くと、その単語の重要度を1.2倍にできます
    return `
        (best quality, masterpiece, photorealistic:1.2),
        photo of a gourmet dish of "${ingredients.join(' and ')}".
        Cooked by "${cookingStyle}".
        On a clean white plate, warm lighting, looks very delicious, steam rising.
        Simple restaurant table background, (depth of field:1.1).
    `;
}