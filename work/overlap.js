const fs=require('fs');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
strings.sort((a,b)=>a.off-b.off);
let overlaps=0;
const ex=[];
for(let i=0;i<strings.length;i++){
  const a=strings[i];
  for(let j=i+1;j<strings.length;j++){
    if(strings[j].off >= a.off+a.len) break;
    overlaps++;
    if(ex.length<15) ex.push([a.off.toString(16),a.len,JSON.stringify(a.str.slice(0,60)),strings[j].off.toString(16),JSON.stringify(strings[j].str.slice(0,60))]);
  }
}
console.log('overlapping pairs',overlaps);
ex.forEach(x=>console.log(x.join('  ||  ')));
