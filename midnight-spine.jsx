import React, { useState, useEffect } from "react";

/* ── DATA ──────────────────────────────────────────────────────────────
   To add a zone: paste its JSON into ZONES below, matching this shape.
   `chapters` are numbered main-story blocks. `side` are Sojourner chains.
   Everything else in the app derives from this.                        */

const ZONES = [
  {
    id: "eversong",
    name: "Eversong Woods",
    band: "80–83",
    note: "Linear opener. Ghostlands folded in, connected to the Eastern Kingdoms.",
    campaignAch: "Eversong In Reprise",
    sojournerAch: "Sojourner of Eversong Woods",
    intro: {
      name: "The Light's Summons",
      quests: ["Midnight", "A Voice from the Light", "Last Bastion of the Light", "Champions of Quel'Danas", "My Son", "Where Heroes Hold", "The Hour of Need", "A Safe Path", "Luminous Wings", "Clear the Decks", "The Gate", "Severing the Void", "Voidborn Banishing", "Light Show", "Ethereal Eradication", "Light's Arsenal", "Protecting the Flank", "Wrath Unleashed", "Broken Sun", "Light's Last Stand"],
    },
    chapters: [
      { n: 1, name: "Whispers in the Twilight", quests: ["Silvermoon Negotiations", "Diplomacy", "Paved in Ash", "Fair Breeze, Light Bloom", "Sharpmaw", "Fairbreeze Favors", "Displaced Denizens", "Lightbloom Looming", "Curious Cultivation", "Trimming the Lightbloom", "Seeking Truth", "Silvermoon Must Know"] },
      { n: 2, name: "Shadowfall", quests: ["The Wayward Magister", "Appeal to the Void", "Rational Explanation", "The First to Know", "Chance Meeting", "The Ransacked Lab", "The Battle for Tranquillien", "The Traitors of Tranquillien", "The Heart of Tranquillien", "The Missing Magister", "Face the Past", "The Past Keeps Watch", "Comprehend the Void", "To Deatholme", "Void Walk With Me"] },
      { n: 3, name: "Ripple Effects", quests: ["Anything but Reprieve", "Choking Tendrils", "What's Left", "Premonition", "Old Scars", "A Foe Unseen", "Following the Root", "Gods Before Us", "An Impasse", "Beat of Blood", "Light Guide Us", "Past Redemption", "Fractured"] },
    ],
    side: [
      { name: "Fear and Fel", quests: ["Murder Row: Rumors Abound", "Murder Row: Loose Lips", "Murder Row: Traces of Fel", "Murder Row: Acting the Part", "Murder Row: Harbored Secrets", "Murder Row: One Fel Swoop"] },
      { name: "Flowers for Amalthea", quests: ["Graveblossom Gardening", "A Venomous Vocation", "Suspicious Sundries", "House Call", "Flowers for Amalthea"] },
      { name: "Sunbath, Take Me Away", quests: ["A Fish!", "Pesky Pests", "Secret Ingredients", "Lost In Light"] },
      { name: "Port Detective", quests: ["Cargo Conspiracy", "Warranted Search", "Supplier Surveillance", "Below the Brine", "Cargo Collateral", "Dead to Rights", "Smuggler Showdown"] },
      { name: "Lesser Evil", quests: ["Gold is Gold", "A Small Task", "Unraveling Wards", "Outschemed", "Stir the Nest", "Mutual Benefit", "Five Finger Discount", "Cutting a Key", "Break and Enter", "Rats Can Bite", "What We're Owed"] },
      { name: "One Adventurous Hatchling", quests: ["One Adventurous Hatchling", "A Hungry Flock", "A Roost-ed Development", "First Step Into Parenthood"] },
      { name: "Far Striding", quests: ["A Ranger's Dream", "Range of Knowledge", "If You Want It Done Right", "To the North Tower", "To the Central Tower", "Strider Stampede", "See a Mana 'bout a Wyrm", "To the South Tower", "The Dark Part of the Woods", "A Real Assignment", "Recovery Mission", "Tidy Up", "A Ranger's Spirit"] },
      { name: "Tailor Troubles", quests: ["Mad to Measure", "Uncommon Threads", "Material Gains", "Clothes Make the Man"] },
      { name: "Blinding Sun", quests: ["Facing the Sun", "Scattered in Sunbeams", "Gardener Mishap", "The Light Provides"] },
      { name: "Runestone Rumbles", quests: ["Calling in the Cavalry", "Dawnstar Defense", "And Then They Came"] },
      { name: "Paladin Rescue", quests: ["Missing Paladins", "Twilight Missive", "Signs of the Struggle", "A Somber Sun", "Captured Information", "Interrogation", "To the Ruins of Deatholme", "Executing the Blades", "Leave Ashes in Your Wake", "Blessing of Freedom", "Cutting off the Head"] },
      { name: "How to Train Your Protege", quests: ["Career Counseling", "A Path Not Yet Chosen", "A Test of the Hunt", "A Test of Blood", "A Test of the Arcane", "How to Train Your Protege"] },
      { name: "Scootin' Through Silvermoon", quests: ["Hounded and Hassled", "Dogged Disturbances", "He Went Thataway", "Fishy Dis-pondencies", "Scoot Along Now"] },
      { name: "Aspiring Academic", quests: ["Down a Peg", "Spellbook Scuffle", "Training Arc", "Academic Aspirations"] },
      { name: "The Drinking Debt", quests: ["Trials and Tabulations", "Souvenirs Scattered", "What We Do Best", "Debts Paid"] },
      { name: "Theft Tracking", quests: ["Second Time's a Choice", "Reenact the Crime", "Tracking the Trail", "Caught Red-Handed", "Thief at Bark"] },
      { name: "Daggerspine Landing", quests: ["Slithering Closer", "Not What I Ordered", "Daggers in My Spine", "Familiar Faces In Peril", "One Elf's Trash, Another Elf's Treasure", "Arcane Amassing"] },
    ],
  },
  { id: "arator", name: "Arator's Journey", band: "83–88", branch: true, note: "One of three. Any order.", chapters: [], side: [] },
  { id: "harandar", name: "Harandar", band: "83–88", branch: true, note: "Haranir allied race unlock lives here.", chapters: [], side: [] },
  { id: "zulaman", name: "Zul'Aman", band: "83–88", branch: true, note: "One of three. Any order.", chapters: [], side: [] },
  { id: "voidstorm", name: "The Voidstorm", band: "88–90", note: "Opens only when all three branches are fully done.", chapters: [], side: [] },
];

const TOTAL_CHAPTERS = 17;
const LEVELS = Array.from({ length: 10 }, (_, i) => 81 + i);
const PATCH = new Date("2026-08-11T00:00:00");
const days = (d) => Math.ceil((d - new Date()) / 86400000);

const TIERS = {
  clock: { label: "On the clock", mark: "⧗", color: "var(--venom)", note: "The complete set of things with a deadline. It's two items." },
  unlock: { label: "Unlocks the rest", mark: "⚿", color: "var(--gold)", note: "No deadline. Permanent. Compounding." },
  forever: { label: "Waits forever", mark: "∞", color: "var(--void)", note: "Account-wide, non-expiring, or purely yours." },
};

const ITEMS = [
  { id: "campaign", tier: "clock", title: "Finish the campaign on one character", why: "The gate for the Coiled Isle story. Tracked in detail above." },
  { id: "s1", tier: "clock", title: "Empty Season 1 currencies before Aug 18", why: "They don't cross the reset. Spend on anything. Only matters if you have some." },
  { id: "folio", tier: "unlock", title: "Run the Omnium Folio catch-up", why: "All five rows are open — the quests chain back to back in one sitting. Magister's Missive in Silvermoon; portal straight to Magisters' Terrace. Account-wide." },
  { id: "renown", tier: "unlock", title: "Renown and Midnight reputations", why: "Account-wide, carries into Season 2. Sojourner chains feed this directly." },
  { id: "prof", tier: "unlock", title: "Profession knowledge points", why: "Compounds all expansion, survives every reset." },
  { id: "housing", tier: "unlock", title: "Level your house", why: "12.1 raises the cap. Progress now carries into the new ceiling." },
  { id: "vault", tier: "unlock", title: "One Great Vault slot, any content", why: "Delves count. Lowest-effort item here.", repeating: true },
  { id: "delves", tier: "forever", title: "Delves, at whatever pace", why: "Solo, short, self-contained." },
  { id: "decor", tier: "forever", title: "Housing decor", why: "Enormous, permanent, entirely yours to pace." },
  { id: "rares", tier: "forever", title: "Rares, treasures, achievements", why: "None of this expires. Genuinely none of it." },
  { id: "mplus", tier: "forever", title: "M+ and Heroic raid with the guild", why: "Parked on purpose. Later in the season, like you said." },
];

const BLANK = { levels: {}, done: {}, logged: [] };

export default function Spine() {
  const [s, setS] = useState(BLANK);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState({});
  const [zoneOpen, setZoneOpen] = useState({ eversong: true });
  const [draft, setDraft] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("midnight:v3");
        if (r?.value) setS({ ...BLANK, ...JSON.parse(r.value) });
      } catch { /* first run */ }
      setLoaded(true);
    })();
  }, []);

  const save = (n) => { setS(n); window.storage.set("midnight:v3", JSON.stringify(n)).catch(() => {}); };
  const flip = (g, k) => save({ ...s, [g]: { ...s[g], [k]: !s[g][k] } });
  const tick = (k) => flip("done", k);

  const addLog = () => {
    if (!draft.trim()) return;
    save({ ...s, logged: [{ t: draft.trim(), d: Date.now() }, ...s.logged] });
    setDraft("");
  };

  const lvlDone = LEVELS.filter((l) => s.levels[l]).length;
  const namedChapters = ZONES.flatMap((z) => z.chapters.map((c) => `${z.id}:ch${c.n}`));
  const chDone = namedChapters.filter((k) => s.done[k]).length;
  const spine = Math.round(((lvlDone + chDone) / (10 + TOTAL_CHAPTERS)) * 100);
  const sideDone = ZONES.flatMap((z) => z.side.map((x) => `${z.id}:sd${x.name}`)).filter((k) => s.done[k]).length;
  const branchesDone = ZONES.filter((z) => z.branch && s.done[`${z.id}:zone`]).length;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600&display=swap');
  .ms{--ink:#17111F;--panel:#221829;--gold:#E0B667;--crimson:#A8324A;--venom:#8FBE72;--void:#9B7BE0;
    --parch:#EDE3D4;--dim:#9C8CA6;background:var(--ink);color:var(--parch);
    font-family:'Inter',system-ui,sans-serif;min-height:100%;padding:26px 20px 44px}
  .ms h1{font-family:'Cinzel',Georgia,serif;font-weight:700;font-size:25px;letter-spacing:.06em;margin:0 0 4px;color:var(--gold)}
  .ms .sub{color:var(--dim);font-size:13px;margin:0 0 20px;max-width:54ch;line-height:1.55}
  .ms h2{font-family:'Cinzel',serif;font-size:14px;letter-spacing:.1em;text-transform:uppercase;
    margin:34px 0 4px;display:flex;align-items:baseline;gap:9px}
  .ms .hint{font-size:12px;color:var(--dim);margin:0 0 14px;max-width:58ch;line-height:1.5}
  .ms .bar{height:3px;background:rgba(237,227,212,.1);margin:14px 0 6px;position:relative}
  .ms .bar i{position:absolute;top:0;bottom:0;left:0;background:var(--gold);transition:width .4s}
  .ms .barlab{display:flex;justify-content:space-between;gap:10px;font-size:11px;letter-spacing:.09em;
    text-transform:uppercase;color:var(--dim);flex-wrap:wrap}
  .ms .pips{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}
  .ms .pip{width:38px;height:34px;border:1px solid rgba(237,227,212,.22);background:transparent;color:var(--dim);
    font-family:'Cinzel',serif;font-size:12px;cursor:pointer;transition:all .15s}
  .ms .pip:hover{border-color:var(--gold)}
  .ms .pip[data-on="1"]{background:var(--gold);border-color:var(--gold);color:var(--ink);font-weight:700}
  .ms .box{flex:0 0 17px;height:17px;border:1px solid var(--dim);background:transparent;cursor:pointer;padding:0;margin-top:3px}
  .ms .box[data-on="1"]{background:var(--gold);border-color:var(--gold)}
  .ms .box.g[data-on="1"]{background:var(--venom);border-color:var(--venom)}
  .ms .box:focus-visible,.ms .pip:focus-visible{outline:2px solid var(--void);outline-offset:2px}
  .ms .zhead{width:100%;text-align:left;background:none;border:none;border-bottom:1px solid rgba(237,227,212,.13);
    padding:14px 0 9px;margin-top:22px;cursor:pointer;color:var(--parch);font-family:inherit;
    display:flex;align-items:baseline;gap:10px}
  .ms .zhead[data-locked="1"]{opacity:.45}
  .ms .zn{font-family:'Cinzel',serif;font-size:16px;letter-spacing:.04em}
  .ms .zb{font-family:'Cinzel',serif;font-size:11px;color:var(--gold)}
  .ms .zc{margin-left:auto;font-size:11px;color:var(--dim);letter-spacing:.08em}
  .ms .zw{font-size:12.5px;color:var(--dim);line-height:1.5;margin:8px 0 6px;max-width:58ch}
  .ms .row{display:flex;gap:11px;padding:10px 0;border-bottom:1px solid rgba(237,227,212,.05);align-items:flex-start}
  .ms .rt{font-size:14px;font-weight:500;cursor:pointer;background:none;border:none;color:var(--parch);
    font-family:inherit;padding:0;text-align:left}
  .ms .row[data-on="1"] .rt{color:var(--dim);text-decoration:line-through}
  .ms .rc{font-size:11px;color:var(--dim);margin-left:7px;font-weight:400}
  .ms .ql{margin:7px 0 3px;padding-left:2px;font-size:12.5px;color:var(--dim);line-height:1.85;max-width:60ch}
  .ms .ql span{display:block}
  .ms .tag{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
    border:1px solid;padding:1px 6px;margin-left:8px;vertical-align:2px}
  .ms .addrow{display:flex;gap:8px;margin:12px 0 16px}
  .ms .addrow input{flex:1;min-width:0;background:var(--panel);border:1px solid rgba(143,190,114,.3);
    color:var(--parch);padding:10px 12px;font-family:inherit;font-size:13.5px}
  .ms .addrow input:focus{outline:none;border-color:var(--venom)}
  .ms .addrow button{background:var(--venom);border:none;color:var(--ink);padding:0 18px;
    font-family:'Cinzel',serif;font-size:12px;letter-spacing:.08em;cursor:pointer;font-weight:700}
  .ms .log{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13.5px;border-bottom:1px solid rgba(237,227,212,.05)}
  .ms .log .x{background:none;border:none;color:var(--dim);cursor:pointer;font-size:15px;padding:0 4px}
  .ms .tally{margin-left:auto;font-family:'Cinzel',serif;font-size:12px;color:var(--venom);letter-spacing:.08em}
  .ms .empty{font-size:13px;color:var(--dim);font-style:italic;line-height:1.6;max-width:54ch}
  .ms .foot{margin-top:36px;border-top:1px solid rgba(237,227,212,.13);padding-top:18px;font-size:12.5px;
    color:var(--dim);line-height:1.65;max-width:62ch}
  @media (prefers-reduced-motion:reduce){.ms *{transition:none!important}}
  `;

  if (!loaded) return <div className="ms"><style>{css}</style><p className="empty">Loading…</p></div>;

  const Row = ({ k, title, count, quests, green, tag, tagColor }) => (
    <div>
      <div className="row" data-on={s.done[k] ? "1" : "0"}>
        <button className={`box${green ? " g" : ""}`} data-on={s.done[k] ? "1" : "0"}
          aria-pressed={!!s.done[k]} aria-label={`Mark ${title} complete`} onClick={() => tick(k)} />
        <div style={{ flex: 1 }}>
          <button className="rt" onClick={() => setOpen({ ...open, [k]: !open[k] })}
            aria-expanded={!!open[k]}>
            {title}
            {tag && <span className="tag" style={{ color: tagColor, borderColor: tagColor }}>{tag}</span>}
            {count ? <span className="rc">{open[k] ? "▾" : "▸"} {count} quests</span> : null}
          </button>
          {open[k] && quests && (
            <div className="ql">{quests.map((q) => <span key={q}>· {q}</span>)}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="ms">
      <style>{css}</style>
      <h1>The Midnight Spine</h1>
      <p className="sub">
        Sorted by what expires, not what's important.{" "}
        {days(PATCH) > 0 ? `${days(PATCH)} days to Curse of Ula'tek.` : "Curse of Ula'tek is live."}
      </p>

      <div className="bar"><i style={{ width: `${spine}%` }} /></div>
      <div className="barlab">
        <span>Road to 90</span>
        <span>{lvlDone}/10 levels · {chDone}/{TOTAL_CHAPTERS} chapters · {sideDone} chains</span>
      </div>

      <h2>Levels</h2>
      <div className="pips">
        {LEVELS.map((l) => (
          <button key={l} className="pip" data-on={s.levels[l] ? "1" : "0"}
            aria-pressed={!!s.levels[l]} aria-label={`Level ${l}`} onClick={() => flip("levels", l)}>{l}</button>
        ))}
      </div>

      <h2>The campaign</h2>
      <p className="hint">
        Eversong, then the three branches in any order, then Voidstorm.
        {branchesDone < 3 && ` ${3 - branchesDone} branch${branchesDone === 2 ? "" : "es"} left before Voidstorm opens.`}
        {" "}Tap a title to see its quests.
      </p>

      {ZONES.map((z) => {
        const locked = z.id === "voidstorm" && branchesDone < 3;
        const mapped = z.chapters.length > 0;
        const zDone = z.chapters.filter((c) => s.done[`${z.id}:ch${c.n}`]).length;
        const zSide = z.side.filter((x) => s.done[`${z.id}:sd${x.name}`]).length;
        return (
          <div key={z.id}>
            <button className="zhead" data-locked={locked ? "1" : "0"}
              onClick={() => setZoneOpen({ ...zoneOpen, [z.id]: !zoneOpen[z.id] })}
              aria-expanded={!!zoneOpen[z.id]}>
              <span className="zn">{z.name}</span>
              <span className="zb">{z.band}</span>
              <span className="zc">
                {mapped ? `${zDone}/${z.chapters.length} ch · ${zSide}/${z.side.length} chains` : "not yet mapped"}
                {" "}{zoneOpen[z.id] ? "▾" : "▸"}
              </span>
            </button>

            {zoneOpen[z.id] && (
              <div>
                <p className="zw">{z.note}</p>
                {!mapped && (
                  <p className="empty">
                    Paste this zone's JSON into the ZONES array at the top of the file and it
                    fills in exactly like Eversong.
                  </p>
                )}
                <div className="row" data-on={s.done[`${z.id}:zone`] ? "1" : "0"}>
                  <button className="box" data-on={s.done[`${z.id}:zone`] ? "1" : "0"}
                    aria-pressed={!!s.done[`${z.id}:zone`]}
                    aria-label={`Mark ${z.name} campaign complete`}
                    onClick={() => tick(`${z.id}:zone`)} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Zone campaign complete</span>
                    {z.campaignAch && <span className="tag" style={{ color: "var(--gold)", borderColor: "var(--gold)" }}>{z.campaignAch}</span>}
                  </div>
                </div>

                {z.intro && (
                  <Row k={`${z.id}:intro`} title={z.intro.name} count={z.intro.quests.length}
                    quests={z.intro.quests} tag="intro" tagColor="var(--void)" />
                )}
                {z.chapters.map((c) => (
                  <Row key={c.n} k={`${z.id}:ch${c.n}`}
                    title={`${String(c.n).padStart(2, "0")}  ${c.name}`}
                    count={c.quests.length} quests={c.quests} />
                ))}

                {z.side.length > 0 && (
                  <>
                    <h2 style={{ color: "var(--venom)", fontSize: 12, marginTop: 26 }}>
                      Sojourner chains
                      <span className="tally">{zSide}/{z.side.length}</span>
                    </h2>
                    <p className="hint">
                      {z.sojournerAch && `Feeds ${z.sojournerAch}. `}
                      Optional, permanent, and worth more renown than the campaign. No order, no rush.
                    </p>
                    {z.side.map((x) => (
                      <Row key={x.name} k={`${z.id}:sd${x.name}`} title={x.name}
                        count={x.quests.length} quests={x.quests} green />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <h2 style={{ color: "var(--venom)" }}>
        <span>∞</span> Anything else
        <span className="tally">{s.logged.length} logged</span>
      </h2>
      <p className="hint">No denominator, no target. Rares, decor, a delve on a whim. Only goes up.</p>
      <div className="addrow">
        <input value={draft} placeholder="What did you actually do?" onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLog()} />
        <button onClick={addLog}>Log it</button>
      </div>
      {s.logged.length === 0
        ? <p className="empty">Empty for now. Anything that isn't on a list above belongs here.</p>
        : s.logged.map((l, i) => (
          <div className="log" key={l.d}>
            <span style={{ color: "var(--venom)" }}>✓</span>
            <span style={{ flex: 1 }}>{l.t}</span>
            <button className="x" onClick={() => save({ ...s, logged: s.logged.filter((_, x) => x !== i) })}
              aria-label={`Remove ${l.t}`}>×</button>
          </div>
        ))}

      {Object.entries(TIERS).map(([key, tier]) => (
        <section key={key}>
          <h2 style={{ color: tier.color }}><span>{tier.mark}</span> {tier.label}</h2>
          <p className="hint">{tier.note}</p>
          {ITEMS.filter((i) => i.tier === key).map((item) => (
            <div className="row" key={item.id} data-on={s.done[item.id] ? "1" : "0"}>
              <button className="box" data-on={s.done[item.id] ? "1" : "0"}
                aria-pressed={!!s.done[item.id]} aria-label={`Mark "${item.title}" done`}
                onClick={() => tick(item.id)} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                  {item.title}
                  {item.repeating && <span className="tag" style={{ color: "var(--crimson)", borderColor: "var(--crimson)" }}>weekly</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.55, maxWidth: "58ch" }}>{item.why}</div>
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="foot">
        <strong style={{ color: "var(--parch)" }}>Adding zones.</strong> Everything renders from
        the ZONES array at the top of the file — chapters, chains, quest lists, counts, the
        progress bar. Paste a new zone's JSON in the same shape and it appears fully wired.
        <br /><br />
        Midnight Routine tracks what you've done this week. This tracks what you're building.
      </div>
    </div>
  );
}
