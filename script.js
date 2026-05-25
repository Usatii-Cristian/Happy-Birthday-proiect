/* ================================================================
   script.js — Happy Birthday Dorin
   Handles: canvas particles, floating hearts, cake animation
            sequence, typing effect, replay, and Web Audio music.
   ================================================================ */

/* ================================================================
   1.  CANVAS PARTICLE SYSTEM
       Renders confetti rectangles + soft glow orbs on every frame.
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

/* Pastel pink / white / red palette */
const PALETTE = [
    '#ff8fab','#ffb3c6','#ff6b8a','#ffd6e0',
    '#ffffff','#ffccd5','#ff4d6d','#c9184a','#ffb3de',
];

class Particle {
    constructor(placeRandomly) { this.reset(placeRandomly); }

    reset(randomY = false) {
        this.x      = Math.random() * W;
        this.y      = randomY ? Math.random() * H : -14;
        this.vx     = (Math.random() - 0.5) * 0.75;
        this.vy     = Math.random() * 1.1 + 0.35;
        this.rot    = Math.random() * 360;
        this.rotV   = (Math.random() - 0.5) * 2.8;
        this.alpha  = Math.random() * 0.65 + 0.28;
        this.size   = Math.random() * 8 + 3;
        this.type   = Math.random() > 0.38 ? 'confetti' : 'orb';
        this.color  = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }

    update() {
        this.x   += this.vx;
        this.y   += this.vy;
        this.rot += this.rotV;
        if (this.y > H + 18) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);

        if (this.type === 'confetti') {
            /* Rotating flat rectangle */
            ctx.rotate((this.rot * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size * 0.5, -this.size * 0.25,
                          this.size,        this.size * 0.5);
        } else {
            /* Radial glow orb */
            const r    = this.size * 2.6;
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
            grad.addColorStop(0,    this.color + 'cc');
            grad.addColorStop(0.45, this.color + '44');
            grad.addColorStop(1,    'transparent');
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.restore();
    }
}

/* Pre-fill some particles so screen isn't empty on load */
const TOTAL_PARTICLES = 80;
const particles = Array.from(
    { length: TOTAL_PARTICLES },
    (_, i) => new Particle(i < TOTAL_PARTICLES * 0.6)
);

/* Main draw loop */
(function drawLoop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(drawLoop);
})();

/* ================================================================
   2.  FLOATING HEARTS
       Spawned periodically as <span> elements with CSS animation.
   ================================================================ */
const heartsWrap  = document.getElementById('heartsWrap');
const HEART_EMOJIS = ['💕','💗','💖','💝','🩷','❤️','🌸','✨'];

function spawnHeart() {
    const span = document.createElement('span');
    span.className   = 'heart';
    span.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
    span.style.left  = (Math.random() * 93 + 2) + '%';
    const dur   = (Math.random() * 3 + 3.5).toFixed(1);
    const delay = (Math.random() * 1.8).toFixed(1);
    span.style.setProperty('--dur',   dur + 's');
    span.style.setProperty('--delay', delay + 's');
    span.style.fontSize = (Math.random() * 1.3 + 0.75).toFixed(1) + 'rem';
    heartsWrap.appendChild(span);
    /* Auto-remove after animation completes */
    setTimeout(() => span.remove(), (parseFloat(dur) + parseFloat(delay) + 0.6) * 1000);
}

/* Stagger initial hearts and keep spawning */
setTimeout(spawnHeart, 400);
setTimeout(spawnHeart, 1200);
setInterval(spawnHeart, 2800);

/* ================================================================
   3.  CAKE ANIMATION SEQUENCE
       JS only adds/removes CSS classes — all motion is in CSS.
   ================================================================ */
let animTimers = [];

/* Trigger drop animation on a cake part */
function dropPart(id) {
    document.getElementById(id).classList.add('do-drop');
}

/* Trigger drop animation on an individual candle */
function dropCandle(id) {
    document.getElementById(id).classList.add('do-candle');
}

/* Light up a flame: show flame-box + add glow to candle wax */
function lightFlame(candleId, flameId) {
    document.getElementById(flameId).classList.add('lit');
    document.getElementById(candleId).classList.add('lit');
}

/* Fade in the birthday message section */
function showMessage() {
    document.getElementById('bday').classList.add('show');
}

/* Typing animation — writes the subtitle character by character */
function startTyping() {
    const TEXT = 'May your day be filled with happiness, love\nand unforgettable moments ✨';
    const el   = document.getElementById('bdaySub');
    let i = 0;
    el.textContent = '';

    const iv = setInterval(() => {
        if (i < TEXT.length) {
            el.textContent += TEXT[i++];
        } else {
            clearInterval(iv);
            el.classList.add('typed'); /* remove blinking cursor */
        }
    }, 38); /* ms per character — adjust for speed */
}

/* Full animation timeline */
function startAnimation() {
    const steps = [
        [  600, () => dropPart('plate')],
        [ 1500, () => dropPart('tierBot')],
        [ 2400, () => dropPart('creamMid')],
        [ 3200, () => dropPart('tierTop')],
        [ 4100, () => dropPart('creamTop')],
        /* Candles fall one by one */
        [ 4900, () => dropCandle('c1')],
        [ 5340, () => dropCandle('c2')],
        [ 5780, () => dropCandle('c3')],
        [ 6220, () => dropCandle('c4')],
        [ 6660, () => dropCandle('c5')],
        /* Flames light in sequence */
        [ 7150, () => lightFlame('c1', 'f1')],
        [ 7380, () => lightFlame('c2', 'f2')],
        [ 7610, () => lightFlame('c3', 'f3')],
        [ 7840, () => lightFlame('c4', 'f4')],
        [ 8100, () => lightFlame('c5', 'f5')], /* last flame — extra glow in CSS */
        /* Birthday message */
        [ 8950, showMessage],
        [ 9900, startTyping],
    ];

    steps.forEach(([ms, fn]) => {
        animTimers.push(setTimeout(fn, ms));
    });
}

/* ================================================================
   4.  REPLAY
       Cancels pending timers, resets all elements, restarts.
   ================================================================ */
function replayAnim() {
    /* Cancel every queued step */
    animTimers.forEach(clearTimeout);
    animTimers = [];

    /* Reset cake parts — removing the class returns them to their
       CSS default state (opacity:0, translateY(-620px)).
       void el.offsetWidth forces a style recalculation so the
       animation restarts cleanly when the class is re-added.    */
    ['plate','tierBot','creamMid','tierTop','creamTop'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('do-drop');
        void el.offsetWidth;
    });

    /* Reset candles */
    for (let i = 1; i <= 5; i++) {
        const candle = document.getElementById('c' + i);
        const flame  = document.getElementById('f' + i);
        candle.classList.remove('do-candle', 'lit');
        flame.classList.remove('lit');
        void candle.offsetWidth;
    }

    /* Reset birthday message and typing */
    document.getElementById('bday').classList.remove('show');
    const sub = document.getElementById('bdaySub');
    sub.textContent = '';
    sub.classList.remove('typed');

    /* Restart the full sequence */
    startAnimation();
}

/* ================================================================
   5.  BACKGROUND MUSIC  (Web Audio API)
       Plays the Happy Birthday melody using oscillators.
       Uses 'triangle' wave for a soft, music-box quality.
       AudioContext is created only after user interaction (click)
       to comply with browser autoplay policy.
   ================================================================ */
let audioCtx   = null;
let musicOn    = false;
let musicNodes = [];   /* tracks live oscillators so we can stop them */
let musicTimer = null; /* setTimeout handle for melody loop */

/* Note frequencies (Hz) */
const F = {
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25,
    F5: 698.46, G5: 783.99,
};

/* Happy Birthday — [frequency, duration_in_beats] */
const MELODY = [
    /* "Happy Birthday to you" */
    [F.G4,0.75],[F.G4,0.25],[F.A4,1],[F.G4,1],[F.C5,1],[F.B4,2],
    /* "Happy Birthday to you" */
    [F.G4,0.75],[F.G4,0.25],[F.A4,1],[F.G4,1],[F.D5,1],[F.C5,2],
    /* "Happy Birthday dear Dorin" */
    [F.G4,0.75],[F.G4,0.25],[F.G5,1],[F.E5,1],[F.C5,1],[F.B4,1],[F.A4,2],
    /* "Happy Birthday to you" */
    [F.F5,0.75],[F.F5,0.25],[F.E5,1],[F.C5,1],[F.D5,1],[F.C5,2.5],
];

const BPM     = 88;
const BEAT_S  = 60 / BPM;
const TOTAL_S = MELODY.reduce((sum, [, b]) => sum + b * BEAT_S, 0);

function playMelody() {
    if (!musicOn || !audioCtx) return;

    /* Master gain for the whole melody pass */
    const master = audioCtx.createGain();
    master.gain.value = 0.88;
    master.connect(audioCtx.destination);

    let t = audioCtx.currentTime + 0.05;

    MELODY.forEach(([freq, beats]) => {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();

        osc.type = 'triangle'; /* soft music-box tone */
        osc.frequency.value = freq;

        /* Simple ADSR envelope per note */
        const dur = beats * BEAT_S;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.20, t + 0.025);       /* attack  */
        env.gain.setValueAtTime(0.16, t + dur * 0.65);           /* sustain */
        env.gain.linearRampToValueAtTime(0, t + dur);            /* release */

        osc.connect(env);
        env.connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.06);
        musicNodes.push(osc);

        t += dur;
    });

    /* Schedule next loop slightly before this one ends (seamless) */
    musicTimer = setTimeout(playMelody, (TOTAL_S - 0.15) * 1000);
}

function toggleMusic() {
    const btn = document.getElementById('musicBtn');

    /* Create AudioContext on first user gesture (browser policy) */
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    musicOn = !musicOn;

    if (musicOn) {
        btn.textContent = '🔇 Music';
        btn.classList.add('music-on');
        playMelody();
    } else {
        btn.textContent = '🎵 Music';
        btn.classList.remove('music-on');
        /* Cancel loop and stop all active oscillators */
        clearTimeout(musicTimer);
        musicNodes.forEach(n => { try { n.stop(0); } catch (e) { /* already stopped */ } });
        musicNodes = [];
    }
}

/* ================================================================
   6.  INIT — start animation automatically on page load
   ================================================================ */
window.addEventListener('load', startAnimation);
