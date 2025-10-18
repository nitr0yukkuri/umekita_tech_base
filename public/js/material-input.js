// front/js/material-input.js (自由入力版)

document.addEventListener('DOMContentLoaded', () => {
    // 選択可能な材料リスト (AVAILABLE_INGREDIENTS) は不要なので削除

    const addBtn = document.getElementById('add-ingredient');
    const ingredientList = document.getElementById('ingredient-list');
    const removeBtn = document.getElementById('remove-ingredient');
    const submitBtn = document.querySelector('.submit-btn');

    // ドロップダウンを同期する 'updateAllDropdowns' 関数は不要なので削除

    // 材料選択の行（テキスト入力 + 数量入力）を作成する関数
    function createIngredientRow() {
        const row = document.createElement('div');
        row.className = 'ingredient-row'; // CSSでスタイリングするためのクラス

        // ★★★ 変更点: ドロップダウン(select)からテキスト入力(input)に変更 ★★★
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'ingredient-input'; // CSS用の新しいクラス名
        textInput.placeholder = '材料名を入力...';
        // ★★★ 変更ここまで ★★★

        // 数量入力フィールド
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input';
        quantityInput.placeholder = '量(g)';
        quantityInput.min = '1';
        
        // ★★★ 変更点: select の代わりに textInput を追加 ★★★
        row.appendChild(textInput);
        row.appendChild(quantityInput);
        
        return row;
    }

    // 「+ 材料を追加」ボタンの処理
    addBtn.addEventListener('click', () => {
        const currentCount = ingredientList.querySelectorAll('.ingredient-row').length;
        if (currentCount >= 4) {
            alert('材料は4つまでしか追加できません。');
            return;
        }
        ingredientList.appendChild(createIngredientRow());
        // updateAllDropdowns() の呼び出しは削除
    });

    // 「- 材料を削除」ボタンの処理
    removeBtn.addEventListener('click', () => {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        // 最初の1行は削除させない
        if (allRows.length > 1) {
            allRows[allRows.length - 1].remove();
            // updateAllDropdowns() の呼び出しは削除
        }
    });

    // 「OK！」ボタンの処理
    submitBtn.addEventListener('click', () => {
        const allRows = document.querySelectorAll('.ingredient-row');
        const ingredientsData = [];
        let allValid = true;

        allRows.forEach(row => {
            // ★★★ 変更点: '.ingredient-select' から '.ingredient-input' に変更 ★★★
            const textInput = row.querySelector('.ingredient-input');
            const quantityInput = row.querySelector('.quantity-input');

            // 材料が入力され、かつ数量が入力されているかチェック
            if (!textInput.value || !quantityInput.value) {
                allValid = false;
            } else {
                ingredientsData.push({
                    name: textInput.value, // テキスト入力の値を取得
                    quantity: quantityInput.value
                });
            }
        });

        if (!allValid || ingredientsData.length === 0) {
            alert('すべての材料と量を入力してください。');
            return;
        }

        // URLパラメータを作成して次の画面へ（この部分は変更なし）
        const params = new URLSearchParams({
            ingredients: JSON.stringify(ingredientsData)
        });
        window.location.href = `/surotto.html?${params.toString()}`;
    });

    // 初期状態で1つの材料行を生成
    ingredientList.appendChild(createIngredientRow());
});