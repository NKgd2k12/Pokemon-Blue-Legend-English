const fs=require('fs');
const cm=require('./charmap');
const buf=fs.readFileSync('E:/BlueLegendB(v1.1).gba');
const strings=JSON.parse(fs.readFileSync('strings_all.json'));
const banks=[[0x170000,0x1E0000],[0x3D0000,0x400000],[0x410000,0x420000],[0x440000,0x4A0000],[0x720000,0x730000],[0x770000,0x780000]];
const inBank=o=>banks.some(([a,b])=>o>=a&&o<b);
const SPWORDS=`de la el los las un una unos unas que qué y o pero sino si no sí es son era fue ser está están estoy estás estaba estuve hay ha han he has muy más menos para por con sin sobre entre cuando como cómo dónde donde quien quién quienes todo toda todos todas nada algo alguien nadie otro otra mismo misma aquí ahí allí ahora después antes siempre nunca también tampoco porque aunque mientras entonces bueno bien mal mejor peor mucho mucha muchos muchas poco poca pocos pocas tú tu tus yo mi mis él ella ellos ellas nosotros vosotros usted ustedes sus nuestro le les lo al del este esta estos estas ese esa esos esas aquel aquella tengo tiene tienes tenemos tienen puedo puede puedes podemos pueden quiero quiere quieres queremos quieren voy va vas vamos van hacer hace haces decir dice dices saber sé sabe sabes dar tomar toma llevar llegar salir venir viene esperar espera ayudar ayuda buscar busca encontrar encuentra ganar perder luchar batalla entrenador entrenadores pokémon gracias hola adiós perdón favor señor señora chico chica niño niña hombre mujer mundo ciudad pueblo ruta cueva bosque montaña agua fuego hierba nivel vida dinero tienda centro casa equipo jefe líder medalla liga isla mar playa barco tren coche puerta llave objeto objetos cosa cosas tiempo día noche año semana hora minuto parte lugar forma manera tipo tipos fuerza ataque defensa velocidad movimiento movimientos pokébola pokébolas poción medicina veneno hielo dragón fantasma acero siniestro hada normal planta eléctrico roca tierra bicho volador psíquico oscuro dime vamos mira venga esto eso te me nos os mío tuyo cuál cual cuándo cuánto cuántos demasiado bastante casi ya aún todavía quizá quizás sólo tienes quieres puedes eres somos mira oye espera`.split(/\s+/);
const SP=new Set(SPWORDS);
const EN=new Set(`the a an and or but if you your my me we us they them their his her he she it is are was were be been being have has had do does did not no yes this that these those there here what which who where when how why all any some more most very can will would should could may might must just from with for to of in on at by about up down out over under again then than so as its don't can't won't let's i'm you're we're they're that's here's isn't wasn't aren't okay ok sure sir mom dad yeah hey oh wow well now get got go going come came make made know think see look want need like time day way thing things people man woman boy girl right left good bad great little big long small new old own same too also only even still back after before really much many something always never nothing everything way`.split(/\s+/));
function isSp(t){
  const s=t.replace(/POKéMON|POKé|pokémon/gi,' ');
  const w=s.toLowerCase().replace(/[^a-zà-ÿñü' ]/g,' ').split(/\s+/).filter(Boolean);
  let a=0,b=0; for(const x of w){ if(SP.has(x))a++; if(EN.has(x))b++; }
  if(/[áíóúñ¿¡ÁÍÓÚÑ]/.test(s)) a+=3;
  return a>0 && a>b;
}
const cand=[];
for(const s of strings){
  if(!inBank(s.off)) continue;
  if(s.len<4) continue;
  const d=cm.decode(buf,s.off);
  if(!d.text.endsWith('\\0')) continue;
  const body=d.text.slice(0,-2);
  const letters=(body.match(/[A-Za-zÀ-ÿ]/g)||[]).length;
  if(letters<4) continue;
  if(letters/body.replace(/\{[0-9A-F]+\}/g,'').length<0.45) continue;
  if(!isSp(body)) continue;
  cand.push({off:s.off, len:s.len, text:body});
}
// sort and drop contained
cand.sort((a,b)=>a.off-b.off);
const final=[];
for(const c of cand){
  const prev=final[final.length-1];
  if(prev && c.off > prev.off && c.off < prev.off+prev.len) { prev.merged=(prev.merged||0)+1; continue; }
  final.push(c);
}
// dedupe identical text at different offsets? keep both (each has own pointer)
console.log('candidates',cand.length,'final',final.length,'bytes',final.reduce((a,b)=>a+b.len,0));
fs.writeFileSync('work_final.json',JSON.stringify(final,null,1));
const CH=40;
for(let i=0;i<final.length;i+=CH){
  const chunk=final.slice(i,i+CH).map((o,k)=>`[${i+k}] @${o.off.toString(16)} (${o.len-1}) ${o.text.replace(/\n/g,'\\n')}`);
  fs.writeFileSync(`chunk_${String(i/CH).padStart(3,'0')}.txt`,chunk.join('\n'));
}
console.log('chunks', Math.ceil(final.length/CH));
