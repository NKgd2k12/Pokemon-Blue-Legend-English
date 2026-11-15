const fs=require('fs');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const isL=b=>(b>=0xBB&&b<=0xD4)||(b>=0xD5&&b<=0xEE);
const isD=b=>(b>=0xA1&&b<=0xAA);
const pal={0x00:' ',0xAD:'.',0xAB:'!',0xAC:'?',0xB8:',',0xB2:',',0xB4:"'",0x1B:'é'};
function ch(b){if(isL(b))return String.fromCharCode(b<=0xD4?65+b-0xBB:97+b-0xD5); if(isD(b))return String.fromCharCode(48+b-0xA1); if(pal[b])return pal[b]; return '['+b.toString(16)+']';}
const stat={};
for(let i=0x170000;i<0x1E0000;i++){
  const b=buf[i];
  if(b<0xA0&&b!==0x00&&b<0x7F) {} 
  if(isL(buf[i-1])&&isL(buf[i+1])&&!isL(b)&&!isD(b)&&b!==0x00){
    if(!stat[b])stat[b]=[];
    if(stat[b].length<6){
      let ctx='';for(let k=-4;k<=4;k++)ctx+=ch(buf[i+k]);
      stat[b].push(ctx);
    }
  }
}
for(const k of Object.keys(stat).map(Number).sort((a,b)=>a-b)){
  console.log('0x'+k.toString(16), JSON.stringify(stat[k]));
}
