const fs = require('fs');
const strings = JSON.parse(fs.readFileSync('strings_all.json'));
const SPWORDS = `de la el los las un una unos unas que qué y o pero sino si no sí es son era fue ser está están estoy estás estaba estuve hay ha han he has muy más menos para por con sin sobre entre cuando como cómo dónde donde quien quién quienes todo toda todos todas nada algo alguien nadie otro otra mismo misma aquí ahí allí ahora después antes siempre nunca también tampoco porque aunque mientras entonces bueno bien mal mejor peor mucho mucha muchos muchas poco poca pocos pocas tú tu tus yo mi mis él ella ellos ellas nosotros vosotros usted ustedes sus nuestro le les lo al del este esta estos estas ese esa esos esas aquel aquella tengo tiene tienes tenemos tienen puedo puede puedes podemos pueden quiero quiere quieres queremos quieren voy va vas vamos van hacer hace haces decir dice dices saber sé sabe sabes dar tomar toma llevar llegar salir venir viene esperar espera ayudar ayuda buscar busca encontrar encuentra ganar perder luchar batalla entrenador entrenadores pokémon gracias hola adiós perdón favor señor señora chico chica niño niña hombre mujer mundo ciudad pueblo ruta cueva bosque montaña agua fuego hierba nivel vida dinero tienda centro casa equipo jefe líder medalla liga isla mar playa barco tren coche puerta llave objeto objetos cosa cosas tiempo día noche año semana hora minuto parte lugar forma manera tipo tipos fuerza ataque defensa velocidad movimiento movimientos pokébola pokébolas poción medicina veneno hielo dragón fantasma acero siniestro hada normal planta eléctrico roca tierra bicho volador psíquico oscuro otra vez dime vamos mira venga esto eso aquello te me nos os se mío tuyo cuál cual cuándo cuánto cuántos demasiado bastante casi ya aún todavía quizá quizás sólo también tienes quiero puedes`.split(/\s+/);
const SP = new Set(SPWORDS);
const ENWORDS = new Set(`the a an and or but if you your my me we us they them their his her he she it is are was were be been being have has had do does did not no yes this that these those there here what which who where when how why all any some more most very can will would should could may might must just from with for to of in on at by about up down out over under again then than so as i its don't can't won't let's i'm you're we're they're he's she's that's what's there's here's isn't wasn't aren't weren't okay ok sure sir ma'am mom dad yeah hey oh wow well now get got go going come came make made know think see look want need like time day way thing things people man woman boy girl right left good bad great little big long small new old own same too also only even still back after before well really just very much many`
  .split(/\s+/));
function words(s){ return s.toLowerCase().replace(/[^a-zà-ÿñü' ]+/g,' ').split(/\s+/).filter(Boolean); }
function detect(str){
  const t = str.replace(/POKéMON|POKé|pokémon/gi,'PKMN');
  const w = words(t);
  let sp=0,en=0;
  for (const x of w) { if (SP.has(x)) sp++; if (ENWORDS.has(x)) en++; }
  if (/[áíóúñ¿¡ÁÍÓÚÑ]/.test(t)) sp += 2;
  if (/[éÉ]/.test(t.replace(/POKéMON|POKé/gi,''))) sp += 1;
  return {sp,en,n:w.length};
}
const out=[];
for (const s of strings) {
  const t = s.str;
  if (t.length < 4) continue;
  if (!/[A-Za-z0-9]/.test(t)) continue;
  // quality: count weird escapes \xNN
  const esc = (t.match(/\\x[0-9A-F]{2}/g)||[]).length;
  const letters = (t.match(/[A-Za-zÀ-ÿ]/g)||[]).length;
  if (letters / t.length < 0.5) continue;
  if (esc > t.length/8) continue;
  const d = detect(t);
  out.push({off:s.off, len:s.len, str:t, sp:d.sp, en:d.en, n:d.n, ptrs:s.ptrs.length});
}
const sp = out.filter(o=>o.sp>0 && o.sp>o.en);
const en = out.filter(o=>o.en>=o.sp && o.en>0);
const unk = out.filter(o=>o.sp===0 && o.en===0);
console.log('total',out.length,'spanish',sp.length,sp.reduce((a,b)=>a+b.len,0),'english',en.length,'neutral',unk.length,unk.reduce((a,b)=>a+b.len,0));
fs.writeFileSync('es2.json', JSON.stringify(sp,null,1));
fs.writeFileSync('unk2.json', JSON.stringify(unk,null,1));
console.log('\n--- spanish samples (len 30-200) ---');
sp.filter(o=>o.len>=30&&o.len<=200).slice(0,40).forEach(o=>console.log(o.off.toString(16).padStart(6,'0'),String(o.ptrs).padStart(3),JSON.stringify(o.str.slice(0,140))));
console.log('\n--- neutral samples len>=30 ---');
unk.filter(o=>o.len>=30).slice(0,40).forEach(o=>console.log(o.off.toString(16).padStart(6,'0'),String(o.ptrs).padStart(3),JSON.stringify(o.str.slice(0,140))));
