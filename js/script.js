// ===== Boot Messages =====
const BOOT_MESSAGES = [
  { text: '$ ./init_hello_world.sh', cls: '' },
  { text: 'システム要件を確認中...', cls: '' },
  { text: '✓ HTML5 対応確認', cls: 'log-ok' },
  { text: '✓ CSS3 対応確認', cls: 'log-ok' },
  { text: '✓ Vanilla JS エンジン起動', cls: 'log-ok' },
  { text: 'フレームワークを検索中...', cls: '' },
  { text: '⚠ React: 未インストール（意図的）', cls: 'log-warn' },
  { text: '⚠ Vue: 未インストール（意図的）', cls: 'log-warn' },
  { text: '⚠ Tailwind: 未インストール（意図的）', cls: 'log-warn' },
  { text: 'パーティクルエンジンを初期化...', cls: '' },
  { text: '✓ Canvas 2D コンテキスト取得', cls: 'log-ok' },
  { text: '✓ 80パーティクル生成完了', cls: 'log-ok' },
  { text: 'グリッチモジュールをロード中...', cls: '' },
  { text: '✓ 5軸グリッチエフェクト 準備完了', cls: 'log-ok' },
  { text: 'Claudeとの壁打ち回数を確認...', cls: '' },
  { text: '✓ 203回の壁打ちを検出', cls: 'log-ok' },
  { text: '「HELLO WORLD」の起動準備完了', cls: '' },
];

// ===== Particle Class =====
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.respawn();
  }

  respawn() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.radius = Math.random() * 1.4 + 0.5;
    this.isOrange = Math.random() < 0.15;
    this.alpha = Math.random() * 0.45 + 0.25;
  }

  update(mx, my) {
    const dx = this.x - mx;
    const dy = this.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const REPEL = 120;

    if (dist < REPEL && dist > 0) {
      const force = (REPEL - dist) / REPEL;
      this.vx += (dx / dist) * force * 0.9;
      this.vy += (dy / dist) * force * 0.9;
    }

    this.vx *= 0.97;
    this.vy *= 0.97;
    this.x += this.vx;
    this.y += this.vy;

    // Wrap edges
    if (this.x < 0) this.x = this.canvas.width;
    else if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    else if (this.y > this.canvas.height) this.y = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isOrange
      ? `rgba(204,120,92,${this.alpha})`
      : `rgba(0,212,255,${this.alpha})`;
    ctx.fill();
  }
}

// ===== State =====
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let clickCount = 0;
let isGlitching = false;
let glitchTimer = null;
let particles = [];
let lastFpsTime = 0;
let frameCount = 0;
let konamiIdx = 0;

const KONAMI_CODE = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a'
];

const LANGUAGES = [
  'こんにちは世界', 'Bonjour le monde', 'Hola mundo',
  'Hallo Welt', '你好世界', 'Ciao mondo',
  'Olá Mundo', '안녕하세요 세계', 'Привет, мир',
];

const HINTS = [
  'クリックしてみて',
  'もう1回',
  'まだまだ',
  'そんなにクリックするの？',
  'あと1回だけ...',
  '5回目！グリッチが来るよ',
  '止まれないね',
  '10回で秘密が見える',
  'もうすぐだよ',
  'ラスト1回！',
  '多言語イースターエッグ発動',
  '↑↑↓↓←→←→BA も試してみて',
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ===== Loader Sequence =====
async function runLoader() {
  const log = document.getElementById('boot-log');
  const bar = document.getElementById('progress-bar');
  const loader = document.getElementById('loader');

  for (let i = 0; i < BOOT_MESSAGES.length; i++) {
    const span = document.createElement('span');
    span.className = 'log-line' + (BOOT_MESSAGES[i].cls ? ' ' + BOOT_MESSAGES[i].cls : '');
    span.textContent = BOOT_MESSAGES[i].text;
    log.appendChild(span);
    bar.style.width = `${((i + 1) / BOOT_MESSAGES.length) * 100}%`;
    await sleep(Math.random() * 90 + 45);
  }

  await sleep(350);
  loader.style.opacity = '0';
  await sleep(620);
  loader.style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  initApp();
}

// ===== App Init =====
function initApp() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Init particles
  particles = Array.from({ length: 80 }, () => new Particle(canvas));

  // Cursor tracking
  const cursorGlow = document.getElementById('cursor-glow');
  const cursorDot = document.getElementById('cursor-dot');

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.left = mouseX + 'px';
    cursorGlow.style.top = mouseY + 'px';
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    apply3DTilt(e.clientX, e.clientY);
  });

  document.addEventListener('mouseleave', () => {
    document.querySelector('.main-container').style.transform = '';
  });

  // Touch support for tilt & particles
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouseX = t.clientX;
    mouseY = t.clientY;
    apply3DTilt(t.clientX, t.clientY);
  }, { passive: true });

  // Type-in animation
  typeIn('HELLO WORLD', document.getElementById('hello-text'));

  // Periodic glitch
  scheduleGlitch();

  // Events
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);

  // Animation loop
  requestAnimationFrame(function loop(time) {
    if (lastFpsTime === 0) lastFpsTime = time;
    frameCount++;

    if (time - lastFpsTime >= 1000) {
      const fps = Math.round(frameCount * 1000 / (time - lastFpsTime));
      document.getElementById('fps-counter').textContent = fps + ' fps';
      frameCount = 0;
      lastFpsTime = time;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConstellations(ctx, particles);
    particles.forEach(p => { p.update(mouseX, mouseY); p.draw(ctx); });

    requestAnimationFrame(loop);
  });
}

// ===== Constellation Lines =====
function drawConstellations(ctx, pts) {
  const MAX = 130;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX) {
        const a = (1 - d / MAX) * 0.14;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${a})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// ===== Type-in =====
function typeIn(text, container) {
  container.innerHTML = '';
  let delay = 0;
  for (const ch of text) {
    if (ch === ' ') {
      const sp = document.createElement('span');
      sp.className = 'space';
      container.appendChild(sp);
    } else {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      container.appendChild(span);
      setTimeout(() => span.classList.add('visible'), delay);
      delay += 90;
    }
  }
}

// ===== Glitch =====
function triggerGlitch(duration) {
  if (isGlitching) return;
  isGlitching = true;
  const el = document.getElementById('hello-text');
  el.classList.remove('glitching');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('glitching');
  clearTimeout(glitchTimer);
  glitchTimer = setTimeout(() => {
    el.classList.remove('glitching');
    isGlitching = false;
  }, duration || 450);
}

function scheduleGlitch() {
  setTimeout(() => {
    triggerGlitch(450);
    scheduleGlitch();
  }, Math.random() * 5000 + 3000);
}

// ===== 3D Tilt =====
function apply3DTilt(cx, cy) {
  const container = document.querySelector('.main-container');
  const dx = (cx - window.innerWidth / 2) / (window.innerWidth / 2);
  const dy = (cy - window.innerHeight / 2) / (window.innerHeight / 2);
  container.style.transform =
    `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 9}deg)`;
}

// ===== Click Handler =====
function handleClick(e) {
  clickCount++;
  document.getElementById('click-counter').textContent = clickCount;

  createRipple(e.clientX, e.clientY, clickCount % 4 === 0 ? 'orange' : '');

  const idx = Math.min(clickCount, HINTS.length - 1);
  document.getElementById('hint').textContent = HINTS[idx];

  if (clickCount === 5) triggerGlitchStorm();
  if (clickCount === 10) showLanguageEasterEgg();
  if (clickCount > 10 && clickCount % 5 === 0) triggerGlitch(600);
}

function createRipple(x, y, extra) {
  const el = document.createElement('div');
  el.className = 'ripple' + (extra ? ' ' + extra : '');
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function triggerGlitchStorm() {
  let n = 0;
  const iv = setInterval(() => {
    isGlitching = false; // allow re-trigger in rapid succession
    triggerGlitch(300);
    if (++n >= 6) clearInterval(iv);
  }, 260);
}

async function showLanguageEasterEgg() {
  const overlay = document.getElementById('easter-egg');
  const flash = document.getElementById('lang-flash');
  overlay.classList.remove('hidden');

  for (const lang of LANGUAGES) {
    flash.textContent = lang;
    flash.style.animation = 'none';
    void flash.offsetWidth;
    flash.style.animation = 'langPop 0.35s ease-out';
    await sleep(520);
  }

  await sleep(300);
  overlay.classList.add('hidden');
}

// ===== Konami Code =====
function handleKeydown(e) {
  if (e.key === KONAMI_CODE[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI_CODE.length) {
      konamiIdx = 0;
      activateKonami();
    }
  } else {
    konamiIdx = 0;
    // Allow restarting from first key if it matches
    if (e.key === KONAMI_CODE[0]) konamiIdx = 1;
  }
}

function activateKonami() {
  // Particle explosion
  particles.forEach(p => {
    p.vx += (Math.random() - 0.5) * 10;
    p.vy += (Math.random() - 0.5) * 10;
    p.alpha = 0.9;
  });

  // Multi-glitch burst
  let n = 0;
  const iv = setInterval(() => {
    isGlitching = false;
    triggerGlitch(400);
    if (++n >= 10) clearInterval(iv);
  }, 180);

  document.getElementById('hint').textContent = '🎮 KONAMI CODE ACTIVATED';
  setTimeout(() => {
    document.getElementById('hint').textContent = '壁打ちは続く...';
  }, 3500);
}

// ===== Start =====
runLoader();
