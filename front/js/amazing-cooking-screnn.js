// front/js/gacha-result.js
document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');

    shareButton.addEventListener('click', () => {
        // シェアするテキストを定義
        const shareText = "グルメイカーの闇ガチャで「すごい卵焼き！」をゲットしたよ！ #グルメイカー";

        // X(Twitter)の投稿用URLを作成
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

        // 新しいタブで投稿画面を開く
        window.open(shareUrl, '_blank');
    });
});