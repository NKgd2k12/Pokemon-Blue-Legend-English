// validate.js - checks tr*.js against work_final.json
const fs = require('fs');
const { encode } = require('./charmap');
const w = require('./work_final.json');

const tr = {};
for (let i = 1; i <= 9; i++) {
  const f = `./tr${i}.js`;
  if (fs.existsSync(f)) Object.assign(tr, require(f));
}

function toks(s) {
  return s.match(/\{(?:FC|FD|F8|F9)[0-9A-F]{2}(?:[0-9A-F]{2})?\}|\{F7\}|\{[0-9A-F]{2}\}/g) || [];
}

let missing = [], over = [], badTok = [], badEnc = [], ok = 0, skip = 0;
for (let i = 0; i < w.length; i++) {
  const e = w[i];
  if (!(i in tr)) { skip++; continue; }
  const t = tr[i];
  const { bytes, unknown } = encode(t);
  if (unknown.length) { badEnc.push([i, unknown.join(''), JSON.stringify(t)]); continue; }
  if (bytes.length + 1 > e.len) { over.push([i, bytes.length + 1, e.len, JSON.stringify(t)]); continue; }
  const ot = toks(e.text), nt = toks(t);
  let j = 0;
  for (const tk of nt) {
    const k = ot.indexOf(tk, j);
    if (k < 0) { badTok.push([i, 'unexpected/new token ' + tk, JSON.stringify(t)]); break; }
    j = k + 1;
  }
  if (badTok.length && badTok[badTok.length - 1][0] === i) continue;
  ok++;
}
console.log('total', w.length, 'translated-ok', ok, 'skipped(keep)', skip);
console.log('MISSING indices count:', w.length - skip - ok - over.length - badEnc.length - badTok.length);
if (over.length) { console.log('\n== OVER BUDGET =='); over.forEach(r => console.log(r.join('\t'))); }
if (badEnc.length) { console.log('\n== BAD CHARS =='); badEnc.forEach(r => console.log(r.join('\t'))); }
if (badTok.length) { console.log('\n== BAD TOKENS =='); badTok.forEach(r => console.log(r.join('\t'))); }
