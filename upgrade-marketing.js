const fs = require('fs');
const path = require('path');

const dir = '.';

const marketingData = {
    'bath-salts': {
        why: [
            'Pure, high-grade botanical extracts',
            'Sourced ethically from sustainable farms',
            'Zero synthetic fragrances or artificial dyes'
        ],
        for: [
            'Anyone seeking a calming, rejuvenating ritual',
            'People with dry, dull, or tired skin',
            'Lovers of pure botanical and earthy aromas'
        ],
        avoid: [
            'People with open wounds or severe active eczema',
            'Those highly allergic to natural essential oils'
        ],
        faqs: [
            { q: 'Is this suitable for daily use?', a: 'Absolutely. Our handcrafted formulas are free of harsh chemicals and designed for gentle, daily cleansing and nourishment.' },
            { q: 'Does it contain artificial fragrances?', a: 'No, we use 100% pure essential oils for a totally natural scent profile that provides real aromatherapy benefits.' },
            { q: 'Is this product vegan & cruelty-free?', a: 'Every Bloom Cure product is cruelty-free and ethically sourced. Check the details section above to confirm if it contains goat milk or honey, otherwise it is entirely vegan.' }
        ]
    },
    'bamboo-toothbrush': {
        why: [
            '100% biodegradable and earth-friendly',
            'Naturally antimicrobial bamboo handle',
            'Charcoal-infused bristles for gentle whitening'
        ],
        for: [
            'Eco-conscious shoppers reducing plastic waste',
            'People looking for natural teeth whitening',
            'Anyone wanting a premium sustainable oral care routine'
        ],
        avoid: [
            'Those who aggressively brush (requires gentle technique)',
            'People requiring specialized orthodontic brush heads'
        ],
        faqs: [
            { q: 'How often should I replace my bamboo brush?', a: 'Dentists recommend replacing any toothbrush every 2 to 3 months, or sooner if the bristles become frayed.' },
            { q: 'Can I compost the whole toothbrush?', a: 'The bamboo handle is fully compostable! Simply pluck out the nylon bristles with pliers before tossing the handle into your compost bin.' },
            { q: 'Are the bristles hard or soft?', a: 'Our brushes feature soft, rounded BPA-free nylon bristles that are gentle on your gums and enamel while offering a thorough clean.' }
        ]
    },
    'besan': {
        why: [
            'Traditional Ayurvedic glow enhancer',
            'Naturally absorbs excess oil and sebum',
            'Acts as a mild, safe daily exfoliant'
        ],
        for: [
            'People with oily, acne-prone, or combination skin',
            'Those looking for a natural, soap-free face cleanser',
            'Anyone wanting to remove a mild tan naturally'
        ],
        avoid: [
            'People with extremely dry or flaky skin (unless mixed with milk/curd)',
            'Those looking for heavy makeup removal'
        ],
        faqs: [
            { q: 'Can I use this instead of face wash?', a: 'Yes! Besan (gram flour) is an ancient Ayurvedic soap alternative that cleanses dirt without stripping the skin’s natural moisture barrier.' },
            { q: 'What should I mix this with?', a: 'For oily skin, mix with rose water or aloe gel. For dry skin, mix with raw milk, yogurt, or a few drops of almond oil.' },
            { q: 'Will this help with acne?', a: 'Besan naturally regulates sebum production. When mixed with a pinch of turmeric, it becomes a powerful anti-acne treatment.' }
        ]
    },
    'charcoal': {
        why: [
            'Acts like a magnet for deep-seated impurities',
            'Ultimate urban skin protection against pollution',
            'Balances oily skin and prevents blackheads'
        ],
        for: [
            'City dwellers exposed to daily pollution',
            'People prone to blackheads and congested pores',
            'Athletes and heavy sweaters needing a deep cleanse'
        ],
        avoid: [
            'People with extremely dry or dehydrated skin',
            'Those with rosacea who require ultra-hydrating washes'
        ],
        faqs: [
            { q: 'Will the charcoal stain my skin or bathroom?', a: 'Not at all! The active charcoal is formulated into a solid bar that rinses away completely clean, leaving no residue behind.' },
            { q: 'Is it too harsh for daily use?', a: 'While deeply detoxifying, our artisan soap base contains nourishing oils that prevent the charcoal from over-drying your skin during daily use.' },
            { q: 'Can I use this on my body and my face?', a: 'Yes, it works beautifully as a full-body detox bar and a purifying facial cleanser for oily or acne-prone skin profiles.' }
        ]
    },
    'coconut': {
        why: [
            'Ultimate, deep-penetrating hydration',
            'Rich in anti-aging fatty acids and antioxidants',
            'Creates a luxuriously thick, protective lather'
        ],
        for: [
            'People suffering from dry, flaky, or tight skin',
            'Those needing gentle nourishment during winter',
            'Individuals with sensitive, easily irritated skin'
        ],
        avoid: [
            'People with highly comedogenic (pore-clogging) facial acne',
            'Those who prefer an ultra-light, squeaky-clean finish'
        ],
        faqs: [
            { q: 'Does this smell strongly of coconuts?', a: 'It has a mild, creamy, and entirely natural coconut aroma derived directly from pure coconut oil, not artificial perfumes.' },
            { q: 'Will it leave a greasy residue?', a: 'No, our saponification process transforms the coconut oil into a cleansing soap that hydrates without leaving an oily film on the skin.' },
            { q: 'Is it safe for babies or toddlers?', a: 'Yes, handmade coconut soap is globally recognized as one of the gentlest and safest cleansers for delicate infant skin.' }
        ]
    },
    'coffee': {
        why: [
            'Caffeine stimulates blood flow and circulation',
            'Natural coffee grounds provide vigorous exfoliation',
            'Helps temporarily reduce the appearance of cellulite'
        ],
        for: [
            'Morning shower lovers needing an aromatic wake-up',
            'People looking to smooth bumpy or uneven skin texture',
            'Those wanting to firm and tighten skin elasticity'
        ],
        avoid: [
            'People with sensitive skin who avoid harsh physical scrubbers',
            'Use carefully around delicate facial skin'
        ],
        faqs: [
            { q: 'Can I use this on my face?', a: 'We recommend this primarily as a body bar, as the coffee grounds provide an intense exfoliation that might be too vigorous for delicate facial skin.' },
            { q: 'Does the caffeine actually absorb into the skin?', a: 'Topical caffeine acts as a powerful antioxidant and vasodilator, tightening the skin’s surface when massaged in during your shower.' },
            { q: 'Will it make my shower smell like a cafe?', a: 'Yes! The rich, roasted espresso aroma is completely natural and provides an incredibly uplifting morning sensory experience.' }
        ]
    },
    'hotel-soaps': {
        why: [
            'Perfectly sized for travel, guests, or gifting',
            'Individually wrapped for freshness and hygiene',
            'Provides a premium boutique hospitality experience'
        ],
        for: [
            'Airbnb hosts, boutique hotels, or bed & breakfasts',
            'Travelers needing convenient, zero-leak body wash',
            'People who want to sample different Bloom Cure varieties'
        ],
        avoid: [
            'Those looking for a long-lasting daily shower bar',
            'People who dislike managing smaller soap bits'
        ],
        faqs: [
            { q: 'How long does a mini bar last?', a: 'Depending on usage, a single mini guest soap will typically last one person for 3 to 5 full body showers.' },
            { q: 'Can I choose the flavors inside the bundle?', a: 'Guest bundles are pre-assorted with our best-selling botanical blends to ensure a universally pleasing experience for your guests.' },
            { q: 'Is the packaging eco-friendly?', a: 'Yes, just like our full-sized bars, our hotel mini-soaps are packaged without plastics, using fully recyclable paper wraps.' }
        ]
    },
    'loofah': {
        why: [
            'Completely natural and biodegradable sponge',
            'Stimulates lymphatic drainage and blood flow',
            'Provides an ideal surface for generating rich lather'
        ],
        for: [
            'Anyone looking to ditch plastic shower poufs',
            'People trying to achieve a closer, smoother shave',
            'Those battling ingrown hairs or "strawberry legs"'
        ],
        avoid: [
            'People with sunburns or actively inflamed skin conditions',
            'Those seeking an ultra-soft sponge (loofahs are naturally firm)'
        ],
        faqs: [
            { q: 'Why is it stiff when I first get it?', a: 'Natural loofahs are dried gourds! Once soaked in warm water for a few minutes, they magically expand and soften perfectly for the skin.' },
            { q: 'How do I keep it clean and sanitary?', a: 'Rinse it thoroughly after each use, squeeze out excess water, and hang it to dry outside the direct stream of the shower to prevent bacteria.' },
            { q: 'When should I throw it away?', a: 'Because it is natural plant matter, you should replace your loofah every 4 to 6 weeks. You can simply toss the old one into your compost bin!' }
        ]
    },
    'multani-mitti': {
        why: [
            'The legendary Indian "Fullers Earth" healing clay',
            'Miraculously absorbs dirt, sweat, and impurities',
            'Evens out skin tone and cools the skin naturally'
        ],
        for: [
            'People dealing with heat rashes or severe oily skin',
            'Those suffering from cystic acne or angry breakouts',
            'Anyone wanting a cooling, deeply clarifying face wash'
        ],
        avoid: [
            'People with incredibly dry, winter-chapped skin',
            'Those looking for heavy moisturization'
        ],
        faqs: [
            { q: 'Will it dry my skin out?', a: 'Multani Mitti is highly absorbent. While our soap formula balances it with oils, we always recommend following up with a light moisturizer.' },
            { q: 'Can it help with back acne (bacne)?', a: 'Absolutely. The cooling and oil-absorbing properties of this clay make it an incredible daily body wash for those prone to chest and back breakouts.' },
            { q: 'Is it gritty?', a: 'No, the clay is ultra-finely milled so it incorporates smoothly into the soap base without feeling like a harsh physical scrub.' }
        ]
    },
    'neem': {
        why: [
            'The ultimate Ayurvedic antibacterial powerhouse',
            'Rapidly soothes redness, itching, and inflammation',
            'Creates an invisible shield against microbes and body odor'
        ],
        for: [
            'People struggling with body odor or excessive sweating',
            'Those with fungal infections, dandruff, or ringworm',
            'Anyone needing rapid relief from itchy, irritated skin'
        ],
        avoid: [
            'People who highly dislike strong, earthy herbal scents',
            'Those wanting a sweet, floral, or fruity shower experience'
        ],
        faqs: [
            { q: 'Does it smell like medicinal neem?', a: 'It has a distinct, earthy, therapeutic aroma. We balance the pungent neem with complimentary essential oils to make the scent refreshing rather than harsh.' },
            { q: 'Can I use it on my scalp?', a: 'Yes! Neem soap is a traditional remedy for clearing up flaky scalps and bringing balance to oil production at the hair roots.' },
            { q: 'Is it safe for children?', a: 'Yes, neem is widely used in Ayurveda for children’s skin issues, though we recommend a patch test first.' }
        ]
    },
    'red-sandalwood': {
        why: [
            'Known as Rakta Chandana, a royal Ayurvedic ingredient',
            'Visibly reduces pigmentation and dark spots',
            'Delivers a radiant, glowing complexion instantly'
        ],
        for: [
            'Brides-to-be or anyone prepping for special occasions',
            'People struggling with hyperpigmentation or acne scars',
            'Lovers of luxurious, ancient skincare traditions'
        ],
        avoid: [
            'People seeking completely scent-free products',
            'Those with severe, medically-diagnosed eczema (consult a doctor)'
        ],
        faqs: [
            { q: 'What is the difference between normal and red sandalwood?', a: 'While regular sandalwood is prized for its aroma, Red Sandalwood (Rakta Chandana) is prized specifically for its medicinal ability to fade scars and induce a youthful glow.' },
            { q: 'Will it color my skin red?', a: 'No! The deep red hue of the soap comes from the botanical powder, but it rinses away completely clear, leaving only glowing skin behind.' },
            { q: 'Can it remove a suntan?', a: 'Yes, regular use of red sandalwood is one of Ayurveda’s most potent remedies for gently reversing sun damage and tan lines.' }
        ]
    },
    'red-wine': {
        why: [
            'Packed with Resveratrol, a powerful anti-aging antioxidant',
            'Fights free radicals that cause premature wrinkles',
            'Restores collagen and elasticity for a youthful bounce'
        ],
        for: [
            'Mature skin types looking for an anti-aging cleanse',
            'People wanting a luxurious, romantic bath experience',
            'Wine lovers looking for unique wellness rituals'
        ],
        avoid: [
            'People seeking heavily antibacterial or medicated soaps',
            'Very young children (opt for gentler coconut or neem instead)'
        ],
        faqs: [
            { q: 'Does it actually contain real wine?', a: 'Yes! We use high-quality red wine extract, which has the alcohol removed but retains all the potent, skin-loving antioxidants and polyphenols.' },
            { q: 'Will it smell like alcohol?', a: 'Not at all. The soap features a rich, deep, dark berry aroma—sophisticated and lightly sweet, but entirely alcohol-free in scent.' },
            { q: 'How does wine help the skin?', a: 'The antioxidants in red grapes (resveratrol) are scientifically proven to fight environmental stressors and protect the skin’s delicate collagen.' }
        ]
    },
    'rice-goat-milk': {
        why: [
            'Lactic acid from goat milk gently melts dead skin away',
            'Rice water is a legendary Asian secret for glass-like skin',
            'Unparalleled creamy, milky hydration that repairs barriers'
        ],
        for: [
            'People with highly sensitive, dry, or damaged skin barriers',
            'Those seeking the "glass skin" brightening effect',
            'Anyone who loves an ultra-creamy, luxurious lather'
        ],
        avoid: [
            'Strict vegans (contains ethically sourced goat milk)',
            'People needing aggressive, heavy-duty exfoliation'
        ],
        faqs: [
            { q: 'Is this vegan?', a: 'No, this specific formulation uses raw goat milk for its incredible skin-repairing lactic acid. We ensure all milk is sourced completely cruelty-free from ethical local farms.' },
            { q: 'What does the rice water do?', a: 'Fermented rice extract is rich in vitamins and amino acids. It has been used for centuries in East Asia to brighten dull skin and shrink the appearance of pores.' },
            { q: 'Can I use this on my baby?', a: 'Goat milk soap is famously recommended by dermatologists for infants and those with severe eczema due to its pH level closely matching human skin.' }
        ]
    },
    'sandalwood': {
        why: [
            'The undisputed king of calming aromatherapy',
            'Naturally cools the body and soothes the nervous system',
            'Fades blemishes and provides a lasting majestic aroma'
        ],
        for: [
            'People needing stress relief and mental grounding',
            'Those wanting a premium, deeply traditional bathing ritual',
            'Anyone dealing with minor skin irritations or rashes'
        ],
        avoid: [
            'People looking for unscented, completely neutral soaps',
            'Those who prefer citrus or heavily sweet fragrances'
        ],
        faqs: [
            { q: 'Is this real sandalwood?', a: 'Yes, we use authentic, ethically sourced sandalwood oil and powder. We never use the cheap synthetic fragrances found in commercial alternatives.' },
            { q: 'Does the scent last on the skin?', a: 'Sandalwood is a natural fixative, meaning its warm, woody aroma lingers beautifully and subtly on the skin long after your shower.' },
            { q: 'Is it good for acne?', a: 'Sandalwood is gently antiseptic and very cooling. It helps shrink active pimples overnight without causing the redness associated with harsh chemicals.' }
        ]
    },
    'seegekai-powder': {
        why: [
            'The traditional Indian secret for long, thick, luscious hair',
            'Cleanses the scalp without stripping natural hair oils',
            'Naturally low pH prevents hair fall and dandruff'
        ],
        for: [
            'People suffering from hair fall and weak roots',
            'Those transitioning to a completely natural hair care routine',
            'Anyone with sensitive scalps that react poorly to chemical shampoos'
        ],
        avoid: [
            'People looking for an instant, massive chemical foam',
            'Those unwilling to spend 2 extra minutes preparing a paste'
        ],
        faqs: [
            { q: 'How do I use this instead of shampoo?', a: 'Mix the powder with water to form a loose paste. Apply to a wet scalp, massage gently for 2 minutes, and rinse thoroughly. No conditioner needed!' },
            { q: 'Will it foam like normal shampoo?', a: 'Shikakai (Seegekai) contains natural saponins that create a mild, gentle lather, but it will not create the massive, artificial bubble bath foam of chemical sulfates.' },
            { q: 'Does it dry out the hair?', a: 'Unlike chemical shampoos that strip your hair completely, Seegekai cleans the scalp while leaving your hair’s protective natural oils perfectly intact.' }
        ]
    },
    'seegekai': {
        why: [
            'A convenient bar format of the legendary hair cleanser',
            'Promotes rapid hair growth and deeply strengthens roots',
            'Acts as a natural detangler for silky, manageable hair'
        ],
        for: [
            'People wanting the benefits of Seegekai without the powder mess',
            'Those looking for an all-in-one eco-friendly travel shampoo bar',
            'Anyone battling chronic dandruff or itchy scalps'
        ],
        avoid: [
            'People with chemically bleached, highly porous hair (test first)',
            'Those accustomed only to heavy silicone-based liquid shampoos'
        ],
        faqs: [
            { q: 'Is this a shampoo bar or a body soap?', a: 'While safe for the body, this bar is specially formulated as a solid shampoo bar for natural, chemical-free hair washing.' },
            { q: 'How do I wash my hair with a solid bar?', a: 'Simply wet your hair thoroughly, rub the bar directly against your scalp in circular motions to build a lather, massage with your fingers, and rinse.' },
            { q: 'Will I need a conditioner?', a: 'Seegekai is naturally conditioning! However, if you have very long or dry hair, a light natural oil applied to the ends afterward works wonders.' }
        ]
    },
    'soapnut': {
        why: [
            'Nature’s ultimate hypoallergenic cleanser',
            'Contains perfectly balanced natural saponins',
            'The purest, safest choice for highly reactive skin'
        ],
        for: [
            'People with extreme chemical sensitivities or allergies',
            'Mothers looking for a safe wash for infants and toddlers',
            'Those wanting a truly purist, zero-additive cleansing experience'
        ],
        avoid: [
            'People looking for heavy exfoliation',
            'Those who prefer strong, lingering perfume scents'
        ],
        faqs: [
            { q: 'What is a Soapnut (Reetha)?', a: 'Soapnuts are the dried fruit shells of the Sapindus tree. When agitated in water, they naturally produce a remarkable, 100% natural cleansing foam.' },
            { q: 'Does it have a scent?', a: 'It has a very faint, clean, natural earthy aroma. We add absolutely no synthetic fragrances, making it the perfect choice for sensitive noses.' },
            { q: 'Is it completely tear-free?', a: 'While extremely gentle, soapnuts are naturally slightly acidic. We recommend keeping the lather away from the immediate eye area.' }
        ]
    }
};

const files = fs.readdirSync(dir).filter(f => f.startsWith('product-') && f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // Determine product key
    let key = file.replace('product-', '').replace('.html', '');
    
    // Provide a generic fallback if key not found (though all 17 are mapped)
    let mkData = marketingData[key] || marketingData['bath-salts'];

    // 1. Replace "Why this product?" bullets
    const quickFactsRegex = /<div class="pdp-quick-facts"[\s\S]*?<\/div>\s*<!-- Form-less Secure Add to Cart Action -->/g;
    const newQuickFacts = `<div class="pdp-quick-facts" style="margin-bottom: 2rem; background: rgba(123, 139, 79, 0.05); padding: 1.2rem; border-radius: 12px; border-left: 3px solid var(--clr-sage);">
                        <strong style="font-size: 0.9rem; color: var(--clr-dark-green); display: block; margin-bottom: 0.5rem;">Why this product?</strong>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.4rem;">
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> ${mkData.why[0]}</li>
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> ${mkData.why[1]}</li>
                            <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right:6px;"></i> ${mkData.why[2]}</li>
                        </ul>
                    </div>
                    
                    <!-- Form-less Secure Add to Cart Action -->`;
    
    content = content.replace(quickFactsRegex, newQuickFacts);

    // 2. Replace pdp-audience block
    const audienceRegex = /<!-- NEW SECTION: Audience -->[\s\S]*?<\/section>/g;
    const newAudience = `<!-- NEW SECTION: Audience -->
    <section class="pdp-audience" style="background: var(--clr-beige); padding: 4rem 0;">
        <div class="container">
            <div class="pdp-audience-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                <div class="pdp-audience-card" style="background: white; padding: 2rem; border-radius: 16px; border-top: 4px solid var(--clr-sage);">
                    <h3 style="color: var(--clr-dark-green); margin-bottom: 1rem; font-size: 1.2rem;"><i class="fa-solid fa-face-smile" style="color:var(--clr-sage);"></i> Who is it for?</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.9rem;">
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> ${mkData.for[0]}</li>
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> ${mkData.for[1]}</li>
                        <li><i class="fa-solid fa-check" style="color:var(--clr-sage); margin-right: 6px;"></i> ${mkData.for[2]}</li>
                    </ul>
                </div>
                <div class="pdp-audience-card" style="background: white; padding: 2rem; border-radius: 16px; border-top: 4px solid #d98e8e;">
                    <h3 style="color: var(--clr-dark-green); margin-bottom: 1rem; font-size: 1.2rem;"><i class="fa-solid fa-circle-exclamation" style="color:#d98e8e;"></i> Who should avoid?</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; color: var(--clr-text); display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.9rem;">
                        <li><i class="fa-solid fa-xmark" style="color:#d98e8e; margin-right: 6px;"></i> ${mkData.avoid[0]}</li>
                        <li><i class="fa-solid fa-xmark" style="color:#d98e8e; margin-right: 6px;"></i> ${mkData.avoid[1]}</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>`;

    content = content.replace(audienceRegex, newAudience);

    // 3. Replace pdp-faq block
    const faqRegex = /<!-- NEW SECTION: FAQ -->[\s\S]*?<\/section>/g;
    const newFaq = `<!-- NEW SECTION: FAQ -->
    <section class="pdp-faq" style="padding: 5rem 0;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
            <h2 class="pdp-section-heading" style="text-align:center;"><i class="fa-solid fa-circle-question"></i> Frequently Asked Questions</h2>
            <div class="faq-list" style="display:flex; flex-direction:column; gap:1rem; margin-top:2rem;">
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">${mkData.faqs[0].q} <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">${mkData.faqs[0].a}</p>
                </details>
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">${mkData.faqs[1].q} <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">${mkData.faqs[1].a}</p>
                </details>
                <details class="faq-item" style="background:white; border:1px solid rgba(26,46,32,0.1); border-radius:12px; padding:1.2rem; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--clr-dark-green); list-style:none; display:flex; justify-content:space-between; align-items:center;">${mkData.faqs[2].q} <i class="fa-solid fa-chevron-down" style="font-size:0.8rem; color:var(--clr-sage);"></i></summary>
                    <p style="margin-top:1rem; font-size:0.9rem; color:var(--clr-text-light); line-height:1.6;">${mkData.faqs[2].a}</p>
                </details>
            </div>
        </div>
    </section>`;

    content = content.replace(faqRegex, newFaq);

    fs.writeFileSync(path.join(dir, file), content, 'utf-8');
    console.log('Injected bespoke marketing copy into: ' + file);
});
console.log('DONE');
