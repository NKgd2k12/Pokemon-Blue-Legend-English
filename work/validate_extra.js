const { encode } = require('./charmap');
const extras = require('./extra.js');
let bad = 0;
for (const e of extras) {
  const { bytes, unknown } = encode(e.text);
  const okLen = bytes.length + 1 <= e.len;
  const okChar = unknown.length === 0;
  if (!okLen || !okChar) bad++;
  console.log(e.off.toString(16), 'bytes', bytes.length + 1, 'budget', e.len, okLen ? 'OK' : 'OVER',
    okChar ? '' : 'BADCHAR ' + unknown.join(''), okLen && okChar ? '' : JSON.stringify(e.text));
}
console.log('bad', bad);
