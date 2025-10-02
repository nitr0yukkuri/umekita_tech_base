// ==========================================================
// === 1. 初期設定と要素取得
// ==========================================================
const INGREDIENTS = ['にんじん', 'じゃがいも', 'たまねぎ'];

// --- 画面要素 ---
const screens = document.querySelectorAll('.screen');
const startScreen = document.getElementById('start-screen');
const styleRouletteScreen = document.getElementById('style-roulette-screen');
const mainSlotScreen = document.getElementById('main-slot-screen');
const summaryScreen = document.getElementById('summary-screen');

// --- 操作要素 ---
const cookingStartButton = document.getElementById('cooking-start-button');
const restartButton = document.getElementById('restart-button');
const styleStartButton = document.getElementById('style-start-button');
const startButton = document.getElementById('start-button');
const stopButtons = document.querySelectorAll('#main-slot-screen .stop-button');

// --- 表示要素 ---
const ingredientList = document.getElementById('ingredient-list');
const summaryList = document.getElementById('summary-list');
const currentIngredientNameDisplays = document.querySelectorAll('.current-ingredient-name');
const currentStyleNameDisplay = document.querySelector('.current-style-name');
const styleReelStrip = document.getElementById('style-reel-strip');
const reels = document.querySelectorAll('#main-slot-screen .reel');
const reelStrips = document.querySelectorAll('#main-slot-screen .reel-strip');
const gogoLamp = document.querySelector('.gogo-lamp');
const resultDisplay = document.getElementById('result-display');
const resultText = document.getElementById('result-text');
const selectedStyleDisplay = document.getElementById('selected-style-display');

// --- 効果音 ---
const soundSpin = new Audio('../sound/ziyagura-reba.mp3');
const soundStop = new Audio('../sound/bow-arrow-hit.mp3');
const soundWin = new Audio('../sound/ziyagura-gako.mp3');

// --- データ定義 ---
const cookingStyles = ['焼く', '煮る', '鍋'];
const cookingStyleIds = ['yaku', 'niru', 'nabe'];
const allReelData = {
    yaku: [ ['5分', '10分', '弱火でじっくり', '強火で一気に', '12分', '7分'], ['薄切り', '厚切り', 'そのまま', '串に刺す', '一口大に'], ['塩コショウ', '焼肉のタレ', '醤油', 'ガーリック', 'ハーブソルト', 'ポン酢'] ],
    niru: [ ['15分', '30分', '1時間', 'コトコト煮込む', '5分', '一晩寝かす'], ['乱切り', 'ぶつ切り', '輪切り', '大きめに', '隠し包丁'], ['醤油', 'みりん', '砂糖', '白だし', '味噌', 'コンソメ'] ],
    nabe: [ ['煮えたらOK', '5分', '10分', 'くたくたになるまで', 'サッと煮る'], ['ざく切り', '薄切り', 'そのまま', '食べやすく', 'サイコロ'], ['ポン酢', 'ごまだれ', 'めんつゆ', 'キムチの素', '豆乳だし'] ]
};
let reelSymbols = [];

// --- 設定値 ---
const SYMBOL_HEIGHT = 60;
const STYLE_SYMBOL_HEIGHT = 100;
const REEL_REPEAT_COUNT = 10;

// --- ゲーム進行管理 ---
let currentIngredientIndex = 0;
let allResults = [];
let chosenCookingStyle = {};
let isSpinning = false;
let reelIntervals = [];
let stoppedReels = [false, false, false];
let isLampLitThisTurn = false;

// ==========================================================
// === 2. ゲーム全体の流れを制御する関数
// ==========================================================

function initializeApp() {
    ingredientList.innerHTML = '';
    INGREDIENTS.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = ing;
        ingredientList.appendChild(li);
    });
    currentIngredientIndex = 0;
    allResults = [];
    showScreen('start-screen');
    setupStyleReel();
    styleStartButton.disabled = false;
}

function showScreen(screenId) {
    screens.forEach(screen => screen.classList.toggle('hidden', screen.id !== screenId));
}

function runMainRouletteForCurrentIngredient() {
    if (currentIngredientIndex >= INGREDIENTS.length) {
        showSummary();
        return;
    }
    const currentIngredient = INGREDIENTS[currentIngredientIndex];
    currentIngredientNameDisplays.forEach(el => el.textContent = currentIngredient);
    currentStyleNameDisplay.textContent = chosenCookingStyle.name;
    selectedStyleDisplay.innerHTML = `<span class="current-ingredient-name">${currentIngredient}</span> | 調理法: ${chosenCookingStyle.name}`;
    reelSymbols = allReelData[chosenCookingStyle.id];
    setupMainReels();
    resultDisplay.classList.remove('show');
    startButton.disabled = false;
    stopButtons.forEach(b => b.disabled = true);
    showScreen('main-slot-screen');
}

function showSummary() {
    summaryList.innerHTML = '';
    allResults.forEach(res => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        const seasoningText = res.seasoning ? `, 味付け: ${res.seasoning}` : '';
        itemDiv.innerHTML = `
            <div class="summary-item-title">${res.ingredient}</div>
            <p>時間: ${res.time}, 切り方: ${res.cutting}${seasoningText}</p>
        `;
        summaryList.appendChild(itemDiv);
    });
    showScreen('summary-screen');
}

// ==========================================================
// === 3. 各ルーレットと画面遷移のロジック
// ==========================================================

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ 前回抜け落ちていた、最も重要な関数です ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
function setupStyleReel() {
    styleReelStrip.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        cookingStyles.forEach(style => {
            const el = document.createElement('div');
            el.className = 'symbol';
            el.textContent = style;
            styleReelStrip.appendChild(el);
        });
    }
    const oneLoopHeight = cookingStyles.length * STYLE_SYMBOL_HEIGHT;
    const initialOffset = -(oneLoopHeight * 10);
    styleReelStrip.style.transform = `translateY(${initialOffset}px)`;
}

function transitionToMainGame(styleId, styleName) {
    chosenCookingStyle = { id: styleId, name: styleName };
    currentIngredientIndex = 0;
    runMainRouletteForCurrentIngredient();
}

function onMainGameEnd() {
    isSpinning = false;
    const result = {
        ingredient: INGREDIENTS[currentIngredientIndex],
        styleName: chosenCookingStyle.name,
        time: reels[0].dataset.finalSymbol,
        cutting: reels[1].dataset.finalSymbol,
        seasoning: isLampLitThisTurn ? reels[2].dataset.finalSymbol : null
    };
    allResults.push(result);
    currentIngredientIndex++;
    resultDisplay.classList.remove('show');
    setTimeout(runMainRouletteForCurrentIngredient, 1500);
}

// ==========================================================
// === 4. イベントリスナーと各ルーレットの関数
// ==========================================================

cookingStartButton.addEventListener('click', () => showScreen('style-roulette-screen'));

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// === ここを変更しました ===
restartButton.addEventListener('click', () => {
    window.location.href = 'recipe-finish.html';
});
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

styleStartButton.addEventListener('click', () => {
    styleStartButton.disabled = true;
    styleReelStrip.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.25, 1)';
    const currentY = parseFloat(styleReelStrip.style.transform.replace('translateY(', ''));
    styleReelStrip.style.transform = `translateY(${currentY + 10000}px)`;

    setTimeout(() => {
        const resultIndex = Math.floor(Math.random() * cookingStyles.length);
        const targetLoop = 15;
        const symbolPosition = (targetLoop * cookingStyles.length + resultIndex) * STYLE_SYMBOL_HEIGHT;
        const centerOffset = (styleReelStrip.parentElement.offsetHeight - STYLE_SYMBOL_HEIGHT) / 2;
        const targetY = -(symbolPosition - centerOffset);

        styleReelStrip.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
        styleReelStrip.style.transform = `translateY(${targetY}px)`;

        setTimeout(() => {
            transitionToMainGame(cookingStyleIds[resultIndex], cookingStyles[resultIndex]);
        }, 2500);
    }, 1500);
});

function setupMainReels() {
    reelStrips.forEach((strip, index) => {
        const symbols = reelSymbols[index]; strip.innerHTML = '';
        for (let i = 0; i < REEL_REPEAT_COUNT; i++) { symbols.forEach(symbolText => {
            const el = document.createElement('div'); el.className = 'symbol'; el.textContent = symbolText; strip.appendChild(el);
        }); }
        const oneLoopHeight = symbols.length * SYMBOL_HEIGHT;
        const initialOffset = -(oneLoopHeight * (REEL_REPEAT_COUNT - 3));
        strip.style.transform = `translateY(${initialOffset}px)`;
    });
}

startButton.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    stoppedReels = [false, false, false];
    resultDisplay.classList.remove('show');
    reels[2].classList.remove('hidden'); stopButtons[2].classList.remove('hidden');
    isLampLitThisTurn = Math.random() < 0.4;
    gogoLamp.classList.remove('lit');
    startButton.disabled = true;
    stopButtons.forEach(button => button.disabled = true);
    soundSpin.currentTime = 0; soundSpin.play();
    if (isLampLitThisTurn) {
        gogoLamp.classList.add('lit');
        setTimeout(() => { soundWin.play(); }, 300);
    }
    startReelAnimation(0); startReelAnimation(1);
    stopButtons[0].disabled = false; stopButtons[1].disabled = false;
    if (isLampLitThisTurn) {
        startReelAnimation(2); stopButtons[2].disabled = false;
    } else {
        stoppedReels[2] = true;
        reels[2].classList.add('hidden'); stopButtons[2].classList.add('hidden');
    }
});

function startReelAnimation(index) {
    stoppedReels[index] = false;
    const strip = reelStrips[index];
    const oneLoopHeight = reelSymbols[index].length * SYMBOL_HEIGHT;
    const resetPointY = -(oneLoopHeight * (REEL_REPEAT_COUNT - 2));
    reelIntervals[index] = setInterval(() => {
        let currentY = parseFloat(strip.style.transform.replace('translateY(', ''));
        strip.style.transition = 'none';
        if (currentY > resetPointY) { currentY -= oneLoopHeight; strip.style.transform = `translateY(${currentY}px)`; }
        requestAnimationFrame(() => {
            strip.style.transition = 'transform 0.1s linear';
            currentY = parseFloat(strip.style.transform.replace('translateY(', ''));
            strip.style.transform = `translateY(${currentY + 150}px)`;
        });
    }, 100);
}

stopButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reelIndex = parseInt(button.dataset.reel);
        if (stoppedReels[reelIndex]) return;
        soundStop.currentTime = 0; soundStop.play();
        clearInterval(reelIntervals[reelIndex]);
        stoppedReels[reelIndex] = true;
        button.disabled = true;
        const strip = reelStrips[reelIndex];
        const symbols = reelSymbols[reelIndex];
        const finalSymbolIndex = Math.floor(Math.random() * symbols.length);
        reels[reelIndex].dataset.finalSymbol = symbols[finalSymbolIndex];
        const targetLoop = Math.floor(REEL_REPEAT_COUNT / 2);
        const symbolPositionInStrip = (targetLoop * symbols.length + finalSymbolIndex) * SYMBOL_HEIGHT;
        const reelWindowHeight = reels[reelIndex].offsetHeight;
        const centerOffset = (reelWindowHeight - SYMBOL_HEIGHT) / 2;
        const targetY = -(symbolPositionInStrip - centerOffset);
        strip.style.transition = 'transform 2s cubic-bezier(0.25, 1, 0.5, 1)';
        strip.style.transform = `translateY(${targetY}px)`;
        const allStopped = isLampLitThisTurn
            ? (stoppedReels[0] && stoppedReels[1] && stoppedReels[2])
            : (stoppedReels[0] && stoppedReels[1]);
        if (allStopped) {
            soundSpin.pause();
            setTimeout(onMainGameEnd, 2100);
        }
    });
});

// ==========================================================
// === 5. アプリケーションの開始
// ==========================================================
initializeApp();