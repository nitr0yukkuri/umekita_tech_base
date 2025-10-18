// HTMLの要素を取得
const createRecipeButton = document.getElementById('btn-1');
const gachaButton = document.getElementById('btn-2');

// 「レシピを作る」ボタンがクリックされた時の処理
createRecipeButton.addEventListener('click', () => {
    // ★★★ 修正: 先頭に '/' を追加 ★★★
    window.location.href = '/material-input.html';
});

// 「闇ガチャを回す」ボタンがクリックされた時の処理
gachaButton.addEventListener('click', () => {
    // ★★★ 修正: 先頭に '/' を追加 ★★★
    window.location.href = '/gacha.html';
});