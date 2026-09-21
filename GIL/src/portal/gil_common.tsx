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
//  gil_common.tsx — what every screen shares.
//
//  THE PALETTE, THE PARTS, AND THE PLUMBING.  Nothing in here knows
//  what a percept is or what the mind does; it is the vocabulary the
//  screens are written in.
//
//  WHY THIS FILE EXISTS.
//
//  The two new screens began life with their own copy of the palette
//  and their own H, Chip, Card and Button, because the dashboard
//  exported none of them.  That is a colour defined twice and a card
//  drawn two ways, and the day one is changed and the other is not,
//  the portal stops looking like one thing.
//
//  The division is by WHAT A FILE IS, not by when it was written:
//
//    gil_common.tsx      the palette, the parts, the hooks
//    gil_screens.tsx     the screens that read the KNOWLEDGE BASE
//    gil_dashboard.tsx   the screens that read the MESSAGE record,
//                        and the shell that holds them all
//
//  Anything used by more than one screen belongs here.  Anything used
//  by one belongs with that screen.  That rule is the whole of the
//  maintenance policy, and it is why the duplication cannot come back.
//
// *************************************************************************************

import React, { useState, useEffect } from "react";

// ── §1  THE PALETTE ──────────────────────────────────────────────
//
//  ONE DEFINITION.  Imported by every screen, including the ones that
//  have not been written yet.

export const C = {
  bg:"#EEF5F3", ink:"#1C1B18", card:"#FFFFFF", rule:"#C3DAD4",
  dim:"#6E837F", faint:"#DCEBE7", well:"#14201E",
  observed:"#0B5D52", desired:"#8C6000", expected:"#1B5C9E",
  imagined:"#6B4E9E", multi:"#FFFFFF", impeded:"#A33B2E",
  ok:"#0B5D52",
  rail:"#DCEBE7", railInk:"#2A4C47", railDim:"#6E948D",
  aboutBg:"#E4F0ED",
  // washes used inline: a code well, a "need" chip, a pending state
  well2:"#F4FAF8", need:"#DDEEEA", pending:"#EAF4F0",
  // BEIGE IS THE RECORD COLOUR.  Psyches, Association, Agenda and
  // Attempts all show rows the mind actually wrote, each with its
  // verbatim premise beneath it — so they share a surface, and the
  // teal chrome stays for everything that is a control or a view.
  //
  // The Cases matching panel takes it too: traits are the probe, and
  // the beige marks the input side of the graph.
  psycheBg:"#F7F3E9",
  // The composer is the one card you WRITE in rather than read.
  // Purple separates it from the beige record cards below, so the
  // thing being composed is never mistaken for a thing that happened.
  composeBg:"#F1EDF8",
  traitBg:"#F7F3E9",
  // The two heterarchy views clear to light grey rather than white.
  // White is the page, and a white canvas has no edge — the scene
  // appeared to float rather than to sit in a window.
  stageClear:0xF2F2F0,
};
export const REALITY_COLOR = { Observed:C.observed, Desired:C.desired, Expected:C.expected, Imagined:C.imagined };
export const mono = "ui-monospace, Menlo, Consolas, monospace";

// ── Lexicon: monad → :L / Lexeme label, where one exists ─────


// ── §2  THE LEXICON AND THE MOMENT ───────────────────────────────

export const LEX = {
  261044:"carry-left", 261051:"probe-up", 261058:"long-carry", 261040:"hop-right",
  260518:"lvl2-progress", 260231:"the-piece", 260242:"the-plate", 260255:"the-cross",
  100411:"arrangement-A7", 100563:"delta-3c", 220311:"chamber-west",
  220314:"chamber-mid", 220317:"chamber-portal", 810144:"cause-gate?",
  812403:"predict-open", 210411:"region-9", 213558:"region-14",
  270311:"set-mid-A", 270305:"set-west-B", 270400:"canvas-mid",
  270312:"fig-piece", 270313:"fig-plate", 270318:"fig-cross",
  1000733:"adopts-token", 1000740:"cross-adopts-plate",
  230406:"power", 230411:"efficiency",
};
// Premise moment: 16 digits — YYYY | day-of-year/365.25*1000 | hour/24*100
// | min/60*100 | sec/60*100 | milliseconds.  (moment) -> \@m{2026682585103415}
export function momentOf(d: any = new Date()){
  const y = d.getFullYear();
  const doy = Math.floor((Number(d) - Number(new Date(y,0,0))) / 86400000);
  const p = (n,w) => String(n).padStart(w,"0");
  return `${y}${p(Math.round(doy/365.25*1000),3)}` +
         `${p(Math.floor(d.getHours()/24*100),2)}` +
         `${p(Math.floor(d.getMinutes()/60*100),2)}` +
         `${p(Math.floor(d.getSeconds()/60*100),2)}` +
         `${p(d.getMilliseconds(),3)}`;
}
export const M = (v: any) => `\\@m{${v}}`;

export const nameOf = (m: any, useLabels: any) => (useLabels && LEX[Math.abs(m)])
  ? (m<0 ? "¬"+LEX[-m] : LEX[m]) : String(m);

// ── Mock Totality (one LS20 session, ~moment 4200) ────────────

// The registration message each Psyche submits to the Registrar, verbatim,
// plus the [REGISTERED :Token …] the Registrar returned.

// The threshold above which a relation is the mind's OWN — a relation
// it created rather than one it was given.  Written (L label) when a
// Lexeme has named it, (R Name) when it is one of the built-ins.
export const AUTOGENOUS = 1000000;   // self-created relations start here

// :R is a number.  Below the autogenous threshold it is an enumerated
// Relationships value, written (R Name); at or above it, a self-created
// relation, written (L label) when the Lexeme has one.
export const relText = (rNum, rName) =>
  rNum >= AUTOGENOUS
    ? (LEX[rNum] ? `(L ${LEX[rNum]})` : String(rNum))
    : `(R ${rName})`;


// ── §3  THE PARTS ────────────────────────────────────────────────
//
//  Small, and deliberately dumb.  A part that knows which screen it
//  is on is a part that cannot be used on the next one.
//
//  Card is declared before Fold, which uses it.  It was the other way
//  round in the original — legal, because a const arrow is hoisted
//  into scope by the module, but it reads as though Fold came first.

export const Card = ({children, style, ...rest}: any) => (
  <div {...rest} style={{background:C.card, border:`1px solid ${C.rule}`, borderRadius:8,
    padding:"12px 16px", margin:"10px 0", ...style}}>{children}</div>
);

export const Chip = ({children, color=C.faint, ink=C.ink, title}: any) => (
  <span title={title} style={{display:"inline-block", background:color, color:ink,
    borderRadius:4, padding:"1px 7px", margin:"2px 3px 2px 0", fontSize:12}}>{children}</span>
);
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
export const Fold = ({head, children, style, ...rest}: any) => {
  const [open, setOpen] = useState(false);
  return <Card style={{padding:"5px 12px", ...style}} {...rest}>
    <div onClick={()=>setOpen(o=>!o)}
      title={open ? "collapse" : "expand"}
      style={{display:"flex", gap:10, alignItems:"baseline", cursor:"pointer",
        flexWrap:"nowrap", overflow:"hidden", whiteSpace:"nowrap"}}>
      <span style={{color:C.dim, fontSize:10, width:9, flexShrink:0}}>
        {open ? "\u25be" : "\u25b8"}</span>
      {head}
    </div>
    {open && <div style={{marginTop:6, whiteSpace:"normal"}}>{children}</div>}
  </Card>;
};

export const H = ({children}: any) => <div style={{color:C.expected, fontSize:15, fontWeight:600, margin:"18px 0 4px"}}>{children}</div>;
export const Cap = ({children}: any) => <div style={{color:C.dim, fontSize:12}}>{children}</div>;
// AN ABSENT text IS NOT A CRASH.  A feed can be mid-write, or a field
// can be missing because the mind has not produced it yet — and
// text.split on undefined takes the whole page down, which is what a
// mismatched field name did.  A dash says "nothing here" and the rest
// of the screen survives.
export const Raw = ({text}: any) => (
  <pre style={{margin:"6px 0 0", padding:"8px 10px", background:C.well2,
    border:`1px solid ${C.rule}`, borderRadius:5, fontSize:11.5, lineHeight:1.55,
    whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:mono,
    color:text ? C.ink : C.dim}}>
    {!text ? "—" : String(text).split(/(:[A-Za-z]+)/g).map((part,i) =>
      part.startsWith(":")
        ? <span key={i} style={{color:C.expected, fontWeight:700}}>{part}</span>
        : <span key={i}>{part}</span>)}
  </pre>);

// A FIXED HEIGHT AND A PERSISTENT TRACK.  `maxHeight` with `auto`
// hides the scrollbar until the content happens to overflow, and with
// folded rows it rarely does — so the box had no edge and no sign it
// was a window onto a longer list.  `height` plus `scroll` gives it
// both, and the list no longer resizes as rows are opened and closed.
export const Scroller = ({children, height=560}: any) => (
  <div style={{height, overflowY:"scroll", overflowX:"hidden",
    border:`1px solid ${C.rule}`, borderRadius:8, background:C.bg,
    padding:"2px 10px 10px"}}>{children}</div>);

export const Mono = ({v, color=C.ink}: any) => <span style={{fontWeight:700, color}}>{v}</span>;


// ── §4  THE FEED ─────────────────────────────────────────────────

// ── the feed ──────────────────────────────────────────────────
//
// Each view reads its file and FALLS BACK TO ITS MOCK when there is
// none.  That is what lets the portal work with nothing attached —
// and it means a view is never blank because a device is down, only
// because the mind has genuinely produced nothing.
//
// Polled rather than pushed.  A socket would be fewer round trips and
// one more thing to be running; the files are already on disk and the
// cost of asking for them is a conditional GET.

export function useFeed(name: string, fallback: any, every: number = 1200){
  const [rows, setRows] = useState(fallback);
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch(`/${name}`, {cache:"no-store"});
        if(!r.ok) return;
        // A NON-JSON REPLY IS A ROUTING PROBLEM, not a device problem.
      // Vite's dev server answers unknown routes with index.html, so
      // "<!DOCTYPE" here means the request reached the wrong process —
      // and saying so is worth more than letting JSON.parse throw.
      const ct = r.headers.get("content-type") || "";
      if(!ct.includes("json")) {
        // setSaid and setBusy belong to the COMPOSER, not to this
        // hook — they were copied in with the content-type check and
        // are not in scope here, so a non-JSON reply threw a
        // ReferenceError inside the try and was swallowed as "no
        // feed".  The check is worth keeping; the setters are not.
        console.warn(`/${name} answered ${ct || "nothing"} — `
          + "is gil_serve.py running on 4390?");
        return;
      }
      const body = await r.json();
        // An EMPTY feed is not the same as no feed.  A device that has
        // registered and perceived nothing should show nothing, not
        // fall back to a fixture and look busy.
        if(alive && Array.isArray(body)) setRows(body);
      } catch(e) { /* no feed: the fallback stands */ }
    };
    pull();
    const id = setInterval(pull, every);
    return () => { alive = false; clearInterval(id); };
  }, [name, every]);
  return rows;
}


// ── §5  THE FRAME ────────────────────────────────────────────────

// ── Frame — the PNG at a percept's address ────────────────────
//
// THE FILE IS THE ARTEFACT.  This is the image Eidos actually
// produced and the detectors actually read — not a re-render of the
// same data.  A second renderer can disagree with the first and give
// you no way to tell which is wrong, so the portal displays the
// evidence rather than reproducing it.
//
//    frame://eidos/<guid>   ->   /frames/in/eidos_percept_<guid>.png
//
// A frame that 404s has been COLLECTED, which is correct behaviour
// and not an error — consolidation removes what the mind never made
// anything of.
export const frameSrc = (address: any) => {
  if(!address) return null;
  const guid = String(address).replace(/^frame:\/\/eidos\//, "");
  return `/frames/in/eidos_percept_${guid}.png`;
};

export const FrameImage = ({address, style}: any) => {
  const [gone, setGone] = useState(false);
  const src = frameSrc(address);
  if(!src || gone) {
    return <div style={{...style, display:"flex", alignItems:"center",
        justifyContent:"center", background:C.bg, color:C.dim, fontSize:12}}>
      {src ? "collected" : "no address"}</div>;
  }
  return <img src={src} alt="" onError={()=>setGone(true)}
    style={{...style, objectFit:"contain",
      // PIXELATED, deliberately.  The board is 64 cells upscaled ×16;
      // smoothing it would invent edges that were never in the data —
      // the same reason the rasteriser refuses interpolation.
      imageRendering:"pixelated"}}/>;
};


// ── §6  TALKING TO THE MIND ──────────────────────────────────────
//
//  TWO DOORS, AND THE DIFFERENCE MATTERS.
//
//    /attempt   a tuple to whoever receives it, routed by its label.
//               A REGISTER goes to the Registrar, an ATTEMPT to the
//               device, a PERCEPT to the Perceiver.  The server
//               routes; it does not interpret.
//
//    /kb        a question for the mind's Portal agent — a search
//               over Cases, a canvas by label, or a note of which
//               screen is being watched.  What a polled file cannot
//               answer.
//
//  The portal is a VIEWER everywhere else.  These two are the only
//  places it speaks, and they are here so that stays countable.

export async function sendTuple(tuple: string){
  const r = await fetch("/attempt", {method:"POST", body:tuple});
  const j = await r.json();
  if(!r.ok || j.error) throw new Error(j.error || "send failed");
  return j.reply;
}

export async function kbQuery(tuple: string){
  const r = await fetch("/kb", {method:"POST", body:tuple});
  const j = await r.json();
  if(!r.ok || j.error) throw new Error(j.error || "query failed");
  return j.reply;
}

// WHICH SCREEN IS BEING WATCHED.
//
// portal.theory writes one feed per pass — the one for the screen
// that is up — because walking the whole activation space once a
// second for a view nobody has open is work taken from the world.
//
// Best effort: a portal that cannot say so still polls, it simply
// polls something the mind may not be refreshing.
export function watching(screen: string){
  fetch("/kb", {method:"POST", body:`[WATCHING :Screen ${screen}]`}).catch(() => {});
}

// A FEED THAT REPORTS WHETHER IT IS LIVE.
//
// useFeed above returns rows and says nothing about where they came
// from, which is right for the screens that have always had a mock.
// A screen showing the KNOWLEDGE BASE needs to say which it is
// showing, because a fixture that looks live is a lie about the mind.
export function useKB(name: string, fixture: any, screen: string = null,
                      every: number = 1200){
  const [rows, setRows] = useState(fixture);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if(screen) watching(screen);

    const pull = async () => {
      try {
        const r = await fetch(`/portal-${name}.json`, {cache:"no-store"});
        if(!r.ok) throw new Error(`no feed yet (${r.status})`);
        const ct = r.headers.get("content-type") || "";
        if(!ct.includes("json")) throw new Error("the portal server is not answering");
        const body = await r.json();
        if(!alive) return;
        if(body && body.error) throw new Error(body.detail || body.error);
        setRows(body); setLive(true); setError(null);
      } catch(e){
        if(!alive) return;
        setLive(false); setError(String(e.message || e));
      }
    };

    pull();
    const id = setInterval(pull, every);
    return () => { alive = false; clearInterval(id); };
  }, [name, screen, every]);

  return { rows, live, error };
}

export const LiveBadge = ({live, error}: any) => (
  <span style={{marginLeft:"auto", fontSize:11, color: live ? C.observed : C.desired}}>
    {live ? "live · from the knowledge base" : `fixture · ${error || "no feed"}`}
  </span>
);

export const Button = ({children, onClick, tone = C.observed, disabled = false}: any) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:"4px 14px", borderRadius:5, fontFamily:mono, fontSize:12,
    border:`1px solid ${disabled ? C.rule : tone}`,
    background: disabled ? C.faint : C.card,
    color: disabled ? C.dim : tone,
    cursor: disabled ? "default" : "pointer",
  }}>{children}</button>
);
