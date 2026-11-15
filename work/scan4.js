const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');

const tbl = {};
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ', a='abcdefghijklmnopqrstuvwxyz';
for (let i=0;i<26;i++){tbl[0xBB+i]=A[i];tbl[0xD5+i]=a[i];}
for (let i=0;i<10;i++) tbl[0xA1+i]=String(i);
tbl[0x00]=' ';tbl[0xAD]='-';tbl[0xAE]='.';tbl[0xB8]=',';tbl[0xAB]='!';tbl[0xAC]='?';tbl[0xB0]="'";tbl[0xB1]='m';tbl[0xB2]='f';tbl[0xBA]='/';tbl[0xF0]=':';tbl[0xFE]='\n';tbl[0xFC]='...';tbl[0xFB]='\n\n';
const txt = b => tbl[b] !== undefined ? tbl[b] : '\u00B7';

// encode ascii -> gen3 bytes
function enc(s){ const o=[]; for(const ch of s.toUpperCase()){ if(ch===' '){o.push(0);continue;} const i=A.indexOf(ch); if(i>=0){o.push(0xBB+i);} } return o; }

function find(raw){ // raw ascii search
  const pat = Buffer.from(raw, 'latin1');
  const res=[]; let i=-1;
  while((i=buf.indexOf(pat,i+1))>=0) res.push(i);
  return res;
}
for (const s of ['BLUE','LEGEND','ENGLISH','ESPANOL','SPANISH','FRANCAIS','ITALIANO','DEUTSCH','LANGUAGE','GAME FREAK','NINTENDO','POKEMON','VIET','CHINESE','JAPANESE']) {
  const r = find(s);
  console.log(`ascii "${s}": ${r.length}`, r.slice(0,8).map(x=>x.toString(16)).join(','));
}
// gen3-encoded search
function find3(raw){ const p=enc(raw); const res=[]; outer: for(let i=0;i+1<p.length;i++){ for(let j=0;j<p.length;j++) if(buf[i+j]!==p[j]) continue outer; res.push(i);} return res; }
for (const s of ['BLUE LEGEND','LEGEND','ENGLISH','LANGUAGE','POKEMON','GAME FREAK','PRESS START','NEW GAME']) {
  const r=find3(s); console.log(`gen3 "${s}": ${r.length}`, r.slice(0,8).map(x=>x.toString(16)).join(','));
}
