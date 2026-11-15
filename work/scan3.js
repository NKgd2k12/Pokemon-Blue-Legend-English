const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const MB = 0x100000;
for (let m = 0; m < buf.length / MB; m++) {
  let nz = 0, ff = 0, z = 0;
  const s = m * MB;
  for (let i = s; i < s + MB; i++) { const b = buf[i]; if (b !== 0) nz++; if (b === 0xFF) ff++; if (b === 0) z++; }
  console.log(`block ${m.toString().padStart(2)} 0x${s.toString(16).padStart(6,'0')}  nonzero=${(nz/MB*100).toFixed(1)}%  ff=${(ff/MB*100).toFixed(1)}%  zero=${(z/MB*100).toFixed(1)}%`);
}
