const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
function enc(s){const o=[];for(const ch of s){if(ch===' '){o.push(0);continue;} const u=ch.toUpperCase(); if(u>='A'&&u<='Z'){o.push(0xBB+u.charCodeAt(0)-65);continue;} if(ch>='a'&&ch<='z'){o.push(0xD5+ch.charCodeAt(0)-97);continue;} if(ch>='0'&&ch<='9'){o.push(0xA1+ +ch);continue;} if(ch==='\u00e9'){o.push(0x1B);continue;}} return o;}
function find(pat){const p=enc(pat);const res=[];outer:for(let i=0;i+p.length<=buf.length;i++){for(let j=0;j<p.length;j++)if(buf[i+j]!==p[j])continue outer;res.push(i);}return res;}
const q=process.argv.slice(2);
for(const s of q){
  const r=find(s);
  console.log(`"${s}" x${r.length}`);
  const seen=new Set();
  for(const o of r){
    const nb=[];
    for(let k=0;k<4;k++) nb.push(buf[o+enc(s).length+k].toString(16).padStart(2,'0'));
    const key=nb.join(' ');
    if(seen.has(key))continue; seen.add(key);
    const back=[]; for(let k=1;k<=4;k++) back.push(buf[o-k].toString(16).padStart(2,'0'));
    console.log('   ',back.join(' '),'|',nb.join(' '));
    if(seen.size>6)break;
  }
}
