// front/js/amazing-cooking-screen.js

// ページが読み込まれたときに実行
window.addEventListener('load', () => {
    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const recipeName = params.get('recipeName');
    const description = params.get('description');
    const steps = params.get('steps'); // ★ 追加

    // HTML要素に取得した情報を表示
    const recipeNameElement = document.getElementById('recipe-name');
    const recipeDescriptionElement = document.getElementById('recipe-description');
    const recipeStepsElement = document.getElementById('recipe-steps'); // ★ 追加

    if (recipeName) {
        recipeNameElement.textContent = recipeName;
    }
    if (description) {
        recipeDescriptionElement.textContent = description;
    }

    // ★★★ 以下をすべて追加 ★★★
    // steps (調理工程) が存在すればリストとして表示
    if (steps && recipeStepsElement) {
        let stepsHtml = '<h4>調理工程</h4><ul>';
        // データベースから取得したstepsは改行(\n)で区切られているため、splitで配列に変換
        steps.split('\n').forEach(step => {
            if (step) { // 空行は無視
                stepsHtml += `<li>${step}</li>`;
            }
        });
        stepsHtml += '</ul>';
        recipeStepsElement.innerHTML = stepsHtml;
    }
    // ★★★ 追加ここまで ★★★

// ★★★ 星評価のロジック（ここから追加） ★★★
    const starsGacha = document.querySelectorAll('#rating-stars-gacha .star');
    let currentRatingGacha = 0;

    function setRatingGacha(rating) {
        starsGacha.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    function setHoverGacha(rating) {
        starsGacha.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    }

    starsGacha.forEach(star => {
        star.addEventListener('mouseover', () => {
            setHoverGacha(parseInt(star.dataset.value));
        });
        star.addEventListener('click', () => {
            currentRatingGacha = parseInt(star.dataset.value);
            setRatingGacha(currentRatingGacha);
        });
    });

    document.getElementById('rating-stars-gacha').addEventListener('mouseout', () => {
        setHoverGacha(currentRatingGacha); // マウスが離れたら、選択中の評価に戻す
    });

    // 初期状態をセット (例: 1つ星)
    currentRatingGacha = 1;
    setRatingGacha(currentRatingGacha);
    setHoverGacha(currentRatingGacha);
    // ★★★ 星評価ロジックここまで ★★★);
    });
// タイトルへ戻るボタンの処理
document.getElementById('return-button').addEventListener('click', () => {
    window.location.href = '/index.html'; // パスを修正済み
});