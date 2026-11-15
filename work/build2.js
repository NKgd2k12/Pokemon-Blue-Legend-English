const fs = require('fs');
const { decode } = require('./charmap');
const src = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const all = require('./strings_all.json');
const w = require('./work_final.json');

const ES = new Set(['de','del','la','las','los','el','que','con','para','muy','una','un','una','es','son','se','su','sus','al','por','pero','ya','tiene','tienes','puedes','aqui','esta','este','estos','como','mas','sin','hay','eres','voy','vas','quiero','solo','todo','todos','nada','cuando','donde','porque','tambien','mi','tu','te','le','les','nos','me','ser','estar','tengo','fue','han','ha','he','si','lo','otra','otro','mucho','mucha','bien','mal','nos','les']);
const EN = new Set(['the','you','your','is','are','to','and','of','that','it','in','for','with','my','i','a','on','was','but','not','have','this','what','do','so','if','he','she','they','we','can','will','be','at','as','by','or','from','them','their','there','here','just','all','his','her','him','me','my','no','up','out','about','would','could','should','get','got','let','lets']);

const norm = (t) => {
  let s = t.toLowerCase();
  s = s.replace(/\\[nfp0]/g, ' ');
  s = s.replace(/\{[^}]*\}/g, ' ');
  s = s.replace(/[^a-z\u00c0-\u00ff ]+/g, ' ');
  return s;
};
const words = (t) => norm(t).split(/\s+/).filter(Boolean);
function escore(t) {
  const ws = words(t);
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
  return false;
}

const startOf = (o) => { let i = o; while (i > 0 && src[i - 1] !== 0xFF) i--; return i; };

const map = new Map();
const add = (o, why) => {
  const s = startOf(o);
  if (!map.has(s)) {
    const d = decode(src, s);
    if (!d.text.endsWith('\\0')) return;
    map.set(s, { off: s, len: d.len, text: d.text.slice(0, -2), why: new Set(), ptrs: new Set() });
  }
  const g = map.get(s);
  g.why.add(why);
  g.ptrs.add(o);
};
// strings referenced by pointers
for (const s of all) add(s.off, 'ptr');
// worklist offsets (to repair fragments)
for (const e of w) add(e.off, 'work');

const groups = [...map.values()].sort((a, b) => a.off - b.off);
const have = new Map();
for (let i = 1; i <= 9; i++) { const f = `./tr${i}.js`; if (fs.existsSync(f)) for (const [k, v] of Object.entries(require(f))) have.set(w[+k].off, v); }
for (const e of require('./extra.js')) have.set(e.off, e.text);

const todo = [];
for (const g of groups) {
  const t = g.text;
  const tr = have.get(g.off);
  if (tr && g.why.has('work')) { g.state = 'done'; continue; }
  if (isSpanish(t)) { g.state = 'todo'; todo.push(g); continue; }
  g.state = 'skip';
}
fs.writeFileSync('groups.json', JSON.stringify(groups.map(g => ({ off: g.off, len: g.len, text: g.text, state: g.state, why: [...g.why] })), null, 1));
fs.writeFileSync('todo2.json', JSON.stringify(todo.map(g => ({ off: g.off, len: g.len, text: g.text })), null, 1));
console.log('groups', groups.length, 'todo', todo.length, 'done', groups.filter(g => g.state === 'done').length, 'skip', groups.filter(g => g.state === 'skip').length);
const lines = todo.map((c, i) => `[${i}] @${c.off.toString(16)} (${c.len - 1}) ${c.text}`);
fs.writeFileSync('todo2.txt', lines.join('\n'));
for (let k = 0; k * 40 < lines.length; k++) fs.writeFileSync(`t2_${String(k).padStart(3, '0')}.txt`, lines.slice(k * 40, k * 40 + 40).join('\n'));
