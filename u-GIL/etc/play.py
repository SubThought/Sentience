#!/usr/bin/env python3
"""play.py — session orchestrator for u-GIL 2.0.

Chains headless Premise sessions so the mind can play unattended past the
per-function invocation ceiling. Each session boots the being, loads the
Totality, plays its turns, and saves the Totality — so the next session
resumes knowing what the last one learned.

That save/wipe/reload/resume cycle is the H2 problem in miniature, and it
is faced on every run rather than reasoned about.

    python3 etc/play.py live   --game ls20 [--turns 8] [--sessions 16]
    python3 etc/play.py replay --source etc/replays/demo
"""

import argparse, functools, json, os, pathlib, shutil, signal, subprocess, sys, time

print = functools.partial(print, flush=True)

BASE    = pathlib.Path(__file__).resolve().parent          # .../u-GIL/etc
ROOT    = BASE.parent                                      # .../u-GIL
BEING   = "./src/axioms/u-GIL.being"
INBOX   = BASE / "frames" / "in"
OUTBOX  = BASE / "frames" / "out"
CURSOR  = BASE / "frames" / ".bridge-cursor"
SUMMARY = BASE / "frames" / ".bridge-summary.json"
LEDGER  = BASE / "replays" / "ledger.txt"
KEN     = BASE / "ken"


def move_contents(files, dest):
    dest.mkdir(parents=True, exist_ok=True)
    for f in files:
        if f.exists():
            shutil.move(str(f), str(dest / f.name))


def run_session(turns, hard, idle):
    """One headless session: boot, load, play, save, render the portal."""
    ev = ('(do (grok "%s") (load-totality) '
          '(var ?r (grid-play %d)) (save-totality) '
          '(portal-perception "./etc/log/perception.html" 40) '
          '(portal-deliberation "./etc/log/deliberation.html") '
          '(portal-space "./etc/log/space.html") ?r)' % (BEING, turns))
    env = dict(os.environ, PREMRUN_HARD=str(hard), PREMRUN_IDLE=str(idle))
    p = subprocess.run(
        [sys.executable, str(BASE / "premrun.py"), str(ROOT),
         "premise", "--home", str(ROOT), "--eval", ev, "--repl", "no"],
        capture_output=True, text=True, env=env)
    out = p.stdout
    print(out.strip().split("\n")[-1] if out.strip() else "(no output)")
    for line in out.splitlines():
        if "grid-play:" in line:
            return line
    for line in out.splitlines():
        if "Failure" in line:
            return "SESSION-ERROR: " + line.strip()
    return ""


def main():
    ap  = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="mode", required=True)
    l   = sub.add_parser("live");   l.add_argument("--game", required=True)
    r   = sub.add_parser("replay"); r.add_argument("--source", required=True)
    for s in (l, r):
        s.add_argument("--turns",    type=int, default=8)
        s.add_argument("--sessions", type=int, default=16)
        s.add_argument("--fresh",  action="store_true",
                       help="wipe the ken — the mind starts blank")
        s.add_argument("--hard", type=int, default=1200)
        s.add_argument("--idle", type=int, default=120)
    a = ap.parse_args()

    stamp = time.strftime("%Y%m%d-%H%M%S")
    INBOX.mkdir(parents=True, exist_ok=True)
    OUTBOX.mkdir(parents=True, exist_ok=True)
    (BASE / "log").mkdir(parents=True, exist_ok=True)

    if a.fresh and KEN.exists():
        for f in KEN.glob("*.txt"):
            f.unlink()
        print("play: ken wiped — the mind starts blank")

    if a.mode == "live":
        bridge_cmd = [sys.executable, str(BASE / "bridge.py"), "live",
                      "--game", a.game, "--watch"]
        tag = "live-%s" % a.game
    else:
        bridge_cmd = [sys.executable, str(BASE / "bridge.py"), "replay",
                      "--source", a.source, "--watch"]
        tag = "replay"

    log = open(BASE / "log" / ("bridge-%s.log" % stamp), "w")
    bridge = subprocess.Popen(bridge_cmd, stdout=log, stderr=subprocess.STDOUT,
                              env=dict(os.environ, PYTHONUNBUFFERED="1"))
    print("play: bridge up (pid %d)" % bridge.pid)
    time.sleep(2)

    verdict, ran = "SESSIONS-EXHAUSTED", 0
    try:
        for s in range(1, a.sessions + 1):
            if bridge.poll() is not None:
                verdict = "BRIDGE-DIED"; break
            ran = s
            print("play: ── session %d/%d ──" % (s, a.sessions))
            line = run_session(a.turns, a.hard, a.idle)
            if line.startswith("SESSION-ERROR"):
                verdict = line; break
            if any(k in line for k in ("WIN", "GAME_OVER", "ATTAINED",
                                       "NO-ACTIONS", "TIMEOUT")):
                verdict = line.split("grid-play:")[-1].strip().strip('"'); break
    finally:
        if bridge.poll() is None:
            bridge.send_signal(signal.SIGINT)
            try:    bridge.wait(timeout=15)
            except subprocess.TimeoutExpired: bridge.kill()
        log.close()

        archive = BASE / "replays" / ("play-%s-%s" % (tag, stamp))
        move_contents(list(INBOX.glob("*")),  archive / "in")
        move_contents(list(OUTBOX.glob("*")), archive / "out")
        if CURSOR.exists():
            shutil.move(str(CURSOR), str(archive / ".bridge-cursor"))
        summary = {}
        if SUMMARY.exists():
            try:    summary = json.loads(SUMMARY.read_text())
            except json.JSONDecodeError: pass
            shutil.move(str(SUMMARY), str(archive / "summary.json"))

        # one greppable line per run — an outcome should never need forensics
        states = ",".join("%s:%s" % kv for kv in summary.get("states", {}).items())
        line = ("%s %s game=%s verdict=%s sessions=%d/%d actions=%s "
                "levels=%s/%s win=%s states=%s archive=%s"
                % (stamp, tag, summary.get("game", "?"),
                   verdict.replace(" ", "_"), ran, a.sessions,
                   summary.get("actions", "?"), summary.get("max_levels", "?"),
                   summary.get("win_levels", "?"),
                   "YES" if summary.get("win") else "no",
                   states or "?", archive.name))
        LEDGER.parent.mkdir(parents=True, exist_ok=True)
        with open(LEDGER, "a") as lf:
            lf.write(line + "\n")
        print("play: ledger — " + line)

    print("play: VERDICT — " + verdict)


if __name__ == "__main__":
    main()
