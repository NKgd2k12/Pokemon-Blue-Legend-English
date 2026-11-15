const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ',a='abcdefghijklmnopqrstuvwxyz';
const tbl={};
for(let i=0;i<26;i++){tbl[0xBB+i]=A[i];tbl[0xD5+i]=a[i];}
for(let i=0;i<10;i++)tbl[0xA1+i]=String(i);
Object.assign(tbl,{0x00:' ',0xAD:'-',0xAE:'.',0xB8:',',0xAB:'!',0xAC:'?',0xB0:"'",0xB1:'~',0xB2:'~',0xBA:'/',0xF0:':',0xFE:'|',0xFB:'|',0xFC:'~',
 0x16:'à',0x17:'á',0x18:'â',0x1A:'è',0x1B:'é',0x1C:'ê',0x1E:'ì',0x20:'î',0x22:'ò',0x23:'ó',0x24:'ô',0x26:'ù',0x27:'ú',0x28:'û',0x29:'ñ',0x14:'Ñ',0x40:'¿',0x51:'¿',0x52:'¡',0x6F:'í',0x53:'¡'});
const isT=b=>((b>=0xBB&&b<=0xEE)||(b>=0xA1&&b<=0xAA)||b===0x00||(b>=0xAD&&b<=0xBA)||b===0xFE||b===0xFB||b===0xFC||b===0xF0||b===0x40||b===0x51||b===0x52||b===0x53||b===0x6F||(b>=0x16&&b<=0x29));
const SP=/\b(de|la|el|los|las|que|para|con|muy|está|estás|aquí|tú|no|sí|pero|mi|tu|su|es|son|un|una|del|al|como|más|por|qué|cómo|dónde|cuando|hola|gracias|bien|mal|puedo|quieres|tengo|tiene|hay|esto|eso|este|esta|ese|esa|yo|nosotros|ellos|ella|él|también|siempre|nada|todo)\b/i;
const EN=/\b(the|you|is|and|to|of|a|that|it|your|are|this|with|for|have|me|my|not|but|can|will|was|be|from|they|his|her|their|we|i|s)\b/i;
const out=[];
let run=[],start=0;
function flush(){ if(run.length>=4){ let L=0;for(const b of run) if((b>=0xBB&&b<=0xD4)||(b>=0xD5&&b<=0xEE))L++;
  if(L>=3){ const s=run.map(b=>tbl[b]!==undefined?tbl[b]:' ').join(''); out.push({off:start,len:run.length,s}); } } run=[]; }
for(let i=0;i<buf.length;i++){const b=buf[i]; if(isT(b)){if(!run.length)start=i;run.push(b);} else if(b===0xFF) flush(); else run=[]; }
const neutral=out.filter(o=>{ const hasSp=/[áéíóúñ¿¡]/.test(o.s)||SP.test(o.s); const hasEn=EN.test(o.s); return !(hasSp&&!hasEn) && !(hasEn&&!hasSp); });
console.log('neutral count', neutral.length);
// print by length buckets
const byLen = {};
for(const o of neutral){ const k = o.len<20?'short':o.len<60?'mid':'long'; byLen[k]=(byLen[k]||0)+1; }
console.log(byLen);
const long = neutral.filter(o=>o.len>=40).slice(0,60);
long.forEach(o=>console.log(o.off.toString(16),JSON.stringify(o.s)));
