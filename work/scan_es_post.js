// scan_es_post.js - report remaining Spanish maximal strings in a ROM
const fs = require('fs');
const { decode } = require('./charmap');
const file = process.argv[2] || 'BlueLegendB(v1.1)_EN.gba';
const src = fs.readFileSync(file);

const ES = new Set(['de','del','la','las','los','el','que','con','para','muy','una','un','es','son','se','su','sus','al','por','pero','ya','tiene','tienes','puedes','aqui','esta','este','estos','como','mas','sin','hay','eres','voy','vas','quiero','solo','todo','todos','nada','cuando','donde','porque','tambien','mi','tu','te','le','les','nos','me','ser','estar','tengo','fue','han','ha','he','si','lo','otra','otro','mucho','mucha','bien','mal']);
const EN = new Set(['the','you','your','is','are','to','and','of','that','it','in','for','with','my','i','a','on','was','but','not','have','this','what','do','so','if','he','she','they','we','can','will','be','at','as','by','or','from','them','their','there','here','just','all','his','her','him','me','no','up','out','about','would','could','should','get','got','let','lets']);

const accFold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function escore(t) {
  let s = t.toLowerCase().replace(/\\[nfp0]/g, ' ').replace(/\{[^}]*\}/g, ' ');
  s = accFold(s).replace(/[^a-z ]+/g, ' ');
  const ws = s.split(/\s+/).filter(Boolean);
  let es = 0, en = 0;
  for (const x of ws) { if (ES.has(x)) es++; if (EN.has(x)) en++; }
  const acc = (t.match(/[\u00e1\u00ed\u00f3\u00fa\u00f1\u00bf\u00a1\u00c0-\u00dc]/g) || []).length;
  return { es, en, acc, n: ws.length };
}
function isSpanish(t) {
  const { es, en, acc, n } = escore(t);
  if (n < 2) return false;
  if (/[\u00bf\u00a1]/.test(t) && es >= 1) return true;
  if (es >= 2 && es > en) return true;
  if (es >= 1 && en === 0 && acc >= 2) return true;
  if (acc >= 4 && en === 0) return true;
  return false;
}

const banks = [[0x170000, 0x1D0000], [0x3D0000, 0x4B0000], [0x720000, 0x780000]];
const left = [];
for (const [s, e] of banks) {
  let i = s;
  while (i < e) {
    if (i !== s && src[i - 1] !== 0xFF) { i++; continue; }
    if (src[i] === 0xFF) { i++; continue; }
    const d = decode(src, i);
    if (d.text.endsWith('\\0') && d.len >= 6 && d.len <= 900) {
      const t = d.text.slice(0, -2);
      if (isSpanish(t)) left.push({ off: i, len: d.len, text: t });
      i += d.len;
      continue;
    }
    i++;
  }
}
console.log(file, 'remaining spanish strings:', left.length);
fs.writeFileSync('remain_post.json', JSON.stringify(left, null, 1));
fs.writeFileSync('remain_post.txt', left.map((c, i) => `[${i}] @${c.off.toString(16)} (${c.len - 1}) ${c.text}`).join('\n'));
for (const c of left.slice(0, 40)) console.log('@' + c.off.toString(16), c.len - 1, JSON.stringify(c.text.slice(0, 80)));
