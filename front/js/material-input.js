document.addEventListener('DOMContentLoaded', () => {
    const AVAILABLE_INGREDIENTS = [
        'きのこ', '卵', 'チーズ','ツナ缶', '鯖缶', '冷凍たこ焼き', 'かぼちゃ',
        'マシュマロ','クロワッサン','うなぎ', '焼き芋', 'ポテチ'
    ];

    const addBtn = document.getElementById('add-ingredient');
    const ingredientList = document.getElementById('ingredient-list');
    const removeBtn = document.getElementById('remove-ingredient');
    const submitBtn = document.querySelector('.submit-btn');

    function updateAllDropdowns() {
        const allSelects = ingredientList.querySelectorAll('.ingredient-select');
        const selectedValues = [];

        allSelects.forEach(select => {
            if (select.value) {
                selectedValues.push(select.value);
            }
        });

        allSelects.forEach(select => {
            const currentSelectedValue = select.value;
            select.querySelectorAll('option').forEach(option => {
                const isSelectedElsewhere = selectedValues.includes(option.value);
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

    addBtn.addEventListener('click', () => {
        const currentCount = ingredientList.querySelectorAll('.ingredient-row').length;
        if (currentCount >= 4) {
            alert('これ以上材料を追加できません！');
            return;
        }
        ingredientList.appendChild(createIngredientRow());
        updateAllDropdowns();
    });

    removeBtn.addEventListener('click', () => {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        if (allRows.length > 1) {
            allRows[allRows.length - 1].remove();
            updateAllDropdowns();
        }
    });

    // OKボタンの機能
    submitBtn.addEventListener('click', () => {
        const allRows = document.querySelectorAll('.ingredient-row');
        const ingredientsData = [];
        let allValid = true;

        allRows.forEach(row => {
            const select = row.querySelector('.ingredient-select');
            const quantityInput = row.querySelector('.quantity-input');

            // 材料が選択されていて、かつグラム数が入力されているかチェック
            if (select.value && quantityInput.value) {
                ingredientsData.push({
                    name: select.value,
                    quantity: quantityInput.value
                });
            } else {
                // どちらかが未入力であればフラグをfalseに
                allValid = false;
            }
        });

        // ▼▼▼ 変更点：すべての行で材料とグラム数が入力されているかチェック ▼▼▼
        if (!allValid) {
            alert('すべての材料と量を入力してください。');
            return;
        }

        const params = new URLSearchParams({
            // 材料名と量のセットを渡すように変更
            ingredients: JSON.stringify(ingredientsData)
        });
        window.location.href = `surotto.html?${params.toString()}`;
    });

    // 初期状態で3つの材料行を動的に生成
    for (let i = 0; i < 3; i++) {
        ingredientList.appendChild(createIngredientRow());
    }
});