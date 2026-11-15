// frag_plan2.js - authoritative fragment budgets
const fs = require('fs');
const { decode, encode, DEC } = require('./charmap');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const rows = require('./frag_report.json');
const applied = JSON.parse(fs.readFileSync('applied.json', 'utf8'));
const byOff = new Map(applied.map(a => [a.off, a]));
const todo = require('./todo3.json');
const xmap = Object.assign({}, require('./x0.js'), require('./x1.js'), require('./x2.js'), require('./x3.js'),
  require('./x4.js'), require('./x5.js'), require('./x6.js'), require('./x7.js'));
const w = require('./work_final.json');
const tr = {};
for (let i = 1; i <= 9; i++) { const f = `./tr${i}.js`; if (fs.existsSync(f)) Object.assign(tr, f === './tr1.js' ? tr : tr, require(f)); }
const txByOff = new Map();
for (const [k, v] of Object.entries(xmap)) txByOff.set(todo[+k].off, v);
for (const [k, v] of Object.entries(tr)) txByOff.set(w[+k].off, v);
for (const e of require('./extra.js')) txByOff.set(e.off, e.text);
for (const e of require('./extra2.js')) txByOff.set(e.off, e.text);

const out = [];
for (const r of rows) {
  const fd = decode(src, r.off, 20000);
  const flen = fd.len;
  const startJob = byOff.get(r.start);
  const Tstart = startJob ? txByOff.get(r.start) : null;
  const Tf = r.trText;
  const pfx = src[r.start];
  out.push({
    off: r.off, start: r.start, d: r.delta, flen, fbudget: flen - 1,
    startInJobs: !!startJob, pfx, pfxChar: DEC[pfx] ?? null,
    Tstart, Tf,
    startBudget: startJob ? startJob.len - 1 : null,
    startLen: Tstart ? encode(Tstart).bytes.length : null,
    tfLen: encode(Tf).bytes.length
  });
}
fs.writeFileSync('frag_plan2.json', JSON.stringify(out, null, 1));
for (const o of out) {
  console.log(`@${o.off.toString(16)} start ${o.start.toString(16)} d=${o.d} fbud=${o.fbudget} tf=${o.tfLen} fits=${o.tfLen <= o.fbudget} startJob=${o.startInJobs} sbud=${o.startBudget} slen=${o.startLen} pfx=${o.pfx.toString(16)}(${JSON.stringify(o.pfxChar)})`);
}
