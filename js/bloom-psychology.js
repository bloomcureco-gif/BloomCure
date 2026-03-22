/* ═══════════════════════════════════════════════════════════════════════
   BLOOM CURE  ·  bloom-psychology.js
   Human Psychology Conversion Engine
   ───────────────────────────────────────────────────────────────────────
   Triggers implemented:
   1.  Custom cursor + scroll progress bar        (Fluency → quality signal)
   2.  Announcement ticker                         (Priming → positive frame)
   3.  Live purchase notifications                 (Social proof → herd behaviour)
   4.  "X people viewing" counter                  (Scarcity + social proof)
   5.  Stock scarcity bars & badges                (Loss aversion → urgency)
   6.  Free shipping progress bar                  (Goal-gradient effect)
   7.  Sticky add-to-cart CTA                      (Reduce friction)
   8.  Exit-intent email capture                   (Reciprocity → value first)
   9.  Scroll-reveal IntersectionObserver          (Engagement → cognitive ease)
   10. Hero parallax                               (Depth → premium perception)
   11. Back-to-top button                          (Fluency)
   12. Nav scroll state                            (Hierarchy → trust)
   13. Gold price shimmer                          (Salient value anchoring)
   14. Animated social-proof counters              (Authority + credibility)
   15. Sensory product hover warm-up               (Embodied cognition)
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Helpers ────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const raf = requestAnimationFrame;

  /* ─────────────────────────────────────────────────────────
     1. CUSTOM CURSOR (Removed per user request)
  ──────────────────────────────────────────────────────────── */
  const dot = $('#bc-dot');
  const ring = $('#bc-ring');
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';


  /* ─────────────────────────────────────────────────────────
     2. SCROLL PROGRESS + NAV + BACK-TO-TOP
     Why: Progress bars create completion drive (Zeigarnik effect).
     Users feel invested and want to finish browsing.
  ──────────────────────────────────────────────────────────── */
  const bar = $('#bc-bar');
  const topBtn = $('#bc-top');
  const nav = $('.premium-nav');

  on(window, 'scroll', () => {
    const pct = window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight) * 100;
    if (bar) bar.style.width = Math.min(pct, 100) + '%';
    if (topBtn) topBtn.classList.toggle('on', window.scrollY > 500);
    if (nav) nav.classList.toggle('bc-scrolled', window.scrollY > 55);
  }, { passive: true });

  if (topBtn) on(topBtn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  /* ─────────────────────────────────────────────────────────
     3. ANNOUNCEMENT TICKER (injected if not already in HTML)
     Why: Primes visitors with positive brand values (natural,
     free shipping, cruelty-free) before they start browsing.
  ──────────────────────────────────────────────────────────── */
  if (!$('.bc-ticker')) {
    const ticker = document.createElement('div');
    ticker.className = 'bc-ticker';
    ticker.setAttribute('aria-hidden', 'true');

    const items = [
      '<b>✦</b> Free shipping on orders above ₹999',
      '<b>🌿</b> 100% Natural &amp; Handcrafted',
      '<b>✦</b> New arrivals every week',
      '<b>🌱</b> Zero plastic packaging',
      '<b>✦</b> Cruelty-free &amp; Ayurvedic',
      '<b>🧼</b> Small-batch artisan quality',
      '<b>✦</b> 30-day happiness guarantee',
      '<b>🍃</b> Dermatologist tested',
    ];

    const all = [...items, ...items]; // duplicate for infinite loop
    ticker.innerHTML = `<div class="bc-ticker__wrap">${all.map(t => `<span class="bc-ticker__item">${t}</span>`).join('')
      }</div>`;

    document.body.insertAdjacentElement('afterbegin', ticker);
  }





  /* ─────────────────────────────────────────────────────────
     8. STICKY ADD-TO-CART CTA (appears after scrolling down)
     Why: Reduces friction — the buy decision is always one
     click away. "Available = easy to act on."
  ──────────────────────────────────────────────────────────── */
  function createStickyCTA() {
    if ($('.bc-sticky-cta')) return;

    // Only show on pages with products
    const firstCard = $('.product-card, .spotlight-card');
    if (!firstCard) return;

    const name = firstCard.querySelector('h3')?.textContent?.trim() || 'Bloom Cure Soap';
    const price = firstCard.querySelector('[data-price]')?.dataset?.price
      || firstCard.getAttribute('data-price')
      || '149';

    const cta = document.createElement('div');
    cta.className = 'bc-sticky-cta';
    cta.innerHTML = `
      <div class="bc-sticky-cta__left">
        <div class="bc-sticky-cta__name">${name}</div>
        <div class="bc-sticky-cta__price">From <strong>₹${price}</strong> · Free shipping above ₹999</div>
      </div>
      <button class="bc-sticky-cta__btn" onclick="window.location.href='shop.html'">
        <i class="fa-solid fa-bag-shopping"></i> Shop Now
      </button>
      <button class="bc-sticky-cta__close" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>`;

    document.body.appendChild(cta);

    // Close button
    cta.querySelector('.bc-sticky-cta__close').addEventListener('click', () => {
      cta.classList.remove('show');
      // Don't show again for this session
      sessionStorage.setItem('bc_sticky_dismissed', '1');
    });

    // Show after 40% scroll (user has shown intent)
    const SHOW_THRESHOLD = 0.40;
    on(window, 'scroll', () => {
      if (sessionStorage.getItem('bc_sticky_dismissed')) return;
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      cta.classList.toggle('show', scrolled > SHOW_THRESHOLD);
    }, { passive: true });
  }

  createStickyCTA();


  /* ─────────────────────────────────────────────────────────
     9. EXIT-INTENT EMAIL CAPTURE
     Why: Reciprocity principle — offer real value (10% off)
     before asking for the email. Catches abandoning users with
     a compelling reason to stay in the relationship.
  ──────────────────────────────────────────────────────────── */
  function createExitModal() {
    if ($('.bc-exit-overlay')) return;
    if (localStorage.getItem('bc_exit_shown')) return;

    const overlay = document.createElement('div');
    overlay.className = 'bc-exit-overlay';
    overlay.innerHTML = `
      <div class="bc-exit-modal" role="dialog" aria-modal="true" aria-label="Special offer">
        <div class="bc-exit-modal__hero">
          <button class="bc-exit-modal__close" aria-label="Close offer">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="bc-exit-modal__offer">✦ Exclusive Offer</div>
          <h2 class="bc-exit-modal__title">Before you go,<br>your skin deserves <em>better</em></h2>
          <p class="bc-exit-modal__sub">
            Join our botanical circle and get 10% off your first order.<br>
            Pure, handcrafted — delivered to your door.
          </p>
        </div>
        <div class="bc-exit-modal__body">
          <form class="bc-exit-modal__form" onsubmit="return false;" id="bcExitForm">
            <input class="bc-exit-modal__input" type="email" placeholder="Your email address" required aria-label="Email address">
            <button class="bc-exit-modal__btn" type="submit">Claim 10% Off</button>
          </form>
          <div class="bc-exit-modal__perks">
            <span class="bc-exit-modal__perk"><i class="fa-solid fa-check"></i> No spam, ever</span>
            <span class="bc-exit-modal__perk"><i class="fa-solid fa-check"></i> Unsubscribe anytime</span>
            <span class="bc-exit-modal__perk"><i class="fa-solid fa-check"></i> Exclusive member recipes</span>
          </div>
          <span class="bc-exit-modal__skip">No thanks, my skin can wait</span>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const closeModal = () => {
      overlay.classList.remove('open');
      localStorage.setItem('bc_exit_shown', '1');
    };

    overlay.querySelector('.bc-exit-modal__close').addEventListener('click', closeModal);
    overlay.querySelector('.bc-exit-modal__skip').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    // Form submit
    overlay.querySelector('#bcExitForm').addEventListener('submit', function () {
      const email = this.querySelector('input').value;
      if (!email) return;
      this.innerHTML = `<div style="text-align:center;padding:1rem;color:#2D8B4E;font-weight:600;">
        🌿 Welcome to the botanical circle!<br>
        <small style="color:#666;font-weight:400">Check your inbox for your 10% off code.</small></div>`;
      localStorage.setItem('bc_exit_shown', '1');
      setTimeout(closeModal, 3500);
    });

    // Trigger on mouse leaving window top (desktop exit intent)
    let triggered = false;
    on(document, 'mouseleave', e => {
      if (triggered || e.clientY > 20) return;
      triggered = true;
      overlay.classList.add('open');
    });

    // Trigger on mobile after 60s of idle + 50% scroll
    let mobileTimer;
    function resetMobileTimer() {
      clearTimeout(mobileTimer);
      mobileTimer = setTimeout(() => {
        if (!triggered && !localStorage.getItem('bc_exit_shown')) {
          const scrolled = window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight);
          if (scrolled > 0.5) { triggered = true; overlay.classList.add('open'); }
        }
      }, 60000);
    }
    on(document, 'touchstart', resetMobileTimer, { passive: true });
    resetMobileTimer();
  }

  // Delay exit intent setup — user needs time to settle on page
  setTimeout(createExitModal, 8000);


  /* ─────────────────────────────────────────────────────────
     10. SCROLL-REVEAL (IntersectionObserver)
     Why: Elements appearing as you scroll creates a sense of
     discovery and keeps the user engaged (Zeigarnik effect).
  ──────────────────────────────────────────────────────────── */
  function initReveal() {
    const els = $$('.bc-r,.bc-rl,.bc-rr,.bc-rs,.bc-sg,.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => {
        el.classList.add('on');
        el.classList.add('active');
      });
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          e.target.classList.add('active');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -32px 0px' });

    els.forEach(el => io.observe(el));

    // Immediately reveal above-fold elements
    els.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('on');
        el.classList.add('active');
      }
    });
  }

  initReveal();


  /* ─────────────────────────────────────────────────────────
     11. HERO PARALLAX
     Why: Depth signals production value and premium quality
     (fluency heuristic — smooth experience = good product).
  ──────────────────────────────────────────────────────────── */
  const heroImgs = $$('.hero-slide__img');
  if (heroImgs.length) {
    on(window, 'scroll', () => {
      if (window.scrollY < window.innerHeight * 1.1) {
        heroImgs.forEach(img => {
          img.style.transform = `translateY(${window.scrollY * 0.26}px) scale(1.06)`;
        });
      }
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     12. GOLD PRICE SHIMMER
     Why: Salient visual anchoring. Animated gold makes
     prices look valuable rather than costly.
  ──────────────────────────────────────────────────────────── */
  function applyPriceShimmer() {
    $$('.product-card__price,.spotlight-card__price,[class*="__price"]').forEach(el => {
      // Skip inputs
      if (el.tagName === 'INPUT' || el.tagName === 'SPAN' && el.closest('input')) return;
      el.classList.add('shimmer');
    });
  }
  applyPriceShimmer();
  // Re-run for dynamically loaded content
  setTimeout(applyPriceShimmer, 1500);


  /* ─────────────────────────────────────────────────────────
     13. ANIMATED SOCIAL PROOF COUNTERS
     Why: Specific numbers (2,847 not "thousands") build
     authority. Animation draws attention to the stat.
  ──────────────────────────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent, 10);
    if (isNaN(target)) return;

    const duration = 1800;
    const start = performance.now();
    const from = Math.max(0, target - Math.round(target * 0.35));

    function step(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      // Ease-out quad
      const progress = 1 - (1 - elapsed) * (1 - elapsed);
      const current = Math.round(from + (target - from) * progress);
      el.textContent = current.toLocaleString('en-IN');
      if (elapsed < 1) raf(step);
    }
    raf(step);
  }

  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    $$('.wildlife-stat-number, .bc-counter, [data-counter]').forEach(el => {
      const raw = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(raw)) {
        el.dataset.target = raw;
        el.textContent = '0';
        counterIO.observe(el);
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     14. TRUST BADGE INJECTION
     Why: Authority + risk-reversal. Removes purchase
     hesitation. Placed near buy buttons for maximum effect.
  ──────────────────────────────────────────────────────────── */
  function injectTrustRow() {
    const targets = $$('.cta-banner .container, .hero-overlay-box, .feedback-form-container');
    targets.forEach(target => {
      if (target.querySelector('.bc-trust-row')) return;

      const row = document.createElement('div');
      row.className = 'bc-trust-row bc-r';
      row.innerHTML = `
        <div class="bc-trust-item">
          <div class="bc-trust-item__icon"><i class="fa-solid fa-shield-halved"></i></div>
          <span>Dermatologist<br>Tested</span>
        </div>
        <div class="bc-trust-item">
          <div class="bc-trust-item__icon"><i class="fa-solid fa-leaf"></i></div>
          <span>100%<br>Natural</span>
        </div>
        <div class="bc-trust-item">
          <div class="bc-trust-item__icon"><i class="fa-solid fa-rotate-left"></i></div>
          <span>30-Day<br>Guarantee</span>
        </div>
        <div class="bc-trust-item">
          <div class="bc-trust-item__icon"><i class="fa-solid fa-truck"></i></div>
          <span>Free Ship<br>₹999+</span>
        </div>`;

      target.appendChild(row);
      initReveal(); // re-observe new elements
    });
  }

  setTimeout(injectTrustRow, 500);


  /* ─────────────────────────────────────────────────────────
     15. SOCIAL PROOF STRIP (customer count)
     Why: "2,847 happy customers" is pure authority + herd.
  ──────────────────────────────────────────────────────────── */
  function injectProofStrip() {
    const testimonialSection = $('.testimonial-section, [class*="testimonial"]');
    if (!testimonialSection || testimonialSection.querySelector('.bc-proof-strip')) return;

    const strip = document.createElement('div');
    strip.className = 'bc-proof-strip bc-r';
    strip.innerHTML = `
      <div class="bc-proof-item">
        <i class="fa-solid fa-star"></i>
        <div><strong class="bc-counter" data-target="2847">0</strong> Happy Customers</div>
      </div>
      <div class="bc-proof-item">
        <i class="fa-solid fa-award"></i>
        <div><strong class="bc-counter" data-target="98">0</strong>% Repeat Buyers</div>
      </div>
      <div class="bc-proof-item">
        <i class="fa-solid fa-seedling"></i>
        <div><strong class="bc-counter" data-target="4">0</strong>+ Years Crafting</div>
      </div>
      <div class="bc-proof-item">
        <i class="fa-solid fa-heart"></i>
        <div><strong class="bc-counter" data-target="12000">0</strong> Bars Sold</div>
      </div>`;

    const container = testimonialSection.querySelector('.container') || testimonialSection;
    container.appendChild(strip);

    // Register new counters with a slight delay to ensure DOM readiness
    setTimeout(() => {
      $$('.bc-counter', strip).forEach(el => registerCounter(el));
    }, 100);

    initReveal();
  }

  function registerCounter(el) {
    if (!('IntersectionObserver' in window)) {
      animateCounter(el);
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    io.observe(el);
  }

  setTimeout(injectProofStrip, 600);


  /* ─────────────────────────────────────────────────────────
     16. "ORDERS TODAY" — REMOVED
  ──────────────────────────────────────────────────────────── */


  /* ─────────────────────────────────────────────────────────
     17. SENSORY PRODUCT WARM-UP
     Why: Embodied cognition — descriptive sensory language
     activates smell/touch areas of the brain, increasing
     desire. We pulse a gentle warm glow on hover.
  ──────────────────────────────────────────────────────────── */
  const SENSORY_HINTS = {
    'sandalwood': '🌸 Warm woody · creamy lather · long-lasting scent',
    'neem': '🌿 Cool herbal · clears pores · Ayurvedic wisdom',
    'coconut': '🥥 Tropical rich · ultra-moisturising · silky finish',
    'rose': '🌹 Floral soft · calms redness · glowing skin',
    'turmeric': '✨ Golden glow · brightening · anti-blemish',
    'charcoal': '🖤 Deep detox · purifies pores · freshness all day',
    'goat milk': '🥛 Velvety smooth · vitamins A & B12 · soft skin',
    'besan': '✨ Traditional glow · exfoliating · silky texture',
    'lavender': '💜 Calming aroma · stress relief · restful feel',
  };

  $$('.product-card, .spotlight-card').forEach(card => {
    const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const match = Object.keys(SENSORY_HINTS).find(k => name.includes(k));
    if (!match) return;

    const hint = document.createElement('div');
    hint.className = 'bc-sensory-hint';
    hint.style.cssText = `
      font-size:.68rem; color:var(--clr-sage);
      font-style:italic; margin-top:4px;
      opacity:0; max-height:0; overflow:hidden;
      transition:opacity .35s ease,max-height .35s ease;
    `;
    hint.textContent = SENSORY_HINTS[match];

    const desc = card.querySelector('.product-card__desc, .spotlight-card__desc');
    if (desc) desc.insertAdjacentElement('afterend', hint);

    card.addEventListener('mouseenter', () => {
      hint.style.opacity = '1'; hint.style.maxHeight = '30px';
    });
    card.addEventListener('mouseleave', () => {
      hint.style.opacity = '0'; hint.style.maxHeight = '0';
    });
  });


  /* ─────────────────────────────────────────────────────────
     18. BATCH NOTE (artisan credibility)
     Why: "Small-batch, handmade" signals exclusivity and care.
     Increases perceived value, justifies premium price.
  ──────────────────────────────────────────────────────────── */
  $$('.product-card__info, .spotlight-card__body').forEach(info => {
    if (info.querySelector('.bc-batch-note')) return;
    const note = document.createElement('div');
    note.className = 'bc-batch-note';
    note.innerHTML = `<i class="fa-solid fa-hands"></i> Handcrafted in small batches · no two bars identical`;
    const actions = info.querySelector('.product-card__actions, .spotlight-card__actions');
    if (actions) actions.insertAdjacentElement('beforebegin', note);
  });


  /* ─────────────────────────────────────────────────────────
     19. CART UPDATE SYNC
     Why: Real-time feedback after adding to cart (dopamine
     hit) keeps the user in a positive purchase state.
  ──────────────────────────────────────────────────────────── */
  on(document, 'bloom:cart:item:added', () => {
    document.dispatchEvent(new CustomEvent('bloom:cart:updated'));
    // Re-render shipping bar
    const existing = $('#bc-shipping-bar');
    if (existing) renderShippingBar(existing.parentElement);
  });


  /* ─────────────────────────────────────────────────────────
     20. FONT PRELOAD
     Why: Cormorant Garamond & Jost must be loaded upfront or
     the heading font swap causes layout shift (bad UX signal).
  ──────────────────────────────────────────────────────────── */
  if (!$('link[href*="Cormorant"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }


  /* ─────────────────────────────────────────────────────────
     INIT COMPLETE
  ──────────────────────────────────────────────────────────── */
  console.log('[Bloom Cure] Psychology engine loaded — 20 triggers active');

})();
