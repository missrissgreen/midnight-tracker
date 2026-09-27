(function () {
  'use strict';

  var KEY = 'spine:v1';
  var LEVELS = [];
  for (var i = EXPANSION.levels.from + 1; i <= EXPANSION.levels.to; i++) LEVELS.push(i);

  var TIERS = {
    unlock:  { label: 'Unlocks', mark: '⚿', color: 'var(--gold)', note: 'Quests and achievements needed to unlock various systems and features' }
  };

  // ── State ──────────────────────────────────────────

  var state, ui;

  function blank() {
    return {
      schema: 1,
      expansion: EXPANSION.id,
      activeCharacter: 'c1',
      characters: { c1: { name: '', levels: {}, quests: {}, priorities: {}, logged: [] } }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) { /* first run */ }
    state = blank();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function ch() { return state.characters[state.activeCharacter]; }

  // ── Quest helpers ──────────────────────────────────

  function qk(q) { return q.id ? String(q.id) : 'n:' + q.name; }
  function qDone(q) { return !!ch().quests[qk(q)]; }

  function grpDone(quests) { return quests.length > 0 && quests.every(qDone); }

  function grpProg(quests) {
    var d = 0;
    for (var i = 0; i < quests.length; i++) if (qDone(quests[i])) d++;
    return { done: d, total: quests.length, pct: quests.length ? Math.round(d / quests.length * 100) : 0 };
  }

  function zoneCampQuests(z) {
    var out = [];
    if (z.intro) out = out.concat(z.intro.quests);
    for (var i = 0; i < z.chapters.length; i++) out = out.concat(z.chapters[i].quests);
    return out;
  }

  function zoneSideQuests(z) {
    var out = [];
    var sides = z.sideStories || [];
    for (var i = 0; i < sides.length; i++) out = out.concat(sides[i].quests);
    return out;
  }

  // Bridges are campaign quests that run between zones. They count toward
  // progress but not toward unlocking other zones.
  function zoneBridgeQuests(z) {
    var out = [];
    var bridges = z.bridges || [];
    for (var i = 0; i < bridges.length; i++) out = out.concat(bridges[i].quests);
    return out;
  }

  function zoneCampDone(z) { return grpDone(zoneCampQuests(z)); }

  function zoneUnlocked(z) {
    if (!z.requires || z.requires.length === 0) return true;
    for (var i = 0; i < z.requires.length; i++) {
      var req = null;
      for (var j = 0; j < ZONES.length; j++) if (ZONES[j].id === z.requires[i]) { req = ZONES[j]; break; }
      if (!req || !zoneCampDone(req)) return false;
    }
    return true;
  }

  function overall() {
    var c = ch();
    var lvl = 0;
    for (var i = 0; i < LEVELS.length; i++) if (c.levels[LEVELS[i]]) lvl++;

    var totalCh = 0, doneCh = 0, totalSideLines = 0, doneSideLines = 0;
    var totalQ = 0, doneQ = 0, totalSideQ = 0, doneSideQ = 0;
    for (var z = 0; z < ZONES.length; z++) {
      var zone = ZONES[z];
      totalCh += zone.chapters.length;
      for (var ci = 0; ci < zone.chapters.length; ci++)
        if (grpDone(zone.chapters[ci].quests)) doneCh++;

      var sides = zone.sideStories || [];
      totalSideLines += sides.length;
      for (var si = 0; si < sides.length; si++)
        if (grpDone(sides[si].quests)) doneSideLines++;

      var cq = zoneCampQuests(zone).concat(zoneBridgeQuests(zone));
      var sq = zoneSideQuests(zone);
      totalQ += cq.length + sq.length;
      totalSideQ += sq.length;
      for (var qi = 0; qi < cq.length; qi++) if (qDone(cq[qi])) doneQ++;
      for (var qi2 = 0; qi2 < sq.length; qi2++) {
        if (qDone(sq[qi2])) { doneQ++; doneSideQ++; }
      }
    }

    var spineTotal = LEVELS.length + totalCh;
    return {
      lvl: lvl, totalCh: totalCh, doneCh: doneCh,
      totalSideLines: totalSideLines, doneSideLines: doneSideLines,
      totalSideQ: totalSideQ, doneSideQ: doneSideQ,
      totalQ: totalQ, doneQ: doneQ,
      pct: spineTotal ? Math.round((lvl + doneCh) / spineTotal * 100) : 0
    };
  }

  // ── Escaping ───────────────────────────────────────

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Render ─────────────────────────────────────────

  function render(toTop) {
    var scroll = toTop ? 0 : document.documentElement.scrollTop;
    var root = document.getElementById('app');
    var p = overall();

    var html = '';
    html += '<header>';
    html += '<div class="header-row"><h1>WoW Midnight Checklist</h1>';
    html += '<button class="import-btn" data-act="import">Import</button>';
    html += '<button class="import-btn" data-act="backup">Backup</button></div>';
    html += '<p class="subtitle">A silly little checklist to make your brain happy and keep you organized.</p>';
    html += '</header>';

    if (ui.showImport) html += renderImport();
    if (ui.showBackup) html += renderBackup();

    html += '<nav class="tabs">';
    html += '<button class="tab' + (ui.tab === 'tonight' ? ' active' : '') + '" data-act="tab" data-v="tonight">WTF Am I Doing?</button>';
    html += '<button class="tab' + (ui.tab === 'campaign' ? ' active' : '') + '" data-act="tab" data-v="campaign">Quests</button>';
    html += '<button class="tab' + (ui.tab === 'standing' ? ' active' : '') + '" data-act="tab" data-v="standing">Choose Your Own Adventure</button>';
    html += '</nav>';

    html += '<main>';
    if (ui.tab === 'tonight') html += renderTonight(p);
    else if (ui.tab === 'campaign') html += renderCampaign();
    else html += renderStanding();
    html += '</main>';

    html += '<footer></footer>';

    root.innerHTML = html;
    document.documentElement.scrollTop = scroll;

    var inp = document.getElementById('log-draft');
    if (inp) inp.value = ui.draft;
    var uinp = document.getElementById('unlock-draft');
    if (uinp) uinp.value = ui.unlockDraft;
  }

  // ── Tonight ────────────────────────────────────────

  function renderTonight(prog) {
    var c = ch();
    var h = '';

    // Levels
    h += '<h2>Levels</h2>';
    h += '<div class="pips">';
    for (var li = 0; li < LEVELS.length; li++) {
      var l = LEVELS[li];
      var on = !!c.levels[l];
      h += '<button class="pip' + (on ? ' on' : '') + '" data-act="lvl" data-v="' + l + '" aria-pressed="' + on + '" aria-label="Level ' + l + '">' + l + '</button>';
    }
    h += '</div>';

    var lvlDone = 0;
    for (var lci = 0; lci < LEVELS.length; lci++) if (c.levels[LEVELS[lci]]) lvlDone++;
    var lvlPct = LEVELS.length ? Math.round(lvlDone / LEVELS.length * 100) : 0;
    h += '<div class="progress-section">';
    h += '<div class="bar"><div class="bar-fill" style="width:' + lvlPct + '%"></div></div>';
    h += '<div class="bar-labels">';
    h += '<span>Road to ' + EXPANSION.levels.to + '</span>';
    h += '<span>' + lvlDone + '/' + LEVELS.length + ' levels</span>';
    h += '</div></div>';

    var xpData = EXPANSION.levelXP;
    if (xpData) {
      var xpEarned = 0, xpTotal = 0;
      for (var xi = 0; xi < LEVELS.length; xi++) {
        var xpForLevel = xpData[String(LEVELS[xi] - 1)] || 0;
        xpTotal += xpForLevel;
        if (c.levels[LEVELS[xi]]) xpEarned += xpForLevel;
      }
      var xpPct = xpTotal ? Math.round(xpEarned / xpTotal * 100) : 0;
      h += '<div class="xp-line">' + formatNum(xpEarned) + ' / ' + formatNum(xpTotal) + ' XP (' + xpPct + '%)</div>';
    }

    // Where you left off
    var inProg = findInProgress();
    if (inProg.length > 0) {
      h += '<h2>Where you left off</h2>';
      for (var i = 0; i < inProg.length; i++) {
        var r = inProg[i];
        h += '<div class="resume-item">';
        h += '<span class="resume-zone">' + esc(r.zone) + '</span>';
        h += '<span class="resume-section">' + esc(r.section) + ' <span class="resume-type">' + r.type + '</span></span>';
        h += '<span class="resume-progress">' + r.done + '/' + r.total + '</span>';
        h += '</div>';
      }
    }

    // Next up
    var nextCamp = findNextChapter();
    var nextSide = findNextSide();

    if (nextCamp || nextSide) {
      h += '<h2>Next up</h2>';
      if (nextCamp) {
        h += '<div class="next-item">';
        h += '<div class="next-head"><span class="next-label">Campaign</span> <span class="next-arrow">→</span> <span class="next-name">' + esc(nextCamp.name) + '</span></div>';
        h += '<div class="next-detail">' + esc(nextCamp.zone) + ' · ' + nextCamp.remaining + ' quests</div>';
        h += '</div>';
      }
      if (nextSide) {
        h += '<div class="next-item">';
        h += '<div class="next-head"><span class="next-label side">Side quest</span> <span class="next-arrow">→</span> <span class="next-name">' + esc(nextSide.name) + '</span></div>';
        h += '<div class="next-detail">' + esc(nextSide.zone) + ' · ' + nextSide.remaining + ' quests</div>';
        h += '</div>';
      }
    }

    // Stats
    h += '<h2>Your progress</h2>';
    h += '<div class="stats-grid">';
    h += '<div class="stat"><div class="stat-val">' + prog.doneQ + '</div><div class="stat-lbl">Total<br>Quests</div></div>';
    h += '<div class="stat"><div class="stat-val">' + prog.doneSideQ + '</div><div class="stat-lbl">Side<br>Quests</div></div>';
    h += '<div class="stat"><div class="stat-val">' + prog.doneCh + '</div><div class="stat-lbl">Campaign<br>Chapters</div></div>';
    h += '<div class="stat"><div class="stat-val">' + prog.doneSideLines + '</div><div class="stat-lbl">Side Quest<br>Storylines</div></div>';
    h += '</div>';

    h += '<p class="reassure">You\'re leveling exactly as you should be.</p>';

    return h;
  }

  function getZoneById(id) {
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i];
    return null;
  }

  function playOrder() { return EXPANSION.playOrder || EXPANSION.zoneOrder; }

  function findInProgress() {
    var items = [];
    var order = playOrder();
    for (var oi = 0; oi < order.length; oi++) {
      var z = getZoneById(order[oi]);
      if (!z || !zoneUnlocked(z)) continue;
      if (z.intro) {
        var ip = grpProg(z.intro.quests);
        if (ip.done > 0 && ip.done < ip.total)
          items.push({ zone: z.name, section: z.intro.name, type: 'intro', done: ip.done, total: ip.total });
      }
      for (var ci = 0; ci < z.chapters.length; ci++) {
        var cp = grpProg(z.chapters[ci].quests);
        if (cp.done > 0 && cp.done < cp.total)
          items.push({ zone: z.name, section: z.chapters[ci].name, type: 'chapter', done: cp.done, total: cp.total });
      }
      var bridges = z.bridges || [];
      for (var bi = 0; bi < bridges.length; bi++) {
        var bp = grpProg(bridges[bi].quests);
        if (bp.done > 0 && bp.done < bp.total)
          items.push({ zone: z.name, section: bridges[bi].name, type: 'chapter', done: bp.done, total: bp.total });
      }
      var sides = z.sideStories || [];
      for (var si = 0; si < sides.length; si++) {
        var sp = grpProg(sides[si].quests);
        if (sp.done > 0 && sp.done < sp.total)
          items.push({ zone: z.name, section: sides[si].name, type: 'side', done: sp.done, total: sp.total });
      }
    }
    return items;
  }

  function findNextChapter() {
    var order = playOrder();
    for (var oi = 0; oi < order.length; oi++) {
      var z = getZoneById(order[oi]);
      if (!z || !zoneUnlocked(z)) continue;
      if (z.intro && !grpDone(z.intro.quests)) {
        var p = grpProg(z.intro.quests);
        return { zone: z.name, name: z.intro.name, remaining: p.total - p.done };
      }
      for (var ci = 0; ci < z.chapters.length; ci++) {
        if (!grpDone(z.chapters[ci].quests)) {
          var cp = grpProg(z.chapters[ci].quests);
          return { zone: z.name, name: z.chapters[ci].name, remaining: cp.total - cp.done };
        }
      }
    }
    return null;
  }

  function findNextSide() {
    var order = playOrder();
    var currentZone = null;
    for (var oi = 0; oi < order.length; oi++) {
      var z = getZoneById(order[oi]);
      if (!z || !zoneUnlocked(z)) continue;
      if (!zoneCampDone(z) || z === getZoneById(order[0])) { currentZone = z; break; }
    }
    if (!currentZone) currentZone = ZONES[0];

    var searchOrder = [currentZone.id];
    for (var oi = 0; oi < order.length; oi++) {
      if (order[oi] !== currentZone.id) searchOrder.push(order[oi]);
    }

    for (var si = 0; si < searchOrder.length; si++) {
      var z = getZoneById(searchOrder[si]);
      if (!z || !zoneUnlocked(z)) continue;
      var sides = z.sideStories || [];
      for (var ssi = 0; ssi < sides.length; ssi++) {
        if (!grpDone(sides[ssi].quests)) {
          var sp = grpProg(sides[ssi].quests);
          return { zone: z.name, name: sides[ssi].name, remaining: sp.total - sp.done };
        }
      }
    }
    return null;
  }

  // ── Campaign ───────────────────────────────────────

  // ── Search ─────────────────────────────────────────

  var questIndex = null;

  function buildQuestIndex() {
    var out = [];
    function add(quests, where) {
      for (var i = 0; i < quests.length; i++) {
        out.push({ q: quests[i], name: norm(quests[i].name), zone: where.zone, place: where.place,
          secKey: where.secKey, side: !!where.side, tab: where.tab || 'campaign' });
      }
    }
    for (var zi = 0; zi < ZONES.length; zi++) {
      var z = ZONES[zi];
      if (z.intro) add(z.intro.quests, { zone: z.id, place: z.name + ' › ' + z.intro.name, secKey: z.id + ':intro' });
      for (var ci = 0; ci < z.chapters.length; ci++) {
        var c = z.chapters[ci];
        add(c.quests, { zone: z.id, place: z.name + ' › ' + pad(c.n) + ' ' + c.name, secKey: z.id + ':ch' + c.n });
      }
      var bridges = z.bridges || [];
      for (var bi = 0; bi < bridges.length; bi++)
        add(bridges[bi].quests, { zone: z.id, place: z.name + ' › ' + bridges[bi].name, secKey: z.id + ':br:' + bridges[bi].name });
      var sides = z.sideStories || [];
      for (var si = 0; si < sides.length; si++)
        add(sides[si].quests, { zone: z.id, place: z.name + ' › ' + sides[si].name, secKey: z.id + ':sd:' + sides[si].name, side: true });
    }
    var specials = EXPANSION.specialChains || [];
    for (var sci = 0; sci < specials.length; sci++)
      add(specials[sci].quests, { place: 'Unlocks › ' + specials[sci].name, secKey: 'sp:' + specials[sci].id, tab: 'standing' });
    return out;
  }

  // Lowercase, drop apostrophes, collapse punctuation so "de hashey" finds "de Hash'ey".
  function norm(s) {
    return String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function renderSearchResults() {
    var term = norm(ui.search);
    ui.searchHits = [];
    if (!term) return '';
    if (!questIndex) questIndex = buildQuestIndex();

    for (var i = 0; i < questIndex.length; i++) {
      var e = questIndex[i];
      if (e.name.indexOf(term) !== -1 || String(e.q.id) === term) ui.searchHits.push(e);
    }

    if (ui.searchHits.length === 0) return '<p class="hint">No quests match “' + esc(ui.search.trim()) + '”.</p>';

    var shown = Math.min(ui.searchHits.length, 50);
    var h = '<p class="hint">' + ui.searchHits.length + ' match' + (ui.searchHits.length === 1 ? '' : 'es') +
      (shown < ui.searchHits.length ? ', showing the first ' + shown : '') + '. Tap where it lives to jump there.</p>';
    h += '<div class="search-hits">';
    for (var hi = 0; hi < shown; hi++) {
      var hit = ui.searchHits[hi];
      var qd = qDone(hit.q);
      var green = hit.side;
      h += '<div class="quest search-hit' + (qd ? ' done' : '') + '">';
      h += '<button class="q-chk' + (green ? ' green' : '') + (qd ? ' on' : '') + '" data-act="quest" data-v="' + esc(qk(hit.q)) + '" aria-pressed="' + qd + '" aria-label="' + esc(hit.q.name) + '"></button>';
      h += '<div class="hit-body">';
      h += '<span class="q-name">' + esc(hit.q.name) + '</span>';
      h += '<button class="hit-where" data-act="reveal" data-v="' + hi + '">' + esc(hit.place) + '</button>';
      h += '</div></div>';
    }
    h += '</div>';
    return h;
  }

  function revealHit(e) {
    ui.search = '';
    ui.tab = e.tab;
    if (e.zone) ui.openZones[e.zone] = true;
    if (e.side) ui.openSections[e.zone + ':sojourner'] = true;
    ui.openSections[e.secKey] = true;
    ui.flash = qk(e.q);
    render();
    var row = document.querySelector('.quest.flash');
    if (row) row.scrollIntoView({ block: 'center' });
  }

  function renderCampaign() {
    var h = '<div class="search-box">';
    h += '<input type="search" id="quest-search" placeholder="Find a quest by name or ID..." value="' + esc(ui.search) + '" autocomplete="off" aria-label="Find a quest">';
    h += '</div>';
    h += '<div id="search-results">' + renderSearchResults() + '</div>';
    h += '<div id="zone-tree"' + (norm(ui.search) ? ' hidden' : '') + '>';
    h += '<p class="hint">Eversong first, then the three branches in any order, then Voidstorm, then the finale. Tap a chapter to see its quests.</p>';

    for (var zi = 0; zi < ZONES.length; zi++) {
      var z = ZONES[zi];
      var unlocked = zoneUnlocked(z);
      var campQ = zoneCampQuests(z).concat(zoneBridgeQuests(z));
      var sideQ = zoneSideQuests(z);
      var cp = grpProg(campQ);
      var sp = grpProg(sideQ);
      var isOpen = !!ui.openZones[z.id];
      var sides = z.sideStories || [];

      h += '<div class="zone' + (unlocked ? '' : ' locked') + '">';
      h += '<button class="zone-head" data-act="zone" data-v="' + z.id + '">';
      h += '<span class="zone-name">' + esc(z.name) + '</span>';
      h += '<span class="zone-counts">';
      if (unlocked) {
        h += cp.done + '/' + cp.total + ' campaign';
        if (sides.length > 0) h += ' &middot; ' + sp.done + '/' + sp.total + ' side';
      } else {
        h += 'locked';
      }
      h += ' ' + (isOpen ? '▾' : '▸') + '</span>';
      h += '</button>';

      if (isOpen) {
        h += '<div class="zone-body">';

        if (!unlocked) {
          var needed = [];
          for (var ri = 0; ri < z.requires.length; ri++) {
            for (var rj = 0; rj < ZONES.length; rj++)
              if (ZONES[rj].id === z.requires[ri]) { needed.push(ZONES[rj].name); break; }
          }
          h += '<p class="zone-locked-msg">Requires completing: ' + needed.join(', ') + '</p>';
        }

        if (z.note) h += '<p class="zone-note">' + esc(z.note) + '</p>';

        if (cp.total > 0) h += '<div class="bar sm"><div class="bar-fill" style="width:' + cp.pct + '%"></div></div>';

        if (z.achievements && z.achievements.campaign)
          h += '<div class="ach-label">' + esc(z.achievements.campaign) + '</div>';

        if (z.intro) h += renderGroup(z, z.intro, 'intro', z.intro.name, 'intro');

        for (var ci = 0; ci < z.chapters.length; ci++) {
          var c = z.chapters[ci];
          h += renderGroup(z, c, 'ch' + c.n, pad(c.n) + '  ' + c.name, 'chapter');
        }

        var bridges = z.bridges || [];
        for (var bi = 0; bi < bridges.length; bi++)
          h += renderGroup(z, bridges[bi], 'br:' + bridges[bi].name, bridges[bi].name, 'bridge');

        if (sides.length > 0) {
          var sojourner = z.achievements && z.achievements.sojourner;
          var sideTitle = sojourner || 'Side quests';
          var sojKey = z.id + ':sojourner';
          var sojOpen = !!ui.openSections[sojKey];
          h += '<button class="side-header" data-act="sec" data-v="' + sojKey + '"><h3>' + esc(sideTitle) + '</h3><span class="side-tally">' + (sojOpen ? '▾' : '▸') + ' ' + sp.done + '/' + sp.total + '</span></button>';
          if (sojOpen) {
            if (sp.total > 0) h += '<div class="bar sm green"><div class="bar-fill" style="width:' + sp.pct + '%"></div></div>';
            for (var si = 0; si < sides.length; si++)
              h += renderGroup(z, sides[si], 'sd:' + sides[si].name, sides[si].name, 'side');
          }
        }

        h += '</div>';
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  function renderGroup(zone, group, key, label, type) {
    var secKey = zone.id + ':' + key;
    var isOpen = !!ui.openSections[secKey];
    var p = grpProg(group.quests);
    var done = p.done === p.total && p.total > 0;
    var green = type === 'side';

    var h = '<div class="quest-group' + (done ? ' done' : '') + '">';
    h += '<div class="grp-head">';
    h += '<button class="grp-pip' + (green ? ' green' : '') + (done ? ' on' : '') + '" data-act="grp-all" data-v="' + esc(secKey) + '" aria-label="Toggle all ' + esc(label) + '"></button>';
    h += '<button class="grp-toggle" data-act="sec" data-v="' + esc(secKey) + '">';
    h += '<span class="grp-name">' + esc(label) + '</span>';
    if (type === 'intro') h += '<span class="tag intro-tag">intro</span>';
    if (type === 'bridge') h += '<span class="tag intro-tag">between zones</span>';
    h += '<span class="grp-count">' + (isOpen ? '▾' : '▸') + ' ' + p.done + '/' + p.total + '</span>';
    h += '</button></div>';

    if (isOpen) {
      h += '<div class="quest-list">';
      for (var i = 0; i < group.quests.length; i++) {
        var q = group.quests[i];
        var qd = qDone(q);
        h += '<div class="quest' + (qd ? ' done' : '') + (ui.flash === qk(q) ? ' flash' : '') + '">';
        h += '<button class="q-chk' + (green ? ' green' : '') + (qd ? ' on' : '') + '" data-act="quest" data-v="' + esc(qk(q)) + '" aria-pressed="' + qd + '" aria-label="' + esc(q.name) + '"></button>';
        h += '<span class="q-name">' + esc(q.name) + '</span>';
        if (q.id) h += '<span class="q-id">' + q.id + '</span>';
        h += '</div>';
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  function renderSpecial(chain) {
    var secKey = 'sp:' + chain.id;
    var isOpen = !!ui.openSections[secKey];
    var p = grpProg(chain.quests);
    var done = p.done === p.total && p.total > 0;

    var h = '<div class="quest-group' + (done ? ' done' : '') + '">';
    h += '<div class="grp-head">';
    h += '<button class="grp-pip' + (done ? ' on' : '') + '" data-act="grp-all" data-v="' + esc(secKey) + '" aria-label="Toggle all ' + esc(chain.name) + '"></button>';
    h += '<button class="grp-toggle" data-act="sec" data-v="' + esc(secKey) + '">';
    h += '<span class="grp-name">' + esc(chain.name) + '</span>';
    h += '<span class="grp-desc">' + esc(chain.description) + '</span>';
    h += '<span class="grp-count">' + (isOpen ? '▾' : '▸') + ' ' + p.done + '/' + p.total + '</span>';
    h += '</button></div>';

    if (isOpen) {
      h += '<div class="quest-list">';
      for (var i = 0; i < chain.quests.length; i++) {
        var q = chain.quests[i];
        var qd = qDone(q);
        h += '<div class="quest' + (qd ? ' done' : '') + (ui.flash === qk(q) ? ' flash' : '') + '">';
        h += '<button class="q-chk' + (qd ? ' on' : '') + '" data-act="quest" data-v="' + esc(qk(q)) + '" aria-pressed="' + qd + '" aria-label="' + esc(q.name) + '"></button>';
        h += '<span class="q-name">' + esc(q.name) + '</span>';
        if (q.id) h += '<span class="q-id">' + q.id + '</span>';
        h += '</div>';
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // ── Standing ───────────────────────────────────────

  function renderStanding() {
    var c = ch();
    if (!c.customUnlocks) c.customUnlocks = [];
    var h = '';

    var specials = EXPANSION.specialChains || [];
    if (specials.length > 0 || c.customUnlocks.length > 0) {
      var tier = TIERS.unlock;
      h += '<h2 style="color:' + tier.color + '"><span>' + tier.mark + '</span> ' + tier.label + '</h2>';
      h += '<p class="hint">' + esc(tier.note) + '</p>';

      for (var sci = 0; sci < specials.length; sci++) h += renderSpecial(specials[sci]);

      for (var ci = 0; ci < c.customUnlocks.length; ci++) {
        var cu = c.customUnlocks[ci];
        var cuDone = !!cu.done;
        h += '<div class="row' + (cuDone ? ' done' : '') + '">';
        h += '<button class="chk unlock' + (cuDone ? ' on' : '') + '" data-act="cunlock" data-v="' + ci + '" aria-pressed="' + cuDone + '"></button>';
        h += '<div class="row-body">';
        h += '<div class="row-title">' + esc(cu.text) + '</div>';
        h += '</div>';
        h += '<button class="log-x" data-act="rmcunlock" data-v="' + ci + '" aria-label="Remove">×</button>';
        h += '</div>';
      }

      h += '<div class="log-row">';
      h += '<input type="text" id="unlock-draft" placeholder="Add a custom unlock...">';
      h += '<button data-act="addcunlock">Add</button>';
      h += '</div>';
    }

    h += '<h2 class="green"><span>∞</span> Everything else <span class="tally">' + c.logged.length + ' logged</span></h2>';
    h += '<p class="hint">Wanna log something not on this list? Add it below, and track minutiae to your heart\'s content.</p>';

    h += '<div class="log-row">';
    h += '<input type="text" id="log-draft" placeholder="What did you actually do?">';
    h += '<button data-act="log">Log it</button>';
    h += '</div>';

    if (c.logged.length === 0) {
      h += '<p class="hint" style="font-style:italic">Empty for now. Anything that isn\'t on a list above belongs here.</p>';
    } else {
      for (var li = 0; li < c.logged.length; li++) {
        var entry = c.logged[li];
        var dt = new Date(entry.at);
        var ds = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        h += '<div class="log-entry">';
        h += '<span class="log-mark">✓</span>';
        h += '<span class="log-text">' + esc(entry.text) + '</span>';
        h += '<span class="log-date">' + ds + '</span>';
        h += '<button class="log-x" data-act="rmlog" data-v="' + li + '" aria-label="Remove">×</button>';
        h += '</div>';
      }
    }

    return h;
  }

  // ── Helpers ────────────────────────────────────────

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatNum(n) {
    var s = String(n);
    var out = '';
    for (var i = s.length - 1, c = 0; i >= 0; i--, c++) {
      if (c > 0 && c % 3 === 0) out = ',' + out;
      out = s[i] + out;
    }
    return out;
  }

  function findGroupQuests(secKey) {
    if (secKey.indexOf('sp:') === 0) {
      var chainId = secKey.substring(3);
      var specials = EXPANSION.specialChains || [];
      for (var i = 0; i < specials.length; i++)
        if (specials[i].id === chainId) return specials[i].quests;
      return [];
    }
    var colonIdx = secKey.indexOf(':');
    var zoneId = secKey.substring(0, colonIdx);
    var key = secKey.substring(colonIdx + 1);
    var zone = getZoneById(zoneId);
    if (!zone) return [];
    if (key === 'intro') return zone.intro ? zone.intro.quests : [];
    if (key.indexOf('ch') === 0) {
      var n = parseInt(key.substring(2));
      for (var i = 0; i < zone.chapters.length; i++)
        if (zone.chapters[i].n === n) return zone.chapters[i].quests;
    }
    if (key.indexOf('sd:') === 0) {
      var sideName = key.substring(3);
      var sides = zone.sideStories || [];
      for (var i = 0; i < sides.length; i++)
        if (sides[i].name === sideName) return sides[i].quests;
    }
    if (key.indexOf('br:') === 0) {
      var bridgeName = key.substring(3);
      var bridges = zone.bridges || [];
      for (var i = 0; i < bridges.length; i++)
        if (bridges[i].name === bridgeName) return bridges[i].quests;
    }
    return [];
  }

  // ── Import ─────────────────────────────────────────

  function renderImport() {
    var h = '<div class="import-overlay" data-act="import-close">';
    h += '<div class="import-modal">';
    h += '<button class="import-x" data-act="import-close" aria-label="Close">&times;</button>';
    h += '<h2 class="import-title">Import from WoW</h2>';
    h += '<div class="import-steps">';
    h += '<p><strong>1.</strong> Install the <code>MidnightTracker</code> addon (copy the addon folder to your WoW AddOns directory).</p>';
    h += '<p><strong>2.</strong> Log in and type <code>/mtrack</code> in chat.</p>';
    h += '<p><strong>3.</strong> Copy the quest IDs from the popup and paste them below.</p>';
    h += '</div>';
    h += '<textarea id="import-data" class="import-input" rows="5" placeholder="Paste quest IDs here (e.g. 86733,86734,86735...)"></textarea>';

    if (ui.importResult) {
      var r = ui.importResult;
      h += '<div class="import-result">';
      h += '<span class="import-result-num">' + r.matched + '</span> quests marked complete';
      if (r.alreadyDone > 0) h += ' <span class="import-result-note">(' + r.alreadyDone + ' were already checked)</span>';
      if (r.unmatched > 0) h += '<br><span class="import-result-note">' + r.unmatched + ' IDs not in this checklist (ignored)</span>';
      h += '</div>';
    }

    h += '<div class="import-actions">';
    h += '<button class="import-go" data-act="import-go">Import</button>';
    h += '<button class="import-cancel" data-act="import-close">Cancel</button>';
    h += '</div>';
    h += '</div></div>';
    return h;
  }

  function getAllQuestIds() {
    var ids = {};
    for (var z = 0; z < ZONES.length; z++) {
      var zone = ZONES[z];
      var all = zoneCampQuests(zone).concat(zoneBridgeQuests(zone), zoneSideQuests(zone));
      for (var i = 0; i < all.length; i++) {
        if (all[i].id) ids[String(all[i].id)] = true;
      }
    }
    var specials = EXPANSION.specialChains || [];
    for (var s = 0; s < specials.length; s++) {
      for (var i = 0; i < specials[s].quests.length; i++) {
        var q = specials[s].quests[i];
        if (q.id) ids[String(q.id)] = true;
      }
    }
    return ids;
  }

  function doImport(text) {
    var raw = text.replace(/[^0-9,]/g, '');
    var parts = raw.split(',');
    var knownIds = getAllQuestIds();
    var c = ch();
    var matched = 0, alreadyDone = 0, unmatched = 0;

    for (var i = 0; i < parts.length; i++) {
      var id = parts[i].trim();
      if (!id) continue;
      if (knownIds[id]) {
        if (c.quests[id]) {
          alreadyDone++;
        } else {
          c.quests[id] = true;
          matched++;
        }
      } else {
        unmatched++;
      }
    }

    if (matched > 0) save();
    return { matched: matched, alreadyDone: alreadyDone, unmatched: unmatched };
  }

  // ── Backup ─────────────────────────────────────────

  function renderBackup() {
    var h = '<div class="import-overlay" data-act="backup-close">';
    h += '<div class="import-modal">';
    h += '<button class="import-x" data-act="backup-close" aria-label="Close">&times;</button>';
    h += '<h2 class="import-title">Backup &amp; Restore</h2>';
    h += '<div class="import-steps">';
    h += '<p>Your progress lives in this browser only. <strong>Save a backup</strong> before updating the app or switching browsers or computers.</p>';
    h += '<p><strong>Restore</strong> replaces everything here with the backup file: quests, levels, priorities, and your log.</p>';
    h += '</div>';

    if (ui.backupResult) {
      var r = ui.backupResult;
      h += '<div class="import-result' + (r.error ? ' backup-error' : '') + '">' + esc(r.text) + '</div>';
    }

    h += '<div class="import-actions">';
    h += '<button class="import-go" data-act="backup-save">Save backup</button>';
    h += '<button class="import-cancel" data-act="backup-restore">Restore from file</button>';
    h += '<input type="file" id="backup-file" accept=".json,application/json" hidden>';
    h += '</div>';
    h += '</div></div>';
    return h;
  }

  function countDone(s) {
    var n = 0;
    for (var id in s.characters) {
      var qs = s.characters[id].quests || {};
      for (var k in qs) if (qs[k]) n++;
    }
    return n;
  }

  function saveBackup() {
    var d = new Date();
    var today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'midnight-checklist-backup-' + today + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    ui.backupResult = { text: 'Backup saved to your downloads (' + countDone(state) + ' quests checked).' };
    render();
  }

  function restoreBackup(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try { data = JSON.parse(reader.result); } catch (e) { data = null; }
      if (!data || !data.characters || !data.activeCharacter || !data.characters[data.activeCharacter]) {
        ui.backupResult = { error: true, text: "That file doesn't look like a checklist backup. Nothing was changed." };
        render();
        return;
      }
      var msg = 'Replace your current progress (' + countDone(state) + ' quests checked) with this backup (' + countDone(data) + ' quests checked)?';
      if (!window.confirm(msg)) return;
      state = data;
      save();
      ui.backupResult = { text: 'Restored! ' + countDone(state) + ' quests checked.' };
      render();
    };
    reader.readAsText(file);
  }

  // ── Events ─────────────────────────────────────────

  function handleClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var act = btn.dataset.act;
    var v = btn.dataset.v;
    var c = ch();

    switch (act) {
      case 'tab':
        ui.tab = v;
        ui.flash = null;
        render(true);
        break;
      case 'reveal':
        if (ui.searchHits[v]) revealHit(ui.searchHits[v]);
        break;
      case 'zone':
        ui.openZones[v] = !ui.openZones[v];
        render();
        break;
      case 'sec':
        ui.openSections[v] = !ui.openSections[v];
        render();
        break;
      case 'quest':
        if (c.quests[v]) delete c.quests[v]; else c.quests[v] = true;
        save();
        render();
        break;
      case 'grp-all':
        var grpQ = findGroupQuests(v);
        if (grpQ.length === 0) break;
        var allDone = grpDone(grpQ);
        for (var gi = 0; gi < grpQ.length; gi++) {
          var gk = qk(grpQ[gi]);
          if (allDone) delete c.quests[gk]; else c.quests[gk] = true;
        }
        save();
        render();
        break;
      case 'lvl':
        var lv = parseInt(v);
        if (c.levels[lv]) delete c.levels[lv]; else c.levels[lv] = true;
        save();
        render();
        break;
      case 'prio':
        if (c.priorities[v]) delete c.priorities[v]; else c.priorities[v] = true;
        save();
        render();
        break;
      case 'log':
        var inp = document.getElementById('log-draft');
        var text = inp ? inp.value.trim() : '';
        if (!text) return;
        c.logged.unshift({ text: text, at: Date.now() });
        ui.draft = '';
        save();
        render();
        break;
      case 'rmlog':
        c.logged.splice(parseInt(v), 1);
        save();
        render();
        break;
      case 'cunlock':
        if (!c.customUnlocks) c.customUnlocks = [];
        var idx = parseInt(v);
        c.customUnlocks[idx].done = !c.customUnlocks[idx].done;
        save();
        render();
        break;
      case 'rmcunlock':
        if (!c.customUnlocks) c.customUnlocks = [];
        c.customUnlocks.splice(parseInt(v), 1);
        save();
        render();
        break;
      case 'addcunlock':
        var uinp = document.getElementById('unlock-draft');
        var utext = uinp ? uinp.value.trim() : '';
        if (!utext) return;
        if (!c.customUnlocks) c.customUnlocks = [];
        c.customUnlocks.push({ text: utext, done: false });
        ui.unlockDraft = '';
        save();
        render();
        break;
      case 'import':
        ui.showImport = true;
        ui.importResult = null;
        render();
        break;
      case 'import-close':
        if (btn.classList.contains('import-overlay') && e.target !== btn) break;
        ui.showImport = false;
        ui.importResult = null;
        render();
        break;
      case 'import-go':
        var importInp = document.getElementById('import-data');
        var importText = importInp ? importInp.value.trim() : '';
        if (!importText) return;
        ui.importResult = doImport(importText);
        render();
        break;
      case 'backup':
        ui.showBackup = true;
        ui.backupResult = null;
        render();
        break;
      case 'backup-close':
        if (btn.classList.contains('import-overlay') && e.target !== btn) break;
        ui.showBackup = false;
        ui.backupResult = null;
        render();
        break;
      case 'backup-save':
        saveBackup();
        break;
      case 'backup-restore':
        document.getElementById('backup-file').click();
        break;
    }
  }

  function handleChange(e) {
    if (e.target.id === 'backup-file' && e.target.files[0]) {
      restoreBackup(e.target.files[0]);
      e.target.value = '';
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && e.target.id === 'quest-search') {
      e.target.value = '';
      updateSearch('');
    }
    if (e.key === 'Enter' && e.target.id === 'log-draft') {
      var text = e.target.value.trim();
      if (!text) return;
      ch().logged.unshift({ text: text, at: Date.now() });
      ui.draft = '';
      save();
      render();
    }
    if (e.key === 'Enter' && e.target.id === 'unlock-draft') {
      var utext = e.target.value.trim();
      if (!utext) return;
      var c = ch();
      if (!c.customUnlocks) c.customUnlocks = [];
      c.customUnlocks.push({ text: utext, done: false });
      ui.unlockDraft = '';
      save();
      render();
    }
  }

  // Update only the results so the search box keeps focus while typing.
  function updateSearch(value) {
    ui.search = value;
    ui.flash = null;
    document.getElementById('search-results').innerHTML = renderSearchResults();
    document.getElementById('zone-tree').hidden = !!norm(value);
  }

  function handleInput(e) {
    if (e.target.id === 'quest-search') updateSearch(e.target.value);
    if (e.target.id === 'log-draft') ui.draft = e.target.value;
    if (e.target.id === 'unlock-draft') ui.unlockDraft = e.target.value;
  }

  // ── Init ───────────────────────────────────────────

  load();
  ui = { tab: 'tonight', openZones: {}, openSections: {}, draft: '', unlockDraft: '', showImport: false, importResult: null, showBackup: false, backupResult: null, search: '', searchHits: [], flash: null };
  ui.openZones[EXPANSION.zoneOrder[0]] = true;

  var root = document.getElementById('app');
  root.addEventListener('click', handleClick);
  root.addEventListener('keydown', handleKeydown);
  root.addEventListener('input', handleInput);
  root.addEventListener('change', handleChange);

  render();
})();
