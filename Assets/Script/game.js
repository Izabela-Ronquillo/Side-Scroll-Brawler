// ============================================================
// AUDIO ENGINE
// ============================================================
let _ac = null;
let sfxEnabled = true;

function getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    return _ac;
}

function noise(c, dur, freq, q, vol = 0.7) {
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 0.4);
    const s = c.createBufferSource();
    s.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    s.connect(f);
    f.connect(g);
    g.connect(c.destination);
    s.start();
}

function osc(c, type, freqStart, freqEnd, dur, vol = 0.5, distAmt = 0) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freqStart, c.currentTime);
    if (freqEnd !== freqStart) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    if (distAmt > 0) {
        const w = c.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = i * 2 / 256 - 1;
            curve[i] = Math.tanh(x * distAmt);
        }
        w.curve = curve;
        o.connect(w);
        w.connect(g);
    } else {
        o.connect(g);
    }
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
}

const SFX = {
    punch: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            noise(c, 0.09, 550, 3, 0.6);
            osc(c, 'sine', 80, 40, 0.06, 0.5);
        } catch (e) { }
    },
    kick: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            noise(c, 0.12, 350, 2, 0.5);
            osc(c, 'sine', 120, 35, 0.14, 0.8);
        } catch (e) { }
    },
    superAtk: (isP1) => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            const freqs = isP1 ? [180, 240, 360] : [150, 200, 300];
            freqs.forEach((f, i) => {
                setTimeout(() => {
                    osc(c, 'sawtooth', f * 4, f, 0.5, 0.25, 4);
                }, i * 35);
            });
            noise(c, 0.3, 800, 1, 0.4);
        } catch (e) { }
    },
    block: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            osc(c, 'triangle', 900, 450, 0.09, 0.5);
            noise(c, 0.06, 1200, 4, 0.3);
        } catch (e) { }
    },
    hit: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            noise(c, 0.14, 700, 2, 0.75);
            osc(c, 'sine', 60, 30, 0.1, 0.6);
        } catch (e) { }
    },
    superHit: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            noise(c, 0.2, 500, 1.5, 0.9);
            [120, 180, 240].forEach((f, i) => setTimeout(() => osc(c, 'sawtooth', f * 3, f, 0.4, 0.2, 3), i * 30));
        } catch (e) { }
    },
    jump: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            osc(c, 'sine', 200, 500, 0.14, 0.22);
        } catch (e) { }
    },
    countdown: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            osc(c, 'sine', 660, 660, 0.12, 0.35);
        } catch (e) { }
    },
    fight: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            [220, 330, 440, 660].forEach((f, i) => setTimeout(() => osc(c, 'sawtooth', f * 2, f, 0.25, 0.18, 3), i * 40));
        } catch (e) { }
    },
    victory: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            const notes = [523, 659, 784, 1047, 1318];
            notes.forEach((f, i) => setTimeout(() => osc(c, 'square', f, f, 0.3, 0.15), i * 120));
        } catch (e) { }
    },
    select: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            osc(c, 'sine', 880, 1200, 0.1, 0.25);
        } catch (e) { }
    },
    menuHover: () => {
        if (!sfxEnabled) return;
        try {
            const c = getAC();
            osc(c, 'sine', 440, 440, 0.06, 0.08);
        } catch (e) { }
    },
};

// ============================================================
// CHARACTER DEFINITIONS
// ============================================================
const CHARACTERS = [
    {
        id: 'kazuya', name: 'KAZUYA', title: 'IRON FIST', icon: '🔥', color: '#ff5533', color2: '#ff9955',
        hp: 100, speed: 5.4, powerMult: 1.0, defense: 0.15, superName: 'INFERNO STRIKE',
        desc: 'Balanced warrior with raw fire power',
        stats: { pow: 7, spd: 6, def: 6 },
        draw: (ctx, f) => drawKazuya(ctx, f)
    },
    {
        id: 'reiji', name: 'REIJI', title: 'SHADOW MONK', icon: '🌑', color: '#9955ff', color2: '#cc88ff',
        hp: 88, speed: 6.8, powerMult: 0.9, defense: 0.12, superName: 'VOID RUPTURE',
        desc: 'Swift and elusive, strikes from darkness',
        stats: { pow: 5, spd: 9, def: 4 },
        draw: (ctx, f) => drawReiji(ctx, f)
    },
    {
        id: 'sakura', name: 'SAKURA', title: 'WIND DANCER', icon: '🌸', color: '#33cc77', color2: '#88ffaa',
        hp: 82, speed: 7.8, powerMult: 0.82, defense: 0.10, superName: 'PETAL STORM',
        desc: 'Agile combo specialist — fastest strikes',
        stats: { pow: 4, spd: 10, def: 3 },
        draw: (ctx, f) => drawSakura(ctx, f)
    },
    {
        id: 'darius', name: 'DARIUS', title: 'STEEL TITAN', icon: '⚙️', color: '#aabbcc', color2: '#ffcc44',
        hp: 145, speed: 3.4, powerMult: 1.6, defense: 0.32, superName: 'TITAN CRASH',
        desc: 'Unstoppable armored tank — crushing power',
        stats: { pow: 10, spd: 2, def: 10 },
        draw: (ctx, f) => drawDarius(ctx, f)
    },
    {
        id: 'lyra', name: 'LYRA', title: 'STORM MAGE', icon: '⚡', color: '#33ddff', color2: '#ffee44',
        hp: 86, speed: 5.0, powerMult: 1.2, defense: 0.11, superName: 'THUNDER SURGE',
        desc: 'Elemental mage with long-range devastation',
        stats: { pow: 9, spd: 5, def: 4 },
        draw: (ctx, f) => drawLyra(ctx, f)
    },
    {
        id: 'kira', name: 'KIRA', title: 'VOID PHANTOM', icon: '👻', color: '#ff44aa', color2: '#cc22ff',
        hp: 80, speed: 6.4, powerMult: 1.05, defense: 0.08, superName: 'PHASE SHIFT',
        desc: 'Phantom assassin — unpredictable movement',
        stats: { pow: 7, spd: 8, def: 2 },
        draw: (ctx, f) => drawKira(ctx, f)
    },
];

// ============================================================
// GAME STATE
// ============================================================
const canvas = document.getElementById('gc');
const ctx = canvas.getContext('2d');
let W = 1100, H = 560;

function resizeCanvas() {
    const maxW = Math.min(1400, window.innerWidth - 24);
    const maxH = Math.min(700, window.innerHeight - 150);
    const ratio = 1100 / 560;
    let nw = maxW, nh = nw / ratio;
    if (nh > maxH) { nh = maxH; nw = nh * ratio; }
    canvas.style.width = nw + 'px';
    canvas.style.height = nh + 'px';
    canvas.width = 1100;
    canvas.height = 560;
    W = 1100;
    H = 560;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load settings from localStorage (passed from main menu)
let customP1Name = 'KAZUYA';
let customP2Name = 'REIJI';
let selectedP1Char = CHARACTERS[0];
let selectedP2Char = CHARACTERS[1];
let currentDiff = 'normal';
let selectedMode = 'vs-ai';

// Load saved settings
const savedSettings = localStorage.getItem('battleArenaSettings');
if (savedSettings) {
    try {
        const settings = JSON.parse(savedSettings);
        customP1Name = settings.p1Name || 'KAZUYA';
        customP2Name = settings.p2Name || 'REIJI';
        selectedMode = settings.gameMode || 'vs-ai';
        currentDiff = settings.aiDifficulty || 'normal';
    } catch (e) { }
}

const DIFF = {
    easy: { aiDelay: 8, aggro: 0.5, dmgMult: 0.7, pBoost: 1.35, jumpP: 0.004, blockP: 0.025, desc: 'Weaker AI — reduced damage and reaction' },
    normal: { aiDelay: 3, aggro: 0.95, dmgMult: 1.0, pBoost: 1.0, jumpP: 0.009, blockP: 0.06, desc: 'Balanced AI — fair reaction speed and damage' },
    hard: { aiDelay: 2, aggro: 1.35, dmgMult: 1.25, pBoost: 0.88, jumpP: 0.014, blockP: 0.10, desc: 'Faster AI — increased damage and aggression' },
    nightmare: { aiDelay: 1, aggro: 1.8, dmgMult: 1.6, pBoost: 0.75, jumpP: 0.02, blockP: 0.15, desc: 'Brutal precision — maximum aggression and power' },
};

let state = {
    phase: 'countdown', countdown: 3, cdTick: 0, roundTime: 60, timeTick: 0,
    round: 1, score: [0, 0], matchOver: false, roundOver: false, winner: null,
    msgTimer: 0, msg: '', aiOn: (selectedMode === 'vs-ai'), aiTick: 0,
    menuVisible: false, csVisible: false
};
let shake = { x: 0, y: 0, pow: 0 };
let hitstop = 0;
let particles = [], effects = [], floatingTexts = [];
let comboHits = 0, comboTimer = 0, comboOwner = null;
let lastJump1 = false, lastJump2 = false;
const comboLog = document.getElementById('combo-log');

// ============================================================
// STAGES
// ============================================================
const STAGES = [
    {
        name: 'SHADOW TEMPLE', drawBg: (ctx, W, H, t) => {
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, '#0a0614');
            g.addColorStop(1, '#03020a');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#120a1e';
            for (let i = 0; i < 8; i++) {
                const px = i * 140 + 50;
                ctx.fillRect(px, 180, 28, H - 180);
                ctx.fillStyle = '#1a102a';
                ctx.fillRect(px - 8, 180, 44, 16);
                ctx.fillStyle = '#120a1e';
            }
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff6622';
            for (let i = 0; i < 5; i++) {
                const lx = 110 + i * 200;
                const fl = Math.sin(t * 0.05 + i) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255,120,40,${0.5 * fl})`;
                ctx.beginPath();
                ctx.arc(lx, 160, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(255,180,80,${0.8 * fl})`;
                ctx.beginPath();
                ctx.arc(lx, 160, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
    },
    {
        name: 'VOLCANIC RIM', drawBg: (ctx, W, H, t) => {
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, '#0a0300');
            g.addColorStop(0.6, '#1a0800');
            g.addColorStop(1, '#2a1000');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            const lava = ctx.createLinearGradient(0, 440, 0, 470);
            lava.addColorStop(0, 'rgba(255,80,0,0.4)');
            lava.addColorStop(1, 'rgba(255,30,0,0.0)');
            ctx.fillStyle = lava;
            ctx.fillRect(0, 430, W, 40);
            ctx.fillStyle = '#1a0a00';
            for (let i = 0; i < 6; i++) {
                const rx = i * 180 + 30;
                const rh = 80 + Math.sin(i * 1.3) * 40;
                ctx.beginPath();
                ctx.moveTo(rx, 470);
                ctx.lineTo(rx + 40, 470 - rh);
                ctx.lineTo(rx + 80, 470);
                ctx.fill();
            }
            for (let i = 0; i < 8; i++) {
                const ex = (i * 137 + t * 0.4) % W;
                const ey = 440 - ((t * 0.8 + i * 80) % 260);
                const alpha = Math.sin(t * 0.08 + i) * 0.4 + 0.6;
                ctx.fillStyle = `rgba(255,${100 + i * 15},0,${alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(ex, ey, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    {
        name: 'MIDNIGHT DOJO', drawBg: (ctx, W, H, t) => {
            ctx.fillStyle = '#060810';
            ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = 'rgba(60,80,140,0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 60, 0);
                ctx.lineTo(i * 60, H);
                ctx.stroke();
            }
            for (let i = 0; i < 12; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * 50);
                ctx.lineTo(W, i * 50);
                ctx.stroke();
            }
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#aaccff';
            ctx.fillStyle = 'rgba(180,210,255,0.15)';
            ctx.beginPath();
            ctx.arc(W / 2, 60, 70, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(220,235,255,0.9)';
            ctx.beginPath();
            ctx.arc(W / 2, 60, 36, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0d0d16';
            ctx.fillRect(30, 300, 40, 160);
            ctx.fillRect(W - 70, 300, 40, 160);
        }
    },
    {
        name: 'BAMBOO GROVE', drawBg: (ctx, W, H, t) => {
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, '#050e08');
            g.addColorStop(1, '#020805');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            for (let i = 0; i < 18; i++) {
                const bx = i * 64 + 20;
                const sw = Math.sin(t * 0.02 + i * 0.5) * 3;
                ctx.save();
                ctx.translate(bx + sw, 0);
                ctx.fillStyle = '#0d1a0a';
                ctx.fillRect(0, 40, 14, H - 40);
                for (let j = 0; j < 8; j++) {
                    ctx.fillStyle = 'rgba(20,40,15,0.8)';
                    ctx.fillRect(-2, 60 + j * 60, 18, 3);
                }
                ctx.restore();
            }
            const mist = ctx.createLinearGradient(0, 350, 0, 470);
            mist.addColorStop(0, 'rgba(20,40,20,0)');
            mist.addColorStop(1, 'rgba(20,40,20,0.5)');
            ctx.fillStyle = mist;
            ctx.fillRect(0, 350, W, 120);
        }
    },
];
let stageIdx = 0, frameT = 0;

// ============================================================
// FIGHTER CLASS
// ============================================================
class Fighter {
    constructor(x, isP1, charDef) {
        this.x = x; this.y = 400; this.w = 58; this.h = 90;
        this.vx = 0; this.vy = 0; this.grounded = true;
        this.isP1 = isP1; this.charDef = charDef;
        this.hp = charDef.hp; this.maxHp = charDef.hp;
        this.sp = 0; this.maxSp = 100;
        this.speed = charDef.speed;
        this.powerMult = charDef.powerMult;
        this.defense = charDef.defense;
        this.facing = isP1 ? 1 : -1;
        this.state = 'idle'; this.atkTimer = 0; this.atkCD = 0; this.atkType = '';
        this.hitTimer = 0; this.iTimer = 0; this.dead = false; this.anim = 0;
        this.superActive = 0; this.blocking = false; this.blockTimer = 0;
        this.walkCycle = 0; this.trail = [];
    }

    update(opp) {
        if (hitstop > 0) return;
        this.anim += 0.18;
        if (this.atkTimer > 0) { this.atkTimer--; if (!this.atkTimer && this.state === 'attack') this.state = 'idle'; }
        if (this.atkCD > 0) this.atkCD--;
        if (this.hitTimer > 0) { this.hitTimer--; if (!this.hitTimer && this.state === 'hit') this.state = 'idle'; }
        if (this.iTimer > 0) this.iTimer--;
        if (this.superActive > 0) this.superActive--;
        if (this.blockTimer > 0) this.blockTimer--;
        if (!matchPaused()) {
            this.x += this.vx; this.vy += 0.72; this.y += this.vy;
            const FLOOR = 470 - this.h;
            if (this.y >= FLOOR) { this.y = FLOOR; this.vy = 0; this.grounded = true; } else this.grounded = false;
            this.x = Math.max(18, Math.min(W - this.w - 18, this.x));
            if (this.state !== 'attack' && this.state !== 'hit' && this.state !== 'dead') {
                if (!this.grounded) this.state = 'jump';
                else if (this.blocking) this.state = 'block';
                else if (Math.abs(this.vx) > 1.5) this.state = 'run';
                else this.state = 'idle';
            }
            if (Math.abs(this.vx) > 1) this.walkCycle += 0.28;
        }
        if (this.superActive > 0) this.trail.push({ x: this.x + this.w / 2, y: this.y + this.h / 2, life: 0.6 });
        this.trail = this.trail.filter(t => { t.life -= 0.08; return t.life > 0; });
        if (matchPaused()) return;
        if (this.state !== 'attack') this.facing = opp.x > this.x ? 1 : -1;
    }

    doAttack(type) {
        if (matchPaused()) return false;
        if (this.atkCD > 0) return false;
        if (this.state === 'hit') return false;
        if (type === 'super' && this.sp < 100) return false;
        this.state = 'attack'; this.atkType = type;
        this.atkTimer = type === 'super' ? 20 : 11;
        this.atkCD = type === 'super' ? 55 : 20;
        if (type === 'super') { this.sp = 0; this.superActive = 22; addShake(7); SFX.superAtk(this.isP1); }
        else if (type === 'kick') SFX.kick();
        else SFX.punch();
        spawnAttackFX(this, type);
        return true;
    }

    takeDmg(dmg, type, fromPlayer = false) {
        if (this.dead || this.iTimer > 0) return;
        if (this.blocking && this.blockTimer > 0) {
            dmg = Math.floor(dmg * this.defense);
            spawnBlockFX(this.x + this.w / 2, this.y + this.h / 2);
            this.iTimer = 8; this.sp = Math.min(100, this.sp + 4);
            SFX.block(); updateHUD(); return;
        }
        let d = Math.max(1, dmg);
        if (!this.isP1 && state.aiOn && fromPlayer) d = Math.floor(d * DIFF[currentDiff].pBoost);
        if (this.isP1 && state.aiOn && !fromPlayer) d = Math.floor(d * DIFF[currentDiff].dmgMult);
        d = Math.max(1, d);
        this.hp = Math.max(0, this.hp - d);
        this.hitTimer = 14; this.iTimer = 16; this.state = 'hit';
        this.sp = Math.min(100, this.sp + 9);
        addShake(type === 'super' ? 9 : 4);
        if (type === 'super') { hitstop = 6; SFX.superHit(); } else { hitstop = 2; SFX.hit(); }
        if (this.hp <= 0) { this.dead = true; this.state = 'dead'; }
        this.vx = (fromPlayer ? 1 : -1) * (type === 'super' ? 9 : 5) * (this.facing < 0 ? 1 : -1);
        this.vy = -4;
        spawnFloatingText(this.x + this.w / 2, this.y, type === 'super' ? `${d}!!` : `${d}`, type === 'super' ? '#ffdd44' : '#ffffff');
        updateHUD();
    }

    getHitbox() {
        const ext = this.atkType === 'super' ? 30 : 0;
        const reach = this.atkType === 'kick' ? 70 : 65;
        let ox = this.facing > 0 ? this.x + this.w - 8 : this.x - reach - ext;
        return { x: ox - ext, y: this.y + 20, w: reach + ext * 2, h: 65 };
    }

    draw(ctx) {
        for (let t of this.trail) {
            ctx.globalAlpha = t.life * 0.22;
            ctx.fillStyle = this.charDef.color;
            ctx.fillRect(t.x - this.w / 2, t.y - this.h / 2, this.w, this.h);
        }
        ctx.globalAlpha = 1;
        const blink = this.iTimer > 0 && Math.floor(Date.now() / 55) % 2 === 0;
        ctx.globalAlpha *= 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, 472, this.w * 0.55, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = blink ? 0.45 : 1;
        if (this.superActive > 0) { ctx.shadowBlur = 28; ctx.shadowColor = this.charDef.color; }
        this.charDef.draw(ctx, this);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// ============================================================
// CHARACTER DRAW FUNCTIONS (Simplified - keeping original art style)
// ============================================================
function drawKazuya(ctx, f) {
    const { x, y, w, h, state, walkCycle, facing, atkType, anim, superActive } = f;
    const cx = x + w / 2, cy = y + h / 2;
    const bobY = state === 'idle' ? Math.sin(anim * 0.8) * 2 : 0;
    ctx.save();
    ctx.translate(cx, cy + bobY);
    ctx.fillStyle = '#c8401a';
    ctx.fillRect(-22, -28, 44, 48);
    ctx.fillStyle = '#8a2a10';
    ctx.fillRect(-12, -28, 24, 36);
    ctx.fillStyle = '#111';
    ctx.fillRect(-22, 14, 44, 8);
    if (superActive > 0) {
        ctx.fillStyle = 'rgba(255,200,50,0.7)';
        ctx.fillRect(-22, 14, 44, 8);
    }
    ctx.fillStyle = '#b03818';
    ctx.fillRect(facing > 0 ? -16 : 16, -14, 12, 28);
    ctx.fillStyle = '#c84020';
    ctx.fillRect(facing > 0 ? 12 : -12, -14, 12, 28);
    ctx.fillStyle = '#cc2211';
    ctx.fillRect(-19, -38, 38, 10);
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(-19, -38, 38, 4);
    ctx.fillStyle = '#c87040';
    ctx.beginPath();
    ctx.ellipse(0, 4, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, -12, 16, 10, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-6 + (facing > 0 ? 3 : -3), 1, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6 + (facing > 0 ? 3 : -3), 1, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#330800';
    ctx.beginPath();
    ctx.arc(-6 + (facing > 0 ? 3 : -3) + 1.5, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6 + (facing > 0 ? 3 : -3) + 1.5, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawReiji(ctx, f) {
    const { x, y, w, h, state, anim, facing, superActive } = f;
    const cx = x + w / 2, cy = y + h / 2;
    const bobY = state === 'idle' ? Math.sin(anim * 0.6) * 2.5 : 0;
    ctx.save();
    ctx.translate(cx, cy + bobY);
    ctx.fillStyle = '#180a30';
    ctx.fillRect(-22, -26, 44, 48);
    ctx.fillStyle = '#2a1455';
    ctx.fillRect(-8, -26, 16, 48);
    ctx.fillStyle = '#4433aa';
    ctx.fillRect(-24, 10, 48, 8);
    if (superActive > 0) {
        ctx.fillStyle = 'rgba(180,100,255,0.7)';
        ctx.fillRect(-24, 10, 48, 8);
    }
    ctx.fillStyle = '#0e0820';
    ctx.beginPath();
    ctx.arc(0, -4, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c0a890';
    ctx.beginPath();
    ctx.ellipse(0, 1, 13, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(150,100,255,${superActive > 0 ? 0.9 : 0.6})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#8855ff';
    ctx.beginPath();
    ctx.ellipse(-5 + (facing > 0 ? 2 : -2), -1, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 + (facing > 0 ? 2 : -2), -1, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#220044';
    ctx.beginPath();
    ctx.arc(-5 + (facing > 0 ? 2 : -2) + 1, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5 + (facing > 0 ? 2 : -2) + 1, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Simplified versions for other characters (keeping visual style)
function drawSakura(ctx, f) { drawGeneric(ctx, f, '#0e3a1e', '#55dd88', '#33aa55'); }
function drawDarius(ctx, f) { drawGeneric(ctx, f, '#2a3a4a', '#ffcc44', '#aabbcc'); }
function drawLyra(ctx, f) { drawGeneric(ctx, f, '#082030', '#33ccff', '#1133aa'); }
function drawKira(ctx, f) { drawGeneric(ctx, f, '#0c0c1c', '#ff44aa', '#ff88cc'); }

function drawGeneric(ctx, f, mainColor, accentColor, secondaryColor) {
    const { x, y, w, h, state, anim, facing, superActive } = f;
    const cx = x + w / 2, cy = y + h / 2;
    const bobY = state === 'idle' ? Math.sin(anim * 0.8) * 2 : 0;
    ctx.save();
    ctx.translate(cx, cy + bobY);
    ctx.fillStyle = mainColor;
    ctx.fillRect(-20, -26, 40, 48);
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-8, -26, 16, 48);
    ctx.fillStyle = accentColor;
    ctx.fillRect(-22, 8, 44, 6);
    if (superActive > 0) {
        ctx.fillStyle = `rgba(${parseInt(accentColor.slice(1, 3), 16)},${parseInt(accentColor.slice(3, 5), 16)},${parseInt(accentColor.slice(5, 7), 16)},0.6)`;
        ctx.fillRect(-22, 8, 44, 6);
    }
    ctx.fillStyle = '#c0a890';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(-5 + (facing > 0 ? 2 : -2), -2, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 + (facing > 0 ? 2 : -2), -2, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ============================================================
// EFFECTS
// ============================================================
function spawnBlockFX(x, y) {
    for (let i = 0; i < 8; i++) spawnParticle(x, y, '#aabbff', 'spark');
    effects.push({ x, y, type: 'block', life: 10 });
}

function spawnAttackFX(f, type) {
    const hx = f.facing > 0 ? f.x + f.w + 10 : f.x - 24;
    const hy = f.y + (type === 'kick' ? 68 : 48);
    const col = type === 'super' ? f.charDef.color2 : f.charDef.color;
    if (type === 'super') {
        effects.push({ x: hx, y: hy, type: 'beam', dir: f.facing, life: 20, color: col });
        for (let i = 0; i < 28; i++) spawnParticle(hx + (Math.random() - 0.5) * 44, hy + (Math.random() - 0.5) * 40, col, 'burst');
    } else {
        for (let i = 0; i < 12; i++) spawnParticle(hx + (Math.random() - 0.5) * 28, hy + (Math.random() - 0.5) * 26, col, 'spark');
    }
}

function spawnParticle(x, y, col, type) {
    particles.push({
        x, y, col, type,
        vx: (Math.random() - 0.5) * (type === 'burst' ? 13 : 8),
        vy: (Math.random() - 0.5) * 8 - 2,
        life: type === 'burst' ? 0.9 : 0.7,
        size: type === 'burst' ? 7 : 3
    });
}

function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1.0, vy: -2.5 });
}

function addShake(pow) {
    shake.pow = Math.max(shake.pow, pow);
}

// ============================================================
// AI
// ============================================================
function updateAI(ai, opp) {
    if (!state.aiOn) return;
    state.aiTick++;
    const d = DIFF[currentDiff];
    const dist = Math.abs(ai.x - opp.x);
    let targetDist = ai.hp < 30 ? 140 : 90;
    let moveDir = ai.x > opp.x ? -1 : 1;
    if (dist < targetDist) moveDir = -moveDir * 0.6;
    ai.vx = moveDir * ai.speed * d.aggro;
    if (ai.grounded && Math.random() < d.jumpP) { ai.vy = -13; SFX.jump(); }
    ai.blocking = (dist < 120 && Math.random() < d.blockP && ai.atkCD > 8);
    ai.blockTimer = ai.blocking ? 12 : 0;
    if (dist < 110 && ai.atkCD === 0 && state.aiTick % d.aiDelay === 0) {
        const r = Math.random();
        if (r < 0.14 * d.aggro && ai.sp >= 100) ai.doAttack('super');
        else if (r < 0.44) ai.doAttack('punch');
        else if (r < 0.72) ai.doAttack('kick');
    }
    if (ai.sp < 100) ai.sp = Math.min(100, ai.sp + 0.08 * d.aggro);
}

// ============================================================
// HIT DETECTION
// ============================================================
function checkHits(att, def) {
    if (att.atkTimer <= 0 || att.atkCD > 15) return;
    const hb = att.getHitbox();
    if (hb.x < def.x + def.w && hb.x + hb.w > def.x && hb.y < def.y + def.h && hb.y + hb.h > def.y) {
        const isSuper = att.atkType === 'super';
        let dmg = isSuper ? 30 : (att.atkType === 'kick' ? 15 : 12);
        dmg = Math.floor(dmg * att.powerMult);
        def.takeDmg(dmg, att.atkType, att.isP1);
        att.atkCD = 26;
        att.sp = Math.min(100, att.sp + (isSuper ? 0 : 8));
        if (comboOwner === att) { comboHits++; comboTimer = 65; } else { comboOwner = att; comboHits = 1; comboTimer = 65; }
        if (comboHits >= 3) comboLog.textContent = `💥 ${comboHits}-HIT COMBO!`;
        else if (comboHits === 2) comboLog.textContent = `⚡ DOUBLE HIT!`;
        else comboLog.textContent = att.isP1 ? `⚡ ${customP1Name} STRIKES` : `🌑 ${customP2Name} STRIKES`;
    }
}

// ============================================================
// DRAWING HELPERS
// ============================================================
function drawGround() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 470, W, H - 470);
    ctx.strokeStyle = 'rgba(255,200,60,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.lineTo(W, 470);
    ctx.stroke();
}

function drawEffect(e) {
    if (e.type === 'hit') {
        const t = e.life / 14;
        ctx.globalAlpha = t * 0.8;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - t) * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (e.type === 'beam') {
        ctx.globalAlpha = e.life / 20 * 0.85;
        ctx.shadowBlur = 30;
        ctx.shadowColor = e.color;
        const bw = 160 + (20 - e.life) * 14;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.dir > 0 ? e.x : e.x - bw, e.y - 14, bw, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(e.dir > 0 ? e.x : e.x - bw * 0.6, e.y - 6, bw * 0.6, 12);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

function drawParticle(p) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
}

function drawFloatingTexts() {
    for (let t of floatingTexts) {
        ctx.globalAlpha = t.life;
        ctx.font = `bold ${18 + (1 - t.life) * 6}px 'Orbitron',monospace`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
}

function drawMsg(txt, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px "Orbitron",monospace';
    const tw = ctx.measureText(txt).width + 80;
    const rx = W / 2 - tw / 2, ry = H / 2 - 54;
    ctx.fillRect(rx, ry, tw, 84);
    ctx.strokeStyle = 'rgba(255,200,60,0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, tw, 84);
    ctx.fillStyle = '#ffdd88';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff6600';
    ctx.fillText(txt, W / 2, H / 2 + 4);
    ctx.shadowBlur = 0;
    if (sub) {
        ctx.font = '12px "Share Tech Mono"';
        ctx.fillStyle = '#9988aa';
        ctx.fillText(sub, W / 2, H / 2 + 30);
    }
    ctx.textAlign = 'left';
}

function drawCountdown(n) {
    ctx.fillStyle = 'rgba(255,220,80,0.95)';
    ctx.font = 'bold 96px "Orbitron",monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#ff8800';
    ctx.fillText(n === 0 ? 'FIGHT!' : String(n), W / 2, H / 2 + 44);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

// ============================================================
// HUD
// ============================================================
let f1, f2;

function updateHUD() {
    if (!f1 || !f2) return;
    document.getElementById('hp1').style.width = Math.max(0, (f1.hp / f1.maxHp) * 100) + '%';
    document.getElementById('hp2').style.width = Math.max(0, (f2.hp / f2.maxHp) * 100) + '%';
    document.getElementById('sp1').style.width = (f1.sp / f1.maxSp) * 100 + '%';
    document.getElementById('sp2').style.width = (f2.sp / f2.maxSp) * 100 + '%';
    const timerEl = document.getElementById('timer');
    timerEl.textContent = Math.ceil(state.roundTime);
    timerEl.classList.toggle('low', state.roundTime < 10);
    document.getElementById('round-label').textContent = `ROUND ${state.round}`;
    document.getElementById('super1').classList.toggle('visible', f1.sp >= 100);
    document.getElementById('super2').classList.toggle('visible', f2.sp >= 100);
    updatePips();
}

function updatePips() {
    ['score1', 'score2'].forEach((id, pi) => {
        const el = document.getElementById(id);
        el.innerHTML = '';
        for (let i = 0; i < 2; i++) {
            const pip = document.createElement('div');
            pip.className = 'score-pip' + (state.score[pi] > i ? ' filled p' + (pi + 1) : '');
            el.appendChild(pip);
        }
    });
}

function updateAllNameDisplays() {
    document.getElementById('p1-name-display').innerHTML = `${selectedP1Char.icon} ${customP1Name} · ${selectedP1Char.title}`;
    document.getElementById('p2-name-display').innerHTML = `${selectedP2Char.title} · ${customP2Name} ${selectedP2Char.icon}`;
    document.getElementById('p1-control-name').innerHTML = `${selectedP1Char.icon} ${customP1Name}`;
    document.getElementById('p2-control-name').innerHTML = `${selectedP2Char.icon} ${customP2Name}`;
}

// ============================================================
// GAME LOGIC
// ============================================================
function matchPaused() { return state.phase === 'countdown' || state.phase === 'over' || state.phase === 'roundend' || state.matchOver || state.menuVisible || state.csVisible; }

function initFighters() { f1 = new Fighter(220, true, selectedP1Char); f2 = new Fighter(830, false, selectedP2Char); }

function startRound(fullReset = false) {
    if (state.menuVisible || state.csVisible) return;
    if (fullReset) { state.score = [0, 0]; state.round = 1; state.matchOver = false; }
    stageIdx = (stageIdx + 1) % STAGES.length;
    initFighters();
    particles = [];
    effects = [];
    floatingTexts = [];
    comboHits = 0;
    comboTimer = 0;
    comboOwner = null;
    comboLog.textContent = '· · ·';
    state.roundTime = 60;
    state.timeTick = 0;
    state.phase = 'countdown';
    state.countdown = 3;
    state.cdTick = 0;
    state.roundOver = false;
    state.msgTimer = 0;
    state.msg = '';
    state.matchOver = false;
    updateHUD();
}

function endRound(p1Won) {
    if (state.roundOver || state.menuVisible || state.csVisible) return;
    state.roundOver = true;
    state.phase = 'roundend';
    if (p1Won) state.score[0]++;
    else state.score[1]++;
    const wName = p1Won ? customP1Name : customP2Name;
    if (state.score[0] >= 2 || state.score[1] >= 2) {
        state.matchOver = true;
        state.winner = wName;
        state.msg = wName + ' WINS!';
        state.msgTimer = 180;
        addShake(14);
        SFX.victory();
        showNotif(wName + ' WINS THE MATCH!');
        setTimeout(() => startRound(true), 3200);
    } else {
        state.round++;
        state.msg = wName + ' WINS ROUND ' + (state.round - 1);
        state.msgTimer = 130;
        showNotif('ROUND ' + (state.round - 1) + ' → ' + wName);
        setTimeout(() => startRound(false), 2400);
    }
    updatePips();
}

function showNotif(msg) {
    const el = document.getElementById('notif');
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 2000);
}

// ============================================================
// INPUT
// ============================================================
const keys = {};

document.addEventListener('keydown', e => {
    if (state.menuVisible || state.csVisible) return;
    keys[e.code] = true;
    const prevent = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyT', 'KeyE', 'KeyO', 'KeyP', 'BracketLeft'];
    if (prevent.includes(e.code)) e.preventDefault();
    if (e.code === 'KeyM') {
        sfxEnabled = !sfxEnabled;
        showVolIndicator(sfxEnabled ? '🔊 SFX ON' : '🔇 SFX OFF');
        document.getElementById('vol-btn').textContent = sfxEnabled ? '🔊 SFX' : '🔇 SFX';
    }
    if (!matchPaused() && f1 && f2) {
        if (e.code === 'KeyR') f1.doAttack('punch');
        if (e.code === 'KeyT') f1.doAttack('kick');
        if (e.code === 'KeyE') f1.doAttack('super');
        if (!state.aiOn) {
            if (e.code === 'KeyO') f2.doAttack('punch');
            if (e.code === 'KeyP') f2.doAttack('kick');
            if (e.code === 'BracketLeft') f2.doAttack('super');
        }
    }
});

document.addEventListener('keyup', e => { keys[e.code] = false; });

function handleInput() {
    if (matchPaused() || state.menuVisible || state.csVisible || !f1 || !f2) return;
    f1.vx = (keys['KeyD'] ? f1.speed : 0) - (keys['KeyA'] ? f1.speed : 0);
    if (keys['KeyW'] && f1.grounded && !lastJump1) { f1.vy = -13; f1.grounded = false; SFX.jump(); }
    lastJump1 = keys['KeyW'];
    f1.blocking = keys['KeyS'] && f1.grounded;
    f1.blockTimer = f1.blocking ? 12 : 0;
    if (!state.aiOn) {
        f2.vx = (keys['ArrowRight'] ? f2.speed : 0) - (keys['ArrowLeft'] ? f2.speed : 0);
        if (keys['ArrowUp'] && f2.grounded && !lastJump2) { f2.vy = -13; f2.grounded = false; SFX.jump(); }
        lastJump2 = keys['ArrowUp'];
        f2.blocking = keys['ArrowDown'] && f2.grounded;
        f2.blockTimer = f2.blocking ? 12 : 0;
    }
}

function showVolIndicator(msg) {
    const el = document.getElementById('vol-indicator');
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 1200);
}

// ============================================================
// GAME LOOP
// ============================================================
let lastF = 0;

function gameLoop(now) {
    const dt = Math.min((now - lastF) / 16.67, 2.5);
    lastF = now;
    frameT += dt;
    if (!state.menuVisible && !state.csVisible && f1 && f2) {
        if (hitstop > 0) hitstop -= dt;
        if (hitstop < 0) hitstop = 0;
        if (shake.pow > 0) {
            shake.x = (Math.random() - 0.5) * shake.pow;
            shake.y = (Math.random() - 0.5) * shake.pow * 0.5;
            shake.pow *= 0.78;
            if (shake.pow < 0.1) shake.pow = 0;
        } else { shake.x = 0; shake.y = 0; }
        for (let p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.04; }
        particles = particles.filter(p => p.life > 0);
        for (let e of effects) e.life -= dt;
        effects = effects.filter(e => e.life > 0);
        for (let t of floatingTexts) { t.y += t.vy; t.life -= 0.025; }
        floatingTexts = floatingTexts.filter(t => t.life > 0);
        if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { comboHits = 0; comboOwner = null; if (state.phase === 'fight') comboLog.textContent = '· · ·'; } }
        if (state.phase === 'countdown') {
            state.cdTick += dt;
            if (state.cdTick >= 52) {
                state.countdown--;
                state.cdTick = 0;
                if (state.countdown >= 0) SFX.countdown();
                if (state.countdown < 0) { state.phase = 'fight'; comboLog.textContent = '⚔️ FIGHT!'; SFX.fight(); }
            }
        } else if (state.phase === 'fight') {
            if (hitstop <= 0) {
                handleInput();
                if (state.aiOn) updateAI(f2, f1);
                f1.update(f2);
                f2.update(f1);
                checkHits(f1, f2);
                checkHits(f2, f1);
                state.timeTick += dt;
                if (state.timeTick >= 60) { state.roundTime = Math.max(0, state.roundTime - 1); state.timeTick = 0; }
            }
            if (f1.dead) endRound(false);
            else if (f2.dead) endRound(true);
            else if (state.roundTime <= 0) {
                if (f1.hp > f2.hp) endRound(true);
                else if (f2.hp > f1.hp) endRound(false);
                else { state.msg = 'TIME OVER · DRAW'; state.msgTimer = 150; state.roundOver = true; state.phase = 'roundend'; setTimeout(() => startRound(false), 2400); }
            }
        } else if (state.phase === 'roundend') { if (state.msgTimer > 0) state.msgTimer -= dt; }
    }
    ctx.save();
    ctx.translate(shake.x, shake.y);
    STAGES[stageIdx].drawBg(ctx, W, H, frameT);
    drawGround();
    for (let e of effects) if (e.type === 'beam') drawEffect(e);
    if (f1 && f2) { f1.draw(ctx); f2.draw(ctx); }
    for (let e of effects) if (e.type !== 'beam') drawEffect(e);
    for (let p of particles) drawParticle(p);
    drawFloatingTexts();
    ctx.fillStyle = 'rgba(255,200,80,0.18)';
    ctx.font = 'bold 11px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText(STAGES[stageIdx].name, W / 2, H - 8);
    ctx.textAlign = 'left';
    if (!state.menuVisible && !state.csVisible && state.phase === 'countdown' && state.countdown >= 0) drawCountdown(state.countdown);
    if (!state.menuVisible && !state.csVisible && state.msgTimer > 0 && state.msg) drawMsg(state.msg, state.matchOver ? 'NEXT MATCH STARTING...' : (state.roundOver ? 'NEXT ROUND...' : ''));
    ctx.restore();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

// ============================================================
// CHARACTER SELECT UI
// ============================================================
const csDiv = document.getElementById('char-select');
let csP1Selected = null, csP2Selected = null, csSelectingP1 = true;

function buildCSGrid() {
    const grid = document.getElementById('cs-grid');
    grid.innerHTML = '';
    CHARACTERS.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'cs-card';
        card.dataset.id = ch.id;
        card.style.setProperty('--char-color', ch.color);
        card.innerHTML = `
            <span class="cs-card-icon">${ch.icon}</span>
            <div class="cs-card-name" style="color:${ch.color}">${ch.name}</div>
            <div class="cs-card-title">${ch.title}</div>
            <div class="cs-card-badges">
                <span class="cs-badge" style="background:rgba(255,80,0,0.2);color:#ffaa88;border:1px solid rgba(255,100,50,0.4)">PWR ${ch.stats.pow}</span>
                <span class="cs-badge" style="background:rgba(80,200,255,0.15);color:#88ddff;border:1px solid rgba(60,180,255,0.4)">SPD ${ch.stats.spd}</span>
                <span class="cs-badge" style="background:rgba(80,255,80,0.12);color:#88ff88;border:1px solid rgba(50,200,50,0.4)">DEF ${ch.stats.def}</span>
            </div>
        `;
        card.addEventListener('mouseenter', () => SFX.menuHover());
        card.addEventListener('click', () => csSelectChar(ch));
        grid.appendChild(card);
    });
}

function csStatBar(label, val, color) {
    return `<div class="cs-stat-row"><div class="cs-stat-label">${label}</div><div class="cs-stat-bar-bg"><div class="cs-stat-fill" style="width:${val * 10}%;background:${color}"></div></div></div>`;
}

function csUpdatePreview(side, ch) {
    const pfx = side === 'p1' ? 'p1' : 'p2';
    document.getElementById(`cs-${pfx}-portrait`).textContent = ch.icon;
    document.getElementById(`cs-${pfx}-portrait`).style.background = 'rgba(0,0,0,0.4)';
    document.getElementById(`cs-${pfx}-portrait`).style.border = `1px solid ${ch.color}66`;
    document.getElementById(`cs-${pfx}-name`).textContent = ch.name;
    document.getElementById(`cs-${pfx}-name`).style.color = ch.color;
    document.getElementById(`cs-${pfx}-title`).textContent = ch.title;
    document.getElementById(`cs-${pfx}-title`).style.color = ch.color2 || ch.color;
    document.getElementById(`cs-${pfx}-stats`).innerHTML =
        csStatBar('POW', ch.stats.pow, '#ff7744') +
        csStatBar('SPD', ch.stats.spd, '#44ccff') +
        csStatBar('DEF', ch.stats.def, '#44ff88');
    document.getElementById(`cs-${pfx}-desc`).textContent = ch.desc;
}

function csUpdateCardHighlights() {
    document.querySelectorAll('.cs-card').forEach(card => {
        card.classList.remove('sel-p1', 'sel-p2', 'sel-both');
        const id = card.dataset.id;
        const isP1 = csP1Selected && csP1Selected.id === id;
        const isP2 = csP2Selected && csP2Selected.id === id;
        if (isP1 && isP2) card.classList.add('sel-both');
        else if (isP1) card.classList.add('sel-p1');
        else if (isP2) card.classList.add('sel-p2');
        card.querySelectorAll('.cs-card-sel').forEach(b => b.remove());
        if (isP1) {
            const b = document.createElement('div');
            b.className = 'cs-card-sel';
            b.textContent = 'P1';
            b.style.cssText = 'background:rgba(255,60,20,0.8);color:white;';
            card.appendChild(b);
        }
        if (isP2) {
            const b = document.createElement('div');
            b.className = 'cs-card-sel';
            b.textContent = 'P2';
            b.style.cssText = 'background:rgba(40,80,255,0.8);color:white;right:auto;left:4px;';
            card.appendChild(b);
        }
    });
}

function csSelectChar(ch) {
    SFX.select();
    if (csSelectingP1) {
        csP1Selected = ch;
        csUpdatePreview('p1', ch);
        if (selectedMode === 'vs-ai') {
            const others = CHARACTERS.filter(c => c.id !== ch.id);
            csP2Selected = others[Math.floor(Math.random() * others.length)];
            csUpdatePreview('p2', csP2Selected);
            csUpdateCardHighlights();
            document.getElementById('cs-fight-btn').style.display = 'inline-block';
            document.getElementById('cs-turn-indicator').textContent = 'AI SELECTED!';
            document.getElementById('cs-turn-indicator').className = 'cs-select-turn p2';
            document.getElementById('cs-turn-label').textContent = 'READY TO FIGHT!';
        } else {
            csSelectingP1 = false;
            csUpdateCardHighlights();
            document.getElementById('cs-turn-indicator').className = 'cs-select-turn p2';
            document.getElementById('cs-turn-indicator').textContent = '▶ P2 SELECTING';
            document.getElementById('cs-turn-label').textContent = 'P2 — CLICK YOUR FIGHTER';
        }
    } else {
        csP2Selected = ch;
        csUpdatePreview('p2', ch);
        csSelectingP1 = true;
        csUpdateCardHighlights();
        document.getElementById('cs-fight-btn').style.display = 'inline-block';
        document.getElementById('cs-turn-indicator').textContent = 'READY TO FIGHT!';
        document.getElementById('cs-turn-label').textContent = 'BOTH FIGHTERS SELECTED';
    }
}

function openCS() {
    csP1Selected = null;
    csP2Selected = null;
    csSelectingP1 = true;
    document.getElementById('cs-p1-portrait').textContent = '?';
    document.getElementById('cs-p1-portrait').style.background = 'rgba(255,60,20,0.08)';
    document.getElementById('cs-p1-name').textContent = '— SELECT —';
    document.getElementById('cs-p1-name').style.color = '#888';
    document.getElementById('cs-p1-title').textContent = '';
    document.getElementById('cs-p1-stats').innerHTML = '';
    document.getElementById('cs-p1-desc').textContent = '';
    document.getElementById('cs-p2-portrait').textContent = '?';
    document.getElementById('cs-p2-portrait').style.background = 'rgba(40,80,255,0.08)';
    document.getElementById('cs-p2-name').textContent = '— SELECT —';
    document.getElementById('cs-p2-name').style.color = '#888';
    document.getElementById('cs-p2-title').textContent = '';
    document.getElementById('cs-p2-stats').innerHTML = '';
    document.getElementById('cs-p2-desc').textContent = '';
    document.getElementById('cs-fight-btn').style.display = 'none';
    document.getElementById('cs-turn-indicator').className = 'cs-select-turn p1';
    document.getElementById('cs-turn-indicator').textContent = '◀ P1 SELECTING';
    document.getElementById('cs-turn-label').textContent = 'P1 — CLICK YOUR FIGHTER';
    buildCSGrid();
    csDiv.classList.add('visible');
    state.csVisible = true;
}

function closeCS() {
    csDiv.classList.remove('visible');
    state.csVisible = false;
}

// ============================================================
// UI BUTTONS
// ============================================================
document.getElementById('cs-fight-btn').addEventListener('click', () => {
    if (!csP1Selected || !csP2Selected) return;
    SFX.fight();
    selectedP1Char = csP1Selected;
    selectedP2Char = csP2Selected;
    const n1 = document.getElementById('p1-name-input')?.value.trim() || customP1Name;
    const n2 = document.getElementById('p2-name-input')?.value.trim() || customP2Name;
    if (n1) customP1Name = n1.toUpperCase();
    if (n2) customP2Name = n2.toUpperCase();
    updateAllNameDisplays();
    closeCS();
    state.menuVisible = false;
    state.aiOn = (selectedMode === 'vs-ai');
    document.getElementById('ai-toggle').textContent = '🤖 AI: ' + (state.aiOn ? 'ON' : 'OFF');
    document.getElementById('ai-toggle').classList.toggle('on', state.aiOn);
    startRound(true);
});

document.getElementById('cs-back-btn').addEventListener('click', () => {
    closeCS();
    window.location.href = 'index.html';
});

document.getElementById('newbattle').addEventListener('click', () => { if (!state.menuVisible && !state.csVisible) startRound(true); });
document.getElementById('menu-btn').addEventListener('click', () => { window.location.href = 'index.html'; });
document.getElementById('ai-toggle').addEventListener('click', function () {
    state.aiOn = !state.aiOn;
    this.textContent = '🤖 AI: ' + (state.aiOn ? 'ON' : 'OFF');
    this.classList.toggle('on', state.aiOn);
    SFX.select();
});
document.getElementById('vol-btn').addEventListener('click', function () {
    sfxEnabled = !sfxEnabled;
    this.textContent = sfxEnabled ? '🔊 SFX' : '🔇 SFX';
    showVolIndicator(sfxEnabled ? '🔊 SFX ON' : '🔇 SFX OFF');
});

// ============================================================
// INIT
// ============================================================
updateAllNameDisplays();
openCS();
requestAnimationFrame(gameLoop);