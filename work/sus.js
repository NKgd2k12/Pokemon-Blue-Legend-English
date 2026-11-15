const fs = require('fs');
const { decode } = require('./charmap');
const b = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const offs = [0x1a50dd, 0x1a50ef, 0x3d4f28, 0x3d7d78, 0x3dad08, 0x72c8a9, 0x77346e, 0x774c3f];
for (const o of offs) {
  const d = decode(b, o);
  console.log(o.toString(16), d.len, JSON.stringify(d.text));
}
