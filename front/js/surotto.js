// HTMLの要素を取得
const startButton = document.getElementById('start-button');
const stopButtons = document.querySelectorAll('.stop-button');
const reels = document.querySelectorAll('.reel');
const gogoLamp = document.querySelector('.gogo-lamp');

// ★★★変更点1: リールごとの絵柄リストを定義★★★
const reelSymbols = [
    // リール1 (左) - 7は1つだけ
    ['10分', '3分', '5分', '15分', '30秒', '50分', '5分', '3分', '5分', '1分', '×'],
    // リール2 (中) - 7は1つだけ
    ['輪切り', '半月切り', '斜め切り', '短冊切り', '賽の目切り', 'みじん切り'],
    // リール3 (右) - 7は1つだけ
    ['塩5振り', '胡椒3振り', '酢1週', '醤油4週', '塩5振り', '胡椒3振り', '砂糖1杯', 'はちみつ1週', '塩5振り', '砂糖1杯', '白だし']
];

// ゲームの状態を管理する変数
let isSpinning = false;
let reelIntervals = []; 
let stoppedReels = [false, false, false]; 
let isLampLitThisTurn = false; 

// --- スタートボタンの処理 ---
startButton.addEventListener('click', () => {
    if (isSpinning) return; 
    isSpinning = true;

    reels[2].classList.remove('hidden');
    stopButtons[2].classList.remove('hidden');

    isLampLitThisTurn = Math.random() < 0.4;

    gogoLamp.classList.remove('lit');
    startButton.disabled = true;
    stopButtons.forEach(button => button.disabled = true);

    if (isLampLitThisTurn) {
        gogoLamp.classList.add('lit');
    }

    startReel(0);
    startReel(1);
    stopButtons[0].disabled = false;
    stopButtons[1].disabled = false;

    if (isLampLitThisTurn) {
        startReel(2);
        stopButtons[2].disabled = false;
    } else {
        reels[2].classList.add('hidden');
        stopButtons[2].classList.add('hidden');
        stoppedReels[2] = true; 
    }
});

// リールを回転させるための補助関数
function startReel(index) {
    stoppedReels[index] = false; 
    reelIntervals[index] = setInterval(() => {
        // ★★★変更点2: そのリール専用の絵柄リストを使う★★★
        const currentSymbols = reelSymbols[index];
        const randomIndex = Math.floor(Math.random() * currentSymbols.length);
        reels[index].textContent = currentSymbols[randomIndex];
    }, 100);
}

// --- ストップボタンの処理 ---
stopButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reelIndex = parseInt(button.dataset.reel);

        if (stoppedReels[reelIndex]) return;

        // 回転アニメーションを停止
        clearInterval(reelIntervals[reelIndex]);

        // ★★★変更点3: 最終的な停止絵柄を抽選して設定★★★
        const finalSymbols = reelSymbols[reelIndex];
        const finalIndex = Math.floor(Math.random() * finalSymbols.length);
        reels[reelIndex].textContent = finalSymbols[finalIndex];

        stoppedReels[reelIndex] = true;
        button.disabled = true;
        
        const allStopped = isLampLitThisTurn
            ? (stoppedReels[0] && stoppedReels[1] && stoppedReels[2])
            : (stoppedReels[0] && stoppedReels[1]);
        
        if (allStopped) {
            endGame();
        }
    });
});

// --- ゲーム終了時の処理 ---
function endGame() {
    isSpinning = false;
    startButton.disabled = false;

    if (isLampLitThisTurn) {
        const r0 = reels[0].textContent;
        const r1 = reels[1].textContent;
        const r2 = reels[2].textContent;

        if (r0 === '7️⃣' && r1 === '7️⃣' && r2 === '7️⃣') {
            console.log("BIG BONUS! 777揃い！");
        }
    }
}