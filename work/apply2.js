// apply2.js - build English ROM from maximal-string translations only
const fs = require('fs');
const { encode, decode } = require('./charmap');

const SRC = 'E:/BlueLegendB(v1.1).gba';
const OUT = 'BlueLegendB(v1.1)_EN.gba';
const src = fs.readFileSync(SRC);
const rom = Buffer.from(src);

// ---- collect candidate jobs ----
const jobs = [];
const seen = new Map();
function addJob(off, text, key, prio) {
  if (seen.has(off)) {
    const prev = seen.get(off);
    if (prev.text === text) return;
    // prefer extra > x > tr
    if (prev.prio >= prio) return;
    console.log('CONFLICT', off.toString(16), prev.key, '->', key, JSON.stringify(prev.text.slice(0, 40)), '|', JSON.stringify(text.slice(0, 40)));
    const i = jobs.indexOf(prev);
    jobs.splice(i, 1);
  }
  const j = { off, text, key, prio };
  seen.set(off, j);
  jobs.push(j);
}

// x translations (todo3 based)
const todo = require('./todo3.json');
const xmap = Object.assign({}, require('./x0.js'), require('./x1.js'), require('./x2.js'),
  require('./x3.js'), require('./x4.js'), require('./x5.js'), require('./x6.js'), require('./x7.js'));
for (const [k, v] of Object.entries(xmap)) addJob(todo[+k].off, v, 'x' + k, 2);

// tr translations (old pointer worklist)
const w = require('./work_final.json');
for (let i = 1; i <= 9; i++) {
  const f = `./tr${i}.js`;
  if (!fs.existsSync(f)) continue;
  for (const [k, v] of Object.entries(require(f))) {
    if (!w[+k]) continue;
    addJob(w[+k].off, v, 'tr' + k, 1);
  }
}

// hand-found extras (already English)
for (const e of require('./extra.js')) addJob(e.off, e.text, 'ex' + e.off.toString(16), 3);
for (const e of require('./extra2.js')) addJob(e.off, e.text, 'ex2' + e.off.toString(16), 3);

// ---- filter fragments: offset must be a maximal string start ----
const isStart = (off) => off === 0 || rom[off - 1] === 0xFF;

let patched = 0, changed = 0, skipped = [];
const applied = [];
for (const j of jobs) {
  if (!isStart(j.off)) { skipped.push(j); continue; }
  const d = decode(rom, j.off);
  if (!d.text.endsWith('\\0')) { skipped.push(j); continue; }
  const len = d.len;                    // full original string incl. terminator
  const budget = len - 1;
  const { bytes, unknown } = encode(j.text);
  if (unknown.length) { console.log('BADCHAR', j.key, JSON.stringify(unknown)); skipped.push(j); continue; }
  if (bytes.length > budget) { console.log('OVERFLOW', j.key, bytes.length, '>', budget); skipped.push(j); continue; }
  for (let k = 0; k < bytes.length; k++) if (rom[j.off + k] !== bytes[k]) changed++;
  rom.set(bytes, j.off);
  rom[j.off + bytes.length] = 0xFF;
  // wipe the rest of the old string so no stale text remains readable
  for (let k = j.off + bytes.length + 1; k < j.off + len; k++) { if (rom[k] !== 0xFF) { rom[k] = 0xFF; changed++; } }
  patched++;
  applied.push({ ...j, len });
}
console.log('candidates', jobs.length, 'patched', patched, 'skipped(fragment/bad)', skipped.length, 'bytesChanged', changed);
fs.writeFileSync(OUT, rom);
console.log('wrote', OUT, rom.length, 'header', rom.slice(0xA0, 0xAC).toString('latin1'));

// ---- verify ----
let bad = 0;
for (const j of applied) {
  const { bytes } = encode(j.text);
  let ok = rom[j.off + bytes.length] === 0xFF;
  for (let k = 0; k < bytes.length && ok; k++) if (rom[j.off + k] !== bytes[k]) ok = false;
  if (!ok) { bad++; console.log('VERIFY FAIL', j.key, j.off.toString(16)); }
}
// no overlapping writes
applied.sort((a, b) => a.off - b.off);
let ov = 0;
for (let i = 1; i < applied.length; i++) if (applied[i].off < applied[i - 1].off + applied[i - 1].len) { ov++; console.log('OVERLAP', applied[i - 1].key, applied[i].key); }
console.log('verify fails', bad, 'overlaps', ov);
fs.writeFileSync('applied.json', JSON.stringify(applied.map(a => ({ off: a.off, len: a.len, key: a.key })), null, 0));
