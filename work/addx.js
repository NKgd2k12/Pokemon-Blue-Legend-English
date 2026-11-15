const fs = require('fs');
const add = {
  387: "trainer like you.",
  391: " I learned a lot.\\f{FC010E}Ash: Well, I'm off, see\\nyou soon!",
  392: " for the tip.",
  400: " {FC0104}{FD01}: Yes! That's it!\\f{FC010E}Ash: Mmm, I figured, that\\npokémon you saw is called Ho-oh.\\f{FC0104}{FD01}: Ho-oh? What do you know about it?\\f{FC010E}Ash: I saw it too when\\nI started my journey as a pokémon\\ptrainer.\\fOnce, one of my friends from\\nJohto told me that pokémon\\pboded something, but he never could\\pexplain what.\\fAt least that's all I know.\\f{FC0104}{FD01}: Thanks Ash, I was\\ndying of curiosity."
};
const p = './x6.js';
const m = require(p);
Object.assign(m, add);
const out = [];
for (const k of Object.keys(m).map(Number).sort((a, b) => a - b)) out.push(`  ${k}: ${JSON.stringify(m[k])}`);
fs.writeFileSync(p, `module.exports = {\n${out.join(',\n')}\n};\n`);
console.log('added', Object.keys(add).join(','));
