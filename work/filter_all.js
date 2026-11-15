// filter_all.js - filter whole-ROM spanish candidates to plausible prose
const fs = require('fs');
const all = JSON.parse(fs.readFileSync('remain_all.json', 'utf8'));
const out = [];
for (const c of all) {
  const t = c.text;
  const bare = t.replace(/\\[nfp0]/g, ' ').replace(/\{[^}]*\}/g, ' ');
  const letters = (bare.match(/[A-Za-z\u00c0-\u00ff]/g) || []).length;
  const spaces = (bare.match(/ /g) || []).length;
  const words = bare.split(/\s+/).filter(w => /[A-Za-z\u00c0-\u00ff]{2,}/.test(w));
  const ratio = letters / Math.max(1, bare.length);
  const es = (t.toLowerCase().match(/\b(de|del|la|las|los|el|que|con|para|muy|una|un|es|son|se|su|sus|al|por|pero|ya|tiene|tienes|puedes|aqui|esta|este|estos|como|mas|sin|hay|eres|voy|vas|quiero|solo|todo|todos|nada|cuando|donde|porque|tambien|mi|tu|te|le|les|nos|me|ser|estar|tengo|fue|han|ha|he|si|lo|otra|otro|mucho|mucha|bien|mal)\b/g) || []).length;
  if (words.length >= 4 && ratio >= 0.55 && spaces >= 3 && es >= 2) out.push({ ...c, score: words.length, ratio, es });
}
out.sort((a, b) => b.len - a.len);
console.log('plausible prose candidates:', out.length);
fs.writeFileSync('remain_prose.json', JSON.stringify(out, null, 1));
fs.writeFileSync('remain_prose.txt', out.map((c, i) => `[${i}] @${c.off.toString(16)} (${c.len - 1}) ${c.text}`).join('\n\n'));
for (const c of out) console.log('@' + c.off.toString(16), c.len - 1, 'ratio', c.ratio.toFixed(2), 'es', c.es, JSON.stringify(c.text.slice(0, 80)));
