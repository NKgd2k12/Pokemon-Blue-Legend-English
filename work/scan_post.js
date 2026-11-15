const fs = require('fs');
const { decode } = require('./charmap');
const all = require('./strings_all.json');
const rom = fs.readFileSync('BlueLegendB(v1.1)_EN.gba');

const ES = /( de | del | que | el | los | las | con | para | muy | no | una | un | es | se | su | al | por | pero | ya | tiene | puedes | aqui | esta | este | como | sin | tu | mi | te | le | quiero | llevo | donde )/i;
const ACC = /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00bf\u00a1\u00c0-\u00d4\u00d9-\u00dc]/;

const seen = new Set();
const left = [];
for (const s of all) {
  if (seen.has(s.off)) continue;
  seen.add(s.off);
  const d = decode(rom, s.off);
  const t = d.text.replace(/\\0$/, '');
  const plain = t.replace(/\{[^}]*\}/g, ' ');
  if (plain.length < 6) continue;
  if (ACC.test(plain) || ES.test(plain)) left.push([s.off, t]);
}
left.sort((a, b) => a[0] - b[0]);
console.log('referenced strings still Spanish-ish:', left.length);
for (const [o, t] of left.slice(0, 120)) console.log(o.toString(16), JSON.stringify(t.slice(0, 90)));

// raw accented-byte scan in text banks
const ACCB = new Set([0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0B,0x0C,0x0D,0x0E,0x0F,0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,0x1E,0x1F,0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x51,0x52,0x5A,0x6F]);
const hits = [];
for (let i = 0; i < 0x800000; i++) {
  if (!ACCB.has(rom[i])) continue;
  let j = i - 1, n = 0;
  while (j >= 0 && rom[j] !== 0xFF && rom[j] !== 0xFE && n < 40) { j--; n++; }
  const d = decode(rom, j);
  if (d.len > 6 && d.len < 120) hits.push([j, d.text]);
  i = j + d.len;
}
console.log('\nraw accented hits', hits.length);
const uniq = new Set();
for (const [o, t] of hits) { const k = t.slice(0, 30); if (uniq.has(k)) continue; uniq.add(k); console.log(o.toString(16), JSON.stringify(t.slice(0, 80))); }
