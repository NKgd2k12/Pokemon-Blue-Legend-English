const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
function findPtr(v){
  const p=Buffer.from([v&0xFF,(v>>8)&0xFF,(v>>16)&0xFF,0x08]);
  const r=[];let i=-1;while((i=buf.indexOf(p,i+1))>=0)r.push(i);return r;
}
for(const a of process.argv.slice(2)){
  const v=parseInt(a,16);
  const r=findPtr(v);
  console.log('ptr to 0x'+v.toString(16),'->',r.map(x=>'0x'+x.toString(16)).join(' '));
  for(const o of r.slice(0,3)){
    const s=Math.max(0,o-16);
    console.log('   ctx:',Buffer.from(buf.slice(s,o+16)).toString('hex').match(/../g).join(' '));
  }
}
