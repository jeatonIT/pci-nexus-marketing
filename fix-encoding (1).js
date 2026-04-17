const fs = require('fs');
const path = require('path');

const files = ['index.html','features.html','security.html','consultants.html','comparison.html','onboarding.html'];

const replacements = [
  ['\u00e2\u0080\u009c', '\u201c'],  // â€œ -> "
  ['\u00e2\u0080\u009d', '\u201d'],  // â€ -> "
  ['\u00e2\u0080\u0099', '\u2019'],  // â€™ -> '
  ['\u00e2\u0080\u0094', '\u2014'],  // â€" -> —
  ['\u00e2\u0080\u0093', '\u2013'],  // â€" -> –
  ['\u00e2\u0086\u0092', '\u2192'],  // â†' -> →
  ['\u00e2\u0098\u0085', '\u2605'],  // â˜… -> ★
  ['\u00e2\u0098\u0091', '\u2611'],  // â˜' -> ☑
  ['\u00e2\u009c\u0094', '\u2714'],  // âœ" -> ✓
  ['\u00e2\u0080\u00a6', '\u2026'],  // â€¦ -> …
  ['\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u0084\u00a2', '\u2019'], // fallback
  // Also remove any injected PS script fragments
  ["if ($m -notmatch 'white-space') { $m -replace '\\}'", ''],
  ["</script>, 'white-space: nowrap; }' }", ''],
];

files.forEach(file => {
  if (!fs.existsSync(file)) { console.log('SKIP:', file); return; }
  let content = fs.readFileSync(file, 'utf8');
  const before = content;
  replacements.forEach(([from, to]) => {
    while (content.includes(from)) content = content.split(from).join(to);
  });
  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('FIXED:', file);
  } else {
    console.log('NO CHANGE:', file);
  }
});
