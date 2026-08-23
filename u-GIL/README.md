# μ-GIL 2.0 — A Spatial Abstraction Learner

A parsimonious working instance of the **Piagetian Modeler** cognitive architecture,
built to navigate the ARC-AGI-3 spatial reasoning corpus — and to carry the same mind
into a physical body.

> An LLM knows almost everything and can verify almost nothing.
> A GIL mind knows almost nothing and can verify everything it knows.

**Two worlds. One psyche. Nothing it did not earn.**

---

## What this is

The Piagetian Modeler is a constructivist neurosymbolic architecture: a system that
builds and revises mental models of actual and virtual worlds *solely through
perception*. **GIL** (Generally Intelligent Learner) is its reference instantiation.
**μ-GIL** is the second — a minimal system that keeps the perception pipeline, the
Piagetian epistemology and the spatial hierarchy intact while replacing GIL's formal
reasoning engine and developmental staging with something empirical and streamlined.

μ-GIL exists to answer two questions:

1. Does GIL's perception pipeline hold up against a live, unforgiving testbed?
2. Which coordination and reflection mechanisms does a working spatial abstraction
   learner *actually* need?

**μ-GIL 2.0** is the current iteration: tabula rasa, no imported direction, and
decisioning carried by **concurrent agents over a shared Totality** — the stigmergy the
architecture was designed for.

---

## The three defining properties

**Perception is active and constructive.** Sensory input passes through detectors into
a variable-length *trait vector*, compared against stored cases. A miss **assimilates** —
mint a reifier, store a case, the ontology grows. A hit **accommodates** — reinforce the
case, spread activation. This is a categorical decision made by the Matcher. No
probabilistic threshold, no loss function, no gradient.

**The world model is acquired, not given.** Every action produces proprioceptive
feedback, perceived and compared against the prediction that preceded it. A confirmed
prediction reinforces the model; a failed one triggers compensation — the model is
corrected at exactly the point of surprise.

**One memory substrate, shared.** Perception, coordination, reflection and consolidation
all read and write the same knowledge base. No separate training data, no separate
inference model. Working memory *is* long-term memory.

---

## Two worlds, one Psyche

A **Psyche** is the world interface — a sense organ. It mediates two flows and speaks
exactly four tuples:

| Tuple | Direction | Slots |
|---|---|---|
| `PERCEPT` | inward | `:Modality :Channel :Address :Data :Content :Moment :Token` |
| `ATTEMPT` | outward | `:Action :Parameters :Token :By` |
| `RESULT` | inward | `:Action :Status :Reason :Moment :Token` |
| `URGE` | inward | `:Need :Source :Delta :Moment :Token` |

**Invariant — the mind:** the tuple grammar, and every mechanism behind it. All of it
operates on the trait set alone.

**Per-device — the world:** `:Channel` (which sensory domains exist at all), `:Data`
(which parsable structures arrive), `:Content` (the device's own slot vocabulary), and
`:Action` (its actuation repertoire).

### Eidos — the ARC-AGI-3 device

εἶδος, *"to see."* A 64 × 64 grid, 16 colours, 7 standardised actions, turn-based — the
world changes only when the agent acts. No instructions are given: mechanics, goal and
win condition must all be discovered. Scored by RHAE = (human actions ÷ agent actions)².

- **One channel:** `Grid`
- **Percepts:** `grid-state`, `grid-delta`, `game-event`
- **Actuations:** `RESET`, `ACTION1–4` (up/down/left/right), `ACTION5` (interact, select,
  rotate), `ACTION6` (click at x,y), `ACTION7` (undo)

Two-pass connected-component labelling turns cells into regions; each region becomes one
trait (~24 per frame). Nothing in the mind knows what a lock, a key or a door is.

### Expanse — the NAO device

Latin *expansum*, *"spread out."* A SoftBank NAO humanoid over NAOqi or ROS 2: two head
cameras, a four-microphone array, torso IMU, sonar, bumpers, capacitive head sensors, 25
joints. Continuous, noisy, and it does not wait for the mind to finish thinking.

- **Eight channels:** Visual, Auditory, Haptic, Proprioceptive, Spatial, Olfactory,
  Communication, System
- **35 actuations:** locomotion, gaze, manipulation, gesture, communication, motor
  control, capture, system
- **Homeostatic urges:** power, thermal, balance, safety, connectivity

A body has needs a grid does not. Urges are how they reach the mind.

**Add a world by adding a detector clause.** Nothing downstream changes.

---

## One spatial hierarchy, two worlds

Seven levels, Scene through Map. The **grammar is shared; the contents are learned.**

| Level | Eidos | Expanse |
|---|---|---|
| **Map** | the whole game — every level | the site |
| **Region** | a quadrant of a level | a building |
| **Area** | a corridor system | a floor |
| **Place** | an arrangement — the position fingerprint | a spot: by the door |
| **Locale** | a chamber of the maze | the kitchen |
| **Venue** | the board | the room |
| **Scene** | one frame's regions | one camera field |

Three mechanisms fill it, in either world:

- **Locater** builds bottom-up from perceived containment, adjacency and above/below.
- **Mapper** accumulates top-down as new groupings are encountered on traversal.
- **Navigator** does BFS over the graph and mints a **Route** — waypoints, a cursor, a
  destination.

**Why this closes the horizon.** A forty-step excursion at *Place* granularity is beyond
any bounded walk. The same journey is three hops at *Locale* granularity. μ-GIL 1.0's
level-2 wall was not a missing route — it was a missing level of abstraction.

What μ-GIL contributes is how the levels get **populated** from raw perception:

1. **Regions** — two-pass connected components → colour, bbox, size, shape class. *Scene.*
2. **Arrangements** — a controllable-colour whitelist filters regions into a multiset of
   `"colour@x,y"` keys — a position fingerprint that recurs. *Place.*
3. **Edges** — `Action` schemes whose `:Context` is the source arrangement and `:Result`
   the destination. The adjacency the Locater and Navigator walk.
4. **Relational state** — clusters summarised by scale-normalised pattern tokens; a
   mutable cluster adopts a static one's token as its anchor. *Grounds the image schemas.*

---

## Decisioning — agents over a shared Totality

### The structural move

Selection is not a score comparison. It is **activation strength in Desired reality**.

Each proposing agent `enable`s its candidate actuation in `Desired`. Convergent
proposals *accumulate Pulses on the same monad*. The Deliberator selects the
most-activated act. Cronos decays what stops being endorsed.

Three consequences a ranking procedure cannot have:

- **Evidence is additive.** Three agents independently endorsing one act outweighs one
  agent endorsing another. Agreement is represented, not adjudicated.
- **Intent persists across ticks.** An activation survives until it decays. That is
  commitment with revision — the substrate for a long-horizon excursion.
- **The temporal dimension exists.** Convergence, integration and re-expression at the
  decision layer, with real windows and decay.

### The Agenda is the blackboard

Agents never message each other. They read and write `Agenda`, which is **reused from
GIL verbatim**:

```lisp
(relation Agenda
  :Telon          ; objective to be achieved
  :Priority   0   ; cognitive assessment
  :Urgency    0   ; homeostatic drive — the Ameliorator syncs it
  :Exec       idle
  :Plan       todo
  :For        (L Life)
  :By :Since)
```

The division of labour is already settled by the existing helpers: `score {?agendum}`
reads `:Telon :Priority :Urgency`, and `likelihood {?telon ?act}` takes telon and act
*separately*. So **Agenda holds telons; Attempt holds acts.** A proposal is a `Trial`
enabled in `Desired`; the Executor mints the `Attempt`.

### The Action scheme is the unit

`template` declares a flat table *and* a `Wire` naming which slots are afferent and
efferent; `schema` then mints a row *and* a `Scheme` whose `:A`/`:E` are those slots'
contents. Declaring `Action` with `:Result` as a **referent**:

```lisp
(template Action
  {:Context {} :Goals {} :Loop (R Once) :For (L Life)}   ; arguments
  {:Result {}})                                          ; referents
```

means activation flows through the slots for free:

- **Observer** (upward, `Observed`): context + goals active → the Action fires → `:Result`
  enabled. *Doing it makes its consequences true.*
- **Anticipator** (downward, `Expected`): the Action in Expected → its `:Result` in
  Expected. **That is the forward model** — no separate transition table.

Surprise is the Expected-vs-Observed disagreement at the `:Result` monads.

The ladder that builds representation:

| Level | Scheme | Built by |
|---|---|---|
| 0 | `Actuation :Name :Device :Modality` | one per `:AvailableActions`; `Capability :Enabled` tracks the current offering |
| 1 | `Action :Context {arr} :Goals {actuation} :Result {}` | minted on first sighting |
| 2 | `:Result` filled from what activated after the Attempt | **Elaborator** |
| 3 | composite: union of two co-temporal successes | **Regulator-Genetic** / Automator |
| 4 | an Action whose `:Result` contains the telon | **Deliberate-Direct** fires |

**An empty `:Result` is the frontier** — `Explorer` fires on actions whose postconditions
are unknown, which regenerates as new Actions are bred. **Level 3 is the horizon fix**: a
forty-step excursion becomes *one* Action with a Series of forty Goals, selectable in a
single decision.

### The roster

**Proposers** — each posts an Agenda row and enables its act in `Desired`:

| Agent | Proposes when |
|---|---|
| **Kace** | this act produced progress from this exact context |
| **Reactor** | globally reliable — `Utility :Successes ÷ :Attempts` above threshold |
| **Explorer** | an Action's `:Result` is empty — its postconditions are unknown |
| **Simulator** | a dream reaches progress, closes a relational match, or carries one |
| **Navigator** | BFS over the spatial graph finds a Route; posts its first leg |
| **Requestioner** | the walk proved no way out; re-try the least-recently-settled pair |
| **Holder** | the discovered null action, in a world the ledger says is untrustable |

**Gates** — these `impede` rather than propose. A vetoed act was never a candidate:

| Agent | Impedes |
|---|---|
| **Inhibitor** | the model predicts this act does nothing here |
| **Budgeter** | the carry cannot complete within the remaining learned budget |
| **Critic** | the rehearsal in `Imagined` did not satisfy the telon |

**Selection, execution, settlement:** Deliberator → Executor → Action-Correlator →
Regulator → Terminator.

**Substrate:** Activator (service) · Cronos @m50 · Observer @m1 · Anticipator @m1 ·
Dreamer @m10 · Locater / Mapper @m32 · Ascriber @m300 · Amneator @m5000.

Roughly twenty-five agents. Not sixty.

### Attempts determine what failed

```lisp
(relation Attempt :Trial :Telon :Act :Exec :When)
```

`Action-Correlator` matches the inbound `RESULT` to its open `Attempt` and checks the
Action's expected postconditions against `Observed`:

- **Succeeded** → enable the Action monad in `Observed`; mint the Event with
  `:What` = the action.
- **Failed** → set `Agenda :Plan fail`; mint the Event with `:What` = `(antith ?action)`
  — **the dyad**.

The dyad is why failure is first-class. *"All my failures at X"* becomes a queryable
monad with its own activation history.

`Regulator` then does what the predecessor could not: on failure it mints an
**impediment**, synthesises its antithesis as an **enablement**, clones the Action with
that enablement in `:Context`, mints a `Causes` hypothesis with an empty `:Premise`, and
posts a new Agenda item — *discover what causes the enablement*.

The mind asks what is blocking it.

### One tick

```
frame  →  Perceiver  →  Matcher  →  Case  →  Scene  →  enable in Observed
       →  Observer spreads upward;  Anticipator checks Expected against it
       →  disagreement = surprise  →  accommodate the faulty scheme
       →  Action-Correlator settles the open Attempt  →  Event (either pole)  →  Regulator
       →  proposers post Agenda rows and enable acts in Desired
       →  gates impede
       →  Critic rehearses in Imagined; promotes only what survives
       →  Deliberator selects the most-activated act
       →  Executor  →  ATTEMPT  →  the Psyche
       →  Cronos decays whatever nobody re-endorsed
```

---

## What the Totality carries

| Area | Relations | Role in decisioning |
|---|---|---|
| **Control** | Registry, Actor, Mind, Utility, Usage, Belief, Emotion, Need | lifecycle, reliability, valence |
| **Ontological** | Scheme `:M :R :A :E`, Argument, Referent, templates | every belief, with its afferents and efferents |
| **Perceptual** | Scene, Object, Lexeme, Icon, Geon | the arrangement imagination remixes; **persisted**, so provenance crosses sessions |
| **Associative** | Case, Trait | inverted trait index — `matcher-find` narrows by index, then scores with the built-in `~` |
| **Imaginative** | Canvas, Taxis, Vantage, Route, Animation | a dream is a Taxis enabled in `Imagined`; a Route is waypoints with a cursor |
| **Activative** | Activation, Glue, Agenda, Attempt, Origin, Wire | four realities; Pulses; the decision itself |

**Four realities minimum.** `Observed`, `Desired`, `Expected`, `Imagined`. Surprise is
the disagreement between Expected and Observed activation arriving at the same scheme.

**Graded identity.** `matcher-find` returns `[MATCH :Score]`, so the caller decides.
Event identity demands `:minscore 1.0`; percept assimilation does not. A single threshold
that silently collapses two board positions into one is gone.

**Roughly 90% of GIL's Totality is reusable verbatim.** The divergence between the two
systems is almost entirely in `src/pattern/`, not in `src/memory/`.

---

## Two systems, one architecture

| Dimension | GIL | μ-GIL |
|---|---|---|
| Source | ~50 files, 20,000+ lines Premise | ~30 files, ~8,000 Premise + 1,200 Python |
| Mechanisms | ~60 agents, rules and services | ~25 agents over one Agenda |
| Memory areas | 6 | 6 — ~90% reused verbatim |
| Realities | 8 parallel layers | 4 — Observed, Desired, Expected, Imagined |
| Spatial ontology | 7 levels, Scene through Map | the same 7 levels, contents learned |
| Planning | 10 solvers, 136 reasoning ops | Navigator BFS over learned Action schemes |
| Forgetting | Amneator + 3 compressors | Amneator, decay-gated |
| Status | reference system, specified | runs live, wins level 1 reliably |

### What μ-GIL invents

Mechanisms GIL's specification does not anticipate, each discovered by running against
the live competition, diagnosing the failure, building the fix, and verifying it with a
unit demo before the next run:

- **Relational state layer** — clusters summarised by scale-normalised pattern tokens
  (binarize → crop → GCD-downscale → `"WxH:bits"`), so a glyph drawn at 2×2 scale yields
  the same token as the same glyph at 1×1.
- **Anchor adoption** — a mutable cluster whose alphabet contains a static cluster's
  token adopts it: *"this indicator can show what that plate shows."*
- **Evidence confidence** — majority-based edge recording. A single fluke cannot
  overwrite 26 consistent observations.
- **The budget gate** — learns the world's action budget from visible teleports, and
  vetoes any carry the remaining budget cannot complete.
- **Question-the-map** — when the walk proves no way out, re-try the
  least-recently-settled pair: accommodation applied to the frontier ledger itself.

---

## Correspondence with Neural Rendering

μ-GIL's predict–compare–update loop has an independent parallel in Blumberg's biological
vision theory:

| Blumberg | μ-GIL |
|---|---|
| `ŷ = F(s_world, s_body, a)` — forward model | the `Action` scheme: Context + Goals → `:Result`, propagated downward in `Expected` |
| `δ = encode(y) − ŷ` — structured residual | the Expected-vs-Observed activation disagreement at each scheme |
| `s_t+1 = G(s_t, δ, a)` — the gate | the Correlator / Regulator / Terminator chain: reinforce, or overwrite at the point of surprise |

The controllable-colour whitelist — which separates the agent's piece from HUD churn — is
μ-GIL's functional counterpart to separating **body state** from **world state**.

**NAPOT** describes a *receive → transform → re-express* cycle. In 2.0 this is the
decision layer itself: proposals converge as Pulses on a candidate monad, the Deliberator
integrates, the selection is re-expressed as an `ATTEMPT`. With
`EnabledSince`/`EnabledUntil` windows, `impede` as the inhibitory contribution, and Cronos
as the expiry, the **WHEN** the predecessor lacked is now present.

---

## Results (the predecessor)

47 ledger entries: 1 replay, 1 scripted probe, and **45 live LS20 runs** against the
ARC-AGI-3 competition server. Each live run is up to 16 chained 8-turn sessions
(~129 actions), with the Totality saved and restored across every session boundary.

- The first **11** live runs completed zero levels.
- Run **12** was the first to complete level 1, after dream-as-prediction and the frontier
  rule landed.
- From run **14** onward the level-1 win rate stabilised **above 80%** and stayed there.
- Cost per level-1 win fell from **~640** actions to **~125**, against a theoretical floor
  of **15** (the scripted probe that already knows the route).
- **Level 2 was never completed.**

The win, from the competition's own record: a relational match closed, then the matched
piece carried to its plate over six consecutive decisions. Transform, then deliver —
assembled from general parts. A region-equality predicate said *what* to make true, an
adopted anchor said *where* it mattered, a distance gradient said *which way*, and a shift
ledger said *what not to do on the way*.

**Grep the mind's code for game constants: zero.**

---

## The boundary

Level 2 is a 21-action energy budget the mind must learn from observed teleports, against
a winning route of roughly 19 actions. Five probes tested the empirical corridor; the
furthest reached the cross (the key-display rotator) but none entered the portal before
the budget expired.

The winning mechanism sat 59 walk-steps away, inside the budget, and the mind could not
see it. One-step dreams all read known-and-burned; the bounded walk found no frontier to
route to; re-verification won by default and consumed two-thirds of the level-2 action
budget checking a map that was already fine.

> What is missing is not compute or budget. The mind was planning at **Place**
> granularity — forty single steps, whose value no one-step dream and no bounded walk can
> see. It had no **Locale** above them, so it could not ask the short question.
> Evidence-driven exploration has a horizon, and forty-five runs found exactly where a
> *flat* map ends.

The predecessor's decision procedure was also *memoryless* — every tick re-evaluated from
scratch, so nothing carried a commitment forward. The workaround was an externally
supplied waypoint list with a cursor and per-leg patience: a hand-built Agenda with one
item. 2.0 makes that structure native and generates its content internally.

---

## What 2.0 changes

| | Change | Rationale |
|---|---|---|
| **Out** | Imported waypoint routes | The one lever that moved level 2 — and the one thing the mind could not have earned. |
| **Out** | Single-function, ranked selection | Memoryless by construction. No commitment survives the tick that produced it. |
| **In** | The seven-level spatial hierarchy | A flat graph is adequate for a 64 × 64 board and inadequate for a body in a building. It is also the horizon fix. |
| **In** | Agents over a shared Agenda | Proposers, gates and settlement as concurrent mechanisms. Stigmergy, not a switch statement. |
| **In** | Activation as the decision | Convergent proposals accumulate; endorsement decays; intent persists. |
| **In** | The Action scheme as the unit | Context + Goals → Result, wired so activation flows through the slots. |
| **In** | A Critic before acting | Rehearse in `Imagined`; promote to `Desired` only what satisfies the telon. |
| **In** | Failure as a first-class monad | The dyad, an impediment, an enablement hypothesis, and an agenda item to find the cause. |
| **Fix** | Graded identity | An inverted trait index returning a score, not a threshold that collapses two places into one. |
| **Fix** | Persisted Scene and Trace | Provenance and rehearsal survive session boundaries. |

None of these is a new idea. All of them are already written in GIL. The work is porting
them into what runs.

---

## Long-horizon agents

A long-horizon task is defined by its **structure**, not its clock time: a goal whose
solution requires composing many tightly coupled, interdependent decisions into one
coherent trajectory, with feedback and revision along the way.

- **H1, intra-context** — many coupled steps in one window; reasoning that verifies and
  recovers before the chain derails.
- **H2, cross-context** — the task outgrows the window; state compressed, externalised,
  checkpointed, faithfully resumed.
- **H3, cross-task** — an open-ended stream with shifting goals; reusable skills that
  accumulate.

μ-GIL is an H3 system by construction, and contributes three things:

**Mid-run verification, natively.** Nothing reaches `Desired` without the Critic; nothing
settles without the Correlator grading the prediction that preceded it.

**Durable state, tested to destruction.** Sessions end every eight turns by design. Save,
wipe, reload, resume — the H2 problem faced 45 times on the public record.

**A real reward signal.** A live competition API grades every action, and every decision's
basis rides to its `reasoning` field. No simulated environment, no verifier to
reward-hack.

---

## Runtime notes

μ-GIL runs on **Premise 3.3**. Constraints that shape the code:

- Every user function has a **~99-invocation budget per session**. Distributing the loop
  across ~25 agent bodies spreads that ceiling instead of concentrating it in one large
  function.
- **Rules or fallback.** Every proposer's body is a function of explicit `with` queries.
  Where the rules engine fires, wrap it in `(rule …)`; where it does not, call the same
  body from the agent's job. One implementation either way.
- **No network IO on the alpha.** World contact goes through a Python file bridge, which
  owns every protocol detail the mind must never see: HTTPS, cookies, JSON, and 64×64
  frame flattening. If `open` / `tell` / `ask` work on the current build, the bridge
  deletes and the Psyche speaks HTTPS directly.
- **KB persistence is rolled in-language** — one plain-token file per Case under
  `etc/ken/`, reloaded and re-asserted at boot.

---

## Repository layout

```
u-GIL/
├── cfg/                     configuration — daichos
├── src/
│   ├── axioms/              the being, the component manifests
│   ├── memory/              the six Totality areas
│   ├── pattern/             the design patterns — agents, rules, services
│   ├── psyche/              world interfaces
│   └── portal/              audit renderers
├── pkg/                     external packages
└── etc/                     runtime state, orchestration, evidence
```

| Path | Contents |
|---|---|
| `cfg/` | `u-GIL.daicho` · `Eidos.daicho` · `Expanse.daicho` · `Registry.daicho` |
| `src/axioms/` | `u-GIL.being` (entry point) · `u-GIL.totality` · the Observation, Coordination, Reflection and Consolidation manifests |
| `src/memory/` | `control.memory` · `ontological.memory` · `perceptual.memory` · `associative.memory` · `imaginative.memory` · `activative.memory` |
| `src/pattern/` | `observing` · `embodying` · `reminding` · `activating` · `associating` · `locating` · `navigating` · `reacting` · `deliberating` · `motivating` · `simulating` · `regulating` · `compensating` · `exploring` · `discovering` · `imagining` · `staging` · `forgetting` |
| `src/psyche/` | `grid.psyche` (Eidos) · `nao.psyche` (Expanse) · `camera.psyche` |
| `src/portal/` | `render.theory` — perception, deliberation and dream audit windows |
| `pkg/` | `eidos/` · `ros/` · `nao/` · `vision/` · `video/` · `imagination/` |
| `etc/` | `ken/` (persisted Totality) · `frames/` (bridge inbox and outbox) · `replays/` (run archives, `ledger.txt`) · `log/` · `analysis/` (replicas) · `bridge.py` · `play.py` · `premrun.py` |

**Entry point.** `u-GIL.being` requires the Totality and the four component manifests,
opens the lore, states the Self-Actualization problem and calls `start-mind`.

### Running the demos

```
(grok "./src/axioms/u-GIL.being")
(demo-camera)      ; perceive a scene twice: NEW, then RECALLED
(demo-grid)        ; token frames → percepts → delta → action file
(demo-similar)     ; graded assimilation over the trait index
(demo-locate)      ; Scene → Venue → Locale built bottom-up from perception
(demo-navigate)    ; BFS over the spatial graph mints a Route
(demo-coordinate)  ; agents propose, gates impede, the Deliberator selects
(demo-predict)     ; dreams replace actions; a betrayed prediction self-corrects
(demo-match)       ; relational state-match across render scales
(demo-persist)     ; memory survives a wipe and restart
```

Run demos **one per eval** — chaining two trips the invocation budget.

---

## Method

**Replica-first.** Every mechanism is validated by a Python replica over archived frames
*before* any Premise is written. It has paid for itself every time: question-the-map's
replica found the exact stale edge and Monte-Carlo'd the repair before a line of code;
shift-generalization was *refuted* by its replica and zero Premise was written.

**Demo-proven or it doesn't count.** Every phase lands with a runnable `demo-*` that
proves its Done condition.

**No game-specific constants in the mind.** Hand-decoding a public game is legitimate
spec-writing; only general mechanisms may land in Premise. The checkable standard is a
grep.

**Every decision carries provenance.** The Deliberation record holds every proposal, its
proposing agent, its dream, and how the choice aged — confirmed or surprised. The portal
renders the same record the Executor acted on. There is no second, post-hoc story.

---

## References

- Miller, M. S. P. (2021). *The Piagetian Modeler.* AGI 2021, LNCS 13154, Springer.
  DOI: 10.1007/978-3-030-93758-4_16
- Miller, M. S. P. & Blumberg, M. (2025). *Building Sentient Beings.* SubThought
  Corporation. https://zenodo.org/records/15522356
- Miller, M. S. P. (2018). *Building Minds with Patterns.* ISBN 978-1-980362-66-1
- Miller, M. S. P. (2026). *Coding Artificial Minds.* Forthcoming.
- Miller, M. S. P. (2013). *The Neural Proposition: Structures for Cognitive Systems.*
  AAAI Spring Symposium Technical Report, pp. 44–50.
- Blumberg, M. (2026). *Embodied Neural Rendering in Self-Aware Networks.* Self Aware
  Networks Institute. DOI: 10.5281/zenodo.21331180
- Piaget, J. (1952). *The Origins of Intelligence in Children.* W. W. Norton.
- Chollet, F. (2019). *On the Measure of Intelligence.* arXiv:1911.01547
- ARC Prize Foundation (2026). *ARC-AGI-3: A New Challenge for Frontier Agentic
  Intelligence.* arXiv:2603.24621

**Paper:** *μ-GIL: A Spatial Abstraction Learner* — BICA-26 proceedings, September 2026.

---

## Contact

**Michael S. P. Miller** · SubThought Corporation
subthought@hotmail.com
YouTube — https://youtube.com/@CognitiveArchitectures

---

*A mind that earns its knowledge is slow to start — and impossible to fool about what it
does not know.*
