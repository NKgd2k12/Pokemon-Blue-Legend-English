const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const pages={}; const total={};
for(let i=0;i+4<=buf.length;i++){
  if(buf[i+3]!==0x08) continue;
  const v=buf[i]|(buf[i+1]<<8)|(buf[i+2]<<16);
  const tgtPage=v>>16, srcPage=i>>16;
  if(v>=0x170000&&v<0x1E0000){ pages[srcPage]=(pages[srcPage]||0)+1; }
}
console.log('pointer sources pointing into text bank 0x17-0x1D, by source page:');
for(const p of Object.keys(pages).map(Number).sort((a,b)=>a-b)) console.log('  src 0x'+(p<<16).toString(16), pages[p]);
// also: pointer sources pointing anywhere in rom
