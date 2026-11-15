const fs = require('fs');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const patched = fs.readFileSync('BlueLegendB(v1.1)_EN.gba');
function dump(b, from, to) {
  const out = [];
  for (let i = from; i < to; i++) out.push(b[i].toString(16).padStart(2, '0'));
  return out.join(' ');
}
console.log('SRC 172530-1725a0:', dump(src, 0x172530, 0x1725a0));
console.log('NEW 172530-1725a0:', dump(patched, 0x172530, 0x1725a0));
