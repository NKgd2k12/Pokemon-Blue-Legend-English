const fs = require('fs');
const { decode } = require('./charmap');
const rom = fs.readFileSync('BlueLegendB(v1.1)_EN.gba');

const ACC = new Set([0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0B,0x0C,0x0D,0x0E,0x0F,0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,0x1E,0x1F,0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x51,0x52,0x5A,0x6F]);
const banks = [[0x170000, 0x1D0000], [0x3D0000, 0x4B0000], [0x720000, 0x780000]];
const found = [];
for (const [s, e] of banks) {
  let i = s;
  while (i < e) {
    if (!ACC.has(rom[i])) { i++; continue; }
    // walk back to a plausible string start
    let j = i;
    while (j > s && rom[j - 1] !== 0xFF && i - j < 60) j--;
    const d = decode(rom, j);
    if (d.ok && d.len > 12 && d.len < 200) {
      const t = d.text;
      const plain = t.replace(/\{[^}]*\}/g, ' ');
      const nAcc = (plain.match(/[\u00c0-\u00dc\u00e0-\u00ff\u00bf\u00a1]/g) || []).length;
      const ratio = nAcc / Math.max(1, plain.length);
      if (nAcc >= 2 && ratio > 0.02) found.push([j, t]);
      i = j + d.len;
      continue;
    }
    i++;
  }
}
console.log('candidates with accents:', found.length);
for (const [o, t] of found.slice(0, 80)) console.log(o.toString(16), JSON.stringify(t.slice(0, 90)));
