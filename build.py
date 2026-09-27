#!/usr/bin/env python3
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(p):
    with open(os.path.join(ROOT, p), 'r') as f:
        return f.read()

expansion = json.loads(read('data/midnight.json'))
zones = [json.loads(read(f'data/zones/{zid}.json')) for zid in expansion['zoneOrder']]

css = read('src/styles.css')
js = read('src/app.js')

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WoW Midnight Checklist</title>
<style>
{css}
</style>
</head>
<body>
<div id="app"></div>
<script>
var EXPANSION={json.dumps(expansion, separators=(',',':'))};
var ZONES={json.dumps(zones, separators=(',',':'))};
{js}
</script>
</body>
</html>'''

dist = os.path.join(ROOT, 'dist')
os.makedirs(dist, exist_ok=True)
with open(os.path.join(dist, 'midnight-checklist.html'), 'w') as f:
    f.write(html)

quest_count = 0
for z in zones:
    if z.get('intro'):
        quest_count += len(z['intro']['quests'])
    for ch in z.get('chapters', []):
        quest_count += len(ch['quests'])
    for br in z.get('bridges', []):
        quest_count += len(br['quests'])
    for ss in z.get('sideStories', []):
        quest_count += len(ss['quests'])

special_count = sum(len(ch['quests']) for ch in expansion.get('specialChains', []))

size_kb = len(html.encode('utf-8')) / 1024

print(f'Built dist/midnight-checklist.html')
print(f'{len(zones)} zones, {quest_count} zone quests, {special_count} special-chain quests')
print(f'{size_kb:.0f} KB')
