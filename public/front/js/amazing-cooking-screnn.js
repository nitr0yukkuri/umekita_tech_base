// front/js/amazing-cooking-screnn.js

// ページが読み込まれたときに実行
window.addEventListener('load', () => {
    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const recipeName = params.get('recipeName');
    const description = params.get('description');

    // HTML要素に取得した情報を表示
    const recipeNameElement = document.getElementById('recipe-name');
    const recipeDescriptionElement = document.getElementById('recipe-description');

    if (recipeName) {
        recipeNameElement.textContent = recipeName;
    }
    if (description) {
        recipeDescriptionElement.textContent = description;
    }
});

// タイトルへ戻るボタンの処理
document.getElementById('return-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});