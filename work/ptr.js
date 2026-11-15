const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
// build set of all 32-bit pointers 0x08xxxxxx in ROM
const ptrs = new Map();
for (let i=0;i+4<=buf.length;i+=1){
  if (buf[i+3]!==0x08) continue;
  const v = (buf[i] | (buf[i+1]<<8) | (buf[i+2]<<16));
  if (v>=0x100 && v<0x1000000) {
    if(!ptrs.has(v)) ptrs.set(v,[]);
    ptrs.get(v).push(i);
  }
}
console.log('total pointers', [...ptrs.values()].reduce((a,b)=>a+b.length,0), 'distinct', ptrs.size);
function refsNear(off){
  const res=[];
  for(let d=-8;d<=8;d++){ const p=ptrs.get(off+d); if(p) res.push([off+d,p]); }
  return res;
}
for (const t of process.argv.slice(2).map(x=>parseInt(x,16))) {
  const r=refsNear(t);
  console.log(t.toString(16).padStart(6,'0'), r.map(([o,ps])=>`${o.toString(16)}:${ps.length}@${ps.slice(0,3).map(x=>x.toString(16)).join('/')}`).join('  ')||'-');
}
