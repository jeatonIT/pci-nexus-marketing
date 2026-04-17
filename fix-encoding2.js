// Byte-level fix for double-encoded UTF-8
// Each original 3-byte UTF-8 sequence was corrupted into 6 bytes
// This restores them back to the correct 3-byte sequences

const fs = require('fs');

const files = [
  'index.html','features.html','security.html',
  'consultants.html','comparison.html','onboarding.html'
];

// Each entry: [corrupted_bytes, correct_bytes]
// Corrupted pattern: each original byte B was re-encoded as UTF-8 latin-1
// E2 → C3 A2,  then continuation bytes XX → C2 XX
const FIXES = [
  // → (arrow right U+2192 = E2 86 92)
  [[0xC3,0xA2,0xC2,0x86,0xC2,0x92], [0xE2,0x86,0x92]],
  // ★ (star U+2605 = E2 98 85)
  [[0xC3,0xA2,0xC2,0x98,0xC2,0x85], [0xE2,0x98,0x85]],
  // ✓ (check U+2713 = E2 9C 93)
  [[0xC3,0xA2,0xC2,0x9C,0xC2,0x93], [0xE2,0x9C,0x93]],
  // ✔ (heavy check U+2714 = E2 9C 94)
  [[0xC3,0xA2,0xC2,0x9C,0xC2,0x94], [0xE2,0x9C,0x94]],
  // … (ellipsis U+2026 = E2 80 A6)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0xA6], [0xE2,0x80,0xA6]],
  // " (left double quote U+201C = E2 80 9C)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x9C], [0xE2,0x80,0x9C]],
  // " (right double quote U+201D = E2 80 9D)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x9D], [0xE2,0x80,0x9D]],
  // ' (right single quote U+2019 = E2 80 99)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x99], [0xE2,0x80,0x99]],
  // ' (left single quote U+2018 = E2 80 98)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x98], [0xE2,0x80,0x98]],
  // — (em dash U+2014 = E2 80 94)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x94], [0xE2,0x80,0x94]],
  // – (en dash U+2013 = E2 80 93)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0x93], [0xE2,0x80,0x93]],
  // ☑ (ballot box check U+2611 = E2 98 91)
  [[0xC3,0xA2,0xC2,0x98,0xC2,0x91], [0xE2,0x98,0x91]],
  // ● (bullet U+25CF = E2 97 8F)
  [[0xC3,0xA2,0xC2,0x97,0xC2,0x8F], [0xE2,0x97,0x8F]],
  // ─ (box drawing U+2500 = E2 94 80)
  [[0xC3,0xA2,0xC2,0x94,0xC2,0x80], [0xE2,0x94,0x80]],
  // • (bullet U+2022 = E2 80 A2)
  [[0xC3,0xA2,0xC2,0x80,0xC2,0xA2], [0xE2,0x80,0xA2]],
];

function replaceBytes(buf, find, replace) {
  const result = [];
  let i = 0;
  while (i < buf.length) {
    let matched = false;
    if (i <= buf.length - find.length) {
      matched = find.every((b, j) => buf[i + j] === b);
    }
    if (matched) {
      replace.forEach(b => result.push(b));
      i += find.length;
    } else {
      result.push(buf[i]);
      i++;
    }
  }
  return Buffer.from(result);
}

files.forEach(file => {
  if (!fs.existsSync(file)) { console.log('SKIP:', file); return; }
  let buf = fs.readFileSync(file);
  const before = buf.length;
  FIXES.forEach(([find, replace]) => {
    buf = replaceBytes(buf, find, replace);
  });
  fs.writeFileSync(file, buf);
  const diff = before - buf.length;
  console.log(`FIXED: ${file} (${diff} bytes removed)`);
});

console.log('\nDone. Now run:');
console.log('git add index.html features.html security.html consultants.html comparison.html onboarding.html');
console.log('git commit -m "fix: double-encoded UTF-8 byte-level correction"');
console.log('git push');
