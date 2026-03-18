import sys
import re
import os

try:
    with open('shop.html', 'r', encoding='utf-8') as f:
        shopHtml = f.read()

    # CSS
    cssStart = shopHtml.find('/* ═══════════════ SEARCH OVERLAY ═══════════════ */')
    cssEnd = shopHtml.find('@media (max-width: 768px) {\n            .premium-nav__inner')
    searchCss = shopHtml[cssStart:cssEnd].strip()

    # HTML
    htmlStart = shopHtml.find('<!-- ═══════════════ SEARCH OVERLAY ═══════════════ -->')
    htmlEnd = shopHtml.find('<!-- ═══════════════ MOBILE MENU OVERLAY ═══════════════ -->')
    searchHtml = shopHtml[htmlStart:htmlEnd].strip()

    # JS
    jsStart = shopHtml.find('        const productsDB = [')
    jsEnd = shopHtml.find('        function toggleMobileMenu() {')
    searchJs = shopHtml[jsStart:jsEnd].strip()

    print(f"Extracted: CSS {len(searchCss)}, HTML {len(searchHtml)}, JS {len(searchJs)}")

    if len(searchCss) < 100 or len(searchHtml) < 100 or len(searchJs) < 100:
        print("Extraction failed!")
        sys.exit(1)

    # CART
    with open('cart.html', 'r', encoding='utf-8') as f:
        cartHtml = f.read()

    cartCssStart = cartHtml.find('/* ═══════════════ SEARCH OVERLAY ═══════════════ */')
    cartCssEnd = cartHtml.find('/* ═══════════════ Cart Page Specific Styles ═══════════════ */')
    if cartCssStart != -1 and cartCssEnd != -1:
        cartHtml = cartHtml[:cartCssStart] + searchCss + '\n\n        ' + cartHtml[cartCssEnd:]

    cartHtmlStart = cartHtml.find('<!-- ═══════════════ SEARCH OVERLAY ═══════════════ -->')
    cartHtmlEnd = cartHtml.find('<!-- ═══════════════ MOBILE MENU OVERLAY ═══════════════ -->')
    if cartHtmlStart != -1 and cartHtmlEnd != -1:
        cartHtml = cartHtml[:cartHtmlStart] + searchHtml + '\n\n    ' + cartHtml[cartHtmlEnd:]

    cartJsStart = cartHtml.find('        // ═══════════════ SEARCH & MOBILE MENU LOGIC ═══════════════')
    cartScriptEnd = cartHtml.rfind('</script>')
    if cartJsStart != -1 and cartScriptEnd != -1:
        cartHtml = cartHtml[:cartJsStart] + '        // ═══════════════ SEARCH LOGIC ═══════════════\n\n' + searchJs + '\n    ' + cartHtml[cartScriptEnd:]

    with open('cart.html', 'w', encoding='utf-8') as f:
        f.write(cartHtml)
    print("Updated cart.html")

    # ABOUT
    with open('about.html', 'r', encoding='utf-8') as f:
        aboutHtml = f.read()

    if '<!-- ═══════════════ SEARCH OVERLAY ═══════════════ -->' not in aboutHtml:
        aboutHtml = aboutHtml.replace(
            '<a href="cart.html" class="premium-nav__icon-btn premium-nav__cart-btn" title="Cart">',
            '<button class="premium-nav__icon-btn" title="Search" onclick="toggleSearch(event)">\n                    <i class="fa-solid fa-magnifying-glass"></i>\n                </button>\n                <a href="cart.html" class="premium-nav__icon-btn premium-nav__cart-btn" title="Cart">'
        )
        aboutHtml = aboutHtml.replace('</style>', '        ' + searchCss + '\n    </style>')
        menuIdx = aboutHtml.find('<!-- Mobile Menu Overlay -->')
        if menuIdx != -1:
            aboutHtml = aboutHtml[:menuIdx] + searchHtml + '\n\n    ' + aboutHtml[menuIdx:]
        else:
            footEnd = aboutHtml.rfind('</footer>')
            if footEnd != -1:
                aboutHtml = aboutHtml[:footEnd+9] + '\n\n    ' + searchHtml + '\n' + aboutHtml[footEnd+9:]
                
        if '<script>' in aboutHtml:
            aboutHtml = aboutHtml.replace('</script>', '        ' + searchJs + '\n    </script>')
        else:
            aboutHtml = aboutHtml.replace('</body>', '    <script>\n' + searchJs + '\n    </script>\n</body>')
            
        with open('about.html', 'w', encoding='utf-8') as f:
            f.write(aboutHtml)
        print("Updated about.html")
    else:
        print("about.html already has search overlay")

    os.remove('update_search.py')
except Exception as e:
    print("Error:", e)
