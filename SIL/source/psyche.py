#!/usr/bin/env python3
"""
psyche.py — SIL Device Firmware

The Psyche is the firmware that runs on the computational workbench
(Device).  It handles bidirectional communication with SIL's Mind.

Responsibilities:
  1. Register the Device with SIL's Registrar on startup
  2. Poll the filesystem for new results, logs, and state changes
  3. Send percepts to SIL's Perceiver as structured messages
  4. Receive actuation requests from SIL's Executor
  5. Execute them via subprocess/filesystem/network calls
  6. Return results

This is approximately 150 lines of Python — the firmware of the body.
SIL's Mind decides WHAT to do.  The Psyche does HOW to do it.

Usage:
    python3 psyche.py --task-dir /data/lawbench --work-dir /runs/run_1

Copyright(c) 2013-2026 SubThought Corporation. All Rights Reserved.
"""

import argparse
import json
import os
import subprocess
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from threading import Thread

import requests


# ── Configuration ──────────────────────────────────────────────

REGISTRAR_URL = "https://localhost/mind/registrar"
PERCEIVER_URL = "https://localhost:2025/minds/SIL"
EXECUTOR_URL  = "https://localhost:2010/minds/SIL"

DEVICE_NAME   = "SIA"
DEVICE_TYPE   = "Computational-Workbench"
DEVICE_NEEDS  = ["API-Budget", "Time-Budget", "Disk-Space", "Accuracy"]
DEVICE_ACTUATIONS = [
    "run-script", "read-file", "write-file", "make-dir",
    "copy-file", "delete-file", "install-package", "create-venv",
    "prompt-llm", "to-json", "from-json", "read-env",
]

POLL_INTERVAL = 5  # seconds


# ── Registration ───────────────────────────────────────────────

def register(task_dir: str, work_dir: str) -> dict:
    """Register this Device with SIL's Registrar."""
    msg = {
        "type": "REGISTER",
        "Name": DEVICE_NAME,
        "Type": DEVICE_TYPE,
        "Needs": DEVICE_NEEDS,
        "Actuations": DEVICE_ACTUATIONS,
        "TaskDir": task_dir,
        "WorkDir": work_dir,
    }
    try:
        resp = requests.post(REGISTRAR_URL, json=msg, timeout=30, verify=False)
        return resp.json()
    except Exception as e:
        print(f"[psyche] Registration failed: {e}", file=sys.stderr)
        return {"Status": "Denied", "Error": str(e)}


# ── Percept Sending ────────────────────────────────────────────

def send_percept(modality: str, channel: str, data=None,
                 content=None, address=None):
    """Send a percept to SIL's Perceiver."""
    msg = {
        "type": "Percept",
        "Modality": modality,
        "Channel": channel,
        "Data": data,
        "Content": content,
        "Address": address,
    }
    try:
        requests.post(PERCEIVER_URL, json=msg, timeout=10, verify=False)
    except Exception as e:
        print(f"[psyche] Percept send failed: {e}", file=sys.stderr)


def send_urge(need: str, delta: float):
    """Send a homeostatic urge to SIL's Perceiver."""
    msg = {"type": "Urge", "Need": need, "Delta": delta}
    try:
        requests.post(PERCEIVER_URL, json=msg, timeout=10, verify=False)
    except Exception as e:
        print(f"[psyche] Urge send failed: {e}", file=sys.stderr)


def send_result(action: str, status: str):
    """Send an actuation result to SIL's Perceiver."""
    msg = {"type": "Result", "Action": action, "Status": status}
    try:
        requests.post(PERCEIVER_URL, json=msg, timeout=10, verify=False)
    except Exception as e:
        print(f"[psyche] Result send failed: {e}", file=sys.stderr)


# ── Polling ────────────────────────────────────────────────────

class PollState:
    """Tracks filesystem state between polls."""
    def __init__(self, task_dir: str, work_dir: str):
        self.task_dir = Path(task_dir)
        self.work_dir = Path(work_dir)
        self.seen_files = set()
        self.last_results = {}
        self.start_time = time.time()

    def poll(self):
        """One poll cycle: check for new files, results, and state."""
        self._poll_task_dir()
        self._poll_work_dir()
        self._poll_time_budget()

    def _poll_task_dir(self):
        """Send task description and dataset structure on first encounter."""
        task_md = self.task_dir / "public" / "task.md"
        if task_md.exists() and str(task_md) not in self.seen_files:
            self.seen_files.add(str(task_md))
            text = task_md.read_text(errors="replace")[:4000]
            send_percept("Textual", "TaskMD", data=text, address=str(task_md))

        # Scan for data files
        pub = self.task_dir / "public"
        if pub.exists():
            for f in pub.iterdir():
                if str(f) not in self.seen_files:
                    self.seen_files.add(str(f))
                    if f.suffix == ".csv":
                        rows = sum(1 for _ in open(f, errors="replace")) - 1
                        send_percept("Structural", "Filesystem",
                                     content={"Format": "csv", "Rows": rows,
                                              "HasLabels": "yes" if "train" in f.name else "no"},
                                     address=str(f))
                    elif f.suffix == ".json":
                        send_percept("Structural", "Filesystem",
                                     content={"Format": "json"},
                                     address=str(f))

    def _poll_work_dir(self):
        """Check for new evaluation results and execution logs."""
        for gen_dir in sorted(self.work_dir.glob("gen_*")):
            results_file = gen_dir / "results.json"
            if results_file.exists() and str(results_file) not in self.seen_files:
                self.seen_files.add(str(results_file))
                try:
                    data = json.loads(results_file.read_text())
                    send_percept("Metric", "Evaluation",
                                 data=data.get("accuracy", 0),
                                 content=data)
                    # Send accuracy urge
                    acc = data.get("accuracy", 0)
                    send_urge("Accuracy", max(0, 0.70 - acc))
                except json.JSONDecodeError:
                    pass

            # Check for execution logs
            log_file = gen_dir / "stdout.log"
            if log_file.exists() and str(log_file) not in self.seen_files:
                self.seen_files.add(str(log_file))
                log_text = log_file.read_text(errors="replace")[-2000:]
                exit_code_file = gen_dir / "exit_code"
                exit_code = 0
                if exit_code_file.exists():
                    exit_code = int(exit_code_file.read_text().strip())
                send_percept("Diagnostic", "ExitCode",
                             data=log_text,
                             content={"ExitCode": exit_code})

            # Check for target_agent.py
            agent_file = gen_dir / "target_agent.py"
            if agent_file.exists() and str(agent_file) not in self.seen_files:
                self.seen_files.add(str(agent_file))
                source = agent_file.read_text(errors="replace")[:5000]
                send_percept("Textual", "SourceCode", data=source,
                             address=str(agent_file))

    def _poll_time_budget(self):
        """Send time budget urge."""
        elapsed = time.time() - self.start_time
        budget = 3600  # 1 hour default
        remaining = max(0, budget - elapsed)
        if remaining < budget * 0.2:
            send_urge("Time-Budget", (budget - remaining) / budget)


# ── Actuation Dispatch ─────────────────────────────────────────

def dispatch_actuation(action: str, params: dict) -> dict:
    """Execute an actuation request and return the result."""
    try:
        if action == "run-script":
            cmd = params.get("Command", "")
            result = subprocess.run(cmd, shell=True, capture_output=True,
                                    text=True, timeout=600)
            send_result(action, "Done" if result.returncode == 0 else "Fail")
            return {"output": result.stdout, "exitcode": result.returncode}

        elif action == "read-file":
            path = params.get("File", "")
            content = Path(path).read_text(errors="replace")
            send_result(action, "Done")
            return {"content": content}

        elif action == "write-file":
            path = params.get("File", "")
            content = params.get("Content", "")
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            Path(path).write_text(content)
            send_result(action, "Done")
            return {"written": path}

        elif action == "make-dir":
            path = params.get("Path", "")
            Path(path).mkdir(parents=True, exist_ok=True)
            send_result(action, "Done")
            return {"created": path}

        elif action == "install-package":
            pkg = params.get("Package", "")
            result = subprocess.run(
                f"pip install {pkg} --break-system-packages",
                shell=True, capture_output=True, text=True, timeout=120)
            send_result(action, "Done" if result.returncode == 0 else "Fail")
            return {"output": result.stdout, "exitcode": result.returncode}

        elif action == "prompt-llm":
            url = params.get("Url", "")
            body = params.get("Body", {})
            timeout = params.get("Timeout", 120)
            resp = requests.post(url, json=body, timeout=timeout)
            send_result(action, "Done")
            return resp.json()

        else:
            send_result(action, "Fail")
            return {"error": f"Unknown actuation: {action}"}

    except Exception as e:
        send_result(action, "Fail")
        return {"error": str(e)}


# ── Actuation Listener ─────────────────────────────────────────

class ActuationHandler(BaseHTTPRequestHandler):
    """HTTP handler for incoming actuation requests from SIL's Executor."""

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        action = body.get("Action", "")
        params = body.get("Parameters", {})
        result = dispatch_actuation(action, params)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def log_message(self, format, *args):
        pass  # suppress HTTP logging


# ── Main ───────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="SIL Psyche — Device Firmware")
    parser.add_argument("--task-dir", required=True, help="Path to task data directory")
    parser.add_argument("--work-dir", required=True, help="Path to working directory")
    parser.add_argument("--port", type=int, default=8088, help="Actuation listener port")
    parser.add_argument("--poll-interval", type=int, default=POLL_INTERVAL)
    args = parser.parse_args()

    print(f"[psyche] Starting SIL Psyche on port {args.port}")
    print(f"[psyche] Task dir: {args.task_dir}")
    print(f"[psyche] Work dir: {args.work_dir}")

    # Step 1: Register with SIL
    reg = register(args.task_dir, args.work_dir)
    print(f"[psyche] Registration: {reg.get('Status', 'Unknown')}")

    # Step 2: Start actuation listener
    server = HTTPServer(("0.0.0.0", args.port), ActuationHandler)
    listener = Thread(target=server.serve_forever, daemon=True)
    listener.start()
    print(f"[psyche] Actuation listener started on port {args.port}")

    # Step 3: Poll loop
    state = PollState(args.task_dir, args.work_dir)
    print(f"[psyche] Polling every {args.poll_interval}s ...")
    try:
        while True:
            state.poll()
            time.sleep(args.poll_interval)
    except KeyboardInterrupt:
        print("\n[psyche] Shutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
