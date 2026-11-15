const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
for (const a of process.argv.slice(2)) {
  const o=parseInt(a,16);
  const b=buf.slice(o,o+120);
  console.log('@'+o.toString(16).toUpperCase());
  console.log('  hex:', [...b].map(x=>x.toString(16).padStart(2,'0')).join(' '));
  console.log('  asc:', [...b].map(x=>(x>=32&&x<127)?String.fromCharCode(x):'.').join(''));
}
