const fs = require('fs');
const buf = fs.readFileSync('E:/BlueLegendB(v1.1).gba');

// ---- Gen3 charmap (standard) ----
const MAP = new Array(256).fill(null);
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ', a='abcdefghijklmnopqrstuvwxyz';
for (let i=0;i<26;i++){ MAP[0xBB+i]=A[i]; MAP[0xD5+i]=a[i]; }
for (let i=0;i<10;i++) MAP[0xA1+i]=String(i);
const extra = {
 0x00:' ',0x01:'À',0x02:'Á',0x03:'Â',0x04:'Ç',0x05:'È',0x06:'É',0x07:'Ê',0x08:'Ë',0x09:'Ì',0x0B:'Î',0x0C:'Ï',
 0x0D:'Ò',0x0E:'Ó',0x0F:'Ô',0x10:'Œ',0x11:'Ù',0x12:'Ú',0x13:'Û',0x14:'Ñ',0x15:'ß',
 0x16:'à',0x17:'á',0x18:'â',0x19:'ç',0x1A:'è',0x1B:'é',0x1C:'ê',0x1D:'ë',0x1E:'ì',0x20:'î',0x21:'ï',
 0x22:'ò',0x23:'ó',0x24:'ô',0x25:'œ',0x26:'ù',0x27:'ú',0x28:'û',0x29:'ñ',0x2A:'º',0x2B:'ª',0x2C:'e',
 0x2D:'&',0x2E:'+',0x34:'\u00D7',0x35:'=',0x36:';',0x3A:'…',0x3F:'?',0x40:'¿',0x42:'…',
 0xAB:'!',0xAC:'?',0xAD:'-',0xAE:'.',0xAF:'…',0xB0:"'",0xB1:'"',0xB2:'"',0xB4:'$',0xB5:'×',0xB6:'.',0xB7:'/',
 0xB8:',',0xB9:'♀',0xBA:'/',0xBB:'A',
 0xEF:'\u2640',0xF0:':',0xF1:'Ä',0xF2:'Ö',0xF3:'Ü',0xF4:'ä',0xF5:'ö',0xF6:'ü',
 0x5B:'[',0x5C:'\\',0x5D:']',0x5E:'^',0x5F:'_',
 0x60:'`',0x61:'{',0x62:'|',0x63:'}',0x64:'~',
 0x65:'\\x65',0x66:'\\x66',0x67:'\\x67',0x68:'\\x68',0x69:'\\x69',0x6A:'\\x6A',0x6B:'\\x6B',0x6C:'\\x6C',
 0x6D:'\\x6D',0x6E:'\\x6E',0x6F:'\\x6F',0x70:'\\x70',0x71:'\\x71',0x72:'\\x72',0x73:'\\x73',
 0x74:'\\x74',0x75:'\\x75',0x76:'\\x76',0x77:'\\x77',0x78:'\\x78',0x79:'\\x79',0x7A:'\\x7A',0x7B:'\\x7B',
 0x7C:'\\x7C',0x7D:'\\x7D',0x7E:'\\x7E',0x7F:'\\x7F',
};
for (const k in extra) MAP[k|0] = extra[k];
// special controls
MAP[0xFF]='\uFFFF';
MAP[0xFE]='\n';
MAP[0xFB]='\f';
MAP[0xFC]='\\xFC';
MAP[0xFD]='\\xFD';
MAP[0xFA]='\\xFA';
MAP[0xF7]='\\xF7'; MAP[0xF8]='\\xF8'; MAP[0xF9]='\\xF9';

const isTextish = b => (b>=0xBB && b<=0xEE) || (b>=0xA1 && b<=0xAA) || b===0x00 || b===0xAD || b===0xAE || b===0xB8
  || b===0xAB || b===0xAC || b===0xB0 || b===0xBA || b===0xF0 || b===0xFE || b===0xFB || b===0xFC || b===0xFD
  || b===0xFA || b===0x40 || b===0x3F || b===0x2D || b===0x2E || b===0x35 || b===0x36 || b===0x3A || b===0x34
  || b===0xB1||b===0xB2||b===0xB4||b===0xB5||b===0xB6||b===0xB7||b===0xB9
  || (b>=0x01 && b<=0x2C) || b===0x5B||b===0x5C||b===0x5D||b===0x5E||b===0x5F;

function readString(off, maxLen=600) {
  let s=[], i=off, letters=0;
  while (i < buf.length && i-off < maxLen) {
    const b = buf[i];
    if (b === 0xFF) return { str: s.join(''), len: i-off+1, letters, ok: true };
    if (b === 0x00) { s.push(' '); i++; continue; }
    const m = MAP[b];
    if (m === null || m === undefined) return { ok:false };
    s.push(m);
    if ((b>=0xBB&&b<=0xD4)||(b>=0xD5&&b<=0xEE)||(b>=0xA1&&b<=0xAA)) letters++;
    i++;
  }
  return { ok:false };
}

// ---- collect all pointers ----
const targets = new Map();
for (let i=0;i+4<=buf.length;i++){
  if (buf[i+3]!==0x08) continue;
  const v = buf[i] | (buf[i+1]<<8) | (buf[i+2]<<16);
  if (v < 0x1000) continue;
  if (!targets.has(v)) targets.set(v, []);
  targets.get(v).push(i);
}
console.log('distinct pointer targets:', targets.size);

const strings = [];
for (const [off, ptrs] of targets) {
  const r = readString(off);
  if (r.ok && r.letters >= 2 && r.len >= 3) {
    strings.push({ off, len: r.len, str: r.str, ptrs });
  }
}
console.log('valid referenced strings:', strings.length);
fs.writeFileSync('strings_all.json', JSON.stringify(strings, null, 0));
const bytes = strings.reduce((a,b)=>a+b.len,0);
console.log('total bytes:', bytes);
// region stats
const byPage = new Map();
for (const s of strings) {
  const p = s.off >> 16;
  byPage.set(p, (byPage.get(p)||0)+1);
}
console.log([...byPage.entries()].sort((x,y)=>x[0]-y[0]).map(([p,c])=>`${p.toString(16)}:${c}`).join(' '));
