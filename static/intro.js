(() => {
  'use strict';

  const html = document.documentElement;
  const BASE = { d1: 600, d2: 320, d3: 240, d4: 440 };
  const VARS = { d1: '--d1', d2: '--d2', d3: '--d3', d4: '--d4' };

  let loaded = false;

  const loadScript = () => {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.src = '/script.js';
    document.body.appendChild(s);
  };

  window.__introJsAlive = true;

  const getMultiplier = () => {
    const v = parseFloat(getComputedStyle(html).getPropertyValue('--k'));
    return Number.isFinite(v) && v > 0 ? v : 1;
  };

  const readDurations = (mul) => {
    const out = {};
    try {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      for (const [key, name] of Object.entries(VARS)) {
        probe.style.transitionDuration = `var(${name})`;
        const raw = getComputedStyle(probe).transitionDuration;
        const n = parseFloat(raw);
        out[key] = Number.isFinite(n) ? (raw.includes('ms') ? n : n * 1000) : 0;
      }
      probe.remove();
    } catch {}
    for (const [key, base] of Object.entries(BASE)) {
      if (!out[key]) out[key] = base * mul;
    }
    return out;
  };

  const D = readDurations(getMultiplier());

  if (!html.classList.contains('intro')) {
    loadScript();
    return;
  }

  const overlay = document.getElementById('intro');
  const mark = document.getElementById('introMark');
  const line = document.getElementById('introLine');
  const wave = document.getElementById('introWave');
  const ring = document.getElementById('introRing');
  const real = document.querySelector('.side-mark');

  const restAt = D.d1 + D.d2 + D.d3;
  const unlockAt = restAt + D.d4 * 0.25;
  const captionAt = restAt;

  const finish = () => {
    try { html.classList.remove('intro', 'reveal', 'launch', 'exit', 'noscroll'); } catch {}
    try { overlay.classList.add('gone'); } catch {}
    try { real.style.opacity = ''; } catch {}
    try { sessionStorage.setItem('intro-seen', '1'); } catch {}
    loadScript();
  };

  let entering = false;

  const run = () => {
    flip();
    const revealAt = D.d4 * 0.3;
    setTimeout(() => { try { html.classList.add('reveal'); } catch {} }, revealAt);
    setTimeout(finish, revealAt + 800 * getMultiplier());
  };

  const enter = () => {
    if (entering) return;
    entering = true;
    document.removeEventListener('keydown', enter);
    document.removeEventListener('pointerdown', enter);
    try { html.classList.add('exit'); } catch {}
    setTimeout(run, 220);
    setTimeout(() => { if (html.classList.contains('intro')) finish(); }, 4000 * getMultiplier());
  };

  const arm = () => {
    try { html.classList.add('launch'); } catch {}
    document.addEventListener('keydown', enter);
    document.addEventListener('pointerdown', enter);
  };

  let flipped = false;

  const flip = () => {
    if (flipped) return;
    flipped = true;

    const a = mark.getBoundingClientRect();
    const b = real.getBoundingClientRect();
    const sx = b.width / a.width;
    const sy = b.height / a.height;
    const dx = b.left - a.left;
    const dy = b.top - a.top;
    const dur = D.d4;
    const ease = 'cubic-bezier(.34,1.24,.64,1)';

    mark.style.transformOrigin = '0 0';

    const anim = mark.animate(
      [
        { transform: 'none' },
        { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
      ],
      { duration: dur, easing: ease, fill: 'forwards' },
    );

    const unit = b.width / 476;
    const strokes = [[line, 1.3], [wave, 1.3], [ring, 1]];
    for (const [el, px] of strokes) {
      el.animate(
        [{ strokeWidth: getComputedStyle(el).strokeWidth }, { strokeWidth: px / unit }],
        { duration: dur, easing: ease, fill: 'forwards' },
      );
    }

  };

  setTimeout(arm, captionAt);
  setTimeout(() => { try { html.classList.remove('noscroll'); } catch {} }, unlockAt);
  setTimeout(() => {
    if (!html.classList.contains('launch')) finish();
  }, Math.max(8000, captionAt + 4000));

  window.__intro = { D, restAt, captionAt, flip, arm, run, enter, finish, load: loadScript };
})();
