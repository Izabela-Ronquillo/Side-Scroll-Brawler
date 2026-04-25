// menu.js
let selectedMode = 'vs-ai';
let currentDiff = 'normal';

const p1NameInput = document.getElementById('p1-name-input');
const p2NameInput = document.getElementById('p2-name-input');
const resetP1Btn = document.getElementById('reset-p1-name');
const resetP2Btn = document.getElementById('reset-p2-name');
const startBtn = document.getElementById('start-game-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const creditsBtn = document.getElementById('credits-btn');
const diffOptions = document.querySelectorAll('.diff-option');
const modeBtns = document.querySelectorAll('.mode-btn');
const diffLabel = document.getElementById('diff-label');

const DIFF_DESC = {
    easy: '🍃 Weaker AI — reduced damage and reaction',
    normal: '⚡ Balanced AI — fair reaction speed and damage',
    hard: '🔥 Faster AI — increased damage and aggression',
    nightmare: '💀 Brutal precision — maximum aggression and power'
};

function updateDiffUI() {
    diffOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.diff === currentDiff);
    });
    diffLabel.textContent = DIFF_DESC[currentDiff];
}

function playSelectSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        osc.stop(audioCtx.currentTime + 0.1);
        audioCtx.resume();
    } catch(e) { }
}

// Diff options
diffOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        currentDiff = opt.dataset.diff;
        updateDiffUI();
        playSelectSound();
    });
});

// Mode options
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMode = btn.dataset.mode;
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playSelectSound();
    });
});

// Reset buttons
resetP1Btn.addEventListener('click', () => {
    p1NameInput.value = 'KAZUYA';
    playSelectSound();
});

resetP2Btn.addEventListener('click', () => {
    p2NameInput.value = 'REIJI';
    playSelectSound();
});

// Start Game button
startBtn.addEventListener('click', () => {
    const settings = {
        p1Name: p1NameInput.value.trim().toUpperCase() || 'KAZUYA',
        p2Name: p2NameInput.value.trim().toUpperCase() || 'REIJI',
        gameMode: selectedMode,
        aiDifficulty: currentDiff
    };
    localStorage.setItem('battleArenaSettings', JSON.stringify(settings));
    playSelectSound();
    setTimeout(() => {
        window.location.href = '../Side-Scroll-Brawler/Assets/Index/game.html';
    }, 100);
});

// How to Play button
howToPlayBtn.addEventListener('click', () => {
    playSelectSound();
    setTimeout(() => {
        window.location.href = '../Side-Scroll-Brawler/Assets/Index/h2p.html';
    }, 100);
});

// Credits button
creditsBtn.addEventListener('click', () => {
    playSelectSound();
    setTimeout(() => {
        window.location.href = '../Side-Scroll-Brawler/Assets/Index/credits.html';
    }, 100);
});

// Initialize
updateDiffUI();

if (!p1NameInput.value) p1NameInput.value = 'KAZUYA';
if (!p2NameInput.value) p2NameInput.value = 'REIJI';