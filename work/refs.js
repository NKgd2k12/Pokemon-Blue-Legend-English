const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
function refs(off){
  const p = Buffer.alloc(4);
  p[0] = off & 0xFF; p[1]=(off>>8)&0xFF; p[2]=(off>>16)&0xFF; p[3]=0x08;
  const res=[]; let i=-1;
  while((i=buf.indexOf(p,i+1))>=0) res.push(i);
  return res;
}
const tests = process.argv.slice(2).map(x=>parseInt(x,16));
for (const t of tests) {
  const r = refs(t);
  console.log(t.toString(16).padStart(6,'0'), 'refs=', r.length, r.slice(0,10).map(x=>x.toString(16)).join(','));
}
