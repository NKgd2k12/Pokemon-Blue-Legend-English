const fs=require('fs');
const cm=require('./charmap');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
const fin=new Set(JSON.parse(fs.readFileSync('work_final.json')).map(o=>o.off));
const banks=[[0x170000,0x1E0000],[0x3D0000,0x400000],[0x410000,0x420000],[0x440000,0x4A0000],[0x720000,0x730000],[0x770000,0x780000]];
const inBank=o=>banks.some(([a,b])=>o>=a&&o<b);
const W=`de los las que pero para con muy está están aquí también cuando desde hasta donde todo todos nada algo porque aunque mientras entonces ahora después antes siempre nunca gracias hola adiós señor ciudad pueblo ruta cueva bosque montaña nivel dinero tienda centro casa equipo jefe líder liga isla playa barco objeto objetos cosa cosas tiempo día noche año semana hora parte lugar forma manera tipo tipos fuerza ataque defensa velocidad movimiento entrenador entrenadores pokémon batalla medalla región villa campeón mundo mujer hombre chico chica niño niña madre padre amigo amiga hermano hermana`.split(/\s+/);
const set=new Set(W);
const rows=[];
for(const s of strings){
  if(!inBank(s.off)||fin.has(s.off)) continue;
  const d=cm.decode(buf,s.off);
  if(!d.text.endsWith('\\0')) continue;
  const body=d.text.slice(0,-2);
  if(body.length<6) continue;
  const w=body.toLowerCase().replace(/[^a-zà-ÿñü' ]/g,' ').split(/\s+/).filter(Boolean);
  const hits=w.filter(x=>set.has(x));
  if(hits.length>=1 && hits.length>=w.filter(x=>x.length>1).length*0.15) rows.push({off:s.off,len:s.len,body,hits:hits.join(',')});
}
rows.sort((a,b)=>a.off-b.off);
console.log('suspect excluded:',rows.length);
fs.writeFileSync('suspect.txt',rows.map(o=>`@${o.off.toString(16)} [${o.len-1}] (${o.hits}) ${o.body.replace(/\n/g,'\\n')}`).join('\n'));
rows.slice(0,50).forEach(o=>console.log(o.off.toString(16),o.len-1,JSON.stringify(o.body.slice(0,100))));
