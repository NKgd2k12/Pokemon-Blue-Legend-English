const fs = require('fs');
const all = require('./strings_all.json');
const w = require('./work_final.json');
const covered = (o, n) => w.some(e => e.off <= o && o < e.off + e.len) ||
  w.some(e => o <= e.off && e.off < o + n);
const ES = /( de | del | que | el | los | las | con | para | muy | no | una | un | es | se | su | al | por | pero | ya | tiene | puedes | aqui | esta | este | como | sin | tu | mi | te | le )/i;
const out = [];
for (const s of all) {
  const t = s.str || '';
  if (covered(s.off, s.len)) continue;
  if (t.length < 8) continue;
  const plain = t.replace(/\{[^}]*\}/g, ' ');
  if (/[^\x20-\x7E\n]/.test(plain)) continue; // skip non-ascii (garbage/accents handled elsewhere)
  if (!ES.test(plain)) continue;
  out.push(s);
}
out.sort((a, b) => a.off - b.off);
console.log('candidates', out.length);
for (const s of out) console.log(s.off.toString(16), s.len, JSON.stringify(s.str.slice(0, 95)));
