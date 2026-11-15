const fs = require('fs');
const { encode, decode } = require('./charmap');
const w = require('./work_final.json');
const extras = require('./extra.js');

const SRC = 'E:/BlueLegendB(v1.1).gba';
const OUT = 'BlueLegendB(v1.1)_EN.gba';
const src = fs.readFileSync(SRC);
const rom = Buffer.from(src);

const tr = {};
for (let i = 1; i <= 9; i++) {
  const f = `./tr${i}.js`;
  if (fs.existsSync(f)) Object.assign(tr, require(f));
}

const jobs = [];
for (let i = 0; i < w.length; i++) {
  if (!(i in tr)) continue;
  jobs.push({ off: w[i].off, len: w[i].len, text: tr[i], key: 'idx' + i });
}
for (const e of extras) jobs.push({ off: e.off, len: e.len, text: e.text, key: 'x' + e.off.toString(16) });

// overlap check
jobs.sort((a, b) => a.off - b.off);
let overlaps = 0;
for (let i = 1; i < jobs.length; i++) {
  const a = jobs[i - 1], b = jobs[i];
  if (b.off < a.off + a.len) { console.log('OVERLAP', a.key, a.off.toString(16), a.len, b.key, b.off.toString(16)); overlaps++; }
}
console.log('jobs', jobs.length, 'overlaps', overlaps);

let changed = 0, patched = 0;
for (const j of jobs) {
  const { bytes, unknown } = encode(j.text);
  if (unknown.length) { console.log('SKIP badchar', j.key, unknown.join('')); continue; }
  if (bytes.length + 1 > j.len) { console.log('SKIP overflow', j.key); continue; }
  for (let k = 0; k < bytes.length; k++) if (rom[j.off + k] !== bytes[k]) changed++;
  rom.set(bytes, j.off);
  rom[j.off + bytes.length] = 0xFF;
  patched++;
}
console.log('patched', patched, 'bytesChanged', changed);
fs.writeFileSync(OUT, rom);
console.log('wrote', OUT, rom.length, 'header', rom.slice(0xA0, 0xAC).toString('latin1'), 'srcSize', src.length);

// verify round-trip (byte-exact, since some glyphs like 0xB1 aren't in the charmap)
let bad = 0;
for (const j of jobs) {
  const { bytes } = encode(j.text);
  let ok = true;
  for (let k = 0; k < bytes.length; k++) if (rom[j.off + k] !== bytes[k]) ok = false;
  if (rom[j.off + bytes.length] !== 0xFF) ok = false;
  if (!ok) { bad++; if (bad < 15) console.log('MISMATCH', j.key); }
}
console.log('verify mismatches', bad);
