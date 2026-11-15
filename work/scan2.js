const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const N = buf.length;
// byte histogram
const hist = new Uint32Array(256);
for (let i = 0; i < N; i++) hist[buf[i]]++;
const top = [...hist.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30);
console.log('size', N.toString(16), N);
console.log('top bytes:', top.map(([b,c])=>`${b.toString(16).padStart(2,'0')}:${(c/N*100).toFixed(2)}%`).join(' '));
// zero-page / fill detection: find 4KB blocks that are all same byte
let same = 0, blocks = 0;
for (let o = 0; o + 4096 <= N; o += 4096) {
  blocks++;
  const b0 = buf[o]; let all = true;
  for (let i = 1; i < 4096; i++) if (buf[o+i] !== b0) { all = false; break; }
  if (all) same++;
}
console.log('4K uniform blocks:', same, '/', blocks);
// last non-zero offset
let last = N-1; while (last>0 && buf[last]===0) last--;
console.log('last nonzero', last.toString(16));
