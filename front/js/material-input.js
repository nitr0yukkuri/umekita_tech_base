// script.js
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-ingredient');
    const ingredientList = document.getElementById('ingredient-list');
    const removeBtn = document.getElementById('remove-ingredient');

    const circledNumbers = [
        '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
        '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'
    ];

    function updateIngredientNumbers() {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        allRows.forEach((row, index) => {
            const inputField = row.querySelector('.ingredient-input');
            const currentNumber = index + 1;
            let numberSymbol = (currentNumber <= circledNumbers.length) ? circledNumbers[currentNumber - 1] : currentNumber;
            if (inputField) {
                inputField.placeholder = `材料${numberSymbol}>・・・`;
            }
        });
    }

    // 「+ 材料を追加」ボタンの機能
    addBtn.addEventListener('click', () => {
        const currentCount = ingredientList.querySelectorAll('.ingredient-row').length;

        if (currentCount >= 5) {
            // ★★★ 変更点：アラートを表示する行のコメントを解除 ★★★
            alert('これ以上材料を追加できません！');
            return;
        }

        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="">
            <button class="category-btn">分類選択</button>
        `;
        ingredientList.appendChild(newRow);
        updateIngredientNumbers();
    });

    // 「- 材料を削除」ボタンの機能
    removeBtn.addEventListener('click', () => {
        const allRows = ingredientList.querySelectorAll('.ingredient-row');
        if (allRows.length > 0) {
            allRows[allRows.length - 1].remove();
            updateIngredientNumbers();
        }
    });

    // ページ読み込み完了時に、最初の番号を整える
    updateIngredientNumbers();
});