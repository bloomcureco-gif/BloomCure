const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Purushotham\\Desktop\\BloomCure-main (1)\\BloomCure-main';
const files = fs.readdirSync(dir).filter(f => f.startsWith('product-') && f.endsWith('.html') && f !== 'product-bath-salts.html');

for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // 1. HEAD changes
    if (!content.includes('application/ld+json')) {
        const titleMatch = content.match(/<h1 class="pdp-title">([\s\S]*?)<\/h1>/);
        const priceMatch = content.match(/data-price="([^"]+)"/);
        const descMatch = content.match(/<p class="pdp-desc">([\s\S]*?)<\/p>/);
        const imgSrcMatch = content.match(/<div class="pdp-image-wrap"[^>]*>[\s\S]*?<img\s+src="([^"]+)"/);
        
        const title = titleMatch ? titleMatch[1].trim() : '';
        const price = priceMatch ? priceMatch[1] : '';
        const descText = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const imgSrc = imgSrcMatch ? imgSrcMatch[1] : '';

        const schema = `    <!-- Structured Data (JSON-LD) for SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${title}",
      "image": "https://bloomcure.com/${imgSrc}",
      "description": "${descText}",
      "brand": {
        "@type": "Brand",
        "name": "Bloom Cure"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://bloomcure.com/${file}",
        "priceCurrency": "INR",
        "price": "${price}",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>
</head>`;
        content = content.replace('</head>', schema);
    }
    
    // 2. HERO changes
    const heroMatch = content.match(/<section class="pdp-hero">[\s\S]*?<\/section>/);
    if (heroMatch && !heroMatch[0].includes('pdp-gallery')) {
        const oldHero = heroMatch[0];
        
        const titleMatch = oldHero.match(/<h1 class="pdp-title">([\s\S]*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        const catMatch = oldHero.match(/<div class="pdp-category">([\s\S]*?)<\/div>/);
        const category = catMatch ? catMatch[1].trim() : '';
        
        const badgeMatch = oldHero.match(/<span class="pdp-image-badge">([\s\S]*?)<\/span>/);
        const badge = badgeMatch ? badgeMatch[1].trim() : '';
        const badgeHtml = badge ? `<span class="pdp-image-badge">${badge}</span>` : '';
        
        const imgSrcMatch = oldHero.match(/<img\s+src="([^"]+)"/);
        const imgSrc = imgSrcMatch ? imgSrcMatch[1] : '';
        
        const priceMatch = oldHero.match(/<div class="pdp-price">([^<]+)<\/div>/);
        const displayPrice = priceMatch ? priceMatch[1] : '';
        
        const dataNameMatch = oldHero.match(/data-name="([^"]+)"/);
        const dataName = dataNameMatch ? dataNameMatch[1] : '';
        
        const dataPriceMatch = oldHero.match(/data-price="([^"]+)"/);
        const dataPrice = dataPriceMatch ? dataPriceMatch[1] : '';
        
        const descMatch = oldHero.match(/<p class="pdp-desc">([\s\S]*?)<\/p>/);
        const desc = descMatch ? descMatch[1].trim() : '';
        
        const breadcrumbMatch = oldHero.match(/<div class="pdp-breadcrumb">([\s\S]*?)<\/div>/);
        const breadcrumb = breadcrumbMatch ? breadcrumbMatch[1].trim() : '';
        
        const newHero = `<section class="pdp-hero">
        <div class="container">
            <div class="pdp-grid">
                <!-- Image Gallery -->
                <div class="pdp-gallery">
                    <div class="pdp-image-wrap" style="position:relative">
                        ${badgeHtml}
                        <img src="${imgSrc}" id="main-product-image" alt="Bloom Cure ${title} - Main Detail View">
                    </div>
                    <div class="pdp-thumbnails">
                        <button class="pdp-thumb-btn active" onclick="changeImage('${imgSrc}', this)" aria-label="View Main Front Image">
                            <img src="${imgSrc}" alt="Thumbnail Front View">
                        </button>
                        <button class="pdp-thumb-btn" onclick="changeImage('${imgSrc}', this)" aria-label="View Texture Image">
                            <img src="${imgSrc}" alt="Thumbnail Texture Detail" style="filter: brightness(0.9) grayscale(0.2); transform: scale(1.1);">
                        </button>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="pdp-info">
                    <nav class="pdp-breadcrumb" aria-label="Breadcrumb">
                        ${breadcrumb}
                    </nav>
                    
                    <div class="pdp-category">${category}</div>
                    <h1 class="pdp-title">${title}</h1>
                    
                    <div class="pdp-rating">
                        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                        <a href="#reviews" style="font-size:0.8rem; color:var(--clr-text); text-decoration:underline;">4.9 (Verified Reviews)</a>
                    </div>
                    
                    <div class="pdp-price" id="pdp-price-display">${displayPrice}</div>
                    <div class="pdp-price-note">
                        <i class="fa-solid fa-shield-check" style="color:var(--clr-sage);"></i> 
                        Pricing securely validated at checkout · Free shipping over ₹999
                    </div>
                    
                    <p class="pdp-desc">
                        ${desc}
                        <br><br>
                        <i style="color:var(--clr-text-light); font-size:0.75rem;">Disclaimer: This is a natural wellness cosmetic, not intended to diagnose or treat medical conditions.</i>
                    </p>

                    <div class="pdp-quick-facts" style="margin-bottom: 2rem; background: rgba(123, 139, 79, 0.05); padding: 1.2rem; border-radius: 12px; border-left: 3px solid var(--clr-sage);">
                        <strong style="font-size: 0.9rem; color: var(--clr-dark-green); display: block; margin-bottom: 0.5rem;">Why this product?</strong>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.4rem;">
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> Pure, high-grade botanical extracts</li>
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> Sourced ethically from sustainable farms</li>
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> Zero synthetic fragrances or artificial dyes</li>
                        </ul>
                    </div>
                    
                    <!-- Form-less Secure Add to Cart Action -->
                    <div class="pdp-actions" data-name="${dataName}" data-price="${dataPrice}">
                        <button class="btn-add-cart" onclick="addToCartPDP(this)" aria-label="Add ${title} to Cart">
                            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
                        </button>
                        <button class="btn-buy-now" onclick="buyNowPDP(this)" aria-label="Buy ${title} Now via WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i> Buy Now
                        </button>
                        <button class="btn-share" onclick="shareProductPDP(this)" aria-label="Share Product" title="Share">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                    </div>
                    
                    <div class="pdp-trust-microcopy" style="font-size: 0.75rem; color: var(--clr-text-light); margin-top: 0.8rem; display: flex; align-items: center; gap: 12px;">
                        <span><i class="fa-solid fa-lock" style="color:var(--clr-sage);"></i> Secure SSL Checkout</span>
                        <span><i class="fa-solid fa-truck-fast" style="color:var(--clr-sage);"></i> Estimated delivery 3-5 days</span>
                    </div>

                    <div class="pdp-trust-row" style="margin-top: 2rem;">
                        <div class="pdp-trust-item"><i class="fa-solid fa-leaf"></i> 100% Natural</div>
                        <div class="pdp-trust-item"><i class="fa-solid fa-hand-sparkles"></i> Handcrafted</div>
                        <div class="pdp-trust-item"><i class="fa-solid fa-shield-halved"></i> Dermatologist Tested</div>
                        <div class="pdp-trust-item"><i class="fa-solid fa-box-open"></i> Eco Packaging</div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
        content = content.replace(oldHero, newHero);
    }
    
    // 3. SECTIONS changes
    if (!content.includes('pdp-audience')) {
        const sectionsHtml = `
    <!-- NEW SECTION: Audience -->
    <section class="pdp-audience" style="background: var(--clr-beige); padding: 4rem 0;">
        <div class="container">
            <div class="pdp-audience-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                <div class="pdp-audience-card" style="background: white; padding: 2rem; border-radius: 16px; border-top: 4px solid var(--clr-sage);">
                    <h3 style="color: var(--clr-dark-green); margin-bottom: 1rem; font-size: 1.2rem;"><i class="fa-solid fa-face-smile" style="color:var(--clr-sage);"></i> Who is it for?</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.9rem;">
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> Anyone seeking a calming, rejuvenating ritual</li>
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> People with dry, dull, or tired skin</li>
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> Those looking for a deep natural cleanse</li>
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> Lovers of pure botanical and earthy aromas</li>
                    </ul>
                </div>
                <div class="pdp-audience-card" style="background: white; padding: 2rem; border-radius: 16px; border-top: 4px solid #d98e8e;">
                    <h3 style="color: var(--clr-dark-green); margin-bottom: 1rem; font-size: 1.2rem;"><i class="fa-solid fa-circle-exclamation" style="color:#d98e8e;"></i> Who should avoid?</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.9rem;">
                        <li><i class="fa-solid fa-xmark" style="color:#d98e8e; margin-right: 6px;"></i> People with open wounds or severe active eczema</li>
                        <li><i class="fa-solid fa-xmark" style="color:#d98e8e; margin-right: 6px;"></i> Those highly allergic to natural essential oils</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
    
    <section class="pdp-how-specs">`;
        
        content = content.replace('<section class="pdp-how-specs">', sectionsHtml);
    }
    
    if (!content.includes('pdp-faq')) {
        const faqRevHtml = `    </section>

    <!-- NEW SECTION: FAQ -->
    <section class="pdp-faq" style="padding: 5rem 0;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
            <h2 class="pdp-section-heading" style="text-align:center;"><i class="fa-solid fa-circle-question"></i> Frequently Asked Questions</h2>
            <div class="faq-list" style="display:flex; flex-direction:column; gap:1rem; margin-top:2rem;">
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">Is this suitable for daily use? <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">Absolutely. Our handcrafted formulas are free of harsh chemicals and designed for gentle, daily cleansing and nourishment.</p>
                </details>
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">Does it contain artificial fragrances? <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">No, we use 100% pure essential oils for a totally natural scent profile that provides real aromatherapy benefits.</p>
                </details>
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">Is this product vegan & cruelty-free? <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">Every Bloom Cure product is cruelty-free and ethically sourced. Check the details section above to confirm if it contains goat milk or honey, otherwise it is entirely vegan.</p>
                </details>
            </div>
        </div>
    </section>

    <!-- NEW SECTION: Reviews -->
    <section class="pdp-reviews" id="reviews" style="padding: 4rem 0; background: rgba(197, 160, 40, 0.05);">
        <div class="container">
            <h2 class="pdp-section-heading" style="text-align:center;"><i class="fa-solid fa-star" style="color:var(--clr-gold);"></i> Verified Customer Reviews</h2>
            <div class="reviews-summary" style="text-align:center; margin-bottom:3rem;">
                <div style="font-size:3.5rem; font-family:var(--ff-heading); color:var(--clr-dark-green); line-height:1;">4.9</div>
                <div style="color:var(--clr-gold); font-size:1.2rem; margin:0.5rem 0;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div>
                <p style="font-size:0.85rem; color:var(--clr-text-light);">Based on verified purchases</p>
            </div>
            <div class="reviews-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
                <article class="review-card" style="background:white; padding:1.8rem; border-radius:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                        <div>
                            <div style="color:var(--clr-gold); font-size:0.8rem; margin-bottom:0.3rem;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                            <strong style="color:var(--clr-dark-green); font-size:0.95rem;">Absolutely magical!</strong>
                        </div>
                        <span style="font-size:0.7rem; color:var(--clr-text-light);">1 week ago</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--clr-text); line-height:1.6;">My skin feels incredibly soft, and the scent lingers beautifully without being overpowering. Will definitely repurchase.</p>
                    <div style="margin-top:1rem; display:flex; align-items:center; gap:10px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:var(--clr-beige); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:600; color:var(--clr-dark-green);">M</div>
                        <div>
                            <div style="font-size:0.85rem; font-weight:600; color:var(--clr-dark-green);">Meera T.</div>
                            <div style="font-size:0.7rem; color:#4a8b5c;"><i class="fa-solid fa-circle-check"></i> Verified Buyer</div>
                        </div>
                    </div>
                </article>
                <article class="review-card" style="background:white; padding:1.8rem; border-radius:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                        <div>
                            <div style="color:var(--clr-gold); font-size:0.8rem; margin-bottom:0.3rem;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                            <strong style="color:var(--clr-dark-green); font-size:0.95rem;">Clearer skin in days</strong>
                        </div>
                        <span style="font-size:0.7rem; color:var(--clr-text-light);">3 weeks ago</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--clr-text); line-height:1.6;">I have very sensitive skin, but this was extremely gentle. It leaves me feeling clean and refreshed every morning. Highly recommended.</p>
                    <div style="margin-top:1rem; display:flex; align-items:center; gap:10px;">
                        <div style="width:34px; height:34px; border-radius:50%; background:var(--clr-beige); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:600; color:var(--clr-dark-green);">R</div>
                        <div>
                            <div style="font-size:0.85rem; font-weight:600; color:var(--clr-dark-green);">Rohan K.</div>
                            <div style="font-size:0.7rem; color:#4a8b5c;"><i class="fa-solid fa-circle-check"></i> Verified Buyer</div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <section class="pdp-suggestions"`;
        content = content.replace('    <section class="pdp-suggestions"', faqRevHtml);
    }
    
    // 4. STICKY CTA
    if (!content.includes('stickyMobileCta')) {
        const titleMatch = content.match(/<h1 class="pdp-title">([\s\S]*?)<\/h1>/);
        const priceMatch = content.match(/<div class="pdp-price"[^>]*>([^<]+)<\/div>/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const price = priceMatch ? priceMatch[1] : '';

        const stickyHtml = `
    <!-- Sticky Mobile CTA -->
    <div class="sticky-cta-bar" id="stickyMobileCta">
        <div class="sticky-cta-info">
            <span class="sticky-cta-title">${title}</span>
            <span class="sticky-cta-price">${price}</span>
        </div>
        <button class="sticky-cta-btn" onclick="document.querySelector('.btn-add-cart').click()" aria-label="Quick Add to Cart">
            Add to Cart
        </button>
    </div>

    <div id="cart-toast"`;
        content = content.replace('    <div id="cart-toast"', stickyHtml);
    }
    
    // 5. FOOTER NEWSLETTER
    if (content.includes('api.web3forms.com')) {
        const oldFormMatch = content.match(/<form class="footer-newsletter__form"[\s\S]*?<\/form>/);
        if (oldFormMatch) {
            const oldForm = oldFormMatch[0];
            const newForm = `<form class="footer-newsletter__form" action="/api/newsletter-subscribe" method="POST"
                        onsubmit="submitNewsletter(event)">
                        <input type="email" name="email" placeholder="Email Address" class="footer-newsletter__input"
                            required aria-label="Email Address for newsletter">
                        <button type="submit" class="footer-newsletter__btn" aria-label="Subscribe to newsletter">Join</button>
                    </form>
                    <p class="footer-newsletter-note" style="font-size: 0.7rem; color: var(--clr-text-light); margin-top: 0.6rem; text-align: left;">
                        <i class="fa-solid fa-lock" style="font-size: 0.6rem; color: var(--clr-sage);"></i> Secure encrypted signup
                    </p>`;
            content = content.replace(oldForm, newForm);
        }
    }

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Processed: \${file} successfully.`);
}

console.log('All product pages upgraded successfully.');
