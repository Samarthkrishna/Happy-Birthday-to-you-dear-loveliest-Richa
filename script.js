(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const on = (element, event, handler) => { if (element) element.addEventListener(event, handler); };

  const intro = $('#intro');
  const hero = $('#hero');
  const audio = $('#birthdayAudio');
  const musicToggle = $('#musicToggle');
  const musicLabel = $('#musicLabel');
  const toast = $('#toast');
  const canvas = $('#confettiCanvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  let lightsDimmed = false;
  let candlesBlown = false;
  let confetti = [];
  let confettiFrame = 0;
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function sizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  function burst(amount = 120) {
    if (!ctx) return;
    const colors = ['#e7c58b', '#f2d9e8', '#a88bc8', '#fff3d5', '#dca3bf'];
    for (let i = 0; i < amount; i++) {
      confetti.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * (0.18 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 8,
        vy: -2 - Math.random() * 7,
        gravity: 0.12 + Math.random() * 0.08,
        size: 3 + Math.random() * 5,
        rotation: Math.random() * 6,
        spin: (Math.random() - 0.5) * 0.18,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 100 + Math.random() * 70
      });
    }
    if (!confettiFrame) drawConfetti();
  }

  function drawConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confetti = confetti.filter(p => p.life > 0 && p.y < window.innerHeight + 30);
    for (const p of confetti) {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rotation += p.spin; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1, p.life / 20);
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
      ctx.restore();
    }
    if (confetti.length) confettiFrame = requestAnimationFrame(drawConfetti);
    else { cancelAnimationFrame(confettiFrame); confettiFrame = 0; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  on($('#openSurprise'), 'click', () => {
    if (!intro || !hero) return;
    intro.classList.add('door-open');
    intro.classList.add('intro-fade');
    window.setTimeout(() => {
      intro.classList.add('hidden');
      hero.classList.remove('hidden');
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.body.classList.add('celebration');
      burst(110);
    }, 900);
  });

  on(musicToggle, 'click', async () => {
    if (!audio) { showToast('Music player is missing from the page.'); return; }
    if (audio.paused) {
      try {
        await audio.play();
        musicToggle.classList.add('playing');
        if (musicLabel) musicLabel.textContent = 'MUSIC ON';
      } catch (error) {
        showToast('Music could not play. Check that birthday-music.mp3 is beside index.html.');
        if (musicLabel) musicLabel.textContent = 'TRY MUSIC';
      }
    } else {
      audio.pause();
      musicToggle.classList.remove('playing');
      if (musicLabel) musicLabel.textContent = 'MUSIC OFF';
    }
  });
  if (audio) audio.addEventListener('error', () => {
    if (musicLabel) musicLabel.textContent = 'MUSIC FILE?';
  });

  $$('[data-scroll]').forEach(button => on(button, 'click', () => {
    const target = $(button.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  const modal = $('#wishModal');
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  $$('.wish-card').forEach(card => on(card, 'click', () => {
    const message = $('#modalMessage');
    if (message) message.textContent = card.dataset.wish || $('.wish-hidden', card)?.textContent || 'May this year bring you beautiful moments.';
    if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
  }));
  $$('[data-close-modal]').forEach(el => on(el, 'click', closeModal));
  window.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  on($('#openLetter'), 'click', () => {
    const section = $('#letter'); const content = $('#letterContent');
    if (section) section.classList.add('letter-open');
    if (content) content.setAttribute('aria-hidden', 'false');
  });
  on($('#closeLetter'), 'click', () => {
    const section = $('#letter'); const content = $('#letterContent');
    if (section) section.classList.remove('letter-open');
    if (content) content.setAttribute('aria-hidden', 'true');
  });

  function toggleLights() {
    if (candlesBlown) return;
    lightsDimmed = !lightsDimmed;
    document.body.classList.toggle('lights-dimmed', lightsDimmed);
    const instruction = $('#cakeInstruction');
    if (instruction) instruction.textContent = lightsDimmed ? 'THE WORLD CAN WAIT. MAKE YOUR WISH.' : 'TAP THE CAKE TO DIM THE LIGHTS';
    if (lightsDimmed) showToast('Take a breath. This moment is yours.');
  }
  const cake = $('#cakeArt');
  on(cake, 'click', toggleLights);
  on(cake, 'keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleLights(); }
  });

  on($('#wishButton'), 'click', () => {
    const wishButton = $('#wishButton');
    if (candlesBlown) { showToast('Your wish has been sent into the universe ✦'); return; }
    candlesBlown = true; lightsDimmed = true;
    document.body.classList.add('lights-dimmed');
    $$('.candle i').forEach(flame => { flame.style.opacity = '0'; flame.style.filter = 'none'; });
    $$('.candle').forEach(candle => {
      const smoke = document.createElement('span');
      smoke.className = 'smoke';
      smoke.style.cssText = 'position:absolute;left:2px;top:-16px;width:8px;height:18px;border-radius:50%;background:linear-gradient(#d8c9e2aa,transparent);filter:blur(3px);animation:fadeAway 1.3s forwards';
      candle.appendChild(smoke);
    });
    const instruction = $('#cakeInstruction');
    if (instruction) instruction.textContent = 'WISH MADE. LET THE MAGIC BEGIN.';
    if (wishButton) wishButton.innerHTML = '<span>YOUR WISH IS OUT THERE NOW</span><b>♡</b>';
    burst(220);
    window.setTimeout(() => { const finale = $('#finale'); if (finale) finale.scrollIntoView({ behavior: 'smooth' }); }, 900);
  });

  on($('#replayButton'), 'click', () => {
    candlesBlown = false; lightsDimmed = false;
    document.body.classList.remove('lights-dimmed', 'celebration');
    if (intro) intro.classList.remove('hidden', 'door-open', 'intro-fade');
    if (hero) hero.classList.add('hidden');
    $$('.candle i').forEach(flame => { flame.style.opacity = ''; flame.style.filter = ''; });
    $$('.smoke').forEach(smoke => smoke.remove());
    const instruction = $('#cakeInstruction');
    if (instruction) instruction.textContent = 'TAP THE CAKE TO DIM THE LIGHTS';
    const wishButton = $('#wishButton');
    if (wishButton) wishButton.innerHTML = '<span>MAKE A WISH & BLOW OUT THE CANDLES</span><b>✦</b>';
    const letter = $('#letter'); const content = $('#letterContent');
    if (letter) letter.classList.remove('letter-open');
    if (content) content.setAttribute('aria-hidden', 'true');
    closeModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (musicLabel) musicLabel.textContent = audio && !audio.paused ? 'MUSIC ON' : 'MUSIC OFF';
  });

  window.addEventListener('scroll', () => {
    const bar = $('#progressBar');
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  }, { passive: true });
})();
