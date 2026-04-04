/**
 * Bloom Cure · Anti-Gravity Ticker Engine
 * Advanced motion system for the cinematic announcement ticker.
 * Features: Seamless loop, low-gravity floating, and mouse-reponse aura.
 */

class AntiGravityTicker {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        if (!this.container) return;

        this.track = this.container.querySelector('.ag-ticker-track');
        this.items = Array.from(this.track.querySelectorAll('.ag-ticker-item'));
        
        // Settings
        this.speed = 0.5; // Base horizontal speed (pix per frame)
        this.driftIntensity = 1.5; // How much items respond to mouse
        this.currentX = 0;
        this.isPaused = false;
        
        // Mouse Tracking
        this.mouse = { x: 0, y: 0, active: false };
        
        this.init();
    }

    init() {
        this.cloneItems();
        this.setupListeners();
        this.animate();
    }

    cloneItems() {
        // Clone items once to ensure seamless looping
        this.items.forEach(item => {
            const clone = item.cloneNode(true);
            this.track.appendChild(clone);
        });
        
        // Refresh items list to include clones
        this.items = Array.from(this.track.querySelectorAll('.ag-ticker-item'));
    }

    setupListeners() {
        // Accessibility: Pause on hover/focus
        this.container.addEventListener('mouseenter', () => this.isPaused = true);
        this.container.addEventListener('mouseleave', () => {
            this.isPaused = false;
            this.mouse.active = false;
        });
        
        this.container.addEventListener('focusin', () => this.isPaused = true);
        this.container.addEventListener('focusout', () => this.isPaused = false);

        // Mouse Drift Response
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.active = true;
        });

        // Respect Reduced Motion
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) {
            this.isPaused = true;
        }
    }

    animate() {
        if (!this.isPaused) {
            this.currentX -= this.speed;
            
            // Loop logic: reset when half the track has passed
            const halfWidth = this.track.scrollWidth / 2;
            if (Math.abs(this.currentX) >= halfWidth) {
                this.currentX = 0;
            }
            
            this.track.style.transform = `translateX(${this.currentX}px)`;
        }

        // Apply dynamic drift to individual items based on mouse proximity
        if (this.mouse.active) {
            this.items.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const dist = Math.abs(this.mouse.x - (itemCenterX - this.container.getBoundingClientRect().left));
                
                if (dist < 200) {
                    const power = (200 - dist) / 200;
                    const driftY = Math.sin(Date.now() * 0.002 + index) * 5 * power;
                    const driftX = (this.mouse.x - (itemCenterX - this.container.getBoundingClientRect().left)) * 0.05 * power;
                    
                    item.style.transform = `translate(${driftX}px, ${driftY}px) scale(${1 + 0.05 * power})`;
                    item.style.color = `rgba(249, 247, 242, ${0.7 + 0.3 * power})`;
                } else {
                    item.style.transform = '';
                    item.style.color = '';
                }
            });
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize safely
function initAgTicker() {
    new AntiGravityTicker('agTicker');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgTicker);
} else {
    initAgTicker();
}
