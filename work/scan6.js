const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const M={' ':[0x00],'é':[0x1B],'.':[0xAE],'-':[0xAD],'!':[0xAB],'?':[0xAC],',':[0xB8],"'":[0xB0],':':[0xF0],'/':[0xBA],'0':[0xA1],'1':[0xA2],'2':[0xA3],'3':[0xA4],'4':[0xA5],'5':[0xA6],'6':[0xA7],'7':[0xA8],'8':[0xA9],'9':[0xAA]};
function enc(s){const o=[];for(const ch of s){const u=ch.toUpperCase();if(M[ch])o.push(...M[ch]);else if(M[u])o.push(...M[u]);else{const i=A.indexOf(u);if(i>=0)o.push(0xBB+i);}}return o;}
function find3(s){const p=enc(s);const res=[];outer:for(let i=0;i+p.length<=buf.length;i++){for(let j=0;j<p.length;j++)if(buf[i+j]!==p[j])continue outer;res.push(i);}return res;}
const tests=['POKéMON','OAK','NUEVA PARTIDA','NUEVO JUEGO','CONTINUAR','OPCION','PULSA START','NOUVELLE PARTIE','NEUES SPIEL','NUOVA PARTITA','BOUTIQUE','TIENDA','CENTRO POKéMON','POKéDEX','POKé BALL','MT. MOON','MONTE LUNA','CIUDAD','PUEBLO','RUTA'];
for(const t of tests){const r=find3(t);console.log(`"${t}" -> ${r.length}`,r.slice(0,6).map(x=>x.toString(16)).join(','));}
