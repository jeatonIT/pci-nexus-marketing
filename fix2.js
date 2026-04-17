const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(fname => {
  let text = fs.readFileSync(fname, 'utf8');
  
  // The mangled sequence â€" is actually the Unicode chars:
  // U+00E2 (â) + U+20AC (€) + U+201D (") = em dash —
  // We need to replace these Unicode character combinations
  
  text = text.replace(/\u00e2\u20ac\u201d/g, '&mdash;');   // â€" → —
  text = text.replace(/\u00e2\u20ac\u2018/g, '&lsquo;');   // â€˜ → '
  text = text.replace(/\u00e2\u20ac\u2019/g, '&rsquo;');   // â€™ → '
  text = text.replace(/\u00e2\u20ac\u201c/g, '&ldquo;');   // â€œ → "
  text = text.replace(/\u00e2\u20ac\u201e/g, '&ndash;');   // â€" → –
  text = text.replace(/\u00e2\u20ac\u201a/g, '&sbquo;');   // â€š → ‚
  text = text.replace(/\u00c2\u00b7/g, '&middot;');        // Â· → ·
  text = text.replace(/\u00e2\u20ac\u201f/g, '&rdquo;');   // â€ → "
  text = text.replace(/\u00c3\u00a9/g, '&eacute;');        // Ã© → é
  text = text.replace(/\u00e2\u009c\u00a6/g, '&#10022;');  // âœ¦ → ✦
  text = text.replace(/\u00e2\u0086\u0092/g, '&rarr;');    // â†' → →
  text = text.replace(/\u00c2\u00b7/g, '&middot;');        // Â· → ·

  fs.writeFileSync(fname, text, 'utf8');
  console.log('Fixed:', fname);
});

console.log('Done.');
