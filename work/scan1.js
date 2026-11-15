const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');

// Gen3 charmap
const tbl = {};
const lettersA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lettersa = 'abcdefghijklmnopqrstuvwxyz';
for (let i = 0; i < 26; i++) { tbl[0xBB + i] = lettersA[i]; tbl[0xD5 + i] = lettersa[i]; }
for (let i = 0; i < 10; i++) tbl[0xA1 + i] = String(i);
tbl[0x00] = ' ';
tbl[0xAD] = '-';
tbl[0xAE] = '.';
tbl[0xB8] = ',';
tbl[0xAB] = '!';
tbl[0xAC] = '?';
tbl[0xB0] = "'";
tbl[0xB1] = 'm';
tbl[0xB2] = 'f';
tbl[0xBA] = '/';
tbl[0xF0] = ':';
tbl[0xF1] = '\u00C4';
tbl[0xF2] = '\u00D6';
tbl[0xF3] = '\u00DC';
tbl[0xF4] = '\u00E4';
tbl[0xF5] = '\u00F6';
tbl[0xF6] = '\u00FC';

// find runs of plausible text bytes ending in 0xFF
const out = [];
let run = [];
let start = 0;
function flush(endIdx) {
  if (run.length >= 6) {
    // must contain at least 4 letters
    let letters = 0;
    for (const b of run) if ((b >= 0xBB && b <= 0xD4) || (b >= 0xD5 && b <= 0xEE)) letters++;
    if (letters >= 4) {
      const s = run.map(b => tbl[b] !== undefined ? tbl[b] : '\u00B7').join('');
      out.push({ off: start, len: run.length, s });
    }
  }
  run = [];
}

const isTextByte = b => {
  if (b >= 0xBB && b <= 0xEE) return true;
  if (b >= 0xA1 && b <= 0xAA) return true;
  if (b === 0x00 || b === 0xAD || b === 0xAE || b === 0xB8 || b === 0xAB || b === 0xAC || b === 0xB0 || b === 0xBA) return true;
  if (b === 0xF0) return true;
  if (b === 0xFE) return true;
  return false;
};

for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  if (isTextByte(b)) {
    if (run.length === 0) start = i;
    run.push(b);
  } else if (b === 0xFF) {
    flush(i);
  } else {
    run = [];
  }
}

console.log('candidates:', out.length);
out.slice(0, 80).forEach(o => console.log(o.off.toString(16).toUpperCase().padStart(8, '0'), o.len, JSON.stringify(o.s)));
const totalText = out.reduce((a, b) => a + b.len, 0);
console.log('total text bytes:', totalText);
