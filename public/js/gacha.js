// front/js/gacha.js

const drawButton = document.getElementById('draw-button');
const gachaMachineImg = document.querySelector('.gacha-machine-img');

drawButton.addEventListener('click', async () => {
    // ガチャを引いている間のアニメーションを追加
    gachaMachineImg.classList.add('shake');
    drawButton.disabled = true;
    drawButton.textContent = '念を込めています...';

    try {
        // バックエンドのAPI (/api/gacha) を呼び出す
        const response = await fetch('/api/gacha');
        if (!response.ok) {
            throw new Error('ガチャの神様がへそを曲げました...');
        }
        const recipe = await response.json();

        // 成功したら、結果をURLパラメータとして結果画面に渡す
        if (recipe) {
            // 日本語のパラメータをエンコードしてURLを作成
            const params = new URLSearchParams({
                recipeName: recipe.recipeName,
                description: recipe.description,
                steps: recipe.steps,
                // 画像パスも渡す場合
                // image: recipe.image_path 
            });
            
            // 1.5秒待ってから結果画面へ遷移
            setTimeout(() => {
                window.location.href = `/amazing-cooking-screen.html?${params.toString()}`;
            }, 1500);

        } else {
            alert('残念！何も出ませんでした...');
            resetButton();
        }

    } catch (error) {
        console.error('エラー:', error);
        alert(error.message);
        resetButton();
    }
});

function resetButton() {
    gachaMachineImg.classList.remove('shake');
    drawButton.disabled = false;
    drawButton.textContent = 'ガチャを引く';
}