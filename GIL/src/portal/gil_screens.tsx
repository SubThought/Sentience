// *************************************************************************************
//
//  Copyright(c) 2013-2026 SubThought Corporation. All Rights Reserved.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//
//  IN NO EVENT SHALL THE AUTHOR(S) OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
//  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE, ITS USE, OR OTHER
//  DEALINGS IN THE SOFTWARE.
//
// *************************************************************************************
//
//  gil_screens.tsx — the two new screens, and the KB plumbing.
//
//  SEPARATE FILE, DELIBERATELY.  gil_dashboard.tsx is three thousand
//  lines and every view in it was built against the mock constants at
//  its head.  Adding two more views in the middle of that would mean
//  touching a file whose every part is load-bearing for a change that
//  is additive.  These import nothing from it and are wired in with
//  two lines — see §0.
//
//  WHAT IS DIFFERENT ABOUT THESE TWO.
//
//  Every existing screen reads a MESSAGE feed: what crossed the
//  boundary, as the psyche wrote it.  These read the KNOWLEDGE BASE:
//  what the mind concluded.  A message says what was said; the
//  Totality says what was made of it, and on a bad day those differ —
//  which is the day you need to see both.
//
//    Competencies   the design-pattern registry.  Spin a competency up
//                   or down; the toggle goes to Monitoring, Monitoring
//                   writes the row, and this screen reads the row back.
//                   It never shows what it just sent.
//
//    Signals        send an afferent signal, declare what should come
//                   back and by when, and watch.  An oscilloscope on
//                   the mind's boundary.
//
// *************************************************************************************

import React, { useState, useEffect, useRef } from "react";

// ── what every screen shares ─────────────────────────────────────
//
// The palette and the parts come from gil_common, not from a copy.
// They were copied here when this file was written, because the
// dashboard exported nothing — and a colour defined twice is a colour
// that will one day be two colours.
import {
  C, REALITY_COLOR, mono,
  Card, Chip, H, Cap, Button, Scroller, Mono, Raw,
  useKB, LiveBadge, sendTuple, kbQuery,
} from "./gil_common";

// ── §0  WIRING THIS IN ───────────────────────────────────────────
//
//  In gil_dashboard.tsx, two lines:
//
//    import { Competencies, Signals } from "./gil_screens";
//
//    const VIEWS = [
//      ["Psyches", Psyches], ["Percepts", Percepts],
//      ["Association", Association], ["Cases", Cases],
//      ["Activation", ActivationCube], ["Ontology", Ontology],
//      ["Imagination", Imagination], ["Agenda", AgendaView],
//      ["Attempts", Attempts],
//      ["Competencies", Competencies],        // <- added
//      ["Signals", Signals],                  // <- added
//      ["About", About], ["Settings", Settings],
//    ];
//
//  Placed before About because About is the splash and the rail reads
//  top to bottom as: what the mind received, what it concluded, what
//  it is allowed to do, what we are asking it.

// ── §3  WHAT THESE SCREENS READ ─────────────────────────────────
//
//  useKB, not useFeed.  Both poll a file; the difference is that
//  useKB SAYS WHETHER IT IS LIVE, and tells the mind which screen is
//  being watched so it writes that feed and no other.
//
//  It matters here and not elsewhere.  Every other screen has always
//  had a mock and shows the message record either way.  These two
//  show what the mind CONCLUDED, and a fixture that looks live is a
//  lie about the mind — so the badge is part of the screen, not a
//  decoration on it.

// ── §4  COMPETENCIES ─────────────────────────────────────────────

const FIXTURE_COMPETENCIES = [
  { name: "observing", component: "Observation", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Perceiver", kind: "agent", life: "running" },
                 { name: "Assimilator", kind: "agent", life: "running" },
                 { name: "Iconifier", kind: "agent", life: "running" }] },
  { name: "embodying", component: "Observation", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Registrar", kind: "service", life: "running" },
                 { name: "Executor", kind: "service", life: "running" }] },
  { name: "reminding", component: "Observation", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Storer", kind: "agent", life: "running" },
                 { name: "Retriever", kind: "agent", life: "running" },
                 { name: "Matcher", kind: "agent", life: "running" }] },
  { name: "simulating", component: "Reflection", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Simulator", kind: "agent", life: "running" },
                 { name: "Critic", kind: "agent", life: "running" }] },
  { name: "discovering", component: "Reflection", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Discoverer", kind: "rule", life: "running" }] },
  { name: "navigating", component: "Coordination", enabled: true, status: "running",
    since: "2026682585181880",
    mechanisms: [{ name: "Router", kind: "agent", life: "running" },
                 { name: "Cartographer", kind: "agent", life: "running" },
                 { name: "Navigator", kind: "agent", life: "running" }] },
  { name: "theorizing", component: "Coordination", enabled: false, status: "suspended",
    since: "2026682584820377",
    mechanisms: [{ name: "Theorizer", kind: "rule", life: "suspended" }] },
  { name: "gaming", component: "Coordination", enabled: false, status: "idle",
    since: "0",
    mechanisms: [{ name: "Neumann", kind: "rule", life: "idle" },
                 { name: "Ostrom", kind: "rule", life: "idle" },
                 { name: "Nash-Predict", kind: "rule", life: "idle" }] },
];

const STATUS_COLOR = {
  running: C.observed, suspended: C.desired, idle: C.dim, faulted: C.impeded,
};

export function Competencies() {
  const { rows, live, error } = useKB("competencies", FIXTURE_COMPETENCIES, "competencies");
  const [pending, setPending] = useState({});
  const [note, setNote] = useState(null);

  const components = ["Observation", "Coordination", "Reflection", "Consolidation"];
  const byComponent = (c) => (rows || []).filter((r) => r.component === c);

  const toggle = async (row) => {
    const want = row.enabled ? "no" : "yes";
    setPending((p) => ({ ...p, [row.name]: true }));
    setNote(null);
    try {
      // THE TOGGLE IS A TUPLE.  Same door, same gate as everything
      // else; there is no second protocol for settings.
      const reply = await sendTuple(
        `[COMPETENCY :Name ${row.name} :Enabled ${want} :Moment \\@m{${Date.now()}}]`);
      setNote(reply);
    } catch (e) {
      setNote(String(e.message || e));
    } finally {
      setPending((p) => ({ ...p, [row.name]: false }));
    }
    // NOT UPDATED LOCALLY, DELIBERATELY.  The row comes back from the
    // Totality on the next poll.  A screen that moved its own switch
    // would show a competency as down whether or not anything went
    // down — which is exactly the failure this screen exists to catch.
  };

  const up = (rows || []).filter((r) => r.enabled).length;

  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <H>Competencies</H>
      <LiveBadge live={live} error={error} />
    </div>

    <Cap>
      {up} of {(rows || []).length} enabled · a competency is a design pattern —
      its agents, services and rules together. Disabling suspends: state is kept,
      and spinning it back up resumes where it stood.
    </Cap>

    {note && <Raw text={note}/>}

    {components.map((comp) => {
      const list = byComponent(comp);
      if (!list.length) return null;
      return <div key={comp} style={{ marginTop: 14 }}>
        <div style={{ color: C.expected, fontSize: 13, fontWeight: 700 }}>{comp}</div>
        {list.map((row) => (
          <Card key={row.name} bg={row.enabled ? C.card : C.pending}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{row.name}</span>

              <span style={{
                fontSize: 11, color: "#fff", borderRadius: 4, padding: "1px 8px",
                background: STATUS_COLOR[row.status] || C.dim,
              }}>{row.status}</span>

              <span style={{ fontSize: 11, color: C.dim }}>
                {row.mechanisms?.length || 0} mechanism
                {(row.mechanisms?.length || 0) === 1 ? "" : "s"}
              </span>

              <span style={{ marginLeft: "auto" }}>
                <Button
                  onClick={() => toggle(row)}
                  disabled={!!pending[row.name]}
                  tone={row.enabled ? C.impeded : C.observed}>
                  {pending[row.name] ? "…" : row.enabled ? "spin down" : "spin up"}
                </Button>
              </span>
            </div>

            <div style={{ marginTop: 6 }}>
              {(row.mechanisms || []).map((m) => (
                <Chip key={m.name}
                      color={m.life === "running" ? C.need
                           : m.life === "suspended" ? C.psycheBg : C.faint}
                      ink={m.life === "faulted" ? C.impeded : C.ink}>
                  {m.name}
                  <span style={{ color: C.dim }}> · {m.kind}</span>
                </Chip>
              ))}
            </div>

            {/* RULES CANNOT BE SUSPENDED — they live in the Faculty and
                have no task to signal.  Each carries the competency's
                :Enabled in its condition instead, so the row quiets the
                whole family on the next match cycle.  Worth saying on
                screen, because "suspended" means something different
                for a rule than for an agent. */}
            {(row.mechanisms || []).some((m) => m.kind === "rule") && (
              <Cap>rules go quiet by condition, not by suspension</Cap>
            )}
          </Card>
        ))}
      </div>;
    })}
  </div>;
}

// ── §5  SIGNALS ──────────────────────────────────────────────────
//
//  Send the afferent signal. Watch for the expected signal. If it is
//  encountered within the deadline, show it; if the deadline passes,
//  say so.
//
//  NOT A TEST SUITE.  Premise has one of those, and it tests
//  functions. This tests a MIND: one stimulus in, and whatever the
//  whole apparatus decides to do about it, within a bound.
//
//  DEADLINES IN BEATS OR MOMENTS.  A beat is the world's own clock —
//  "before the world moves on" — and a moment is wall time, for when
//  the question is whether anything happened at all.

const SIGNAL_TEMPLATES = {
  PERCEPT:
`[PERCEPT :Modality Eidos :Channel ls20-9607e27b
          :Address "frame://eidos/a3f1c2"
          :Able {reset action1 action2 action3 action4}
          :Content (idiom :Data grid-state :Index 0 :Count 1)
          :Beat \\@b{12} :Moment \\@m{0} :Token "eidos-7f31"]`,
  URGE:
`[URGE :Need finish :Source ls20-9607e27b :Delta 5
       :Beat \\@b{12} :Moment \\@m{0} :Token "eidos-7f31"]`,
  RESULT:
`[RESULT :Act action1 :Status Done :Trial 270601
         :Beat \\@b{13} :Moment \\@m{0} :Token "eidos-7f31"]`,
};

export function Signals() {
  const [kind, setKind] = useState("PERCEPT");
  const [signal, setSignal] = useState(SIGNAL_TEMPLATES.PERCEPT);
  const [expect, setExpect] = useState("ATTEMPT");
  const [match, setMatch] = useState(":Act");
  const [units, setUnits] = useState("beats");
  const [deadline, setDeadline] = useState(3);
  const [state, setState] = useState("idle");   // idle | watching | met | missed | error
  const [got, setGot] = useState(null);
  const [sent, setSent] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const watcher = useRef(null);

  const pick = (k) => { setKind(k); setSignal(SIGNAL_TEMPLATES[k]); };

  useEffect(() => () => { if (watcher.current) clearInterval(watcher.current); }, []);

  // WHAT COUNTS AS THE EXPECTED SIGNAL.
  //
  // Exact slot matching, for now.  Every slot written in the match
  // expression must be present with that value.  A subset rule would
  // pass on a tuple that merely resembled the one asked for, and the
  // whole point of a case is that it is the case you specified.
  const slotsOf = (text) => {
    const out = {};
    const re = /:([A-Z][\w-]*)\s+("[^"]*"|\{[^}]*\}|\S+)/g;
    let m;
    while ((m = re.exec(text))) out[m[1]] = m[2];
    return out;
  };

  const matches = (raw) => {
    const want = slotsOf(match);
    const have = slotsOf(raw);
    // a bare slot name means "present, any value"
    const names = (match.match(/:([A-Z][\w-]*)/g) || []).map((s) => s.slice(1));
    return names.every((n) =>
      have[n] !== undefined && (want[n] === undefined || have[n] === want[n]));
  };

  const start = async () => {
    setState("watching"); setGot(null); setElapsed(0);
    const began = Date.now();

    try {
      const reply = await sendTuple(signal.replace(/\s+/g, " ").trim());
      setSent(reply);
    } catch (e) {
      setState("error"); setSent(String(e.message || e));
      return;
    }

    // THE RECORD IS THE WITNESS.  Nothing is intercepted and nothing
    // is tapped: the answer is watched for where every other screen
    // already looks — the feed of what actually crossed.
    const feed = expect === "ATTEMPT" ? "attempts" : "percepts";
    const budget = units === "moments" ? deadline : deadline * 4000;

    watcher.current = setInterval(async () => {
      const waited = Date.now() - began;
      setElapsed(waited);
      try {
        const r = await fetch(`/portal-${feed}.json`, { cache: "no-store" });
        const rows = await r.json();
        const hit = (Array.isArray(rows) ? rows : []).find((row) => {
          const raw = row.raw || "";
          if (!raw.startsWith(`[${expect}`)) return false;
          if (row.m && Number(row.m) < began * 10000) return false;
          return matches(raw);
        });
        if (hit) {
          clearInterval(watcher.current);
          setGot(hit); setState("met");
          return;
        }
      } catch { /* a feed not yet written is not a failure of the case */ }

      if (waited > budget) {
        clearInterval(watcher.current);
        setState("missed");
      }
    }, 400);
  };

  const stop = () => {
    if (watcher.current) clearInterval(watcher.current);
    setState("idle");
  };

  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <H>Signals</H>
      <span style={{ marginLeft: "auto", fontSize: 11, color: C.dim }}>
        afferent in · expected out · within a deadline
      </span>
    </div>

    <Cap>
      Spin down what you are not studying on the Competencies screen first —
      a case is only as clean as the mind it runs in.
    </Cap>

    {/* ── the afferent signal ── */}
    <Card bg={C.composeBg}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.dim }}>send</span>
        {["PERCEPT", "URGE", "RESULT"].map((k) => (
          <Button key={k} onClick={() => pick(k)}
                  tone={k === kind ? C.imagined : C.dim}>{k}</Button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.dim }}>
          to the Perceiver, as a psyche would
        </span>
      </div>
      <textarea value={signal} onChange={(e) => setSignal(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%", minHeight: 96, marginTop: 8, resize: "vertical",
          fontFamily: mono, fontSize: 12, padding: 8, borderRadius: 6,
          border: `1px solid ${C.rule}`, background: C.card, color: C.ink,
        }} />
    </Card>

    {/* ── the expectation ── */}
    <Card>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.dim }}>expect</span>
        {["ATTEMPT", "RESULT"].map((k) => (
          <Button key={k} onClick={() => setExpect(k)}
                  tone={k === expect ? C.observed : C.dim}>{k}</Button>
        ))}
        <span style={{ fontSize: 12, color: C.dim, marginLeft: 8 }}>matching</span>
        <input value={match} onChange={(e) => setMatch(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1, minWidth: 220, fontFamily: mono, fontSize: 12, padding: "4px 8px",
            borderRadius: 5, border: `1px solid ${C.rule}`, background: C.well2,
          }} />
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: C.dim }}>within</span>
        <input type="number" min={1} value={deadline}
          onChange={(e) => setDeadline(Number(e.target.value))}
          style={{
            width: 70, fontFamily: mono, fontSize: 12, padding: "4px 8px",
            borderRadius: 5, border: `1px solid ${C.rule}`, background: C.well2,
          }} />
        {["beats", "moments"].map((u) => (
          <Button key={u} onClick={() => setUnits(u)}
                  tone={u === units ? C.observed : C.dim}>{u}</Button>
        ))}
        <span style={{ marginLeft: "auto" }}>
          {state === "watching"
            ? <Button onClick={stop} tone={C.impeded}>stop</Button>
            : <Button onClick={start} tone={C.observed}>send and watch</Button>}
        </span>
      </div>

      <Cap>
        exact slot matching · a bare slot name means present with any value
      </Cap>
    </Card>

    {/* ── the verdict ── */}
    {state !== "idle" && (
      <Card bg={state === "met" ? C.need : state === "missed" ? C.psycheBg : C.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontWeight: 700, fontSize: 11, color: "#fff", borderRadius: 4,
            padding: "1px 8px",
            background: state === "met" ? C.observed
                      : state === "missed" ? C.impeded
                      : state === "error" ? C.impeded : C.expected,
          }}>
            {state === "watching" ? "WATCHING"
              : state === "met" ? "MET"
              : state === "missed" ? "DEADLINE PASSED" : "ERROR"}
          </span>
          <span style={{ fontSize: 12, color: C.dim }}>
            {(elapsed / 1000).toFixed(1)}s elapsed
          </span>
        </div>

        {state === "missed" && (
          <Cap>
            No {expect} matching {match} arrived within {deadline} {units}.
            The signal was sent — whether anything was made of it is what the
            Association and Agenda screens will say.
          </Cap>
        )}

        {got && <div style={{ marginTop: 8 }}><Raw text={got.raw}/></div>}
        {sent && <div style={{ marginTop: 8 }}>
          <Cap>the mind's answer to the signal</Cap><Raw text={sent}/>
        </div>}
      </Card>
    )}
  </div>;
}


// ── §6  MAPPER ───────────────────────────────────────────────────
//
//  The spatial ladder as the mind has built it, rung by rung.
//
//  THE SHAPE IS THE DIAGNOSIS.  Four hundred venues under one locale
//  is a mind whose chunking is not firing.  Four rungs populated and
//  three empty is a mind that has not wandered far enough yet. Those
//  are different problems with different fixes and they look
//  identical from inside the mind, which is the whole reason this
//  screen exists.
//
//  AND IT IS WHERE THE LEVEL-2 QUESTION BECOMES VISIBLE.  μ-GIL
//  planned at Place granularity with no Locale above it — forty
//  single steps whose value no bounded walk could see.  Whether this
//  ladder populates at all is the thing that must be true before any
//  of the rest matters.

const RUNGS = ["Scene", "Venue", "Locale", "Place", "Area", "Region", "Map"];

const FIXTURE_MAP = {
  rungs: [
    { rung: "Scene",  count: 41, rows: [] },
    { rung: "Venue",  count: 6,  rows: [
      { m: "220314", label: "", members: 16, holds: [], landmark: "", pulses: 3 },
      { m: "220317", label: "", members: 12, holds: [], landmark: "", pulses: 0 }] },
    { rung: "Locale", count: 1,  rows: [
      { m: "230118", label: "", members: 5, holds: [], landmark: "270312", pulses: 2 }] },
    { rung: "Place",  count: 0,  rows: [] },
    { rung: "Area",   count: 0,  rows: [] },
    { rung: "Region", count: 0,  rows: [] },
    { rung: "Map",    count: 0,  rows: [] },
  ],
  landmarks: [
    { m: "300611", figment: "270312", locale: "230118", label: "chamber-portal" },
  ],
};

export function Mapper() {
  const { rows: map, live, error } = useKB("map", FIXTURE_MAP, "mapper");
  const { rows: stagings } = useKB("stagings", [], null);
  const [open, setOpen] = useState("Venue");

  const rungs = (map && map.rungs) || [];
  const marks = (map && map.landmarks) || [];
  const byRung = (n: string) => rungs.find((r: any) => r.rung === n) || { count: 0, rows: [] };

  // THE LADDER IS DRAWN EVEN WHERE IT IS EMPTY, deliberately.  An
  // empty rung is not a missing row — it is the mind not having got
  // there yet, and that is the single most informative thing this
  // screen can say.
  const deepest = RUNGS.reduce((d, n, i) => (byRung(n).count > 0 ? i : d), 0);

  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <H>The Map</H>
      <LiveBadge live={live} error={error} />
    </div>

    <Cap>
      Scene through Map, as the mind has built it. A rung is made once, from
      five to nine members found together, and closed — nothing splits and
      nothing grows. Empty rungs above the deepest are places the mind has
      not been enough to group.
    </Cap>

    {/* the ladder */}
    <Card>
      {RUNGS.map((name, i) => {
        const r = byRung(name);
        const reached = i <= deepest;
        return <div key={name} onClick={() => setOpen(name)}
          style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            padding: "5px 8px", borderRadius: 5,
            background: open === name ? C.faint : "transparent",
            opacity: reached ? 1 : 0.45,
          }}>
          <span style={{ width: 62, fontSize: 12, fontWeight: open === name ? 700 : 400 }}>
            {name}</span>

          {/* one mark per member, to a limit — the shape at a glance */}
          <span style={{ flex: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
            {Array.from({ length: Math.min(r.count, 60) }).map((_, k) =>
              <span key={k} style={{
                width: 7, height: 7, borderRadius: 2,
                background: reached ? C.observed : C.rule,
              }} />)}
            {r.count > 60 && <span style={{ fontSize: 11, color: C.dim }}>
              +{r.count - 60}</span>}
          </span>

          <span style={{ fontFamily: mono, fontSize: 12, color: C.dim, width: 46,
            textAlign: "right" }}>{r.count}</span>
        </div>;
      })}
    </Card>

    {/* the open rung */}
    <div style={{ color: C.expected, fontSize: 13, fontWeight: 700, marginTop: 12 }}>
      {open}
    </div>
    {byRung(open).rows.length === 0
      ? <Cap>
          Nothing at this rung yet. {open === "Scene"
            ? "Nothing has been perceived."
            : `The mind has not found ${
                open === "Venue" ? "an activity to place" : "five of the rung below together"
              }.`}
        </Cap>
      : byRung(open).rows.map((row: any) =>
        <Card key={row.m}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.observed,
              fontWeight: 700 }}>{row.m}</span>
            {row.label && <span style={{ fontSize: 12 }}>{row.label}</span>}
            <Chip color={C.faint}>{row.members} held</Chip>
            {row.landmark &&
              <Chip color={C.need} title="the figment that identifies this locale">
                landmark {row.landmark}</Chip>}
            <span style={{ marginLeft: "auto", fontSize: 11, color: C.dim }}>
              {row.pulses} pulses</span>
          </div>
        </Card>)}

    {/* landmarks in their own right */}
    {marks.length > 0 && <>
      <div style={{ color: C.expected, fontSize: 13, fontWeight: 700, marginTop: 14 }}>
        Landmarks
      </div>
      <Cap>
        A figment placed alike across the venues of one locale — something that
        does not move, and therefore something everything else can be measured
        against. Recognise it and the locale activates.
      </Cap>
      {marks.map((lm: any) =>
        <Card key={lm.m}>
          <span style={{ fontFamily: mono, fontSize: 12 }}>
            <span style={{ color: C.imagined, fontWeight: 700 }}>{lm.figment}</span>
            {lm.label && <span style={{ color: C.ink }}> {lm.label}</span>}
            <span style={{ color: C.dim }}> identifies </span>
            <span style={{ color: C.observed, fontWeight: 700 }}>{lm.locale}</span>
          </span>
        </Card>)}
    </>}

    {/* the production line */}
    {Array.isArray(stagings) && stagings.length > 0 && <>
      <div style={{ color: C.expected, fontSize: 13, fontWeight: 700, marginTop: 14 }}>
        Stagings
      </div>
      <Cap>
        One pass per perceived scene, through six roles. A pass showing four
        ticks and stopping is a pipeline that stalled — which was invisible
        while progress was inferred from slots rather than recorded.
      </Cap>
      {stagings.map((s: any) =>
        <Card key={s.m}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.dim }}>{s.m}</span>
            {s.tier && <Chip color={
              s.tier === "reuse" ? C.need
              : s.tier === "adapt" ? C.psycheBg : C.faint}>
              {s.tier}{s.tier === "adapt" && s.score ? ` ${s.score}` : ""}</Chip>}
            <span style={{ marginLeft: "auto" }}>
              {["Locator", "SetDesigner", "Casting", "StageManager",
                "Cinematographer", "Choreographer"].map(role =>
                <Chip key={role}
                  color={(s.roles || []).includes(role) ? C.need : C.faint}
                  ink={(s.roles || []).includes(role) ? C.ink : C.dim}>
                  {role}{(s.roles || []).includes(role) ? " ✓" : ""}</Chip>)}
            </span>
          </div>
        </Card>)}
    </>}
  </div>;
}

// ── §7  LEARNER ──────────────────────────────────────────────────
//
//  Which mind this is, and what it is attached to.
//
//  A LEARNER IS A DISTINCT MIND — its own Totality, its own
//  Registrar, Perceiver and Executor, its own record on disk.  Two
//  learners are two minds that happen to share a dashboard, not one
//  mind with two faces.
//
//  FIRST IN THE RAIL, because everything else on the dashboard is
//  about a particular mind and the operator should never be in doubt
//  which.  A percept shown under the wrong learner's name is worse
//  than no percept at all.
//
//  ONE CONFIGURED URL PER LEARNER: THE REGISTRAR.  Everything else is
//  discovered, by the mechanism that already exists — a REGISTER is
//  answered with a grant carrying the Perceiver and Executor.  So
//  this screen shows what the mind reports about itself, not what
//  somebody configured twice.

const FIXTURE_LEARNER = {
  name: "GIL", version: "1.0.0", learner: "Sal", id: "Sal",
  totality: "locus://sol.earth.orb.local.host/Totality",
  registrar: "tcp://127.0.0.1:4240/registrar",
  perceiver: "tcp://127.0.0.1:4210/perceiver",
  executor: "tcp://127.0.0.1:4241/executor",
  home: "g:/…/1.0/gil/",
  moment: "",
};

export function Learner() {
  // TWO SOURCES, AND THE DIFFERENCE MATTERS.
  //
  // portal-learner.json is what THIS MIND reports about itself — and
  // a mind that is down reports nothing.
  //
  // curator-learners.json is what the DASHBOARD has observed: every
  // learner that ever enrolled, including the ones that have since
  // stopped. Those are exactly the ones an operator wants to see,
  // because they are the ones to start.
  const { rows: who, live, error } = useKB("learner", FIXTURE_LEARNER, "learner");
  const { rows: known } = useKB("curator-learners", null, null);
  const [busy, setBusy] = useState<string | null>(null);
  const [said, setSaid] = useState<string | null>(null);
  const [boot, setBoot] = useState<any>(null);

  // The bootstrap entry, from the dashboard's own registry. Nothing
  // can enrol before something runs, so one learner is configured
  // and the rest are discovered — and this is the one to start when
  // the roster is empty because nothing has ever run.
  useEffect(() => {
    let alive = true;
    fetch("/portal-config.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (alive && j) setBoot(j); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const enrolled = (known && known.learners) || [];
  const adapter = (known && known.adapter) || (boot && boot.adapter) || "";
  const bootstrap = boot && boot.bootstrap && boot.bootstrap.id
    ? [boot.bootstrap] : [];

  // The bootstrap entry is shown only when nothing has enrolled under
  // that id — the knowledge base wins, because a learner that
  // enrolled said where it ACTUALLY lives and the registry says only
  // where it was expected to.
  const roster = [
    ...enrolled,
    ...bootstrap.filter((b: any) => !enrolled.some((e: any) => e.id === b.id)),
  ];

  const spawn = async (id: string) => {
    setBusy(id); setSaid(null);
    try {
      // SPAWNING IS A TUPLE LIKE EVERYTHING ELSE, through the one
      // door.  dashboard.theory starts the stack; this asks it to.
      //
      // BY :Id — the identifier the roster names, not the display
      // name an operator reads.
      setSaid(await sendTuple(`[LEARNER :Id ${id} :Start yes]`));
    } catch (e: any) {
      setSaid(String(e.message || e));
    } finally { setBusy(null); }
  };

  const field = (label: string, value: any, note?: string) =>
    <div key={label} style={{ display: "flex", gap: 10, alignItems: "baseline", marginTop: 8 }}>
      <span style={{ fontSize: 12, width: 110, color: C.dim }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 12, padding: "3px 8px",
        background: C.well2, borderRadius: 4, border: `1px solid ${C.rule}` }}>
        {value || "—"}</span>
      {note && <span style={{ fontSize: 11, color: C.dim }}>{note}</span>}
    </div>;

  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <H>Learner</H>
      <LiveBadge live={live} error={error} />
    </div>

    <Cap>
      A learner is a distinct mind — its own Totality, its own Registrar,
      Perceiver and Executor, its own record. Everything else on this
      dashboard is about this one.
    </Cap>

    {/* WHAT IS LOST ON RESTART DEPENDS ON THE ADAPTER, and the
        screen says which — because a roster that silently starts
        empty looks like a dashboard that has never seen a learner,
        which is a claim about the MINDS rather than about the
        configuration. */}
    {adapter === "ephemeral-kb" && <Cap>
      The dashboard's knowledge base is <b>ephemeral-kb</b> — in memory. The
      roster, the injections record and the signal cases go when the Curator
      does. Configure a durable adapter in Curator.daicho to keep them.
    </Cap>}

    {/* the roster */}
    {roster.length > 0 && <Card>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 6 }}>
        known learners{adapter ? ` · ${adapter}` : ""}</div>
      {roster.map((l: any) => {
        // MATCH ON THE ID, NOT THE NAME.  Two learners may be called
        // the same thing by an operator who has not renamed one yet;
        // no two share an identifier.
        const here = who && who.id === l.id;
        const never = !l.seen;
        return <div key={l.id} style={{ display: "flex", alignItems: "center",
          gap: 10, padding: "4px 0" }}>
          <span style={{ fontWeight: here ? 700 : 400, fontSize: 13 }}>{l.name}</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{l.id}</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>
            {l.registrar}</span>

          {/* NEVER SEEN IS NOT THE SAME AS SILENT.  One has never
              announced itself — the bootstrap entry, or a learner
              configured and never started.  The other enrolled and
              has stopped beating, which is a mind that fell over. */}
          {never && !here && <Chip color={C.faint} ink={C.dim}>never seen</Chip>}

          {here
            ? <Chip color={C.need}>answering</Chip>
            : <span style={{ marginLeft: "auto" }}>
                <Button onClick={() => spawn(l.id)} disabled={busy === l.id}>
                  {busy === l.id ? "starting…" : "spawn"}</Button>
              </span>}
        </div>;
      })}
    </Card>}

    {said && <Raw text={said}/>}

    {/* what this mind reports about itself */}
    <Card>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>
        as this mind reports itself
      </div>
      {field("mind", who && `${who.name} ${who.version}`)}
      {field("learner", who && `${who.learner} (${who.id})`)}
      {field("totality", who && who.totality, "shared, if two learners show the same")}
      {field("home", who && who.home)}
      {field("registrar", who && who.registrar, "the one configured url")}
      {field("perceiver", who && who.perceiver, "from the grant")}
      {field("executor", who && who.executor, "from the grant")}
    </Card>

    <Cap>
      The Perceiver and Executor are not configured — they arrive in the
      PSYCHE grant that answers a REGISTER. Configuring them here as well
      would be the same fact in two places, which is how they come to
      disagree.
    </Cap>

    {/* WHAT THE DASHBOARD ITSELF HAS SENT.
        This portal is a viewer everywhere and a sender in exactly three
        places. Without this record the archive cannot distinguish an
        attempt the mind decided from one a person typed — and a campaign
        whose evidence cannot be told apart from its operator's
        interference proves nothing. */}
    <Injections />
  </div>;
}

// ── §8  INJECTIONS ───────────────────────────────────────────────

function Injections() {
  const { rows: inj } = useKB("curator-injections", null, "attempts");
  const rows = (inj && inj.rows) || [];
  const [open, setOpen] = useState(false);

  return <div style={{ marginTop: 14 }}>
    <div onClick={() => setOpen(!open)}
      style={{ display: "flex", alignItems: "baseline", gap: 8, cursor: "pointer" }}>
      <span style={{ color: C.expected, fontSize: 13, fontWeight: 700 }}>
        Injections</span>
      <span style={{ fontSize: 11, color: C.dim }}>
        {rows.length} tuple{rows.length === 1 ? "" : "s"} sent from this portal
      </span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: C.dim }}>
        {open ? "hide" : "show"}</span>
    </div>

    {!open && rows.length === 0 && <Cap>
      Nothing has been sent from the dashboard — which is what a clean
      campaign looks like.
    </Cap>}

    {open && rows.map((r: any, i: number) =>
      <Card key={i}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <Chip color={C.composeBg}>{r.head}</Chip>
          <span style={{ fontSize: 11, color: C.dim }}>{r.screen}</span>
          <span style={{ fontSize: 11, color: C.dim }}>→ {r.whom}</span>
          <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 11,
            color: C.dim }}>{r.moment}</span>
        </div>
        <div style={{ marginTop: 6 }}><Raw text={r.tuple}/></div>
        {r.answer && r.answer !== "unsent" &&
          <div style={{ marginTop: 4 }}><Raw text={r.answer}/></div>}
        {r.answer === "unsent" &&
          <Cap>did not send — recorded anyway, because what was tried is
            evidence too</Cap>}
      </Card>)}
  </div>;
}

// Nothing is re-exported.  A screen that wants a shared part imports
// it from gil_common, so there is one path to every definition and no
// question of which copy is current.
