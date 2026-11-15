const fs=require('fs');
const sp=JSON.parse(fs.readFileSync('es2.json'));
const pages={};
for(const o of sp){ const p=o.off>>16; pages[p]=(pages[p]||0)+1; }
console.log(Object.entries(pages).sort((a,b)=>a[0]-b[0]).map(([p,c])=>`${(+p).toString(16)}:${c}`).join(' '));
// text-bank filter
const banks=[[0x170000,0x1E0000],[0x3D0000,0x400000],[0x410000,0x420000],[0x440000,0x4A0000],[0x720000,0x730000],[0x770000,0x780000],[0x240000,0x250000]];
const inBank=o=>banks.some(([a,b])=>o.off>=a&&o.off<b);
const b=sp.filter(inBank), nb=sp.filter(o=>!inBank(o));
console.log('in text banks:',b.length,b.reduce((a,c)=>a+c.len,0),' outside:',nb.length,nb.reduce((a,c)=>a+c.len,0));
fs.writeFileSync('es_bank.json',JSON.stringify(b,null,1));
console.log('\n--- outside-bank spanish (to check) ---');
nb.slice(0,60).forEach(o=>console.log(o.off.toString(16).padStart(6,'0'),String(o.ptrs).padStart(3),JSON.stringify(o.str.slice(0,110))));
