const fs = require('fs');
const patches = {
  285: "Mmm, I'm so hungry,\\ntreat me to something?",
  378: " {FC0106}Gary{FC010E}?\\f{FC010F}Oak: I wanted him here,\\nbut he preferred to go\\phis own way. He can take care of himself.\\f{FC010E}Ash: Fine, I'll do the\\nsame. Thanks for the warning, Prof,\\pI'll stay alert. See you {FC0104}{FD01}{FC010E}.\\f{FC0104}{FD01}: Goodbye Ash.",
  388: "{FC0104}{FD01}: Professor, sorry,\\nI can't take it anymore\\fI WANT MY POKéMON!\\f{FC010F}Oak: Don't be impatient\\nThere are three Pokémon in these balls.\\pPick one.",
  418: "{FC0104}{FD01}: You won't steal\\nanything, I won't let you\\f{FC0108}Rocket 1: Oh yeah? You'll\\ndeal with both of us.",
  516: "be done.{FC010F}Oak: Also, remember, if\\nyou need to heal your pokémon,\\pyou can use the machine on\\pyour right.\\f{FD01} your journey in Kanto\\nis just beginning, I wish you luck!"
};
const files = ['x5.js', 'x6.js', 'x7.js'];
const mods = {};
for (const f of files) mods[f] = require('./' + f);
for (const [k, v] of Object.entries(patches)) {
  for (const f of files) if (k in mods[f]) { mods[f][k] = v; break; }
}
for (const f of files) {
  const out = [];
  for (const k of Object.keys(mods[f]).map(Number).sort((a, b) => a - b)) out.push(`  ${k}: ${JSON.stringify(mods[f][k])}`);
  fs.writeFileSync(f, `module.exports = {\n${out.join(',\n')}\n};\n`);
}
console.log('patched 285,378,388,418,516');
