# Midnight Spine — Project Brief

A personal World of Warcraft progress tracker for the Midnight expansion.
One self-contained HTML file, offline-capable, no runtime dependencies.

## Why this exists

I'm behind in Midnight — the first major patch drops in two days and I've barely
started the campaign. But this is **not** a catch-up tool and **not** an efficient
leveling guide. I don't want to race to 90. I want to play the way I like playing,
which means side quests, treasures, decor, wandering off — and I have an organized,
needs-to-see-progress brain that struggles to start when it can't tell whether
anything it's doing counts.

So the core premise is: **everything counts, and the app proves it.** Side quest,
main story, a level, a treasure — all of it advances something visible.

A secondary premise inherited from the original design, still worth keeping: content
is sorted by **what expires**, not by what's important. Almost nothing in WoW expires,
and seeing that is what makes it possible to log in without feeling behind.

**Explicit anti-goals.** This is not an optimization tool. It should never tell the
user the fastest route, never rank content by efficiency, and never imply they're
behind. If a feature would fit comfortably in a "leveling guide," it doesn't belong.

## What it is

A very good checklist with progress bars.

- Every quest in every Midnight zone, main story and side, individually checkable
- Progress bars at quest, chapter, chain, zone, and campaign level
- Level 80→90 tracked as its own set
- Recommendations for a short play session ("I have 30 minutes, what's worth doing")
- A durable place-marker — this is used after gaps of weeks, and needs to answer
  "where exactly was I" precisely enough to resume mid-chapter

That last point is load-bearing and drives the per-quest granularity more than the
gamification does. Chapter-level tracking cannot tell you where you stopped.

## Design rules

These protect the premise. Trade them away and the thing stops working.

1. **Manual ticking is the feature.** The satisfaction of checking the box is the
   mechanism. Never auto-check from the game during normal play.
   - *Permitted:* parents derive from children (a chapter completes when its quests do).
   - *Permitted:* the one-time import at first run (see Import below).
2. **Counters only on finite, knowable sets.** Quests, chapters, chains, levels — all
   fine, all wanted. But keep one uncapped freeform log for everything that isn't a
   quest: treasures, rares, decor, a delve on a whim. No target, only goes up. That's
   the pressure-free zone.
3. **The deadline tier stays tiny and stays visible.** If it grows past ~3 items,
   something has been miscategorised.
4. **Don't rebuild Midnight Routine.** Weekly resets, Great Vault, crests, per-week
   task state — that addon does it better, in-game. Out of scope permanently, including
   in any future addon phase.
5. **Nothing personal in the repo.** This may be shared publicly. Empty default state,
   no hardcoded character names, no personal progress committed.

## Scope

### v1 — the tracker
Standalone HTML. Five Midnight zones, per-quest tracking, roll-up progress bars,
levels, priority tiers, session recommendations, freeform log, three tabs.

### v2 — first-run import
A script run in-game emits completed quest IDs; paste them in to bulk-check
everything already done. **One-time catch-up, not ongoing sync** — see rule 1.
Check whether an existing addon already exports this before writing one.

### v3 — shareable
Public hosting (static, no backend), progress export/import so users can move between
browsers or devices, empty-state onboarding.

### Future phase — in-game addon
A native version living in the client. Compatible with rule 4: an addon version of
*this* is fine; an addon that tracks weekly resets is not.

### Out of scope
Weekly/daily task state. Accounts. A backend. Server-side sync. Efficiency advice.

## Architecture decisions

**1. Quest IDs are mandatory in all data.** ⚠️ Blocking for data collection.
The in-game import matches on `C_QuestLog.IsQuestFlaggedCompleted(questID)`. The game
knows IDs, not names. Name-matching is fragile — duplicate names across zones,
punctuation drift, renames between patches. Every quest is `{ id, name }`. Wowhead
exposes the id in every quest URL (`/quest=12345/...`). This must be settled before
the remaining four zones are scraped.

**2. All content lives in data files. Zero game content in code.**
The app should know nothing about Midnight specifically — it renders whatever the
expansion manifest describes. Porting to The Last Titan means writing JSON, not
editing JS.

**3. Zone gating is declarative.** Midnight's shape is linear → three parallel
branches → finale; the next expansion won't be. A zone declares
`"requires": ["arator", "harandar", "zulaman"]` and the app derives locked state.
No `if (zone === 'voidstorm')` anywhere.

**4. Save state is keyed by character from day one.** One character in use now.
Adding alts later to a flat shape means migrating real user progress; nesting one
level deeper now costs ~10 lines.

**5. Progress is keyed by quest ID, never array index.** Zone data will be reordered,
corrected, and appended to constantly. Index-based keys would silently corrupt saved
progress every time.

**6. `localStorage`, not `window.storage`.** The prototype uses the artifact-renderer
API, which doesn't exist outside claude.ai.

**7. Build step inlines everything into one HTML file.**
⚠️ `fetch()` is blocked on `file://`, so a modular app loading JSON at runtime fails
silently on double-click. Keep source modular for editing; `node build.js` inlines
data + JS + CSS into `dist/spine.html`. That file is the deliverable, and it's also
what gets hosted — static hosting needs no backend and the localStorage model is
identical either way.

## Data schemas

### `data/midnight.json` — expansion manifest
```json
{
  "id": "midnight",
  "name": "Midnight",
  "levels": { "from": 80, "to": 90 },
  "totalChapters": 17,
  "zoneOrder": ["eversong", "arator", "harandar", "zulaman", "voidstorm"],
  "keyDates": { "patch": "2026-08-11", "season": "2026-08-18" },
  "priorities": [
    { "id": "folio", "tier": "unlock", "title": "...", "why": "...", "session": "hour" }
  ]
}
```
`tier`: `clock` (expires) | `unlock` (permanent, compounding) | `forever` (optional).
`session`: `short` | `hour` | `evening` | `any` — drives the Tonight tab.

### `data/zones/<id>.json`
```json
{
  "id": "eversong",
  "name": "Eversong Woods",
  "levelBand": [80, 83],
  "requires": [],
  "note": "Linear opener. Ghostlands folded in.",
  "achievements": {
    "campaign": "Eversong In Reprise",
    "sojourner": "Sojourner of Eversong Woods"
  },
  "intro": {
    "name": "The Light's Summons",
    "quests": [{ "id": 12345, "name": "Midnight" }]
  },
  "chapters": [
    { "n": 1, "name": "Whispers in the Twilight",
      "quests": [{ "id": 12346, "name": "Silvermoon Negotiations" }] }
  ],
  "sideStories": [
    { "name": "Fear and Fel", "quests": [{ "id": 12347, "name": "..." }],
      "achievement": null, "rewards": null }
  ]
}
```
`intro` optional — only Eversong has an unnumbered prologue.
`id` may be `null` if unknown; the importer skips nulls rather than guessing.

### Save state — `localStorage["spine:v1"]`
```json
{
  "schema": 1,
  "expansion": "midnight",
  "activeCharacter": "c1",
  "characters": {
    "c1": {
      "name": "",
      "levels": { "81": true },
      "quests": { "12346": true },
      "priorities": { "folio": true },
      "logged": [{ "text": "Found a treasure in Fairbreeze", "at": 1754700000000 }]
    }
  }
}
```
Chapter, chain, zone, and campaign completion are **derived** from `quests`, not
stored. Bump `schema` and write a migration for any breaking change.

## Layout — three tabs

**Tonight** — session-length picker (30 min / an hour / an evening / no time this
week) filtering to what fits. The "no time" state says plainly that nothing is owed.
Default tab.

**Campaign** — the tree. Zones → chapters and Sojourner chains → individual quests.
Where ticking happens.

**Standing** — priority tiers, freeform log, level track, patch countdown.

Tabs also fix an ordering problem: in the single-scroll prototype the two-item
deadline tier sat below ~900 quest names, inverting the premise.

## Current state

- Prototype: `midnight-spine.jsx`, a single React component. **Reference only** —
  port the rendering ideas, discard the structure.
- Eversong Woods: complete except quest IDs. 3 chapters, 20-quest intro, 17 chains.
  Needs an ID backfill pass.
- Arator's Journey, Harandar, Zul'Aman, Voidstorm: not gathered.

## Gathering remaining zone data

Point a browsing agent at Wowhead zone guides, **one zone per run** — whole-expansion
runs cause summarising instead of listing. Prompt in `tools/extract-prompt.md`.

Must request:
- `{ id, name }` for every quest, id taken from the Wowhead URL, `null` if absent
- The exact Sojourner achievement name for the zone
- Whether Harandar's Haranir allied race unlock sits in the campaign or an optional
  chain — if optional, it gets promoted out of the Sojourner list into its own row

## Open questions

- Chapter numbering is per-zone in source data but the campaign totals 17 across five
  zones. Zone-scoped with a derived total is probably right — it matches the in-game
  tracker.
- Attribution: quest data is derived from Wowhead. Settle how that's credited before
  publishing.
