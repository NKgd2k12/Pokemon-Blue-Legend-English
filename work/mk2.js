const fs = require('fs');
let s = fs.readFileSync('scan_es.js', 'utf8');
s = s.split("readFileSync('BlueLegendB(v1.1)_EN.gba')").join('readFileSync(process.argv[2])');
fs.writeFileSync('scan_es2.js', s);
console.log('ok');
