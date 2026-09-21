#!/usr/bin/env python3
# *************************************************************************************
#
#  Copyright(c) 2013-2026 SubThought Corporation. All Rights Reserved.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
#  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
#
# *************************************************************************************
"""gil_serve.py — serves the built portal and the feed.

THE PORTAL IS A VITE APPLICATION.  It is built with npm, not served
from source — `gil_dashboard.tsx` is 2,000 lines of TypeScript with
three.js in it, and nothing transpiles that in a browser.

    npm install
    npm run build          ->  etc/log/portal/

This serves that build, plus the JSON feed the mind writes beside it.
It is NOT a replacement for `npm run dev`, which has hot reload and is
what you want while editing the portal.  This is for running the
portal against a live mind without a node toolchain in the loop.

    /                        -> /portal/index.html, the built app
    /portal/*                the bundle
    /portal-*.json           the JSON feed render.theory writes
    /*.html                  the HTML windows render.theory writes
    POST /attempt            relay a premise tuple to whoever receives it
                             (REGISTER -> the Registrar, the rest -> Eidos)

WHY THE ROOT IS etc/log AND NOT etc/log/portal
    vite.config.ts sets `emptyOutDir: true`, so everything inside
    etc/log/portal is deleted on every build.  The feed and the HTML
    windows therefore live BESIDE the build, which is what the 2.0
    README specifies — and serving etc/log serves all three: the app,
    the feed, and the windows.

WHAT THIS DOES NOT DO
    It does not generate the feed.  render.theory does that, and until
    the mind runs there is nothing to poll — which is why --demo exists.
"""

from __future__ import annotations

import argparse
import http.server
import json
import os
import pathlib
import re
import socket
import socketserver
import sys

# src/portal/gil_serve.py -> the tree root is two levels up.
# WHERE THE TREE IS.
#
# Two levels apart from this file, which is how a server started by
# hand finds its own tree — and then the ACTIVE LEARNER's :Home is
# preferred if it says something different, because that is the tree
# the mind thinks it is in and the two must not diverge.
ROOT = pathlib.Path(__file__).resolve().parents[2]


# ── THE DAICHO IS THE ONE SOURCE OF ADDRESSES ────────────────────
#
# These were hardcoded here and declared again in GIL.daicho — two
# places to change and one to forget.  The mind reads the daicho; so
# does the portal, or the two end up looking at different worlds.
#
# DELIBERATELY SHALLOW.  This reads a handful of settings out of a
# daicho by name.  It is NOT a Premise reader and must not grow into
# a pretend one — the moment it evaluates rather than reads, two
# implementations of the language exist and they will disagree.

def _daicho_url(text, section):
    """The :Url of a [Section …] block, host and port as a tuple."""
    import re
    m = re.search(r"\[" + section + r"\b(.*?)\]", text, re.S)
    if not m:
        return None
    u = re.search(r':Url\s+"([^"]+)"', m.group(1))
    if not u:
        return None
    hp = re.search(r"://([^/:]+):(\d+)", u.group(1))
    return (hp.group(1), int(hp.group(2))) if hp else None


def _read_daicho():
    """Addresses from cfg/GIL.daicho, falling back to the defaults a
    fresh checkout runs on.  A missing daicho is not fatal — the
    portal still serves, on the ports the tree ships with."""
    defaults = {
        "eidos":      ("127.0.0.1", 4310),
        "registrar":  ("127.0.0.1", 4240),
        "perceiver":  ("127.0.0.1", 4210),
        "competency": ("127.0.0.1", 5092),
        "portal":     ("127.0.0.1", 4250),
        "kb_url":     "locus://sol.earth.orb.local.host/Totality",
        "home":       str(ROOT),
        "curator":    ("127.0.0.1", 4260),
        "adapter":    "ephemeral-kb",
        "bootstrap":  {},
    }
    daicho = ROOT / "cfg" / "GIL.daicho"
    if not daicho.is_file():
        return defaults
    try:
        text = daicho.read_text(encoding="utf-8")
    except OSError:
        return defaults
    import re
    out = dict(defaults)

    # ── THE DASHBOARD'S OWN REGISTRY ─────────────────────────────
    #
    # Curator.daicho, not GIL.daicho.  The division is the whole
    # reason there are two files: a learner's daicho says how that
    # MIND is configured, and the dashboard's says how the DASHBOARD
    # is.  Mixing them means editing a mind's configuration to move
    # a port the mind has never heard of.
    cur = ROOT / "cfg" / "Curator.daicho"
    if cur.is_file():
        try:
            ctext = cur.read_text(encoding="utf-8")
        except OSError:
            ctext = ""
        if ctext:
            got = _daicho_url(ctext, "Curator")
            if got:
                out["curator"] = got
            a = re.search(r"\[Curator\b.*?:Adapter\s+(\S+)", ctext, re.S)
            if a:
                out["adapter"] = a.group(1)

            # THE BOOTSTRAP LEARNER, AND ONLY THAT ONE.
            #
            # Nothing can enroll before something runs, and the first
            # learner cannot announce itself to a dashboard that does
            # not know it exists.  So one entry is configured and the
            # rest are discovered.
            #
            # PRECEDENCE: THE CURATOR'S KNOWLEDGE BASE WINS.  A
            # learner that enrolled said where it ACTUALLY lives;
            # this says only where it was expected to.
            blk = re.search(r"\[Bootstrap\b(.*?)\n\s*\]", ctext, re.S)
            if blk:
                body = blk.group(1)

                def bslot(key, default=""):
                    m2 = re.search(r":" + key + r'\s+"([^"]*)"', body)
                    if m2:
                        return m2.group(1)
                    m2 = re.search(r":" + key + r"\s+(\S+)", body)
                    return m2.group(1) if m2 else default

                out["bootstrap"] = {
                    "id": bslot("Id"),
                    "name": bslot("Name", bslot("Id")),
                    "registrar": bslot("Registrar"),
                    "home": bslot("Home"),
                    "being": bslot("Being"),
                    "record": bslot("Record"),
                    "totality": bslot("Totality"),
                }

    # THE ACTIVE LEARNER'S HOME, not the abstract machine's.
    #
    # [Machine] is the PREMISE ABSTRACT MACHINE — the evaluator, its
    # home folder, its logging — and lives in premise.daicho.  The
    # tree this server should be serving is a LEARNER's, because a
    # learner is a distinct mind with its own tree and its own record.
    #
    # A server launched from somewhere else would serve one tree's
    # bundle and another tree's feed, which looks like a mind that has
    # stopped producing rather than a server pointed at the wrong
    # folder.  So it says so and carries on.
    active = re.search(r"\[Learners\b.*?:Active\s+(\S+)", text, re.S)
    if active:
        aid = active.group(1)
        for blk in re.findall(r"\[Learner\b(.*?)\n\s*\]", text, re.S):
            if re.search(r":Id\s+" + re.escape(aid) + r"\b", blk):
                h = re.search(r':Home\s+"([^"]+)"', blk)
                if h:
                    declared = pathlib.Path(h.group(1))
                    if declared.is_dir() and declared.resolve() != ROOT:
                        print(f"  home: learner {aid} lives in {declared}")
                        print(f"        this server is in       {ROOT}")
                    out["home"] = str(declared)
                break
    for key, section in (("registrar", "Registrar"), ("perceiver", "Perceiver"),
                         ("competency", "Competency"), ("portal", "Portal")):
        got = _daicho_url(text, section)
        if got:
            out[key] = got
    # Eidos's door is in Eidos.daicho, under [Psyche :Url].
    edaicho = ROOT / "cfg" / "Eidos.daicho"
    if edaicho.is_file():
        got = _daicho_url(edaicho.read_text(encoding="utf-8"), "Psyche")
        if got:
            out["eidos"] = got
    # the shared knowledge base
    m = re.search(r"\[Totality\b.*?:Url\s+\"([^\"]+)\"", text, re.S)
    if m:
        out["kb_url"] = m.group(1)

    # THE ROSTER IS NOT READ HERE ANY MORE.
    #
    # It was, out of GIL.daicho, and it has moved to the Curator's
    # knowledge base — written by learners ENROLLING rather than by
    # somebody typing.  Which is also how a learner created on
    # another machine comes to be known at all, where a configured
    # list could only ever hold what had been entered by hand.

    return out


CFG = _read_daicho()

# THE SERVED ROOT IS etc/log, NOT etc/log/portal — and that is not a
# detail.  vite.config.ts sets `emptyOutDir: true`, so ANYTHING inside
# etc/log/portal is deleted on every build.  The feed therefore lives
# beside the build as a sibling (etc/log/portal-*.json), exactly as the
# 2.0 README specifies, and a build never destroys it.
LOG = ROOT / "etc" / "log"
BUILD = LOG / "portal"

# WHERE A COMPOSED ATTEMPT GOES.
#
# To Eidos's own port — not to a file.  Eidos listens on ONE DOOR and
# the Executor arrives at the same one, so a hand-written attempt takes
# exactly the path a mind-written one takes: same handler, same token
# gate, same everything downstream.
#
# The browser cannot open a socket, so the server relays.  That keeps
# the portal a VIEWER everywhere else and a sender in exactly one
# place, rather than putting it in the path.
EIDOS = CFG["eidos"]

#: GIL's Registrar.
REGISTRAR = CFG["registrar"]

#: GIL's Perceiver.  Where an afferent signal goes — a PERCEPT, an
#: URGE or a RESULT, composed on the Signals screen and sent as a
#: psyche would send it.
PERCEIVER = CFG["perceiver"]

#: Monitoring, which is MetaControl.  Competency toggles land here.
COMPETENCY = CFG["competency"]

#: The mind's Portal agent — the KB half of the audit surface.  It
#: writes the feeds and answers the queries a polled file cannot.
PORTAL = CFG["portal"]

#: THE CURATOR — the dashboard's own process, and the only address
#: here that is not part of a mind.
#:
#: It holds what the DASHBOARD knows: the roster, what this portal
#: itself has sent, the signal cases, the runs and the notices.  A
#: learner has no need of a roster; the thing that wants one is the
#: observer, and this is it.
CURATOR = CFG["curator"]

#: For an error message that names who was not listening.  A 502 that
#: says "the recipient" makes the reader go and look up a port.
WHO = {
    REGISTRAR:  "the Registrar",
    EIDOS:      "Eidos",
    PERCEIVER:  "the Perceiver",
    COMPETENCY: "Monitoring",
    PORTAL:     "the Portal agent",
    CURATOR:    "the Curator",
}

#: WHERE A TUPLE GOES IS DECIDED BY WHAT IT IS.
#:
#: A REGISTER is a request to the mind — the psyche declaring itself —
#: so it goes to the Registrar.  A PSYCHE grant, an ATTEMPT and a
#: CONFIGURE are all for the device, so they go to Eidos.  A PERCEPT,
#: an URGE or a RESULT is afferent and goes to the Perceiver, by the
#: same door a real psyche would use.  A COMPETENCY toggle goes to
#: Monitoring.
#:
#: The server routes; it does not interpret.  Nothing here reads a
#: tuple beyond its label, because what a tuple MEANS is the
#: recipient's business.
ROUTE = {
    "REGISTER":   REGISTRAR,
    "ATTEMPT":    EIDOS,
    "PSYCHE":     EIDOS,
    "CONFIGURE":  EIDOS,
    "TERMINATE":  EIDOS,
    "PERCEPT":    PERCEIVER,
    "URGE":       PERCEIVER,
    "RESULT":     PERCEIVER,
    "COMPETENCY": COMPETENCY,
    # A LEARNER TUPLE ASKS THE MIND TO START ANOTHER ONE, so it goes
    # to the Portal agent — dashboard.theory is what actually brings a
    # stack up, and the Portal agent is the mind's own door onto it.
    #
    # A learner that is not running cannot be asked anything, so this
    # only ever reaches a mind that IS running, asking it to start a
    # sibling.  Starting the first one is the command line's job.
    "LEARNER": PORTAL,

    # THE DASHBOARD'S OWN RECORD.  ENROLL and BEAT arrive from learners
    # announcing themselves; INJECTED, SIGNALLED and NOTICE are this
    # portal writing down what it did.
    "ENROLL":    CURATOR,
    "BEAT":      CURATOR,
    "INJECTED":  CURATOR,
    "SIGNALLED": CURATOR,
    "NOTICE":    CURATOR,
    "ASK":       CURATOR,
}

def parse_attempt(text):
    """Pull :Act, and :X / :Y if the premise carries them.

    DELIBERATELY SHALLOW.  This is not a Premise parser and must not
    pretend to be one — it reads the two slots a dispatch needs and
    passes the whole premise through untouched for the record.
    """
    m = re.search(r":Act\s+([A-Za-z][\w-]*)", text)
    if not m:
        return None, "no :Act slot — nothing to dispatch"
    act = m.group(1)
    if act not in ACTIONS:
        return None, f"{act} is not an actuation this device offers"
    x = re.search(r":X\s+(-?\d+)", text)
    y = re.search(r":Y\s+(-?\d+)", text)
    out = {"action": ACTIONS[act], "act": act, "premise": text.strip()}
    if x and y:
        out["x"] = int(x.group(1))
        out["y"] = int(y.group(1))
    return out, None


def next_action_file():
    """action-N.json, one past whatever is already there."""
    OUTBOX.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in OUTBOX.glob("action-*.json"):
        try:
            n = max(n, int(f.stem.split("-")[1]))
        except (IndexError, ValueError):
            pass
    return OUTBOX / f"action-{n + 1}.json"


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static files out of etc/log/portal, with an SPA fallback."""

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(LOG), **kw)

    def do_GET(self):  # noqa: N802
        # THE FEED MUST NEVER BE CACHED.  A stale snapshot looks like a
        # stalled mind, and that is the one thing an audit surface must
        # not fake.
        rel = self.path.lstrip("/").split("?")[0]

        # "/" is the built app, which lives one level down.
        if rel in ("", "index.html"):
            self.send_response(302)
            self.send_header("Location", "/portal/index.html")
            self.end_headers()
            return

        # A percept's :Address is frame://eidos/<guid>; the PNG is at
        # eidos_percept_<guid>.png.  Serving etc/frames lets the
        # dashboard follow the address to the actual artefact rather
        # than re-rendering the board from a copy of the data.
        if rel.startswith("frames/"):
            target = ROOT / "etc" / rel
            if target.is_file():
                body = target.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
                return
            self.send_error(404, "no frame at that address")
            return

        # THE PORTAL LEARNS THE KNOWLEDGE BASE HERE.  A single GET the
        # dashboard makes at start, so the Settings screen can show
        # which Totality it is attached to and every KB-backed screen
        # knows where it is looking — without the URL being written a
        # second time in the TypeScript.
        if rel == "portal-config.json":
            body = json.dumps({
                "kb": CFG["kb_url"],
                "eidos": f"{EIDOS[0]}:{EIDOS[1]}",
                "registrar": f"{REGISTRAR[0]}:{REGISTRAR[1]}",
                "perceiver": f"{PERCEIVER[0]}:{PERCEIVER[1]}",
                "portal_agent": f"{PORTAL[0]}:{PORTAL[1]}",
                "home": CFG["home"],
                "curator": f"{CURATOR[0]}:{CURATOR[1]}",
                "adapter": CFG.get("adapter", "ephemeral-kb"),
                "bootstrap": CFG.get("bootstrap", {}),
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return

        if rel.startswith("portal-") and rel.endswith(".json"):
            target = LOG / rel
            if not target.exists():
                # Not an error worth a stack trace — the mind has
                # simply not written this one yet.
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.send_header("Cache-Control", "no-store")
                body = json.dumps({
                    "error": "no feed yet",
                    "detail": f"{rel} has not been written. "
                              "Has render.theory run?"}).encode()
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            body = target.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):  # noqa: N802
        parts = self.path.split("?")

        # ── /kb  ─────────────────────────────────────────────────
        #
        # WHAT A POLLED FILE CANNOT ANSWER.  The feeds carry current
        # state; a search is a question about something that may be in
        # none of them — a Case among thousands, a canvas by a label
        # the mind has not activated lately.
        #
        # Same shape as /attempt: a premise tuple in, a premise tuple
        # back.  The difference is only the recipient.
        if parts[0] == "/kb":
            length = int(self.headers.get("Content-Length") or 0)
            text = self.rfile.read(length).decode(errors="replace").strip()
            if not text.startswith("["):
                self.reply(400, {"error": "not a premise tuple"})
                return
            answer = self.relay(PORTAL, text)
            if answer is None:
                self.reply(502, {"error": "the mind's Portal agent is not "
                                          f"listening on {PORTAL[0]}:{PORTAL[1]}"})
                return
            self.reply(200, {"ok": True, "reply": answer})
            return

        if parts[0] != "/attempt":
            self.reply(404, {"error": "no such endpoint"})
            return

        length = int(self.headers.get("Content-Length") or 0)
        text = self.rfile.read(length).decode(errors="replace").strip()
        if not text.startswith("["):
            self.reply(400, {"error": "not a premise tuple"})
            return

        label = re.match(r"\[\s*([A-Z][A-Z_]*)", text)
        label = label.group(1) if label else ""
        target = ROUTE.get(label)
        if target is None:
            self.reply(400, {"error": f"nothing receives a {label or '?'}"})
            return

        # One line in, one line back.  The tuple IS the protocol, so
        # nothing here inspects it further — the recipient decides what
        # it means, and the portal reports what came back.
        answer = self.relay(target, text)

        # ── WRITE DOWN WHAT THE DASHBOARD SENT ───────────────────
        #
        # THE FIRST REASON THE CURATOR EXISTS.  This portal is a
        # viewer everywhere and a sender in exactly three places: the
        # Attempts composer, the Signals screen, the Competency
        # toggle.
        #
        # Without this record THE ARCHIVE CANNOT DISTINGUISH AN
        # ATTEMPT THE MIND DECIDED FROM ONE A PERSON TYPED — and a
        # campaign whose evidence cannot be told apart from its
        # operator's interference proves nothing.  Forty-five live
        # runs are worth what they are worth because nobody was
        # helping.
        #
        # RECORDED WHETHER OR NOT IT SUCCEEDED.  A tuple that failed
        # to send still says what somebody tried, and a refusal is
        # evidence about the gate rather than an absence of evidence.
        #
        # AND NEVER RECURSIVELY.  The record itself goes to the
        # Curator; recording it would record the recording.
        if target != CURATOR:
            self.record(label, text, target, answer)

        if answer is None:
            self.reply(502, {"error": f"{WHO.get(target, 'the recipient')} is "
                                      f"not listening on {target[0]}:{target[1]}"})
            return
        label = answer[1:answer.find(" ")] if " " in answer else ""
        self.reply(200, {"ok": label not in ("REFUSED",),
                         "reply": answer, "label": label})

    def record(self, label, text, target, answer):
        """Tell the Curator what was sent.  Best effort, and quiet.

        A dashboard whose record-keeper is down must still be able to
        send — the alternative is an operator unable to act because
        the thing watching them has fallen over.  So a failure here
        is swallowed, and the missing row is the evidence that the
        Curator was not running.
        """
        one = text.replace("\n", " ").replace('"', "'")
        try:
            self.relay(CURATOR, (
                f'[INJECTED :Head {label} :Whom "{target[0]}:{target[1]}" '
                f':Tuple "{one[:900]}" '
                f':Answer "{(answer or "unsent")[:400]}" '
                f':Screen portal]'))
        except Exception:
            pass

    def relay(self, target, text):
        """One tuple out, one tuple back.  None if nobody answered."""
        try:
            with socket.create_connection(target, timeout=10) as sk:
                sk.sendall((text.replace("\n", " ") + "\n").encode())
                reply = b""
                while not reply.endswith(b"\n"):
                    chunk = sk.recv(4096)
                    if not chunk:
                        break
                    reply += chunk
        except OSError:
            return None
        return reply.decode(errors="replace").strip()

    def reply(self, code, body):
        raw = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, fmt, *args):
        pass  # a server that narrates every poll is unreadable


def check_build() -> bool:
    idx = BUILD / "index.html"
    if idx.exists():
        return True
    print()
    print(f"  No build at {BUILD.relative_to(ROOT)}")
    print()
    print("  The portal is a Vite application and must be built first:")
    print()
    print("      cd src/portal")
    print("      npm install")
    print("      npm run build")
    print()
    print("  Or, while editing the portal, use Vite's own dev server")
    print("  instead of this one — it has hot reload:")
    print()
    print("      cd src/portal && npm run dev        # localhost:5173")
    print()
    return False


def main() -> int:
    ap = argparse.ArgumentParser(
        description="serve the built GIL portal and its feed")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=4390)
    a = ap.parse_args()

    if not check_build():
        return 1

    feeds = sorted(LOG.glob("portal-*.json"))
    windows = sorted(LOG.glob("*.html"))

    print(f"portal   http://{a.host}:{a.port}")
    print(f"serving  {LOG.relative_to(ROOT)}")
    print(f"app      {BUILD.relative_to(ROOT)}")
    print(f"feed     {len(feeds)} json, {len(windows)} html windows")
    if not feeds:
        print("         (none yet — render.theory writes them)")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((a.host, a.port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
