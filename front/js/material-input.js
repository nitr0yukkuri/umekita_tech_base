document.addEventListener('DOMContentLoaded', () => {
    const AVAILABLE_INGREDIENTS = [
        'きのこ', '卵', 'チーズ','ツナ缶', '鯖缶', '冷凍たこ焼き', 'かぼちゃ',
        'マシュマロ','クロワッサン','うなぎ', '焼き芋', 'ポテチ'
    ];

    const addBtn = document.getElementById('add-ingredient');
    const ingredientList = document.getElementById('ingredient-list');
    const removeBtn = document.getElementById('remove-ingredient');
    const submitBtn = document.querySelector('.submit-btn');

    // ▼▼▼ 変更点：全てのドロップダウンの選択肢を更新する関数を追加 ▼▼▼
    function updateAllDropdowns() {
        const allSelects = ingredientList.querySelectorAll('.ingredient-select');
        const selectedValues = [];

        // 現在選択されている全ての値を取得
        allSelects.forEach(select => {
            if (select.value) {
                selectedValues.push(select.value);
            }
        });

        // 各ドロップダウンの選択肢を更新
        allSelects.forEach(select => {
            const currentSelectedValue = select.value;
            select.querySelectorAll('option').forEach(option => {
                // 選択肢の値が「現在選択されている値のリスト」に含まれているかチェック
                const isSelectedElsewhere = selectedValues.includes(option.value);

                // もし他の場所で選択されていて、かつ、このドロップダウン自身の選択値でなければ無効化
                if (isSelectedElsewhere && option.value !== currentSelectedValue) {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            });
        });
    }

    function createIngredientRow() {
        const row = document.createElement('div');
        row.className = 'ingredient-row';

        const select = document.createElement('select');
        select.className = 'ingredient-select';

        // ▼▼▼ 変更点：ドロップダウンが変更された時に更新関数を呼ぶイベントリスナーを追加 ▼▼▼
        select.addEventListener('change', updateAllDropdowns);

        const defaultOption = document.createElement('option');
        defaultOption.textContent = '材料を選択...';
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        AVAILABLE_INGREDIENTS.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient;
            option.textContent = ingredient;
            select.appendChild(option);
        });

        const quantityWrapper = document.createElement('div');
        quantityWrapper.className = 'quantity-wrapper';
        
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input';
        quantityInput.min = '0';
        
        quantityWrapper.appendChild(quantityInput);

        row.appendChild(select);
        row.appendChild(quantityWrapper);
        
        return row;
    }

    // 「+ 材料を追加」ボタンの機能
    addBtn.addEventListener('click', () => {
        const currentCount = ingredientList.querySelectorAll('.ingredient-row').length;
        if (currentCount >= 4) {
            alert('これ以上材料を追加できません！');
            return;
        }
        ingredientList.appendChild(createIngredientRow());
        // ▼▼▼ 変更点：行追加後にも更新関数を呼び、選択済みの項目を無効化 ▼▼▼
        updateAllDropdowns();
    });

    // 「- 材料を削除」ボタンの機能
    removeBtn.addEventListener('click', () => {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        if (allRows.length > 1) {
            allRows[allRows.length - 1].remove();
            // ▼▼▼ 変更点：行削除後に更新関数を呼び、選択肢を有効化 ▼▼▼
            updateAllDropdowns();
        }
    });

    // OKボタンの機能
    submitBtn.addEventListener('click', () => {
        const allSelects = document.querySelectorAll('.ingredient-select');
        const ingredients = [];

        allSelects.forEach(select => {
            if (select.value) {
                ingredients.push(select.value);
            }
        });

        if (ingredients.length === 0) {
            alert('材料を1つ以上選択してください。');
            return;
        }

        const params = new URLSearchParams({
            ingredients: JSON.stringify(ingredients)
        });
        window.location.href = `surotto.html?${params.toString()}`;
    });

    // 初期状態で3つの材料行を動的に生成
    for (let i = 0; i < 3; i++) {
        ingredientList.appendChild(createIngredientRow());
    }
});