// front/js/material-input.js

document.addEventListener('DOMContentLoaded', () => {
    // 選択可能な材料リスト
    const AVAILABLE_INGREDIENTS = [
        'たまねぎ', 'にんじん', 'じゃがいも', '豚肉', '鶏肉', '牛肉',
        'きのこ', '卵', 'チーズ', 'ツナ缶', '鯖缶', '冷凍たこ焼き', 'かぼちゃ',
        'マシュマロ', 'クロワッサン', 'うなぎ', '焼き芋', 'ポテチ'
    ];

    const addBtn = document.getElementById('add-ingredient');
    const ingredientList = document.getElementById('ingredient-list');
    const removeBtn = document.getElementById('remove-ingredient');
    const submitBtn = document.querySelector('.submit-btn');

    // すべてのドロップダウンをチェックし、選択済みの材料を他のリストで無効化する関数
    function updateAllDropdowns() {
        const allSelects = ingredientList.querySelectorAll('.ingredient-select');
        const selectedValues = [];

        // 現在選択されている値のリストを作成
        allSelects.forEach(select => {
            if (select.value) {
                selectedValues.push(select.value);
            }
        });

        // 各ドロップダウンの選択肢を更新
        allSelects.forEach(select => {
            const currentSelectedValue = select.value;
            select.querySelectorAll('option').forEach(option => {
                const isSelectedElsewhere = selectedValues.includes(option.value);
                // 他で選択されていて、かつ自分自身の選択値ではない場合に無効化
                if (isSelectedElsewhere && option.value !== currentSelectedValue) {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            });
        });
    }

    // 材料選択の行（ドロップダウン + 数量入力）を作成する関数
    function createIngredientRow() {
        const row = document.createElement('div');
        row.className = 'ingredient-row'; // CSSでスタイリングするためのクラス

        // 材料選択ドロップダウン
        const select = document.createElement('select');
        select.className = 'ingredient-select';
        select.addEventListener('change', updateAllDropdowns);

        const defaultOption = document.createElement('option');
        defaultOption.textContent = '材料を選択...';
        defaultOption.value = '';
        select.appendChild(defaultOption);

        AVAILABLE_INGREDIENTS.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient;
            option.textContent = ingredient;
            select.appendChild(option);
        });

        // 数量入力フィールド
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input';
        quantityInput.placeholder = '量(g)';
        quantityInput.min = '1';

        row.appendChild(select);
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
        updateAllDropdowns();
    });

    // 「- 材料を削除」ボタンの処理
    removeBtn.addEventListener('click', () => {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        // 最初の1行は削除させない
        if (allRows.length > 1) {
            allRows[allRows.length - 1].remove();
            updateAllDropdowns();
        }
    });

    // 「OK！」ボタンの処理
    submitBtn.addEventListener('click', () => {
        const allRows = document.querySelectorAll('.ingredient-row');
        const ingredientsData = [];
        let allValid = true;

        allRows.forEach(row => {
            const select = row.querySelector('.ingredient-select');
            const quantityInput = row.querySelector('.quantity-input');

            // 材料が選択され、かつ数量が入力されているかチェック
            if (!select.value || !quantityInput.value) {
                allValid = false;
            } else {
                ingredientsData.push({
                    name: select.value,
                    quantity: quantityInput.value
                });
            }
        });

        if (!allValid || ingredientsData.length === 0) {
            alert('すべての材料と量を入力してください。');
            return;
        }

        // URLパラメータを作成して次の画面へ
        const params = new URLSearchParams({
            ingredients: JSON.stringify(ingredientsData) // JSON文字列としてデータを渡す
        });
        window.location.href = `surotto.html?${params.toString()}`;
    });

    // 初期状態で1つの材料行を生成
    ingredientList.appendChild(createIngredientRow());
});