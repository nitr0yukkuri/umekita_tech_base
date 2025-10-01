// --- HTML要素の取得 ---
const styleRouletteScreen = document.getElementById('style-roulette-screen');
const styleStartButton = document.getElementById('style-start-button');
const styleReelStrip = document.getElementById('style-reel-strip');
const mainSlotScreen = document.getElementById('main-slot-screen');
const startButton = document.getElementById('start-button');
const stopButtons = document.querySelectorAll('#main-slot-screen .stop-button');
const reels = document.querySelectorAll('#main-slot-screen .reel');
const reelStrips = document.querySelectorAll('#main-slot-screen .reel-strip');
const gogoLamp = document.querySelector('.gogo-lamp');
const resultDisplay = document.getElementById('result-display');
const resultText = document.getElementById('result-text');
const selectedStyleDisplay = document.getElementById('selected-style-display');

// ★★★ 1. 効果音ファイルを読み込む ★★★
const soundSpin = new Audio('ziyagura-reba.mp3');
const soundStop = new Audio('弓矢が刺さる.mp3');
const soundWin = new Audio('ziyagura-gako.mp3');

// 回転音はループ再生するように設定
//soundSpin.loop = true;

// --- データ定義 ---
const cookingStyles = ['焼く', '煮る', '鍋'];
const cookingStyleIds = ['yaku', 'niru', 'nabe'];
const allReelData = {
    yaku: [ ['5分', '10分', '弱火でじっくり', '強火で一気に', '12分', '7分'], ['薄切り', '厚切り', 'そのまま', '串に刺す', '一口大に'], ['塩コショウ', '焼肉のタレ', '醤油', 'ガーリック', 'ハーブソルト', 'ポン酢'] ],
    niru: [ ['15分', '30分', '1時間', 'コトコト煮込む', '5分', '一晩寝かす'], ['乱切り', 'ぶつ切り', '輪切り', '大きめに', '隠し包丁'], ['醤油', 'みりん', '砂糖', '白だし', '味噌', 'コンソメ'] ],
    nabe: [ ['煮えたらOK', '5分', '10分', 'くたくたになるまで', 'サッと煮る'], ['ざく切り', '薄切り', 'そのまま', '食べやすく', '白菜と交互に'], ['ポン酢', 'ごまだれ', 'めんつゆ', 'キムチの素', '豆乳だし'] ]
};
let reelSymbols = [];

// --- 設定値 ---
const SYMBOL_HEIGHT = 60;
const STYLE_SYMBOL_HEIGHT = 100;
const REEL_REPEAT_COUNT = 10;

// --- ゲーム状態変数 ---
let isSpinning = false;
let reelIntervals = []; 
let stoppedReels = [false, false, false]; 
let isLampLitThisTurn = false; 

// ===============================================
// === 画面1: 調理法ルーレット関連の処理
// ===============================================

function setupStyleReel() {
    styleReelStrip.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        cookingStyles.forEach(style => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.textContent = style;
            styleReelStrip.appendChild(symbolDiv);
        });
    }
    const oneLoopHeight = cookingStyles.length * STYLE_SYMBOL_HEIGHT;
    styleReelStrip.style.transform = `translateY(-${oneLoopHeight * 10}px)`;
}

styleStartButton.addEventListener('click', () => {
    styleStartButton.disabled = true;
    styleReelStrip.style.transition = 'transform 3s ease-in-out';
    styleReelStrip.style.transform = `translateY(10000px)`; 

    setTimeout(() => {
        const resultIndex = Math.floor(Math.random() * cookingStyles.length);
        const selectedStyleId = cookingStyleIds[resultIndex];
        const selectedStyleName = cookingStyles[resultIndex];

        const targetLoop = 15;
        const symbolPosition = (targetLoop * cookingStyles.length + resultIndex) * STYLE_SYMBOL_HEIGHT;
        const centerOffset = (styleReelStrip.parentElement.offsetHeight - STYLE_SYMBOL_HEIGHT) / 2;
        const targetY = -(symbolPosition - centerOffset);
        
        styleReelStrip.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
        styleReelStrip.style.transform = `translateY(${targetY}px)`;

        setTimeout(() => {
            transitionToMainGame(selectedStyleId, selectedStyleName);
        }, 2500);
    }, 600);
});

function transitionToMainGame(styleId, styleName) {
    styleRouletteScreen.classList.add('hidden');
    mainSlotScreen.classList.remove('hidden');
    selectedStyleDisplay.textContent = `調理法: ${styleName}`;
    reelSymbols = allReelData[styleId];
    setupMainReels();
}

// ===============================================
// === 画面2: メインルーレット関連の処理
// ===============================================

function setupMainReels() {
    if (reelSymbols.length === 0) return;
    reelStrips.forEach((strip, index) => {
        const symbols = reelSymbols[index];
        strip.innerHTML = '';
        for (let i = 0; i < REEL_REPEAT_COUNT; i++) {
            symbols.forEach(symbolText => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'symbol';
                symbolDiv.textContent = symbolText;
                strip.appendChild(symbolDiv);
            });
        }
        const oneLoopHeight = symbols.length * SYMBOL_HEIGHT;
        const initialOffset = -(oneLoopHeight * (REEL_REPEAT_COUNT - 3));
        strip.style.transform = `translateY(${initialOffset}px)`;
    });
}

startButton.addEventListener('click', () => {
    if (isSpinning) return; 
    isSpinning = true;
    resultDisplay.classList.remove('show');
    reels[2].classList.remove('hidden');
    stopButtons[2].classList.remove('hidden');
    isLampLitThisTurn = Math.random() < 0.4;
    gogoLamp.classList.remove('lit');
    startButton.disabled = true;
    stopButtons.forEach(button => button.disabled = true);

  

    // ★★★ 3. ルーレット開始時に回転音を鳴らす ★★★
    soundSpin.currentTime = 0;
    soundSpin.play();

    startReelAnimation(0);
    startReelAnimation(1);
    stopButtons[0].disabled = false;
    stopButtons[1].disabled = false;
    if (isLampLitThisTurn) {
        startReelAnimation(2);
        stopButtons[2].disabled = false;
    } else {
        stoppedReels[2] = true; 
        reels[2].classList.add('hidden');
        stopButtons[2].classList.add('hidden');
    }
    // ...
    // まず回転音を鳴らす
    soundSpin.currentTime = 0;
    soundSpin.play();

    if (isLampLitThisTurn) {
        gogoLamp.classList.add('lit');
        // 0.3秒後 (300ミリ秒後) に確定音を鳴らす
        setTimeout(() => {
            soundWin.play();
        }, 500); 
    }
// ...
});

function startReelAnimation(index) {
    stoppedReels[index] = false;
    const strip = reelStrips[index];
    const oneLoopHeight = reelSymbols[index].length * SYMBOL_HEIGHT;
    const resetPointY = -(oneLoopHeight * (REEL_REPEAT_COUNT - 2));
    reelIntervals[index] = setInterval(() => {
        let currentY = parseFloat(strip.style.transform.replace('translateY(', ''));
        strip.style.transition = 'none';
        if (currentY > resetPointY) {
            currentY -= oneLoopHeight;
            strip.style.transform = `translateY(${currentY}px)`;
        }
        requestAnimationFrame(() => {
            strip.style.transition = 'transform 0.1s linear';
            currentY = parseFloat(strip.style.transform.replace('translateY(', ''));
            const newY = currentY + 150;
            strip.style.transform = `translateY(${newY}px)`;
        });
    }, 100);
}

stopButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reelIndex = parseInt(button.dataset.reel);
        if (stoppedReels[reelIndex]) return;

        // ★★★ 4. ストップボタンを押した時に停止音を鳴らす ★★★
        soundStop.currentTime = 0;
        soundStop.play();

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
            // ★★★ 5. 全てのリールが止まったら回転音を止める ★★★
            soundSpin.pause();

            setTimeout(endGame, 2100);
        }
    });
});

function endGame() {
    isSpinning = false;
    startButton.disabled = false;
    const finalResult0 = reels[0].dataset.finalSymbol;
    const finalResult1 = reels[1].dataset.finalSymbol;
    let resultMessage = "";
    if (isLampLitThisTurn) {
        const finalResult2 = reels[2].dataset.finalSymbol;
        resultMessage = `「${finalResult0}」で「${finalResult1}」、味付けは「${finalResult2}」で決まり！`;
    } else {
        resultMessage = `「${finalResult0}」で「${finalResult1}」！`;
    }
    resultText.textContent = resultMessage;
    resultDisplay.classList.add('show');
}

// --- 初期化 ---
setupStyleReel();