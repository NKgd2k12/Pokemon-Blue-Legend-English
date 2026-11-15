// fixx.js - apply corrections to x0..x7 and rewrite files
const fs = require('fs');
const path = require('path');

const patches = {
  // x0-x2 leftovers
  4: "How do I escape?",
  9: "Cross the cave and you'll\\nreach CERULEAN CITY!",
  10: "ZUBAT is very strong!\\nCatching one is useful!",
  11: "Watch out for\\nZUBAT!",
  29: "Going to see BILL?\\nLet's battle first!",
  39: "They are POKé BALLS.\\nThey hold POKéMON!",
  45: "Meteorite that fell on MT. MOON.\\n«A MOON STONE?)",
  50: "Free!\\nLet's go!",
  63: "If you have too many POKéMON,\\nput them in the PC!",
  92: "Are you a boy?\\nAre you a girl? \\p",
  97: "{FD01}!\\fYou'll travel all of Kanto\\nfor new adventures.\\pA new legend will rise.\\pGood luck!",
  103: "A spray medicine that heals\\nwounds and restores all HP. Restores 200 HP.",
  // x3
  186: "{FC0104}{FD01}: What are they up to?",
  187: "They look like the guys\\n{FC0108}Steven said.",
  204: "Hey, stay out of this!\\nWe're here to rob, see?",
  // x4
  209: "{FC0104}{FD01}: Do you think it's longer? I'm\\ngetting bored.\\f{FC010E}Steven: If you want, I can\\ntell you a story, it's about\\p{FC0106}Kanto{FC010E}, what do you think?\\f{FC0104}{FD01}: That would be great! We'll\\narrive faster that way.",
  211: "{FC0104}{FD01}: What was that?\\f{FC010E}Steven: It comes from your\\nbackpack.\\f{FC0104}{FD01}: Right, oh! It's a\\nPokégear! Mom put it\\phere before I left and didn't\\ptell me.\\f{FC010E}Steven: Answer it, someone is\\ncalling you.",
  214: "{FC0104}{FD01}: What is this?\\f{FC0106}That's FLASH, a hidden\\nmachine. With it you can teach\\pthat move to your pokémon as\\pmany times as you want, it's very\\puseful for lighting up caves.\\f{FC0104}{FD01}: Thank you very much!\\f{FC0106}At least we can help you,\\nlike you helped us. Come back anytime\\p{FC0104}{FD01}{FC0106}, you have free access to this\\pmuseum.",
  224: "{FC0104}{FD01}: Steven!",
  227: "{FC0104}Nurse: Seems that\\nCHIMCHAR has taken a liking to you,\\pso it wants to go with you. You\\ptake good care of it, as if it were\\pyours.\\f{FD01}: I will!",
  232: "{FC0105}Misty: {FC010E}Ash{FC0105}! Introduce\\nme to your friend!",
  247: "{FC0106}Admin: Idiots! You only had to\\nbring the pokéball of\\p{FC0108}SUICUNE{FC0106} and we'd have\\peverything we wanted!\\fFools!",
  248: "{FC0106}Admin: We're leaving!",
  // x5
  265: "{FC010C}Ash's mom: It's a region map,\\nit'll help on your trip.\\fGood luck {FD01}!\\n",
  266: "{FC0106}Ash's mom: Hi {FD01},\\nhow's the adventure?\\fI'm sure it's great, I want\\nto give you this.",
  268: "{FC0106}Ash's mom: It's a region map,\\nit'll help on your trip.\\fGood luck {FD01}!\\n",
  274: "I can talk to my in-law\\nfrom here!",
  284: "I watch the south\\nof this route!",
  287: "I watch the north\\nof this route!",
  300: "I came with some friends!\\fThey want POKéMON\\nbattles!",
  305: "There aren't many POKéMON\\nTRAINERS around here!\\fThey look like BUG CATCHERS,\\nexcept BROCK, from the PEWTER GYM!",
  306: "In this house a guy\\ngives away berries!",
  313: "Living alone is so\\nboring, care for your family!",
  326: "Yes, soon you'll have\\nPIKACHU!... ",
  345: "I didn't want to lose!",
  // x6
  362: "You like my new house?",
  367: "If I eat more I'll\\nexplode!",
  368: "So much food! Come back\\ntomorrow!",
  378: " {FC0106}Gary{FC010E}?\\f{FC010F}Oak: I wanted him here,\\nbut he preferred to go his\\nown way. He can take care of himself.\\f{FC010E}Ash: Fine, I'll do the\\nsame. Thanks for the warning, Prof,\\pI'll stay alert. See you {FC0104}{FD01}{FC010E}.\\f{FC0104}{FD01}: Goodbye Ash.",
  381: "{FC0106}{FD01}, professor is\\nwaiting for you!",
  383: "{FC010F}Oak: Now then, tell me about\\nyour life.\\f{FC0104}{FD01}: I come from Littleroot and\\nI train Pokémon, though I haven't\\pbattled in ages.\\f{FC010F}Oak: Well, here in Kanto there's a\\ntournament for people like you,\\pmaybe you'd join.\\f{FC0104}{FD01}: Yes! That would be great, but\\nI didn't bring any of my pokémon\\pwith me.\\f{FC010F}Oak: Don't worry, I can\\ngive you one of mine.\\f{FC0104}{FD01}: That would be a pleasure.",
  388: "{FC0104}{FD01}: Professor, sorry, but\\nI can't take it anymore\\fI WANT MY POKéMON!\\f{FC010F}Oak: Don't be impatient\\nThere are three Pokémon in these balls.\\pPick the one you want.",
  393: "{FC010F}Oak: {FD01} your Kanto\\njourney starts now, good luck!",
  398: "{FC010E}Ash: Hey {FD01}! You're just in\\ntime, I was about to leave.\\pCome, I'll introduce you to mom.",
  399: "{FC010E}Ash: I found it!\\fDid it look like this?",
  400: " {FC0104}{FD01}: Yes! That's it!\\f{FC010E}Ash: Mmm, I figured, that\\npokémon you saw is called Ho-oh.\\f{FC0104}{FD01}: Ho-oh? What do you know about it?\\f{FC010E}Ash: I saw it too when\\nI started my journey as a pokémon\\ptrainer.\\fOnce, one of my friends from\\nJohto told me that pokémon\\pboded something, but he never could\\pexplain what.\\fAt least that's all I know.\\f{FC0104}{FD01}: Thanks Ash, I was\\ndying of curiosity.",
  403: "{FC0104}{FD01}: Ahh! a swarm of {FC0106}BEEDRILL{FC0104},\\nbetter stay away{FC010F}Birch: AAAHHH!",
  406: "Who are you? You're not from\\nPALLET TOWN.",
  409: " Want to know about the two\\ncaterpillar POKéMON?",
  410: " Not been to VIRIDIAN\\nFOREST lately.",
  414: "{FC010F}Birch: Thanks {FC0104}{FD01}{FC010F}, I owe you\\none. If you hadn't been here,\\pwho knows how it'd have ended,\\pI was trying to see that\\p{FC0105}Beedrill {FC010F}up close when it\\psurprised me, thanks again.\\f{FC0104}{FD01}: You're welcome professor, but\\ncan you tell me, what are you doing in\\p{FC0106}Kanto{FC0104}?\\f{FC010F}Birch: Good question, it turns\\nout I found new data about\\pthe research I'm\\pdoing together with professor\\p{FC0105}Oak{FC010F}, this time I need\\pto give it to him personally, you've\\phelped me so much.\\f{FC010F}Come, join me, I want\\nto show you something.",
  415: "{FC010F}Birch: {FC0104}{FD01} {FC010F}look at that,\\nwho are those guys?\\f{FC0104}{FD01}: Oh no, they're the ones I met\\nbefore. They're surely up to no\\pgood, we must stop them.",
  416: "{FC0108}Rocket 1: Hehe, those are the {FC0106}Kakuna\\n{FC0108}I mentioned.\\f{FC0104}Rocket 2: Good, let's not waste time,\\nlet's catch them now.\\f{FC0104}{FD01}: Stop right there, you two!",
  417: "{FC0108}Rocket 1: You must be the\\nones spying on us!",
  418: "{FC0104}{FD01}: You won't steal\\nanything, I won't let you\\f{FC0108}Rocket 1: Oh yeah? Then you'll\\ndeal with both of us.",
  419: "{FC0104}Rocket 2: Doesn't matter, we'll\\ntake those {FC0106}Kakuna{FC0104} now.\\f{FD01}: I won't let you!",
  428: " Gary is never at the gym,\\nhe's researching with his\\pgrandpa, if you want to fight him,\\pjust wait.",
  // x7
  453: "Don't stare at me!\\nWant to fight?",
  455: "With new ones I'd\\nhave beaten you!",
  462: " Phew... I need rest.\\nPhew...\\fThat tunnel to CERULEAN is tiring!",
  468: "When you understand what\\nMEGA PUNCH means, come back!",
  474: "When you understand what\\nMEGA KICK means, come back crying!",
  495: "Saw your feat from the grass!",
  497: "I thought I'd beat you!",
  502: "You'd better make room!",
  503: " I hid because the\\nroute ones scared me!",
  508: "Are you from MT. MOON?\\nGive me a CLEFAIRY?",
  511: " BULBASAUR is your choice.\\nIt's easy to raise.\\f{FD01}, want the GRASS\\nPokémon BULBASAUR?",
  513: "Hm! That's SQUIRTLE.\\nYes, very nice.\\f{FD01}, will you choose the\\nWATER Pokémon SQUIRTLE?",
  514: "Ah! CHARMANDER\\nThey say they're loyal.\\f{FD01}, want the FIRE\\nPokémon CHARMANDER?",
  516: "be done.{FC010F}Oak: Also, remember, if\\nyou need to heal your pokémon,\\pyou can use the machine on\\pyour right.\\f{FD01} your journey in Kanto\\nis just beginning, I wish you\\nluck!"
};

const files = ['x0.js', 'x1.js', 'x2.js', 'x3.js', 'x4.js', 'x5.js', 'x6.js', 'x7.js'];
const mods = {};
for (const f of files) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) mods[f] = require(p);
}

// distribute patches to the file that already has the key
const applied = [];
for (const [k, v] of Object.entries(patches)) {
  let found = false;
  for (const f of files) {
    if (mods[f] && k in mods[f]) { mods[f][k] = v; found = true; break; }
  }
  if (!found) applied.push(k);
}
if (applied.length) console.log('keys not found anywhere:', applied.join(','));

for (const f of files) {
  if (!mods[f]) continue;
  const out = [];
  for (const k of Object.keys(mods[f]).map(Number).sort((a, b) => a - b)) {
    out.push(`  ${k}: ${JSON.stringify(mods[f][k])}`);
  }
  fs.writeFileSync(path.join(__dirname, f), `module.exports = {\n${out.join(',\n')}\n};\n`);
}
console.log('rewritten x0..x7');
