const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const tbl={};const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ',a='abcdefghijklmnopqrstuvwxyz';
for(let i=0;i<26;i++){tbl[0xBB+i]=A[i];tbl[0xD5+i]=a[i];}
for(let i=0;i<10;i++)tbl[0xA1+i]=String(i);
Object.assign(tbl,{0x00:' ',0xAD:'-',0xAE:'.',0xB8:',',0xAB:'!',0xAC:'?',0xB0:"'",0xB1:'m',0xB2:'f',0xBA:'/',0xF0:':',0xFE:'\n',0xFB:'\n',0xFC:'...'});
const isT=b=>((b>=0xBB&&b<=0xEE)||(b>=0xA1&&b<=0xAA)||[0,0xAD,0xAE,0xB8,0xAB,0xAC,0xB0,0xBA,0xF0,0xFE,0xFB,0xFC].includes(b));
const pages=new Map();
let run=[],start=0;
const flush=()=>{ if(run.length>=6){let L=0;for(const b of run) if((b>=0xBB&&b<=0xD4)||(b>=0xD5&&b<=0xEE))L++;if(L>=4){const p=start>>16; const e=pages.get(p)||{n:0,b:0}; e.n++; e.b+=run.length; pages.set(p,e);}} run=[]; };
for(let i=0;i<buf.length;i++){const b=buf[i];
 if(isT(b)){if(!run.length)start=i;run.push(b);} else if(b===0xFF) flush(); else run=[];
}
const keys=[...pages.keys()].sort((x,y)=>x-y);
for(const k of keys) { const e=pages.get(k); console.log(`page 0x${(k<<16).toString(16).padStart(6,'0')}  count=${String(e.n).padStart(5)}  bytes=${String(e.b).padStart(7)}`); }
