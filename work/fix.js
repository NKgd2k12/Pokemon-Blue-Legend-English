const fs = require('fs');
let s = fs.readFileSync('tr6.js', 'utf8');
const pairs = [
  ['We fought today, come\\nback tomorrow.', 'We fought today, come\\\\nback tomorrow.'],
  ['Be careful with ZUBAT,\\nthey\'re very annoying.', 'Be careful with ZUBAT,\\nthey\'re annoying.'],
  ['Why not come back tomorrow\\nand we\'ll battle again.', 'Why not come back tomorrow\\nand battle again.'],
  ['{FD01}: I shouldn\'t go up.', '{FD01}: I shouldn\'t climb.'],
  ['I haven\'t been to VIRIDIAN\\nFOREST in a while.', 'Not been to VIRIDIAN\\nFOREST lately.'],
  ['{FC010F},\\nhandle it.', '{FC010F},\\nyou go.'],
  ['It\'s a bit different.\\nIt works better as the\\nbattle goes on.', 'It\'s a bit different.\\nIt works better\\nlate in a battle.']
];
for (const [a, b] of pairs) {
  const n = s.split(a).length - 1;
  console.log(n, JSON.stringify(a.slice(0, 30)));
  s = s.split(a).join(b);
}
fs.writeFileSync('tr6.js', s);
