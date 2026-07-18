# SIL Instructions — Self-Improving Learner

## Overview

SIL is GIL (Generally Intelligent Learner) adapted for the computational domain. It replaces SIA's (Self-Improving AI) Python orchestration loop with a cognitive architecture that perceives, learns, reasons, and remembers across runs.

SIL has two halves: a Mind and a Body.

The Mind runs on Premise (the PAM runtime). It contains the four cognitive components — Observation, Coordination, Reflection, Consolidation — operating concurrently on a shared Totality knowledge base. The Mind decides what to do and why.

The Body runs on Python. It is a thin firmware process called the Psyche that bridges the Mind to the operating system — filesystem, shell, LLM APIs, evaluation scripts. The Body executes what the Mind decides.

The boundary between Mind and Body is the Perceiver/Executor interface. Percepts flow from Body to Mind. Actuations flow from Mind to Body. Neither side knows the other's internals.

---

## What Was Built

### Project Structure

```
sil/
├── sil.package                      Package manifest
├── theory/
│   ├── sil.theory                   Top-level entry point
│   ├── sil-totality.theory          Shared knowledge base
│   ├── sil-observation.theory       Perception and recognition
│   ├── sil-coordination.theory      Activation, solving, selection
│   ├── sil-reflection.theory        Self-improvement engine
│   └── sil-consolidation.theory     Forgetting, skill formation
├── data/
│   ├── sil-codes.grimoire           Code set lookup tables
│   ├── sil-actuations.grimoire      12 device actuations
│   └── sil-profiles.grimoire        LLM providers and profiles
└── device/
    └── psyche.py                    Python device firmware
```

### File Inventory

| File | Lines | Runtime | Purpose |
|------|------:|---------|---------|
| `sil.package` | 52 | Premise | Package manifest listing modules, data, device, and entry point |
| `sil-totality.theory` | 890 | Premise | Shared KB: 6 memory areas, rescaled potentiation windows, 6 computational modalities, 4 recognized element types (Dataset, CodePattern, ScoreProfile, ErrorSignature), computational image schemas, SIL-specific registry entries and thresholds, all ontological templates (Action, Reason, Lesson, etc.) |
| `sil-observation.theory` | 509 | Premise | Mind/Body pattern: Registrar, Perceiver, Executor. 6 computational detectors: StructureDetector (datasets), CodeDetector (source patterns), MetricDetector (evaluation scores), ErrorDetector (crash/timeout/rate-limit), TextDetector (task descriptions), TemporalDetector (timing). Reminding pattern: Storer, Retriever, Matcher (Jaccard similarity). Assimilator, Accommodator, Lexer, Activator |
| `sil-coordination.theory` | 386 | Premise | Activation spreading: Observer (upward/Observed), Anticipator (downward/Expected), Reminder (radial/Recalled), Dreamer (upward/Imagined), Cronos (expiry). Propagation: Gluer, Arranger, Arouser, Affecter, Coherer, Estimator. Association: Assembler, Entifier, Categorizer. Solving: Kace (case-based, implemented), Les (lesson-based, implemented), 8 additional solvers (stubbed). Reaction: Reactor (implemented — selects reliable Actions reflexively). Deliberation: Deliberator (implemented — selects Actions matching Objectives). Reasoning: 4 reasoners (stubbed) |
| `sil-reflection.theory` | 384 | Premise | Motivation: Ameliorator (Urge→Objective, implemented), Selector (priority ranking, implemented). Daydreaming: Supervisor, Simulator (Canvas/Taxis/Animation in Imagined reality, implemented), Inhibitor. Regulation: Correlator (Result→Reward, implemented), Regulator (reinforce/correct, implemented), Terminator (goal detection, implemented). Compensation: Compensator (inversion/reciprocity/perseveration, implemented). Coping: Evaluator, Aggregator, Attentor (implemented). Exploration: Explorer (try unknown Actions, implemented), Elaborator (assess results, implemented). Discovery: Ascriber, Predictor, Designer, Experimenter (stubbed). Imitation/Play/Meta-Control (stubbed) |
| `sil-consolidation.theory` | 212 | Premise | Forgetting: Amneator (recency × usage, implemented). Automaticity: Automator (compress reliable sequences into composite Actions, implemented). Compression: Compressor (Jaccard similarity merging, implemented). MarkVoid rule (opportunistic) |
| `sil.theory` | 119 | Premise | Top-level module. Requires all components. Connects to Totality KB. Loads grimoire data via `grok`. Declares Wisdom domain. States `Self-Improvement` problem with initial fact `[I_IMPROVE]`. Launches four components concurrently. Calls `(think)` |
| `sil-codes.grimoire` | 90 | Premise | 6 code sets with 35 entries: TaskType (6), Approach (6), FailureMode (9), MetricType (5), DataFormat (5), ExecStatus (7). Each entry has a reifier, code set name, and memo |
| `sil-actuations.grimoire` | 87 | Premise | 12 actuations across 4 devices. Shell: run-script, install-package, create-venv, read-env. FileSystem: read-file, write-file, make-dir, copy-file, delete-file. Network: prompt-llm. Encoding: to-json, from-json. Each maps to one Premise intrinsic |
| `sil-profiles.grimoire` | 84 | Premise | 6 LLM providers (Anthropic, OpenAI, Nebius, Tinker, Together, Gemini) with client kind, base URL, and API key env var. 5 agent profiles (2 meta, 3 target) with model, provider, max turns, and temperature |
| `psyche.py` | 317 | Python | Device firmware. Registration with Registrar. Poll loop scanning filesystem for task descriptions, dataset structures, evaluation results, execution logs, source code changes. Percept/Urge/Result message sending to Perceiver. HTTP actuation listener dispatching to subprocess/file/network. Time budget monitoring |

### Total: 3,130 lines across 11 files

---

## Which Parts Require Premise

Everything in the `theory/` and `data/` directories runs on the Premise runtime (PAM 3.3+). This is the Mind.

Premise files and what they do:

- **`.theory` files** — Premise modules containing relations, enumerations, templates, functions, services, agents, and rules. These define the cognitive architecture. They are loaded by the PAM interpreter and run as concurrent mechanisms sharing the Totality KB.

- **`.grimoire` files** — Premise data files loaded via `(grok ...)`. They contain `(new ...)` and `(schema ...)` expressions that populate the KB with bootstrap data: code sets, actuation definitions, provider/profile configurations. They are pure data — no services or agents.

- **`.package` file** — Premise package manifest declaring the module structure and entry point. Read by the PAM loader.

### Premise requirements

- PAM runtime version 3.3 Alpha or later
- The `operations.theory` file from GIL (referenced by `sil-coordination.theory`)
- Network access to `localhost` for inter-service messaging (all services communicate via HTTP on localhost)
- A Totality KB instance at `https://localhost/SIL/Totality`

---

## Which Parts Require Python

Only the `device/psyche.py` file runs on Python. This is the Body.

The Psyche is a standard Python 3.10+ script with two dependencies:

- `requests` — for HTTP communication with the Mind's Perceiver and Executor
- Standard library only otherwise (`subprocess`, `pathlib`, `json`, `http.server`, `threading`, `argparse`, `time`)

The Psyche does not contain any cognitive logic. It does not decide what strategy to use, which approach to try, or when to stop. It performs three functions:

1. **Polls** the filesystem for changes (new results, new logs, new files) and sends them as percepts to the Mind
2. **Listens** for actuation requests from the Mind's Executor and dispatches them as subprocess calls, file operations, or HTTP requests
3. **Monitors** homeostatic variables (time budget, API budget) and sends urges when they approach limits

### Python requirements

- Python 3.10+
- `pip install requests`
- Access to the task data directory (read)
- Access to the working directory (read/write)
- Access to LLM API endpoints (if prompt-llm actuations are used)
- Network access to the Mind's Perceiver and Executor URLs

---

## How to Run SIL

### Step 1: Start the Premise Runtime

```bash
# Start PAM with the SIL entry point
pam sil/theory/sil.theory
```

This loads the Totality, groks the data files, starts all four cognitive components concurrently, and begins the inference engine. The Mind is now running and waiting for a Device to register.

At this point, the Mind has:
- An empty Totality with bootstrap relations and templates
- Code sets loaded from `sil-codes.grimoire`
- Actuation definitions loaded from `sil-actuations.grimoire`
- Provider/profile configurations loaded from `sil-profiles.grimoire`
- All services listening on localhost (Registrar, Perceiver, Executor, Activator, Matcher, Storer, Retriever, all detectors)
- All agents cycling at their prescribed intervals
- The `Self-Improvement` problem stated with initial fact `[I_IMPROVE]`
- The `(think)` inference engine running

### Step 2: Start the Psyche (Device Firmware)

```bash
# Start the Psyche pointed at a task
python3 sil/device/psyche.py \
    --task-dir /data/lawbench \
    --work-dir /runs/run_1 \
    --port 8088 \
    --poll-interval 5
```

On startup, the Psyche:

1. Sends a `[REGISTER ...]` message to the Registrar at `https://localhost/mind/registrar`
2. The Registrar creates a Device record with Name `SIA`, Type `Computational-Workbench`, Needs `{API-Budget Time-Budget Disk-Space Accuracy}`, Actuations `{run-script read-file write-file ...}`
3. The Registrar issues a registration token and returns Executor/Perceiver URLs
4. The Psyche starts its HTTP actuation listener on port 8088
5. The Psyche begins polling the filesystem every 5 seconds

### Step 3: The System Runs Autonomously

Once the Psyche is polling, the equilibration cycle begins:

1. **Perceive** — Psyche detects `task.md`, sends it as a Textual percept. TextDetector extracts traits (`classification`, `chinese-text`, `high-class-count`). StructureDetector finds `train.csv` and recognizes the Dataset. MetricDetector sees no results yet.

2. **Activate** — Storer indexes the percept as a Case. Matcher searches for similar prior Cases. If this is the first run, no matches found. Traits are enabled in Observed reality. Observer spreads activation upward.

3. **Motivate** — Accuracy Need delta is 0.70 (target 70%, current 0%). Ameliorator creates an Objective with priority 7. Selector enables it in Desired reality.

4. **Solve** — No reliable Actions exist yet. Kace finds no matching Cases. Explorer proposes a new Action (e.g., `prompt-llm` for zero-shot). Trial created.

5. **Execute** — Executor sends the actuation to the Psyche. Psyche runs the target agent via subprocess. Results written to `gen_1/results.json`.

6. **Evaluate** — Psyche detects `results.json` on next poll. MetricDetector creates ScoreProfile (accuracy 7%). Urge sent (delta 0.63).

7. **Regulate** — Correlator matches Result to Trial. Creates negative Reward (accuracy far below target). Regulator decrements `prompt-llm` reliability. Compensator creates an Obstacle.

8. **Compensate** — System detects `training-data-available` trait is active. Kace proposes `classify-with-tfidf` from its computational context. New Trial created.

9. **Succeed** — TF-IDF+SVM reaches 72%. Correlator creates positive Reward. Regulator reinforces the Action. Terminator detects Attained (Observed ∩ Desired). Objective suspended.

10. **Consolidate** — Amneator decays the zero-shot LLM approach (low reliability, low usage). Automator compresses the successful sequence into a composite Action. Lesson stored: `{Problem: classification-with-training-data, Solution: tfidf-svm, Outcome: succeeded}`.

The system stops when the Accuracy need reaches homeostatic equilibrium or the Time-Budget is exhausted. There is no generation counter. There is no `max_gen`. The Mind knows when it is done.

### Step 4: Subsequent Runs (Cross-Run Memory)

The Totality persists between runs. To run on a new task:

```bash
# Same Mind, new task
python3 sil/device/psyche.py \
    --task-dir /data/longcot-chess \
    --work-dir /runs/run_2 \
    --port 8088
```

The Mind still has the Lessons, Maxims, and Action reliability scores from the previous run. When the new task's traits are extracted, the Matcher finds Cases from the prior run. If the traits overlap (e.g., `exact-integer-answer` + `combinatorial-optimization`), the system retrieves the Lesson `algorithmic-beats-llm-on-computation` and the Deliberator proposes an algorithmic approach without needing to rediscover it.

To re-run the same task:

```bash
# Same Mind, same task again
python3 sil/device/psyche.py \
    --task-dir /data/lawbench \
    --work-dir /runs/run_3 \
    --port 8088
```

The Reactor immediately selects `classify-with-tfidf` (reliability 0.85 exceeds MinReliabilityForReaction 0.80). Generation 1 starts with the proven strategy instead of zero-shot LLM. The Simulator daydreams improvements (ensemble methods, feature engineering) while the proven approach executes.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    MIND  (Premise / PAM)                     │
│                                                             │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────┐ ┌────────┐ │
│  │ Observation  │ │ Coordination │ │ Reflection│ │Consolid│ │
│  │             │ │              │ │           │ │ ation  │ │
│  │ 6 Detectors │ │ Reactor      │ │ Correlator│ │Amneator│ │
│  │ Perceiver   │ │ Deliberator  │ │ Regulator │ │Automato│ │
│  │ Storer      │ │ Kace solver  │ │ Compensa- │ │Compress│ │
│  │ Matcher     │ │ Observer     │ │  tor      │ │  or    │ │
│  │ Activator   │ │ Dreamer      │ │ Simulator │ │        │ │
│  └──────┬──────┘ └──────────────┘ │ Explorer  │ └────────┘ │
│         │                         └───────────┘            │
│         │    ┌──────────────────────────────────┐          │
│         └────│       SIL  T O T A L I T Y       │──────────┘
│              │  Control · Ontological            │
│              │  Activative · Perceptual           │
│              │  Associative · Imaginative         │
│              └──────────────────────────────────┘
│                     ▲  Perceiver    Executor  │
└─────────────────────┼──────────────────────┼───┘
                      │                      │
                      │     HTTP / JSON      │
                      │                      │
┌─────────────────────┼──────────────────────┼───┐
│                     │   BODY  (Python)     │   │
│                     ▼                      ▼   │
│              ┌──────────────────────────┐      │
│              │     Psyche (psyche.py)   │      │
│              │                          │      │
│              │  Poll filesystem         │      │
│              │  Send percepts           │      │
│              │  Dispatch actuations     │      │
│              │  Monitor budgets         │      │
│              └──────────────────────────┘      │
│                                                │
│  ┌────────┐ ┌─────┐ ┌────────┐ ┌───────────┐  │
│  │  File  │ │Shell│ │LLM APIs│ │ Evaluation │  │
│  │ System │ │ (%) │ │ (ask)  │ │  Scripts   │  │
│  └────────┘ └─────┘ └────────┘ └───────────┘  │
│              Computational Workbench           │
└────────────────────────────────────────────────┘
```

### What runs where

| Component | Runtime | Lines | Role |
|-----------|---------|------:|------|
| SIL Totality | Premise | 890 | Shared KB — all memory areas |
| SIL Observation | Premise | 509 | Perceive, detect, store, match |
| SIL Coordination | Premise | 386 | Activate, solve, react, deliberate |
| SIL Reflection | Premise | 384 | Motivate, regulate, compensate, explore |
| SIL Consolidation | Premise | 212 | Forget, automate, compress |
| SIL entry point | Premise | 119 | Load, launch, think |
| Code sets | Premise | 90 | Lookup tables |
| Actuations | Premise | 87 | Device capabilities |
| Profiles | Premise | 84 | Provider/model configs |
| **Mind total** | **Premise** | **2,761** | |
| Psyche | Python | 317 | Device firmware |
| **Body total** | **Python** | **317** | |
| **Grand total** | | **3,078** | |

The Mind is 90% of the system. The Body is 10%. The Mind does the thinking. The Body does the doing.

---

## What SIL Adds Over SIA

| Capability | SIA | SIL |
|---|---|---|
| Cross-run memory | None | Persistent Totality — Cases, Lessons, Maxims survive across runs |
| Forward model | None | Expected reality holds predictions; Correlator compares to Observed |
| Strategy retrieval | None | Matcher finds Cases by Jaccard similarity over trait sets |
| Emotional regulation | None | Valence/Arousal drive coping via Evaluator, Aggregator, Attentor |
| Consolidation | None | Amneator forgets, Automator compresses, Compressor merges |
| Mental simulation | None | Canvases explore alternatives in Imagined reality before committing |
| Justification | Lost in LLM context | Reasons persist with full Proof chains in the Totality |
| Goal management | Hardcoded in task.md | Homeostatic Needs create Objectives with dynamic priorities |
| LLM role | Reasoning + execution | Execution only — one actuation among twelve |

---

## Dependencies

### Premise side
- PAM 3.3 Alpha runtime
- `operations.theory` from GIL (78 knowledge transmutation operations)
- Network: localhost HTTP for inter-service communication
- Storage: persistent KB for the Totality

### Python side
- Python 3.10+
- `requests` library (`pip install requests`)
- Access to task data and working directories
- Optional: LLM API keys in environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)

---

## Status

### Implemented (ready for testing)
- Full Totality with all 6 memory areas adapted for computational domain
- All 6 computational detectors
- Perceiver/Executor/Registrar mind-body interface
- Storer/Retriever/Matcher associative memory services
- Kace (case-based) and Les (lesson-based) solvers
- Reactor (reflexive action selection)
- Deliberator (goal-directed action selection)
- Ameliorator, Selector (motivation)
- Correlator, Regulator, Terminator (regulation)
- Compensator (failure response)
- Simulator (mental simulation in Imagined reality)
- Explorer, Elaborator (discovery through action)
- Evaluator, Aggregator, Attentor (emotional coping)
- Amneator, Automator, Compressor (consolidation)
- Complete Psyche firmware with polling, dispatch, and budget monitoring
- All code sets, actuations, and profiles

### Stubbed (architecture in place, logic marked `tbd`)
- 8 additional solvers (Anas, Hier, Mends, Plato, Stacy, Gray, Epis, Gene)
- 4 reasoners (Deducer, Analogizer, Inducter, Transducter)
- Discovery agents (Ascriber, Predictor, Designer, Experimenter)
- Imitation agents (Recognizer, Reproducer)
- Play agents (Composer, Practicer)
- Meta-Control agents (Monitor, Modifier)
- Inhibitor (simulation gating)

### Not yet created
- Integration tests against LawBench
- Cross-task transfer validation (LawBench → longcot-chess)
- Cross-run memory validation (LawBench run 2)

---

*SubThought Corporation — June 2026*
