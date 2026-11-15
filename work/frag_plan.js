// frag_plan.js - build plan for fragment aliases
const fs = require('fs');
const { decode, encode } = require('./charmap');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const rows = require('./frag_report.json');
const applied = JSON.parse(fs.readFileSync('applied.json', 'utf8'));
const byOff = new Map(applied.map(a => [a.off, a]));
const todo = require('./todo3.json');
const xmap = Object.assign({}, require('./x0.js'), require('./x1.js'), require('./x2.js'), require('./x3.js'),
  require('./x4.js'), require('./x5.js'), require('./x6.js'), require('./x7.js'));
const w = require('./work_final.json');
const tr = {};
for (let i = 1; i <= 9; i++) { const f = `./tr${i}.js`; if (fs.existsSync(f)) Object.assign(tr, require(f)); }

// translation text by offset
const txByOff = new Map();
for (const [k, v] of Object.entries(xmap)) txByOff.set(todo[+k].off, v);
for (const [k, v] of Object.entries(tr)) txByOff.set(w[+k].off, v);
for (const e of require('./extra.js')) txByOff.set(e.off, e.text);
for (const e of require('./extra2.js')) txByOff.set(e.off, e.text);

const out = [];
for (const r of rows) {
  const startJob = byOff.get(r.start);
  const Tstart = startJob ? txByOff.get(r.start) : null;
  const Tf = r.trText;
  let ends = false;
  if (Tstart) ends = Tstart.replace(/\s+$/, '').endsWith(Tf.replace(/\s+$/, ''));
  out.push({
    off: r.off, start: r.start, d: r.delta, room: r.endGap,
    startInJobs: !!startJob, d1: r.delta === 1,
    prefixByte: src[r.start],
    Tstart, Tf, endsWithTf: ends,
    startLen: Tstart ? encode(Tstart).bytes.length : null,
    tfLen: encode(Tf).bytes.length
  });
}
fs.writeFileSync('frag_plan.json', JSON.stringify(out, null, 1));
for (const o of out) {
  console.log(`@${o.off.toString(16)} d=${o.d} room=${o.room} startJob=${o.startInJobs} pfx=${o.prefixByte.toString(16)} ends=${o.endsWithTf} startLen=${o.startLen} tf=${o.tfLen}`);
}
