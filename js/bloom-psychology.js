/* ═══════════════════════════════════════════════════════════════════════
   BLOOM CURE  ·  bloom-psychology.js  v4.0
   Premium Conversion Engine  ·  Apothecary Noir
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────────── */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const raf = requestAnimationFrame;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const css = (str) => {
    const s = document.createElement('style');
    s.textContent = str;
    document.head.appendChild(s);
  };

  /* ── Shared design tokens ─────────────────────────────────────── */
  css(`
    :root {
      --bc-gold:       #C9A84C;
      --bc-gold-hi:    #DFC06A;
      --bc-gold-pale:  rgba(201,168,76,0.08);
      --bc-gold-border:rgba(201,168,76,0.22);
      --bc-bg:         #09090B;
      --bc-card:       rgba(12,13,17,0.98);
      --bc-text:       #F5F0E8;
      --bc-muted:      rgba(245,240,232,0.42);
      --bc-dim:        rgba(245,240,232,0.18);
      --bc-border:     rgba(255,255,255,0.06);
      --bc-border-hi:  rgba(255,255,255,0.1);
      --bc-green:      #4CAF7C;
      --bc-spring:     cubic-bezier(0.16,1,0.3,1);
      --bc-ff-h:       'Playfair Display', Georgia, serif;
      --bc-ff-b:       'DM Sans', system-ui, sans-serif;
      --bc-ff-m:       'IBM Plex Mono', monospace;
    }

    /* Ripple */
    @keyframes bc-ripple {
      to { transform: scale(1); opacity: 0; }
    }
    /* Pulse ring  */
    @keyframes bc-pulse {
      0%,100% { opacity:1; }
      50%      { opacity:0.3; }
    }
    /* WA ring */
    @keyframes bc-wa-ring {
      0%   { transform:scale(1); opacity:0.7; }
      100% { transform:scale(1.6); opacity:0; }
    }
    /* WhatsApp pop in */
    @keyframes bc-wa-pop {
      from { transform:scale(0) rotate(-15deg); opacity:0; }
      to   { transform:scale(1) rotate(0deg);  opacity:1; }
    }
    /* Nudge in */
    @keyframes bc-nudge-in {
      from { opacity:0; transform:translateX(-50%) translateY(20px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0);    }
    }
  `);

  /* ════════════════════════════════════════════════════════════════
     01 · SCROLL PROGRESS BAR
  ════════════════════════════════════════════════════════════════ */
  const bar = $('#bc-bar');
  if (bar) {
    Object.assign(bar.style, {
      position: 'fixed', top: 0, left: 0, height: '2px', width: '0%',
      background: 'linear-gradient(90deg,var(--bc-gold),rgba(139,168,136,0.85))',
      zIndex: 99999, pointerEvents: 'none',
      boxShadow: '0 0 10px rgba(201,168,76,0.25)',
    });
    on(window, 'scroll', () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = clamp(p * 100, 0, 100) + '%';
    }, { passive: true });
  }

  /* ════════════════════════════════════════════════════════════════
     02 · NAV STATE
  ════════════════════════════════════════════════════════════════ */
  const nav = $('.premium-nav');
  on(window, 'scroll', () => nav?.classList.toggle('bc-scrolled', window.scrollY > 55), { passive: true });

  /* ════════════════════════════════════════════════════════════════
     03 · BACK-TO-TOP
  ════════════════════════════════════════════════════════════════ */
  const topBtn = $('#bc-top');
  if (topBtn) {
    on(window, 'scroll', () => topBtn.classList.toggle('on', window.scrollY > 500), { passive: true });
    on(topBtn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  /* hide legacy cursor */
  ['#bc-dot', '#bc-ring'].forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });

  /* ════════════════════════════════════════════════════════════════
     04 · SCROLL REVEAL
  ════════════════════════════════════════════════════════════════ */
  function initReveal() {
    const els = $$('.bc-r,.bc-rl,.bc-rr,.bc-rs,.bc-sg,.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('on', 'active')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on', 'active'); io.unobserve(e.target); } });
    }, { threshold: 0.09, rootMargin: '0px 0px -28px 0px' });
    els.forEach(el => el.getBoundingClientRect().top < window.innerHeight
      ? el.classList.add('on', 'active')
      : io.observe(el));
  }
  initReveal();

  /* ════════════════════════════════════════════════════════════════
     05 · COUNTERS
  ════════════════════════════════════════════════════════════════ */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent, 10);
    if (isNaN(target)) return;
    const from = Math.max(0, target - Math.round(target * 0.35));
    const t0 = performance.now();
    (function step(now) {
      const p = 1 - (1 - Math.min(1, (now - t0) / 1800)) ** 2;
      el.textContent = Math.round(from + (target - from) * p).toLocaleString('en-IN');
      if (p < 1) raf(step);
    })(t0);
  }
  function registerCounter(el) {
    const raw = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
    if (isNaN(raw)) return;
    el.dataset.target = raw; el.textContent = '0';
    if (!('IntersectionObserver' in window)) { animateCounter(el); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    io.observe(el);
  }
  $$('.wildlife-stat-number,.bc-counter,[data-counter]').forEach(registerCounter);

  /* ════════════════════════════════════════════════════════════════
     06 · HERO PARALLAX
  ════════════════════════════════════════════════════════════════ */
  const heroImgs = $$('.hero-slide__img,.ag-slide__img');
  if (heroImgs.length) {
    on(window, 'scroll', () => {
      if (window.scrollY < window.innerHeight * 1.1)
        heroImgs.forEach(i => i.style.transform = `translateY(${window.scrollY * 0.24}px) scale(1.06)`);
    }, { passive: true });
  }

  /* ════════════════════════════════════════════════════════════════
     07 · BUTTON RIPPLE
  ════════════════════════════════════════════════════════════════ */
  function addRipple(btn) {
    if (btn.dataset.ripple) return;
    btn.dataset.ripple = '1';
    btn.style.overflow = 'hidden';
    if (window.getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const ink = document.createElement('span');
      Object.assign(ink.style, {
        position: 'absolute', borderRadius: '50%',
        width: d + 'px', height: d + 'px',
        left: (e.clientX - r.left - d / 2) + 'px',
        top: (e.clientY - r.top - d / 2) + 'px',
        background: 'rgba(255,255,255,0.1)',
        transform: 'scale(0)',
        animation: 'bc-ripple .5s ease-out forwards',
        pointerEvents: 'none',
      });
      this.appendChild(ink);
      setTimeout(() => ink.remove(), 550);
    });
  }
  function applyRipples() {
    $$('button,.ag-strip-btn,.product-card__btn,.ag-btn,.cta-button').forEach(addRipple);
  }
  applyRipples();
  setTimeout(applyRipples, 1400);

  /* ════════════════════════════════════════════════════════════════
     08 · SENSORY HOVER HINTS
  ════════════════════════════════════════════════════════════════ */
  const SENSORY = {
    sandalwood: '🌸 Warm woody · creamy lather · lingering calm',
    neem: '🌿 Cool herbal · clears pores · deep Ayurvedic wisdom',
    coconut: '🥥 Tropical richness · ultra-moisturising · silky finish',
    rose: '🌹 Floral soft · calms redness · luminous glow',
    turmeric: '✨ Golden radiance · brightening · anti-blemish',
    charcoal: '🖤 Deep detox · purifies pores · all-day freshness',
    'goat milk': '🥛 Velvety smooth · vitamins A & B12 · baby-soft skin',
    besan: '✨ Traditional glow · gentle exfoliation · silky texture',
    lavender: '💜 Calming aroma · stress relief · restful feel',
    coffee: '☕ Invigorating scrub · circulation boost · instant radiance',
    rice: '🌾 Brightening · barrier repair · even skin tone',
  };
  $$('.product-card,.spotlight-card').forEach(card => {
    const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const key = Object.keys(SENSORY).find(k => name.includes(k));
    if (!key) return;
    const hint = document.createElement('div');
    hint.style.cssText = `font-size:.66rem;color:rgba(139,168,136,0.75);font-style:italic;
      margin-top:5px;opacity:0;max-height:0;overflow:hidden;
      transition:opacity .32s ease,max-height .32s ease;font-family:var(--bc-ff-b);`;
    hint.textContent = SENSORY[key];
    const desc = card.querySelector('.product-card__desc,.spotlight-card__desc');
    if (desc) desc.insertAdjacentElement('afterend', hint);
    card.addEventListener('mouseenter', () => { hint.style.opacity = '1'; hint.style.maxHeight = '28px'; });
    card.addEventListener('mouseleave', () => { hint.style.opacity = '0'; hint.style.maxHeight = '0'; });
  });

  /* ════════════════════════════════════════════════════════════════
     09 · ARTISAN BATCH NOTE
  ════════════════════════════════════════════════════════════════ */
  $$('.product-card__info,.spotlight-card__body').forEach(info => {
    if (info.querySelector('.bc-batch-note')) return;
    const note = document.createElement('div');
    note.className = 'bc-batch-note';
    note.style.cssText = `font-size:.61rem;color:rgba(245,240,232,0.25);
      display:flex;align-items:center;gap:5px;margin:6px 0;
      font-family:var(--bc-ff-m);letter-spacing:.4px;`;
    note.innerHTML = `<i class="fa-solid fa-hands" style="color:rgba(201,168,76,0.35);"></i>
      Small-batch · handcrafted · no two bars identical`;
    const actions = info.querySelector('.product-card__actions,.spotlight-card__actions');
    if (actions) actions.insertAdjacentElement('beforebegin', note);
  });

  /* ════════════════════════════════════════════════════════════════
     10 · CART BADGE SYNC
  ════════════════════════════════════════════════════════════════ */
  function syncCartBadge() {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('bloom_cure_cart') || '[]'); } catch { }
    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    const badge = $('#cart-count');
    if (badge) badge.textContent = count;
  }
  syncCartBadge();
  on(document, 'bloom:cart:updated', syncCartBadge);
  on(document, 'bloom:cart:item:added', () => {
    document.dispatchEvent(new CustomEvent('bloom:cart:updated'));
    syncCartBadge();
  });

  /* ════════════════════════════════════════════════════════════════
     11 · SMART SHIPPING PROGRESS BAR
  ════════════════════════════════════════════════════════════════ */
  function renderShippingBar(container) {
    if (!container) return;
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('bloom_cure_cart') || '[]'); } catch { }
    const total = cart.reduce((s, i) => s + parseFloat(i.price) * (i.quantity || 1), 0);
    const THRESHOLD = 999, pct = clamp((total / THRESHOLD) * 100, 0, 100), rem = THRESHOLD - total;
    let el = container.querySelector('.bc-ship-bar');
    if (!el) {
      el = document.createElement('div');
      el.className = 'bc-ship-bar';
      el.style.cssText = `border:1px solid var(--bc-border);border-radius:10px;
        padding:.85rem 1.1rem;margin:.8rem 0;
        font-family:var(--bc-ff-b);background:rgba(255,255,255,0.016);`;
      container.prepend(el);
    }
    el.innerHTML = pct >= 100
      ? `<div style="display:flex;align-items:center;gap:8px;font-size:.8rem;
           color:var(--bc-green);font-weight:600;">
           <i class="fa-solid fa-truck"></i> Free shipping unlocked 🎉
         </div>`
      : `<div style="display:flex;justify-content:space-between;margin-bottom:.5rem;
           font-size:.72rem;color:var(--bc-muted);">
           <span>Free shipping</span>
           <span>Add <strong style="color:var(--bc-gold);">₹${Math.ceil(rem)}</strong> more</span>
         </div>
         <div style="height:1px;background:var(--bc-border-hi);border-radius:1px;overflow:hidden;">
           <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--bc-gold),rgba(139,168,136,0.8));
             transition:width .7s ease;"></div>
         </div>`;
  }
  setTimeout(() => renderShippingBar($('.cart-summary,.cart-section,.cart-wrapper')), 600);
  on(document, 'bloom:cart:updated', () => renderShippingBar($('.cart-summary,.cart-section,.cart-wrapper')));

  /* ════════════════════════════════════════════════════════════════
     12 · SOCIAL PROOF STRIP
  ════════════════════════════════════════════════════════════════ */
  function injectProofStrip() {
    const sec = $('.testimonial-section,[class*="testimonial"]');
    if (!sec || sec.querySelector('.bc-proof-strip')) return;
    const strip = document.createElement('div');
    strip.className = 'bc-proof-strip bc-r';
    strip.style.cssText = `
      display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;
      border-top:1px solid var(--bc-border);padding:3rem 0;margin-top:3rem;
      font-family:var(--bc-ff-b);
    `;
    const items = [
      { icon: 'fa-star', val: 2847, label: 'Happy Customers' },
      { icon: 'fa-award', val: 98, label: '% Repeat Buyers' },
      { icon: 'fa-seedling', val: 4, label: 'Years Crafting' },
      { icon: 'fa-heart', val: 12000, label: 'Bars Sold' },
    ];
    strip.innerHTML = items.map(it => `
      <div style="text-align:center;">
        <i class="fa-solid ${it.icon}" style="color:var(--bc-gold);font-size:.85rem;
          display:block;margin-bottom:.6rem;opacity:.8;"></i>
        <strong class="bc-counter" data-target="${it.val}"
          style="color:var(--bc-text);font-size:1.8rem;
          font-family:var(--bc-ff-h);font-weight:400;display:block;line-height:1;
          margin-bottom:.4rem;">0</strong>
        <span style="font-size:.55rem;color:var(--bc-dim);letter-spacing:2.5px;
          text-transform:uppercase;font-family:var(--bc-ff-m);">${it.label}</span>
      </div>`).join('');

    const c = sec.querySelector('.container') || sec;
    c.appendChild(strip);
    setTimeout(() => { $$('.bc-counter', strip).forEach(registerCounter); initReveal(); }, 100);
  }
  setTimeout(injectProofStrip, 700);

  /* ════════════════════════════════════════════════════════════════
     13 · STICKY SHOP CTA BAR
     ─ Minimal bottom bar — editorial & clean.
  ════════════════════════════════════════════════════════════════ */
  css(`
    .bc-sticky {
      position:fixed; bottom:0; left:0; right:0; z-index:9000;
      display:flex; align-items:center; justify-content:space-between;
      gap:1.5rem; padding:.9rem 2.5rem;
      background:rgba(9,9,11,0.97);
      border-top:1px solid rgba(201,168,76,0.18);
      backdrop-filter:blur(32px) saturate(1.6);
      -webkit-backdrop-filter:blur(32px) saturate(1.6);
      transform:translateY(100%);
      transition:transform .55s cubic-bezier(0.16,1,0.3,1);
      font-family:var(--bc-ff-b);
    }
    .bc-sticky.show { transform:translateY(0); }
    .bc-sticky::before {
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(201,168,76,0.35),rgba(139,168,136,0.15),transparent);
    }
    .bc-sticky__name {
      font-size:.88rem; font-weight:500; color:var(--bc-text);
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:30vw;
    }
    .bc-sticky__meta {
      font-size:.65rem; color:var(--bc-muted); margin-top:2px;
      font-family:var(--bc-ff-m); letter-spacing:.4px;
    }
    .bc-sticky__meta strong { color:var(--bc-gold); }
    .bc-sticky__right { display:flex; align-items:center; gap:.6rem; flex-shrink:0; }
    .bc-sticky__shop {
      display:inline-flex; align-items:center; gap:7px;
      padding:.56rem 1.4rem; background:var(--bc-gold); color:#09090B;
      border:none; border-radius:6px; font-weight:700; font-size:.66rem;
      letter-spacing:1.8px; text-transform:uppercase; cursor:pointer;
      transition:all .26s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden;
    }
    .bc-sticky__shop:hover { background:var(--bc-gold-hi); transform:translateY(-1px); }
    .bc-sticky__close {
      width:30px; height:30px; border-radius:50%;
      background:transparent; border:1px solid var(--bc-border);
      color:var(--bc-muted); font-size:.7rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .22s ease; flex-shrink:0;
    }
    .bc-sticky__close:hover { border-color:var(--bc-border-hi); color:var(--bc-text); }
    @media(max-width:640px){
      .bc-sticky { padding:.65rem 1rem; gap:.6rem; }
      .bc-sticky__name { font-size:.76rem; max-width:42vw; }
      .bc-sticky__meta { display:none; }
      .bc-sticky__shop { padding:.5rem 1rem; font-size:.6rem; letter-spacing:1.2px; }
      .bc-sticky__close { width:26px; height:26px; font-size:.6rem; }
    }
  `);

  (function createSticky() {
    if ($('.bc-sticky')) return;
    const first = $('.product-card,.spotlight-card,.ag-strip-row');
    if (!first) return;
    const name = first.querySelector('h3')?.textContent?.trim() || 'Our Botanicals';
    const price = first.querySelector('[data-price]')?.dataset?.price || '149';

    const el = document.createElement('div');
    el.className = 'bc-sticky';
    el.innerHTML = `
      <div>
        <div class="bc-sticky__name">${name}</div>
        <div class="bc-sticky__meta">From <strong>₹${price}</strong> &nbsp;·&nbsp; Free shipping above ₹999</div>
      </div>
      <div class="bc-sticky__right">
        <button class="bc-sticky__shop" onclick="window.location.href='shop.html'">
          <i class="fa-solid fa-bag-shopping"></i>Shop Now
        </button>
        <button class="bc-sticky__close" aria-label="Close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('.bc-sticky__close').addEventListener('click', () => {
      el.classList.remove('show');
      sessionStorage.setItem('bc_sticky_off', '1');
      adjustFloatingPositions(false);
    });

    /* Coordinate floating elements on mobile */
    function adjustFloatingPositions(stickyVisible) {
      if (window.innerWidth > 768) return;
      const wa = $('#bc-wa');
      const topB = $('#bc-top');
      const stickyH = stickyVisible ? el.offsetHeight : 0;
      const waBottom = 14 + stickyH;
      if (wa) wa.style.bottom = waBottom + 'px';
      if (topB) topB.style.bottom = (waBottom + 54) + 'px';
    }

    on(window, 'scroll', () => {
      if (sessionStorage.getItem('bc_sticky_off')) return;
      const shouldShow = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) > 0.35;
      const wasShown = el.classList.contains('show');
      el.classList.toggle('show', shouldShow);
      if (shouldShow !== wasShown) adjustFloatingPositions(shouldShow);
    }, { passive: true });
  })();

  /* ════════════════════════════════════════════════════════════════
     14 · EXIT-INTENT MODAL
     ─ Editorial dark card. Playfair Display headline.
  ════════════════════════════════════════════════════════════════ */
  css(`
    .bc-ovl {
      position:fixed; inset:0; z-index:99990;
      background:rgba(0,0,0,0.78); backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center;
      opacity:0; pointer-events:none;
      transition:opacity .4s ease;
    }
    .bc-ovl.open { opacity:1; pointer-events:all; }
    .bc-modal {
      background:#0C0D10;
      border:1px solid rgba(201,168,76,0.16);
      border-radius:18px; overflow:hidden;
      max-width:500px; width:94%;
      box-shadow:0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04);
      font-family:var(--bc-ff-b);
      transform:scale(0.93) translateY(20px);
      transition:transform .45s cubic-bezier(0.16,1,0.3,1);
    }
    .bc-ovl.open .bc-modal { transform:scale(1) translateY(0); }

    .bc-modal__hero {
      position:relative; padding:3rem 2.8rem 2.2rem;
      background:linear-gradient(160deg, rgba(201,168,76,0.05) 0%, transparent 60%);
      border-bottom:1px solid rgba(255,255,255,0.05);
    }
    .bc-modal__hero::before {
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent);
    }
    .bc-modal__close {
      position:absolute; top:1.2rem; right:1.2rem;
      width:32px; height:32px; border-radius:50%;
      background:transparent; border:1px solid rgba(255,255,255,0.08);
      color:rgba(245,240,232,0.35); font-size:.72rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .22s ease;
    }
    .bc-modal__close:hover { color:var(--bc-text); border-color:rgba(255,255,255,0.18); }

    .bc-modal__eyebrow {
      display:inline-flex; align-items:center; gap:6px;
      font-size:.55rem; text-transform:uppercase; letter-spacing:4px;
      color:rgba(201,168,76,0.7); font-weight:500;
      margin-bottom:1.4rem; font-family:var(--bc-ff-m);
    }
    .bc-modal__title {
      font-family:var(--bc-ff-h);
      font-size:2.1rem; font-weight:400;
      color:#FDFAF4; line-height:1.18;
      margin-bottom:.9rem;
    }
    .bc-modal__title em { color:var(--bc-gold); font-style:italic; }
    .bc-modal__sub {
      font-size:.84rem; color:rgba(245,240,232,0.42); line-height:1.8;
    }

    .bc-modal__body { padding:2rem 2.8rem 2.5rem; }
    .bc-modal__form {
      display:flex; gap:5px;
      background:rgba(255,255,255,0.025);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:9px; padding:4px;
      margin-bottom:1.4rem;
      transition:border-color .25s ease;
    }
    .bc-modal__form:focus-within { border-color:rgba(201,168,76,0.3); }
    .bc-modal__input {
      flex:1; background:transparent; border:none; outline:none;
      color:var(--bc-text); font-family:var(--bc-ff-b); font-size:.86rem;
      padding:.52rem 1rem;
    }
    .bc-modal__input::placeholder { color:rgba(245,240,232,0.22); }
    .bc-modal__submit {
      background:var(--bc-gold); color:#09090B; border:none;
      border-radius:6px; padding:.52rem 1.3rem;
      font-family:var(--bc-ff-b); font-weight:700;
      font-size:.64rem; text-transform:uppercase; letter-spacing:1.8px;
      cursor:pointer; transition:all .24s ease; white-space:nowrap;
    }
    .bc-modal__submit:hover { background:var(--bc-gold-hi); }

    .bc-modal__perks {
      display:flex; flex-wrap:wrap; gap:.5rem 1.4rem; margin-bottom:1.5rem;
    }
    .bc-modal__perk {
      display:flex; align-items:center; gap:7px;
      font-size:.73rem; color:var(--bc-muted);
    }
    .bc-modal__perk i { color:var(--bc-green); font-size:.62rem; }
    .bc-modal__divider {
      height:1px; background:rgba(255,255,255,0.04); margin:.2rem 0 1.2rem;
    }
    .bc-modal__skip {
      display:block; text-align:center;
      font-size:.68rem; color:rgba(245,240,232,0.2); cursor:pointer;
      letter-spacing:.5px; transition:color .2s;
    }
    .bc-modal__skip:hover { color:var(--bc-muted); }
    @media(max-width:520px) {
      .bc-modal__hero  { padding:2.4rem 1.8rem 1.8rem; }
      .bc-modal__body  { padding:1.8rem; }
      .bc-modal__title { font-size:1.7rem; }
      .bc-modal__form  { flex-direction:column; gap:8px; }
      .bc-modal__submit{ width:100%; padding:.7rem; }
    }
  `);

  function createExitModal() {
    if ($('.bc-ovl') || localStorage.getItem('bc_exit_shown')) return;
    const ovl = document.createElement('div');
    ovl.className = 'bc-ovl';
    ovl.innerHTML = `
      <div class="bc-modal" role="dialog" aria-modal="true" aria-label="Special offer">
        <div class="bc-modal__hero">
          <button class="bc-modal__close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
          <div class="bc-modal__eyebrow">✦ Botanical Circle</div>
          <h2 class="bc-modal__title">Before you leave,<br>your skin deserves <em>this</em></h2>
          <p class="bc-modal__sub">Join our circle and receive 10% off your first order. Pure, handcrafted   delivered to your door.</p>
        </div>
        <div class="bc-modal__body">
          <form class="bc-modal__form" id="bcExitForm" onsubmit="return false;">
            <input class="bc-modal__input" type="email" placeholder="your@email.com" required aria-label="Email address">
            <button class="bc-modal__submit" type="submit">Claim 10% Off</button>
          </form>
          <div class="bc-modal__perks">
            <span class="bc-modal__perk"><i class="fa-solid fa-check"></i>No spam, ever</span>
            <span class="bc-modal__perk"><i class="fa-solid fa-check"></i>Unsubscribe anytime</span>
            <span class="bc-modal__perk"><i class="fa-solid fa-check"></i>Exclusive member recipes</span>
          </div>
          <div class="bc-modal__divider"></div>
          <span class="bc-modal__skip">No thanks, I'll continue without the offer</span>
        </div>
      </div>`;
    document.body.appendChild(ovl);

    const close = () => { ovl.classList.remove('open'); localStorage.setItem('bc_exit_shown', '1'); };
    ovl.querySelector('.bc-modal__close').addEventListener('click', close);
    ovl.querySelector('.bc-modal__skip').addEventListener('click', close);
    ovl.addEventListener('click', e => { if (e.target === ovl) close(); });

    ovl.querySelector('#bcExitForm').addEventListener('submit', function () {
      const email = this.querySelector('input').value;
      if (!email) return;
      this.innerHTML = `
        <div style="text-align:center;padding:1.4rem;font-family:var(--bc-ff-b);">
          <div style="font-size:1.4rem;margin-bottom:.5rem;">🌿</div>
          <div style="color:var(--bc-green);font-weight:600;font-size:.9rem;margin-bottom:.3rem;">Welcome to the circle!</div>
          <div style="color:var(--bc-muted);font-size:.76rem;">Your 10% code is on its way.</div>
        </div>`;
      localStorage.setItem('bc_exit_shown', '1');
      setTimeout(close, 3800);
    });

    let triggered = false;
    on(document, 'mouseleave', e => {
      if (triggered || e.clientY > 20) return;
      triggered = true;
      ovl.classList.add('open');
    });
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!triggered && !localStorage.getItem('bc_exit_shown')) {
          const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          if (p > 0.5) { triggered = true; ovl.classList.add('open'); }
        }
      }, 65000);
    };
    on(document, 'touchstart', reset, { passive: true });
    reset();
  }
  setTimeout(createExitModal, 9000);

  /* ════════════════════════════════════════════════════════════════
     15 · COOKIE CONSENT BANNER
     ─ Premium editorial card · Apothecary Noir.
  ════════════════════════════════════════════════════════════════ */
  css(`
    /* ── Border shimmer keyframes ── */
    @keyframes bc-cookie-shimmer {
      0%   { background-position:200% center; }
      100% { background-position:-200% center; }
    }
    @keyframes bc-cookie-float {
      0%,100% { transform:translateY(0); }
      50%     { transform:translateY(-3px); }
    }
    @keyframes bc-cookie-fadeChild {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ── Container ── */
    .bc-cookie {
      position:fixed; bottom:24px; right:24px;
      max-width:380px; width:calc(100% - 48px); z-index:99998;
      background:rgba(12,13,16,0.97);
      border:1px solid transparent;
      border-radius:18px;
      padding:0;
      box-shadow:
        0 32px 80px rgba(0,0,0,0.6),
        0 0 0 1px rgba(255,255,255,0.03),
        inset 0 1px 0 rgba(255,255,255,0.04);
      backdrop-filter:blur(40px) saturate(1.6);
      -webkit-backdrop-filter:blur(40px) saturate(1.6);
      transform:translateY(180%) scale(0.96);
      opacity:0;
      transition:transform .65s cubic-bezier(0.16,1,0.3,1),
                 opacity .45s ease;
      font-family:var(--bc-ff-b);
      overflow:hidden;
    }
    .bc-cookie.show {
      transform:translateY(0) scale(1);
      opacity:1;
    }

    /* ── Animated gradient border overlay ── */
    .bc-cookie::before {
      content:''; position:absolute; inset:-1px;
      border-radius:19px; z-index:-1;
      background:linear-gradient(
        90deg,
        transparent 0%,
        rgba(201,168,76,0.06) 15%,
        rgba(201,168,76,0.28) 50%,
        rgba(139,168,136,0.12) 85%,
        transparent 100%
      );
      background-size:200% 100%;
      animation:bc-cookie-shimmer 6s ease-in-out infinite;
    }
    /* ── Top gold accent line ── */
    .bc-cookie::after {
      content:''; position:absolute; top:0; left:2rem; right:2rem;
      height:1px;
      background:linear-gradient(90deg,transparent,rgba(201,168,76,0.35),rgba(139,168,136,0.15),transparent);
    }

    /* ── Header section ── */
    .bc-cookie__header {
      padding:1.6rem 1.8rem 0;
      display:flex; align-items:flex-start; justify-content:space-between;
      animation:bc-cookie-fadeChild .5s ease .15s both;
    }
    .bc-cookie__icon {
      width:38px; height:38px; border-radius:10px;
      background:linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.03));
      border:1px solid rgba(201,168,76,0.14);
      display:flex; align-items:center; justify-content:center;
      font-size:.9rem; color:var(--bc-gold); flex-shrink:0;
      animation:bc-cookie-float 4s ease-in-out infinite;
    }
    .bc-cookie__headerText {
      flex:1; margin-left:1rem;
    }
    .bc-cookie__eyebrow {
      display:flex; align-items:center; gap:6px;
      font-size:.5rem; text-transform:uppercase; letter-spacing:3.5px;
      color:rgba(201,168,76,0.6); font-weight:600;
      margin-bottom:.45rem; font-family:var(--bc-ff-m);
    }
    .bc-cookie__title {
      font-family:var(--bc-ff-h);
      font-size:1.05rem; font-weight:400;
      color:var(--bc-text); line-height:1.3;
    }
    .bc-cookie__close {
      width:28px; height:28px; border-radius:50%;
      background:transparent; border:1px solid rgba(255,255,255,0.06);
      color:rgba(245,240,232,0.25); font-size:.6rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .22s ease; flex-shrink:0; margin-top:2px;
    }
    .bc-cookie__close:hover {
      border-color:rgba(201,168,76,0.25);
      color:var(--bc-text);
      background:rgba(255,255,255,0.03);
    }

    /* ── Body ── */
    .bc-cookie__body {
      padding:1rem 1.8rem 0;
      animation:bc-cookie-fadeChild .5s ease .3s both;
    }
    .bc-cookie__text {
      font-size:.76rem; line-height:1.8;
      color:rgba(245,240,232,0.38); margin:0;
    }
    .bc-cookie__text a {
      color:rgba(201,168,76,0.65); text-decoration:none;
      border-bottom:1px solid rgba(201,168,76,0.15);
      transition:all .2s ease;
    }
    .bc-cookie__text a:hover {
      color:var(--bc-gold); border-bottom-color:rgba(201,168,76,0.4);
    }

    /* ── Toggle rows ── */
    .bc-cookie__toggles {
      padding:.9rem 1.8rem 0;
      display:flex; flex-direction:column; gap:0;
      animation:bc-cookie-fadeChild .5s ease .45s both;
    }
    .bc-cookie__row {
      display:flex; align-items:center; justify-content:space-between;
      padding:.6rem 0;
      border-bottom:1px solid rgba(255,255,255,0.03);
    }
    .bc-cookie__row:last-child { border-bottom:none; }
    .bc-cookie__rowLabel {
      font-size:.72rem; color:rgba(245,240,232,0.55);
      display:flex; align-items:center; gap:7px;
    }
    .bc-cookie__rowLabel i {
      font-size:.55rem; color:rgba(201,168,76,0.4);
      width:14px; text-align:center;
    }
    .bc-cookie__rowTag {
      font-size:.48rem; text-transform:uppercase; letter-spacing:1.5px;
      color:rgba(245,240,232,0.18); font-family:var(--bc-ff-m);
      padding:2px 6px; border-radius:3px;
      background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04);
    }

    /* ── Custom toggle switch ── */
    .bc-cookie__switch {
      position:relative; width:34px; height:18px; flex-shrink:0;
    }
    .bc-cookie__switch input {
      opacity:0; width:0; height:0; position:absolute;
    }
    .bc-cookie__slider {
      position:absolute; inset:0; cursor:pointer;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:10px;
      transition:all .3s cubic-bezier(0.16,1,0.3,1);
    }
    .bc-cookie__slider::before {
      content:''; position:absolute;
      width:12px; height:12px; border-radius:50%;
      left:2px; bottom:2px;
      background:rgba(245,240,232,0.3);
      transition:all .3s cubic-bezier(0.16,1,0.3,1);
    }
    .bc-cookie__switch input:checked + .bc-cookie__slider {
      background:rgba(201,168,76,0.2);
      border-color:rgba(201,168,76,0.35);
    }
    .bc-cookie__switch input:checked + .bc-cookie__slider::before {
      transform:translateX(16px);
      background:var(--bc-gold);
      box-shadow:0 0 8px rgba(201,168,76,0.35);
    }
    .bc-cookie__switch input:disabled + .bc-cookie__slider {
      opacity:.5; cursor:not-allowed;
    }
    .bc-cookie__switch input:disabled:checked + .bc-cookie__slider {
      opacity:.7;
    }

    /* ── Actions ── */
    .bc-cookie__actions {
      padding:1.1rem 1.8rem 1.5rem;
      display:flex; gap:8px;
      animation:bc-cookie-fadeChild .5s ease .6s both;
    }
    .bc-cookie__btn {
      flex:1; padding:.65rem .8rem; border:none; border-radius:8px;
      font-weight:700; font-size:.58rem; text-transform:uppercase;
      letter-spacing:2px; cursor:pointer;
      transition:all .28s cubic-bezier(0.16,1,0.3,1);
      font-family:var(--bc-ff-b); position:relative; overflow:hidden;
    }
    .bc-cookie__btn--accept {
      background:linear-gradient(135deg,var(--bc-gold),#B89A3E);
      color:#09090B;
      box-shadow:0 4px 16px rgba(201,168,76,0.2);
    }
    .bc-cookie__btn--accept:hover {
      background:linear-gradient(135deg,var(--bc-gold-hi),var(--bc-gold));
      transform:translateY(-2px);
      box-shadow:0 8px 24px rgba(201,168,76,0.3);
    }
    .bc-cookie__btn--accept:active { transform:translateY(0) scale(0.98); }
    .bc-cookie__btn--save {
      background:rgba(255,255,255,0.03);
      border:1px solid rgba(255,255,255,0.08);
      color:rgba(245,240,232,0.5);
    }
    .bc-cookie__btn--save:hover {
      border-color:rgba(201,168,76,0.25);
      color:var(--bc-gold);
      background:rgba(201,168,76,0.04);
    }
    .bc-cookie__btn--save:active { transform:scale(0.97); }

    /* ── Responsive ── */
    @media(max-width:480px){
      .bc-cookie {
        left:10px; right:10px; bottom:10px;
        max-width:none; width:auto;
        border-radius:16px;
      }
      .bc-cookie__header { padding:1.3rem 1.4rem 0; }
      .bc-cookie__body   { padding:.8rem 1.4rem 0; }
      .bc-cookie__toggles{ padding:.7rem 1.4rem 0; }
      .bc-cookie__actions{ padding:1rem 1.4rem 1.3rem; flex-direction:column; }
      .bc-cookie__title  { font-size:.95rem; }
    }
  `);

  (function createCookieBanner() {
    if (localStorage.getItem('bc_cookie_consent')) return;
    const el = document.createElement('div');
    el.className = 'bc-cookie';
    el.innerHTML = `
      <div class="bc-cookie__header">
        <div class="bc-cookie__icon">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div class="bc-cookie__headerText">
          <div class="bc-cookie__eyebrow">✦ Privacy</div>
          <div class="bc-cookie__title">Your experience, your choice</div>
        </div>
        <button class="bc-cookie__close" aria-label="Close cookie banner">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="bc-cookie__body">
        <p class="bc-cookie__text">We use cookies to craft your botanical experience. Essential ones keep things running; optional ones personalise your journey. <a href="privacy.html">Learn more</a></p>
      </div>

      <div class="bc-cookie__toggles">
        <div class="bc-cookie__row">
          <span class="bc-cookie__rowLabel">
            <i class="fa-solid fa-lock"></i> Essential
            <span class="bc-cookie__rowTag">Always on</span>
          </span>
          <label class="bc-cookie__switch">
            <input type="checkbox" checked disabled>
            <span class="bc-cookie__slider"></span>
          </label>
        </div>
        <div class="bc-cookie__row">
          <span class="bc-cookie__rowLabel">
            <i class="fa-solid fa-chart-simple"></i> Analytics
          </span>
          <label class="bc-cookie__switch">
            <input type="checkbox" data-cookie="analytics">
            <span class="bc-cookie__slider"></span>
          </label>
        </div>
        <div class="bc-cookie__row">
          <span class="bc-cookie__rowLabel">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Personalisation
          </span>
          <label class="bc-cookie__switch">
            <input type="checkbox" data-cookie="personalisation">
            <span class="bc-cookie__slider"></span>
          </label>
        </div>
      </div>

      <div class="bc-cookie__actions">
        <button class="bc-cookie__btn bc-cookie__btn--accept" id="bcCookieAcc">Accept All</button>
        <button class="bc-cookie__btn bc-cookie__btn--save" id="bcCookieSave">Save Preferences</button>
      </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('show'), 2200);

    const dismiss = (consent) => {
      el.classList.remove('show');
      localStorage.setItem('bc_cookie_consent', JSON.stringify(consent));
      setTimeout(() => el.remove(), 700);
    };

    /* Accept All — checks every toggle & saves */
    el.querySelector('#bcCookieAcc').addEventListener('click', () => {
      el.querySelectorAll('.bc-cookie__switch input:not(:disabled)').forEach(i => i.checked = true);
      dismiss({ essential: true, analytics: true, personalisation: true });
    });

    /* Save Preferences — reads toggle state */
    el.querySelector('#bcCookieSave').addEventListener('click', () => {
      const consent = { essential: true };
      el.querySelectorAll('.bc-cookie__switch input[data-cookie]').forEach(i => {
        consent[i.dataset.cookie] = i.checked;
      });
      dismiss(consent);
    });

    /* Close X — same as essential-only */
    el.querySelector('.bc-cookie__close').addEventListener('click', () => {
      dismiss({ essential: true, analytics: false, personalisation: false });
    });
  })();


  /* ════════════════════════════════════════════════════════════════
     16 · FLOATING WHATSAPP BUTTON
  ════════════════════════════════════════════════════════════════ */
  css(`
    #bc-wa {
      position:fixed; bottom:90px; right:24px; z-index:9100;
      width:50px; height:50px; border-radius:50%;
      background:#25D366; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-size:1.3rem; text-decoration:none;
      box-shadow:0 6px 22px rgba(37,211,102,0.35);
      transition:all .35s cubic-bezier(0.16,1,0.3,1);
      animation:bc-wa-pop .6s cubic-bezier(0.16,1,0.3,1) 3.5s both;
    }
    #bc-wa:hover { transform:scale(1.1) translateY(-2px); box-shadow:0 10px 30px rgba(37,211,102,0.45); }
    #bc-wa::after {
      content:''; position:absolute; inset:-5px; border-radius:50%;
      border:2px solid rgba(37,211,102,0.28);
      animation:bc-wa-ring 2.8s ease-out infinite 4.5s;
    }
    @media(max-width:768px){
      #bc-wa { bottom:14px; right:14px; width:44px; height:44px; font-size:1.1rem; }
    }
  `);

  (function createWA() {
    if ($('#bc-wa')) return;
    const WA = '918431231056';
    const MSG = encodeURIComponent('Hi! I visited Bloom Cure and would like to know more about your products.');
    const a = document.createElement('a');
    a.id = 'bc-wa'; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.href = `https://wa.me/${WA}?text=${MSG}`;
    a.setAttribute('aria-label', 'Chat on WhatsApp');
    a.innerHTML = `<i class="fa-brands fa-whatsapp"></i>`;
    document.body.appendChild(a);
  })();

  /* ════════════════════════════════════════════════════════════════
     17 · TIME-BASED GREETING
  ════════════════════════════════════════════════════════════════ */
  (function greeting() {
    const hero = $('.ag-hero,.hero-section');
    if (!hero || hero.querySelector('.bc-greeting')) return;
    const h = new Date().getHours();
    const g = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
    const el = document.createElement('div');
    el.className = 'bc-greeting';
    el.style.cssText = `
      position:absolute;top:1.4rem;right:5rem;
      font-size:.56rem;letter-spacing:3.5px;text-transform:uppercase;
      color:rgba(245,240,232,0.2);font-family:var(--bc-ff-m);
      pointer-events:none;z-index:50;`;
    el.textContent = `// ${g}`;
    hero.style.position = hero.style.position || 'relative';
    hero.appendChild(el);
  })();

  /* ════════════════════════════════════════════════════════════════
     18 · IDLE NUDGE
  ════════════════════════════════════════════════════════════════ */
  css(`
    .bc-nudge {
      position:fixed; bottom:28px; left:50%; z-index:9200;
      transform:translateX(-50%) translateY(30px);
      background:#0C0D10; border:1px solid rgba(201,168,76,0.18);
      border-radius:10px; padding:.75rem 1.4rem;
      display:flex; align-items:center; gap:10px;
      font-size:.75rem; color:rgba(245,240,232,0.45);
      box-shadow:0 16px 44px rgba(0,0,0,0.5);
      animation:bc-nudge-in .5s cubic-bezier(0.16,1,0.3,1) forwards;
      font-family:var(--bc-ff-b); white-space:nowrap;
    }
    .bc-nudge a { color:var(--bc-gold); text-decoration:none; font-weight:600; }
    .bc-nudge a:hover { color:var(--bc-gold-hi); }
    .bc-nudge__close {
      cursor:pointer; color:rgba(245,240,232,0.2); font-size:.65rem;
      margin-left:6px; transition:color .2s;
    }
    .bc-nudge__close:hover { color:var(--bc-muted); }
    @media(max-width:768px){
      .bc-nudge {
        bottom:68px; left:12px; right:12px;
        transform:translateX(0) translateY(30px);
        white-space:normal; font-size:.7rem;
        padding:.65rem 1rem; border-radius:8px;
        max-width:none; width:auto;
      }
    }
  `);

  (function idleNudge() {
    let idle; let shown = false;
    const reset = () => {
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (shown || window.scrollY < 180) return;
        shown = true;
        const el = document.createElement('div');
        el.className = 'bc-nudge';
        el.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles" style="color:var(--bc-gold);"></i>
          Still exploring? Let Bloomi <a href="assistant.html">craft your ritual</a>.
          <span class="bc-nudge__close" title="Dismiss">✕</span>`;
        document.body.appendChild(el);
        el.querySelector('.bc-nudge__close').addEventListener('click', () => el.remove());
        setTimeout(() => el?.remove(), 10000);
      }, 52000);
    };
    ['scroll', 'mousemove', 'click', 'keydown', 'touchstart'].forEach(ev =>
      on(document, ev, reset, { passive: true }));
    reset();
  })();

  /* ════════════════════════════════════════════════════════════════
     19 · "X VIEWING" BADGE (product pages)
  ════════════════════════════════════════════════════════════════ */
  function addViewerBadges() {
    $$('.product-card,.spotlight-card').forEach(card => {
      if (card.querySelector('.bc-viewers')) return;
      const n = Math.floor(Math.random() * 12) + 3;
      const b = document.createElement('div');
      b.className = 'bc-viewers';
      b.style.cssText = `display:inline-flex;align-items:center;gap:5px;
        font-size:.6rem;color:rgba(245,240,232,0.35);margin-top:5px;
        font-family:var(--bc-ff-m);letter-spacing:.3px;`;
      b.innerHTML = `<span style="width:5px;height:5px;border-radius:50%;background:var(--bc-green);
        box-shadow:0 0 5px var(--bc-green);display:inline-block;
        animation:bc-pulse 2.4s ease-in-out infinite;"></span> ${n} viewing`;
      card.querySelector('.product-card__info,.spotlight-card__body')?.prepend(b);
    });
  }

  setTimeout(addViewerBadges, 900);

  /* ── Done ─────────────────────────────────────────────────────── */
  console.info('%c[Bloom Cure] Psychology Engine v4.0 · 19 triggers',
    'color:#C9A84C;font-weight:700;font-size:11px;background:#09090B;padding:3px 8px;border-radius:4px;');

})();
