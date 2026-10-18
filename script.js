/*
 * FOR SUPRIYA — Birthday experience
 * Quick edits:
 *   1. Change UNLOCK_AT to the real date/time (ISO 8601 with +05:30 for IST).
 *   2. Add assets/audio/birthday-song.mp3.
 *   3. Add your photos as assets/photos/memory-01.jpg through memory-16.jpg.
 *   4. Replace LETTER_TEXT and LETTER_SIGNOFF with your own words.
 */
'use strict';

const CONFIG = {
  // Current test deadline: 02 November 2026, 12:00 AM India Standard Time.
  // Format: YYYY-MM-DDTHH:mm:ss+05:30 (do not remove the timezone offset).
  UNLOCK_AT: '2026-11-02T00:00:00+05:30',
  SONG_PATH: 'assets/audio/birthday-song.mp3',
  PHOTO_PATH: 'assets/photos/memory-',
  PHOTO_EXTENSION: '.jpg',
  PHOTO_COUNT: 16,
  // Slow, cinematic entrance: each photo arrives one after another.
  PHOTO_REVEAL_STAGGER_MS: 520,
  PHOTO_REVEAL_DURATION_MS: 1200,
  // Once every photo has fully arrived, keep the gallery on screen for this long.
  // Automatically advance to the envelope five seconds after every photo has finished appearing.
  MEMORY_HOLD_AFTER_REVEAL_MS: 5000,
  // About 20 characters/second, with extra pauses after punctuation and paragraph breaks.
  LETTER_TYPING_SPEED_MS: 80,
  // Wait five seconds after the final letter character and sign-off are visible.
  FINAL_SCENE_DELAY_MS: 5000,
};

// A temporary starter message so the whole journey can be previewed before your letter is ready.
// Replace this text later; line breaks are preserved by the typewriter.
const LETTER_TEXT = `These are my inner thoughts, things I've wanted to express for a long time. I thought i should tell you everything that's going on inside me, maybe just to feel a little lighter.

You know, I have really strong feelings for you. I don't know how it happened or when it became this strong. Even though we're long distance and my feelings one sided, even though we have never had that kind of physical closeness, somehow you have become such a big part of my heart..

Sometimes, when i see you photos in my gallery or social media or even hear the name Supriya anywhere, it brings back so many memories. Its almost like something in the frontal part of my cerebral cortex of brain suddenly brings everything back to the memories of you, our nonsense conversations, all those little moments... they just come back in front of my eyes. I can't control when they return. I can't delete and i don't know how to replace them with something else. no matter how much i try, those memories are still there....

I know I'm still unemployed. Sometimes, i think that even after i get a job and become settled in life, I'll go to your parents and ask for your hand. But then i think, what's the point of dreaming about something when i already know you don't have the same feelings for me... there is also the issue of caste on your side, which makes me think even more about whether something like this could ever happen. still, somewhere in my mind, those thoughts remain. All i really want is to see you happy for the rest of my life, even if i'm not the person who gets to be beside you.... 

I don't know how to explain what i feel for you. There are so many things in my heart that i want to tell you, but when i try to put them into words, sentences, nothing seems enough. I can feel so much inside me, yet sometimes i can't even explain.....

You always tell me to meet you, but i keep avoiding it, maybe you feel bad why i do that when you are the most valuable person i want to see every time in front of my eyes... the reason is something i have never really been able to explain to you....

When we meet, when you come close to me, when you touch me, hold my hand or show that you care about me, those moments feel special to me. Even the smallest gesture from you can stay in my heart for a long time.... but at the same time my brain knows that for you, it might just be a normal friendly meeting... Sometimes, even a small moment with you becomes something i keep thinking about long after its over....

I don't know whether you have ever noticed this, but there were times when we talked so much that it felt like you couldn't go a day without seeing me or having a conversation with me. Maybe there was a little emotion for me somewhere in a corner of your heart.. or maybe i'm completely wrong, and it was just my perception... Maybe i gave those little things more meaning than they actually had because i wanted to believe there was something more between us....

But those short periods, those few days when we talked so much and felt close, affect me more than you probably realise. When things suddenly change or we stop talking because of blocked, it completely breaks me inside... I tried to move on, but somehow i can't do... that's why i sometimes avoid meeting you... it's not because i dont want to see you... it's because i'm afraid that seeing you again will bring back the same feelings, same hope, and same little spark i have been trying so hard to let go of.. So I keep my distance, even when a part of me wants to be close to you...

Still, you will always have a special place in my memories, in my heart even after years have passed... I think i will remember these moments and honestly when i look back at them, i feel happy too... I'm glad that i got to know you and share those little moments with you... I just dont want to keep creating a new memories that might make it even harder for me to move on someday...

At the end, there is one thought that sometimes comes to my mind....

If you have even a little feeling for me somewhere in a corner of your heart... something you have never expressed or maybe haven't even realised yourself... then i don't know what to say, if you believe in another birth or another timeline, maybe somewhere else things could happen differently and we could love each other... Maybe things that seem impossible in this life could happen in that one, i know it's just a thought, but somehow it feels nice to imagine it sometimes...

But in this birth, in this timeline, maybe i have to accept things as they are.... maybe we are meant to be just the way we are now and i have to learn to be happy with that.

I just want you to be happy, no matter what happens in the future. I don't know what place i will have in your life or whether you will remember our conversations and little moments the way i do.. maybe with time, these feelings will become easier.....

You will always be someone special in my life, someone whose memories can still make me smile even when things didn't turn out the way i hoped....

I hope i haven't ruined your birthday by telling you all this... If I have, i'm extremely sorry...

Happy birthday, beautiful. ♡

I always wished i could call you mine... that's why i wanted to name you Sizu. but maybe i'll always be your Nobita, loving his Sizuka from a distance. ♡

Goodbye, Sizu ❤️💕`;
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
const letterPaperElement = $('#letterPaper');
let userManuallyScrolledLetter = false;
letterPaperElement.addEventListener('wheel', () => { userManuallyScrolledLetter = true; }, { passive: true });
letterPaperElement.addEventListener('touchmove', () => { userManuallyScrolledLetter = true; }, { passive: true });
const soundButton = $('#soundButton');
const soundLabel = $('#soundLabel');
const soundCurtain = $('#soundCurtain');
const toast = $('#toast');
let currentScene = 'countdown';
let toastTimer = null;
let countdownTimer = null;
let cakeAutoAdvanceTimer = null;
let memoriesAutoAdvanceTimer = null;
let memoriesReadyTimer = null;
let memoryReady = false;
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
  if (currentScene === 'memories' && name !== 'memories') {
    clearTimeout(memoriesReadyTimer);
    clearTimeout(memoriesAutoAdvanceTimer);
    memoryReady = false;
    scenes.memories.classList.remove('is-ready');
  }
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
  cakeAutoAdvanceTimer = setTimeout(() => goToScene('memories'), 3000);
}

const photoPositionsWide = [
  // Two loose, staggered rows on wide screens. Overlap is limited to frame edges.
  // Higher z-values keep the upper-row captions readable when frames meet.
  { x: 2,  y: 29, r: -7, z: 20 }, { x: 14, y: 31, r: 5,  z: 20 },
  { x: 26, y: 30, r: -4, z: 20 }, { x: 38, y: 32, r: 6,  z: 20 },
  { x: 50, y: 29, r: -5, z: 20 }, { x: 62, y: 31, r: 5,  z: 20 },
  { x: 74, y: 30, r: -3, z: 20 }, { x: 86, y: 29, r: 7,  z: 20 },
  { x: 4,  y: 59, r: 5,  z: 10 }, { x: 16, y: 61, r: -6, z: 10 },
  { x: 28, y: 60, r: 7,  z: 10 }, { x: 40, y: 62, r: -4, z: 10 },
  { x: 52, y: 59, r: 6,  z: 10 }, { x: 64, y: 61, r: -7, z: 10 },
  { x: 76, y: 60, r: 4,  z: 10 }, { x: 88, y: 59, r: -5, z: 10 },
];
const photoPositionsNarrow = [
  // Four staggered rows keep all sixteen photos individually visible on phones.
  { x: 3,  y: 23, r: -7, z: 40 }, { x: 26, y: 25, r: 5,  z: 40 },
  { x: 49, y: 22, r: -4, z: 40 }, { x: 72, y: 24, r: 6,  z: 40 },
  { x: 5,  y: 40, r: 6,  z: 30 }, { x: 28, y: 42, r: -6, z: 30 },
  { x: 51, y: 39, r: 7,  z: 30 }, { x: 74, y: 41, r: -5, z: 30 },
  { x: 2,  y: 57, r: -5, z: 20 }, { x: 25, y: 59, r: 7,  z: 20 },
  { x: 48, y: 56, r: -7, z: 20 }, { x: 71, y: 58, r: 4,  z: 20 },
  { x: 4,  y: 74, r: 5,  z: 10 }, { x: 27, y: 76, r: -7, z: 10 },
  { x: 50, y: 73, r: 6,  z: 10 }, { x: 73, y: 75, r: -4, z: 10 },
];
const photoPositionsNarrowShort = [
  // Same phone collage, nudged down with compact cards for short portrait screens.
  { x: 3,  y: 28, r: -7, z: 40 }, { x: 26, y: 30, r: 5,  z: 40 },
  { x: 49, y: 27, r: -4, z: 40 }, { x: 72, y: 29, r: 6,  z: 40 },
  { x: 5,  y: 44, r: 6,  z: 30 }, { x: 28, y: 46, r: -6, z: 30 },
  { x: 51, y: 43, r: 7,  z: 30 }, { x: 74, y: 45, r: -5, z: 30 },
  { x: 2,  y: 60, r: -5, z: 20 }, { x: 25, y: 62, r: 7,  z: 20 },
  { x: 48, y: 59, r: -7, z: 20 }, { x: 71, y: 61, r: 4,  z: 20 },
  { x: 4,  y: 76, r: 5,  z: 10 }, { x: 27, y: 78, r: -7, z: 10 },
  { x: 50, y: 75, r: 6,  z: 10 }, { x: 73, y: 77, r: -4, z: 10 },
];
const photoCaptions = [
  'a little happiness', 'one for the heart', 'this kind of day', 'my favourite people',
  'a moment to keep', 'you, being you', 'the good old days', 'a lovely memory',
  'the softest smiles', 'wish we could pause time', 'our little story', 'always worth remembering',
  'another little treasure', 'a day to remember', 'made of little things', 'kept close to my heart',
];

const reducedMemoryMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const photoRevealStagger = reducedMemoryMotion ? 0 : CONFIG.PHOTO_REVEAL_STAGGER_MS;
const photoRevealDuration = reducedMemoryMotion ? 50 : CONFIG.PHOTO_REVEAL_DURATION_MS;

function createMemoryCard(index, position) {
  const card = document.createElement('div');
  card.className = 'memory-photo';
  card.style.setProperty('--x', `${position.x}%`);
  // Keep every card below the heading, as in the earlier scrapbook layout.
  card.style.setProperty('--y', `${position.y}%`);
  const finalRotation = position.r + (Math.random() * 3 - 1.5);
  card.style.setProperty('--rot', `${finalRotation}deg`);
  card.style.setProperty('--start-rot', `${finalRotation + (Math.random() * 22 - 11)}deg`);
  card.style.setProperty('--delay', `${index * photoRevealStagger}ms`);
  card.style.setProperty('--reveal-duration', `${photoRevealDuration}ms`);
  card.style.zIndex = String(position.z ?? (3 + (index % 5)));
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
  memoryReady = false;
  scenes.memories.classList.remove('is-ready');
  const canvas = $('#memoryCanvas');
  const isNarrow = window.matchMedia('(max-width: 760px)').matches;
  const isShort = window.matchMedia('(max-height: 620px)').matches;
  const positions = [...(isNarrow ? (isShort ? photoPositionsNarrowShort : photoPositionsNarrow) : photoPositionsWide)];
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

  // Start the hold timer only after the final card's entrance transition has finished.
  const allPhotosPoppedAt = (CONFIG.PHOTO_COUNT - 1) * photoRevealStagger + photoRevealDuration;
  memoriesReadyTimer = setTimeout(() => {
    if (currentScene !== 'memories') return;
    memoryReady = true;
    scenes.memories.classList.add('is-ready');
    memoriesAutoAdvanceTimer = setTimeout(() => advanceFromMemories(), CONFIG.MEMORY_HOLD_AFTER_REVEAL_MS);
  }, allPhotosPoppedAt);
}

function advanceFromMemories() {
  if (currentScene !== 'memories' || !memoryReady) return;
  clearTimeout(memoriesAutoAdvanceTimer);
  clearTimeout(memoriesReadyTimer);
  memoryReady = false;
  goToScene('envelope');
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
  userManuallyScrolledLetter = false;
  letterPaperElement.scrollTop = 0;
  let index = 0;
  output.textContent = '';
  signoff.classList.remove('is-visible');
  cursor.classList.remove('is-hidden');
  addFloatingHearts();
  // Type one Unicode code point at a time so punctuation and the heart render properly.
  const chars = Array.from(LETTER_TEXT);
  const typeNext = () => {
    if (currentScene !== 'letter') return;

    // Reveal one character at a time so the letter is easy to follow on phones and laptops.
    if (index < chars.length) {
      const char = chars[index++];
      output.textContent += char;
      // Keep the newest line visible while typing; if she manually scrolls to reread, respect that.
      if (!userManuallyScrolledLetter) letterPaperElement.scrollTop = letterPaperElement.scrollHeight;

      // Natural pauses give the reader time to follow sentences and paragraph breaks.
      let nextDelay = CONFIG.LETTER_TYPING_SPEED_MS;
      if (char === '\n') nextDelay += 260;
      else if (/[.!?]/u.test(char)) nextDelay += 220;
      else if (/[,;:]/u.test(char)) nextDelay += 110;

      letterTimer = setTimeout(typeNext, nextDelay);
      return;
    }

    // The five-second finale timer starts only once the entire letter has been written.
    cursor.classList.add('is-hidden');
    if (LETTER_SIGNOFF.trim()) {
      signoff.textContent = LETTER_SIGNOFF + ' ♡';
      signoff.classList.add('is-visible');
    } else {
      signoff.textContent = '';
      signoff.classList.remove('is-visible');
    }
    finaleTimer = setTimeout(() => goToScene('finale'), CONFIG.FINAL_SCENE_DELAY_MS);
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
  clearTimeout(memoriesReadyTimer);
  clearTimeout(memoriesAutoAdvanceTimer);
  clearTimeout(letterTimer);
  clearTimeout(finaleTimer);
  photoSequenceStarted = false;
  memoryReady = false;
  scenes.memories.classList.remove('is-ready');
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
  $('#letterPaper').scrollTop = 0;
  userManuallyScrolledLetter = false;
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
$('#openLetterButton').addEventListener('click', openEnvelope);
$('#replayButton').addEventListener('click', replayExperience);

// Start particles first. Scene selection also handles links opened after the deadline.
setupParticles();
setInitialScene();

// Handle laptops waking from sleep or a tab being restored around the unlock time.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentScene === 'countdown' && Date.now() >= unlockDate.getTime()) beginBirthday();
});
