const fs = require('fs');
const { decode } = require('./charmap');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const w = require('./work_final.json');

const startOf = (o) => { let i = o; while (i > 0 && src[i - 1] !== 0xFF) i--; return i; };
const bad = [];
for (let i = 0; i < w.length; i++) {
  const s = startOf(w[i].off);
  if (s !== w[i].off) bad.push([i, s, w[i].off, w[i].len]);
}
console.log('fragment entries:', bad.length, 'of', w.length);
for (const [i, s, o, len] of bad.slice(0, 40)) {
  const d = decode(src, s);
  console.log('idx', i, 'trueStart', s.toString(16), 'ptr', o.toString(16), 'trueLen', d.len, JSON.stringify(d.text.slice(0, 80)));
}
