#!/usr/bin/env python3
"""
bridge.py — the Grid Psyche's world-side half (ARC-AGI-3 / replay).

This runtime build of Premise has no working network IO, so the mind speaks a
file protocol (see psyche/grid-psyche.theory):

    frames/in/frame-NNN.txt      bridge -> mind   plain tokens, one frame
    frames/out/action-N.txt      mind -> bridge   "RESET" | "ACTION3" | "ACTION6 32 40"

The bridge owns ALL protocol detail the mind must never see: HTTPS, the
X-API-Key header, card_id/guid threading, AWSALB session-affinity cookies,
JSON, and 64x64 frame flattening.

Modes:
    replay  frames come from a canned directory of JSON files (no network).
    live    frames come from three.arcprize.org (needs --key, --game).

Usage:
    python3 bridge.py replay --source replays/demo --steps 3
    python3 bridge.py live --key $ARC_API_KEY --game ls20 --steps 5
    python3 bridge.py live ... --watch     # keep serving actions as they appear

State: the next frame seq = count of frame-*.theory in frames/in; the next
action to consume = action-<n+1>.txt where n = actions already consumed
(persisted in frames/.bridge-cursor). Both derivable, both restart-safe.
"""

import argparse, json, pathlib, sys, time
import urllib.request, urllib.error, http.cookiejar

BASE = pathlib.Path(__file__).resolve().parent
INBOX = BASE / "frames" / "in"     # bridge writes (mind's inbox)
OUTBOX = BASE / "frames" / "out"   # bridge reads  (mind's outbox)
CURSOR = BASE / "frames" / ".bridge-cursor"
API = "https://three.arcprize.org"


# ── frame -> Premise literal ─────────────────────────────────────────────────

def write_frame(seq, game_id, guid, grid_flat, width, height, state,
                levels_completed, win_levels, available_actions, cause="NONE"):
    """Plain-token frame (see grid-psyche.theory for the fixed layout).
    cause = the action that produced this frame (RESET/ACTION1-7/NONE).
    Premise source is never written: grokking inside a function corrupts
    local scopes on this runtime build."""
    toks = [seq, game_id, guid, width, height, state,
            levels_completed, win_levels, cause, len(available_actions),
            *available_actions, *grid_flat]
    path = INBOX / f"frame-{seq:03d}.txt"
    # atomic: the mind polls for the file's existence and reads immediately —
    # a direct write lets it see a half-written frame (EmptySequence crash)
    tmp = INBOX / f".frame-{seq:03d}.tmp"
    tmp.write_text(" ".join(str(t) for t in toks) + "\n")
    tmp.rename(path)
    return path


def next_seq():
    return len(list(INBOX.glob("frame-*.txt")))


# ── action files ─────────────────────────────────────────────────────────────

def consumed():
    return int(CURSOR.read_text()) if CURSOR.exists() else 0


def consume_next_action():
    """Return (action, x, y, reason) for the next unconsumed action file, or
    None.  reason comes from an optional reason-N.txt sidecar the mind writes
    BEFORE the action file (so it is always complete by the time we get here);
    it is forwarded to the ARC API's `reasoning` field."""
    n = consumed() + 1
    path = OUTBOX / f"action-{n}.txt"
    if not path.exists():
        return None
    parts = path.read_text().split()
    if not parts:
        # a session killed at its timeout can leave the file created but
        # unwritten (the mind's write is not atomic) — treat as not ready.
        # Once a LATER action file exists the empty one is dead (the next
        # session numbered past it): skip it so the cursor never deadlocks.
        if (OUTBOX / f"action-{n + 1}.txt").exists():
            CURSOR.write_text(str(n))
        return None
    CURSOR.write_text(str(n))
    action = parts[0].upper()
    xy = (int(parts[1]), int(parts[2])) if len(parts) == 3 else (None, None)
    rpath = OUTBOX / f"reason-{n}.txt"
    reason = rpath.read_text().strip() if rpath.exists() else None
    return action, xy[0], xy[1], reason


# ── live mode: the real ARC-AGI-3 protocol ───────────────────────────────────

class ArcClient:
    def __init__(self, key):
        self.key = key
        jar = http.cookiejar.CookieJar()   # AWSALB session affinity
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(jar))
        self.card_id = None
        self.guid = None

    def call(self, method, path, body=None):
        req = urllib.request.Request(
            API + path,
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={"X-API-Key": self.key, "Content-Type": "application/json"})
        with self.opener.open(req, timeout=30) as r:
            return json.loads(r.read().decode())

    def open_scorecard(self, tags):
        resp = self.call("POST", "/api/scorecard/open", {"tags": tags})
        self.card_id = resp["card_id"]
        return self.card_id

    def close_scorecard(self):
        if self.card_id:
            return self.call("POST", "/api/scorecard/close",
                             {"card_id": self.card_id})

    def command(self, game_id, action, x=None, y=None, reason=None):
        # A non-RESET action needs a guid from a prior RESET.  If the mind
        # skipped the session-open RESET — e.g. a stale inbox frame made
        # grid-play read ?ndisk>0 and think the game was already open — the
        # API 400s on the null guid and, unhandled, that HTTPError kills the
        # bridge mid-boot (the "ablation TIMEOUT after 0 actions" of the
        # 2026-07-09 muse A/B: session 1 then idle-waited a reply that never
        # came).  Open the game instead of dying; the next frame re-perceives.
        if action != "RESET" and self.guid is None:
            print(f"bridge: no guid yet — injecting RESET before {action}")
            self.command(game_id, "RESET")
        body = {"game_id": game_id}
        if action == "RESET":
            body["card_id"] = self.card_id
            if self.guid:
                body["guid"] = self.guid
        else:
            body["guid"] = self.guid
            if x is not None:
                body["data"] = {"x": x, "y": y}
        if reason:
            # recorded server-side in the session log's action_input.reasoning
            body["reasoning"] = reason
        resp = self.call("POST", f"/api/cmd/{action}", body)
        self.guid = resp.get("guid", self.guid)
        return resp

    @staticmethod
    def flatten(resp):
        """FrameResponse -> flat grid + metadata (last frame if several)."""
        frames = resp.get("frame") or []
        grid2d = frames[-1] if frames else []
        flat = [c for row in grid2d for c in row]
        h = len(grid2d)
        w = len(grid2d[0]) if h else 0
        return dict(
            game_id=resp.get("game_id", ""),
            guid=resp.get("guid", ""),
            grid_flat=flat, width=w, height=h,
            state=resp.get("state", ""),
            levels_completed=resp.get("levels_completed", 0),
            win_levels=resp.get("win_levels", 0),
            available_actions=resp.get("available_actions", []))


def write_summary(summary):
    """One-file run summary — play.py moves it into the archive and appends
    the ledger line.  Written in a finally so even a crashed run leaves one."""
    (BASE / "frames" / ".bridge-summary.json").write_text(
        json.dumps(summary, indent=1))
    print("bridge: summary " + json.dumps(summary))


def serve_live(key, game, steps, watch):
    client = ArcClient(key)
    if "-" not in game:
        # resolve a short name ("ls20") to the full game_id — RESET tolerates
        # the prefix but /api/cmd/ACTIONn 400s without the full id
        games = client.call("GET", "/api/games")
        full = [g["game_id"] for g in games
                if g["game_id"].startswith(game.lower() + "-")]
        if not full:
            sys.exit(f"bridge: no game matching '{game}'")
        game = full[0]
        print(f"bridge: resolved game -> {game}")
    # the agent's public name on the ARC-AGI-3 recordings; keep the phase
    # tag current with the plan (docs/plan.md — phase 5 = dream-as-prediction)
    card = client.open_scorecard(["sal", "spatial-abstraction-learner", "phase-5"])
    print(f"bridge: scorecard {card}")
    served = 0
    summary = {"mode": "live", "game": game, "card_id": card, "guid": None,
               "actions": 0, "reasoned": 0, "max_levels": 0, "win_levels": 0,
               "states": {}, "final_state": None, "win": False}
    try:
        while watch or served < steps:
            act = consume_next_action()
            if act is None:
                time.sleep(1.0)
                continue
            action, x, y, reason = act
            print(f"bridge: -> {action}" + (f" ({x},{y})" if x is not None else "")
                  + (f"  [{reason}]" if reason else ""))
            resp = client.command(game, action, x, y, reason)
            f = ArcClient.flatten(resp)
            path = write_frame(next_seq(), cause=action, **f)
            print(f"bridge: <- {f['state']} levels={f['levels_completed']} -> {path.name}")
            served += 1
            summary["actions"] = served
            summary["reasoned"] += 1 if reason else 0
            summary["guid"] = f["guid"] or summary["guid"]
            summary["max_levels"] = max(summary["max_levels"], f["levels_completed"])
            summary["win_levels"] = f["win_levels"]
            summary["states"][f["state"]] = summary["states"].get(f["state"], 0) + 1
            summary["final_state"] = f["state"]
            summary["win"] = summary["win"] or f["state"] == "WIN"
            if f["state"] in ("WIN", "GAME_OVER") and not watch:
                break
    finally:
        client.close_scorecard()
        write_summary(summary)
        print("bridge: scorecard closed")


# ── replay mode: canned JSON frames, same file protocol ─────────────────────

def serve_replay(source, steps, watch):
    """source dir holds NNN.json files shaped like flattened frames."""
    src = pathlib.Path(source)
    canned = sorted(src.glob("*.json"))
    idx = 0
    served = 0
    summary = {"mode": "replay", "game": src.name, "actions": 0, "reasoned": 0,
               "max_levels": 0, "win_levels": 0, "states": {},
               "final_state": None, "win": False}
    try:
        while (watch or served < steps) and idx < len(canned):
            act = consume_next_action()
            if act is None:
                time.sleep(0.2)
                continue
            action, _x, _y, reason = act
            f = json.loads(canned[idx].read_text())
            idx += 1
            path = write_frame(next_seq(), cause=action, **f)
            print(f"bridge: {action} -> {path.name} (canned {canned[idx-1].name})"
                  + (f"  [{reason}]" if reason else ""))
            served += 1
            summary["actions"] = served
            summary["reasoned"] += 1 if reason else 0
            summary["max_levels"] = max(summary["max_levels"], f.get("levels_completed", 0))
            summary["win_levels"] = f.get("win_levels", 0)
            st = f.get("state", "?")
            summary["states"][st] = summary["states"].get(st, 0) + 1
            summary["final_state"] = st
            summary["win"] = summary["win"] or st == "WIN"
    finally:
        write_summary(summary)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="mode", required=True)
    r = sub.add_parser("replay")
    r.add_argument("--source", required=True)
    r.add_argument("--steps", type=int, default=10)
    r.add_argument("--watch", action="store_true")
    l = sub.add_parser("live")
    l.add_argument("--key", default=None,
                   help="API key; defaults to contents of arc-api-key.txt next to this script")
    l.add_argument("--game", required=True)
    l.add_argument("--steps", type=int, default=10)
    l.add_argument("--watch", action="store_true")
    a = ap.parse_args()
    INBOX.mkdir(parents=True, exist_ok=True)
    OUTBOX.mkdir(parents=True, exist_ok=True)
    if a.mode == "replay":
        serve_replay(a.source, a.steps, a.watch)
    else:
        key = a.key
        if not key:
            kf = BASE / "arc-api-key.txt"
            key = kf.read_text().strip() if kf.exists() else ""
        if not key or "PASTE-YOUR" in key:
            sys.exit("bridge: no API key — pass --key or paste it into gil/arc-api-key.txt")
        serve_live(key, a.game, a.steps, a.watch)


if __name__ == "__main__":
    main()
