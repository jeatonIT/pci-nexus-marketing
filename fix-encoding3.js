// Windows-1252 double-encoding fix
// Each original UTF-8 byte was mis-interpreted as Windows-1252 then re-encoded as UTF-8
// This script reverses that process at the byte level

const fs = require('fs');

const files = [
  'index.html','features.html','security.html',
  'consultants.html','comparison.html','onboarding.html'
];

// Format: [corrupted_hex_bytes, correct_hex_bytes, description]
// Corrupted pattern derived from: each original byte B →
//   look up B in Windows-1252 → get Unicode codepoint → encode as UTF-8
const FIXES = [
  // → U+2192 = E2 86 92
  //   E2→C3A2, 86(†U+2020)→E280A0, 92('U+2019)→E28099
  [[0xC3,0xA2,0xE2,0x80,0xA0,0xE2,0x80,0x99], [0xE2,0x86,0x92], '→'],

  // ★ U+2605 = E2 98 85
  //   E2→C3A2, 98(˜U+02DC)→CB9C, 85(…U+2026)→E280A6
  [[0xC3,0xA2,0xCB,0x9C,0xE2,0x80,0xA6], [0xE2,0x98,0x85], '★'],

  // ✓ U+2713 = E2 9C 93
  //   E2→C3A2, 9C(œU+0153)→C593, 93("U+201C)→E2809C
  [[0xC3,0xA2,0xC5,0x93,0xE2,0x80,0x9C], [0xE2,0x9C,0x93], '✓'],

  // ✔ U+2714 = E2 9C 94
  //   E2→C3A2, 9C→C593, 94("U+201D)→E2809D
  [[0xC3,0xA2,0xC5,0x93,0xE2,0x80,0x9D], [0xE2,0x9C,0x94], '✔'],

  // ✅ U+2705 = E2 9C 85
  //   E2→C3A2, 9C→C593, 85→E280A6
  [[0xC3,0xA2,0xC5,0x93,0xE2,0x80,0xA6], [0xE2,0x9C,0x85], '✅'],

  // ☑ U+2611 = E2 98 91
  //   E2→C3A2, 98→CB9C, 91('U+2018)→E28098
  [[0xC3,0xA2,0xCB,0x9C,0xE2,0x80,0x98], [0xE2,0x98,0x91], '☑'],

  // … U+2026 = E2 80 A6
  //   E2→C3A2, 80(€U+20AC)→E282AC, A6(¦)→C2A6
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xC2,0xA6], [0xE2,0x80,0xA6], '…'],

  // " U+201C = E2 80 9C
  //   E2→C3A2, 80→E282AC, 9C(œ)→C593
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xC5,0x93], [0xE2,0x80,0x9C], '"'],

  // " U+201D = E2 80 9D
  //   E2→C3A2, 80→E282AC, 9D(U+009D)→C29D
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xC2,0x9D], [0xE2,0x80,0x9D], '"'],

  // ' U+2019 = E2 80 99
  //   E2→C3A2, 80→E282AC, 99(™U+2122)→E284A2
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xE2,0x84,0xA2], [0xE2,0x80,0x99], '\u2019'],

  // ' U+2018 = E2 80 98
  //   E2→C3A2, 80→E282AC, 98(˜)→CB9C
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xCB,0x9C], [0xE2,0x80,0x98], '\u2018'],

  // — U+2014 = E2 80 94
  //   E2→C3A2, 80→E282AC, 94("U+201D)→E2809D
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xE2,0x80,0x9D], [0xE2,0x80,0x94], '—'],

  // – U+2013 = E2 80 93
  //   E2→C3A2, 80→E282AC, 93("U+201C)→E2809C
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xE2,0x80,0x9C], [0xE2,0x80,0x93], '–'],

  // • U+2022 = E2 80 A2
  //   E2→C3A2, 80→E282AC, A2(¢)→C2A2
  [[0xC3,0xA2,0xE2,0x82,0xAC,0xC2,0xA2], [0xE2,0x80,0xA2], '•'],

  // ─ U+2500 = E2 94 80 (box drawing in CSS comments)
  //   E2→C3A2, 94("U+201D)→E2809D, 80(€)→E282AC
  [[0xC3,0xA2,0xE2,0x80,0x9D,0xE2,0x82,0xAC], [0xE2,0x94,0x80], '─'],
];

// Sort by length descending so longer patterns match first
FIXES.sort((a, b) => b[0].length - a[0].length);

function applyFix(buf, find, replace) {
  const out = [];
  let i = 0;
  const flen = find.length;
  while (i < buf.length) {
    if (i <= buf.length - flen) {
      let match = true;
      for (let j = 0; j < flen; j++) {
        if (buf[i + j] !== find[j]) { match = false; break; }
      }
      if (match) {
        for (const b of replace) out.push(b);
        i += flen;
        continue;
      }
    }
    out.push(buf[i]);
    i++;
  }
  return Buffer.from(out);
}

files.forEach(file => {
  if (!fs.existsSync(file)) { console.log('SKIP:', file); return; }
  let buf = fs.readFileSync(file);
  const originalLen = buf.length;
  let totalFixed = 0;

  FIXES.forEach(([find, replace, desc]) => {
    const before = buf.length;
    buf = applyFix(buf, find, replace);
    const count = (before - buf.length) / (find.length - replace.length);
    if (count > 0) {
      console.log(`  ${file}: fixed ${count}x ${desc}`);
      totalFixed += count;
    }
  });

  fs.writeFileSync(file, buf);
  if (totalFixed > 0) {
    console.log(`DONE: ${file} (${originalLen - buf.length} bytes removed, ${totalFixed} characters fixed)\n`);
  } else {
    console.log(`NO CHANGE: ${file}\n`);
  }
});

console.log('All files processed.');
console.log('git add index.html features.html security.html consultants.html comparison.html onboarding.html');
console.log('git commit -m "fix: Windows-1252 double-encoded UTF-8 corrected"');
console.log('git push');
