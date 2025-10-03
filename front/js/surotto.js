window.addEventListener('DOMContentLoaded', () => {
    // --- ★効果音の準備ここから★ ---
    // ファイルパスは自分の環境に合わせて変更してください
    const clickSound = new Audio('../sound/bow-arrow-hit.mp3');
    const spinStartSound = new Audio('../sound/ziyagura-reba.mp3');
    const stopSound = new Audio('../sound/bow-arrow-hit.mp3');
    const gogoSound = new Audio('../sound/ziyagura-gako.mp3');


    function playSound(audio) {
        // play()はPromiseを返すため、エラーハンドリングを追加するとより安全です
        audio.currentTime = 0;
        audio.play().catch(error => console.log(`Error playing sound: ${error}`));
    }
    // --- ★効果音の準備ここまで★ ---

    // --- 画面要素 ---
    const startScreen = document.getElementById('start-screen');
    const styleRouletteScreen = document.getElementById('style-roulette-screen');
    const mainSlotScreen = document.getElementById('main-slot-screen');
    const summaryScreen = document.getElementById('summary-screen');
    const screens = document.querySelectorAll('.screen');
    const cookingStartButton = document.getElementById('cooking-start-button');
    const styleStartButton = document.getElementById('style-start-button');
    const startButton = document.getElementById('start-button');
    const stopButtons = document.querySelectorAll('#main-slot-screen .stop-button');
    const nextButton = document.getElementById('next-button');
    const saveAndFinishButton = document.getElementById('restart-button');
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
    const thirdReel = document.getElementById('reel2');
    const thirdStopButton = document.querySelector('.stop-button[data-reel="2"]');

    // --- データと設定 ---
    let ingredients = [];
    const cookingStyles = ['焼く', '煮る', '鍋'];
    const cookingStyleIds = ['yaku', 'niru', 'nabe'];
    const allReelData = {
        yaku: [['5分', '10分', '弱火でじっくり', '強火で一気に'], ['薄切り', '厚切り', 'そのまま', '串に刺す'], ['塩コショウ', '焼肉のタレ', '醤油', 'ガーリック']],
        niru: [['15分', '30分', '1時間', 'コトコト煮込む'], ['乱切り', 'ぶつ切り', '輪切り', '大きめに'], ['醤油', 'みりん', '砂糖', '白だし']],
        nabe: [['煮えたらOK', '5分', '10分', 'くたくたになるまで'], ['ざく切り', '薄切り', 'そのまま', '食べやすく'], ['ポン酢', 'ごまだれ', 'めんつゆ', 'キムチの素']]
    };
    const SYMBOL_HEIGHT = 60;
    const STYLE_SYMBOL_HEIGHT = 100;
    const REEL_REPEAT_COUNT = 10;
    let currentIngredientIndex = 0;
    let allResults = [];
    let chosenCookingStyle = {};
    let isSpinning = false;
    let stoppedReels = [false, false, false];
    let isLampLitThisTurn = false;
    let animationFrameIds = [null, null, null];
    let reelPositions = [0, 0, 0];

    function initializeApp() {
        const params = new URLSearchParams(window.location.search);
        const ingredientsParam = params.get('ingredients');
        if (ingredientsParam) {
            try {
                const parsedIngredients = JSON.parse(ingredientsParam);
                ingredients = parsedIngredients.map(item => `${item.name}(${item.quantity}g)`);
            } catch (e) { ingredients = ['材料の解析に失敗']; }
        } else {
            ingredients = ['玉ねぎ(100g)', '豚肉(200g)', 'ほうれん草(50g)'];
        }
        ingredientList.innerHTML = '';
        ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientList.appendChild(li);
        });
        currentIngredientIndex = 0;
        allResults = [];
        setupStyleReel();
        showScreen('start-screen');
    }

    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.toggle('hidden', screen.id !== screenId));
    }

    function setupStyleReel() {
        styleReelStrip.innerHTML = '';
        const repeatedStyles = Array(20).fill(cookingStyles).flat();
        repeatedStyles.forEach(style => {
            const el = document.createElement('div');
            el.className = 'symbol';
            el.textContent = style;
            styleReelStrip.appendChild(el);
        });
        styleReelStrip.style.transition = 'none';
        styleReelStrip.style.transform = 'translateY(0px)';
    }

    function startStyleRoulette() {
        styleStartButton.disabled = true;
        const targetIndex = Math.floor(Math.random() * cookingStyles.length) + (cookingStyles.length * 18);
        const targetY = -targetIndex * STYLE_SYMBOL_HEIGHT;
        styleReelStrip.style.transition = 'transform 3s cubic-bezier(0.25, 1, 0.5, 1)';
        styleReelStrip.style.transform = `translateY(${targetY}px)`;
        setTimeout(() => {
            const finalIndex = targetIndex % cookingStyles.length;
            transitionToMainGame(cookingStyleIds[finalIndex], cookingStyles[finalIndex]);
        }, 3200);
    }

    function transitionToMainGame(styleId, styleName) {
        chosenCookingStyle = { id: styleId, name: styleName };
        currentIngredientIndex = 0;
        runMainRouletteForCurrentIngredient();
    }

    // front/js/surotto.js の runMainRouletteForCurrentIngredient 関数をこちらに置き換え

function runMainRouletteForCurrentIngredient() {
    // 全てのリールアニメーションをここで完全に停止・リセットする
    animationFrameIds.forEach(id => {
        if (id) {
            cancelAnimationFrame(id);
        }
    });
    animationFrameIds = [null, null, null]; // 管理用のID配列を初期化

    // ★★★ 変更点: ここから ★★★
    // 全ての材料の調理が終わったかチェック
    if (currentIngredientIndex >= ingredients.length) {
        
        // 最後の調理結果を取得
        const lastResult = allResults.length > 0 ? allResults[allResults.length - 1] : null;

        if (lastResult) {
            // URLパラメータを準備
            const params = new URLSearchParams();
            params.append('time', lastResult.time);
            params.append('method', lastResult.cutting);
            params.append('seasoning', lastResult.seasoning || 'なし'); // GOGO無しの場合も考慮

            // パラメータを付けて recipe-finish.html にページを遷移
            window.location.href = `recipe-finish.html?${params.toString()}`;

        } else {
            // もし結果がなければ、パラメータなしで遷移
            window.location.href = 'recipe-finish.html';
        }
        return; // この後の処理を中断
    }
    // ★★★ 変更点: ここまで ★★★
    
    gogoLamp.classList.remove('lit');
    
    thirdReel.classList.remove('hidden-reel');
    thirdStopButton.classList.remove('hidden-reel');

    const currentIngredient = ingredients[currentIngredientIndex];
    currentIngredientNameDisplays.forEach(el => el.textContent = currentIngredient);
    currentStyleNameDisplay.textContent = chosenCookingStyle.name;
    
    setupMainReels();
    resultDisplay.classList.remove('show');
    nextButton.disabled = true;
    startButton.disabled = false;
    stopButtons.forEach(b => b.disabled = true);
    showScreen('main-slot-screen');
}
    function setupMainReels() {
        reelStrips.forEach((strip, index) => {
            const symbols = allReelData[chosenCookingStyle.id][index];
            strip.innerHTML = '';
            const repeatedSymbols = Array(REEL_REPEAT_COUNT).fill(symbols).flat();
            repeatedSymbols.forEach(symbolText => {
                const el = document.createElement('div');
                el.textContent = symbolText;
                strip.appendChild(el);
            });
            const oneLoopHeight = symbols.length * SYMBOL_HEIGHT;
            const initialOffset = -(oneLoopHeight * (REEL_REPEAT_COUNT - 3));
            strip.style.transition = 'none';
            strip.style.transform = `translateY(${initialOffset}px)`;
            reelPositions[index] = initialOffset;
        });
    }

   // front/js/surotto.js の startReel 関数をこちらに置き換え

function startReel(index) {
    // 既に動いているアニメーションがあればキャンセル
    if (animationFrameIds[index]) {
        cancelAnimationFrame(animationFrameIds[index]);
    }

    const strip = reelStrips[index];
    strip.style.transition = 'none'; // CSSアニメーションを無効化

    let lastTime = 0;
    // 速度の調整（値を大きくすると速くなります）
    const speed = 0.8; // 1ミリ秒あたりに動くピクセル量

    // requestAnimationFrameを使ったアニメーションループ
    function spinLoop(timestamp) {
        if (!lastTime) {
            lastTime = timestamp;
        }
        // 前のフレームから経過した時間
        const delta = timestamp - lastTime;

        // ★変更点1★ 減算(-)を【加算(+)】に変更して、下方向に回転させる
        reelPositions[index] += speed * delta;

        // 座標がプラスに近づきすぎないようにするためのリセット処理
        const symbols = allReelData[chosenCookingStyle.id][index];
        const oneLoopHeight = symbols.length * SYMBOL_HEIGHT;
        
        // ★変更点2★ リセットの条件と処理を逆方向にする
        const resetPoint = -oneLoopHeight; // 基準点 (例: -1周分の高さ)
        if (reelPositions[index] > resetPoint) {
            reelPositions[index] -= oneLoopHeight; // 基準点を超えたら、1周分巻き戻す
        }
        
        // 実際にリールの位置を画面に反映
        strip.style.transform = `translateY(${reelPositions[index]}px)`;
        
        lastTime = timestamp;
        // 次のフレームで再度この関数を呼び出すようブラウザに予約
        animationFrameIds[index] = requestAnimationFrame(spinLoop);
    }

    // 最初のフレームを要求
    animationFrameIds[index] = requestAnimationFrame(spinLoop);
}
 function onMainGameEnd() {
    isSpinning = false;
    const result = {
        ingredient: ingredients[currentIngredientIndex],
        styleName: chosenCookingStyle.name,
        time: reels[0].dataset.finalSymbol,
        cutting: reels[1].dataset.finalSymbol,
        seasoning: isLampLitThisTurn ? reels[2].dataset.finalSymbol : null
    };
    allResults.push(result);
    const resultMessage = result.seasoning ? `「${result.time}」「${result.cutting}」「${result.seasoning}」で決まり！` : `「${result.time}」「${result.cutting}」！`;
    
    // テキストをセットし、アニメーションを開始
    resultText.textContent = resultMessage;
    resultDisplay.classList.add('show');

    // ★★★ 変更点: resultSoundの再生に関する記述を完全に削除 ★★★

    currentIngredientIndex++;
    nextButton.disabled = false;
}

    function showSummary() {
        summaryList.innerHTML = '';
        allResults.forEach(res => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-item';
            const seasoningText = res.seasoning ? `, 味付け: ${res.seasoning}` : '';
            itemDiv.innerHTML = `<div class="summary-item-title">${res.ingredient}</div><p>調理法: ${res.styleName} | 時間: ${res.time}, 切り方: ${res.cutting}${seasoningText}</p>`;
            summaryList.appendChild(itemDiv);
        });
        showScreen('summary-screen');
    }


    cookingStartButton.addEventListener('click', () => { playSound(clickSound); showScreen('style-roulette-screen'); });
    styleStartButton.addEventListener('click', () => { playSound(clickSound); startStyleRoulette(); });
    nextButton.addEventListener('click', () => { playSound(clickSound); runMainRouletteForCurrentIngredient(); });
startButton.addEventListener('click', () => {
    if (isSpinning) return;

    // ★★★ 変更点1: GOGOランプの状態に関わらず、まず開始音を鳴らす ★★★
    playSound(spinStartSound); 

    // isSpinningなどの状態を更新
    isSpinning = true;
    stoppedReels = [false, false, false];
    resultDisplay.classList.remove('show');
    isLampLitThisTurn = Math.random() < 0.5;
    gogoLamp.classList.toggle('lit', isLampLitThisTurn);
    startButton.disabled = true;

    if (isLampLitThisTurn) {
        // GOGOランプが点灯した場合
        // ★★★ 変更点2: 0.6秒遅らせてGOGO!の音を鳴らす ★★★
        setTimeout(() => {
            playSound(gogoSound);
        }, 600); // 600ミリ秒 = 0.6秒

        stopButtons.forEach(b => b.disabled = false);
        thirdReel.classList.remove('hidden-reel');
        thirdStopButton.classList.remove('hidden-reel');
    } else {
        // 通常の場合 (音の再生は不要)
        stopButtons.forEach((b, i) => { b.disabled = (i === 2); });
        thirdReel.classList.add('hidden-reel');
        thirdStopButton.classList.add('hidden-reel');
    }
    
    // 全リールの回転を開始
    reels.forEach((_, i) => { startReel(i); });
});
    stopButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (!isSpinning || stoppedReels[index]) return;
            playSound(stopSound);
            cancelAnimationFrame(animationFrameIds[index]);
            stoppedReels[index] = true;
            button.disabled = true;
            const strip = reelStrips[index];
            strip.style.transform = `translateY(${reelPositions[index]}px)`;
            const symbols = allReelData[chosenCookingStyle.id][index];
            const finalSymbolIndex = Math.floor(Math.random() * symbols.length);
            reels[index].dataset.finalSymbol = symbols[finalSymbolIndex];
            const targetLoop = REEL_REPEAT_COUNT - 2;
            const symbolPosition = (targetLoop * symbols.length + finalSymbolIndex) * SYMBOL_HEIGHT;
            const centerOffset = (reels[index].offsetHeight - SYMBOL_HEIGHT) / 2;
            const targetY = -(symbolPosition - centerOffset);
            strip.style.transition = 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
            strip.style.transform = `translateY(${targetY}px)`;
            const allStopped = isLampLitThisTurn ? stoppedReels.every(s => s) : (stoppedReels[0] && stoppedReels[1]);
            if (allStopped) setTimeout(onMainGameEnd, 1600);
        });
    });

    saveAndFinishButton.addEventListener('click', async () => {
        playSound(clickSound);
        alert('レシピが保存されました！(シミュレーション)');
        window.location.href = 'index.html';
    });

    initializeApp();
});