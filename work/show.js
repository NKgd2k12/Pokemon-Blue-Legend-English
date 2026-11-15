const fs=require('fs');
const sp=JSON.parse(fs.readFileSync('es_candidates.json'));
const unk=JSON.parse(fs.readFileSync('neutral2.json'));
console.log('=== NEUTRAL long (>=25) ===');
unk.filter(o=>o.len>=25).slice(0,40).forEach(o=>console.log(o.off.toString(16).padStart(6,'0'), String(o.ptrs).padStart(3), JSON.stringify(o.str.slice(0,100))));
console.log('\n=== SPANISH len>=40 (first 60) ===');
sp.filter(o=>o.len>=40).sort((a,b)=>a.off-b.off).slice(0,60).forEach(o=>console.log(o.off.toString(16).padStart(6,'0'), String(o.ptrs).padStart(3), JSON.stringify(o.str.slice(0,120))));
