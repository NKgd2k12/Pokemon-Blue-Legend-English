// frag_report.js - analyze skipped fragment-pointer writes
const fs = require('fs');
const { decode, encode } = require('./charmap');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const w = require('./work_final.json');
const tr = {};
for (let i = 1; i <= 9; i++) { const f = `./tr${i}.js`; if (fs.existsSync(f)) Object.assign(tr, require(f)); }

function stringAt(off) { // maximal start
  let s = off;
  while (s > 0 && src[s - 1] !== 0xFF) s--;
  const d = decode(src, s, 20000);
  return { start: s, len: d.len, text: d.text.slice(0, -2) };
}

const rows = [];
for (const k of Object.keys(tr)) {
  const e = w[+k]; if (!e) continue;
  if (src[e.off - 1] === 0xFF) continue; // not a fragment
  const st = stringAt(e.off);
  const fragText = decode(src, e.off, 2000).text.replace(/\\0$/, '');
  const bytes = encode(tr[k]).bytes.length;
  const fullBytes = encode(st.text).bytes.length; // dummy (untranslated) - not useful
  rows.push({ key: k, off: e.off, start: st.start, delta: e.off - st.start, endGap: st.start + st.len - e.off, fragText, trText: tr[k], bytes, source: st.text });
}
rows.sort((a, b) => a.off - b.off);
console.log('fragments:', rows.length);
fs.writeFileSync('frag_report.json', JSON.stringify(rows, null, 1));
for (const r of rows) console.log(`@${r.off.toString(16)} start ${r.start.toString(16)} d=${r.delta} room=${r.endGap} trBytes=${r.bytes} ${JSON.stringify(r.fragText.slice(0, 40))} => ${JSON.stringify(r.trText.slice(0, 40))}`);
