/*
 * FOR SUPRIYA — Birthday experience
 * Quick edits:
 *   1. Change UNLOCK_AT to the real date/time (ISO 8601 with +05:30 for IST).
 *   2. Add assets/audio/birthday-song.mp3.
 *   3. Add your photos as assets/photos/memory-01.jpg through memory-12.jpg.
 *   4. Replace LETTER_TEXT and LETTER_SIGNOFF with your own words.
 */
'use strict';

const CONFIG = {
  // Demo deadline requested: 12 October 2026, 11:30 PM India Standard Time.
  // Format: YYYY-MM-DDTHH:mm:ss+05:30 (do not remove the timezone offset).
  UNLOCK_AT: '2026-10-12T11:30:00+05:30',
  SONG_PATH: 'assets/audio/birthday-song.mp3',
  PHOTO_PATH: 'assets/photos/memory-',
  PHOTO_EXTENSION: '.jpg',
  PHOTO_COUNT: 12,
  PHOTO_REVEAL_STAGGER_MS: 310,
  PHOTO_REVEAL_DURATION_MS: 900,
  LETTER_TYPING_SPEED_MS: 28,
  FINAL_SCENE_DELAY_MS: 5000,
};

// A temporary starter message so the whole journey can be previewed before your letter is ready.
// Replace this text later; line breaks are preserved by the typewriter.
const LETTER_TEXT = `On your birthday, I hope you get to see even a little of what makes you so special. You have a way of making ordinary moments feel warmer, and your smile can make a difficult day feel lighter.\n\nI hope this new chapter brings you the kind of happiness that stays, the kind of peace that feels like home, and a thousand little reasons to smile. Never forget how precious you are, how much you deserve, and how beautifully you make this world your own.\n\nToday is all about you, Supriya. Make your wishes boldly, laugh a little louder, and let yourself be celebrated the way you deserve. If this little corner of the internet can make you smile, then it has done exactly what I dreamed it would.\n\nHappy birthday, beautiful. ♡`;
const LETTER_SIGNOFF = 'With all my love,';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const unlockDate = new Date(CONFIG.UNLOCK_AT);
const scenes = {
  countdown: $('#countdownScene'),
  cake: $('#cakeScene'),
  memories: $('#memoriesScene'),
  envelope: $('#envelopeScene'),
  letter: $('#letterScene'),
  finale: $('#finaleScene'),
};
const audio = $('#backgroundMusic');
const soundButton = $('#soundButton');
const soundLabel = $('#soundLabel');
const soundCurtain = $('#soundCurtain');
const toast = $('#toast');
let currentScene = 'countdown';
let toastTimer = null;
let countdownTimer = null;
let cakeAutoAdvanceTimer = null;
let memoriesAutoAdvanceTimer = null;
let letterTimer = null;
let finaleTimer = null;
let audioStarted = false;
let userChoseSilent = false;
let photoSequenceStarted = false;
let letterStarted = false;
let toastMessageBeforeSoundGate = '';

function showToast(message, duration = 4200) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

function formatCountdown(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown() {
  const msLeft = unlockDate.getTime() - Date.now();
  if (msLeft <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id => { $('#' + id).textContent = '00'; });
    clearInterval(countdownTimer);
    beginBirthday();
    return;
  }
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  $('#days').textContent = formatCountdown(days);
  $('#hours').textContent = formatCountdown(hours);
  $('#minutes').textContent = formatCountdown(minutes);
  $('#seconds').textContent = formatCountdown(seconds);
}

function goToScene(name) {
  if (!scenes[name] || currentScene === name) return;
  const previous = scenes[currentScene];
  const next = scenes[name];
  if (previous) {
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    previous.setAttribute('aria-hidden', 'true');
    setTimeout(() => previous.classList.remove('is-leaving'), 550);
  }
  currentScene = name;
  next.classList.add('is-active');
  next.setAttribute('aria-hidden', 'false');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (name === 'memories') startMemorySequence();
  if (name === 'letter') startLetterTyping();
  if (name === 'finale') burstConfetti(65);
}

function beginBirthday() {
  if (currentScene !== 'countdown') return;
  clearInterval(countdownTimer);
  goToScene('cake');
  startMusicWhenAllowed();
  burstConfetti(50);
}

function startMusicWhenAllowed() {
  if (audioStarted || userChoseSilent) return;
  // Browsers may block audible autoplay. Attempt it at the unlock point, then offer a clear tap-to-play fallback.
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.then(() => {
      audioStarted = true;
      soundLabel.textContent = 'Music on';
      soundButton.setAttribute('aria-label', 'Pause birthday music');
      soundButton.classList.add('is-playing');
      soundCurtain.hidden = true;
    }).catch(() => {
      soundCurtain.hidden = false;
    });
  }
}

async function manuallyStartMusic() {
  userChoseSilent = false;
  try {
    await audio.play();
    audioStarted = true;
    soundLabel.textContent = 'Music on';
    soundButton.setAttribute('aria-label', 'Pause birthday music');
    soundButton.classList.add('is-playing');
    soundCurtain.hidden = true;
    if (toastMessageBeforeSoundGate) {
      showToast(toastMessageBeforeSoundGate);
      toastMessageBeforeSoundGate = '';
    }
  } catch (error) {
    soundCurtain.hidden = true;
    showToast('Add your song at assets/audio/birthday-song.mp3, then reload the site.');
  }
}

function toggleMusic() {
  if (audioStarted && !audio.paused) {
    audio.pause();
    soundLabel.textContent = 'Music off';
    soundButton.setAttribute('aria-label', 'Play birthday music');
    soundButton.classList.remove('is-playing');
    return;
  }
  if (audioStarted && audio.paused) {
    manuallyStartMusic();
    return;
  }
  if (Date.now() < unlockDate.getTime() && currentScene === 'countdown') {
    showToast('The soundtrack starts when the birthday surprise unlocks.');
    return;
  }
  manuallyStartMusic();
}

function burstConfetti(count = 45) {
  const layer = $('#confettiLayer');
  const colors = ['#ffc4dc', '#f8dca4', '#fff4fb', '#d6c6ff', '#ff88b8', '#bba5ea'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--confetti-x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--confetti-w', `${4 + Math.random() * 6}px`);
    piece.style.setProperty('--confetti-h', `${7 + Math.random() * 9}px`);
    piece.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--confetti-time', `${3.3 + Math.random() * 3.3}s`);
    piece.style.setProperty('--confetti-delay', `${Math.random() * .85}s`);
    piece.style.setProperty('--confetti-drift', `${-100 + Math.random() * 200}px`);
    piece.style.setProperty('--confetti-rotate', `${Math.random() * 1080 - 540}deg`);
    layer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
  // Safety cleanup in case the animationend event is skipped by a browser.
  setTimeout(() => {
    while (layer.children.length > 180) layer.firstElementChild.remove();
  }, 7000);
}

function lightCandles() {
  const cake = $('#birthdayCake');
  if (cake.classList.contains('is-lit')) return;
  cake.classList.add('is-lit');
  $('#cakeStage').classList.add('candles-lit');
  $('#cutCakeButton').disabled = false;
  $('#lightCandlesButton').disabled = true;
  $('#cakeInstruction').textContent = 'Now close your eyes, make a wish… and cut your cake. ♡';
  burstConfetti(18);
}

function cutCake() {
  const cake = $('#birthdayCake');
  if (!cake.classList.contains('is-lit') || cake.classList.contains('is-cut')) return;
  cake.classList.add('is-cut');
  $('#lightCandlesButton').hidden = true;
  $('#cutCakeButton').hidden = true;
  $('#cakeInstruction').hidden = true;
  $('#cakeWish').classList.add('is-visible');
  burstConfetti(95);
  cakeAutoAdvanceTimer = setTimeout(() => goToScene('memories'), 7800);
}

const photoPositionsWide = [
  { x: 6, y: 23, r: -10 }, { x: 24, y: 54, r: 7 }, { x: 43, y: 22, r: -5 },
  { x: 66, y: 26, r: 8 }, { x: 82, y: 55, r: -8 }, { x: 8, y: 62, r: 6 },
  { x: 29, y: 28, r: 9 }, { x: 48, y: 58, r: -8 }, { x: 69, y: 57, r: 5 },
  { x: 87, y: 23, r: -5 }, { x: 36, y: 64, r: 6 }, { x: 57, y: 20, r: -7 },
];
const photoPositionsNarrow = [
  { x: 3, y: 24, r: -9 }, { x: 61, y: 25, r: 7 }, { x: 26, y: 36, r: -5 },
  { x: 59, y: 48, r: 8 }, { x: 5, y: 53, r: -7 }, { x: 34, y: 62, r: 6 },
  { x: 54, y: 68, r: -5 }, { x: 15, y: 68, r: 7 }, { x: 63, y: 36, r: -8 },
  { x: 7, y: 37, r: 5 }, { x: 38, y: 24, r: -6 }, { x: 35, y: 49, r: 7 },
];
const photoCaptions = ['a little happiness', 'one for the heart', 'this kind of day', 'my favourite people', 'a moment to keep', 'you, being you', 'the good old days', 'a lovely memory', 'the softest smiles', 'wish we could pause time', 'our little story', 'always worth remembering'];

function createMemoryCard(index, position) {
  const card = document.createElement('div');
  card.className = 'memory-photo';
  card.style.setProperty('--x', `${position.x}%`);
  // Keep the first row below the heading so the memory title remains readable on phones and laptops.
  card.style.setProperty('--y', `${Math.max(position.y, 29)}%`);
  card.style.setProperty('--rot', `${position.r + (Math.random() * 3 - 1.5)}deg`);
  card.style.setProperty('--delay', `${index * CONFIG.PHOTO_REVEAL_STAGGER_MS}ms`);
  card.style.zIndex = String(3 + (index % 5));
  card.setAttribute('aria-label', `Memory ${index + 1}`);
  const image = document.createElement('img');
  const fileNumber = String(index + 1).padStart(2, '0');
  image.alt = `Memory photo ${index + 1}`;
  image.loading = 'eager';
  image.addEventListener('error', () => {
    if (!card.isConnected || card.dataset.fallbackAdded) return;
    card.dataset.fallbackAdded = 'true';
    image.remove();
    const placeholder = document.createElement('div');
    placeholder.className = 'memory-placeholder';
    const heart = document.createElement('span');
    heart.className = 'placeholder-heart';
    heart.textContent = ['♡', '✦', '❀', '♥'][index % 4];
    const label = document.createElement('span');
    label.className = 'placeholder-label';
    label.textContent = `Memory ${fileNumber}`;
    placeholder.append(heart, label);
    card.prepend(placeholder);
  }, { once: true });
  const caption = document.createElement('span');
  caption.className = 'memory-caption';
  caption.textContent = photoCaptions[index % photoCaptions.length];
  card.append(image, caption);
  image.src = `${CONFIG.PHOTO_PATH}${fileNumber}${CONFIG.PHOTO_EXTENSION}`;
  return card;
}

function startMemorySequence() {
  if (photoSequenceStarted) return;
  photoSequenceStarted = true;
  const canvas = $('#memoryCanvas');
  const isNarrow = window.matchMedia('(max-width: 760px)').matches;
  const positions = [...(isNarrow ? photoPositionsNarrow : photoPositionsWide)];
  // Shuffle frame destinations so every visit feels a little like memories drifting into place.
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  for (let i = 0; i < CONFIG.PHOTO_COUNT; i++) {
    const card = createMemoryCard(i, positions[i % positions.length]);
    canvas.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-visible')));
  }
  burstConfetti(28);
  const allPhotosPoppedAt = (CONFIG.PHOTO_COUNT - 1) * CONFIG.PHOTO_REVEAL_STAGGER_MS + CONFIG.PHOTO_REVEAL_DURATION_MS;
  memoriesAutoAdvanceTimer = setTimeout(() => goToScene('envelope'), allPhotosPoppedAt + 3000);
}

function openEnvelope() {
  if ($('#letterEnvelope').classList.contains('is-opening')) return;
  $('#letterEnvelope').classList.add('is-opening');
  $('#openLetterButton').disabled = true;
  setTimeout(() => goToScene('letter'), 850);
}

function startLetterTyping() {
  if (letterStarted) return;
  letterStarted = true;
  const output = $('#typedLetter');
  const cursor = $('#typingCursor');
  const signoff = $('#letterSignoff');
  let index = 0;
  output.textContent = '';
  signoff.classList.remove('is-visible');
  cursor.classList.remove('is-hidden');
  addFloatingHearts();
  // Type one Unicode code point at a time so punctuation and the heart render properly.
  const chars = Array.from(LETTER_TEXT);
  const typeNext = () => {
    if (currentScene !== 'letter') return;
    const batch = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 10 : 2;
    for (let n = 0; n < batch && index < chars.length; n++, index++) output.textContent += chars[index];
    if (index < chars.length) {
      letterTimer = setTimeout(typeNext, CONFIG.LETTER_TYPING_SPEED_MS);
    } else {
      cursor.classList.add('is-hidden');
      signoff.textContent = LETTER_SIGNOFF + ' ♡';
      signoff.classList.add('is-visible');
      finaleTimer = setTimeout(() => goToScene('finale'), CONFIG.FINAL_SCENE_DELAY_MS);
    }
  };
  typeNext();
}

function addFloatingHearts() {
  const layer = $('#letterHearts');
  if (layer.childElementCount) return;
  const heartSymbols = ['♡', '♥', '୨୧', '✧'];
  const heartColors = ['#ffb5d2', '#f6dca5', '#d9c7ff', '#ffe8f3'];
  for (let i = 0; i < 18; i++) {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.textContent = heartSymbols[i % heartSymbols.length];
    heart.style.left = `${3 + Math.random() * 94}%`;
    heart.style.setProperty('--heart-size', `${12 + Math.random() * 17}px`);
    heart.style.setProperty('--heart-duration', `${7 + Math.random() * 7}s`);
    heart.style.setProperty('--heart-delay', `${Math.random() * 6}s`);
    heart.style.setProperty('--heart-drift', `${-45 + Math.random() * 90}px`);
    heart.style.setProperty('--heart-color', heartColors[i % heartColors.length]);
    layer.appendChild(heart);
  }
}

function replayExperience() {
  clearTimeout(cakeAutoAdvanceTimer);
  clearTimeout(memoriesAutoAdvanceTimer);
  clearTimeout(letterTimer);
  clearTimeout(finaleTimer);
  photoSequenceStarted = false;
  letterStarted = false;
  $('#memoryCanvas').replaceChildren();
  $('#letterHearts').replaceChildren();
  $('#birthdayCake').classList.remove('is-lit', 'is-cut');
  $('#cakeStage').classList.remove('candles-lit');
  $('#lightCandlesButton').hidden = false;
  $('#lightCandlesButton').disabled = false;
  $('#cutCakeButton').hidden = false;
  $('#cutCakeButton').disabled = true;
  $('#cakeInstruction').hidden = false;
  $('#cakeInstruction').textContent = 'First, let\'s make the candles glow.';
  $('#cakeWish').classList.remove('is-visible');
  $('#letterEnvelope').classList.remove('is-opening');
  $('#openLetterButton').disabled = false;
  $('#typedLetter').textContent = '';
  $('#typingCursor').classList.remove('is-hidden');
  $('#letterSignoff').classList.remove('is-visible');
  goToScene('cake');
  burstConfetti(35);
}

function setupParticles() {
  const canvas = $('#particleCanvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, particles = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reducedMotion ? 22 : Math.min(95, Math.floor(width * height / 13500));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + .35,
      speed: Math.random() * .3 + .08,
      drift: Math.random() * .24 - .12,
      alpha: Math.random() * .55 + .18,
      phase: Math.random() * Math.PI * 2,
    }));
  }
  let animationFrame;
  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const pulse = .6 + Math.sin(time * .0007 + p.phase) * .4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (reducedMotion ? 1 : pulse), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 221, 238, ${p.alpha * pulse})`;
      ctx.fill();
      if (!reducedMotion) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
      }
    }
    if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { cancelAnimationFrame(animationFrame); resize(); draw(); }, { passive: true });
  resize(); draw();
}

function setInitialScene() {
  const unlockLabel = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  }).format(unlockDate).toUpperCase().replace(' AT ', ' · ');
  $('#unlockDateLabel').textContent = `${unlockLabel} IST`;
  if (Date.now() >= unlockDate.getTime()) {
    currentScene = 'countdown';
    beginBirthday();
  } else {
    currentScene = 'countdown';
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 250);
  }
}

soundButton.addEventListener('click', toggleMusic);
$('#startExperienceButton').addEventListener('click', manuallyStartMusic);
$('#continueSilentButton').addEventListener('click', () => {
  userChoseSilent = true;
  soundCurtain.hidden = true;
  showToast('Enjoy your surprise. You can turn on music anytime with the ♫ button.');
});
$('#lightCandlesButton').addEventListener('click', lightCandles);
$('#cutCakeButton').addEventListener('click', cutCake);
$('#continueMemoriesButton').addEventListener('click', () => { clearTimeout(cakeAutoAdvanceTimer); goToScene('memories'); });
$('#skipMemoriesButton').addEventListener('click', () => { clearTimeout(memoriesAutoAdvanceTimer); goToScene('envelope'); });
$('#openLetterButton').addEventListener('click', openEnvelope);
$('#replayButton').addEventListener('click', replayExperience);

// Start particles first. Scene selection also handles links opened after the deadline.
setupParticles();
setInitialScene();

// Handle laptops waking from sleep or a tab being restored around the unlock time.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentScene === 'countdown' && Date.now() >= unlockDate.getTime()) beginBirthday();
});
