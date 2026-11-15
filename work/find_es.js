const fs = require('fs');
const { decode } = require('./charmap');
const rom = fs.readFileSync('BlueLegendB(v1.1)_EN.gba');

const STOP = ['de', 'del', 'la', 'las', 'los', 'el', 'que', 'con', 'para', 'muy', 'una', 'un', 'es', 'son', 'se', 'su', 'sus', 'al', 'por', 'pero', 'ya', 'tiene', 'tienes', 'puedes', 'aqui', 'esta', 'este', 'estos', 'como', 'mas', 'sin', 'hay', 'eres', 'voy', 'vas', 'quiero', 'solo', 'todo', 'todos', 'nada', 'cuando', 'donde', 'porque', 'tambien', 'mi', 'tu', 'te', 'le', 'les', 'nos', 'me', 'si', 'no', 'he', 'ha', 'han', 'ser', 'estar', 'tengo'];
const ACC = /[\u00e1\u00ed\u00f3\u00fa\u00f1\u00bf\u00a1\u00c0-\u00dc\u00d9-\u00dc]/;

function score(t) {
  const plain = t.replace(/\{[^}]*\}/g, ' ').replace(/\\[nfp0]/g, ' ');
  const words = plain.toLowerCase().match(/[a-z\u00c0-\u00ff]+/g) || [];
  let s = 0;
  for (const w of words) if (STOP.includes(w)) s++;
  const acc = (plain.match(ACC) || []).length;
  return { s, acc, words: words.length };
}

const banks = [[0x170000, 0x1D0000], [0x3D0000, 0x4B0000], [0x720000, 0x780000]];
const cands = [];
const done = new Set();
for (const [s, e] of banks) {
  for (let i = s; i < e; i++) {
    if (i !== s && rom[i - 1] !== 0xFF) continue;
    if (rom[i] === 0xFF) continue;
    const d = decode(rom, i);
    if (!d.text.endsWith('\\0')) continue;
    if (d.len < 8 || d.len > 900) continue;
    const t = d.text.slice(0, -2);
    const { s: sc, acc } = score(t);
    const strong = acc > 0 && /[\u00e1\u00ed\u00f3\u00fa\u00f1\u00bf\u00a1]/.test(t);
    if (sc >= 2 || (strong && sc >= 1)) {
      const key = t.slice(0, 24);
      if (done.has(key)) continue;
      done.add(key);
      cands.push({ off: i, len: d.len, text: t });
    }
    i += d.len - 1;
  }
}
cands.sort((a, b) => a.off - b.off);
fs.writeFileSync('remain.json', JSON.stringify(cands, null, 1));
console.log('remaining candidates', cands.length, 'bytes', cands.reduce((a, b) => a + b.len, 0));
const lines = cands.map((c, i) => `[${i}] @${c.off.toString(16)} (${c.len - 1}) ${c.text.replace(/\\n/g, '\\n')}`);
for (let k = 0; k < lines.length; k += 40) {
  fs.writeFileSync(`rem_${String(k / 40).padStart(3, '0')}.txt`, lines.slice(k, k + 40).join('\n'));
}
fs.writeFileSync('remain.txt', lines.join('\n'));
console.log('wrote remain.txt + rem_XXX.txt');
