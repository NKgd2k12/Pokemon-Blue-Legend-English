const fs=require('fs');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
const banks=[[0x170000,0x1E0000],[0x3D0000,0x400000],[0x410000,0x420000],[0x440000,0x4A0000],[0x720000,0x730000],[0x770000,0x780000]];
const inBank=o=>banks.some(([a,b])=>o>=a&&o<b);
const s=strings.filter(x=>inBank(x.off)&&/[A-Za-z]/.test(x.str)&&x.str.length>=6).sort((a,b)=>a.off-b.off);
let ov=0; const ex=[];
for(let i=0;i<s.length;i++){
  const a=s[i];
  for(let j=i+1;j<s.length && s[j].off<a.off+a.len;j++){
    ov++;
    if(ex.length<20) ex.push([a.off.toString(16),a.len,JSON.stringify(a.str.slice(0,70)),s[j].off.toString(16),JSON.stringify(s[j].str.slice(0,70))]);
  }
}
console.log('bank strings',s.length,'overlaps',ov);
ex.forEach(x=>console.log(x.join('  ||  ')));
