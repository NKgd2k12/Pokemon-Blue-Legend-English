const fs=require('fs');
const cm=require('./charmap');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
let ok=0,bad=0,unk=0;
const badSamples=[];
for(const s of strings){
  const d=cm.decode(buf,s.off);
  if(!d.text.endsWith('\\0')) continue;
  const e=cm.encode(d.text);
  if(e.unknown.length){ unk++; if(badSamples.length<20) badSamples.push(['UNK',s.off.toString(16),d.text.slice(0,80),e.unknown.slice(0,5).join('')]); continue; }
  const orig=buf.slice(s.off,s.off+e.bytes.length);
  const same=Buffer.compare(Buffer.from(e.bytes),orig)===0;
  if(same) ok++; else { bad++; if(badSamples.length<30) badSamples.push(['DIFF',s.off.toString(16),d.text.slice(0,80),Buffer.from(e.bytes).toString('hex').slice(0,40),orig.toString('hex').slice(0,40)]); }
}
console.log('roundtrip ok',ok,'bad',bad,'unknownchars',unk);
badSamples.forEach(x=>console.log(x.join(' | ')));
