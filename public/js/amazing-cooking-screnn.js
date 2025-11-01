// front/js/amazing-cooking-screen.js

// ページが読み込まれたときに実行
window.addEventListener('load', () => {
    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
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

// ★★★ 星評価のロジック（ここから上書き） ★★★
    const starsGacha = document.querySelectorAll('#rating-stars-gacha .star');
    let currentRatingGacha = 0;
    let ratingSubmitted = false; // 評価済みフラグ

    // (setRatingGacha, setHoverGacha 関数は amazing-cooking-screnn.js に
    //  既に存在するので、そのまま利用します)

    // --- (もし setRatingGacha, setHoverGacha が無い場合は以下を貼り付け) ---
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
//ここまで

    starsGacha.forEach(star => {
        star.addEventListener('mouseover', () => {
            setHoverGacha(parseInt(star.dataset.value));
            if (!ratingSubmitted) { // 評価前のみホバーを許可
                setHoverGacha(parseInt(star.dataset.value));
            }
        });
        // ▼▼▼ click イベントをAPI呼び出し機能付きに修正 ▼▼▼
        star.addEventListener('click', async() => {
            if (ratingSubmitted) { // 既に評価済みなら何もしない
                alert('このレシピは既に評価済みです。');
                return;
            }

            if (!recipeId) {
                alert('エラー: レシピIDがありません。');
                return;
            }
            currentRatingGacha = parseInt(star.dataset.value);
            setRatingGacha(currentRatingGacha);

            // ★★★ ここからAPI呼び出しを追加 ★★★
            try {
                const response = await fetch(`/api/rate-recipe/${recipeId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newRating: currentRatingGacha })
                });
                
                const result = await response.json();
                if (!result.success) throw new Error(result.error);
                
                alert('評価を送信しました！ありがとうございます。');
                ratingSubmitted = true; // 評価済みにする
                
                // (任意) 星をロックする
                document.getElementById('rating-stars-gacha').style.pointerEvents = 'none';
                document.getElementById('rating-stars-gacha').style.opacity = 0.7;


            } catch (err) {
                console.error('評価エラー:', err);
                alert('評価の送信に失敗しました。');
            }
            // ★★★ API呼び出しここまで ★★★
        });
    });


    document.getElementById('rating-stars-gacha').addEventListener('mouseout', () => {
        if(!ratingSubmitted){ //評価前のみ
            setHoverGacha(currentRatingGacha); // マウスが離れたら、選択中の評価に戻す
        }
    });

    // 初期状態をセット (0星状態)
    currentRatingGacha = 0;
    setRatingGacha(currentRatingGacha);
    setHoverGacha(currentRatingGacha);
    // ★★★ 星評価ロジック（ここまで上書き） ★★★
    });
// タイトルへ戻るボタンの処理
document.getElementById('return-button').addEventListener('click', () => {
    window.location.href = '/index.html'; // パスを修正済み
});