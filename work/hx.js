const fs = require('fs');
const b = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const o = 0x770d58;
const s = [];
for (let i = o - 8; i < o + 72; i++) s.push(b[i].toString(16).padStart(2, '0'));
console.log(s.join(' '));
