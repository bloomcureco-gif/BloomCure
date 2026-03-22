const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /<b>\?<\/b> Free shipping/g, to: '<b>✦</b> Free shipping' },
    { from: /above \?999/g, to: 'above ₹999' },
    { from: /<b>\?\?<\/b> 100% Natural/g, to: '<b>🌿</b> 100% Natural' },
    { from: /<b>\?<\/b> New arrivals/g, to: '<b>✦</b> New arrivals' },
    { from: /<b>\?\?<\/b> Zero plastic/g, to: '<b>🌱</b> Zero plastic' },
    { from: /<b>\?<\/b> Cruelty-free/g, to: '<b>✦</b> Cruelty-free' },
    { from: /<b>\?\?<\/b> Small-batch/g, to: '<b>🧼</b> Small-batch' },
    { from: /<b>\?<\/b> 30-day/g, to: '<b>✦</b> 30-day' },
    { from: /<b>\?\?<\/b> Dermatologist/g, to: '<b>🍃</b> Dermatologist' },
    { from: /Radiance  Calming/g, to: 'Radiance · Calming' },
    { from: /taxes  Free shipping/g, to: 'taxes · Free shipping' },
    { from: /\?349/g, to: '₹349' },
    { from: /\?449/g, to: '₹449' },
    { from: /\?399/g, to: '₹399' },
    { from: /\?249/g, to: '₹249' },
    { from: /\?299/g, to: '₹299' },
    { from: /\?199/g, to: '₹199' },
    { from: /\?149/g, to: '₹149' },
    { from: /\?599/g, to: '₹599' },
    { from: /over \?999/g, to: 'over ₹999' },
    { from: / /g, to: '· ' }, // Fix some lingering corruptions in index.html
    { from: /â• /g, to: '═' },     // Fix styling decorations
    { from: /â”€/g, to: '─' },
    { from: /ðŸŒ¿/g, to: '🌿' },
    { from: /ðŸŒ±/g, to: '🌱' },
    { from: /ðŸ§¼/g, to: '🧼' },
    { from: /ðŸ  /g, to: '🍃' },
    { from: /âœ¦/g, to: '✦' },
    { from: /â‚¹/g, to: '₹' }
];

const dir = 'c:\\Users\\Purushotham\\Documents\\bloomcure';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});

// Also check JS files if they have literal ? in suspicious places
const jsFiles = ['js/product-page.js', 'js/gen_products.js'];
jsFiles.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // In JS files, we usually want to fix ₹ specifically if it became ?
    // But be careful not to replace actual question marks (ternaries, strings, etc.)
    // We'll only target (₹price) or ₹${price} if they became ?${price}
    content = content.replace(/\?\$\{/g, '₹${');
    content = content.replace(/\(₹(\d+)\)/g, '(₹$1)'); // already might be ₹
    content = content.replace(/\(\?(\d+)\)/g, '(₹$1)');
    content = content.replace(/ \?(\d+)/g, ' ₹$1'); 
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
