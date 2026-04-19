/* ════════════════════════════════════════════════════════════════════════
   BLOOM CURE · RECOMMENDATION ENGINE v1.0
   ════════════════════════════════════════════════════════════════════════
   Algorithm signals (weighted):
     • Hover dwell time     → 0–3 pts  (strongest passive intent signal)
     • Row scroll into view → 1 pt     (attention = interest)
     • Add to Cart click    → 8 pts    (highest intent)
     • WhatsApp Buy click   → 10 pts   (purchase intent)
     • Repeat hover         → +1 pt each (reinforcement)
     • Category affinity    → shared tag bonus across products
   ════════════════════════════════════════════════════════════════════════ */

(function BloomRecommend() {
    'use strict';

    /* ── FULL PRODUCT CATALOGUE ─────────────────────────────────────── */
    const CATALOGUE = [
        { id: 1,  name: 'Red Sandalwood Herbal Bar', price: 449, img: 'assets/product_red_sandalwood.png',  badge: 'Premium',  tags: ['skin', 'glow', 'premium', 'face'] },
        { id: 2,  name: 'Red Wine Soap',             price: 399, img: 'assets/product_red_wine.png',        badge: 'Premium',  tags: ['antioxidant', 'glow', 'premium', 'face'] },
        { id: 3,  name: 'Soap Nut Power',            price: 100, img: 'assets/product_soapnut.png',         badge: 'Ayurvedic',tags: ['ayurvedic', 'gentle', 'hair', 'cleanse'] },
        { id: 4,  name: 'Seegekai',                  price: 399, img: 'assets/product_shikakai.png',        badge: 'Herbal',   tags: ['herbal', 'hair', 'cleanse', 'ayurvedic'] },
        { id: 5,  name: 'Bamboo Toothbrush',         price: 70,  img: 'assets/product_bamboo_toothbrush.png',badge: 'Eco',     tags: ['eco', 'sustainable', 'oral'] },
        { id: 6,  name: 'Relaxing Bath Salts',       price: 199, img: 'assets/relaxing_bath_salts.png',     badge: 'Calming',  tags: ['relax', 'bath', 'wellness', 'calming'] },
        { id: 7,  name: 'Neem Purify',               price: 399, img: 'assets/product_neem.png',            badge: 'Herbal',   tags: ['neem', 'acne', 'cleanse', 'herbal'] },
        { id: 8,  name: 'Besan Face Bar',            price: 299, img: 'assets/product_besan.png',           badge: 'Ayurvedic',tags: ['ayurvedic', 'face', 'gentle', 'glow'] },
        { id: 9,  name: 'Loofah Body Scrubber',      price: 199, img: 'assets/product_loofah.png',          badge: 'Eco',      tags: ['eco', 'exfoliate', 'body', 'sustainable'] },
        { id: 10, name: 'Seegekai Powder',           price: 249, img: 'assets/product_seegekai_powder.png', badge: 'Herbal',   tags: ['herbal', 'hair', 'ayurvedic', 'gentle'] },
        { id: 11, name: 'Exfoliating Coffee Soap',   price: 399, img: 'assets/product_coffee_soap.png',     badge: 'Energise', tags: ['exfoliate', 'body', 'skin', 'cleanse'] },
        { id: 12, name: 'Rice Goat Milk Soap',       price: 299, img: 'assets/product_rice_goat_milk.png',  badge: 'Nourish',  tags: ['gentle', 'face', 'skin', 'glow'] },
        { id: 13, name: 'Multani Mitti Soap',        price: 249, img: 'assets/product_multani_mitti.png',   badge: 'Purify',   tags: ['acne', 'face', 'cleanse', 'herbal'] },
        { id: 14, name: 'Activated Charcoal Soap',   price: 299, img: 'assets/product_charcoal.png',        badge: 'Detox',    tags: ['detox', 'acne', 'cleanse', 'face'] },
        { id: 15, name: 'Hotel Soaps Set',           price: 599, img: 'assets/product_hotel_soaps.png',     badge: 'Luxury',   tags: ['premium', 'gift', 'luxury', 'skin'] },
    ];

    /* ── SCORE STORAGE ──────────────────────────────────────────────── */
    const STORE_KEY = 'bc_interest_v2';
    let scores = {};
    let tagScores = {};

    function loadScores() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                scores    = parsed.scores    || {};
                tagScores = parsed.tagScores || {};
            }
        } catch (e) { scores = {}; tagScores = {}; }
    }

    function saveScores() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ scores, tagScores, ts: Date.now() }));
        } catch (e) {}
    }

    function addScore(productId, pts, tags) {
        scores[productId] = (scores[productId] || 0) + pts;
        if (tags && Array.isArray(tags)) {
            tags.forEach(tag => { tagScores[tag] = (tagScores[tag] || 0) + pts; });
        }
        saveScores();
        scheduleRender();
    }

    /* ── RANKED RECOMMENDATIONS ─────────────────────────────────────── */
    /* IDs of products shown natively in New Arrivals strip */
    const STRIP_IDS = new Set([1, 2, 3, 4, 5, 6]);

    function getRanked(max = 3) {
        /* 1. Compute affinity score for every catalogue product */
        const ranked = CATALOGUE.map(p => {
            let total = scores[p.id] || 0;
            /* Tag affinity bonus: sum tagScore for each tag this product shares */
            p.tags.forEach(tag => { total += (tagScores[tag] || 0) * 0.4; });
            return { ...p, total };
        });

        /* 2. Exclude products already visible in the strip */
        const candidates = ranked.filter(p => !STRIP_IDS.has(p.id));

        /* 3. Sort descending */
        candidates.sort((a, b) => b.total - a.total);

        /* 4. Return top N with a minimum score so we don't show random picks prematurely */
        const threshold = 2; // at least 2 pts before showing
        const topScored = candidates.filter(p => p.total >= threshold);

        /* Fallback: if not enough signals yet, show editorial defaults */
        if (topScored.length < max) {
            const defaults = candidates.filter(p => p.total < threshold).slice(0, max - topScored.length);
            return [...topScored, ...defaults].slice(0, max);
        }
        return topScored.slice(0, max);
    }

    /* ── SCORE REASON LABEL ─────────────────────────────────────────── */
    function getReason(product) {
        const topTag = Object.entries(tagScores)
            .filter(([t]) => product.tags.includes(t))
            .sort((a, b) => b[1] - a[1])[0];

        if (!topTag || topTag[1] < 1) return 'Handpicked for you';

        const map = {
            glow: 'Because you love glowing skin', face: 'Based on your face-care interest',
            herbal: 'For your herbal routine', ayurvedic: 'Matching your Ayurvedic picks',
            acne: 'For your clear-skin journey', hair: 'Complementing your hair-care',
            eco: 'Supporting your eco choices', relax: 'For your wellness ritual',
            bath: 'Perfect with your bath picks', premium: 'Elevating your premium ritual',
            exfoliate: 'Boosting your exfoliation routine', detox: 'Deepening your detox ritual',
            skin: 'Matching your skincare interest', cleanse: 'Complementing your cleanse picks',
            gentle: 'For your gentle-care approach', sustainable: 'Eco-aligned with your choices',
        };
        return map[topTag[0]] || 'Curated for your ritual';
    }

    /* ── MATCH PERCENTAGE ───────────────────────────────────────────── */
    function getMatch(product) {
        const base = scores[product.id] || 0;
        const tagBonus = product.tags.reduce((a, t) => a + (tagScores[t] || 0) * 0.4, 0);
        const raw = base + tagBonus;
        /* Map to 70–99% range for UX realism */
        const pct = Math.min(99, Math.max(70, Math.round(70 + (raw / 15) * 29)));
        return pct;
    }

    /* ── RENDER THE PANEL ───────────────────────────────────────────── */
    let renderTimer = null;
    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(renderPanel, 400);
    }

    function renderPanel() {
        const container = document.getElementById('bc-reco-panel');
        if (!container) return;

        const picks = getRanked(3);
        if (!picks.length) return;

        /* Build cards */
        const cards = picks.map((p, i) => {
            const match = getMatch(p);
            const reason = getReason(p);
            const delay = i * 120;

            return `
            <div class="bc-reco-card" style="animation-delay:${delay}ms" data-reco-id="${p.id}">
                <div class="bc-reco-card__match-ring">
                    <svg viewBox="0 0 44 44" class="bc-ring-svg" aria-hidden="true">
                        <circle cx="22" cy="22" r="18" class="bc-ring-bg"/>
                        <circle cx="22" cy="22" r="18" class="bc-ring-fill"
                            style="--match:${match}"/>
                    </svg>
                    <span class="bc-ring-pct">${match}<sup>%</sup></span>
                </div>
                <div class="bc-reco-card__thumb">
                    <img src="${p.img}" alt="${p.name}" loading="lazy"
                         onerror="this.src='assets/logo.jpg'">
                </div>
                <div class="bc-reco-card__body">
                    <span class="bc-reco-card__badge">${p.badge}</span>
                    <h4 class="bc-reco-card__name">${p.name}</h4>
                    <p class="bc-reco-card__reason">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> ${reason}
                    </p>
                    <div class="bc-reco-card__footer">
                        <span class="bc-reco-card__price">&#8377;${p.price}</span>
                        <div class="bc-reco-card__actions" data-name="${p.name}" data-price="${p.price}">
                            <button class="bc-reco-btn bc-reco-btn--add ag-card__btn ag-card__btn--primary"
                                    onclick="addToCart(this)">
                                <i class="fa-solid fa-bag-shopping"></i> Add
                            </button>
                            <button class="bc-reco-btn bc-reco-btn--wa ag-card__btn ag-card__btn--secondary"
                                    onclick="buyNow(this)">
                                <i class="fa-brands fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        /* Update DOM */
        const grid = container.querySelector('.bc-reco-grid');
        if (grid) {
            grid.innerHTML = cards;
            /* Re-trigger entrance animation */
            container.classList.remove('bc-reco-visible');
            void container.offsetWidth;
            container.classList.add('bc-reco-visible');
        }
    }

    /* ── TRACK STRIP INTERACTIONS ───────────────────────────────────── */
    function attachTracking() {
        const rows = document.querySelectorAll('.ag-strip-row');
        rows.forEach(row => {
            const actions = row.querySelector('.ag-card__actions');
            if (!actions) return;
            const pid = getIdFromName(actions.dataset.name);
            if (!pid) return;
            const product = CATALOGUE.find(p => p.id === pid);
            if (!product) return;

            /* Hover dwell: track how long mouse stays */
            let hoverStart = null;
            row.addEventListener('mouseenter', () => { hoverStart = Date.now(); });
            row.addEventListener('mouseleave', () => {
                if (!hoverStart) return;
                const dwell = Date.now() - hoverStart;
                hoverStart = null;
                let pts = 0;
                if (dwell > 2500) pts = 3;
                else if (dwell > 1200) pts = 2;
                else if (dwell > 500)  pts = 1;
                if (pts > 0) addScore(pid, pts, product.tags);
            });

            /* Add to cart */
            const addBtn = row.querySelector('.ag-strip-btn--primary');
            if (addBtn) addBtn.addEventListener('click', () => addScore(pid, 8, product.tags));

            /* WhatsApp buy */
            const waBtn = row.querySelector('.ag-strip-btn--wa');
            if (waBtn) waBtn.addEventListener('click', () => addScore(pid, 10, product.tags));
        });

        /* Scroll into view: 1 pt per product seen */
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const actions = e.target.querySelector('.ag-card__actions');
                if (!actions) return;
                const pid = getIdFromName(actions.dataset.name);
                if (!pid) return;
                const product = CATALOGUE.find(p => p.id === pid);
                if (!product) return;
                addScore(pid, 1, product.tags);
                obs.unobserve(e.target);
            });
        }, { threshold: 0.6 });

        rows.forEach(r => obs.observe(r));
    }

    function getIdFromName(name) {
        if (!name) return null;
        const match = CATALOGUE.find(p => p.name.toLowerCase() === name.toLowerCase());
        return match ? match.id : null;
    }

    /* ── INJECT PANEL HTML ──────────────────────────────────────────── */
    function injectPanel() {
        const section = document.querySelector('.ag-carousel-section');
        if (!section) return;

        const panel = document.createElement('div');
        panel.id = 'bc-reco-panel';
        panel.className = 'bc-reco-panel';
        panel.setAttribute('aria-label', 'Personalised recommendations');
        panel.innerHTML = `
            <div class="bc-reco-header">
                <div class="bc-reco-header__label">
                    <span class="bc-reco-pulse"></span>
                    <span>AI · Curated For You</span>
                </div>
                <h3 class="bc-reco-header__title">Your <em>Ritual</em> Picks</h3>
                <p class="bc-reco-header__sub">Personalised from your browsing — updates as you explore.</p>
            </div>
            <div class="bc-reco-grid"></div>
            <div class="bc-reco-footer">
                <a href="shop.html" class="bc-reco-cta">
                    Explore Full Collection <i class="fa-solid fa-arrow-right"></i>
                </a>
                <button class="bc-reco-reset" onclick="BloomRecoReset()" title="Reset my preferences">
                    <i class="fa-solid fa-rotate-left"></i> Reset Preferences
                </button>
            </div>`;

        /* Insert before the strip footer */
        const footer = section.querySelector('.ag-strip-footer');
        if (footer) {
            footer.parentNode.insertBefore(panel, footer);
        } else {
            section.appendChild(panel);
        }
    }

    /* ── PUBLIC RESET ───────────────────────────────────────────────── */
    window.BloomRecoReset = function () {
        localStorage.removeItem(STORE_KEY);
        scores = {}; tagScores = {};
        const grid = document.querySelector('#bc-reco-panel .bc-reco-grid');
        if (grid) grid.innerHTML = `<p class="bc-reco-empty">
            <i class="fa-regular fa-sparkles"></i> 
            Start browsing above and we'll curate your ritual.
        </p>`;
    };

    /* ── INIT ───────────────────────────────────────────────────────── */
    function init() {
        loadScores();
        injectPanel();
        attachTracking();
        /* Show any existing recommendations from prior sessions */
        setTimeout(renderPanel, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
