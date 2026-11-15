// charmap.js - Gen3 (FireRed) text codec for BlueLegendB
const fs = require('fs');

const DEC = new Array(256).fill(null);
const ENC = new Map();
function set(b, ch) { DEC[b] = ch; if (!ENC.has(ch)) ENC.set(ch, b); }

set(0x00, ' ');
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < 26; i++) set(0xBB + i, A[i]);
for (let i = 0; i < 26; i++) set(0xD5 + i, String.fromCharCode(97 + i));
for (let i = 0; i < 10; i++) set(0xA1 + i, String(i));
set(0x1B, '\u00e9');           // é
set(0xAD, '.'); set(0xAE, '-'); set(0xAB, '!'); set(0xAC, '?');
set(0xB2, ',');  set(0xB8, ',');   // two comma glyphs
set(0xB4, "'");  set(0xB3, "'");
set(0xBA, '/');  set(0xF0, ':');
set(0x35, '=');  set(0x36, ';'); set(0x2D, '&'); set(0x2E, '+');
set(0x5B, '(');  set(0x5D, ')');
set(0xB9, '\u00d7'); // ×
set(0xB7, '\u00a5'); // ¥
// Spanish accented chars present in this ROM (only needed for reading)
set(0x01, '\u00c0'); set(0x02, '\u00c1'); set(0x03, '\u00c2'); set(0x04, '\u00c7');
set(0x05, '\u00c8'); set(0x06, '\u00c9'); set(0x07, '\u00ca'); set(0x08, '\u00cb');
set(0x09, '\u00cc'); set(0x0B, '\u00ce'); set(0x0C, '\u00cf');
set(0x0D, '\u00d2'); set(0x0E, '\u00d3'); set(0x0F, '\u00d4');
set(0x10, '\u0152'); set(0x11, '\u00d9'); set(0x12, '\u00da'); set(0x13, '\u00db');
set(0x14, '\u00d1'); set(0x15, '\u00df');
set(0x16, '\u00e0'); set(0x17, '\u00e1'); set(0x18, '\u00e2'); set(0x19, '\u00e7');
set(0x1A, '\u00e8'); set(0x1C, '\u00ea'); set(0x1D, '\u00eb'); set(0x1E, '\u00ed');
set(0x1F, '\u00ec'); set(0x20, '\u00ee'); set(0x21, '\u00ef');
set(0x22, '\u00f2'); set(0x23, '\u00f3'); set(0x24, '\u00f4'); set(0x25, '\u0153');
set(0x26, '\u00f9'); set(0x27, '\u00fa'); set(0x28, '\u00fb'); set(0x29, '\u00f1');
set(0x2A, '\u00ba'); set(0x2B, '\u00aa');
set(0x51, '\u00bf'); // ¿
set(0x52, '\u00a1'); // ¡
set(0x5A, '\u00cd'); // Í
set(0x6F, '\u00ed'); // í alt
set(0x5C, '\u00ab'); set(0x5E, '\u00bb');

// control bytes -> token strings
const CTRL1 = { 0xFA: '\\p', 0xFB: '\\f', 0xFE: '\\n', 0xFF: '\\0' };

// decode buffer[off..] up to 0xFF, returns {text, len}
function decode(buf, off, maxLen = 2000) {
  let out = '';
  let i = off;
  while (i < buf.length && i - off < maxLen) {
    const b = buf[i];
    if (b === 0xFF) { out += '\\0'; return { text: out, len: i - off + 1 }; }
    if (b === 0xFE) { out += '\\n'; i++; continue; }
    if (b === 0xFB) { out += '\\f'; i++; continue; }
    if (b === 0xFA) { out += '\\p'; i++; continue; }
    if (b === 0xFC) { out += `{FC${hex(buf[i+1])}${hex(buf[i+2])}}`; i += 3; continue; }
    if (b === 0xFD) { out += `{FD${hex(buf[i+1])}}`; i += 2; continue; }
    if (b === 0xF8) { out += `{F8${hex(buf[i+1])}}`; i += 2; continue; }
    if (b === 0xF9) { out += `{F9${hex(buf[i+1])}}`; i += 2; continue; }
    if (b === 0xF7) { out += '{F7}'; i++; continue; }
    if (b === 0xF1 || b === 0xF2 || b === 0xF3 || b === 0xF4 || b === 0xF5 || b === 0xF6) { out += `{${hex(b)}}`; i++; continue; }
    const d = DEC[b];
    if (d === null) return { text: out, len: i - off, ok: false };
    out += d;
    i++;
  }
  return { text: out, len: i - off, ok: false };
}
function hex(n) { return (n | 0).toString(16).toUpperCase().padStart(2, '0'); }

// encode text (with tokens) back to bytes; returns {bytes, unknown:[chars]}
function encode(text) {
  const bytes = [];
  const unknown = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '\\') {
      const n = text[i + 1];
      if (n === 'n') { bytes.push(0xFE); i += 2; continue; }
      if (n === 'f') { bytes.push(0xFB); i += 2; continue; }
      if (n === 'p') { bytes.push(0xFA); i += 2; continue; }
      if (n === '0') { bytes.push(0xFF); i += 2; continue; }
      unknown.push(text.slice(i, i + 2)); i += 2; continue;
    }
    if (text[i] === '{') {
      const j = text.indexOf('}', i);
      if (j < 0) { unknown.push(text[i]); i++; continue; }
      const tok = text.slice(i + 1, j);
      const m = tok.match(/^(FC|FD|F8|F9)([0-9A-F]{2})([0-9A-F]{2})?$/);
      if (m) {
        bytes.push(parseInt(m[1], 16));
        bytes.push(parseInt(m[2], 16));
        if (m[3]) bytes.push(parseInt(m[3], 16));
        i = j + 1; continue;
      }
      const m2 = tok.match(/^([0-9A-F]{2})$/);
      if (m2) { bytes.push(parseInt(m2[1], 16)); i = j + 1; continue; }
      unknown.push(text.slice(i, j + 1)); i = j + 1; continue;
    }
    const ch = text[i];
    const b = ENC.get(ch);
    if (b === undefined) { unknown.push(ch); i++; continue; }
    bytes.push(b); i++;
  }
  return { bytes: Uint8Array.from(bytes), unknown };
}

module.exports = { decode, encode, DEC, ENC };
