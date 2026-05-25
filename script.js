/* ================================================================
   script.js — La Mulți Ani Dorin
   Canvas stars, floating SVG icons, cinematic cake animation,
   candle flash effect, word-by-word title reveal, music.
   ================================================================ */

/* ================================================================
   1.  CANVAS PARTICLE SYSTEM — stars + glow orbs
   ================================================================ */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PALETTE = [
    '#d4a843','#f0c866','#ffffff','#c8d8e8',
    '#5a9fd4','#2a6aaa','#fef7e0','#90b8d8','#e8c060',
];

/* Draw a 5-pointed star at origin with outer radius r */
function drawStar(cx, r) {
    const pts = 5;
    const inner = r * 0.42;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
        const angle  = (i * Math.PI / pts) - Math.PI / 2;
        const radius = i % 2 === 0 ? r : inner;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

/* Draw a 4-pointed diamond at origin */
function drawDiamond(r) {
    const w = r * 0.55;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(w, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-w, 0);
    ctx.closePath();
    ctx.fill();
}

class Particle {
    constructor(placeRandomly) { this.reset(placeRandomly); }

    reset(randomY = false) {
        this.x     = Math.random() * W;
        this.y     = randomY ? Math.random() * H : -16;
        this.vx    = (Math.random() - 0.5) * 0.65;
        this.vy    = Math.random() * 1.0 + 0.3;
        this.rot   = Math.random() * 360;
        this.rotV  = (Math.random() - 0.5) * 2.5;
        this.alpha = Math.random() * 0.6 + 0.25;
        this.size  = Math.random() * 7 + 2.5;
        /* 3 types: star, diamond, orb */
        const r    = Math.random();
        this.type  = r > 0.65 ? 'star' : r > 0.35 ? 'diamond' : 'orb';
        this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }

    update() {
        /* Slight sinusoidal horizontal drift */
        this.x   += this.vx + Math.sin(this.y * 0.018 + this.rot * 0.04) * 0.25;
        this.y   += this.vy;
        this.rot += this.rotV;
        if (this.y > H + 20) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;

        if (this.type === 'star') {
            ctx.rotate((this.rot * Math.PI) / 180);
            drawStar(0, this.size);
        } else if (this.type === 'diamond') {
            ctx.rotate((this.rot * Math.PI) / 180);
            drawDiamond(this.size);
        } else {
            /* Radial glow orb */
            const r    = this.size * 2.8;
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
            grad.addColorStop(0,    this.color + 'cc');
            grad.addColorStop(0.4,  this.color + '44');
            grad.addColorStop(1,    'transparent');
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.restore();
    }
}

const TOTAL_PARTICLES = 90;
const particles = Array.from(
    { length: TOTAL_PARTICLES },
    (_, i) => new Particle(i < TOTAL_PARTICLES * 0.65)
);

(function drawLoop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(drawLoop);
})();

/* ================================================================
   2.  FLOATING SVG ICONS (instead of emoji)
   ================================================================ */
const heartsWrap = document.getElementById('heartsWrap');

/* Inline SVG shapes for floating icons */
const FLOAT_SVGS = [
    /* 5-pointed star */
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`,
    /* 4-pointed sparkle */
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
    </svg>`,
    /* Diamond/gem */
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 2 L22 9 L12 22 L2 9 Z"/>
    </svg>`,
    /* Circle dot */
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <circle cx="12" cy="12" r="8"/>
    </svg>`,
    /* Crescent moon */
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,
];

const FLOAT_COLORS = [
    '#d4a843', '#f0c866', '#5a9fd4', '#90b8d8',
    '#ffffff',  '#c8d8e8', '#e8c060', '#7ab8e0',
];

function spawnHeart() {
    const span = document.createElement('span');
    span.className = 'heart';
    const svg   = FLOAT_SVGS[Math.floor(Math.random() * FLOAT_SVGS.length)];
    const color = FLOAT_COLORS[Math.floor(Math.random() * FLOAT_COLORS.length)];
    const size  = (Math.random() * 18 + 10).toFixed(0);
    span.innerHTML = svg;
    span.style.color  = color;
    span.style.width  = size + 'px';
    span.style.height = size + 'px';
    span.style.display = 'block';
    span.style.filter = `drop-shadow(0 0 4px ${color}99)`;
    span.style.left   = (Math.random() * 93 + 2) + '%';
    const dur   = (Math.random() * 3.5 + 4).toFixed(1);
    const delay = (Math.random() * 2).toFixed(1);
    span.style.setProperty('--dur',   dur + 's');
    span.style.setProperty('--delay', delay + 's');
    heartsWrap.appendChild(span);
    setTimeout(() => span.remove(), (parseFloat(dur) + parseFloat(delay) + 0.6) * 1000);
}

setTimeout(spawnHeart, 300);
setTimeout(spawnHeart, 900);
setTimeout(spawnHeart, 1600);
setInterval(spawnHeart, 2400);

/* ================================================================
   3.  TITLE WORD + LETTER WRAP
       Splits "La Mulți Ani," into .word spans and "Dorin!" into
       .letter-name spans so CSS can animate them with stagger.
   ================================================================ */
function setupTitle() {
    const title = document.getElementById('bdayTitle');
    const em    = title.querySelector('em');

    /* Top line words */
    const words = ['La ', 'Mulți ', 'Ani,'];
    title.innerHTML = '';
    words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.animationDelay = `${i * 130}ms`;
        title.appendChild(span);
    });

    title.appendChild(document.createElement('br'));

    /* "Dorin!" letter by letter */
    const nameChars = [...'Dorin!'];
    nameChars.forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'letter-name';
        span.textContent = char;
        span.style.animationDelay = `${words.length * 130 + i * 65}ms`;
        em.innerHTML = '';
        em.appendChild(span);
    });
    /* Rebuild em with all letters */
    em.innerHTML = '';
    nameChars.forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'letter-name';
        span.textContent = char;
        span.style.animationDelay = `${words.length * 130 + i * 65}ms`;
        em.appendChild(span);
    });
    title.appendChild(em);
}

/* ================================================================
   4.  CAKE ANIMATION SEQUENCE
   ================================================================ */
let animTimers = [];

function dropPart(id)   { document.getElementById(id).classList.add('do-drop'); }
function dropCandle(id) { document.getElementById(id).classList.add('do-candle'); }
function showMessage()  { document.getElementById('bday').classList.add('show'); }

/* Flash the golden overlay when a candle is lit */
function triggerFlash() {
    const flash = document.getElementById('candleFlash');
    flash.classList.remove('flashing');
    void flash.offsetWidth;
    flash.classList.add('flashing');
}

function lightFlame(candleId, flameId) {
    document.getElementById(flameId).classList.add('lit');
    document.getElementById(candleId).classList.add('lit');
    triggerFlash();
}

function startTyping() {
    const TEXT = 'Multă sănătate, fericire și succes!\nLa mulți ani din suflet, Dorin!';
    const el   = document.getElementById('bdaySub');
    let i = 0;
    el.textContent = '';

    const iv = setInterval(() => {
        if (i < TEXT.length) {
            el.textContent += TEXT[i++];
        } else {
            clearInterval(iv);
            el.classList.add('typed');
        }
    }, 42);
}

function startAnimation() {
    const steps = [
        [  600, () => dropPart('plate')],
        [ 1500, () => dropPart('tierBot')],
        [ 2500, () => dropPart('creamMid')],
        [ 3400, () => dropPart('tierTop')],
        [ 4300, () => dropPart('creamTop')],
        [ 5000, () => dropPart('berryGroup')],
        /* Candles */
        [ 5600, () => dropCandle('c1')],
        [ 6060, () => dropCandle('c2')],
        [ 6520, () => dropCandle('c3')],
        [ 6980, () => dropCandle('c4')],
        [ 7440, () => dropCandle('c5')],
        /* Flames (with flash) */
        [ 7950, () => lightFlame('c1', 'f1')],
        [ 8180, () => lightFlame('c2', 'f2')],
        [ 8410, () => lightFlame('c3', 'f3')],
        [ 8640, () => lightFlame('c4', 'f4')],
        [ 8900, () => lightFlame('c5', 'f5')],
        /* Assembled float + pulse ring */
        [ 9300, () => document.getElementById('stage').classList.add('assembled')],
        /* Birthday message (words animate in) */
        [ 9900, showMessage],
        [10900, startTyping],
    ];
    steps.forEach(([ms, fn]) => animTimers.push(setTimeout(fn, ms)));
}

/* ================================================================
   5.  REPLAY
   ================================================================ */
function replayAnim() {
    animTimers.forEach(clearTimeout);
    animTimers = [];

    document.getElementById('stage').classList.remove('assembled');
    document.getElementById('candleFlash').classList.remove('flashing');

    ['plate','tierBot','creamMid','tierTop','creamTop','berryGroup'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('do-drop');
        void el.offsetWidth;
    });

    for (let i = 1; i <= 5; i++) {
        const candle = document.getElementById('c' + i);
        const flame  = document.getElementById('f' + i);
        candle.classList.remove('do-candle', 'lit');
        flame.classList.remove('lit');
        void candle.offsetWidth;
    }

    const bday = document.getElementById('bday');
    bday.classList.remove('show');
    const sub = document.getElementById('bdaySub');
    sub.textContent = '';
    sub.classList.remove('typed');

    /* Re-init title spans so stagger restarts */
    setupTitle();

    startAnimation();
}

/* ================================================================
   6.  BACKGROUND MUSIC
   ================================================================ */
let audioCtx   = null;
let musicOn    = false;
let musicNodes = [];
let musicTimer = null;

const F = {
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25,
    F5: 698.46, G5: 783.99,
};

const MELODY = [
    [F.G4,0.75],[F.G4,0.25],[F.A4,1],[F.G4,1],[F.C5,1],[F.B4,2],
    [F.G4,0.75],[F.G4,0.25],[F.A4,1],[F.G4,1],[F.D5,1],[F.C5,2],
    [F.G4,0.75],[F.G4,0.25],[F.G5,1],[F.E5,1],[F.C5,1],[F.B4,1],[F.A4,2],
    [F.F5,0.75],[F.F5,0.25],[F.E5,1],[F.C5,1],[F.D5,1],[F.C5,2.5],
];

const BPM     = 88;
const BEAT_S  = 60 / BPM;
const TOTAL_S = MELODY.reduce((sum, [, b]) => sum + b * BEAT_S, 0);

function playMelody() {
    if (!musicOn || !audioCtx) return;
    const master = audioCtx.createGain();
    master.gain.value = 0.85;
    master.connect(audioCtx.destination);
    let t = audioCtx.currentTime + 0.05;
    MELODY.forEach(([freq, beats]) => {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const dur = beats * BEAT_S;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.20, t + 0.025);
        env.gain.setValueAtTime(0.16, t + dur * 0.65);
        env.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(env);
        env.connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.06);
        musicNodes.push(osc);
        t += dur;
    });
    musicTimer = setTimeout(playMelody, (TOTAL_S - 0.15) * 1000);
}

function toggleMusic() {
    const btn = document.getElementById('musicBtn');
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicOn = !musicOn;
    if (musicOn) {
        btn.innerHTML = '<i class="fas fa-volume-xmark"></i> Muzică';
        btn.classList.add('music-on');
        playMelody();
    } else {
        btn.innerHTML = '<i class="fas fa-music"></i> Muzică';
        btn.classList.remove('music-on');
        clearTimeout(musicTimer);
        musicNodes.forEach(n => { try { n.stop(0); } catch (e) {} });
        musicNodes = [];
    }
}

/* ================================================================
   7.  INIT
   ================================================================ */
window.addEventListener('load', () => {
    setupTitle();
    startAnimation();
});
