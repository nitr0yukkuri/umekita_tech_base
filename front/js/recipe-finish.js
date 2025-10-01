// front/js/recipe-finish.js

document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');
    // ▼▼▼ この行を追加 ▼▼▼
    const returnButton = document.getElementById('return-button');

    // URLからパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time') || '不明な時間';
    const method = urlParams.get('method') || '不明な切り方';
    const seasoning = urlParams.get('seasoning') || '不明な調味料';

    // X共有ボタンの処理
    shareButton.addEventListener('click', () => {
        const shareText = `新しいレシピが完成！\n調理時間: ${time}\n切り方: ${method}\n調味料: ${seasoning}\n#グルメイカー #自炊`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
    });

    // ▼▼▼ この処理を追加 ▼▼▼
    // スタートへ戻るボタンの処理
    returnButton.addEventListener('click', () => {
        window.location.href = 'title.html'; // title.htmlへ画面遷移
    });
});