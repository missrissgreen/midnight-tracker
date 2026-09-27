#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const expansion = JSON.parse(read('data/midnight.json'));
const zones = expansion.zoneOrder.map(id =>
  JSON.parse(read(`data/zones/${id}.json`))
);

const css = read('src/styles.css');
const js = read('src/app.js');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Midnight Spine</title>
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<script>
var EXPANSION=${JSON.stringify(expansion)};
var ZONES=${JSON.stringify(zones)};
${js}
</script>
</body>
</html>`;

const distDir = path.join(ROOT, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
fs.writeFileSync(path.join(distDir, 'spine.html'), html);

const questCount = zones.reduce((sum, z) => {
  let c = z.intro ? z.intro.quests.length : 0;
  c += z.chapters.reduce((s, ch) => s + ch.quests.length, 0);
  c += (z.sideStories || []).reduce((s, ss) => s + ss.quests.length, 0);
  return sum + c;
}, 0);

const specialCount = (expansion.specialChains || []).reduce((s, ch) => s + ch.quests.length, 0);

console.log('Built dist/spine.html');
console.log(`${zones.length} zones, ${questCount} zone quests, ${specialCount} special-chain quests`);
console.log(`${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
