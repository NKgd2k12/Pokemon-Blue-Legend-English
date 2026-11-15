const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const chr=b=>{
  if(b===0x00) return ' ';
  if(b>=0xBB&&b<=0xD4) return String.fromCharCode(65+b-0xBB);
  if(b>=0xD5&&b<=0xEE) return String.fromCharCode(97+b-0xD5);
  if(b>=0xA1&&b<=0xAA) return String.fromCharCode(48+b-0xA1);
  return '['+b.toString(16).padStart(2,'0')+']';
};
// scan whole ROM for printable runs and print contexts of target bytes
const targets = process.argv.slice(2).map(x=>parseInt(x,16));
const counts={}; for(const t of targets) counts[t]=[];
for(let i=0;i<buf.length;i++){
  const b=buf[i];
  if(!targets.includes(b)) continue;
  // context
  let left='', right='';
  for(let k=1;k<=6&&i-k>=0;k++) left = chr(buf[i-k])+left;
  for(let k=1;k<=8&&i+k<buf.length;k++) right += chr(buf[i+k]);
  counts[b].push(left+' <'+b.toString(16)+'> '+right);
}
for(const t of targets){
  const arr=counts[t];
  console.log('=== byte 0x'+t.toString(16)+' count='+arr.length);
  const seen=new Set();
  for(const c of arr){ if(seen.has(c)) continue; seen.add(c); console.log('   '+c); if(seen.size>=8) break; }
}
