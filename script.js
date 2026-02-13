/* ===== PIXEL LOVE QUEST ===== */

// Audio
let audioCtx = null;
function ac() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function tone(f, d, t, v) {
  const c = ac(), o = c.createOscillator(), g = c.createGain();
  o.type = t || 'square'; o.frequency.value = f;
  g.gain.setValueAtTime(v || .06, c.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, c.currentTime + d);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + d);
}
function sfxFind() { tone(523,.12,'square',.06); setTimeout(()=>tone(659,.12,'square',.06),100); setTimeout(()=>tone(784,.18,'square',.05),200); }
function sfxClick() { tone(440,.06,'square',.04); }
function sfxChime() { tone(1047,.1,'sine',.04); setTimeout(()=>tone(1319,.15,'sine',.04),80); }
function sfxSpecial() { [523,659,784,880,1047,1319].forEach((n,i)=>setTimeout(()=>tone(n,.25,'sine',.05),i*120)); }
function sfxWin() { [523,659,784,880,1047].forEach((n,i)=>setTimeout(()=>tone(n,.22,'square',.05),i*140)); }

// Flower phrases (random, no emojis)
const flowerPhrases = [
  'Te amo', 'Eres todo para mi', 'Me haces feliz',
  'Eres lo mas precioso que tengo', 'Te elijo siempre',
  'Amo cada momento contigo', 'Eres mi persona favorita',
  'Contigo todo es mejor', 'Te amo infinito',
  'Eres mi lugar seguro', 'Gracias por existir',
  'Amo tu sonrisa', 'Eres mi universo',
  'Te amo cada dia mas', 'Eres lo mejor de mi vida',
  'Amo despertar pensando en ti', 'Eres mi felicidad',
  'Te amo con todo', 'Eres mi mundo entero',
  'Contigo soy yo mismo', 'Amo verte sonreir',
  'Eres mi mejor aventura', 'Haces mis días mejores',
  'Amo tu forma de amar', 'Eres mi calma',
];

// State
let found = 0;
let valentineTriggered = false;
const foundSet = new Set();
const $ = id => document.getElementById(id);

// Count memories (excluding flowers — flowers are bonus)
function totalMemories() {
  return document.querySelectorAll('.clickable-memory').length;
}

function showScene(s) {
  document.querySelectorAll('.scene').forEach(sc => sc.classList.remove('active'));
  s.classList.add('active');
}

function particles(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'particle'; p.style.background = col;
    p.style.left = (x + (Math.random()-.5)*50) + 'px';
    p.style.top = (y + (Math.random()-.5)*30) + 'px';
    p.style.animationDuration = (1+Math.random()) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}

// Star popup ("Babi y Alex")
function showStarMsg(x, y) {
  const sp = $('star-popup');
  sp.classList.remove('hidden');
  sp.style.left = Math.min(x - 40, window.innerWidth - 120) + 'px';
  sp.style.top = (y - 20) + 'px';
  sp.style.animation = 'none'; sp.offsetHeight;
  sp.style.animation = 'smf 2s ease-out forwards';
  setTimeout(() => sp.classList.add('hidden'), 2100);
}

// Show popup with text
function showPopup(text) {
  $('popup-text').textContent = text;
  $('memory-popup').classList.remove('hidden');
}

// ========================
// CLICKABLE MEMORIES
// ========================
// Animals that pause on touch
const animalIds = new Set(['cat', 'pom', 'bunny']);
let pausedAnimal = null;

function setupMemories() {
  document.querySelectorAll('.clickable-memory').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();

      // Always count every click
      found++;
      $('hud-count').textContent = found;

      // Animals: pause while showing message
      if (animalIds.has(this.id)) {
        this.classList.add('paused');
        pausedAnimal = this;
      }

      const r = this.getBoundingClientRect();
      particles(r.left + r.width/2, r.top + r.height/2, '#CC2244', 12);

      if (this.dataset.special) {
        sfxSpecial();
        $('special-popup').classList.remove('hidden');
      } else {
        sfxFind();
        showPopup(this.dataset.msg);
      }

      if (found >= 14 && !valentineTriggered) setTimeout(triggerValentine, 600);
    });
  });
}

function resumeAnimal() {
  if (pausedAnimal) {
    pausedAnimal.classList.remove('paused');
    pausedAnimal = null;
  }
}

// Popup close
$('popup-close').addEventListener('click', () => {
  $('memory-popup').classList.add('hidden'); sfxClick();
  resumeAnimal();
  if (found >= totalMemories()) setTimeout(() => showScene($('final-screen')), 1200);
});
$('special-close').addEventListener('click', () => {
  $('special-popup').classList.add('hidden'); sfxClick();
  resumeAnimal();
  if (found >= totalMemories()) setTimeout(() => showScene($('final-screen')), 1200);
});

// ========================
// VALENTINE FINALE (at 14)
// ========================
function triggerValentine() {
  valentineTriggered = true;

  // Close any open popups first
  $('memory-popup').classList.add('hidden');
  $('special-popup').classList.add('hidden');
  $('star-popup').classList.add('hidden');

  sfxSpecial();
  const overlay = $('valentine-overlay');
  const heart = $('valentine-heart');
  const msg = $('valentine-msg');
  const sky = document.querySelector('.game-sky');

  overlay.classList.remove('hidden');

  // Phase 1: heart grows
  setTimeout(() => heart.classList.add('grow'), 100);

  // Phase 2: night to day
  setTimeout(() => sky.classList.add('to-day'), 1800);

  // Phase 3: heart becomes background, message appears
  setTimeout(() => {
    heart.classList.add('full');
    msg.classList.add('visible');
    sfxWin();
  }, 3500);
}

function triggerWin() {
  sfxWin();
  const sky = document.querySelector('.game-sky');
  sky.classList.add('complete');
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('div');
    s.className = 'extra-star';
    s.style.top = (5+Math.random()*50)+'%';
    s.style.left = (Math.random()*100)+'%';
    s.style.animationDelay = (Math.random()*2)+'s';
    sky.appendChild(s);
  }
}

// ========================
// TITLE
// ========================
function initTitle() {
  const bg = $('title-stars-bg');
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('div');
    s.className = 'title-bg-star';
    const sz = Math.random()>.7 ? 4 : 2;
    s.style.width = sz+'px'; s.style.height = sz+'px';
    s.style.top = (Math.random()*100)+'%'; s.style.left = (Math.random()*100)+'%';
    s.style.animationDelay = (Math.random()*4)+'s';
    s.style.animationDuration = (2+Math.random()*3)+'s';
    bg.appendChild(s);
  }
  const fl = $('title-floating');
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'title-float-item';
    el.textContent = i % 2 === 0 ? '\u2665' : '\u2726';
    el.style.color = ['#FFB7D5','#FFF1A8','#FFB7D5','#D8C6FF','#FFB38A','#FFF1A8','#FFB7D5'][i];
    el.style.top = (10+Math.random()*65)+'%';
    el.style.left = (5+Math.random()*85)+'%';
    el.style.fontSize = (10+Math.random()*12)+'px';
    el.style.animationDelay = (Math.random()*4)+'s';
    el.style.animationDuration = (5+Math.random()*4)+'s';
    fl.appendChild(el);
  }
}

// ========================
// SKY STARS (all -> "Babi y Alex")
// ========================
function initStars() {
  const c = $('sky-stars-container');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('div');
    s.className = 'sky-star' + (Math.random()>.55 ? ' big' : '');
    s.style.top = (2+Math.random()*88)+'%';
    s.style.left = (2+Math.random()*96)+'%';
    s.style.animationDelay = (Math.random()*5)+'s';
    s.style.animationDuration = (2+Math.random()*4)+'s';
    s.addEventListener('click', e => {
      if (s.classList.contains('clicked')) return;
      s.classList.add('clicked');
      sfxChime();
      showStarMsg(e.clientX, e.clientY);
      // Stars count toward the total
      found++;
      $('hud-count').textContent = found;
      if (found >= 14 && !valentineTriggered) triggerValentine();
      setTimeout(() => s.classList.remove('clicked'), 3500);
    });
    c.appendChild(s);
  }
}

// ========================
// FLOWERS (all touchable, mixed roses + tulips)
// ========================
function initFlowers() {
  const g = $('flower-garden');
  const pinkTulip = '#FFB7D5';
  const redRose = '#CC2244';
  const darkRose = '#AA1133';

  for (let row = 0; row < 5; row++) {
    const base = row * 16 + 2;
    const count = 9 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const x = 3 + (i / count) * 90 + (Math.random()-.5) * 4;
      const bot = base + Math.random() * 10;
      const isRose = Math.random() > .5;
      const sizes = [[14,18,3],[18,22,3],[22,26,4],[16,20,3]];
      const sz = sizes[Math.floor(Math.random()*sizes.length)];

      const el = document.createElement('div');
      el.className = 'garden-flower';
      el.style.left = x + '%';
      el.style.bottom = bot + '%';
      el.style.animationDelay = (Math.random()*3)+'s';

      if (isRose) {
        el.innerHTML = `<div class="fh rose" style="width:${sz[0]}px;height:${sz[0]}px;background:${Math.random()>.5?redRose:darkRose};position:relative"></div><div class="fs" style="width:${sz[2]}px;height:${sz[1]}px"></div>`;
      } else {
        el.innerHTML = `<div class="fh" style="width:${sz[0]}px;height:${sz[0]}px;background:${pinkTulip}"></div><div class="fs" style="width:${sz[2]}px;height:${sz[1]}px"></div>`;
      }

      // Each flower is clickable -> random phrase, always re-clickable, counts!
      el.addEventListener('click', function(e) {
        sfxChime();
        found++;
        $('hud-count').textContent = found;
        const phrase = flowerPhrases[Math.floor(Math.random() * flowerPhrases.length)];
        showPopup(phrase);
        const r = this.getBoundingClientRect();
        particles(r.left + r.width/2, r.top + r.height/2, isRose ? '#CC2244' : '#FFB7D5', 6);
        if (found >= 14 && !valentineTriggered) setTimeout(triggerValentine, 600);
      });

      g.appendChild(el);
    }
  }

  // Fireflies
  for (let i = 0; i < 15; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = (5+Math.random()*85)+'%';
    f.style.bottom = (10+Math.random()*70)+'%';
    f.style.animationDelay = (Math.random()*6)+'s';
    g.appendChild(f);
  }
}

// ========================
// CAT & DOG RANDOM WALKS
// ========================
function initAnimalWalks() {
  function randomWalk(el, minWait, maxWait) {
    function doWalk() {
      // Skip this cycle if paused (touched), retry soon
      if (el.classList.contains('paused')) {
        setTimeout(doWalk, 2000);
        return;
      }
      el.classList.add('walking');
      const walkDuration = el.id === 'cat' ? 10000 : 12000;
      setTimeout(() => {
        el.classList.remove('walking');
        const next = minWait + Math.random() * (maxWait - minWait);
        setTimeout(doWalk, next);
      }, walkDuration);
    }
    const firstWait = 3000 + Math.random() * 5000;
    setTimeout(doWalk, firstWait);
  }
  randomWalk($('cat'), 8000, 15000);
  randomWalk($('pom'), 6000, 12000);
}

// ========================
// FINAL STARS
// ========================
function initFinalStars() {
  const c = $('final-stars');
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('div');
    s.className = 'final-star';
    s.style.top = (Math.random()*85)+'%';
    s.style.left = (Math.random()*100)+'%';
    s.style.animationDelay = (Math.random()*3)+'s';
    s.style.animationDuration = (1.5+Math.random()*2)+'s';
    if (Math.random()>.5) { s.style.width='6px'; s.style.height='6px'; }
    c.appendChild(s);
  }
}

// ========================
// RESET
// ========================
function resetGame() {
  found = 0; foundSet.clear(); valentineTriggered = false;
  $('hud-count').textContent = '0';
  document.querySelectorAll('.found').forEach(el => el.classList.remove('found'));
  document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
  document.querySelectorAll('.touched').forEach(el => el.classList.remove('touched'));
  document.querySelectorAll('.walking').forEach(el => el.classList.remove('walking'));
  document.querySelectorAll('.paused').forEach(el => el.classList.remove('paused'));
  pausedAnimal = null;
  document.querySelector('.game-sky').classList.remove('complete');
  document.querySelector('.game-sky').classList.remove('to-day');
  document.querySelectorAll('.extra-star').forEach(s => s.remove());
  // Reset valentine overlay
  $('valentine-overlay').classList.add('hidden');
  $('valentine-heart').classList.remove('grow','full');
  $('valentine-msg').classList.remove('visible');
}

// ========================
// EVENTS
// ========================
$('btn-start').addEventListener('click', () => { sfxClick(); showScene($('game-screen')); });
$('btn-continue').addEventListener('click', () => { sfxClick(); resetGame(); showScene($('title-screen')); });

// ========================
// INIT
// ========================
initTitle();
initStars();
initFlowers();
initFinalStars();
setupMemories();
initAnimalWalks();
