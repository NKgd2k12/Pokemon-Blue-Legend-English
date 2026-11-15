const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const M={0x00:' ',0xAD:'.',0xAE:'-',0xAB:'!',0xAC:'?',0xB2:',',0xB4:"'",0xBA:'/',0x1B:'é',0xF0:':',0x51:'¿',0x52:'¡',
0x17:'á',0x1E:'í',0x23:'ó',0x29:'ñ',0x16:'à',0x1A:'è',0x18:'â',0x1C:'ê',0x20:'î',0x22:'ò',0x24:'ô',0x27:'ú',0x26:'ù',0x28:'û',0x14:'Ñ',0x15:'ß',0x0E:'Ó',0x06:'É',0x02:'Á',0x12:'Ú',0x05:'È'};
for(let i=0;i<10;i++)M[0xA1+i]=String(i);
const dec=b=>{ if(b>=0xBB&&b<=0xD4)return String.fromCharCode(65+b-0xBB); if(b>=0xD5&&b<=0xEE)return String.fromCharCode(97+b-0xD5); if(M[b]!==undefined)return M[b]; return null; };
const stat={};
for(let i=0x170000;i<0x1E0000;i++){
  const b=buf[i];
  if(b<0x40||b===0xAD||b===0xAE) continue;
  if(dec(b)!==null) continue;
  // check inside a printable run
  let ok=true, l=0, r=0;
  for(let k=1;k<=12;k++){ if(dec(buf[i-k])===null && buf[i-k]!==0xFE && buf[i-k]!==0xFB && buf[i-k]!==0xFA){ok=false;break;} }
  if(!ok) continue;
  for(let k=1;k<=12;k++){ if(dec(buf[i+k])===null && buf[i+k]!==0xFE && buf[i+k]!==0xFB && buf[i+k]!==0xFA && buf[i+k]!==0xFF){ok=false;break;} }
  if(!ok) continue;
  let ctx='';
  for(let k=-6;k<=6;k++){ const c=buf[i+k]; const d=dec(c); ctx += (d!==null?d:(c===0xFE?'\\n':c===0xFB?'\\f':c===0xFA?'\\FA':c===0xFF?'\\FF':'['+c.toString(16).padStart(2,'0')+']')); }
  if(!stat[b])stat[b]=[];
  if(stat[b].length<5)stat[b].push(ctx);
}
for(const k of Object.keys(stat).map(Number).sort((a,b)=>a-b)){
  console.log('0x'+k.toString(16).padStart(2,'0'), JSON.stringify(stat[k]));
}
