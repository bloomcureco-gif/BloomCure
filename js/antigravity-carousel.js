/* ══════════════════════════════════════════════════════════════════════
   ANTI-GRAVITY CAROUSEL · Engine
   Physics-based inertial carousel with 3D tilt, parallax, and lighting
   60fps GPU-accelerated — no layout-triggering properties
   ══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── DOM ───
    const section = document.querySelector('.ag-carousel-section');
    if (!section) return;

    const track = section.querySelector('.ag-carousel-track');
    const cards = Array.from(section.querySelectorAll('.ag-card'));
    const dotsContainer = section.querySelector('.ag-carousel-nav');
    const progressBar = section.querySelector('.ag-carousel-progress');
    const spotlight = section.querySelector('.ag-carousel-section__spotlight');
    const cursorEl = section.querySelector('.ag-carousel-cursor');

    if (!track || cards.length === 0) return;

    const totalCards = cards.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── STATE ───
    let currentIndex = 0;
    let trackX = 0;           // Current interpolated track position
    let targetX = 0;          // Target position
    let velocity = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTrackX = 0;
    let lastDragX = 0;
    let dragVelocity = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 3000;
    const FRICTION = 0.92;     // Drag friction
    const LERP_SPEED = 0.08;   // Track interpolation speed
    const SNAP_THRESHOLD = 50; // Min px to trigger snap

    // Cursor state
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Float offsets per card (randomized for organic feel)
    const floatOffsets = cards.map(() => ({
        phase: Math.random() * Math.PI * 2,
        amplitude: 3 + Math.random() * 4,
        speed: 0.0004 + Math.random() * 0.0003
    }));


    // ═══════════════════════════════════════════════════════════════
    // 1. CORE POSITIONING
    // ═══════════════════════════════════════════════════════════════

    function getCardMetrics() {
        const card = cards[0];
        if (!card) return { width: 420, gap: 40 };
        const width = card.offsetWidth;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 40;
        return { width, gap };
    }

    function getTargetX(index) {
        const { width, gap } = getCardMetrics();
        const viewportW = section.offsetWidth;
        const centerOffset = (viewportW - width) / 2;
        return -(index * (width + gap)) + centerOffset;
    }

    function setActiveIndex(index) {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        targetX = getTargetX(currentIndex);
        updateDots();
        updateProgress();
    }


    // ═══════════════════════════════════════════════════════════════
    // 2. INTERPOLATION LOOP (rAF)
    // ═══════════════════════════════════════════════════════════════

    let animationId = null;
    let lastTime = 0;

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        lastTime = timestamp;

        // Interpolate track position (smooth inertial slide)
        if (!isDragging) {
            const diff = targetX - trackX;
            trackX += diff * LERP_SPEED;

            // Apply velocity from drag release (friction decay)
            if (Math.abs(velocity) > 0.5) {
                trackX += velocity;
                velocity *= FRICTION;
            }

            // Snap when close enough
            if (Math.abs(diff) < 0.5 && Math.abs(velocity) < 0.5) {
                trackX = targetX;
                velocity = 0;
            }
        }

        // Apply transform (GPU only)
        track.style.transform = `translate3d(${trackX}px, 0, 0)`;

        // Interpolate card properties based on position
        updateCardStates();

        // Float animation
        if (!prefersReducedMotion) {
            applyFloat(timestamp);
        }

        // Cursor interpolation
        if (cursorEl) {
            cursorX += (mouseX - cursorX) * 0.08;
            cursorY += (mouseY - cursorY) * 0.08;
            cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }

        animationId = requestAnimationFrame(animate);
    }


    // ═══════════════════════════════════════════════════════════════
    // 3. CARD STATE INTERPOLATION
    // ═══════════════════════════════════════════════════════════════

    function updateCardStates() {
        const { width, gap } = getCardMetrics();
        const viewportW = section.offsetWidth;
        const viewportCenter = viewportW / 2;

        cards.forEach((card, i) => {
            const cardLeft = i * (width + gap) + trackX;
            const cardCenter = cardLeft + width / 2;
            const distFromCenter = Math.abs(cardCenter - viewportCenter);
            const maxDist = width + gap;

            // Normalize: 0 = center, 1 = fully peripheral
            const t = Math.min(distFromCenter / maxDist, 1.5);

            // Interpolated values
            const scale = 1 - t * 0.08;           // 1 → 0.92
            const opacity = 1 - t * 0.55;          // 1 → 0.45
            const blurVal = t * 2;                  // 0 → 2px

            // Apply via transform (GPU only) — scale only, tilt handled separately
            if (!card._tiltActive) {
                card.style.transform = `scale(${scale})`;
            }
            card.style.opacity = opacity;
            card.style.filter = blurVal > 0.1 ? `blur(${blurVal}px)` : 'none';

            // Active state class
            const isClosest = t < 0.3;
            card.classList.toggle('is-active', isClosest);
        });

        // Move spotlight behind active card
        if (spotlight && !prefersReducedMotion) {
            const activeCard = cards[currentIndex];
            if (activeCard) {
                const { width: cw, gap: cg } = getCardMetrics();
                const activeLeft = currentIndex * (cw + cg) + trackX;
                const activeCenterX = activeLeft + cw / 2;
                spotlight.style.transform = `translate(${activeCenterX - section.offsetWidth / 2}px, -50%)`;
            }
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // 4. FLOATING ANIMATION
    // ═══════════════════════════════════════════════════════════════

    function applyFloat(timestamp) {
        cards.forEach((card, i) => {
            if (!card.classList.contains('is-active')) return;
            const f = floatOffsets[i];
            const y = Math.sin(timestamp * f.speed + f.phase) * f.amplitude;
            // Combine with existing scale from updateCardStates
            if (!card._tiltActive) {
                const currentScale = card.style.transform.match(/scale\(([\d.]+)\)/);
                const s = currentScale ? parseFloat(currentScale[1]) : 1;
                card.style.transform = `scale(${s}) translate3d(0, ${y}px, 0)`;
            }
        });
    }


    // ═══════════════════════════════════════════════════════════════
    // 5. 3D TILT + SPECULAR LIGHTING + PARALLAX
    // ═══════════════════════════════════════════════════════════════

    cards.forEach((card, idx) => {
        const inner = card.querySelector('.ag-card__inner');
        const specular = card.querySelector('.ag-card__specular');
        const image = card.querySelector('.ag-card__image img');
        const body = card.querySelector('.ag-card__body');

        card._tiltActive = false;

        if (prefersReducedMotion) return;

        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('is-active')) return;
            card._tiltActive = true;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            // Tilt: max ±5°
            const rotX = ((cy - y) / cy) * 5;
            const rotY = ((x - cx) / cx) * 5;

            // Apply 3D tilt to inner container
            if (inner) {
                inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }

            // Specular highlight follows cursor
            if (specular) {
                const gx = (x / rect.width) * 100;
                const gy = (y / rect.height) * 100;
                specular.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.15) 0%, transparent 55%)`;
                specular.style.opacity = '1';
            }

            // Parallax: image moves opposite to cursor
            if (image) {
                const px = -(rotY * 3);
                const py = (rotX * 3);
                image.style.transform = `translate3d(${px}px, ${py}px, 0) scale(1.08)`;
            }

            // Parallax: body moves slightly with cursor
            if (body) {
                const bx = rotY * 1.5;
                const by = -rotX * 1.5;
                body.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card._tiltActive = false;

            if (inner) {
                inner.style.transform = 'rotateX(0) rotateY(0)';
            }
            if (specular) {
                specular.style.opacity = '0';
            }
            if (image) {
                image.style.transform = 'translate3d(0, 0, 0) scale(1)';
            }
            if (body) {
                body.style.transform = 'translate3d(0, 0, 0)';
            }
        });
    });


    // ═══════════════════════════════════════════════════════════════
    // 6. DRAG / TOUCH SUPPORT WITH INERTIA
    // ═══════════════════════════════════════════════════════════════

    function getEventX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    function onDragStart(e) {
        isDragging = true;
        dragStartX = getEventX(e);
        dragStartTrackX = trackX;
        lastDragX = dragStartX;
        dragVelocity = 0;
        velocity = 0;
        track.classList.add('is-dragging');

        clearAutoplay();

        if (e.type === 'mousedown') {
            e.preventDefault();
        }
    }

    function onDragMove(e) {
        if (!isDragging) return;

        const currentX = getEventX(e);
        const diff = currentX - dragStartX;
        trackX = dragStartTrackX + diff;

        // Track velocity for inertia
        dragVelocity = currentX - lastDragX;
        lastDragX = currentX;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');

        const moved = trackX - dragStartTrackX;

        // Apply inertia from drag velocity
        velocity = dragVelocity * 0.5;

        // Determine which card to snap to based on drag distance + velocity
        const { width, gap } = getCardMetrics();
        const combinedImpulse = moved + velocity * 10;

        if (Math.abs(combinedImpulse) > SNAP_THRESHOLD) {
            if (combinedImpulse < 0) {
                setActiveIndex(Math.min(currentIndex + 1, totalCards - 1));
            } else {
                setActiveIndex(Math.max(currentIndex - 1, 0));
            }
        } else {
            // Snap back
            targetX = getTargetX(currentIndex);
        }

        resetAutoplay();
    }

    // Mouse events
    track.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', (e) => {
        onDragMove(e);
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    window.addEventListener('mouseup', onDragEnd);

    // Touch events
    track.addEventListener('touchstart', onDragStart, { passive: true });
    track.addEventListener('touchmove', onDragMove, { passive: true });
    track.addEventListener('touchend', onDragEnd);

    // Prevent accidental clicks during drag
    track.addEventListener('click', (e) => {
        if (Math.abs(trackX - dragStartTrackX) > 8) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);


    // ═══════════════════════════════════════════════════════════════
    // 7. KEYBOARD NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    // Make cards focusable
    cards.forEach((card, i) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', `Product ${i + 1} of ${totalCards}`);
    });

    section.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            goToNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goToPrev();
        }
    });


    // ═══════════════════════════════════════════════════════════════
    // 8. DOTS + PROGRESS + AUTOPLAY
    // ═══════════════════════════════════════════════════════════════

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('button');
            dot.className = 'ag-carousel-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', `Go to product ${i + 1}`);
            dot.addEventListener('click', () => {
                setActiveIndex(i);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.ag-carousel-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function updateProgress() {
        if (!progressBar) return;
        const pct = totalCards > 1 ? (currentIndex / (totalCards - 1)) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    function goToNext() {
        setActiveIndex((currentIndex + 1) % totalCards);
        resetAutoplay();
    }

    function goToPrev() {
        setActiveIndex((currentIndex - 1 + totalCards) % totalCards);
        resetAutoplay();
    }

    // Expose for HTML onclick fallback
    window.agCarouselNext = goToNext;
    window.agCarouselPrev = goToPrev;

    function startAutoplay() {
        clearAutoplay();
        autoplayTimer = setInterval(goToNext, AUTOPLAY_DELAY);
    }

    function clearAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() {
        clearAutoplay();
        startAutoplay();
    }

    // Pause autoplay on hover (only on the track/cards, not the whole section)
    track.addEventListener('mouseenter', clearAutoplay);
    track.addEventListener('mouseleave', startAutoplay);


    // ═══════════════════════════════════════════════════════════════
    // 9. RESIZE HANDLER
    // ═══════════════════════════════════════════════════════════════

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            targetX = getTargetX(currentIndex);
            trackX = targetX;  // Instant reposition on resize
        }, 100);
    });


    // ═══════════════════════════════════════════════════════════════
    // 10. INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function init() {
        targetX = getTargetX(0);
        trackX = targetX;
        buildDots();
        updateProgress();
        updateCardStates();
        animationId = requestAnimationFrame(animate);
        startAutoplay();
    }

    // Wait for layout
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
        // Also run on load just in case metrics need recalculation after images load
        window.addEventListener('load', () => {
            targetX = getTargetX(currentIndex);
        });
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
        clearAutoplay();
    });

})();
