const fs=require('fs');
const cm=require('./charmap');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
const wl=JSON.parse(fs.readFileSync('work_es.json')).map(o=>o.off);
const set=new Set(wl);
const banks=[[0x170000,0x1E0000],[0x3D0000,0x400000],[0x410000,0x420000],[0x440000,0x4A0000],[0x720000,0x730000],[0x770000,0x780000]];
const inBank=o=>banks.some(([a,b])=>o>=a&&o<b);
const miss=[];
for(const s of strings){
  if(!inBank(s.off)||set.has(s.off)) continue;
  const d=cm.decode(buf,s.off);
  if(!d.text.endsWith('\\0')) continue;
  const body=d.text.slice(0,-2);
  if(/[áíóúñ¿¡ÁÍÓÚÑ]/.test(body)) miss.push({off:s.off,len:s.len,text:body});
}
miss.sort((a,b)=>a.off-b.off);
console.log('missed with accents:',miss.length);
fs.writeFileSync('missed_accents.txt',miss.map((o,i)=>`@${o.off.toString(16)} [${o.len-1}] ${o.text.replace(/\n/g,'\\n')}`).join('\n'));
miss.slice(0,60).forEach(o=>console.log(o.off.toString(16),o.len-1,JSON.stringify(o.text.slice(0,110))));
