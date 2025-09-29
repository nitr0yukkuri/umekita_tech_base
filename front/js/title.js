// HTMLの要素を取得
const createRecipeButton = document.getElementById('btn-1');
const gachaButton = document.getElementById('btn-2');

// 「レシピを作る」ボタンがクリックされた時の処理
createRecipeButton.addEventListener('click', () => {
    window.location.href = 'material-input.html';
    // ここにレシピ作成の処理を記述します
});

// 「闇ガチャを回す」ボタンがクリックされた時の処理
gachaButton.addEventListener('click', () => {
    alert('「闇ガチャを回す」が選択されました！');
    // ここにガチャの処理を記述します
});