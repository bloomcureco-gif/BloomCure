/* ═══════════════════════════════════════════════════════════════════════
   BLOOM CURE  ·  bloom-smooth.js  v1.0
   Premium Smooth Scrolling Engine  ·  Apothecary Noir
   ─────────────────────────────────────────────────────────────────────
   Features:
     1. Lenis-style momentum smooth scrolling
     2. Scroll-linked parallax on sections & images
     3. Enhanced progressive reveal with spring physics
     4. Scroll-velocity visual feedback
     5. Section fade/scale transitions
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Feature gate: skip on touch-only devices for native feel ── */
  const isTouchOnly = 'ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ════════════════════════════════════════════════════════════════
     1 · LENIS-STYLE MOMENTUM SMOOTH SCROLL
     ─ Interpolated scroll position with configurable easing.
     ─ Gives the page a luxurious, weighted feel.
  ════════════════════════════════════════════════════════════════ */

  const SmoothScroll = {
    current: 0,
    target: 0,
    ease: 0.078,           // Lower = more momentum (0.05–0.12 sweet spot)
    running: false,
    rafId: null,

    init() {
      if (isTouchOnly || prefersReduced) return;

      // Disable native smooth scroll — we handle it
      document.documentElement.style.scrollBehavior = 'auto';

      this.current = window.scrollY;
      this.target = window.scrollY;

      window.addEventListener('scroll', () => {
        this.target = window.scrollY;
      }, { passive: true });

      this.running = true;
      this.animate();
    },

    lerp(a, b, t) {
      return a + (b - a) * t;
    },

    animate() {
      if (!this.running) return;

      const prev = this.current;
      this.current = this.lerp(this.current, this.target, this.ease);

      // Stop ticking when close enough (sub-pixel)
      if (Math.abs(this.current - this.target) < 0.5) {
        this.current = this.target;
      }

      // Track velocity for scroll-driven effects
      this.velocity = this.current - prev;

      // Fire custom event for other modules
      if (Math.abs(this.velocity) > 0.01) {
        window.dispatchEvent(new CustomEvent('bloom:smoothscroll', {
          detail: {
            current: this.current,
            velocity: this.velocity,
            progress: this.current / (document.documentElement.scrollHeight - window.innerHeight)
          }
        }));
      }

      this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  };


  /* ════════════════════════════════════════════════════════════════
     2 · SCROLL-LINKED PARALLAX
     ─ Subtle depth movement on images and decorative elements.
     ─ Uses transform for GPU acceleration.
  ════════════════════════════════════════════════════════════════ */

  const Parallax = {
    items: [],

    init() {
      if (prefersReduced) return;

      // Collect parallax targets
      const selectors = [
        { sel: '.product-card__img img, .spotlight-card__img img', speed: 0.04, scale: false },
        { sel: '.wildlife-section::before, .section-padding > .container > img', speed: 0.06, scale: false },
        { sel: '.ag-blob', speed: 0.03, scale: false },
        { sel: '[data-parallax]', speed: null, scale: false },  // Custom speed via data-attr
      ];

      selectors.forEach(cfg => {
        document.querySelectorAll(cfg.sel).forEach(el => {
          const speed = cfg.speed || parseFloat(el.dataset.parallax) || 0.05;
          this.items.push({ el, speed, scale: cfg.scale });
        });
      });

      // Also add parallax to section backgrounds
      document.querySelectorAll('.section-padding, .wildlife-section, .testimonial-section, [class*="section"]').forEach(sec => {
        if (sec.classList.contains('ag-hero')) return; // Hero has its own parallax
        sec.dataset._parallaxSection = '1';
      });

      if (this.items.length > 0) {
        this.update = this.update.bind(this);
        window.addEventListener('bloom:smoothscroll', this.update, { passive: true });
        // Fallback for touch
        if (isTouchOnly) {
          window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this._apply(window.scrollY));
          }, { passive: true });
        }
      }
    },

    update(e) {
      this._apply(e.detail.current);
    },

    _apply(scrollY) {
      const wh = window.innerHeight;
      this.items.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > wh + 100) return;
        const center = rect.top + rect.height / 2 - wh / 2;
        const offset = center * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px) translateZ(0)`;
      });
    }
  };


  /* ════════════════════════════════════════════════════════════════
     3 · ENHANCED SCROLL REVEAL (upgrades existing .bc-r system)
     ─ Adds spring-physics stagger, scale, and blur entrance.
     ─ Works alongside the existing IntersectionObserver in
       bloom-psychology.js — this layer adds extra polish.
  ════════════════════════════════════════════════════════════════ */

  function injectRevealCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* ── Premium reveal enhancements ── */

      /* Smoother easing for all reveals */
      .bc-r, .bc-rl, .bc-rr, .bc-rs, .reveal {
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: transform, opacity;
      }

      /* Section headings get a special text-clip reveal */
      .section-heading, .section-title, h2.bc-r, .wildlife-title {
        overflow: hidden;
      }

      /* Smooth section transitions */
      .section-padding, [class*="section"] {
        position: relative;
      }

      /* Parallax sections get subtle depth */
      .section-padding .container,
      .wildlife-section .container,
      .wildlife-content {
        transition: transform 0.1s linear;
        will-change: transform;
      }

      /* Scroll progress bar upgrade — smoother width transition */
      #bc-bar {
        transition: width 0.08s linear !important;
        will-change: width;
      }

      /* Premium page scroll indicator — nav shadow deepens on scroll */
      .premium-nav {
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      /* Velocity-based skew on cards during fast scroll */
      .bc-velocity-skew {
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform;
      }

      /* Section dividers animate on scroll */
      .section-divider, hr, .wildlife-section::before {
        transform-origin: left center;
      }

      /* Image zoom on scroll proximity */
      .product-card__img img,
      .spotlight-card__img img {
        transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      /* ── Scroll-driven section fade ── */
      .bloom-section-fade {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Footer parallax reveal */
      .premium-footer {
        position: relative;
      }
      .premium-footer .footer-grid > * {
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(style);
  }


  /* ════════════════════════════════════════════════════════════════
     4 · SCROLL VELOCITY EFFECTS
     ─ Subtle skew on product cards during fast scrolling
     ─ Progress bar glow intensity linked to speed
  ════════════════════════════════════════════════════════════════ */

  const VelocityFX = {
    cards: [],
    bar: null,
    nav: null,

    init() {
      if (prefersReduced) return;

      this.cards = Array.from(document.querySelectorAll('.product-card, .spotlight-card, .ag-strip-row'));
      this.cards.forEach(c => c.classList.add('bc-velocity-skew'));

      this.bar = document.getElementById('bc-bar');
      this.nav = document.querySelector('.premium-nav');

      this.update = this.update.bind(this);
      window.addEventListener('bloom:smoothscroll', this.update, { passive: true });

      // Fallback for touch
      if (isTouchOnly) {
        let lastY = window.scrollY;
        window.addEventListener('scroll', () => {
          const vel = window.scrollY - lastY;
          lastY = window.scrollY;
          this._applyVelocity(vel);
        }, { passive: true });
      }
    },

    update(e) {
      this._applyVelocity(e.detail.velocity);
    },

    _applyVelocity(velocity) {
      const v = Math.max(-15, Math.min(15, velocity));
      const absV = Math.abs(v);

      // Subtle skew on cards — max ±1.2 degrees
      if (absV > 0.8) {
        const skew = (v / 15) * 1.2;
        const wh = window.innerHeight;
        this.cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.bottom > -50 && rect.top < wh + 50) {
            card.style.transform = `skewY(${skew.toFixed(2)}deg) translateZ(0)`;
          }
        });
      } else {
        // Reset
        this.cards.forEach(card => {
          if (card.style.transform.includes('skew')) {
            card.style.transform = 'skewY(0deg) translateZ(0)';
          }
        });
      }

      // Progress bar glow pulse with velocity
      if (this.bar && absV > 1) {
        const glow = Math.min(absV * 2, 20);
        this.bar.style.boxShadow = `0 0 ${glow}px rgba(201,168,76,${Math.min(0.15 + absV * 0.03, 0.5)})`;
      } else if (this.bar) {
        this.bar.style.boxShadow = '0 0 10px rgba(201,168,76,0.25)';
      }
    }
  };


  /* ════════════════════════════════════════════════════════════════
     5 · SECTION PROXIMITY FADE
     ─ Sections smoothly scale/fade as you scroll through them.
     ─ Creates a "focusing" effect on the active section.
  ════════════════════════════════════════════════════════════════ */

  const SectionFade = {
    sections: [],

    init() {
      if (prefersReduced) return;

      this.sections = Array.from(document.querySelectorAll(
        '.section-padding, .wildlife-section, .testimonial-section, .premium-footer'
      ));

      // Don't touch the hero
      this.sections = this.sections.filter(s => !s.classList.contains('ag-hero'));

      this.update = this.update.bind(this);

      if (isTouchOnly) {
        window.addEventListener('scroll', () => {
          requestAnimationFrame(() => this._apply(window.scrollY));
        }, { passive: true });
      } else {
        window.addEventListener('bloom:smoothscroll', (e) => this._apply(e.detail.current), { passive: true });
      }

      // Initial pass
      requestAnimationFrame(() => this._apply(window.scrollY));
    },

    _apply(scrollY) {
      const wh = window.innerHeight;
      this.sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const visible = rect.top < wh && rect.bottom > 0;

        if (!visible) return;

        // How centered is this section? 0 = perfectly centered, 1 = edge
        const sectionCenter = rect.top + rect.height / 2;
        const viewCenter = wh / 2;
        const distance = Math.abs(sectionCenter - viewCenter) / (wh * 0.8);
        const proximity = Math.max(0, 1 - distance);

        // Subtle scale: 0.985 → 1.0 based on proximity
        const scale = 0.988 + proximity * 0.012;

        // Apply to the container inside the section for better control
        const container = sec.querySelector('.container') || sec.querySelector('.wildlife-content') || sec.firstElementChild;
        if (container && !container.closest('.ag-hero')) {
          container.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
        }
      });
    }
  };


  /* ════════════════════════════════════════════════════════════════
     6 · IMAGE SCROLL-ZOOM
     ─ Product images subtly zoom in as they enter view,
       creating a "coming alive" effect.
  ════════════════════════════════════════════════════════════════ */

  const ImageZoom = {
    images: [],

    init() {
      if (prefersReduced) return;

      this.images = Array.from(document.querySelectorAll(
        '.product-card__img img, .spotlight-card__img img'
      ));

      if (!this.images.length) return;

      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.transform = 'scale(1)';
          } else {
            e.target.style.transform = 'scale(1.06)';
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

      this.images.forEach(img => {
        img.style.transform = 'scale(1.06)';
        img.style.transformOrigin = 'center center';
        io.observe(img);
      });
    }
  };


  /* ════════════════════════════════════════════════════════════════
     7 · SMOOTH ANCHOR LINKS
     ─ Overrides anchor clicks to use smooth animated scroll
       with custom easing instead of native jump.
  ════════════════════════════════════════════════════════════════ */

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#0') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const targetY = target.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for nav
        smoothScrollTo(targetY, 1200);
      });
    });
  }

  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeOutExpo(progress);

      window.scrollTo(0, startY + diff * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }


  /* ════════════════════════════════════════════════════════════════
     8 · STAGGERED FOOTER REVEAL
     ─ Footer columns animate in sequentially from bottom.
  ════════════════════════════════════════════════════════════════ */

  function initFooterReveal() {
    const footer = document.querySelector('.premium-footer');
    if (!footer) return;

    const cols = footer.querySelectorAll('.footer-grid > *');
    cols.forEach((col, i) => {
      col.style.opacity = '0';
      col.style.transform = 'translateY(30px)';
      col.style.transitionDelay = `${i * 0.12}s`;
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const cols = e.target.querySelectorAll('.footer-grid > *');
          cols.forEach(col => {
            col.style.opacity = '1';
            col.style.transform = 'translateY(0)';
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    io.observe(footer);
  }


  /* ════════════════════════════════════════════════════════════════
     9 · TEXT SPLIT REVEAL
     ─ Headings split into lines/words and reveal with stagger.
     ─ Only applied to major section headings.
  ════════════════════════════════════════════════════════════════ */

  function initTextReveal() {
    if (prefersReduced) return;

    const headings = document.querySelectorAll(
      '.section-padding h2, .wildlife-title, .testimonial-section h2'
    );

    const style = document.createElement('style');
    style.textContent = `
      .bc-word-reveal {
        display: inline-block;
        overflow: hidden;
        vertical-align: top;
      }
      .bc-word-reveal > span {
        display: inline-block;
        transform: translateY(105%);
        transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .bc-word-reveal.revealed > span {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    headings.forEach(heading => {
      // Skip if already processed or inside ag-hero
      if (heading.dataset.splitDone || heading.closest('.ag-hero')) return;
      heading.dataset.splitDone = '1';

      const words = heading.innerHTML.split(/(\s+)/);
      let wordIndex = 0;
      heading.innerHTML = words.map(word => {
        if (/^\s+$/.test(word)) return word;
        const delay = wordIndex * 0.05;
        wordIndex++;
        return `<span class="bc-word-reveal"><span style="transition-delay:${delay}s">${word}</span></span>`;
      }).join('');
    });

    // Observe these headings
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.bc-word-reveal').forEach(w => w.classList.add('revealed'));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    headings.forEach(h => {
      if (h.dataset.splitDone === '1') io.observe(h);
    });
  }


  /* ════════════════════════════════════════════════════════════════
     INIT — Wire everything up
  ════════════════════════════════════════════════════════════════ */

  function init() {
    injectRevealCSS();
    SmoothScroll.init();

    // Wait a tick for DOM to settle after bloom-psychology.js
    requestAnimationFrame(() => {
      Parallax.init();
      VelocityFX.init();
      SectionFade.init();
      ImageZoom.init();
      initSmoothAnchors();
      initFooterReveal();

      // Text reveal after a small delay to ensure fonts are loaded
      setTimeout(initTextReveal, 300);
    });
  }

  // Start after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Done ─────────────────────────────────────────────────────── */
  console.info('%c[Bloom Cure] Smooth Scroll Engine v1.0 · 9 modules',
    'color:#C9A84C;font-weight:700;font-size:11px;background:#09090B;padding:3px 8px;border-radius:4px;');

})();
