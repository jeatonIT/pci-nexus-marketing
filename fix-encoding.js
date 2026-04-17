const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(fname => {
  // Read as binary buffer
  const buf = fs.readFileSync(fname);
  
  // Convert buffer to string preserving raw bytes
  let text = buf.toString('binary');
  
  // These are the UTF-8 byte sequences for common special chars,
  // read as binary (latin1) strings
  const replacements = [
    ['\xc3\xa2\xc2\x80\xc2\x94', '&mdash;'],      // em dash —
    ['\xc3\xa2\xc2\x80\xc2\x93', '&ndash;'],      // en dash –
    ['\xc3\xa2\xc2\x80\xc2\x99', '&rsquo;'],      // right single quote '
    ['\xc3\xa2\xc2\x80\xc2\x9c', '&ldquo;'],      // left double quote "
    ['\xc3\xa2\xc2\x80\xc2\x9d', '&rdquo;'],      // right double quote "
    ['\xc3\xa2\xc2\x80\xc2\x98', '&lsquo;'],      // left single quote '
    ['\xc3\x82\xc2\xb7', '&middot;'],              // middle dot ·
    ['\xc3\xa2\xc2\x86\xc2\x92', '&rarr;'],       // right arrow →
    ['\xc3\xa2\xc2\x86\xc2\x90', '&larr;'],       // left arrow ←
    ['\xc3\x83\xc2\xa9', '&eacute;'],              // é
    ['\xc3\x83\xc2\xb3', '&oacute;'],              // ó
    ['\xc3\xa2\xc2\x9c\xc2\xa6', '&#10022;'],     // star ✦
  ];
  
  replacements.forEach(([from, to]) => {
    while (text.includes(from)) {
      text = text.replace(from, to);
    }
  });
  
  fs.writeFileSync(fname, Buffer.from(text, 'binary'));
  console.log('Fixed:', fname);
});

console.log('Done.');
