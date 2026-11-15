// validate_x.js - validate x0..x7 translations against todo3.json
const fs = require('fs');
const path = require('path');
const { encode } = require('./charmap');

const todo = JSON.parse(fs.readFileSync(path.join(__dirname, 'todo3.json'), 'utf8'));
const files = ['x0.js', 'x1.js', 'x2.js', 'x3.js', 'x4.js', 'x5.js', 'x6.js', 'x7.js'];

const TOK = /\\[nfp0]|\{(?:FC[0-9A-F]{4}|FD[0-9A-F]{2}|F8[0-9A-F]{2}|F9[0-9A-F]{2}|F7|[0-9A-F]{2})\}/g;
function toks(s) { return s.match(TOK) || []; }

let map = {};
for (const f of files) {
  const p = path.join(__dirname, f);
  if (!fs.existsSync(p)) continue;
  Object.assign(map, require(p));
}

const errors = [];
const warnings = [];
let done = 0;
for (const [k, tr] of Object.entries(map)) {
  const idx = Number(k);
  const e = todo[idx];
  if (!e) { errors.push(`[${idx}] no todo3 entry`); continue; }
  const budget = e.len - 1;
  const { bytes, unknown } = encode(tr);
  if (unknown.length) errors.push(`[${idx}] BAD CHARS ${JSON.stringify(unknown)}`);
  if (bytes.length > budget) errors.push(`[${idx}] OVER budget ${bytes.length}>${budget}  (${JSON.stringify(tr.slice(0,60))})`);
  // token subsequence check
  const ot = toks(e.text);
  const tt = toks(tr);
  let j = 0;
  for (const t of tt) {
    while (j < ot.length && ot[j] !== t) j++;
    if (j >= ot.length) { errors.push(`[${idx}] NEW TOKEN ${t} (not in original order)`); break; }
    j++;
  }
  done++;
}

const missing = [];
for (let i = 0; i < todo.length; i++) if (!(i in map)) missing.push(i);

console.log(`validated ${done} translations`);
console.log(`errors: ${errors.length}`);
for (const e of errors) console.log('  ' + e);
console.log(`not translated: ${missing.length}`);
console.log(missing.join(','));
