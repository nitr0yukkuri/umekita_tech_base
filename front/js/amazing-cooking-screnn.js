// front/js/amazing-cooking-screnn.js
document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');
    // ▼▼▼ この行を追加 ▼▼▼
    const returnButton = document.getElementById('return-button');

    shareButton.addEventListener('click', () => {
        // シェアするテキストを定義
        const shareText = "グルメイカーの闇ガチャで「すごい卵焼き！」をゲットしたよ！ #グルメイカー";

        // X(Twitter)の投稿用URLを作成
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

        // 新しいタブで投稿画面を開く
        window.open(shareUrl, '_blank');
    });

    // ▼▼▼ この処理を追記 ▼▼▼
    // 「タイトルへ戻る」ボタンがクリックされた時の処理
    returnButton.addEventListener('click', () => {
        window.location.href = 'title.html'; // title.htmlへ画面遷移
    });
});