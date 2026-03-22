// ═══════════════════════════════════════════
// Product Detail Page — Shared JavaScript
// ═══════════════════════════════════════════

// Nav scroll
const nav = document.getElementById('mainNav');
if (nav) {
    document.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// Cart
let cart = JSON.parse(localStorage.getItem('bloom_cure_cart')) || [];
const cartCountEl = document.getElementById('cart-count');
const toastEl = document.getElementById('cart-toast');

function updateCartUI() {
    const totalItems = cart.length;
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        totalItems > 0 ? cartCountEl.classList.add('active') : cartCountEl.classList.remove('active');
    }
}

function showToast(msg) {
    if (toastEl) {
        toastEl.querySelector('span').textContent = msg;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 3000);
    }
}

function addToCartPDP(btn) {
    const wrap = btn.closest('.pdp-actions');
    const name = wrap.dataset.name;
    const price = wrap.dataset.price;
    const img = document.querySelector('.pdp-image-wrap img')?.src || 'assets/logo.jpg';

    const idx = cart.findIndex(i => i.name === name);
    if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }
    localStorage.setItem('bloom_cure_cart', JSON.stringify(cart));
    updateCartUI();
    showToast(name + ' added to your botanical ritual.');

    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    btn.classList.add('btn-success');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('btn-success'); }, 1500);
}

function buyNowPDP(btn) {
    const wrap = btn.closest('.pdp-actions');
    const name = wrap.dataset.name;
    const price = wrap.dataset.price;
    const msg = encodeURIComponent(`Hi! I'd like to buy *${name}* (₹${price}) from Bloom Cure. 🌿`);
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening...';
    setTimeout(() => {
        window.open(`https://wa.me/919742522357?text=${msg}`, '_blank');
        btn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Buy Now';
    }, 500);
}

function shareProductPDP(btn) {
    const wrap = btn.closest('.pdp-actions');
    const name = wrap.dataset.name;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: name + ' | Bloom Cure',
            text: 'Discover this handcrafted botanical skincare from Bloom Cure: ' + name,
            url: url
        }).catch(err => console.log('Share dismissed:', err));
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!');
        });
    }
}

function toggleMobileMenu() {
    const m = document.getElementById('mobileMenu');
    if (!m) return;
    m.classList.toggle('active');
    document.body.style.overflow = m.classList.contains('active') ? 'hidden' : '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const m = document.getElementById('mobileMenu');
        if (m && m.classList.contains('active')) toggleMobileMenu();
    }
});

updateCartUI();

async function submitNewsletter(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const formData = new FormData(e.target);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showToast('Welcome to the botanical circle! 🌿');
            e.target.reset();
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 5000);
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        console.error("Newsletter error", err);
        showToast("Something went wrong. Please try again.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ═══════════════════════════════════════════
// Product Suggestions — "You May Also Like"
// ═══════════════════════════════════════════

const suggestionsDB = [
    { name: "Red Sandalwood Herbal Bar", price: "449", img: "assets/product_red_sandalwood.png", url: "product-red-sandalwood.html", badge: "Premium" },
    { name: "Red Wine Soap", price: "399", img: "assets/product_red_wine.png", url: "product-red-wine.html", badge: "New" },
    { name: "Neem Purify", price: "399", img: "assets/product_neem.png", url: "product-neem.html", badge: "Organic" },
    { name: "Soap Nut Power", price: "349", img: "assets/product_soapnut.png", url: "product-soapnut.html", badge: "Ayurvedic" },
    { name: "Seegekai", price: "399", img: "assets/product_shikakai.png", url: "product-seegekai.html", badge: "Traditional" },
    { name: "Besan", price: "299", img: "assets/product_besan.png", url: "product-besan.html", badge: "Natural" },
    { name: "Loofah Body Scrubber", price: "199", img: "assets/product_loofah.png", url: "product-loofah.html", badge: "Eco" },
    { name: "Bamboo Toothbrush", price: "149", img: "assets/product_bamboo_toothbrush.png", url: "product-bamboo-toothbrush.html", badge: "Eco" },
    { name: "Seegekai Powder", price: "249", img: "assets/product_seegekai_powder.png", url: "product-seegekai-powder.html", badge: "Hair Care" },
    { name: "Hotel Soaps", price: "599", img: "assets/product_hotel_soaps.png", url: "product-hotel-soaps.html", badge: "Gift Set" },
    { name: "Exfoliating Coffee Soap", price: "399", img: "assets/product_coffee_soap.png", url: "product-coffee.html", badge: "Exfoliant" },
    { name: "Rice Goat Milk Soap", price: "299", img: "assets/product_rice_goat_milk.png", url: "product-rice-goat-milk.html", badge: "Glow" },
    { name: "Multani Mitti Soap", price: "249", img: "assets/product_multani_mitti.png", url: "product-multani-mitti.html", badge: "Detox" },
    { name: "Activated Charcoal Soap", price: "299", img: "assets/product_charcoal.png", url: "product-charcoal.html", badge: "Detox" },
    { name: "Relaxing Bath Salts", price: "199", img: "assets/relaxing_bath_salts.png", url: "product-bath-salts.html", badge: "Wellness" },
    { name: "Hand made Sandalwood Soap", price: "349", img: "assets/product_sandalwood_handmade.png", url: "product-sandalwood.html", badge: "Handmade" },
    { name: "Coconut Bliss", price: "349", img: "assets/product_coconut.png", url: "product-coconut.html", badge: "Bestseller" }
];

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function addToCartSuggestion(btn, name, price, img) {
    const idx = cart.findIndex(i => i.name === name);
    if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }
    localStorage.setItem('bloom_cure_cart', JSON.stringify(cart));
    updateCartUI();
    showToast(name + ' added to your botanical ritual.');

    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    btn.classList.add('btn-success');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('btn-success'); }, 1500);
}

function renderProductSuggestions() {
    const grid = document.getElementById('product-suggestions-grid');
    if (!grid) return;

    // Get current product name from page
    const actionsEl = document.querySelector('.pdp-actions');
    const currentName = actionsEl ? actionsEl.dataset.name : '';

    // Filter out current product, shuffle, pick 4
    const others = suggestionsDB.filter(p => p.name !== currentName);
    const picks = shuffleArray(others).slice(0, 4);

    grid.innerHTML = picks.map(p => `
        <div class="pdp-suggest-card">
            <a href="${p.url}" class="pdp-suggest-card__img-wrap">
                <span class="pdp-suggest-card__badge">${p.badge}</span>
                <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/logo.jpg'" loading="lazy">
            </a>
            <div class="pdp-suggest-card__body">
                <a href="${p.url}" class="pdp-suggest-card__name">${p.name}</a>
                <div class="pdp-suggest-card__price">₹${p.price}</div>
                <div class="pdp-suggest-card__actions">
                    <button class="pdp-suggest-card__cart-btn" onclick="addToCartSuggestion(this, '${p.name.replace(/'/g, "\\'")}', '${p.price}', '${p.img}')">
                        <i class="fa-solid fa-bag-shopping"></i> Add to Cart
                    </button>
                    <a href="${p.url}" class="pdp-suggest-card__view-btn" title="View Product">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Auto-render suggestions on page load
document.addEventListener('DOMContentLoaded', renderProductSuggestions);
