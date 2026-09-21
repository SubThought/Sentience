import { useState, useEffect, useRef } from "react";

// The Competencies and Signals screens live in their own file: both
// read the KNOWLEDGE BASE rather than the message feed, and adding
// them here would mean editing three thousand lines for a change
// that is additive.
import { Competencies, Signals, Mapper, Learner } from "./gil_screens";

// ── what every screen shares ─────────────────────────────────────
//
// The palette, the parts and the plumbing live in gil_common, so a
// colour is defined once and a card is drawn one way.  The division
// is by WHAT A FILE IS: common holds the vocabulary, gil_screens the
// screens that read the knowledge base, and this file the screens
// that read the message record plus the shell that holds them all.
import {
  C, REALITY_COLOR, mono, LEX, AUTOGENOUS, relText,
  momentOf, M, nameOf,
  Card, Chip, Fold, H, Cap, Raw, Scroller, Mono,
  useFeed, frameSrc, FrameImage,
  sendTuple, kbQuery, watching,
} from "./gil_common";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════
//  GIL 1.0 Portal — sample dashboard, revision 2
//  Seven views over the Totality. Every number is a row the mind
//  acted on. Reifier integers are the identity; labels (Lexeme /
//  :L) are display sugar behind the monads|labels toggle.
//  Mock data simulates a live LS20 session.
// ═══════════════════════════════════════════════════════════════

// ── palette ───────────────────────────────────────────────────
//
// One hue throughout, keyed to `observed` (#0B5D52).  The surfaces
// were beige; every one moves to a teal of the SAME LIGHTNESS, so
// what changes is the hue and not the contrast — each piece of type
// keeps the legible relationship it had to the surface under it.
//
// The four REALITY colours are untouched.  They are the one place
// hue carries meaning rather than mood, and washing them toward teal
// would put Observed in competition with the furniture.
const MOCK_REGISTRATIONS = [
  { device:"Eidos", moment:"2026682580000000", token:"eidos-7f31",
    raw:"[REGISTER :Device Eidos :Type Psyche :Modality Eidos :Channels {Grid} :Needs {progress efficiency} :Actuations {reset action1 action2 action3 action4 action5 action6 action7} :Moment \\@m{2026682580000000} :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/registrar\"]",
    reply:"[REGISTERED :Token eidos-7f31 :Device Eidos :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
  { device:"Expanse", moment:"2026682580000012", token:"expanse-c204",
    raw:"[REGISTER :Device Expanse :Type Psyche :Modality Expanse :Channels {Visual Auditory Haptic Proprioceptive Spatial Communication System} :Needs {power thermal balance safety connectivity} :Actuations {walk turn stop stand sit crouch navigate look grasp release point wave nod shake-head speak emote display set-led joint-move pose-move set-stiffness capture-photo e-stop} :Moment \\@m{2026682580000012} :From \"locus://sol.earth.orb.local.host/mind/expanse\" :Whom \"locus://sol.earth.orb.local.host/mind/registrar\"]",
    reply:"[REGISTERED :Token expanse-c204 :Device Expanse :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/expanse\"]" },
];

const PSYCHES = [
  { device:"Eidos", channels:["Grid"], needs:["progress","efficiency"],
    token:"eidos-7f31", since:12, view:"allocentric (settled 5:0)",
    acts:[["reset",1],["action1",1],["action2",1],["action3",1],["action4",1],["action5",1],["action6",0],["action7",1]] },
  { device:"Expanse", channels:["Visual","Auditory","Haptic","Proprioceptive","Spatial","Communication","System"],
    needs:["power","thermal","balance","safety","connectivity"],
    token:"expanse-c204", since:12, view:"undefined (ego 2 · allo 0)",
    acts:[["walk",1],["turn",1],["stop",1],["look",1],["grasp",0],["speak",1],["e-stop",1]] },
];

const MOCK_TUPLES = [
  { kind:"PERCEPT", m:1000917, moment:"2026682585181880",
    raw:"[PERCEPT :Modality Eidos :Channel Grid :Address \"https://three.arcprize.org\" :Data grid-state :Content {:GameId \"ls20\" :Level 2 :Width 64 :Height 64 :Format raw :Grid {...4096 ints...} :State playing :LevelsCompleted 1 :TotalLevels 5 :ActionsUsed 41 :HumanActions 8 :AvailableActions {RESET ACTION1 ACTION2 ACTION3 ACTION4 ACTION5 ACTION7}} :Moment \\@m{2026682585181880} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"PERCEPT", m:1000918, moment:"2026682585181902",
    raw:"[PERCEPT :Modality Eidos :Channel Grid :Address \"https://three.arcprize.org\" :Data grid-state :Content {:GameId \"ls20\" :Level 2 :Width 64 :Height 64 :Format raw :Grid {...4096 ints...} :State playing :LevelsCompleted 1 :TotalLevels 5 :ActionsUsed 41 :HumanActions 8 :View allocentric :AvailableActions {RESET ACTION1 ACTION2 ACTION3 ACTION4 ACTION5 ACTION7}} :Moment \\@m{2026682585181902} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"RESULT", m:1000916, moment:"2026682585173120",
    raw:"[RESULT :Action action3 :Status succeeded :Moment \\@m{2026682585173120} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"PERCEPT", m:1000903, moment:"2026682585096640",
    raw:"[PERCEPT :Modality Expanse :Channel Proprioceptive :Data joint-state :Content {:Joints {{:Name \"LKneePitch\" :Position 0.8 :Velocity 0.0 :Effort 3.1} ...25 joints...} :Unit \"rad\"} :Moment \\@m{2026682585096640} :Token expanse-c204 :From \"locus://sol.earth.orb.local.host/mind/expanse\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"URGE", m:1000901, moment:"2026682584820377",
    raw:"[URGE :Need efficiency :Source Grid :Delta 5.1 :Moment \\@m{2026682584820377} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"PERCEPT", m:1000899, moment:"2026682584820401",
    raw:"[PERCEPT :Modality Eidos :Channel Grid :Address \"https://three.arcprize.org\" :Data grid-state :Content {:GameId \"ls20\" :Level 2 :State playing :LevelsCompleted 1 :ActionsUsed 40 :HumanActions 8 ...} :Moment \\@m{2026682584820401} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"RESULT", m:1000898, moment:"2026682584508933",
    raw:"[RESULT :Action action1 :Status succeeded :Moment \\@m{2026682584508933} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"URGE", m:1000880, moment:"2026682583066208",
    raw:"[URGE :Need power :Source Proprioceptive :Delta 0.87 :Moment \\@m{2026682583066208} :Token expanse-c204 :From \"locus://sol.earth.orb.local.host/mind/expanse\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
  { kind:"PERCEPT", m:1000864, moment:"2026682581604800",
    raw:"[PERCEPT :Modality Eidos :Channel Grid :Data game-event :Content {:State win :LevelsCompleted 1 :TotalLevels 5} :Moment \\@m{2026682581604800} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind/eidos\" :Whom \"locus://sol.earth.orb.local.host/mind/perceiver\"]" },
];

// ── LS20 "Locksmith" boards ──────────────────────────────────
// The captured LS20 board, taken from Figure 3 of the mGIL paper:
// the frame was quantised back to its 64x64 grid and run-length
// encoded, so what renders is the board the mind actually saw.
// Drop in another frame by encoding it the same way.

const ARC_PAL = { 0:"#2b2b2b", 5:"#8c8c8c", 4:"#e6be28", 1:"#2878e1",
                  7:"#f08c28", 9:"#f0f0f0", 2:"#c8322d", 8:"#0f0f0f" };

const LS20_L2_RLE = "64:0|64:0|64:0|64:0|64:0|64:0|16:0,37:5,11:0|16:0,37:5,11:0|16:0,37:5,11:0|16:0,37:5,11:0|16:0,37:5,11:0|5:0,48:5,11:0|5:0,48:5,11:0|5:0,48:5,11:0|5:0,48:5,11:0|5:0,48:5,11:0|5:0,16:5,6:0,10:5,6:0,10:5,11:0|5:0,7:5,3:4,6:5,6:0,10:5,6:0,10:5,11:0|5:0,7:5,1:4,1:5,1:4,6:5,6:0,10:5,6:0,10:5,11:0|5:0,7:5,3:4,6:5,6:0,10:5,6:0,10:5,11:0|5:0,16:5,6:0,10:5,6:0,10:5,11:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|5:0,16:5,6:0,10:5,11:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,11:5,5:0|11:0,5:5,16:0,10:5,6:0,5:5,11:0|11:0,5:5,16:0,10:5,6:0,5:5,11:0|11:0,5:5,16:0,10:5,6:0,5:5,11:0|11:0,5:5,16:0,10:5,6:0,5:5,11:0|11:0,5:5,16:0,10:5,6:0,5:5,11:0|11:0,5:5,16:0,5:5,11:0,5:5,11:0|11:0,5:5,11:0,10:5,11:0,5:5,11:0|11:0,5:5,11:0,10:5,11:0,5:5,11:0|11:0,5:5,11:0,10:5,11:0,5:5,11:0|9:0,9:5,9:0,10:5,11:0,5:5,11:0|10:0,7:8,1:5,9:0,10:5,11:0,11:5,5:0|10:0,7:8,1:5,9:0,5:7,5:5,6:0,16:5,5:0|10:0,2:8,3:1,2:8,1:5,9:0,5:7,5:5,6:0,16:5,5:0|10:0,2:8,1:1,4:8,1:5,9:0,5:1,5:5,6:0,16:5,5:0|10:0,2:8,1:1,1:8,1:1,2:8,1:5,9:0,5:1,5:5,6:0,16:5,5:0|10:0,7:8,1:5,9:0,5:1,5:5,6:0,16:5,5:0|10:0,7:8,1:5,25:0,16:5,5:0|9:0,9:5,25:0,7:5,1:9,8:5,5:0|43:0,6:5,3:9,7:5,5:0|43:0,7:5,1:9,8:5,5:0|43:0,16:5,5:0|37:0,22:5,5:0|37:0,1:5,3:4,18:5,5:0|37:0,1:5,4:4,17:5,5:0|37:0,1:5,4:4,17:5,5:0|7:8,30:0,1:5,3:4,18:5,5:0|7:8,30:0,22:5,5:0|5:1,2:8,57:0|5:1,2:8,57:0|3:8,2:1,2:8,57:0|3:8,2:1,2:8,57:0|1:1,2:8,2:1,2:8,57:0";

// rle -> one rect per run, so a 64x64 board costs a few hundred nodes
function rleToRects(rle){
  const out = [];
  rle.split("|").forEach((row, y) => {
    let x = 0;
    row.split(",").forEach(run => {
      const [n, c] = run.split(":").map(Number);
      if(c !== 0) out.push({x, y, w:n, h:1, c:ARC_PAL[c] || "#2b2b2b",
                            mover: c === 7 || c === 1});
      x += n;
    });
  });
  return out;
}

const LS20_BOARD = rleToRects(LS20_L2_RLE);

const DETECTIONS = [
  // the captured LS20 board, as delivered on each grid-state percept
  { frame:1000917, level:1, moment:"2026682585181880",
    traits:[210407,210411,210590,211004,211017,211406,212230,212381,213003,213558,214027],
    objects: LS20_BOARD },
  { frame:1000918, level:2, moment:"2026682585181902",
    traits:[212877,212881,213340,214112],
    objects: LS20_BOARD },
  { frame:1000899, level:1, moment:"2026682584820401",
    traits:[210407,210411,210590,211004,211017,211406,212230,213003,213558,214027],
    objects: LS20_BOARD },
];

// Associative memory.  (relation Case :Case :R :Content :Traits)
// (relation Trait :Trait :R :Case) — the inverted index: one row per
// (trait, case), so a probe narrows to the cases sharing a trait.
const CASES = [
  { case_:100411, r:"Percept", content:100411, count:27, moment:"2026682585181880",
    traits:[210407,210411,210590,211004,211017,211406,212230,212381,213003,213558,214027] },
  { case_:100407, r:"Percept", content:100407, count:19, moment:"2026682584820401",
    traits:[210407,210411,210590,211004,211017,211406,212230,213003,213558,214027] },
  { case_:100563, r:"Percept", content:1000918, count:1, moment:"2026682585181902",
    traits:[212877,212881,213340,214112] },
  { case_:100238, r:"Percept", content:100238, count:112, moment:"2026682585096640",
    traits:[230101,230102,230103,230104,230105,230106,230107,230108] },
  { case_:100302, r:"Event",   content:260518, count:9, moment:"2026682585173120",
    traits:[100199,261044,220314,260518,214600] },
  { case_:100488, r:"Taxis",   content:270311, count:6, moment:"2026682584820377",
    traits:[260231,260242,260255] },
  { case_:100122, r:"Percept", content:100122, count:31, moment:"2026682581604800",
    traits:[219001,219004,219009] },
  { case_:100561, r:"Percept", content:1000871, count:1, moment:"2026682584508933",
    traits:[240311,240312,240315,240320,240322] },
];

const TRACES = [
  { m:1000917, data:"grid-state", relation:"Percept", outcome:"recalled", score:0.94,
    case_:100411, content:100411, count:27, moment:"2026682585181880",
    probe:[210407,210411,210590,211004,211017,211406,212230,212381,213003,213558,214027] },
  { m:1000918, data:"grid-delta", relation:"Percept", outcome:"created", score:0,
    case_:100563, content:1000918, count:1, moment:"2026682585181902",
    probe:[212877,212881,213340,214112] },
  { m:1000916, data:"action3",    relation:"Event",   outcome:"recalled", score:1.0,
    case_:100302, content:260518, count:9, moment:"2026682585173120",
    probe:[100199,261044,220314,260518,214600] },
  { m:1000903, data:"joint-state",relation:"Percept", outcome:"recalled", score:1.0,
    case_:100238, content:100238, count:112, moment:"2026682585096640",
    probe:[230101,230102,230103,230104,230105,230106,230107,230108] },
  { m:1000899, data:"grid-state", relation:"Percept", outcome:"recalled", score:0.88,
    case_:100407, content:100407, count:19, moment:"2026682584820401",
    probe:[210407,210411,210590,211004,211017,211406,212230,213003,213558,214027] },
  { m:270311,  data:"taxis",      relation:"Taxis",   outcome:"recalled", score:1.0,
    case_:100488, content:270311, count:6, moment:"2026682584820377",
    probe:[260231,260242,260255] },
  { m:1000871, data:"odometry",   relation:"Percept", outcome:"created", score:0,
    case_:100561, content:1000871, count:1, moment:"2026682584508933",
    probe:[240311,240312,240315,240320,240322] },
  { m:1000864, data:"game-event", relation:"Percept", outcome:"recalled", score:1.0,
    case_:100122, content:100122, count:31, moment:"2026682581604800",
    probe:[219001,219004,219009] },
];

// Ontology: schemes with afferents (:A) and efferents (:E)
const SCHEMES = [
  // tier is the Glue :Z heterarchy level (percept 1 … operation 9)
  { m:1000917, r:"Percept",    rNum:200200, tier:1, a:[], e:[210411,213558,214027], note:"grid-state" },
  { m:1000899, r:"Percept",    rNum:200200, tier:1, a:[], e:[210411,213558], note:"grid-state" },
  { m:210411,  r:"Feature",    rNum:200000, tier:2, a:[1000917,1000899], e:[260231], note:"region-9" },
  { m:213558,  r:"Feature",    rNum:200000, tier:2, a:[1000917,1000899], e:[260242], note:"region-14" },
  { m:214027,  r:"Feature",    rNum:200000, tier:2, a:[1000917], e:[260255], note:"cluster token" },
  { m:260231,  r:"Entity",     rNum:260200, tier:3, a:[210411], e:[100411,261044], note:"the piece" },
  { m:260242,  r:"Entity",     rNum:260200, tier:3, a:[213558], e:[100411], note:"the plate" },
  { m:260255,  r:"Entity",     rNum:260200, tier:3, a:[214027], e:[261058], note:"the cross" },
  { m:100411,  r:"Place",      rNum:220300, tier:4, a:[260231,260242], e:[261044,261058], note:":Signature (movers)" },
  { m:220314,  r:"Venue",      rNum:220100, tier:4, a:[1000917,1000899], e:[220317], note:":Scenes → :Locale" },
  { m:220317,  r:"Locale",     rNum:220200, tier:4, a:[220314], e:[], note:"apex — chamber-portal" },
  { m:260518,  r:"Event",      rNum:260500, tier:5, a:[261044], e:[810144], note:"progress" },
  { m:261044,  r:"Action",     rNum:261000, tier:7, a:[100411,260231], e:[260518], note:":Context ∪ :Goals → :Result" },
  { m:261058,  r:"Action",     rNum:261000, tier:7, a:[100411,260255], e:[], note:"empty :Result — frontier" },
  { m:1000740, r:"adopts",     rNum:1000733, tier:7, a:[260255,260242], e:[214027], note:"self-created relation" },
  { m:810144,  r:"Causes",     rNum:810100, tier:8, a:[260518], e:[812403], note:"empty :Premise — the open question" },
  { m:812403,  r:"Prediction", rNum:812400, tier:9, a:[810144], e:[], note:"apex — deadline pending" },
];

// Activation cube points
const ACTIVATION = [
  { m:1000917, x:0.6,y:-0.4,z:1, r:{Observed:2}, f:1.0 },
  { m:210411,  x:-0.7,y:0.2,z:2, r:{Observed:1}, f:0.9 },
  { m:213558,  x:0.1,y:0.8,z:2, r:{Observed:1}, f:0.8 },
  { m:260231,  x:-0.3,y:-0.6,z:3, r:{Observed:1}, f:0.7 },
  { m:100411,  x:0.4,y:0.5,z:4, r:{Observed:2,Expected:1}, f:1.0 },
  { m:220314,  x:-0.5,y:0.6,z:4, r:{Observed:1}, f:0.9 },
  { m:261044,  x:0.2,y:-0.2,z:7, r:{Desired:3,Imagined:1}, f:1.0 },
  { m:261051,  x:0.7,y:0.3,z:7, r:{Desired:1}, f:0.6 },
  { m:261058,  x:-0.2,y:0.4,z:7, r:{Desired:1}, f:0.5, imp:true },
  { m:812403,  x:0.0,y:0.0,z:9, r:{Expected:1}, f:0.9 },
  { m:-261044, x:0.25,y:-0.15,z:7, r:{Observed:1}, f:0.4 },
  { m:810144,  x:-0.6,y:-0.3,z:8, r:{Imagined:1}, f:0.8 },
  { m:260518,  x:-0.1,y:0.7,z:5, r:{Observed:1,Expected:1,Desired:1}, f:1.0 },
];

// Imagination — the active Canvas, its shelves, staging pipeline, the edit
// ── Figment geometry, as staged from perception ──────────────
// A Mesh carries vertices + triangle faces; a Cloud carries points.
// Eidos regions are lifted from the 64x64 plane: grid (x,y) ->
// world (x-32)/8, height, (y-32)/8.  The plate is a flat slab, the
// piece a raised block, the cross a point cloud sampled from its cells.

// ── Staging the captured board ───────────────────────────────
// The imagination rebuilds the percept in 3D, allocentric: the grid
// plane is the floor, every run of the captured frame becomes a slab,
// and its height is what the colour means — floor flat, walls raised,
// fixtures proud of the floor. A Mesh carries vertices and triangle
// faces; a Cloud carries points.
//
//    grid (x,y) -> world ((x-32)/8, height, (y-32)/8)

const LIFT = { "#8c8c8c":0.06, "#2b2b2b":0.00, "#e6be28":0.34,
               "#2878e1":0.30, "#f08c28":0.44, "#f0f0f0":0.26,
               "#c8322d":0.22, "#0f0f0f":0.02 };

function slab(x, y, w, d, h0, h1){          // vertices + faces of a slab
  const x0=(x-32)/8, x1=(x+w-32)/8, z0=(y-32)/8, z1=(y+d-32)/8;
  const v = [[x0,h0,z0],[x1,h0,z0],[x1,h0,z1],[x0,h0,z1],
             [x0,h1,z0],[x1,h1,z0],[x1,h1,z1],[x0,h1,z1]];
  const f = [[4,5,6],[4,6,7],[0,2,1],[0,3,2],[0,1,5],[0,5,4],
             [1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
  return {v,f};
}

// one Figment per colour in the frame: its Meshes are that colour's runs
function figmentsFromBoard(rects){
  const byColour: any = {};
  rects.forEach(r => { (byColour[r.c] = byColour[r.c] || []).push(r); });
  const figs = [], geo = {};
  let fid = 270312, pid = 270501;
  Object.entries(byColour).forEach(([colour, runs]: [string, any]) => {
    const h = LIFT[colour] !== undefined ? LIFT[colour] : 0.12;
    const parts = [];
    runs.forEach((r: any) => {
      geo[pid] = { kind:"mesh", data: slab(r.x, r.y, r.w, r.h, 0, h) };
      parts.push(pid++);
    });
    figs.push({ f:fid++, src:260231, kind:"mesh", parts, color:colour,
                note:`${runs.length} slab${runs.length>1?"s":""} · lift ${h}` });
  });
  return {figs, geo};
}

const STAGED = figmentsFromBoard(LS20_BOARD);
const GEOMETRY = STAGED.geo;

const CANVASES = {
  270400: {
    m:270400, venue:220314, active:true,
    // one Figment per colour of the captured frame, staged as slabs
    figments: STAGED.figs,
    taxeis:[270311,270305],
    shots:[270402,270403,270404],
    taxis:{ m:270311, method:"Show",
      affects:[STAGED.figs[STAGED.figs.length-1].f], scene:1000917,
      items: STAGED.figs.map((fg,i) => ({f:fg.f, x:8+i*8, y:20, c:fg.color})) },
  },
  270420: {
    m:270420, venue:220311, active:false,
    figments:[
      ...STAGED.figs.slice(0, 2),
    ],
    taxeis:[270340],
    shots:[270430],
    taxis:{ m:270340, method:"Show", affects:[STAGED.figs[0].f], scene:1000842,
      items: STAGED.figs.slice(0,2).map((fg,i) => ({f:fg.f, x:18+i*8, y:40, c:fg.color})) },
  },
};
const ACTIVE_CANVAS = 270400;

// Taxeis — the arrangements (sets) on the canvases
const TAXEIS = {
  270311: { m:270311, canvas:270400, method:"Show", affects:[270318], scene:1000917,
    items:[{f:270312,x:31,y:22,c:"#4a7fd4"},{f:270313,x:33,y:22,c:"#d47f3a"},{f:270318,x:44,y:37,c:"#caa53d"}] },
  270305: { m:270305, canvas:270400, method:"Hide", affects:[270313], scene:1000899,
    items:[{f:270312,x:30,y:22,c:"#4a7fd4"},{f:270313,x:33,y:22,c:"#d47f3a"}] },
  270340: { m:270340, canvas:270420, method:"Show", affects:[270336], scene:1000842,
    items:[{f:270331,x:18,y:40,c:"#4a7fd4"},{f:270336,x:24,y:46,c:"#3a66b0"}] },
};

// Vantages — one shot each: which Taxis was viewed, from where, when
const VANTAGES = {
  270402: { m:270402, taxis:270305, canvas:270400, when:"2026682581604800",
            eye:[0,5,0], target:[0,0,0], fov:60 },
  270403: { m:270403, taxis:270311, canvas:270400, when:"2026682584820401",
            eye:[0,5,0], target:[0,0,0], fov:60 },
  270404: { m:270404, taxis:270311, canvas:270400, when:"2026682585181880",
            eye:[0.4,4.6,1.2], target:[0.1,0,0.2], fov:60 },
  270430: { m:270430, taxis:270340, canvas:270420, when:"2026682583066208",
            eye:[0,5,0], target:[0,0,0], fov:60 },
  270405: { m:270405, taxis:270311, canvas:270400, when:"2026682585096640",
            eye:[0,5,0], target:[0,0,0], fov:60, imagined:true },
  270406: { m:270406, taxis:270305, canvas:270400, when:"2026682585103415",
            eye:[0.2,4.8,0.6], target:[0,0,0], fov:60, imagined:true },
};

// Animations — "movies".  One structure, three origins, discriminated
// by :Source (imaginative.memory):
//    Percept / Scene / Venue -> vidolon    — video (perceived)
//    Action  / Objective      -> simulation — dream (imagined)
//    Story                    -> literary   — told (narrated; absent in GIL)
// A vidolon is sourced from the Percept it was staged from; the
// Imaginer rehearses with the Action as the Taxis :Telon in Imagined.
const SOURCE_KIND = {
  Percept:  {kind:"video", term:"vidolon"},
  Scene:    {kind:"video", term:"vidolon"},
  Action:   {kind:"dream", term:"simulation"},
  Objective:{kind:"dream", term:"simulation"},
  Trial:    {kind:"dream", term:"simulation"},
  Story:    {kind:"story", term:"literary"},
  Narrative:{kind:"story", term:"literary"},
  Episode:  {kind:"story", term:"literary"},
};
const KIND_TINT = { video:C.observed, dream:C.imagined, story:C.desired };

const MOVIES = {
  270450: { m:270450, source:1000917, sourceRel:"Percept", canvas:270400,
    shots:[270402,270403,270404], start:"2026682581604800", current:2,
    until:"2026682585181880", units:"moment", rate:30, speed:1.0, loop:"Once",
    reality:"Observed" },
  270460: { m:270460, source:261044, sourceRel:"Action", canvas:270400,
    shots:[270405,270406], start:"2026682585096640", current:1,
    until:"2026682585103415", units:"moment", rate:30, speed:1.0, loop:"Once",
    reality:"Imagined" },
  270480: { m:270480, source:260601, sourceRel:"Story", canvas:270400,
    shots:[270403,270404,270405], start:"2026682581604800", current:0,
    until:"2026682585103415", units:"moment", rate:30, speed:0.5, loop:"Once",
    reality:"Recalled" },
  270470: { m:270470, source:1000842, sourceRel:"Percept", canvas:270420,
    shots:[270430], start:"2026682583066208", current:0,
    until:"2026682583066208", units:"moment", rate:30, speed:1.0, loop:"Once",
    reality:"Observed" },
};

// Stories — the literary source of a told animation
const STORIES = {
  260601: { m:260601, r:"Story",
    text:"[Story :M 260601 :Arc Quest :Roles {260231 260242 260255} " +
         ":Episodes {260610 260611 260612} :Struggle Approach " +
         ":Theme 811901 :Moral nil]" },
};

// Venues, for the venue box
const VENUES = {
  220314: { m:220314, canvas:270400, scenes:[1000917,1000899], locale:220317 },
  220311: { m:220311, canvas:270420, scenes:[1000842], locale:220317 },
};

const STAGINGS = [
  { staging:5901, taxis:270311, scene:1000917, tier:"1 · reuse (adopted @1.0)",
    steps:[["Locator","done"],["SetDesigner","done"],["Casting","skip"],
           ["StageManager","done"],["Cinematographer","done"],["Choreographer","pending"]] },
  { staging:5899, taxis:270305, scene:1000899, tier:"3 · construct",
    steps:[["Locator","done"],["SetDesigner","done"],["Casting","done"],
           ["StageManager","done"],["Cinematographer","done"],["Choreographer","done"]] },
];
const EDIT = [ // the venue's open Animation :Shots
  { shot:270402, when:"2026682581604800" }, { shot:270403, when:"2026682584820401" }, { shot:270404, when:"2026682585181880" },
];
const ROUTES = [
  { route:270290, level:"Locale", dest:220317, cursor:2, tries:1,
    waypoints:[220311,220314,220317] },
];

// The agenda — the objective queue.  Each row is an AGENDUM;
// (relation Agendum :Telon :Priority :Urgency :Exec :Plan :For :By
// :Since).  :Priority is the Prioritizer's cognitive
// assessment, :Urgency the Ameliorator's homeostatic sync; score = urgency
// alone once it crosses the Coping emergency threshold, else priority+urgency.
const EMERGENCY = 0.8;
const AGENDA = [
  { telon:260518, priority:0, urgency:0,    exec:"idle", plan:"sent", for_:"Life",
    by:"infinity", since:"2026682581604800", note:"progress on level 2",
    attempts:[5911,5910,5906] },
  { telon:-230406, priority:0, urgency:0.87, exec:"idle", plan:"busy", for_:"Life",
    by:"infinity", since:"2026682583066208", note:"dyad of the power Need — battery 13%",
    attempts:[5907] },
  { telon:220317, priority:1, urgency:0,    exec:"idle", plan:"todo", for_:"Life",
    by:"2026682586000000", since:"2026682584508933", note:"reach chamber-portal",
    attempts:[] },
  { telon:214027, priority:2, urgency:0,    exec:"wait", plan:"todo", for_:"Life",
    by:"infinity", since:"2026682584820377", note:"sub-objective — cross token showing",
    attempts:[] },
  { telon:810144, priority:1, urgency:0,    exec:"idle", plan:"todo", for_:"Life",
    by:"infinity", since:"2026682584820401", note:"discover what causes the enablement",
    attempts:[] },
  { telon:-230411, priority:0, urgency:0.31, exec:"idle", plan:"fail", for_:"Life",
    by:"infinity", since:"2026682582100440", note:"dyad of the efficiency Need",
    attempts:[5908] },
];

// ATTEMPT tuples dispatched by the Executor, and the Attempt row it minted:
//   (relation Attempt :Trial :Telon :Act :Exec :When)
//   [ATTEMPT :Act a :Parameters {…} :By m :Token t]
const MOCK_ATTEMPTS = [
  { m:5911, trial:270601, telon:260518, act:261044, exec:"Done", device:"Eidos",
    url:"locus://sol.earth.orb.local.host/mind/eidos",
    when:"2026682585181880", basis:"Kace",
    raw:"[ATTEMPT :Act action3 :Parameters {} :By \\@m{2026682585181880} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
  { m:5910, trial:270598, telon:260518, act:261051, exec:"Fail", device:"Eidos",
    url:"locus://sol.earth.orb.local.host/mind/eidos",
    when:"2026682584820401", basis:"Explorer",
    raw:"[ATTEMPT :Act action1 :Parameters {} :By \\@m{2026682584820401} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
  { m:5909, trial:270594, telon:260518, act:261040, exec:"Done", device:"Eidos",
    url:"locus://sol.earth.orb.local.host/mind/eidos",
    when:"2026682584508933", basis:"Navigator",
    raw:"[ATTEMPT :Act action4 :Parameters {} :By \\@m{2026682584508933} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
  { m:5908, trial:270590, telon:260518, act:261062, exec:"Warn", device:"Eidos",
    url:"locus://sol.earth.orb.local.host/mind/eidos",
    when:"2026682583066208", basis:"Reactor",
    raw:"[ATTEMPT :Act action6 :Parameters {:X 44 :Y 37} :By \\@m{2026682583066208} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
  { m:5907, trial:270585, telon:260530, act:261070, exec:"Sent", device:"Expanse",
    url:"locus://sol.earth.orb.local.host/mind/expanse",
    when:"2026682582100440", basis:"Ameliorator",
    raw:"[ATTEMPT :Act walk :Parameters {:Distance 0.4 :Unit \"m\"} :By \\@m{2026682582100440} :Token expanse-c204 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/expanse\"]" },
  { m:5906, trial:270580, telon:260518, act:261044, exec:"Wait", device:"Eidos",
    url:"locus://sol.earth.orb.local.host/mind/eidos",
    when:"2026682581604800", basis:"Kace",
    raw:"[ATTEMPT :Act action3 :Parameters {} :By \\@m{2026682581604800} :Token eidos-7f31 :From \"locus://sol.earth.orb.local.host/mind\" :Whom \"locus://sol.earth.orb.local.host/mind/eidos\"]" },
];


// ── Small pieces ──────────────────────────────────────────────

// ── camera memory ─────────────────────────────────────────────
//
// The shell renders ONE view at a time, so switching tabs UNMOUNTS the
// component — and a useRef initialised inline is recreated from its
// initial value on the way back.  Every orbit, pan and zoom was being
// thrown away on every tab switch.
//
// Holding the three camera states at module scope keeps them for the
// life of the page.  The refs below point AT these objects rather than
// copying them, so the animation loops mutate the stored state
// directly and nothing needs to be written back.

// ── NO IDLE MOTION ────────────────────────────────────────────
//
// The three scenes move ONLY when the user moves them.
//
// They previously carried a drift term, and it was broken twice over:
// it added a constant offset each frame instead of accumulating, so
// nothing actually turned, and the offset vanished on mousedown, which
// is what produced the jolt.  Fixing the accumulation made all three
// spin continuously — and that fought directly with remembering the
// camera across tab switches, since a view left alone would have
// drifted away from wherever it was set.
//
// A scene that moves on its own is also harder to read: a label you
// are looking at slides out from under the eye.

const HOME = {
  ontology:    {x:0, y:0, zoom:6.4, ox:0, oy:0, oz:0},
  activation:  {x:0, y:0, zoom:5.4, ox:0, oy:0, oz:0},
  imagination: {x:-1.02, y:0.0, zoom:7.4, ox:0, oy:0, oz:0},
};

const CAMERA = {
  ontology:    {...HOME.ontology,    drag:false, pan:false, px:0, py:0},
  activation:  {...HOME.activation,  drag:false, pan:false, px:0, py:0},
  imagination: {...HOME.imagination, drag:false, pan:false, px:0, py:0},
};

// reset returns to HOME, so the button and the opening view agree —
// they were two separate sets of numbers before, and drifted.
const goHome = (k, rot) => Object.assign(rot.current, HOME[k]);

// drag / px / py are TRANSIENT.  A view unmounted mid-drag would come
// back believing the mouse was still down, and the first mouse move
// would spin it.  Position and zoom persist; the gesture does not.
const restCamera = (k) => {
  const c = CAMERA[k];
  c.drag = false; c.pan = false; c.px = 0; c.py = 0;
  return c;
};

// ── Fold — a record card, collapsed to its summary line ───────
//
// COLLAPSED BY DEFAULT.  These views are lists of records and every
// one of them carries a verbatim premise underneath; expanded, four
// rows fill the screen.  The summary line is what you scan, and the
// premise is what you open when a line is worth reading.
//
// The head is forced to ONE LINE — nowrap and clipped — so a long
// premise or a wide chip set cannot silently make the collapsed
// state two rows tall and undo the point.
function pointColor(p){
  if(p.imp) return C.impeded;
  const keys = Object.keys(p.r);
  return keys.length > 1 ? C.multi : REALITY_COLOR[keys[0]];
}

// ── Registrar — the grant, composed ───────────────────────────
//
// THE MIRROR OF THE ATTEMPTS COMPOSER, and the direction inverts.
// There, test means the portal sends the REQUEST in the Executor's
// place.  Here it sends the RESPONSE in the Registrar's place — the
// REGISTER always comes from the device, because a device declares
// itself and cannot be declared for.
//
// So this composes the grant: the token that admits Eidos, and
// without which every attempt it sends is refused.

const DEFAULT_REGISTER =
  '[REGISTER :Device Eidos :Type Psyche :Modality Eidos\n' +
  '          :Address "tcp://127.0.0.1:4310/eidos"\n' +
  '          :Channels {ls20-9607e27b}\n' +
  '          :Needs {finish}\n' +
  '          :Actuations {reset action1 action2 action3\n' +
  '                       action4 action5 action6 action7}\n' +
  '          :Raster (idiom :W 1024 :H 1024)]';

function Registrar(){
  const [text, setText] = useState(DEFAULT_REGISTER);
  const [mode, setMode] = useState("test");
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState(null);
  const live = mode === "live";

  // A FRESH GUID, which is what the real Registrar mints.  Editable
  // too, because pinning a known token is what makes a demo
  // repeatable — the Attempts composer has to name the same one.
  const mint = () => {
    const g = "gil-" + Math.random().toString(16).slice(2, 10);
    setText(text.replace(/:Token\s+\S+/, ":Token " + g));
  };

  const send = async () => {
    setBusy(true); setSaid(null);
    try {
      const r = await fetch("/attempt", {
        method:"POST", headers:{"Content-Type":"text/plain"}, body:text,
      });
      const ct = r.headers.get("content-type") || "";
      if(!ct.includes("json")) {
        setSaid({ok:false, text:"the portal server is not answering — "
          + "is gil_serve.py running on 4390?"});
        setBusy(false); return;
      }
      const body = await r.json();
      setSaid({ok: body.label !== "REFUSED", text: body.reply});
    } catch(e) { setSaid({ok:false, text:String(e.message || e)}); }
    setBusy(false);
  };

  return <Card style={{background:C.composeBg, marginBottom:12,
      border:`1px solid #D9CFEC`}}>
    <div style={{display:"flex", gap:10, alignItems:"center"}}>
      <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.observed,
        borderRadius:4, padding:"1px 8px"}}>REGISTER</span>
      <span style={{fontSize:11, color:C.dim, marginLeft:"auto"}}>mode</span>
      <div style={{display:"flex", border:`1px solid ${C.rule}`,
          borderRadius:6, overflow:"hidden", width:110}}>
        {["test","live"].map(m => <div key={m} onClick={()=>setMode(m)}
          style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11,
            cursor:"pointer",
            background: m===mode ? (m==="live" ? C.impeded : C.observed) : C.card,
            color: m===mode ? "#fff" : C.dim,
            fontWeight: m===mode ? 700 : 400}}>{m}</div>)}
      </div>
      <button onClick={mint} disabled={live}
        style={{padding:"2px 10px", borderRadius:4, cursor:live?"default":"pointer",
          fontFamily:mono, fontSize:11, border:`1px solid ${C.rule}`,
          background:C.card, color:C.dim}}>mint</button>
    </div>
    <textarea value={text} onChange={e=>setText(e.target.value)}
      spellCheck={false} readOnly={live} rows={4}
      style={{width:"100%", marginTop:6, padding:"8px 10px", borderRadius:5,
        fontFamily:mono, fontSize:11.5, lineHeight:1.55, resize:"vertical",
        background:live?C.bg:"#FBFAFE", color:live?C.dim:C.ink, outline:"none",
        border:`1px solid ${C.rule}`, boxSizing:"border-box"}}/>
    <div style={{display:"flex", gap:10, alignItems:"center", marginTop:6}}>
      <button onClick={send} disabled={busy || live}
        title={live ? "Eidos registers itself — switch to test to send by hand" : ""}
        style={{padding:"4px 22px", borderRadius:5, fontFamily:mono, fontSize:13,
          fontWeight:700, cursor:(busy||live)?"default":"pointer",
          border:`1px solid ${(busy||live)?C.rule:C.observed}`,
          background:(busy||live)?C.card:C.faint,
          color:(busy||live)?C.dim:C.observed}}>
        {busy ? "sending" : "send"}</button>
      {said && <span style={{fontSize:12, color:said.ok?C.observed:C.impeded,
        fontFamily:mono}}>{said.text.slice(0,96)}</span>}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        {live ? "Eidos registers itself · the portal is watching"
              : "the Registrar answers with the token"}</span>
    </div>
  </Card>;
}

// ── View: Psyches ─────────────────────────────────────────────

function Psyches(){
  const REGISTRATIONS = useFeed("portal-psyches.json", MOCK_REGISTRATIONS);
  const byDevice = Object.fromEntries(PSYCHES.map(p => [p.device, p]));
  return <div>
    <H>Psyche registrations</H>
    <Registrar/>
    <Scroller height={840}>
      {REGISTRATIONS.map(r => {
        // THE FEED'S OWN FIGURES WIN.  A real registration carries its
        // channels, needs and actuations; falling back to the mock
        // would show a live token beside a fabricated repertoire,
        // which is the one thing an audit surface must not do.
        const p = (r.channels && r.acts)
          ? {channels:r.channels, needs:r.needs || [], acts:r.acts,
             view:r.view || "undetermined"}
          : byDevice[r.device];
        return <Fold key={r.device} style={{background:C.psycheBg}}
          head={<>
            <b>{r.device}</b>
            {/* THE SPACE HAS TO BE EXPLICIT.  JSX collapses the
                newline between the text and the element, so "token"
                and the value ran together as tokeneidos-7f31. */}
            <span style={{color:C.dim, fontSize:12}}>token{" "}
              <Mono v={r.token} color={C.observed}/></span>
            <span style={{color:C.dim, fontSize:12}}>
              {p ? `${p.channels.length} ch · ${p.needs.length} needs · ${p.acts.length} acts` : ""}</span>
            <span style={{color:C.dim, fontSize:12, marginLeft:"auto"}}>{M(r.moment)}</span>
          </>}>
          <div style={{display:"flex", gap:8, alignItems:"baseline"}}>
            <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.expected,
              borderRadius:4, padding:"1px 8px"}}>request</span>
            <span style={{fontSize:11, color:C.dim}}>Psyche → Registrar</span>
          </div>
          <Raw text={r.raw}/>

          <div style={{display:"flex", gap:8, alignItems:"baseline", marginTop:8}}>
            <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.observed,
              borderRadius:4, padding:"1px 8px"}}>response</span>
            <span style={{fontSize:11, color:C.dim}}>Registrar → Psyche</span>
          </div>
          <Raw text={r.reply}/>

          {p && <div style={{marginTop:10, paddingTop:8, borderTop:`1px solid ${C.rule}`}}>
            <Cap>minted — channels, needs, and one Capability per act offered</Cap>
            <div style={{marginTop:4}}>
              {p.channels.map(c => <Chip key={c}>{c}</Chip>)}
              <span style={{color:C.rule, margin:"0 6px"}}>|</span>
              {p.needs.map(n => <Chip key={n} color={C.need} title="Need">{n}</Chip>)}
            </div>
            <div style={{marginTop:4}}>
              {p.acts.map(([a,on]) => <Chip key={a} color={on?C.faint:C.bg}
                ink={on?C.observed:C.dim}
                title={on?"Capability :Enabled yes":"not on offer right now"}>{a}</Chip>)}
            </div>
            <Cap>view: {p.view}</Cap>
          </div>}
        </Fold>;})}
    </Scroller>
    <Cap>Teal capability = on offer in the current frame · grey = declared but not available now.</Cap>
  </div>;
}

// ── View: Percepts — inbound tuples ───────────────────────────

const KIND_COLOR = { PERCEPT:C.observed, URGE:C.desired, RESULT:C.expected };

function Percepts(){
  const TUPLES = useFeed("portal-percepts.json", MOCK_TUPLES);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const kinds = ["ALL","PERCEPT","URGE","RESULT"];
  const MAX = 50;                       // the inbound list holds 50 at most

  // most recent first; the tail beyond MAX falls off the list
  const rows = TUPLES
    .filter(t => filter==="ALL" || t.kind===filter)
    .slice()
    .sort((a,b) => String(b.moment).localeCompare(String(a.moment)))
    .slice(0, MAX);

  const total = TUPLES.filter(t => filter==="ALL" || t.kind===filter).length;

  return <div>
    <H>Datasets received</H>
    <div style={{display:"flex", alignItems:"center", gap:6, margin:"8px 0"}}>
      {kinds.map(k => <button key={k} onClick={()=>setFilter(k)}
        style={{padding:"3px 12px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          border:`1px solid ${k===filter?(KIND_COLOR[k]||C.ink):C.rule}`,
          background:k===filter?C.faint:C.card,
          color:k===filter?(KIND_COLOR[k]||C.ink):C.dim, fontSize:12}}>{k}</button>)}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        newest first · showing {rows.length} of {total} · list holds {MAX}</span>
    </div>
    {/* visual percepts render above the list, full width */}
    {(() => {
      // A PERCEPT IS VISUAL IF IT HAS AN ADDRESS.  That is the whole
      // test — the address names a PNG, and the PNG is the artefact.
      // (The mock rows have no address, so they fall back to matching
      // DETECTIONS and the screen still works with nothing attached.)
      const visuals = rows.filter(t =>
        t.address || DETECTIONS.some(f => f.frame === t.m));
      if(visuals.length === 0) return null;

      // Clicking a row selects it; several percepts can be queued and
      // each shows its own frame.  With nothing selected, the newest.
      const visual = visuals.find(t => t.m === selected) || visuals[0];
      const frame = DETECTIONS.find(f => f.frame === visual.m)
        || DETECTIONS[0];
      return <Fold style={{background:C.psycheBg}}
        head={<>
          {/* PERCEPT, not VISUAL.  The tuple's kind is PERCEPT — the
              board is how this one is RENDERED, not what it is, and
              labelling the render made it look like a fifth kind
              alongside PERCEPT, URGE and RESULT. */}
          <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.observed,
            borderRadius:4, padding:"1px 8px"}}>PERCEPT</span>
          <Mono v={visual.m} color={C.observed}/>
          <span style={{fontSize:10, fontWeight:700, color:C.observed,
            border:`1px solid ${C.observed}`, borderRadius:4, padding:"0 6px"}}>visual</span>
          <span style={{fontSize:12, color:C.dim}}>
            {visual.channel || "ls20"}{frame ? ` · level ${frame.level}` : ""}</span>
          <span style={{fontSize:12, color:C.dim, marginLeft:"auto"}}>{M(visual.moment)}</span>
        </>}>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <button onClick={()=>navigator.clipboard &&
              navigator.clipboard.writeText(String(visual.m))}
            title="copy the percept monad"
            style={{padding:"2px 10px", borderRadius:4, cursor:"pointer", fontFamily:mono,
              fontSize:11, border:`1px solid ${C.rule}`, background:C.card,
              color:C.dim}}>copy</button>
          <span style={{fontSize:11, color:C.dim}}>captured frame</span>
        </div>
        {/* THE PNG AT THE ADDRESS when the percept has one.
            That file is the artefact — what Eidos produced and the
            detectors read — so the portal shows the evidence rather
            than re-rendering the same data and risking a second
            renderer that disagrees with the first.

            Without an address it falls back to the vector board, so
            the screen still works with no device attached. */}
        {visual.address
          ? <FrameImage address={visual.address}
              style={{width:"100%", aspectRatio:"1 / 1",
                maxHeight:"max(380px, 52vh)", background:ARC_PAL[0],
                border:`1px solid ${C.rule}`, marginTop:6}}/>
          : <svg viewBox="0 0 64 64" preserveAspectRatio="xMidYMid meet"
              style={{width:"100%", aspectRatio:"1 / 1",
              maxHeight:"max(380px, 52vh)", background:ARC_PAL[0],
              border:`1px solid ${C.rule}`, marginTop:6}}>
              {frame.objects.map((o,k) => <rect key={k} x={o.x} y={o.y}
                width={o.w} height={o.h} fill={o.c}
                stroke={o.mover?C.observed:"none"} strokeWidth={o.mover?0.6:0}/>)}
            </svg>}
      </Fold>;
    })()}

    {/* A RULE AND A CAPTION between the rendered percept above and the
        list below — they are two different things and the page gave no
        sign of where one ended. */}
    <div style={{borderTop:`1px solid ${C.rule}`, marginTop:14, paddingTop:8}}>
      <Cap>every tuple received, newest first</Cap>
    </div>
    <div style={{height:"min(46vh, 620px)", overflowY:"scroll", overflowX:"hidden",
        border:`1px solid ${C.rule}`, borderRadius:8, background:C.bg,
        padding:"2px 10px 10px", marginTop:4}}>
      {rows.length === 0
        ? <Cap>Nothing inbound of that kind yet.</Cap>
        : rows.map(t => <Fold key={t.m} onClick={()=>setSelected(t.m)}
            style={{cursor:"pointer",
              border:`1px solid ${t.m===selected?C.observed:C.rule}`,
              background:t.m===selected?"#F3F8F4":C.psycheBg}}
            head={<>
              <span style={{fontWeight:700, fontSize:11, color:"#fff", background:KIND_COLOR[t.kind],
                borderRadius:4, padding:"1px 8px"}}>{t.kind}</span>
              <Mono v={t.m} color={C.observed}/>
              {(t.address || DETECTIONS.some(f => f.frame === t.m)) &&
                <span style={{fontSize:10, fontWeight:700, color:C.observed,
                  border:`1px solid ${C.observed}`, borderRadius:4, padding:"0 6px"}}
                  title="click to show this frame above">visual</span>}
              <span style={{color:C.dim, fontSize:12, marginLeft:"auto"}}>{M(t.moment)}</span>
            </>}>
            <Raw text={t.raw}/>
          </Fold>)}
    </div>
  </div>;
}

// ── View: Detections ──────────────────────────────────────────

function Cases({casesProbe}){
  const [monadIn, setMonadIn]   = useState("");          // any monad (content)
  const [caseIn,  setCaseIn]    = useState("100411");    // a Case identifier
  const [traitsIn, setTraitsIn] = useState("");          // the probe trait set
  const [sortSlot, setSortSlot] = useState(":Score");
  const [sortAsc,  setSortAsc]  = useState(false);
  const [selectedCase, setSelectedCase] = useState("100411");

  const nums = (txt) => txt.split(/[^0-9-]+/).filter(Boolean).map(Number);

  // the traits box is the probe.  Find fills it from the monad or the
  // case — the same two ways matcher-find is called — then matches.
  const byCase    = CASES.find(c => String(c.case_) === caseIn.trim());
  const byMonad   = CASES.find(c => String(c.content) === monadIn.trim());
  const [probe, setProbe] = useState(CASES[0].traits);

  // a probe handed over from the Association screen
  useEffect(() => {
    if(!casesProbe) return;
    const next = casesProbe.probe || [];
    setProbe(next);
    setTraitsIn(next.join(" "));
    setCaseIn(casesProbe.case_ !== undefined ? String(casesProbe.case_) : "");
    setMonadIn(casesProbe.monad !== undefined ? String(casesProbe.monad) : "");
    if(casesProbe.case_ !== undefined) setSelectedCase(String(casesProbe.case_));
  }, [casesProbe]);

  // ── THE SEARCH GOES TO THE MIND ───────────────────────────────
  //
  // This is the one screen that needs a QUERY rather than a feed.  A
  // polled file carries current state; a search is a question about
  // something that may be in none of it — a Case among thousands.
  //
  // THE PROBE GOES THROUGH THE MATCHER, not through a comparison
  // written here.  The overlap arithmetic below scores with Jaccard,
  // and ~ is not Jaccard, so a search done locally would report
  // recalls the mind would never have made.  It stands as the
  // FIXTURE only — what the screen shows with nothing attached.
  //
  // THE BAR IS 1.0 UNLESS THE BOX SAYS OTHERWISE, because that is the
  // rule everywhere else: a probe that declares no bar asks for exact
  // identity.  A search screen quietly using someone else's threshold
  // would be the one place in the portal where the number on screen
  // meant something different from the number in the mind.
  const [bar, setBar] = useState("1.0");
  const [answer, setAnswer] = useState(null);   // the mind's MATCHes
  const [asking, setAsking] = useState(false);
  const [asked, setAsked] = useState(null);     // what went wrong, if anything

  const find = async () => {
    const typed = nums(traitsIn);
    const next = typed.length ? typed
               : byCase  ? byCase.traits
               : byMonad ? byMonad.traits : [];
    setProbe(next);
    setTraitsIn(next.join(" "));

    // A case id alone is a fetch, not a probe.
    const tuple = (!next.length && caseIn.trim())
      ? `[QUERY :Of Case :Case ${caseIn.trim()}]`
      : `[QUERY :Of Case :R (R Percept) :Traits {${next.join(" ")}} `
        + `:MinScore ${Number(bar) || 1.0} :Limit 10]`;

    setAsking(true); setAsked(null);
    try {
      const reply = await kbQuery(tuple);
      setAnswer(reply);
      // [ANSWER :Of Case :Matches {[MATCH :Case m :Score s] …}]
      const first = /:Case\s+(-?\d+)/.exec(String(reply).replace(/^\[ANSWER[^\]]*?:Matches/, ""));
      if(first) setSelectedCase(first[1]);
    } catch(e) {
      // THE MIND IS NOT ANSWERING, and saying so is worth more than
      // silently showing a local result that looks like its answer.
      setAnswer(null);
      setAsked(String(e.message || e));
      const best = next.length
        ? CASES.map(c => {
            const shared = c.traits.filter(x => next.includes(x));
            const union  = new Set([...c.traits, ...next]).size;
            return {c, score: union ? shared.length/union : 0, shared};
          }).filter(x => x.shared.length > 0)
            .sort((a,b) => b.score - a.score)[0]
        : null;
      if(best) setSelectedCase(String(best.c.case_));
    } finally {
      setAsking(false);
    }
  };

  // The MIND's matches when it answered; the fixture's when it did not.
  const mindMatches = (() => {
    if(!answer) return null;
    const out = [];
    const re = /\[MATCH\s+:Case\s+(-?\d+)\s+:Score\s+([\d.]+)\]/g;
    let m;
    while((m = re.exec(String(answer)))) out.push({case_:Number(m[1]), score:Number(m[2])});
    return out.length ? out : null;
  })();

  const BAR = Number(bar) || 1.0;
  const localMatches = probe.length
    ? CASES.map(c => {
        const shared = c.traits.filter(x => probe.includes(x));
        const union  = new Set([...c.traits, ...probe]).size;
        return {...c, shared, score: union ? shared.length/union : 0};
      }).filter(c => c.shared.length > 0)
    : [];

  const matches = mindMatches
    ? mindMatches.map(m => {
        const known = CASES.find(c => c.case_ === m.case_);
        return { case_:m.case_, score:m.score,
                 r: known ? known.r : "Percept",
                 content: known ? known.content : m.case_,
                 count: known ? known.count : 1,
                 traits: known ? known.traits : probe,
                 shared: known ? known.traits.filter(x => probe.includes(x)) : probe };
      })
    : localMatches;

  const ranked = matches.slice().sort((a,b) => {
    const v = sortSlot === ":Case" ? a.case_ - b.case_ : a.score - b.score;
    return sortAsc ? v : -v;
  });

  const sel = CASES.find(c => String(c.case_) === selectedCase.trim()) || null;
  const selScore = matches.find(c => c.case_ === (sel && sel.case_));

  // every trait mentioned by the probe or by any match, in one column
  const TR = Array.from(new Set([...probe, ...matches.flatMap(c => c.traits)]));
  const ROW = 30, TOP = 34, PANE = 430;
  const svgH = Math.max(TR.length * ROW, ranked.length * (ROW + 8)) + TOP + 16;

  const Field = ({label, value, onChange, width}) =>
    <div style={{display:"flex", flexDirection:"column", gap:2}}>
      <span style={{fontSize:12, color:C.dim}}>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)}
        style={{width, padding:"5px 8px", borderRadius:5, fontFamily:mono, fontSize:13,
          background:C.card, color:C.ink, outline:"none", border:`1px solid ${C.rule}`}}/>
    </div>;

  return <div style={{fontSize:15}}>
    <H>Cases</H>

    <div style={{display:"flex", gap:14, margin:"8px 0 10px", alignItems:"flex-end",
        flexWrap:"wrap"}}>
      <Field label="monad" value={monadIn} onChange={setMonadIn} width={140}/>
      <Field label="case"  value={caseIn}  onChange={setCaseIn}  width={140}/>
      <Field label="traits" value={traitsIn} onChange={setTraitsIn} width={380}/>
      <Field label="minscore" value={bar} onChange={setBar} width={70}/>
    </div>
    <div style={{display:"flex", gap:12, alignItems:"center", margin:"0 0 12px"}}>
      <button onClick={find} disabled={asking}
        style={{padding:"5px 22px", borderRadius:5, cursor:asking?"default":"pointer",
          fontFamily:mono, fontSize:13, fontWeight:700,
          border:`1px solid ${asking?C.rule:C.observed}`,
          background:asking?C.faint:C.faint, color:asking?C.dim:C.observed}}>
        {asking ? "asking…" : "Find"}</button>
      <button onClick={()=>{ setProbe([]); setTraitsIn(""); setAnswer(null); setAsked(null); }}
        style={{padding:"5px 14px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          fontSize:13, border:`1px solid ${C.rule}`, background:C.card, color:C.dim}}>clear</button>
      <span style={{fontSize:12, color:C.dim}}>
        probe of {probe.length} · {matches.length} candidate{matches.length!==1?"s":""}</span>

      {/* WHOSE ANSWER IS ON SCREEN.  The arithmetic here is Jaccard and
          the mind scores with ~, so which one produced these numbers
          is not a detail — it is the difference between what the mind
          would recall and what this page computed. */}
      <span style={{marginLeft:"auto", fontSize:11,
          color: mindMatches ? C.observed : C.desired}}>
        {mindMatches
          ? `the mind's answer · bar ${BAR}`
          : asked
            ? `fixture · ${asked}`
            : "fixture · not asked yet"}</span>
    </div>

    {asked && <Cap>
      The search did not reach the mind, so what follows is the fixture
      scored locally — and local scoring is Jaccard, which is not what
      the Matcher uses. Treat the numbers as illustrative.
    </Cap>}

    {/* ── the graph, full width: traits → matched cases ── */}
    {/* The WHOLE panel is beige — traits, the edges between them, and
        the cases.  Tinting only the traits column made the edge area
        read as a gap rather than as the space the match happens in. */}
    <Card style={{background:C.traitBg}}>
      <div style={{display:"flex", gap:0}}>
        {/* traits, with their own scrollbar on the left */}
        <div style={{maxHeight:PANE, overflowY:"auto", direction:"rtl",
            borderRight:`1px solid ${C.faint}`, flexShrink:0}}>
          <div style={{direction:"ltr", padding:"0 10px 0 4px"}}>
            <div style={{fontSize:13, fontWeight:700, padding:"6px 0"}}>Traits</div>
            {TR.map(tr => <div key={tr} style={{height:ROW-4, marginBottom:4, width:130,
                display:"flex", alignItems:"center", justifyContent:"center",
                border:`1px solid ${probe.includes(tr)?C.impeded:C.rule}`,
                borderRadius:4, background:C.card, fontSize:13,
                color:probe.includes(tr)?C.impeded:C.ink,
                fontWeight:probe.includes(tr)?700:400}}>{tr}</div>)}
          </div>
        </div>

        {/* the edges */}
        <div style={{flex:1, maxHeight:PANE, overflow:"hidden"}}>
          <svg viewBox={`0 0 400 ${svgH}`} preserveAspectRatio="none"
            style={{width:"100%", height:svgH>PANE?PANE:svgH}}>
            {ranked.map((c,j) => {
              const cy = TOP + j*(ROW+8) + ROW/2;
              return c.shared.map(tr => {
                const k = TR.indexOf(tr);
                if(k < 0) return null;
                return <line key={c.case_+"-"+tr} x1="0" y1={TOP + k*ROW + ROW/2 - 4}
                  x2="400" y2={cy} stroke={C.impeded} strokeWidth="1.1"
                  strokeDasharray="4 4" opacity={j===0?0.95:0.5}/>;});})}
          </svg>
        </div>

        {/* cases, with their own scrollbar on the right */}
        <div style={{maxHeight:PANE, overflowY:"auto",
            borderLeft:`1px solid ${C.faint}`, flexShrink:0}}>
          <div style={{padding:"0 4px 0 10px"}}>
            <div style={{fontSize:13, fontWeight:700, padding:"6px 0"}}>Cases</div>
            {ranked.map((c,j) => <div key={c.case_} onClick={()=>setSelectedCase(String(c.case_))}
              style={{height:ROW-4, marginBottom:12, width:190, cursor:"pointer",
                display:"flex", alignItems:"center", gap:10, padding:"0 10px",
                border:`1px solid ${String(c.case_)===selectedCase?C.observed:C.rule}`,
                borderRadius:4, fontSize:13,
                background:String(c.case_)===selectedCase?C.faint:C.card,
                fontWeight:String(c.case_)===selectedCase?700:400}}>
              <span>{c.case_}</span>
              <span style={{marginLeft:"auto", color:c.score>=BAR?C.observed:C.dim,
                fontSize:12}}>{c.score.toFixed(2)}</span>
            </div>)}
          </div>
        </div>
      </div>
    </Card>

    {/* ── the matches, sortable ── */}
    <div style={{display:"flex", gap:10, alignItems:"center", margin:"12px 0 6px"}}>
      <span style={{fontSize:13, fontWeight:700}}>Matches</span>
      <select value={sortSlot} onChange={e=>setSortSlot(e.target.value)}
        style={{padding:"4px 8px", borderRadius:5, fontFamily:mono, fontSize:13,
          background:C.card, color:C.ink, border:`1px solid ${C.rule}`}}>
        <option>:Score</option>
        <option>:Case</option>
      </select>
      <button onClick={()=>setSortAsc(a=>!a)}
        style={{padding:"4px 12px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          fontSize:13, border:`1px solid ${C.rule}`, background:C.card, color:C.ink}}>
        sort {sortAsc ? "▲" : "▼"}</button>
    </div>
    <div style={{height:190, overflowY:"scroll", border:`1px solid ${C.rule}`,
        borderRadius:6, background:C.card, padding:"6px 10px"}}>
      {ranked.length === 0
        ? <Cap>No candidate shares a trait with the probe.</Cap>
        : ranked.map(c => <div key={c.case_} onClick={()=>setSelectedCase(String(c.case_))}
            style={{padding:"3px 6px", cursor:"pointer", fontSize:13, borderRadius:4,
              background:String(c.case_)===selectedCase?C.faint:"transparent"}}>
            [MATCH :Case {c.case_} :Score {c.score.toFixed(2)}]
            <span style={{color:C.dim, fontSize:12}}> · {c.shared.length}/{c.traits.length} shared
              · {c.r}</span>
          </div>)}
    </div>

    {/* ── the selected case ── */}
    <div style={{display:"flex", gap:14, alignItems:"flex-end", margin:"12px 0 6px"}}>
      <Field label="selected case" value={selectedCase} onChange={setSelectedCase} width={160}/>
      {selScore && <span style={{fontSize:12, color:C.dim, paddingBottom:6}}>
        :Score {selScore.score.toFixed(2)} · {selScore.shared.length} shared traits</span>}
    </div>
    {sel
      ? <Raw text={`[Case :Case ${sel.case_} :R (R ${sel.r}) :Content ${sel.content}` +
          ` :Traits {${sel.traits.join(" ")}} :Count ${sel.count}` +
          ` :Moment \\@m{${sel.moment}}]`}/>
      : <Cap>No Case with that identifier.</Cap>}
  </div>;
}

// ── View: Association (probed traits → matched cases) ─────────

function Association({onOpenCases}){
  const [filter, setFilter] = useState("ALL");
  const MAX = 50;
  const kinds = ["ALL","created","recalled"];

  // THE REMINDING FEED, not the message record.
  //
  // A Reminding is what a probing mechanism looked for and what came
  // back — and EVERY probing mechanism writes one, not just the
  // Perceiver.  This screen shows the Perceiver's, which is what it
  // always showed; the Cases screen asks the general question.
  //
  // The rows arrive with `who` and `minscore`, which the mock never
  // carried: a score read later means nothing without the bar it was
  // judged against, and the bar is per mechanism.
  const FEED = useFeed("portal-remindings.json", TRACES);
  const src = (FEED || []).map(r => ({
    ...r,
    // the feed names the probe :Traits; the view has always called it
    // `probe`, and the mock constants are the contract
    probe: r.probe || r.traits || [],
    case_: r.case_ !== undefined ? r.case_ : r.case,
    data:  r.data || r.relation,
  }));

  const all = src.filter(t => filter==="ALL" || t.outcome===filter);
  const rows = all.slice().sort((a,b)=>String(b.moment).localeCompare(String(a.moment))).slice(0,MAX);
  const made = src.filter(t=>t.outcome==="created").length;

  return <div>
    <H>Recent Associations</H>
    <div style={{display:"flex", alignItems:"center", gap:6, margin:"8px 0"}}>
      {kinds.map(k => <button key={k} onClick={()=>setFilter(k)}
        style={{padding:"3px 12px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          border:`1px solid ${k===filter?(k==="created"?C.desired:k==="recalled"?C.observed:C.ink):C.rule}`,
          background:k===filter?C.faint:C.card,
          color:k===filter?(k==="created"?C.desired:k==="recalled"?C.observed:C.ink):C.dim,
          fontSize:12}}>{k}</button>)}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        newest first · showing {rows.length} of {all.length} · {made} created, {src.length-made} recalled</span>
    </div>
    <Scroller>
      {rows.length === 0
        ? <Cap>No probes of that kind yet.</Cap>
        : rows.map(t => {
            const made = t.outcome === "created";
            return <Fold key={t.m+"-"+t.moment}
              onDoubleClick={()=>onOpenCases && onOpenCases(
                {probe:t.probe, case_:t.case_, monad:t.m})}
              title="double-click to open this probe on the Cases screen"
              style={{cursor:"pointer", background:C.psycheBg}}
              head={<>
                <span style={{fontWeight:700, fontSize:11, color:"#fff",
                  background:made?C.desired:C.observed, borderRadius:4, padding:"1px 8px"}}>
                  {t.outcome.toUpperCase()}</span>
                <Mono v={t.m} color={C.observed}/>
                <Chip>{t.data}</Chip>
                <Chip color={C.need}>{t.relation}</Chip>
                <span style={{color:made?C.desired:C.expected, fontWeight:700, fontSize:12}}>
                  {made ? "new" : t.score.toFixed(2)}</span>
                <span style={{color:C.dim, fontSize:12, marginLeft:"auto"}}>{M(t.moment)}</span>
              </>}>
              <div style={{fontSize:12}}>
                <span style={{color:C.dim}}>probe · {t.probe.length} traits</span>
                <div style={{marginTop:2}}>
                  {t.probe.map(x => <Chip key={x} color={C.faint}><Mono v={x}/></Chip>)}
                </div>
              </div>

              <div style={{marginTop:6, display:"flex", gap:14, alignItems:"baseline",
                  flexWrap:"wrap", fontSize:12}}>
                <span style={{color:C.dim}}>
                  {made ? "minted case" : "matched case"} <Mono v={t.case_}/></span>
                <span style={{color:C.dim}}>content <Mono v={t.content}/></span>
                <span style={{color:C.dim}}>×{t.count}</span>
                <span style={{marginLeft:"auto", color:made?C.desired:C.expected, fontWeight:700}}>
                  {made ? "no match above the bar" : t.score.toFixed(2)}</span>
              </div>

              <div style={{position:"relative", height:6, background:C.faint,
                  borderRadius:3, marginTop:6}}>
                {!made && <div style={{position:"absolute", left:0, top:0, bottom:0,
                  width:`${t.score*100}%`, background:t.score>=1?C.observed:C.expected,
                  borderRadius:3}}/>}
                <div style={{position:"absolute", left:"85%", top:-2, bottom:-2, width:1,
                  background:C.desired}}/>
                <div style={{position:"absolute", left:"100%", top:-2, bottom:-2, width:1,
                  background:C.ink}}/>
              </div>
            </Fold>;})}
    </Scroller>
    <Cap>Amber tick = the 0.85 percept bar · black tick = 1.0, exact identity.</Cap>
  </div>;
}

// ── View: Ontology — the heterarchy as a 3D hypergraph ───────

function Ontology(){
  // THE LIT SUBGRAPH, NOT THE WHOLE HETERARCHY.
  //
  // portal.theory walks the Activation rows and emits the schemes
  // behind them with their afferent and efferent edges — so this view
  // shows what is currently active and what bears on it, which is the
  // question a running mind raises.  A graph of everything the mind
  // holds is mostly dormant and says nothing about what is happening.
  //
  // The fixture stands until the feed exists.  A blank canvas and a
  // stalled mind look identical, and only one of them is a problem.
  const ONTO = useFeed("portal-ontology.json", null);
  const SCHEMES_LIVE = (ONTO && ONTO.nodes && ONTO.nodes.length)
    ? ONTO.nodes.map(n => ({
        m: Number(n.m), r: n.r, rNum: n.rNum || 0, tier: n.tier,
        note: n.label || "",
        a: (ONTO.edges||[]).filter(e => e.kind==="afferent" && Number(e.to)===Number(n.m))
                           .map(e => Number(e.from)),
        e: (ONTO.edges||[]).filter(e => e.kind==="efferent" && Number(e.from)===Number(n.m))
                           .map(e => Number(e.to)),
      }))
    : SCHEMES;
  const [labelMode, setLabelMode] = useState("labels");   // monads | labels | none
  const useLabels = labelMode === "labels";
  const [picked, setPicked] = useState(null);
  const mount = useRef(null);
  const rot = useRef(restCamera("ontology"));
  const labelBox = useRef(null);
  const labelRef = useRef("labels");
  const [showTotality, setShowTotality] = useState(true);
  const [showTiers, setShowTiers] = useState(false);
  const shellRef = useRef(null);
  const tierRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const el = mount.current; if(!el) return;
    // FIXED HEIGHT, and deliberately.  A proportional canvas grows
    // with the window, and the fragment count grows with it — which
    // is what made the drag feel detached on a large display.  Width
    // still follows the column; only the height is pinned.
    const measure = () => ({ w: el.clientWidth, h: 665 });
    let { w: W, h: Hh } = measure();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W/Hh, 0.1, 100);
    camera.position.set(0,0,rot.current.zoom);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    // NO setPixelRatio.  three.js already defaults to 1, and asking
    // for the display ratio on a scaled monitor multiplies the
    // fragment count for no visible gain on flat-shaded geometry.
    renderer.setSize(W,Hh); renderer.setClearColor(C.stageClear);
    el.appendChild(renderer.domElement);
    // THE PANEL IS THE DRAG SURFACE, not the canvas.  setSize writes an
    // inline width on the canvas; anywhere inside the border but
    // outside that width was dead to a mousedown.
    el.style.height = Hh + "px";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const group = new THREE.Group(); scene.add(group);

    // the enclosing volume, per the Totality figure
    const shell = new THREE.Group(); group.add(shell); shellRef.current = shell;
    shell.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6,2.6,2.6)),
      new THREE.LineBasicMaterial({color:0x2a2a26})));
    [[-1.3,0xB4B4AE],[1.3,0xD6D6D0]].forEach(([y,col]) => {
      const cap = new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),
        new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.55,
          side:THREE.DoubleSide, depthWrite:false}));
      cap.rotation.x = -Math.PI/2; cap.position.y = y; shell.add(cap);
    });

    // the nine heterarchy tiers, at the heights the schemes sit at
    const tiers = new THREE.Group(); group.add(tiers); tierRef.current = tiers;
    tiers.visible = false;
    for(let z=1; z<=9; z++){
      const y = (z-5)/4*1.15;
      const shade = (z===1 || z===9) ? 0xC8C8C4 : (z%2===0 ? 0xEDEDEA : 0xF6F6F4);
      const sq = new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.5),
        new THREE.MeshBasicMaterial({color:shade, transparent:true, opacity:0.45,
          side:THREE.DoubleSide, depthWrite:false}));
      sq.rotation.x = -Math.PI/2; sq.position.y = y; tiers.add(sq);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.5,2.5)),
        new THREE.LineBasicMaterial({color:0x8a8a84, transparent:true, opacity:0.45}));
      edge.rotation.x = -Math.PI/2; edge.position.y = y; tiers.add(edge);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const dl = new THREE.DirectionalLight(0xffffff, 0.45); dl.position.set(2,4,3); scene.add(dl);

    // place each scheme: height = its heterarchy tier, x/z spread
    // deterministically from its monad so a layout is stable across renders
    const pos = {};
    SCHEMES_LIVE.forEach((sc,i) => {
      const h = (sc.tier - 5) / 4 * 1.15;
      const a = (Math.abs(sc.m) % 997) / 997 * Math.PI * 2;
      const r = 0.35 + ((Math.abs(sc.m) % 61) / 61) * 0.75;
      pos[sc.m] = new THREE.Vector3(Math.cos(a)*r, h, Math.sin(a)*r);
    });

    // edges: afferent (argument -> scheme) and efferent (scheme -> referent).
    // A monad with no scheme row of its own still gets a point, so the
    // heterarchy shows its leaves as well as its apices.
    const leaf = {};
    const ensure = (m) => {
      if(pos[m]) return pos[m];
      if(!leaf[m]){
        const a = (Math.abs(m) % 997) / 997 * Math.PI * 2;
        const r = 0.5 + ((Math.abs(m) % 41) / 41) * 0.8;
        leaf[m] = new THREE.Vector3(Math.cos(a)*r, ((Math.abs(m)%7)-3)/4*1.0, Math.sin(a)*r);
      }
      return leaf[m];
    };

    const solid = [], dashed = [];
    SCHEMES_LIVE.forEach(sc => {
      sc.a.forEach(a => { solid.push(ensure(a), pos[sc.m]); });
      sc.e.forEach(e => { dashed.push(pos[sc.m], ensure(e)); });
    });
    const mkLine = (pts, dash) => {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = dash
        ? new THREE.LineDashedMaterial({color:0x8a8a84, dashSize:0.06, gapSize:0.05})
        : new THREE.LineBasicMaterial({color:0x6a665e, transparent:true, opacity:0.75});
      const l = new THREE.LineSegments(g, mat);
      if(dash) l.computeLineDistances();
      group.add(l);
    };
    if(solid.length)  mkLine(solid, false);
    if(dashed.length) mkLine(dashed, true);

    // nodes
    const nodes = [];
    SCHEMES_LIVE.forEach(sc => {
      const apex = sc.e.length === 0;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.085,0.06,0.085),
        new THREE.MeshLambertMaterial({color: apex ? 0x8C6000 : 0x1B5C9E}));
      m.position.copy(pos[sc.m]); m.userData = sc; group.add(m); nodes.push(m);
    });
    Object.entries(leaf).forEach(([m,v]) => {
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.036,10,10),
        new THREE.MeshLambertMaterial({color:0x0B5D52}));
      s2.position.copy(v); s2.userData = {m:Number(m), r:"(monad)", tier:null, a:[], e:[], note:"leaf"};
      group.add(s2); nodes.push(s2);
    });

    // HTML labels, projected each frame
    const box = labelBox.current;
    box.innerHTML = "";
    const tags = nodes.map(n => {
      const d = document.createElement("div");
      // move by TRANSFORM, not left/top — see the Activation loop.
      d.style.cssText = "position:absolute;left:0;top:0;"
        + "font:10.5px ui-monospace,Menlo,monospace;"
        + "color:#1C1B18;white-space:nowrap;pointer-events:none";
      box.appendChild(d);
      return {d, n, s:{x:null, y:null, on:null, text:undefined}};
    });

    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    const dom = renderer.domElement;
    const down = e => { rot.current.drag=true; rot.current.pan=(e.button===2||e.shiftKey);
      rot.current.px=e.clientX; rot.current.py=e.clientY;
      el.style.cursor = "grabbing"; };
    const up = e => {
      if(Math.abs(e.clientX-rot.current.px)<4 && Math.abs(e.clientY-rot.current.py)<4
         && !rot.current.pan){
        const r = el.getBoundingClientRect();
        mouse.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects(nodes)[0];
        setPicked(hit ? hit.object.userData : null);
      }
      rot.current.drag=false; rot.current.pan=false; el.style.cursor = "grab"; };
    const move = e => { if(!rot.current.drag) return;
      const dx=e.clientX-rot.current.px, dy=e.clientY-rot.current.py;
      if(rot.current.pan){ const k=rot.current.zoom*0.0016;
        rot.current.ox+=dx*k; rot.current.oy-=dy*k; }
      else { rot.current.y+=dx*0.008; rot.current.x+=dy*0.006; }
      rot.current.px=e.clientX; rot.current.py=e.clientY; };
    const wheel = e => { e.preventDefault();
      rot.current.zoom = Math.min(16, Math.max(2.2,
        rot.current.zoom*(e.deltaY>0?1.08:0.93))); };
    const ctx = e => e.preventDefault();
    el.addEventListener("mousedown",down); window.addEventListener("mouseup",up);
    window.addEventListener("mousemove",move);
    el.addEventListener("wheel",wheel,{passive:false});
    el.addEventListener("contextmenu",ctx);

    let raf;
    let lastNamed;
    const v = new THREE.Vector3();
    const loop = () => {
      group.rotation.x = rot.current.x;
      group.rotation.y = rot.current.y;
      group.position.set(rot.current.ox, rot.current.oy, 0);
      camera.position.z = rot.current.zoom;
      renderer.render(scene,camera);

      // Guarded DOM writes — see the Activation loop.  This view has
      // more nodes than that one, so it pays the cost harder.
      // With labels off there is nothing to place — skip the
      // projection for every node rather than projecting and then
      // hiding.  The original always projected; this does not.
      const mode = labelRef.current;
      if(mode === "none"){
        if(lastNamed !== "none"){
          tags.forEach(({d,s:st}) => { d.style.display = "none"; st.on = false; });
          lastNamed = "none";
        }
        raf = requestAnimationFrame(loop);
        return;
      }
      const named = mode === "labels";
      const retext = named !== lastNamed;
      tags.forEach(({d,n,s:st}) => {
        n.getWorldPosition(v); v.project(camera);
        const on = v.z < 1;
        if(on !== st.on){ d.style.display = on ? "block" : "none"; st.on = on; }
        if(!on) return;
        const x = Math.round((v.x*0.5+0.5)*W);
        const y = Math.round((-v.y*0.5+0.5)*Hh);
        if(x !== st.x || y !== st.y){
          d.style.transform = `translate(${x+6}px, ${y}px) translateY(-50%)`;
          st.x = x; st.y = y;
        }
        if(retext || st.text === undefined){
          d.textContent = nameOf(n.userData.m, named);
          st.text = 1;
        }
      });
      lastNamed = mode;
      raf = requestAnimationFrame(loop);
    };
    loop();

    // ── follow the window ────────────────────────────────────
    // The effect runs once with an empty dependency list, so a
    // browser resize would otherwise never reach the renderer and
    // the canvas would keep its birth size forever.
    const resize = () => {
      const { w, h } = measure();
      if(w === 0) return;                 // hidden tab: nothing to size

      // GUARD.  The observer watches the mount div and the canvas
      // lives INSIDE it, so setSize changes the div's height, which
      // fires the observer, which calls setSize again — a feedback
      // loop that reallocates the WebGL drawing buffer every frame.
      // That is expensive enough to make a drag feel detached, and it
      // tears the framebuffer mid-render.
      if(w === W && h === Hh) return;

      W = w; Hh = h;
      el.style.height = h + "px";
      renderer.setSize(w, h);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf);
      ro.disconnect(); window.removeEventListener("resize", resize);
      el.removeEventListener("mousedown",down); window.removeEventListener("mouseup",up);
      window.removeEventListener("mousemove",move); el.removeEventListener("wheel",wheel);
      el.removeEventListener("contextmenu",ctx);
      el.removeChild(dom); renderer.dispose(); };
  }, []);

  // [Scheme :M … :R … :A {…} :E {…} :L …] — slot order as stored, :L last
  const schemeText = (x) =>
    `[Scheme :M ${x.m} :R ${relText(x.rNum, x.r)}` +
    ` :A {${x.a.join(" ")}} :E {${x.e.join(" ")}}` +
    ` :L ${LEX[Math.abs(x.m)] || "nil"}]`;

  // resolve a typed monad or label into a Scheme row
  const lookup = (text) => {
    const t = text.trim();
    if(!t) return null;
    let m = Number(t);
    if(!Number.isFinite(m) || t === "" || /[^0-9-]/.test(t)){
      const hit = Object.entries(LEX).find(([k,v]) =>
        v.toLowerCase() === t.toLowerCase());
      m = hit ? Number(hit[0]) : NaN;
    }
    if(!Number.isFinite(m)) return {miss:t};
    const sc = SCHEMES_LIVE.find(x => x.m === m);
    if(sc) return sc;
    // a monad with no scheme row of its own — a leaf; report where it is used
    const usedA = SCHEMES_LIVE.filter(x => x.a.includes(m)).map(x => x.m);
    const usedE = SCHEMES_LIVE.filter(x => x.e.includes(m)).map(x => x.m);
    if(usedA.length || usedE.length)
      return { m, r:"None", rNum:0, tier:null, a:[], e:[], leaf:true, usedA, usedE,
               note:"no scheme row — appears only as an argument or referent" };
    return {miss:t};
  };
  const found = lookup(query);

  // label mode read inside the render loop without re-creating the scene
  useEffect(() => { labelRef.current = labelMode; }, [labelMode]);
  useEffect(() => { if(shellRef.current) shellRef.current.visible = showTotality;
                  }, [showTotality]);
  useEffect(() => { if(tierRef.current) tierRef.current.visible = showTiers;
                  }, [showTiers]);

  return <div>
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <H>Ontology</H>
      <div style={{display:"flex", alignItems:"center", gap:8, marginLeft:"auto",
          flexWrap:"wrap", justifyContent:"flex-end"}}>
        <span style={{fontSize:11, color:C.dim}}>zoom</span>
        {/* defaultValue from the STORED zoom, not a constant.  The
            slider is uncontrolled, so a fixed default would snap the
            thumb back to the middle on every tab switch while the
            camera kept the real zoom — the two would disagree and the
            next drag would jump. */}
        <input type="range" min="2.2" max="16" step="0.1"
          defaultValue={String(18.2 - rot.current.zoom)}
          onChange={e=>{rot.current.zoom = 18.2 - parseFloat(e.target.value);}}
          style={{width:100, accentColor:C.observed}}/>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>pan</span>
        <div style={{display:"flex", gap:2}}>
          {[["L",()=>rot.current.ox+=0.18],["R",()=>rot.current.ox-=0.18],
            ["U",()=>rot.current.oy-=0.18],["D",()=>rot.current.oy+=0.18],
            ["I",()=>rot.current.zoom=Math.max(2.2,rot.current.zoom-0.5)],
            ["O",()=>rot.current.zoom=Math.min(16,rot.current.zoom+0.5)]].map(([k,fn]: [any,any]) =>
            <button key={k} onClick={fn} title={
              {L:"left",R:"right",U:"up",D:"down",I:"in (forward)",O:"out (back)"}[k]}
              style={{width:22, padding:"2px 0", borderRadius:4, cursor:"pointer",
                fontFamily:mono, fontSize:11, border:`1px solid ${C.rule}`,
                background:C.card, color:C.ink}}>{k}</button>)}
        </div>
        <button onClick={()=>goHome("ontology", rot)}
          style={{padding:"2px 10px", borderRadius:5, cursor:"pointer", fontFamily:mono,
            fontSize:11, border:`1px solid ${C.rule}`, background:C.card, color:C.dim}}>reset</button>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>totality</span>
        <div style={{display:"flex", border:`1px solid ${C.rule}`,
            borderRadius:6, overflow:"hidden", width:80}}>
          {["on","off"].map(m => <div key={m} onClick={()=>setShowTotality(m==="on")}
            style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11, cursor:"pointer",
              background:(m==="on")===showTotality?C.observed:C.card,
              color:(m==="on")===showTotality?"#fff":C.dim}}>{m}</div>)}
        </div>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>tiers</span>
        <div style={{display:"flex", border:`1px solid ${C.rule}`,
            borderRadius:6, overflow:"hidden", width:80}}>
          {["on","off"].map(m => <div key={m} onClick={()=>setShowTiers(m==="on")}
            style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11, cursor:"pointer",
              background:(m==="on")===showTiers?C.observed:C.card,
              color:(m==="on")===showTiers?"#fff":C.dim}}>{m}</div>)}
        </div>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>show</span>
        <div style={{display:"flex", border:`1px solid ${C.rule}`,
            borderRadius:6, overflow:"hidden", width:180}}>
          {["monads","labels","none"].map(m => <div key={m} onClick={()=>setLabelMode(m)}
            style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11, cursor:"pointer",
              background:m===labelMode?C.observed:C.card,
              color:m===labelMode?"#fff":C.dim}}>{m}</div>)}
        </div>
      </div>
    </div>
    {/* full-width graph */}
    <div style={{position:"relative", marginTop:8}}>
      <div ref={mount} style={{borderRadius:8, overflow:"hidden",
        border:`1px solid ${C.rule}`, cursor:"grab"}}/>
      <div ref={labelBox} style={{position:"absolute", inset:0, pointerEvents:"none"}}/>
    </div>

    {/* the inspector, below the window */}
    <Card style={{marginTop:10}}>
      {picked ? <>
        <div style={{display:"flex", gap:12, alignItems:"baseline", flexWrap:"wrap"}}>
          <Mono v={nameOf(picked.m, useLabels)} color={C.expected}/>
          <span style={{fontSize:12, color:C.dim}}>
            {relText(picked.rNum, picked.r)}{picked.tier?` · tier ${picked.tier}`:""}</span>
          <span style={{fontSize:12, color:C.dim, marginLeft:"auto"}}>{picked.note}</span>
        </div>
        <div style={{display:"flex", gap:22, marginTop:6, flexWrap:"wrap", fontSize:12}}>
          <div>
            <span style={{color:C.observed}}>:A afferents</span>
            <div>{picked.a.length ? picked.a.map(a =>
              <Chip key={a}>{nameOf(a,useLabels)}</Chip>) : <span style={{color:C.dim}}>none</span>}</div>
          </div>
          <div>
            <span style={{color:C.imagined}}>:E efferents</span>
            <div>{picked.e.length ? picked.e.map(e =>
              <Chip key={e}>{nameOf(e,useLabels)}</Chip>)
              : <span style={{color:C.desired}}>∅ apex / frontier</span>}</div>
          </div>
        </div>
        <Raw text={schemeText(picked)}/>
      </> : <Cap>Click a node, or use the box below.</Cap>}
    </Card>

    <Cap>Blue box = scheme · amber box = apex (no referents) · green sphere = leaf monad.</Cap>

    <Card style={{marginTop:12}}>
      <div style={{display:"flex", gap:10, alignItems:"center"}}>
        <span style={{fontSize:11, color:C.dim, whiteSpace:"nowrap"}}>monad or label</span>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="261044  or  carry-left"
          style={{width:220, padding:"5px 8px", borderRadius:5, fontFamily:mono, fontSize:12,
            background:C.card, color:C.ink, outline:"none",
            border:`1px solid ${found && found.miss ? C.impeded : C.rule}`}}/>
        {found && found.miss &&
          <span style={{fontSize:11, color:C.impeded}}>Nothing in the Totality named {found.miss}.</span>}
        {found && !found.miss && !found.leaf &&
          <span style={{fontSize:11, color:C.dim}}>tier {found.tier} · {found.note}</span>}
        {found && found.leaf &&
          <span style={{fontSize:11, color:C.dim}}>argument of {found.usedA.join(" ") || "—"} ·
            referent of {found.usedE.join(" ") || "—"}</span>}
      </div>
      {found && !found.miss && <Raw text={schemeText(found)}/>}
    </Card>
  </div>;
}

// ── View: Activation cube ─────────────────────────────────────

function ActivationCube(){
  // THE REAL ACTIVATION ROWS, and the real Glue coordinates.
  //
  // portal.theory emits one row per active monad per reality; this
  // folds them into the shape the view has always drawn — one point,
  // with a pulse count per reality, so a monad active in two or more
  // still comes out white.
  //
  // GLUE COORDINATES MAY BE UNPLACED.  A Glue row is created with its
  // coordinates nil or zero and an agent places them afterwards, so
  // points at the origin are the pre-placement state rather than a
  // fault — which is itself worth seeing, because a cube collapsed to
  // a line means the placer has not run.
  const ACTS = useFeed("portal-activations.json", null);
  const ACTIVATION_LIVE = (ACTS && ACTS.length)
    ? (Object.values((ACTS || []).reduce((acc: any, row: any) => {
        const m = Number(row.m);
        acc[m] = acc[m] || { m, x:Number(row.x)||0, y:Number(row.y)||0,
                             z:Number(row.z)||0, r:{}, f:1.0,
                             placed: row.placed !== false };
        acc[m].r[row.reality] = (acc[m].r[row.reality] || 0) + Number(row.pulses || 0);
        return acc;
      }, {})) as any[])
    : ACTIVATION;
  const mount = useRef(null);
  const [picked, setPicked] = useState(null);
  // Tiers OFF by default.  The planes read as the dominant object
  // on first sight, and what the view is for is where the points
  // are — the scaffolding should be asked for, not imposed.
  const [showTiers, setShowTiers] = useState(false);
  // Labels ON by default.  A cube of unnamed points is a picture of
  // activity; with names it is a picture of what is active, which is
  // the question the view exists to answer.
  const [labelMode, setLabelMode] = useState("labels");   // monads | labels | none
  const [query, setQuery] = useState("");
  const tierGroup = useRef(null);
  const labelBox = useRef(null);
  const labelRef = useRef("labels");   // must match the state above
  const focusRef = useRef(null);          // monad the find box is pointing at
  const rot = useRef(restCamera("activation"));
  const camRef = useRef(null);

  useEffect(() => {
    const el = mount.current; if(!el) return;
    // FIXED HEIGHT — see the Ontology view.  Width still follows the
    // column, so the canvas answers a horizontal resize; the height
    // is what costs frame budget and it no longer varies.
    const measure = () => ({ w: el.clientWidth, h: 665 });
    let { w: W, h: Hh } = measure();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W/Hh, 0.1, 100);
    camera.position.set(0,0,rot.current.zoom);
    camRef.current = camera;
    const renderer = new THREE.WebGLRenderer({antialias:true});
    // NO setPixelRatio.  three.js already defaults to 1, and asking
    // for the display ratio on a scaled monitor multiplies the
    // fragment count for no visible gain on flat-shaded geometry.
    renderer.setSize(W,Hh); renderer.setClearColor(C.stageClear);
    el.appendChild(renderer.domElement);
    // THE PANEL IS THE DRAG SURFACE, not the canvas.  setSize writes an
    // inline width on the canvas; anywhere inside the border but
    // outside that width was dead to a mousedown.
    el.style.height = Hh + "px";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const group = new THREE.Group(); scene.add(group);
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4,2.4,2.4)),
      new THREE.LineBasicMaterial({color:0x2a2a26}));
    group.add(box);
    // tier planes: white / light-grey squares per the reference diagrams —
    // darker grey at the bottom (percept) and top (operation), near-white between
    const tiers = new THREE.Group(); group.add(tiers); tierGroup.current = tiers;
    for(let z=1; z<=9; z++){
      const shade = (z===1 || z===9) ? 0xC8C8C4 : (z%2===0 ? 0xEDEDEA : 0xF6F6F4);
      const sq = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 2.3),
        new THREE.MeshBasicMaterial({color:shade, transparent:true,
          opacity:0.5, side:THREE.DoubleSide, depthWrite:false}));
      sq.rotation.x = -Math.PI/2;
      sq.position.y = (z-5)/4*1.1;
      tiers.add(sq);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.3, 2.3)),
        new THREE.LineBasicMaterial({color:0x8a8a84, transparent:true, opacity:0.5}));
      edge.rotation.x = -Math.PI/2;
      edge.position.y = (z-5)/4*1.1;
      tiers.add(edge);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(2,3,4); scene.add(dl);

    const spheres = [];
    ACTIVATION_LIVE.forEach(p => {
      const pulses = (Object.values(p.r) as number[]).reduce((a,b)=>a+b,0);
      // UNIFORM, and sized to the ontology node box (0.085 across).
      // Pulse count is carried by opacity and by the rim, not by
      // radius — scaling the sphere made a busy node dominate the
      // cube and hid the quiet ones behind it.
      const rad = 0.0425;
      const col = new THREE.Color(pointColor(p));
      const mat = p.imp
        ? new THREE.MeshBasicMaterial({color:col, wireframe:true})
        : new THREE.MeshLambertMaterial({color:col, transparent:true, opacity:0.35+0.65*p.f});
      const s = new THREE.Mesh(new THREE.SphereGeometry(rad, 14, 14), mat);
      s.position.set(p.x*1.1, (p.z-5)/4*1.1, p.y*1.1);
      s.userData = p; group.add(s); spheres.push(s);
      if(!p.imp && Object.keys(p.r).length > 1){
        // white multi-reality point: add a thin dark rim so it reads on white
        const rim = new THREE.Mesh(new THREE.SphereGeometry(rad*1.12, 14, 14),
          new THREE.MeshBasicMaterial({color:0x4a4a44, wireframe:true,
            transparent:true, opacity:0.55}));
        rim.position.copy(s.position); group.add(rim);
      }
    });

    // HTML labels, projected each frame
    const tagLayer = labelBox.current;
    tagLayer.innerHTML = "";
    const tags = spheres.map(n => {
      const d = document.createElement("div");
      // `left:0; top:0` and move by TRANSFORM — a transform is
      // composited, where left/top force a layout pass on every write.
      d.style.cssText = "position:absolute;left:0;top:0;"
        + "font:10.5px ui-monospace,Menlo,monospace;"
        + "color:#1C1B18;white-space:nowrap;pointer-events:none";
      tagLayer.appendChild(d);
      return {d, n, s:{x:null, y:null, on:null, text:undefined}};
    });

    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    const dom = renderer.domElement;
    const down = e => {
      rot.current.drag = true;
      rot.current.pan  = (e.button===2 || e.shiftKey);
      rot.current.px=e.clientX; rot.current.py=e.clientY;
      el.style.cursor = "grabbing"; };
    const up = e => {
      if(Math.abs(e.clientX-rot.current.px)<4 && Math.abs(e.clientY-rot.current.py)<4
         && !rot.current.pan){
        const r = el.getBoundingClientRect();
        mouse.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects(spheres)[0];
        setPicked(hit ? hit.object.userData : null);
      }
      rot.current.drag=false; rot.current.pan=false; el.style.cursor = "grab";
    };
    const move = e => { if(!rot.current.drag) return;
      const dx = e.clientX-rot.current.px, dy = e.clientY-rot.current.py;
      if(rot.current.pan){
        // pan within the totality: shift the group origin in view-space
        const k = rot.current.zoom*0.0016;
        rot.current.ox += dx*k;
        rot.current.oy -= dy*k;
      } else {
        rot.current.y += dx*0.008;
        rot.current.x += dy*0.008;
      }
      rot.current.px=e.clientX; rot.current.py=e.clientY; };
    const wheel = e => {
      e.preventDefault();
      rot.current.zoom = Math.min(14, Math.max(1.6,
        rot.current.zoom * (e.deltaY>0 ? 1.08 : 0.93)));
    };
    const ctx = e => e.preventDefault();
    el.addEventListener("mousedown",down); window.addEventListener("mouseup",up);
    window.addEventListener("mousemove",move);
    el.addEventListener("wheel",wheel,{passive:false});
    el.addEventListener("contextmenu",ctx);

    let raf;
    let lastFocus, lastShowing, lastNamed, lastTextFocus;
    const v = new THREE.Vector3();
    const loop = () => {
      group.rotation.x = rot.current.x;
      group.rotation.y = rot.current.y;
      group.position.set(rot.current.ox, rot.current.oy, rot.current.oz);
      camera.position.z = rot.current.zoom;
      // the ring only moves when the find box changes
      if(focusRef.current !== lastFocus){
        spheres.forEach(sp => sp.scale.setScalar(
          focusRef.current !== null && sp.userData.m === focusRef.current ? 1.9 : 1));
        lastFocus = focusRef.current;
      }
      renderer.render(scene, camera);

      // ── labels ───────────────────────────────────────────────
      //
      // EVERY DOM WRITE HERE IS PAID PER FRAME PER NODE, so each one
      // is guarded on having actually changed.  Writing style.left and
      // style.top forces layout; transform does not, because it runs
      // on the compositor.  And textContent was being rewritten sixty
      // times a second with the identical string.
      //
      // NOT the cause of the jerky drag — that was measured, with
      // labels off, and it was still jerky.  The cost here is real
      // but it was never the bottleneck; setPixelRatio was.
      const mode = labelRef.current;
      const showing = mode !== "none";
      if(showing !== lastShowing){
        tags.forEach(({d}) => { d.style.display = showing ? "block" : "none"; });
        lastShowing = showing;
      }
      if(showing){
        const named = mode === "labels";
        const retext = named !== lastNamed || focusRef.current !== lastTextFocus;
        tags.forEach(({d,n,s:st}) => {
          n.getWorldPosition(v); v.project(camera);
          const on = v.z < 1;
          if(on !== st.on){ d.style.display = on ? "block" : "none"; st.on = on; }
          if(!on) return;
          const x = Math.round((v.x*0.5+0.5)*W);
          const y = Math.round((-v.y*0.5+0.5)*Hh);
          if(x !== st.x || y !== st.y){
            d.style.transform = `translate(${x+7}px, ${y}px) translateY(-50%)`;
            st.x = x; st.y = y;
          }
          if(retext || st.text === undefined){
            d.textContent = nameOf(n.userData.m, named);
            d.style.fontWeight = (focusRef.current === n.userData.m) ? "700" : "400";
            st.text = 1;
          }
        });
        lastNamed = named; lastTextFocus = focusRef.current;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    // ── follow the window ────────────────────────────────────
    // The effect runs once with an empty dependency list, so a
    // browser resize would otherwise never reach the renderer and
    // the canvas would keep its birth size forever.
    const resize = () => {
      const { w, h } = measure();
      if(w === 0) return;                 // hidden tab: nothing to size

      // GUARD.  The observer watches the mount div and the canvas
      // lives INSIDE it, so setSize changes the div's height, which
      // fires the observer, which calls setSize again — a feedback
      // loop that reallocates the WebGL drawing buffer every frame.
      // That is expensive enough to make a drag feel detached, and it
      // tears the framebuffer mid-render.
      if(w === W && h === Hh) return;

      W = w; Hh = h;
      el.style.height = h + "px";
      renderer.setSize(w, h);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf);
      ro.disconnect(); window.removeEventListener("resize", resize);
      el.removeEventListener("mousedown",down); window.removeEventListener("mouseup",up);
      window.removeEventListener("mousemove",move);
      el.removeEventListener("wheel",wheel); el.removeEventListener("contextmenu",ctx);
      el.removeChild(dom); renderer.dispose(); };
  }, []);

  useEffect(() => {
    if(tierGroup.current) tierGroup.current.visible = showTiers;
  }, [showTiers]);
  useEffect(() => { labelRef.current = labelMode; }, [labelMode]);

  // resolve the typed monad or label to an activation row
  const lookup = (text) => {
    const t = text.trim();
    if(!t) return null;
    let m = Number(t);
    if(!Number.isFinite(m) || /[^0-9-]/.test(t)){
      const hit = Object.entries(LEX).find(([k,v]) => v.toLowerCase() === t.toLowerCase());
      m = hit ? Number(hit[0]) : NaN;
    }
    if(!Number.isFinite(m)) return {miss:t};
    const row = ACTIVATION_LIVE.find(p => p.m === m);
    return row || {miss:t, m};
  };
  const found = lookup(query);
  useEffect(() => {
    focusRef.current = (found && !found.miss) ? found.m : null;
  }, [query, found]);

  return <div>
    <div style={{display:"flex", alignItems:"baseline"}}>
      <H>Activations</H>
      <div style={{display:"flex", alignItems:"center", gap:8, marginLeft:"auto"}}>
        <span style={{fontSize:11, color:C.dim}}>zoom</span>
        {/* defaultValue from the STORED zoom — see the Ontology slider. */}
        <input type="range" min="1.6" max="14" step="0.1"
          defaultValue={String(15.6 - rot.current.zoom)}
          onChange={e=>{rot.current.zoom = 15.6 - parseFloat(e.target.value);}}
          style={{width:110, accentColor:C.observed}}/>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>pan</span>
        <div style={{display:"flex", gap:2}}>
          {[["L",()=>rot.current.ox+=0.18],["R",()=>rot.current.ox-=0.18],
            ["U",()=>rot.current.oy-=0.18],["D",()=>rot.current.oy+=0.18],
            ["I",()=>rot.current.oz+=0.22],["O",()=>rot.current.oz-=0.22]].map(([k,fn]: [any,any]) =>
            <button key={k} onClick={fn} title={
              {L:"left",R:"right",U:"up",D:"down",I:"in (forward)",O:"out (back)"}[k]}
              style={{width:22, padding:"2px 0", borderRadius:4, cursor:"pointer",
                fontFamily:mono, fontSize:11, border:`1px solid ${C.rule}`,
                background:C.card, color:C.ink}}>{k}</button>)}
        </div>
        <button onClick={()=>goHome("activation", rot)}
          style={{padding:"2px 10px", borderRadius:5, cursor:"pointer", fontFamily:mono,
            fontSize:11, border:`1px solid ${C.rule}`, background:C.card, color:C.dim}}>reset</button>
        <span style={{fontSize:11, color:C.dim}}>tiers</span>
        <div style={{display:"flex", border:`1px solid ${C.rule}`,
            borderRadius:6, overflow:"hidden", width:90}}>
          {["on","off"].map(m => <div key={m} onClick={()=>setShowTiers(m==="on")}
            style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11, cursor:"pointer",
              background:(m==="on")===showTiers?C.observed:C.card,
              color:(m==="on")===showTiers?"#fff":C.dim}}>{m}</div>)}
        </div>
        <span style={{fontSize:11, color:C.dim, marginLeft:4}}>show</span>
        <div style={{display:"flex", border:`1px solid ${C.rule}`,
            borderRadius:6, overflow:"hidden", width:180}}>
          {["monads","labels","none"].map(m => <div key={m} onClick={()=>setLabelMode(m)}
            style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11, cursor:"pointer",
              background:m===labelMode?C.observed:C.card,
              color:m===labelMode?"#fff":C.dim}}>{m}</div>)}
        </div>
      </div>
    </div>
    {/* the cube, full width */}
    <div style={{position:"relative", marginTop:8}}>
      <div ref={mount} style={{borderRadius:8, overflow:"hidden",
        border:`1px solid ${C.rule}`, cursor:"grab"}}/>
      <div ref={labelBox} style={{position:"absolute", inset:0, pointerEvents:"none"}}/>
    </div>
    <div style={{marginTop:6}}>
      {Object.entries(REALITY_COLOR).map(([k,v]) =>
        <Chip key={k} color={v} ink="#fff">{k}</Chip>)}
      <Chip color="#fff" ink={C.ink}>multi</Chip>
      <Chip color={C.impeded} ink="#fff">impeded</Chip>
    </div>

    {/* the inspector, below the window */}
    <Card style={{marginTop:10}}>
      {picked ? <div style={{display:"flex", gap:18, alignItems:"baseline", flexWrap:"wrap"}}>
        <Mono v={picked.m} color={picked.m<0?C.impeded:C.observed}/>
        {picked.m<0 && <span style={{fontSize:12, color:C.dim}}>dyad — the failure pole</span>}
        {Object.entries(picked.r).map(([k,v]: [string, any]) =>
          <Chip key={k} color={REALITY_COLOR[k]} ink="#fff">{k} · {v} pulse{v>1?"s":""}</Chip>)}
        <span style={{fontSize:12, color:C.dim}}>tier <b style={{color:C.ink}}>{picked.z}</b></span>
        <span style={{fontSize:12, color:C.dim}}>freshness
          {" "}<b style={{color:C.ink}}>{picked.f.toFixed(2)}</b></span>
        {picked.imp && <span style={{fontSize:12, color:C.impeded}}>impeded (Budgeter)</span>}
      </div> : <Cap>Click a point, or use the box below.</Cap>}
    </Card>

    <Card style={{marginTop:12}}>
      <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
        <span style={{fontSize:11, color:C.dim, whiteSpace:"nowrap"}}>monad or label</span>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="261044  or  carry-left"
          style={{width:220, padding:"5px 8px", borderRadius:5, fontFamily:mono, fontSize:12,
            background:C.card, color:C.ink, outline:"none",
            border:`1px solid ${found && found.miss ? C.impeded : C.rule}`}}/>
        {found && found.miss &&
          <span style={{fontSize:11, color:C.impeded}}>
            {found.m !== undefined ? `${found.m} is not active right now.`
                                   : `Nothing named ${found.miss}.`}</span>}
        {found && !found.miss && <>
          <span style={{fontSize:12}}>tier <b>{found.z}</b></span>
          {Object.entries(found.r).map(([k,v]) =>
            <Chip key={k} color={REALITY_COLOR[k]} ink="#fff">{k} · {v}p</Chip>)}
          <span style={{fontSize:12, color:C.dim}}>freshness {found.f.toFixed(2)}</span>
          {found.imp && <span style={{fontSize:12, color:C.impeded}}>impeded</span>}
          <span style={{fontSize:11, color:C.dim, marginLeft:"auto"}}>ringed in the cube</span>
        </>}
      </div>
    </Card>
  </div>;
}


// ── The Canvas stage — real meshes and clouds, rendered ───────

function CanvasStage({figments, affects}){
  const mount = useRef(null);
  // allocentric: the map view, tilted just enough to read the lift
  const rot = useRef(restCamera("imagination"));

  useEffect(() => {
    const el = mount.current; if(!el) return;
    // PROPORTIONAL, not fixed.  the stage sits below controls; 52% of the window, floor 380.
    const measure = () => ({
      w: el.clientWidth,
      h: Math.max(380, Math.round(window.innerHeight * 0.52)),
    });
    let { w: W, h: Hh } = measure();
    const scene = new THREE.Scene();
    // Near/far AS THE ORIGINAL HAD THEM.  I raised the near plane
    // on the theory that depth precision was the problem; the
    // original rendered these same slabs solid at 0.1, so the theory
    // was wrong and the change is reverted rather than kept because
    // it sounds better.
    const camera = new THREE.PerspectiveCamera(42, W/Hh, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({antialias:true});
    // NO setPixelRatio.  three.js already defaults to 1, and asking
    // for the display ratio on a scaled monitor multiplies the
    // fragment count for no visible gain on flat-shaded geometry.
    renderer.setSize(W,Hh); renderer.setClearColor(0xF7F5FB);
    el.appendChild(renderer.domElement);
    // THE PANEL IS THE DRAG SURFACE, not the canvas.  setSize writes an
    // inline width on the canvas; anywhere inside the border but
    // outside that width was dead to a mousedown.
    el.style.height = Hh + "px";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const group = new THREE.Group(); scene.add(group);

    // ── the venue floor — the plane perception was lifted from ──
    //
    // BELOW y = 0, NOT ON IT.  Every slab's bottom face sits at
    // exactly y = 0; so did the floor and the grid.  The floor has
    // depthWrite off so it cannot fight, but the GridHelper writes
    // depth and its lines were at the same plane as the slab bases.
    //
    // Dropping both a hair clear costs nothing visually and removes
    // the coincidence entirely.
    const FLOOR_Y = -0.02;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8.2,8.2),
      new THREE.MeshBasicMaterial({color:0xE8E4F2, transparent:true, opacity:0.7,
        side:THREE.DoubleSide, depthWrite:false}));
    floor.rotation.x = -Math.PI/2; floor.position.y = FLOOR_Y; group.add(floor);
    const grid = new THREE.GridHelper(8, 8, 0xB9B2CE, 0xDBD5E6);
    grid.position.y = FLOOR_Y;
    group.add(grid);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(3,6,4); scene.add(dl);

    let staged = 0, missing = 0;
    figments.forEach(fg => {
      const ringed = affects.includes(fg.f);
      fg.parts.forEach(pid => {
        const geo = GEOMETRY[pid];
        if(!geo){ missing++; return; }
        staged++;
        if(geo.kind === "mesh"){
          const g = new THREE.BufferGeometry();
          const pos = [];
          geo.data.f.forEach(([a,b,c]) => {
            [a,b,c].forEach(i => pos.push(...geo.data.v[i]));
          });
          g.setAttribute("position", new THREE.Float32BufferAttribute(pos,3));
          g.computeVertexNormals();
          group.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({
            color:new THREE.Color(fg.color), transparent:true, opacity:0.92})));
          if(ringed)
            group.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),
              new THREE.LineBasicMaterial({color:0x6B4E9E})));
        } else {
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(
            geo.data.p.flat(), 3));
          group.add(new THREE.Points(g, new THREE.PointsMaterial({
            color:new THREE.Color(fg.color), size: ringed ? 0.09 : 0.07,
            sizeAttenuation:true})));
        }
      });
    });

    const dom = renderer.domElement;
    const down = e => { rot.current.drag=true; rot.current.px=e.clientX; rot.current.py=e.clientY;
      el.style.cursor = "grabbing"; };
    const up = () => { rot.current.drag=false; el.style.cursor = "grab"; };
    const move = e => { if(!rot.current.drag) return;
      rot.current.y += (e.clientX-rot.current.px)*0.008;
      rot.current.x += (e.clientY-rot.current.py)*0.006;
      rot.current.px=e.clientX; rot.current.py=e.clientY; };
    const wheel = e => { e.preventDefault();
      rot.current.zoom = Math.min(16, Math.max(2, rot.current.zoom*(e.deltaY>0?1.08:0.93))); };
    el.addEventListener("mousedown",down); window.addEventListener("mouseup",up);
    window.addEventListener("mousemove",move);
    el.addEventListener("wheel",wheel,{passive:false});

    let raf;
    const loop = () => {
      group.rotation.x = rot.current.x + Math.PI/2;   // look down onto the plane
      group.rotation.y = rot.current.y;
      camera.position.set(0, rot.current.zoom*0.55, rot.current.zoom);
      camera.lookAt(0,0,0);
      renderer.render(scene,camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    // ── follow the window ────────────────────────────────────
    // The effect runs once with an empty dependency list, so a
    // browser resize would otherwise never reach the renderer and
    // the canvas would keep its birth size forever.
    const resize = () => {
      const { w, h } = measure();
      if(w === 0) return;                 // hidden tab: nothing to size

      // GUARD.  The observer watches the mount div and the canvas
      // lives INSIDE it, so setSize changes the div's height, which
      // fires the observer, which calls setSize again — a feedback
      // loop that reallocates the WebGL drawing buffer every frame.
      // That is expensive enough to make a drag feel detached, and it
      // tears the framebuffer mid-render.
      if(w === W && h === Hh) return;

      W = w; Hh = h;
      el.style.height = h + "px";
      renderer.setSize(w, h);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf);
      ro.disconnect(); window.removeEventListener("resize", resize);
      el.removeEventListener("mousedown",down); window.removeEventListener("mouseup",up);
      window.removeEventListener("mousemove",move); el.removeEventListener("wheel",wheel);
      el.removeChild(dom); renderer.dispose(); };
  }, [figments, affects]);

  return <div ref={mount} style={{borderRadius:6, overflow:"hidden",
    border:`1px solid ${C.rule}`, marginTop:6, cursor:"grab"}}/>;
}

// ── View: Imagination — the active Canvas ─────────────────────

function Imagination(){
  const N = (m) => String(m);

  // THREE MODES.
  //
  //   find   a text box: a canvas by MONAD OR LABEL.  The label
  //          resolves through the Lexeme mapping, the same way the
  //          Activation and Ontology find boxes resolve one, so a
  //          name typed on any screen means the same thing.
  //
  //   live   the most salient activated canvas, ACROSS ALL REALITIES.
  //          A canvas rehearsed in Imagined is exactly the one worth
  //          looking at, and confining this to the current reality
  //          would hide it.  The reality that lit it is badged.
  //
  //   list   the N most recent, sortable by label or monad, either
  //          direction.  Default monad descending — monads mint
  //          monotonically, so that IS newest-first and there is no
  //          separate recency order to keep.
  const [mode, setMode] = useState("live");
  const [sortBy, setSortBy] = useState("monad");
  const [sortDir, setSortDir] = useState("desc");
  const [findIn, setFindIn] = useState("");

  const CANVAS_FEED = useFeed("portal-canvases.json", null);
  const canvasRows = (CANVAS_FEED && CANVAS_FEED.length) ? CANVAS_FEED : null;

  const sorted = (canvasRows || []).slice().sort((a,b) => {
    const k = sortBy === "label"
      ? String(a.label||"").localeCompare(String(b.label||""))
      : String(a.m).localeCompare(String(b.m));
    return sortDir === "desc" ? -k : k;
  });

  const mostSalient = (canvasRows || []).slice()
    .sort((a,b) => Number(b.pulses||0) - Number(a.pulses||0))[0];

  const chosen =
      mode === "live" ? (mostSalient ? Number(mostSalient.m) : ACTIVE_CANVAS)
    : mode === "list" ? (sorted[0] ? Number(sorted[0].m) : ACTIVE_CANVAS)
    : ACTIVE_CANVAS;

  const [canvasIn, setCanvasIn]   = useState(String(ACTIVE_CANVAS));
  const [venueIn, setVenueIn]     = useState(String(CANVASES[ACTIVE_CANVAS].venue));
  const [taxisIn, setTaxisIn]     = useState(String(CANVASES[ACTIVE_CANVAS].taxis.m));
  const [vantageIn, setVantageIn] = useState(String(CANVASES[ACTIVE_CANVAS].shots.slice(-1)[0]));
  const [movieIn, setMovieIn]     = useState("270450");
  const [routeIn, setRouteIn]     = useState(String(ROUTES[0].route));
  const [figmentIn, setFigmentIn] = useState("270312");
  const [tab, setTab]             = useState("canvas");
  const [staged, setStaged]       = useState(true);   // show / clear the stage
  const [pane, setPane]           = useState("canvas"); // canvas | source

  const canvas = CANVASES[Number(canvasIn)] || null;
  const venue  = VENUES[Number(venueIn)] || null;
  const taxis  = TAXEIS[Number(taxisIn)] || null;
  const vantage= VANTAGES[Number(vantageIn)] || null;
  const movie  = MOVIES[Number(movieIn)] || null;
  const movieSrc  = movie ? (SOURCE_KIND[movie.sourceRel] || {kind:"unknown", term:"—"}) : null;
  const movieKind = movieSrc ? movieSrc.kind : null;

  // a canvas typed in drives the venue and vantage boxes
  const openCanvas = (m) => {
    const cv = CANVASES[Number(m)];
    setCanvasIn(String(m));
    if(cv){ setVenueIn(String(cv.venue)); setTaxisIn(String(cv.taxis.m));
            setVantageIn(String(cv.shots.slice(-1)[0])); }
  };
  // a taxis typed in opens its canvas and the shot that views it
  const openTaxis = (m) => {
    const tx = TAXEIS[Number(m)];
    setTaxisIn(String(m));
    if(tx){ setCanvasIn(String(tx.canvas)); setVenueIn(String(CANVASES[tx.canvas].venue));
            const shot = Object.values(VANTAGES).filter(v=>v.taxis===tx.m).slice(-1)[0];
            if(shot) setVantageIn(String(shot.m)); }
  };
  // a vantage typed in drives the canvas it belongs to
  const openVantage = (m) => {
    const vg = VANTAGES[Number(m)];
    setVantageIn(String(m));
    if(vg){ setCanvasIn(String(vg.canvas)); setVenueIn(String(CANVASES[vg.canvas].venue));
            setTaxisIn(String(vg.taxis)); }
  };
  // a venue typed in opens its canvas
  const openVenue = (m) => {
    const vn = VENUES[Number(m)];
    setVenueIn(String(m));
    if(vn){ setCanvasIn(String(vn.canvas));
            setTaxisIn(String(CANVASES[vn.canvas].taxis.m));
            setVantageIn(String(CANVASES[vn.canvas].shots.slice(-1)[0])); }
  };

  // a movie typed in opens its canvas and its current shot
  const openMovie = (m) => {
    const mv = MOVIES[Number(m)];
    setMovieIn(String(m));
    if(mv){ setCanvasIn(String(mv.canvas)); setVenueIn(String(CANVASES[mv.canvas].venue));
            const shot = VANTAGES[mv.shots[mv.current]];
            if(shot){ setVantageIn(String(shot.m)); setTaxisIn(String(shot.taxis)); } }
  };

  const Box = ({label, value, onChange, found, hint = ""}: any) =>
    <div style={{display:"flex", flexDirection:"column", gap:2}}>
      <span style={{fontSize:11, color:C.dim}}>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value.replace(/[^0-9-]/g,""))}
        style={{width:120, padding:"4px 8px", borderRadius:5, fontFamily:mono, fontSize:12,
          background:C.card, color:found?C.imagined:C.impeded, fontWeight:700,
          border:`1px solid ${found?C.rule:C.impeded}`, outline:"none"}}/>
      <span style={{fontSize:10, color:found?C.dim:C.impeded}}>
        {found ? hint : "not in the Totality"}</span>
    </div>;

  if(!canvas) return <div>
    <H>Imagination</H>
    <div style={{display:"flex", gap:14, margin:"10px 0"}}>
      <Box label="canvas"  value={canvasIn}  onChange={openCanvas}  found={false}/>
      <Box label="venue"   value={venueIn}   onChange={openVenue}   found={!!venue}
           hint={venue?`canvas ${venue.canvas}`:""}/>
      <Box label="taxis"   value={taxisIn}   onChange={openTaxis}   found={!!taxis}
           hint={taxis?`canvas ${taxis.canvas}`:""}/>
      <Box label="vantage" value={vantageIn} onChange={openVantage} found={!!vantage}
           hint={vantage?`taxis ${vantage.taxis}`:""}/>
      <Box label="movie"   value={movieIn}   onChange={openMovie}   found={!!movie}
           hint={movie?`${(SOURCE_KIND[movie.sourceRel]||{}).kind||"unknown"} · ${movie.shots.length} shots`:""}/>
    </div>
    <Cap>No Canvas with that monad. The active canvas is {ACTIVE_CANVAS}.</Cap>
  </div>;

  const ACTIVE_TAXIS = (taxis && taxis.canvas === canvas.m) ? taxis : canvas.taxis;

  // ── the tabbed inspector below the stage ──────────────────
  const TABS = ["canvas","taxis","choreography","routes","figments"];
  const tabValue = { canvas:canvasIn, taxis:taxisIn, choreography:movieIn,
                     routes:String(ROUTES[0].route), figments:String(canvas.figments[0].f) };
  const tabSetter = { canvas:openCanvas, taxis:openTaxis, choreography:openMovie,
                      routes:setRouteIn, figments:setFigmentIn };

  const canvasText = (cv) =>
    `[Canvas :M ${cv.m} :Figments {${cv.figments.map(f=>f.f).join(" ")}}` +
    ` :Taxeis {${cv.taxeis.join(" ")}} :Shots {${cv.shots.join(" ")}}` +
    ` :Venue ${cv.venue}]`;
  const taxisText = (tx) =>
    `[Taxis :M ${tx.m} :Items {${tx.items.map(i=>i.f).join(" ")}} :Method ${tx.method}` +
    ` :Canvas ${tx.canvas} :Venue ${canvas.venue} :Scene ${tx.scene}` +
    ` :Affects {${tx.affects.join(" ")}} :Telon nil]`;
  const movieText = (mv) =>
    `[Animation :M ${mv.m} :Shots {${mv.shots.join(" ")}} :Source ${mv.source}` +
    ` :Start \\@m{${mv.start}} :Current ${mv.current} :Until \\@m{${mv.until}}` +
    ` :Units ${mv.units} :Rate ${mv.rate} :Speed ${mv.speed} :Loop (R ${mv.loop})]`;
  const routeText = (rt) =>
    `[Route :M ${rt.route} :Waypoints {${rt.waypoints.join(" ")}} :Level (R ${rt.level})` +
    ` :Current ${rt.cursor} :Tries ${rt.tries} :Loop (R Once)` +
    ` :Destination ${rt.dest}]`;
  const figmentText = (fg) =>
    `[Figment :M ${fg.f} :Meshes {${fg.kind==="mesh" ? fg.parts.join(" ") : ""}}` +
    ` :Clouds {${fg.kind==="cloud" ? fg.parts.join(" ") : ""}} :Source ${fg.src}]`;

  const route   = ROUTES.find(r => String(r.route) === routeIn) || null;
  const figment = canvas.figments.find(f => String(f.f) === figmentIn) || null;

  const tabBody = () => {
    if(tab === "canvas")
      return <><Raw text={canvasText(canvas)}/>
        <Cap>{canvas.active ? "the active canvas" : "a stored canvas"} ·
          {canvas.figments.length} figments · {canvas.taxeis.length} sets ·
          {canvas.shots.length} shots</Cap></>;
    if(tab === "taxis")
      return taxis
        ? <><Raw text={taxisText(taxis)}/>
            <Cap>{taxis.method} · {taxis.items.length} items · scene {taxis.scene}</Cap></>
        : <Cap>No Taxis with that monad.</Cap>;
    if(tab === "choreography")
      return movie
        ? <><Raw text={movieText(movie)}/>
            <div style={{marginTop:6, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              <span style={{fontWeight:700, fontSize:11, color:"#fff", borderRadius:4,
                padding:"1px 9px", background:KIND_TINT[movieKind]||C.dim}}>{movieKind}</span>
              <span style={{fontSize:11, color:C.dim}}>{movieSrc.term} · :Source
                {" "}{movie.source} ({movie.sourceRel}) · {movie.reality}</span>
              {movie.shots.map((sh,i) => {
                const vg = VANTAGES[sh];
                return <span key={sh} onClick={()=>{ setVantageIn(String(sh));
                    if(vg) setTaxisIn(String(vg.taxis)); }}
                  style={{padding:"2px 9px", borderRadius:5, fontSize:11, cursor:"pointer",
                    background:String(sh)===vantageIn?"#EFE9F6":C.card,
                    border:`1px solid ${i===movie.current?C.imagined:C.rule}`}}>{sh}</span>;})}
            </div></>
        : <Cap>No Animation with that monad.</Cap>;
    if(tab === "routes")
      return route
        ? <><Raw text={routeText(route)}/>
            <div style={{marginTop:6, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
              {route.waypoints.map((w,i) => <span key={w} style={{display:"flex",
                  alignItems:"center", gap:6}}>
                <span style={{padding:"2px 9px", borderRadius:5, fontSize:11,
                  border:`1px solid ${i===route.cursor?C.observed:C.rule}`,
                  background:i<route.cursor?C.faint:C.card,
                  fontWeight:i===route.cursor?700:400}}>{w}</span>
                {i<route.waypoints.length-1 && <span style={{color:C.dim}}>→</span>}</span>)}
            </div>
            <Cap>planned at {route.level} granularity · leg tries {route.tries}</Cap></>
        : <Cap>No Route with that monad.</Cap>;
    // figments
    return figment
      ? <><Raw text={figmentText(figment)}/>
          <Cap><b>{figment.kind}</b> · {figment.note} · grounded to Object {figment.src}</Cap>
          <div style={{marginTop:4}}>
            {canvas.figments.map(f => <span key={f.f} onClick={()=>setFigmentIn(String(f.f))}
              style={{padding:"2px 9px", marginRight:5, borderRadius:5, fontSize:11,
                cursor:"pointer", background:String(f.f)===figmentIn?"#EFE9F6":C.card,
                border:`1px solid ${C.rule}`}}>{f.kind} {f.f}</span>)}
          </div></>
      : <Cap>No Figment with that monad on this canvas.</Cap>;
  };

  return <div>
    <H>Imagination</H>

    {/* THE MODE BAR.  Which canvas is on the stage, and why. */}
    <div style={{display:"flex", gap:8, alignItems:"center", margin:"6px 0",
        flexWrap:"wrap"}}>
      {["find","live","list"].map(k =>
        <button key={k} onClick={()=>{ setMode(k); if(k!=="find" && chosen) openCanvas(chosen); }}
          style={{padding:"3px 14px", borderRadius:5, cursor:"pointer", fontFamily:mono,
            fontSize:12, fontWeight:mode===k?700:400,
            border:`1px solid ${mode===k?C.imagined:C.rule}`,
            background:mode===k?"#EFE9F6":C.card, color:mode===k?C.imagined:C.dim}}>{k}</button>)}

      {mode==="find" &&
        <input value={findIn} onChange={e=>setFindIn(e.target.value)}
          onKeyDown={e=>{ if(e.key!=="Enter") return;
            const q = findIn.trim();
            const hit = (canvasRows||[]).find(r =>
              String(r.m)===q || String(r.label||"").toLowerCase()===q.toLowerCase());
            if(hit) openCanvas(Number(hit.m));
            else if(/^\d+$/.test(q)) openCanvas(Number(q)); }}
          placeholder="canvas monad or label"
          style={{minWidth:230, fontFamily:mono, fontSize:12, padding:"4px 8px",
            borderRadius:5, border:`1px solid ${C.rule}`, background:C.well2}}/>}

      {mode==="live" && mostSalient &&
        <span style={{fontSize:11, color:C.dim}}>
          most salient across all realities · {mostSalient.pulses} pulses
          {mostSalient.reality && mostSalient.reality!=="none" &&
            <span style={{marginLeft:6, color:REALITY_COLOR[mostSalient.reality]||C.dim,
              fontWeight:700}}>{mostSalient.reality}</span>}
        </span>}

      {mode==="list" && <>
        <span style={{fontSize:11, color:C.dim}}>sort</span>
        {["monad","label"].map(k =>
          <button key={k} onClick={()=>setSortBy(k)}
            style={{padding:"3px 10px", borderRadius:5, cursor:"pointer", fontFamily:mono,
              fontSize:11, border:`1px solid ${sortBy===k?C.observed:C.rule}`,
              background:C.card, color:sortBy===k?C.observed:C.dim}}>{k}</button>)}
        <button onClick={()=>setSortDir(sortDir==="desc"?"asc":"desc")}
          style={{padding:"3px 10px", borderRadius:5, cursor:"pointer", fontFamily:mono,
            fontSize:11, border:`1px solid ${C.rule}`, background:C.card, color:C.dim}}>
          {sortDir==="desc" ? "descending" : "ascending"}</button>
        <span style={{fontSize:11, color:C.dim}}>
          {sortBy==="monad" && sortDir==="desc" ? "newest first" : ""}</span>
      </>}

      <span style={{marginLeft:"auto", fontSize:11,
          color: canvasRows ? C.observed : C.desired}}>
        {canvasRows ? `live · ${canvasRows.length} canvases` : "fixture · no feed"}</span>
    </div>

    {mode==="list" && canvasRows &&
      <div style={{maxHeight:150, overflowY:"auto", border:`1px solid ${C.rule}`,
          borderRadius:6, background:C.card, margin:"0 0 8px"}}>
        {sorted.map(r =>
          <div key={r.m} onClick={()=>openCanvas(Number(r.m))}
            style={{padding:"5px 12px", cursor:"pointer", fontSize:12,
              borderBottom:`1px solid ${C.faint}`,
              background: Number(r.m)===Number(canvasIn) ? C.faint : "transparent"}}>
            <span style={{color:C.observed, fontWeight:700}}>{r.m}</span>
            {r.label && <span style={{marginLeft:8}}>{r.label}</span>}
            <span style={{marginLeft:8, color:C.dim}}>
              {r.figments} figments · {r.taxeis} taxeis · {r.shots} shots</span>
            <span style={{float:"right", color:REALITY_COLOR[r.reality]||C.dim}}>
              {r.pulses} pulses</span>
          </div>)}
      </div>}

    <div style={{display:"flex", gap:14, margin:"10px 0 4px", alignItems:"flex-start",
        flexWrap:"wrap"}}>
      <Box label="canvas"  value={canvasIn}  onChange={openCanvas}  found={true}
           hint={canvas.active ? "active canvas" : "stored canvas"}/>
      <Box label="venue"   value={venueIn}   onChange={openVenue}   found={!!venue}
           hint={venue ? `${venue.scenes.length} scene${venue.scenes.length>1?"s":""} · locale ${venue.locale}` : ""}/>
      <Box label="taxis"   value={taxisIn}   onChange={openTaxis}   found={!!taxis}
           hint={taxis ? `${taxis.method} · ${taxis.items.length} items` : ""}/>
      <Box label="vantage" value={vantageIn} onChange={openVantage} found={!!vantage}
           hint={vantage ? `taxis ${vantage.taxis} · fov ${vantage.fov}` : ""}/>
      <Box label="movie"   value={movieIn}   onChange={openMovie}   found={!!movie}
           hint={movie ? `${movie.shots.length} shots · ×${movie.speed}` : ""}/>
      {!canvas.active && <button onClick={()=>openCanvas(ACTIVE_CANVAS)}
        style={{alignSelf:"center", padding:"4px 12px", borderRadius:5, cursor:"pointer",
          fontFamily:mono, fontSize:11, border:`1px solid ${C.observed}`,
          background:C.faint, color:C.observed}}>back to active</button>}
    </div>

    {/* show / clear, above the stage */}
    <div style={{display:"flex", gap:10, alignItems:"center", margin:"0 0 6px"}}>
      <button onClick={()=>setStaged(true)}
        style={{padding:"4px 18px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          fontSize:12, fontWeight:staged?700:400,
          border:`1px solid ${staged?C.imagined:C.rule}`,
          background:staged?"#EFE9F6":C.card, color:staged?C.imagined:C.dim}}>show</button>
      <button onClick={()=>setStaged(false)}
        style={{padding:"4px 18px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          fontSize:12, fontWeight:!staged?700:400,
          border:`1px solid ${!staged?C.imagined:C.rule}`,
          background:!staged?"#EFE9F6":C.card, color:!staged?C.imagined:C.dim}}>clear</button>
    </div>

    {/* canvas | source */}
    <div style={{display:"flex", gap:4}}>
      {["canvas","source","staging"].map(t => <div key={t} onClick={()=>setPane(t)}
        style={{padding:"5px 16px", fontSize:12, cursor:"pointer",
          borderRadius:"6px 6px 0 0", border:`1px solid ${C.rule}`,
          borderBottom:t===pane?`1px solid ${C.card}`:`1px solid ${C.rule}`,
          background:t===pane?C.card:C.faint,
          color:t===pane?C.ink:C.dim, fontWeight:t===pane?700:400}}>
        {t}</div>)}
    </div>

    <Card style={{marginTop:0, borderRadius:"0 8px 8px 8px"}}>
      <div style={{display:"flex", gap:12, alignItems:"baseline", flexWrap:"wrap"}}>
        <span>canvas <Mono v={N(canvas.m)} color={C.imagined}/></span>
        {canvas.active && <Chip color={C.faint} ink={C.observed}>active</Chip>}
        <span style={{fontSize:12, color:C.dim}}>venue <Mono v={N(canvas.venue)}/></span>
        <span style={{fontSize:12, color:C.dim}}>taxis <Mono v={N(ACTIVE_TAXIS.m)}/></span>
        {movie && <span style={{fontWeight:700, fontSize:11, color:"#fff", borderRadius:4,
          padding:"1px 9px", background:KIND_TINT[movieKind]||C.dim}}
          title={movieSrc.term}>{movieKind}</span>}
        {movie && <span style={{fontSize:12, color:C.dim}}>
          :Source <Mono v={N(movie.source)}/></span>}
        {vantage && <span style={{fontSize:12, color:C.dim, marginLeft:"auto"}}>
          vantage <Mono v={N(vantage.m)}/> · eye [{vantage.eye.join(" ")}] · {M(vantage.when)}</span>}
      </div>

      {pane === "staging"
        ? <div style={{marginTop:6}}>
            <Cap>One Staging per pass: Locator → SetDesigner → Casting → StageManager →
              Cinematographer → Choreographer.</Cap>
            {STAGINGS.map(st => <div key={st.staging} style={{border:`1px solid ${C.rule}`,
                borderRadius:6, padding:"8px 12px", marginTop:8, background:C.well2}}>
              <div style={{display:"flex", gap:12, alignItems:"baseline", flexWrap:"wrap"}}>
                <span style={{fontSize:12}}>staging <Mono v={st.staging}/></span>
                <span style={{fontSize:12, color:C.dim}}>taxis <Mono v={N(st.taxis)}/> ·
                  scene <Mono v={N(st.scene)}/></span>
                <Chip color="#EFE9F6" ink={C.imagined}>tier {st.tier}</Chip>
              </div>
              <div style={{display:"flex", gap:4, marginTop:6, flexWrap:"wrap"}}>
                {st.steps.map(([name,state]) => <span key={name} style={{fontSize:11,
                  padding:"2px 8px", borderRadius:4,
                  border:`1px solid ${state==="pending"?C.desired:C.rule}`,
                  background:state==="done"?C.faint:state==="skip"?C.bg:C.pending,
                  color:state==="done"?C.observed:state==="skip"?C.dim:C.desired}}>
                  {name}{state==="done"?" ✓":state==="skip"?" —":" …"}</span>)}
              </div>
              <Raw text={`[Staging :Taxis ${st.taxis} :Scene ${st.scene}]`}/>
            </div>)}
          </div>
        : pane === "canvas"
        ? (staged
            ? <CanvasStage figments={canvas.figments} affects={ACTIVE_TAXIS.affects}/>
            : <div style={{height:520, marginTop:6, borderRadius:6, background:"#F7F5FB",
                border:`1px solid ${C.rule}`, display:"flex", alignItems:"center",
                justifyContent:"center", color:C.dim, fontSize:12}}>stage cleared</div>)
        : (() => {
            if(!movie) return <Cap>No Animation selected — no source to show.</Cap>;
            if(movieKind === "story"){
              const st = STORIES[movie.source];
              return st ? <Raw text={st.text}/>
                        : <Cap>No Story scheme for {movie.source}.</Cap>;
            }
            if(movieKind === "dream")
              return <Cap>Simulation — sourced from Action <Mono v={N(movie.source)}/>.
                The rehearsal is the canvas itself.</Cap>;
            // video — the percept it was staged from
            const frame = DETECTIONS.find(f => f.frame === movie.source)
                       || DETECTIONS.find(f => f.frame === ACTIVE_TAXIS.scene);
            return <div style={{marginTop:6}}>
              <div style={{display:"flex", gap:8, alignItems:"center"}}>
                <span style={{fontSize:12, color:C.dim}}>Percept</span>
                <Mono v={N(movie.source)} color={C.observed}/>
                <button onClick={()=>navigator.clipboard &&
                    navigator.clipboard.writeText(String(movie.source))}
                  title="copy the percept monad"
                  style={{padding:"2px 10px", borderRadius:4, cursor:"pointer",
                    fontFamily:mono, fontSize:11, border:`1px solid ${C.rule}`,
                    background:C.card, color:C.dim}}>copy</button>
              </div>
              <svg viewBox="0 0 64 64" style={{width:"100%", maxWidth:520, height:340,
                background:ARC_PAL[0], border:`1px solid ${C.rule}`, marginTop:6}}>
                {frame
                  ? frame.objects.map((o,k) => <rect key={k} x={o.x} y={o.y}
                      width={o.w} height={o.h} fill={o.c}
                      stroke={o.mover?C.observed:"none"} strokeWidth={o.mover?0.6:0}/>)
                  : ACTIVE_TAXIS.items.map(it => <circle key={it.f} cx={it.x} cy={it.y}
                      r={2.6} fill={it.c}/>)}
              </svg>
            </div>;})()}
    </Card>

    {/* tabs: canvas · taxis · choreography · routes · figments */}
    <div style={{display:"flex", gap:4, marginTop:12}}>
      {TABS.map(t => <div key={t} onClick={()=>setTab(t)}
        style={{padding:"5px 14px", fontSize:12, cursor:"pointer",
          borderRadius:"6px 6px 0 0", border:`1px solid ${C.rule}`,
          borderBottom:t===tab?`1px solid ${C.card}`:`1px solid ${C.rule}`,
          background:t===tab?C.card:C.faint,
          color:t===tab?C.ink:C.dim, fontWeight:t===tab?700:400}}>{t}</div>)}
    </div>
    <Card style={{marginTop:0, borderRadius:"0 8px 8px 8px"}}>
      <div style={{display:"flex", gap:10, alignItems:"center"}}>
        <span style={{fontSize:11, color:C.dim, whiteSpace:"nowrap"}}>{tab} monad</span>
        <input value={tabValue[tab]}
          onChange={e=>tabSetter[tab](e.target.value.replace(/[^0-9-]/g,""))}
          style={{width:150, padding:"5px 8px", borderRadius:5, fontFamily:mono, fontSize:12,
            background:C.card, color:C.imagined, fontWeight:700, outline:"none",
            border:`1px solid ${C.rule}`}}/>
      </div>
      <div style={{marginTop:6}}>{tabBody()}</div>
    </Card>

  </div>;
}

// ── View: Agenda — the objective queue ───────────────────────

function AgendaView(){
  const N = (m) => String(m);
  const [sortBy, setSortBy] = useState("score");

  const scoreOf = (a) => a.urgency > EMERGENCY ? a.urgency : a.priority + a.urgency;
  const rows = AGENDA.slice().sort((a,b) =>
    sortBy === "score" ? scoreOf(b) - scoreOf(a)
    : sortBy === "priority" ? a.priority - b.priority
    : String(b.since).localeCompare(String(a.since)));

  const PLAN_TINT = { todo:C.dim, plan:C.expected, busy:C.expected,
                      sent:C.observed, fail:C.impeded, done:C.observed };

  return <div>
    <H>Agenda</H>
    <div style={{display:"flex", alignItems:"center", gap:6, margin:"8px 0"}}>
      {["score","priority","newest"].map(k => <button key={k} onClick={()=>setSortBy(k)}
        style={{padding:"3px 12px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          border:`1px solid ${k===sortBy?C.ink:C.rule}`,
          background:k===sortBy?C.faint:C.card,
          color:k===sortBy?C.ink:C.dim, fontSize:12}}>{k}</button>)}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        {AGENDA.length} agenda items · {AGENDA.filter(a=>a.plan==="fail").length} failed</span>
    </div>
    <Scroller>
      {rows.map(a => {
        const sc = scoreOf(a);
        const emergency = a.urgency > EMERGENCY;
        return <Fold key={a.telon} style={{background:C.psycheBg}}
          head={<>
            <span style={{fontWeight:700, fontSize:11, color:"#fff",
              background:PLAN_TINT[a.plan]||C.dim, borderRadius:4, padding:"1px 8px"}}>
              {a.plan.toUpperCase()}</span>
            <span>:Telon <Mono v={N(a.telon)} color={a.telon<0?C.desired:C.observed}/></span>
            <span style={{fontSize:11, color:C.dim, overflow:"hidden",
              textOverflow:"ellipsis"}}>{a.note}</span>
            <span style={{fontSize:12, color:emergency?C.impeded:C.dim, marginLeft:"auto"}}>
              score {sc.toFixed(2)}{emergency && " · emergency"}</span>
          </>}>
          {a.telon<0 && <div style={{fontSize:11, color:C.dim, marginBottom:4}}>dyad of
            {" "}{LEX[Math.abs(a.telon)] || Math.abs(a.telon)} — the need's absence</div>}
          <div style={{fontSize:12, color:C.dim, display:"flex",
              gap:16, flexWrap:"wrap"}}>
            <span>:Priority <b style={{color:C.ink}}>{a.priority}</b></span>
            <span>:Urgency <b style={{color:emergency?C.impeded:C.ink}}>{a.urgency}</b></span>
            <span>:Exec {a.exec.toUpperCase()}</span>
            <span>:For {a.for_}</span>
            <span>:By {a.by==="infinity" ? "infinity" : M(a.by)}</span>
            <span>:Since {M(a.since)}</span>
          </div>
          <div style={{marginTop:4, fontSize:12}}>
            <span style={{color:C.dim}}>attempts against this objective: </span>
            {a.attempts.length
              ? a.attempts.map(x => <Chip key={x}><Mono v={x}/></Chip>)
              : <span style={{color:C.dim}}>none yet</span>}
          </div>
          {/* AGENDUM, singular.  One item is an agendum; the list
              is the agenda.  A tuple is one thing, so its label is
              the singular — the same reason a percept is [PERCEPT]
              and not [Percepts]. */}
          <Raw text={`[Agendum :Telon ${a.telon} :Priority ${a.priority}` +
            ` :Urgency ${a.urgency} :Exec ${a.exec} :Plan ${a.plan}` +
            ` :For (L ${a.for_}) :By ${a.by==="infinity" ? "infinity" : "\\@m{"+a.by+"}"}` +
            ` :Since \\@m{${a.since}}]`}/>
          <Cap>{a.note}</Cap>
        </Fold>;})}
    </Scroller>
    <Cap>Amber objective = a dyad — the state in which a Need is absent, minted by the Ameliorator.</Cap>

  </div>;
}

// ── Attempt composer ─────────────────────────────────────────
//
// Sends a real ATTEMPT.  The premise in the box is the thing that
// goes — edited, not generated from form fields — because the whole
// portal shows the mind's own tuples and the one place you can write
// one should speak the same language.
//
// It posts to /attempt, which writes an action file into the outbox.
// That is EXACTLY the file protocol Eidos speaks, so the portal is a
// device on the same wire rather than a special case: whatever is
// reading the outbox — the transport, or the mind — picks it up
// without knowing the portal exists.

const DEFAULT_ATTEMPT =
  '[ATTEMPT :Act action1 :Parameters {} :Trial 270601\n' +
  '         :Token eidos-7f31\n' +
  '         :From "locus://sol.earth.orb.local.host/mind"\n' +
  '         :Whom "locus://sol.earth.orb.local.host/mind/eidos"]';

function Composer(){
  const [text, setText] = useState(DEFAULT_ATTEMPT);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState(null);
  // WHO IS SENDING, not what happens to it.
  //
  //   test   this composer sends.  The premise goes to Eidos's port
  //          and is played against ARC.
  //   live   GIL's Executor sends.  The composer stands down and
  //          the portal only watches, which is what it does on every
  //          other screen.
  //
  // ONE DOOR either way.  Eidos cannot tell the two senders apart and
  // should not — the difference is about who wrote the tuple, not
  // about what should be done with it.
  const [mode, setMode] = useState("test");

  const send = async () => {
    setBusy(true); setSaid(null);
    try {
      const r = await fetch("/attempt", {
        method: "POST",
        headers: {"Content-Type": "text/plain"},
        body: text,
      });
      const body = await r.json();
      // What comes back is EIDOS'S REPLY, not the portal's opinion of
      // it — a RESULT, or a REFUSED with its reason.  The portal
      // reports; the device decides.
      setSaid(r.ok
        ? {ok: body.label !== "REFUSED", text: body.reply}
        : {ok:false, text:body.error || `HTTP ${r.status}`});
    } catch(e) {
      setSaid({ok:false, text:String(e.message || e)});
    }
    setBusy(false);
  };

  const live = mode === "live";

  return <Card style={{background:C.composeBg, marginBottom:12,
      border:`1px solid #D9CFEC`}}>
    <div style={{display:"flex", gap:10, alignItems:"center"}}>
      <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.expected,
        borderRadius:4, padding:"1px 8px"}}>ATTEMPT</span>
      <Cap>edit the premise, then send</Cap>
      <span style={{fontSize:11, color:C.dim, marginLeft:"auto"}}>mode</span>
      <div style={{display:"flex", border:`1px solid ${C.rule}`,
          borderRadius:6, overflow:"hidden", width:110}}>
        {["test","live"].map(m => <div key={m} onClick={()=>setMode(m)}
          style={{flex:1, textAlign:"center", padding:"3px 0", fontSize:11,
            cursor:"pointer",
            background: m===mode ? (m==="live" ? C.impeded : C.observed) : C.card,
            color: m===mode ? "#fff" : C.dim,
            fontWeight: m===mode ? 700 : 400}}>{m}</div>)}
      </div>
      <button onClick={()=>setText(DEFAULT_ATTEMPT)}
        style={{padding:"2px 10px", borderRadius:4, cursor:"pointer",
          fontFamily:mono, fontSize:11, border:`1px solid ${C.rule}`,
          background:C.card, color:C.dim}}>default</button>
    </div>
    <textarea value={text} onChange={e=>setText(e.target.value)} spellCheck={false}
      rows={5}
      style={{width:"100%", marginTop:6, padding:"8px 10px", borderRadius:5,
        fontFamily:mono, fontSize:11.5, lineHeight:1.55, resize:"vertical",
        background:live?C.bg:"#FBFAFE", color:live?C.dim:C.ink, outline:"none",
        border:`1px solid ${C.rule}`, boxSizing:"border-box"}}/>
    <div style={{display:"flex", gap:10, alignItems:"center", marginTop:6}}>
      {/* The button carries the mode's colour.  A live send is not
          undoable and the state it is in should not need reading. */}
      <button onClick={send} disabled={busy || live}
        title={live ? "GIL is sending — switch to test to send by hand" : ""}
        style={{padding:"4px 22px", borderRadius:5, fontFamily:mono, fontSize:13,
          fontWeight:700, cursor:busy?"default":"pointer",
          border:`1px solid ${(busy||live)?C.rule:C.observed}`,
          background:(busy||live)?C.card:C.faint,
          color:(busy||live)?C.dim:C.observed}}>
        {busy ? "sending" : "send"}</button>
      {said && <span style={{fontSize:12, color:said.ok?C.observed:C.impeded}}>
        {said.text}</span>}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        {live ? "GIL's Executor is sending · the portal is watching"
              : "sends to Eidos"}</span>
    </div>
  </Card>;
}

// ── View: Attempts ────────────────────────────────────────────

function Attempts(){
  const ATTEMPTS = useFeed("portal-attempts.json", MOCK_ATTEMPTS);
  const N = (m) => String(m);
  const [filter, setFilter] = useState("ALL");
  const MAX = 50;
  const devices = ["ALL","Eidos","Expanse"];
  const all = ATTEMPTS.filter(a => filter==="ALL" || a.device===filter);
  const rows = all.slice().sort((a,b)=>String(b.when).localeCompare(String(a.when))).slice(0,MAX);

  // Execution enumeration (perceptual.memory): Idle Sent Wait Late Fail Warn Done
  const EXEC_TINT = { Idle:C.dim, Sent:C.expected, Wait:C.desired, Late:C.desired,
                      Fail:C.impeded, Warn:C.desired, Done:C.observed };

  return <div>
    <H>Actuation attempts</H>
    <div style={{display:"flex", alignItems:"center", gap:6, margin:"8px 0"}}>
      {devices.map(k => <button key={k} onClick={()=>setFilter(k)}
        style={{padding:"3px 12px", borderRadius:5, cursor:"pointer", fontFamily:mono,
          border:`1px solid ${k===filter?C.ink:C.rule}`,
          background:k===filter?C.faint:C.card,
          color:k===filter?C.ink:C.dim, fontSize:12}}>{k}</button>)}
      <span style={{marginLeft:"auto", fontSize:11, color:C.dim}}>
        newest first · showing {rows.length} of {all.length} · list holds {MAX}</span>
    </div>
    <Cap>:Exec — IDLE ready · SENT awaiting reply · WAIT blocked · LATE timed out ·
      FAIL incomplete · WARN completed with warnings · DONE completed.</Cap>
    <div style={{marginTop:10}}><Composer/></div>
    <Scroller>
      {rows.length === 0
        ? <Cap>Nothing dispatched to that device yet.</Cap>
        : rows.map(a => <Fold key={a.m} style={{background:C.psycheBg}}
            head={<>
              <span style={{fontWeight:700, fontSize:11, color:"#fff", background:C.expected,
                borderRadius:4, padding:"1px 8px"}}>ATTEMPT</span>
              <Mono v={a.m} color={C.observed}/>
              <Chip>{a.device}</Chip>
              <span style={{fontSize:12, color:C.dim}}>:Act <Mono v={N(a.act)}/></span>
              <span style={{fontWeight:700, fontSize:11, color:"#fff",
                background:EXEC_TINT[a.exec]||C.dim, borderRadius:4, padding:"1px 8px"}}
                title=":Exec — Execution enumeration">{a.exec.toUpperCase()}</span>
              <span style={{color:C.dim, fontSize:12, marginLeft:"auto"}}>{M(a.when)}</span>
            </>}>
            <div style={{fontSize:12, color:C.dim, marginBottom:2}}>
              :Trial <Mono v={N(a.trial)}/> · :Act <Mono v={N(a.act)}/> ·
              :Whom {a.url}</div>
            <Raw text={a.raw}/>
          </Fold>)}
    </Scroller>

  </div>;
}

// ── View: About — the splash ─────────────────────────────────

function About(){
  return <div style={{display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"70vh", textAlign:"center",
      background:C.aboutBg, borderRadius:10, marginTop:12,
      border:`1px solid ${C.rule}`}}>
    <div style={{fontSize:64, fontWeight:700, color:C.observed, letterSpacing:-1}}>GIL</div>
    <div style={{fontSize:18, color:C.ink, marginTop:2}}>version 2.0</div>
    <div style={{width:120, height:1, background:C.rule, margin:"22px 0"}}/>
    <div style={{fontSize:13, color:C.dim}}>
      Copyright &copy; 2026 SubThought Corp. All Rights Reserved.</div>
  </div>;
}

// ── View: Settings — empty, with vertical tabs ───────────────

const SETTINGS_TABS = [
  { key:"mind",        title:"Mind",
    note:"GIL.daicho — Totality url, adapter, ken root, Agency name, port, skills, heartbeat." },
  { key:"psyches",     title:"Psyches",
    note:"Eidos and Expanse daichos — urls, ports, delays, transports, grid format, per-channel polling." },
  { key:"perception",  title:"Perception",
    note:"Matcher bars — :PerceptScore, :IdentityScore, :Limit — and the detector clauses each world offers." },
  { key:"potentiation",title:"Potentiation",
    note:"Registry windows — activation, forgetting, immediate through extended potentiation." },
  { key:"decision",    title:"Decision",
    note:"Reality, :MinPulses, deliberation cycle, proposer ranks, reaction reliability threshold." },
  { key:"space",       title:"Space",
    note:"Locating and Mapping — landmark score, displacement and velocity thresholds, chunk sizes, BFS depth, route retries." },
  { key:"imagination", title:"Imagination",
    note:"Staging — :TaxisMatch tiers, canvas dimensions, animation rate, speed and loop defaults." },
  { key:"discovery",   title:"Discovery",
    note:"Hypothesis thresholds, prediction window, confidence bar, experiment verdict deltas." },
  { key:"consolidation",title:"Consolidation",
    note:"Forgetting windows and low-usage bar; Automaticity count, reliability and genetic window." },
  { key:"motivation",  title:"Motivation",
    note:"Urge thresholds per device, Coping emergency threshold, drives and their priorities." },
  { key:"portal",      title:"Portal",
    note:"This dashboard — label mode defaults, list caps, tier and totality visibility, refresh rate." },
  { key:"session",     title:"Session",
    note:"Run orchestration — turns per session, sessions per run, hard and idle timeouts, ken wipe." },
];

// ── Session settings — the only pane that is wired ───────────
//
// Sends [CONFIGURE …] to Eidos on the SAME DOOR everything else uses.
// There is no second protocol for configuration: a CONFIGURE is a
// tuple, it carries a token, and it is refused without one exactly as
// an ATTEMPT would be.
//
// Every field is OPTIONAL in the tuple, so this sends only what was
// changed — the portal never has to know or resend the rest.

const SESSION_FIELDS = [
  { key:"Cap",     label:"actions in a world",
    note:"Before Eidos moves on. A MILLION IS EFFECTIVELY NO CAP, and "
       + "that is the default — a small one decides that a world unsolved "
       + "in N acts is not worth more, and that judgement is the session's, "
       + "not the device's.",
    def:"1000000" },
  { key:"Retries", label:"game-over retries",
    note:"ARC permits RESET and continue, so one game over means try "
       + "again rather than done. This bounds how many times.",
    def:"2" },
  { key:"Cycling", label:"cycle the catalogue",
    note:"yes | no. Meeting a world a second time is the interesting "
       + "case — whether anything carried across is the question the "
       + "architecture exists to answer.",
    def:"yes" },
];

function SessionSettings(){
  const [vals, setVals] = useState(
    Object.fromEntries(SESSION_FIELDS.map(f => [f.key, f.def])));
  const [said, setSaid] = useState(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true); setSaid(null);
    const slots = SESSION_FIELDS
      .map(f => `:${f.key} ${vals[f.key]}`).join(" ");
    try {
      const r = await fetch("/attempt", {
        method:"POST", headers:{"Content-Type":"text/plain"},
        body:`[CONFIGURE ${slots} :Token eidos-7f31]`,
      });
      const ct = r.headers.get("content-type") || "";
      if(!ct.includes("json")) {
        setSaid({ok:false, text:"the portal server is not answering — "
          + "is gil_serve.py running on 4390?"});
        setBusy(false); return;
      }
      const body = await r.json();
      setSaid({ok: body.label !== "REFUSED", text: body.reply});
    } catch(e) { setSaid({ok:false, text:String(e.message || e)}); }
    setBusy(false);
  };

  // THE HELP IS ASKED FOR, NOT IMPOSED.  Three paragraphs of
  // reasoning under three fields makes a settings pane that has to be
  // read rather than used — and the reasoning still has to be
  // somewhere, so it goes behind a mark you can hover.
  const [asked, setAsked] = useState(null);

  return <div>
    {SESSION_FIELDS.map(f => <div key={f.key}
        style={{display:"flex", gap:10, alignItems:"baseline",
          marginTop:12, position:"relative"}}>
      <span style={{fontSize:12, width:150, color:C.dim}}>{f.label}</span>
      <input value={vals[f.key]}
        onChange={e=>setVals({...vals, [f.key]:e.target.value})}
        style={{width:130, padding:"3px 8px", fontFamily:mono, fontSize:12,
          borderRadius:4, border:`1px solid ${C.rule}`, background:C.card,
          color:C.ink, outline:"none"}}/>

      <span style={{fontSize:11, color:C.dim}}>:{f.key}</span>

      {/* AFTER the slot name — the mark belongs at the end of the
          row, where it is out of the way of reading it.

          title= gives the native tooltip, which is what a keyboard or
          a screen reader will find; the panel below is the one that
          can hold a sentence worth reading. */}
      <span onMouseEnter={()=>setAsked(f.key)}
        onMouseLeave={()=>setAsked(null)}
        title={f.note}
        style={{display:"inline-flex", alignItems:"center",
          justifyContent:"center", width:15, height:15, borderRadius:8,
          fontSize:10, fontWeight:700, cursor:"help", userSelect:"none",
          border:`1px solid ${asked===f.key?C.observed:C.rule}`,
          background:asked===f.key?C.observed:C.card,
          color:asked===f.key?"#fff":C.dim}}>?</span>

      {asked === f.key &&
        <div style={{position:"absolute", left:160, top:24, zIndex:20,
          maxWidth:430, padding:"8px 11px", borderRadius:6,
          background:C.card, border:`1px solid ${C.observed}`,
          boxShadow:"0 2px 10px rgba(0,0,0,0.10)",
          fontSize:11.5, lineHeight:1.55, color:C.ink}}>{f.note}</div>}
    </div>)}

    <div style={{display:"flex", gap:10, alignItems:"center", marginTop:18}}>
      <button onClick={send} disabled={busy}
        style={{padding:"4px 22px", borderRadius:5, fontFamily:mono, fontSize:13,
          fontWeight:700, cursor:busy?"default":"pointer",
          border:`1px solid ${busy?C.rule:C.observed}`,
          background:busy?C.card:C.faint, color:busy?C.dim:C.observed}}>
        {busy ? "sending" : "apply"}</button>
      {said && <span style={{fontSize:11, color:said.ok?C.observed:C.impeded,
        fontFamily:mono}}>{said.text}</span>}
    </div>
    <div style={{marginTop:14}}>
      <Cap>sent as a premise, on the same door as every other tuple</Cap>
    </div>
  </div>;
}

// EVERY SETTING ON THE SETTINGS PAGE.
//
// The daichos are the source, and most of what they hold is BOOT-TIME
// — read at start, and a change means a restart, not a tuple.  So the
// pane shows those values read-only, each with the same hover-? the
// Session pane uses, rather than pretending an edit would take.
//
// WHERE A SETTING HAS A LIVE CONSUMER it is editable and sent, and
// only there.  A screen that let you change a port the server already
// bound would be a screen that lied about what it did.
//
// The values below are the DAICHO DEFAULTS, shown so the pane is never
// blank before /portal-config.json arrives.  The knowledge-base url
// and the live addresses come from that endpoint, which is the mind's
// own answer to "what am I attached to".

const DAICHO_SETTINGS = {
  mind: { file:"GIL.daicho", live:false, fields:[
    ["Learners.Active","Sal","which learner this dashboard opens on"],
    ["Learners.Roster","{Sal}","every learner this installation knows"],
    ["Learner.Id","Sal","what everything names a learner by — the roster, the dashboard, a LEARNER tuple"],
    ["Learner.Name","\"Sal\"","what an operator reads. Separate from :Id, because a display name may change and an identifier may not"],
    ["Learner.Registrar","tcp://127.0.0.1:4240/registrar","the one configured url per learner"],
    ["Learner.Home","g:/…/1.0/gil/","what it takes to START one — a stopped learner answers nothing"],
    ["Learner.Being","src/axioms/gil.being","its entry point"],
    ["Learner.Record","etc/log/sal/","per learner, or two overwrite each other's feed"],
    ["Name","GIL","the mind's name"],
    ["Version","1.0.0","this is GIL 1.0 — u-GIL was 3.0"],
    ["note","[Machine] is the Premise Abstract Machine","the evaluator's own home, in premise.daicho — not a learner's"],
    ["Totality.Url","(from the mind)","the shared knowledge base — read from portal-config"],
    ["Totality.Adapter","ephemeral-kb","how the Totality is stored"],
    ["Agency.Port","50913","the mind's own port"],
    ["Agency.Heartbeat","@m{35}","how often the mind reports it is alive"],
  ]},
  psyches: { file:"Eidos.daicho", live:false, fields:[
    ["Psyche.Url","tcp://127.0.0.1:4310/eidos","Eidos's one door"],
    ["Psyche.Transport","https","https · file · replay"],
    ["Psyche.Mode","test","test — the portal grants · live — the Registrar does"],
    ["Psyche.Portal","yes","write the message record for the portal to read"],
    ["API.KeyFile","./pkg/eidos/arc/eidos-arc-api-key.uuid","the ARC key's path — the key never shown"],
    ["API.Game","ls20","the game, resolved to its full id at open"],
    ["Raster.W / H","1024 / 1024","the rasterised frame size"],
  ]},
  perception: { file:"GIL.daicho", live:false, fields:[
    ["Matcher.MinScore","0.95","the Matcher's own similarity bar"],
    ["Perceiver.MinScore","1.0","the Perceiver's bar — 1.0 means exact, until measured"],
    ["Perceiver.History","50","how many Remindings the ring keeps"],
    ["Seen.MinScore","0.92","the Seen detector's own bar"],
    ["note","~ is the similarity match","the bar is per mechanism, absent means 1.0"],
  ]},
  potentiation: { file:"Registry.daicho", live:false, fields:[
    ["Immediate","…","the seven potentiation windows"],
    ["Working","…",""], ["Short","…",""], ["Nominal","…",""],
    ["Long","…",""], ["Extended","…",""], ["Permanent","…",""],
  ]},
  decision: { file:"Coordination.daicho", live:false, fields:[
    ["Deliberator.Cycle","…","the deliberation cycle"],
    ["Reactor.Reliability","0.8","the reflex reliability threshold"],
    ["Ameliorator.Emergency","0.8","the objective-score emergency rule"],
  ]},
  space: { file:"Registry.daicho", live:false, fields:[
    ["Mapping.MinChunk","5","a chunk is at least this — below it there is nothing yet to be a grouping of"],
    ["Mapping.MaxChunk","9","and at most this. Miller's band, at every rung above Venue"],
    ["Mapping.MaxPanorama","16","scenes per venue: 360 / FOV with overlap — arithmetic, not a chunk size"],
    ["Mapping.Drift","0.05","how far a landmark may appear to move and still count as unmoved"],
    ["Navigator.Depth","7","BFS depth over the learned graph"],
    ["note","a chunk is made once and closed","nothing splits, nothing merges, nothing accretes"],
  ]},
  imagination: { file:"GIL.daicho", live:false, fields:[
    ["Portal.Canvases","50","the Imagination list-mode bound"],
    ["default mode","live","find · live · list"],
    ["Staging.TaxisMatch","…","the staging match tiers"],
  ]},
  discovery: { file:"Registry.daicho", live:false, fields:[
    ["Discovery.Confirm","…","the discovery confirmation bar"],
    ["Discovery.Window","…","the prediction window"],
  ]},
  consolidation: { file:"Consolidation.daicho", live:false, fields:[
    ["Recycling.Enabled","no","now inside the closing paren — it was dead text"],
    ["Recycling.Window","300000","the potentiation window, ms"],
    ["Automaticity.Count","…","firings before a skill automates"],
  ]},
  motivation: { file:"Reflection.daicho", live:false, fields:[
    ["MetaControl.FaultEscalation","3","faults before Modifier suspends rather than restarts"],
    ["Monitor.Delay","@m{500}","the health-check cycle"],
  ]},
  portal: { file:"GIL.daicho", live:false, fields:[
    ["Dashboard.Autostart","yes","start the stack from gil.being"],
    ["Dashboard.Url","http://127.0.0.1:4390","where the portal serves"],
    ["Portal.Url","tcp://127.0.0.1:4250/portal","the mind's Portal agent"],
    ["Competency.Url","tcp://127.0.0.1:5090/competency","Monitoring, for competency toggles"],
  ]},
};

function DaichoSettings({tab}){
  const spec = DAICHO_SETTINGS[tab];
  const [cfg, setCfg] = useState(null);
  const [asked, setAsked] = useState(null);

  // THE MIND'S OWN ANSWER to what it is attached to.  One GET; if it
  // 404s the mind is not up, and the daicho defaults stand.
  useEffect(() => {
    let alive = true;
    fetch("/portal-config.json", {cache:"no-store"})
      .then(r => r.ok ? r.json() : null)
      .then(j => { if(alive && j && !j.error) setCfg(j); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if(!spec) return <div style={{marginTop:60, textAlign:"center", color:C.dim,
    fontSize:12}}>Not wired yet.</div>;

  const value = (label, def) => {
    if(!cfg) return def;
    if(label === "Totality.Url") return cfg.kb || def;
    if(label === "Psyche.Url")   return cfg.eidos ? `tcp://${cfg.eidos}/eidos` : def;
    if(label === "Portal.Url")   return cfg.portal_agent ? `tcp://${cfg.portal_agent}/portal` : def;
    return def;
  };

  return <div>
    <div style={{display:"flex", gap:8, alignItems:"baseline", margin:"4px 0 10px"}}>
      <Chip color={C.faint}>{spec.file}</Chip>
      <span style={{fontSize:11, color:C.dim}}>
        {spec.live ? "editable — a live consumer applies it"
                   : "read at start · a change means a restart"}</span>
      {cfg && <span style={{marginLeft:"auto", fontSize:11, color:C.observed}}>
        attached · {cfg.kb}</span>}
    </div>

    {spec.fields.map(([label, def, note], i) => label === "note"
      ? <div key={i} style={{margin:"10px 0 0", fontSize:11.5, color:C.dim,
          fontStyle:"italic"}}>{def} — {note}</div>
      : <div key={i} style={{display:"flex", gap:10, alignItems:"baseline",
          marginTop:10, position:"relative"}}>
        <span style={{fontSize:12, width:170, color:C.dim}}>{label}</span>
        <span style={{fontFamily:mono, fontSize:12, color:C.ink, minWidth:180,
          padding:"3px 8px", background:C.well2, borderRadius:4,
          border:`1px solid ${C.rule}`}}>{value(label, def)}</span>
        {note && <span onMouseEnter={()=>setAsked(i)} onMouseLeave={()=>setAsked(null)}
          title={note}
          style={{display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:15, height:15, borderRadius:8, fontSize:10, fontWeight:700,
            cursor:"help", userSelect:"none",
            border:`1px solid ${asked===i?C.observed:C.rule}`,
            background:asked===i?C.observed:C.card,
            color:asked===i?"#fff":C.dim}}>?</span>}
        {asked === i && note &&
          <div style={{position:"absolute", left:180, top:22, zIndex:20,
            maxWidth:430, padding:"8px 11px", borderRadius:6, background:C.card,
            border:`1px solid ${C.observed}`, boxShadow:"0 2px 10px rgba(0,0,0,0.10)",
            fontSize:11.5, lineHeight:1.55, color:C.ink}}>{note}</div>}
      </div>)}
  </div>;
}

function Settings(){
  const [tab, setTab] = useState(SETTINGS_TABS[0].key);
  const current = SETTINGS_TABS.find(t => t.key === tab);
  return <div>
    <H>Settings</H>
    <div style={{display:"flex", gap:0, marginTop:8, alignItems:"stretch"}}>
      {/* vertical tabs */}
      <div style={{width:170, flexShrink:0, borderRight:`1px solid ${C.rule}`}}>
        {SETTINGS_TABS.map(t => <div key={t.key} onClick={()=>setTab(t.key)}
          style={{padding:"7px 12px", fontSize:12, cursor:"pointer",
            borderLeft:t.key===tab?`3px solid ${C.observed}`:"3px solid transparent",
            background:t.key===tab?C.card:"transparent",
            color:t.key===tab?C.ink:C.dim,
            fontWeight:t.key===tab?600:400}}>{t.title}</div>)}
      </div>
      {/* the pane */}
      <div style={{flex:1, padding:"0 0 0 18px"}}>
        <Card style={{marginTop:0, minHeight:420}}>
          <div style={{fontSize:14, fontWeight:600}}>{current.title}</div>
          <Cap>{current.note}</Cap>
          {tab === "session"
            ? <SessionSettings/>
            : <DaichoSettings tab={tab}/>}
        </Card>
      </div>
    </div>
  </div>;
}

// ── Shell ─────────────────────────────────────────────────────

// The rail reads top to bottom as: what the mind received, what it
// concluded, what it is allowed to do, and what we are asking it.
// LEARNER IS FIRST, because every other screen is about a particular
// mind and the operator should never be in doubt which.  A percept
// shown under the wrong learner's name is worse than no percept.
//
// Then the rail reads: what the mind received, what it concluded,
// where it is, what it is allowed to do, and what we are asking it.
const VIEWS = [
  ["Learner", Learner],
  ["Psyches", Psyches], ["Percepts", Percepts], ["Association", Association],
  ["Cases", Cases], ["Activation", ActivationCube], ["Ontology", Ontology],
  ["Mapper", Mapper],
  ["Imagination", Imagination], ["Agenda", AgendaView], ["Attempts", Attempts],
  ["Competencies", Competencies], ["Signals", Signals],
  ["About", About], ["Settings", Settings],
];

export default function GilPortal(){
  const [view, setView] = useState(
    VIEWS.findIndex(([n]) => n === "About"));            // About is the splash
  const [casesProbe, setCasesProbe] = useState(null);  // Association -> Cases hand-off
  const openCases = (payload) => {
    setCasesProbe({...payload, at: Date.now()});
    setView(VIEWS.findIndex(([n]) => n === "Cases"));
  };
  const [live, setLive] = useState(true);
  const [moment, setMoment] = useState(momentOf());
  useEffect(() => {
    if(!live) return;
    const t = setInterval(()=>setMoment(momentOf()), 250);
    return ()=>clearInterval(t);
  }, [live]);
  const Active = VIEWS[view][1];

  return <div style={{background:C.bg, color:C.ink, fontFamily:mono, fontSize:14,
      minHeight:"100vh", display:"flex"}}>
    {/* rail */}
    <div style={{width:158, background:C.rail, borderRight:`1px solid #C3DAD4`,
        padding:"14px 0", flexShrink:0}}>
      <div style={{padding:"0 16px 2px", fontWeight:700, color:C.observed, fontSize:16}}>GIL</div>
      <div style={{padding:"0 16px 12px", fontSize:11, color:C.railDim}}>portal · 1.0</div>
      {/* On a light rail the selected row takes the CARD colour, so it
          reads as the surface the page is attached to, and the marker
          rule is the deep teal for contrast against the wash. */}
      {VIEWS.map(([name],i) => <div key={name} onClick={()=>setView(i)}
        style={{padding:"8px 16px", cursor:"pointer", fontSize:13,
          background:i===view?C.card:"transparent",
          borderLeft:i===view?`3px solid ${C.observed}`:"3px solid transparent",
          color:i===view?C.observed:C.railInk, fontWeight:i===view?600:400}}>{name}</div>)}
    </div>
    {/* main */}
    <div style={{flex:1, padding:"12px 26px 40px", maxWidth:1000}}>
      <div style={{display:"flex", gap:18, alignItems:"baseline", borderBottom:`1px solid ${C.rule}`,
          paddingBottom:8, fontSize:12, color:C.dim}}>
        <span style={{color:C.ink, fontWeight:700}}>GIL 1.0</span>
        <span>mind <b style={{color:C.ok}}>healthy</b></span>
        <span>moment <b style={{color:C.ink}}>{M(moment)}</b></span>
        <span>session <b style={{color:C.ink}}>7/16</b></span>
        <span>psyches <b style={{color:C.ink}}>2</b></span>
        <span>game <b style={{color:C.ink}}>ls20 · level 2</b></span>
        <button onClick={()=>setLive(l=>!l)} style={{marginLeft:"auto", padding:"2px 12px",
          borderRadius:5, cursor:"pointer", fontFamily:mono, fontSize:12,
          border:`1px solid ${live?C.observed:C.rule}`,
          background:live?C.faint:C.card, color:live?C.observed:C.dim}}>
          {live?"live":"paused"}</button>
      </div>
      <Active onOpenCases={openCases} casesProbe={casesProbe}/>
    </div>
  </div>;
}
