window.addEventListener('DOMContentLoaded', () => {
    // ★★★ パスを修正 ★★★
    const clickSound = new Audio('/sound/bow-arrow-hit.mp3');
    const spinStartSound = new Audio('/sound/ziyagura-reba.mp3');
    const stopSound = new Audio('/sound/bow-arrow-hit.mp3');
    const gogoSound = new Audio('/sound/ziyagura-gako.mp3');
    // ★★★★★★★★★★★★★

    function playSound(audio) {
        audio.currentTime = 0;
        audio.play().catch(error => console.log(`Error playing sound: ${error}`));
    }

    // --- (以下、既存のコードが続く) ---
    // (このファイル内の他の部分は変更不要です)
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

    function runMainRouletteForCurrentIngredient() {
        animationFrameIds.forEach(id => {
            if (id) {
                cancelAnimationFrame(id);
            }
        });
        animationFrameIds = [null, null, null];

        if (currentIngredientIndex >= ingredients.length) {
            const lastResult = allResults.length > 0 ? allResults[allResults.length - 1] : null;
            if (lastResult) {
                const params = new URLSearchParams();
                params.append('time', lastResult.time);
                params.append('method', lastResult.cutting);
                params.append('seasoning', lastResult.seasoning || 'なし');
                window.location.href = `recipe-finish.html?${params.toString()}`;
            } else {
                window.location.href = 'recipe-finish.html';
            }
            return;
        }
        
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

    function startReel(index) {
        if (animationFrameIds[index]) {
            cancelAnimationFrame(animationFrameIds[index]);
        }

        const strip = reelStrips[index];
        strip.style.transition = 'none';

        let lastTime = 0;
        const speed = 0.8;

        function spinLoop(timestamp) {
            if (!lastTime) {
                lastTime = timestamp;
            }
            const delta = timestamp - lastTime;
            reelPositions[index] += speed * delta;

            const symbols = allReelData[chosenCookingStyle.id][index];
            const oneLoopHeight = symbols.length * SYMBOL_HEIGHT;
            
            const resetPoint = -oneLoopHeight;
            if (reelPositions[index] > resetPoint) {
                reelPositions[index] -= oneLoopHeight;
            }
            
            strip.style.transform = `translateY(${reelPositions[index]}px)`;
            
            lastTime = timestamp;
            animationFrameIds[index] = requestAnimationFrame(spinLoop);
        }
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
        
        resultText.textContent = resultMessage;
        resultDisplay.classList.add('show');

        currentIngredientIndex++;
        nextButton.disabled = false;
    }

    cookingStartButton.addEventListener('click', () => { playSound(clickSound); showScreen('style-roulette-screen'); });
    styleStartButton.addEventListener('click', () => { playSound(clickSound); startStyleRoulette(); });
    nextButton.addEventListener('click', () => { playSound(clickSound); runMainRouletteForCurrentIngredient(); });
    
    startButton.addEventListener('click', () => {
        if (isSpinning) return;
        playSound(spinStartSound); 
        isSpinning = true;
        stoppedReels = [false, false, false];
        resultDisplay.classList.remove('show');
        isLampLitThisTurn = Math.random() < 0.5;
        gogoLamp.classList.toggle('lit', isLampLitThisTurn);
        startButton.disabled = true;

        if (isLampLitThisTurn) {
            setTimeout(() => { playSound(gogoSound); }, 600);
            stopButtons.forEach(b => b.disabled = false);
            thirdReel.classList.remove('hidden-reel');
            thirdStopButton.classList.remove('hidden-reel');
        } else {
            stopButtons.forEach((b, i) => { b.disabled = (i === 2); });
            thirdReel.classList.add('hidden-reel');
            thirdStopButton.classList.add('hidden-reel');
        }
        
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
