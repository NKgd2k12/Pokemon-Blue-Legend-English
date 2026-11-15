const fs = require('fs');
const { decode } = require('./charmap');
const b = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const offs = [0x18901b, 0x1c36da, 0x1a5a4e, 0x1a50dd, 0x1a50ef, 0x3d6778, 0x3fcc5b, 0x72a97d, 0x72b490, 0x72c3e4, 0x770d58, 0x77346e];
const out = [];
for (const o of offs) {
  const d = decode(b, o);
  out.push({ off: o, len: d.len, text: d.text.replace(/\\0$/, '') });
}
fs.writeFileSync('extra_raw.json', JSON.stringify(out, null, 1));
for (const o of out) console.log(o.off.toString(16), o.len, JSON.stringify(o.text));
