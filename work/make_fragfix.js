// make_fragfix.js - build fragment alias overrides
const fs = require('fs');
const { encode, decode, DEC } = require('./charmap');
const plan = require('./frag_plan2.json');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');

const B = (s) => encode(s).bytes.length;

const overrides = [];   // {off,text,budget,why}
const removals = [];    // start offsets to drop
const adds = [];        // fragment jobs

const byOff = new Map(plan.map(p => [p.off, p]));

const keepStart = ['1a5a71', '7224ee', '7235ba', '72ab70', '773300']; // mid-word fragments, keep start translation
const compose = { '1c1088': true, '3d4f26': true, '723f00': true, '770976': true };

for (const p of plan) {
  const h = p.off.toString(16);
  if (p.d === 1) {
    const ch = DEC[p.pfx];
    if (ch === null || ch === undefined) { console.log('NO CHAR for', h, p.pfx.toString(16)); continue; }
    const text = ch + p.Tf;
    const budget = (decordLen(p.start));
    overrides.push({ off: p.start, text, budget, why: 'd1 ' + h });
    continue;
  }
  if (compose[h]) continue; // handled below
  if (keepStart.includes(h)) { console.log('keep start, skip frag', h); continue; }
  // fragment job
  adds.push({ off: p.off, text: p.Tf, budget: p.fbudget, why: 'frag ' + h });
  // remove conflicting start job if it would overrun f
  if (p.startLen !== null && p.startLen > p.d - 1) {
    removals.push(p.start);
    console.log('remove start', p.start.toString(16), 'len', p.startLen, '> d-1', p.d - 1);
  }
}
function decordLen(off) { return decode(src, off, 20000).len - 1; }

// compose cases
// 1c1088: start 1c1060 d=40
{
  const p = byOff.get(0x1c1088);
  const P = "What's this machine?\\nDon't stick a " + ' '.repeat(5);
  const Tf = "finger in!\\p";
  if (B(P) !== p.d) throw new Error('1c1088 P len ' + B(P));
  overrides.push({ off: p.start, text: P + Tf, budget: decordLen(p.start), why: 'compose 1c1088' });
}
// 3d4efe: d=40 (40 spaces prefix)
{
  const p = byOff.get(0x3d4f26);
  const P = ' '.repeat(40);
  if (B(P) !== p.d) throw new Error('3d4efe');
  overrides.push({ off: p.start, text: P + p.Tf, budget: decordLen(p.start), why: 'compose 3d4efe' });
}
// 723e14: d=236
{
  const p = byOff.get(0x723f00);
  const key = 'like ';
  const idx = p.Tstart.indexOf(key) + key.length; // prefix ends after "like "
  let P = p.Tstart.slice(0, idx);
  if (B(P) > p.d) throw new Error('723e14 P too long ' + B(P));
  P = P + ' '.repeat(p.d - B(P));
  if (B(P) !== p.d) throw new Error('723e14 pad');
  overrides.push({ off: p.start, text: P + p.Tf, budget: decordLen(p.start), why: 'compose 723e14' });
}
// 770913: d=99
{
  const p = byOff.get(0x770976);
  const key = '\\nThere are three';
  const idx = p.Tstart.indexOf(key);
  let P = p.Tstart.slice(0, idx);
  if (B(P) > p.d) throw new Error('770913 P too long ' + B(P));
  P = P + ' '.repeat(p.d - B(P));
  if (B(P) !== p.d) throw new Error('770913 pad');
  overrides.push({ off: p.start, text: P + p.Tf, budget: decordLen(p.start), why: 'compose 770913' });
}

// validate all
for (const o of overrides.concat(adds)) {
  const { bytes, unknown } = encode(o.text);
  if (unknown.length) console.log('BADCHAR', o.why, unknown);
  if (bytes.length > o.budget) console.log('OVER', o.why, bytes.length, '>', o.budget);
}
fs.writeFileSync('fragfix.json', JSON.stringify({ overrides, removals, adds }, null, 1));
console.log('overrides', overrides.length, 'adds', adds.length, 'removals', removals.length);
for (const o of overrides) console.log('OVR', o.off.toString(16), B(o.text), '<=', o.budget, o.why);
for (const a of adds) console.log('ADD', a.off.toString(16), B(a.text), '<=', a.budget, a.why);
