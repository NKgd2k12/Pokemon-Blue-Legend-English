// ptr_counts.js - count pointer references to fragment starts and their maximal starts
const fs = require('fs');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const rows = require('./frag_report.json');
const wanted = new Map();
for (const r of rows) {
  wanted.set(r.off + 0x08000000, (wanted.get(r.off + 0x08000000) || 0) + 1);
  wanted.set(r.start + 0x08000000, (wanted.get(r.start + 0x08000000) || 0) + 1);
}
const counts = new Map();
for (let i = 0; i + 4 <= src.length; i++) {
  const v = (src[i] | (src[i + 1] << 8) | (src[i + 2] << 16) | (src[i + 3] << 24)) >>> 0;
  if (wanted.has(v)) counts.set(v, (counts.get(v) || 0) + 1);
}
for (const r of rows) {
  const cs = counts.get(r.start + 0x08000000) || 0;
  const cf = counts.get(r.off + 0x08000000) || 0;
  console.log(`@${r.off.toString(16)} start ${r.start.toString(16)} d=${r.delta} refs(start)=${cs} refs(frag)=${cf}`);
}
