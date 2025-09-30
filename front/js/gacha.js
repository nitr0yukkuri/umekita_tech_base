// HTMLのボタン要素を取得
const drawButton = document.getElementById('draw-button');

// ボタンがクリックされた時の処理
drawButton.addEventListener('click', () => {
    // ここにガチャを引いた時の具体的な処理を記述します
    // 例えば、結果をアラートで表示する
    const items = ['卵かけご飯', '親子丼', 'ラーメン', 'ハンバーグ', '味噌汁', '水'];
    const randomIndex = Math.floor(Math.random() * items.length);
    const result = items[randomIndex];

    // ★★★ 変更点：アラート表示からページ遷移に変更 ★★★
    // alert(`結果は「${result}」でした！`);
    window.location.href = 'amazing-cooking-screen.html';
});