const fs=require('fs');
const cm=require('./charmap');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
function norm(b){ const a=[...b]; for(let i=0;i<a.length;i++) if(a[i]===0xB8) a[i]=0xB2; return Buffer.from(a); }
let ok=0,bad=0;
const badSamples=[];
for(const s of strings){
  const d=cm.decode(buf,s.off);
  if(!d.text.endsWith('\\0')) continue;
  const e=cm.encode(d.text);
  const orig=norm(buf.slice(s.off,s.off+e.bytes.length));
  const mine=norm(Buffer.from(e.bytes));
  if(Buffer.compare(mine,orig)===0) ok++; else { bad++; if(badSamples.length<25) badSamples.push([s.off.toString(16),d.text.slice(0,70),mine.toString('hex').slice(0,60),orig.toString('hex').slice(0,60)]); }
}
console.log('normalized ok',ok,'bad',bad);
badSamples.forEach(x=>console.log(x.join(' | ')));
