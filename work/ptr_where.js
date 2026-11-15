// ptr_where.js - locate pointer occurrences for given targets
const fs = require('fs');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const targets = process.argv.slice(2).map(s => parseInt(s, 16));
for (const t of targets) {
  const v = t + 0x08000000;
  const hits = [];
  for (let i = 0; i + 4 <= src.length; i++) {
    if (src[i] === (v & 0xFF) && src[i + 1] === ((v >> 8) & 0xFF) && src[i + 2] === ((v >> 16) & 0xFF) && src[i + 3] === ((v >> 24) & 0xFF)) hits.push(i);
  }
  console.log('target', t.toString(16), 'hits', hits.map(h => h.toString(16)).join(','));
  for (const h of hits.slice(0, 6)) {
    const around = [...src.slice(h - 8, h + 12)].map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log('   @' + h.toString(16), around);
  }
}
