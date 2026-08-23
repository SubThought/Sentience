# μ-GIL 2.0 — A Spatial Abstraction Learner

A parsimonious working instance of the **Piagetian Modeler** cognitive architecture,
built to navigate the ARC-AGI-3 spatial reasoning corpus — and to carry the same
mind into a physical body.

> An LLM knows almost everything and can verify almost nothing.
> A GIL mind knows almost nothing and can verify everything it knows.

**Two worlds. One psyche. Nothing it did not earn.**

---

## What this is

The Piagetian Modeler is a constructivist neurosymbolic architecture: a system that
builds and revises mental models of actual and virtual worlds *solely through
perception*. **GIL** (Generally Intelligent Learner) is its reference instantiation.
**μ-GIL** is the second — a minimal system that keeps the perception pipeline and the
Piagetian epistemology intact while replacing GIL's designed spatial ontology and
formal reasoning engine with something empirical and streamlined.

μ-GIL exists to answer two questions:

1. Does GIL's perception pipeline hold up against a live, unforgiving testbed?
2. Which coordination and reflection mechanisms does a working spatial abstraction
   learner *actually* need?

**μ-GIL 2.0** is the current iteration: tabula rasa, no imported direction, and
decisioning carried by **concurrent agents over a shared Totality** — the stigmergy
the architecture was designed for.

---

## The three defining properties

**Perception is active and constructive.** Sensory input passes through detectors into
a variable-length *trait vector*, compared against stored cases. A miss
**assimilates** — mint a reifier, store a case, the ontology grows. A hit
**accommodates** — reinforce the case, spread activation. This is a categorical
decision made by the Matcher. No probabilistic threshold, no loss function, no
gradient.

**The world model is acquired, not given.** Every action produces proprioceptive
feedback, perceived and compared against the prediction that preceded it. A confirmed
prediction reinforces the model; a failed one triggers compensation — the model is
corrected at exactly the point of surprise.

**One memory substrate, shared.** Perception, coordination, reflection and
consolidation all read and write the same knowledge base. No separate training data,
no separate inference model. Working memory *is* long-term memory.

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

εἶδος, *"to see."* A 64 × 64 grid, 16 colours, 7 standardised actions, turn-based —
the world changes only when the agent acts. No instructions are given: mechanics, goal
and win condition must all be discovered. Scored by RHAE = (human actions ÷ agent
actions)².

- **One channel:** `Grid`
- **Percepts:** `grid-state`, `grid-delta`, `game-event`
- **Actuations:** `RESET`, `ACTION1–4` (up/down/left/right), `ACTION5` (interact,
  select, rotate), `ACTION6` (click at x,y), `ACTION7` (undo)

Two-pass connected-component labelling turns cells into regions; each region becomes
one trait (~24 per frame). Nothing in the mind knows what a lock, a key or a door is.

### Expanse — the NAO device

Latin *expansum*, *"spread out."* A SoftBank NAO humanoid over NAOqi or ROS 2: two
head cameras, a four-microphone array, torso IMU, sonar, bumpers, capacitive head
sensors, 25 joints. Continuous, noisy, and it does not wait for the mind to finish
thinking.

- **Eight channels:** Visual, Auditory, Haptic, Proprioceptive, Spatial, Olfactory,
  Communication, System
- **35 actuations:** locomotion, gaze, manipulation, gesture, communication, motor
  control, capture, system
- **Homeostatic urges:** power, thermal, balance, safety, connectivity

A body has needs a grid does not. Urges are how they reach the mind.

**Add a world by adding a detector clause.** Nothing downstream changes.

---

## Decisioning — agents over a shared Totality

### The structural move

Selection is not a score comparison. It is **activation strength in Desired reality**.

Each proposing agent `enable`s its candidate actuation in `Desired`. Convergent
proposals *accumulate Pulses on the same monad*. The Deliberator selects the
most-activated act. Cronos decays what stops being endorsed.

Three consequences that a ranking procedure cannot have:

- **Evidence is additive.** Three agents independently endorsing one act outweighs one
  agent endorsing another. Agreement is represented, not adjudicated.
- **Intent persists across ticks.** An activation survives until it decays. That is
  commitment with revision — the substrate for a long-horizon excursion.
- **The temporal dimension exists.** Convergence, integration and re-expression at the
  decision layer, with real windows and decay — the *WHEN* the NAPOT correspondence
  was missing.

### The Agenda is the blackboard

Agents never message each other. They read and write `Agenda`. That is the stigmergy
the architecture specifies.

```lisp
(relation Agenda
  :Telon          ; objective or sub-goal reifier
  :Act            ; proposed actuation — nil while the telon still needs planning
  :Basis          ; which agent proposed it (provenance)
  :Dream          ; imagined future (Taxis reifier) — nil if unimagined
  :Priority  0    ; cognitive assessment
  :Urgency   0    ; homeostatic drive — synced by the Ameliorator
  :Exec   idle    ; idle | wait | sent
  :Plan   todo    ; todo | busy | done | fail
  :By             ; deadline moment
  :Since)         ; created
```

### The roster

**Proposers** — each posts an Agenda row and enables its act in `Desired`:

| Agent | Proposes when |
|---|---|
| **Kace** | this act produced progress from this exact context |
| **Reactor** | globally reliable — `Utility :Successes ÷ :Attempts` above threshold |
| **Explorer** | an Action's `:Result` is empty — its postconditions are unknown |
| **Simulator** | a dream reaches progress, closes a relational match, or carries one |
| **Navigator** | BFS over `Tandem` chains finds a Route; posts its first leg |
| **Requestioner** | the walk proved no way out; re-try the least-recently-settled pair |
| **Holder** | the discovered null action, in a world the ledger says is untrustable |

**Gates** — these `impede` rather than propose. A vetoed act was never a candidate:

| Agent | Impedes |
|---|---|
| **Inhibitor** | the model predicts this act does nothing here |
| **Budgeter** | the carry cannot complete within the remaining learned budget |
| **Critic** | the rehearsal in `Imagined` did not satisfy the telon |

**Selection, execution, settlement:**

| Agent | Role |
|---|---|
| **Deliberator** | selects the most-activated act in `Desired`; writes the Deliberation record |
| **Executor** | mints an `Attempt`, dispatches the `ATTEMPT` tuple to the Psyche |
| **Action-Correlator** | matches `RESULT` to `Attempt`, checks postconditions, mints the Event |
| **Regulator** | updates `Utility` and `Emotion`; on failure, poses the impediment |
| **Terminator** | detects satisfaction in `Observed`, frees the Agenda item |

**Substrate:**

| Agent | Cycle | Role |
|---|---|---|
| **Activator** | service | writes `Activation` records — `enable` / `impede` |
| **Cronos** | @m50 | expires activations whose window has elapsed |
| **Observer** | @m1 | spreads activation upward in `Observed` |
| **Anticipator** | @m1 | spreads activation downward in `Expected` |
| **Dreamer** | @m10 | spreads activation upward in `Imagined` |
| **Tandemer** | @m32 | sequential association — builds the arrangement graph |
| **Unisoner** | @m32 | co-occurrence association |
| **Ascriber** | @m300 | causal hypotheses from Events |
| **Amneator** | @m5000 | forgetting — zero-usage recent, low-usage old |

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
monad with its own activation history; retrieval splits on it, reasoners chain over it,
and repeated failures share one antithesis.

`Regulator` then does the part the predecessor could not: on failure it mints an
**impediment**, synthesises its antithesis as an **enablement**, clones the Action with
that enablement in `:Context`, mints a `Causes` hypothesis with an empty `:Premise`,
and posts a new Agenda item — *discover what causes the enablement*.

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
| **Perceptual** | Scene, Object, Lexeme | the arrangement imagination remixes; **persisted**, so provenance crosses sessions |
| **Ontological** | Scheme `:M :R :A :E`, Argument, Referent | every belief, with its afferents and efferents |
| **Associative** | Case, Trait | inverted trait index — `matcher-find` narrows by index, then scores with the built-in `~` |
| **Association** | Tandem, Unison, Genus | **`Tandem` (Prior → Later) is the arrangement graph** the Navigator walks |
| **Imaginative** | Canvas, Taxis, Vantage, Route | a dream is a Taxis enabled in `Imagined`; a Route is waypoints with a cursor |
| **Activative** | Activation, Glue, Agenda, Attempt, Origin | four realities; Pulses; the decision itself |
| **Control** | Registry, Actor, Mind, Utility, Emotion | lifecycle, reliability, valence |

**Four realities minimum.** `Observed`, `Desired`, `Expected`, `Imagined`. Surprise is
the disagreement between Expected and Observed activation arriving at the same
scheme — the phasic residual, and the accommodation trigger.

**Graded identity.** `matcher-find` returns `[MATCH :Score]`, so the caller decides.
Event identity demands `:minscore 1.0`; percept assimilation does not. A single
threshold that silently collapses two board positions into one is gone.

---

## Two systems, one architecture

| Dimension | GIL | μ-GIL |
|---|---|---|
| Source | ~50 files, 20,000+ lines Premise | ~30 files, ~8,000 Premise + 1,200 Python |
| Mechanisms | ~60 agents, rules and services | ~25 agents |
| Memory areas | 6, incl. Glue spatial layout | 6, Glue optional |
| Realities | 8 parallel layers | 4 — Observed, Desired, Expected, Imagined |
| Spatial ontology | 7 levels, designed a priori | 4 layers, learned from transitions |
| Planning | 10 solvers, 136 reasoning ops | Navigator BFS over observed Tandems |
| Forgetting | Amneator + 3 compressors | Amneator |
| Status | reference system, specified | runs live, wins level 1 reliably |

### What μ-GIL shares

The perception pipeline, implemented faithfully. Assimilation and accommodation as the
only two paths. Content-addressed reifiers — a deterministic rolling hash means
identity survives restarts by construction. The Correlator grading every consequence.
An audit trace at every pipeline stage.


## Spatial abstraction — designed vs empirical

The deepest divergence between the two systems, and the paper's most significant
finding.

**GIL** starts with a seven-level hierarchy — Scene, Venue, Locale, Place, Area,
Region, Map — with Spots binding objects to 3-D coordinates and ten image schemas as
spatial templates. A Locater builds bottom-up, a Mapper accumulates top-down, and a
Navigator does BFS pathfinding over the graph. The structural grammar is innate;
experience fills it.

**μ-GIL** has no hierarchy, no image schemas and no prior spatial grammar. Four layers
emerge from the pipeline and the experience record:

1. **Regions** — two-pass connected components → colour, bbox, size, shape class.
2. **Arrangements** — a controllable-colour whitelist filters regions into a multiset
   of `"colour@x,y"` keys. *≈ GIL's Place.*
3. **Edge graph** — `Tandem` schemes record `(arrangement, action) → destination` with
   a settle stamp and majority evidence. *≈ GIL's Map.*
4. **Relational state** — clusters, normalised tokens, anchor adoption.
   *≈ GIL's image schemas.*

> A system built on this architecture can learn spatial structure from scratch,
> without a built-in spatial hierarchy, if its perception pipeline produces
> position-bearing traits and its coordination loop records which transitions lead
> where.

The Navigator walks layer 3 and mints a `Route` — waypoints, a cursor, a destination.
**That is why no imported direction is needed.**

---

## Correspondence with Neural Rendering

μ-GIL's predict–compare–update loop has an independent parallel in Blumberg's
biological vision theory:

| Blumberg | μ-GIL |
|---|---|
| `ŷ = F(s_world, s_body, a)` — forward model | the `TransitionScheme` row: action + context → predicted moved/vanished/appeared |
| `δ = encode(y) − ŷ` — structured residual | the Expected-vs-Observed activation disagreement at each scheme |
| `s_t+1 = G(s_t, δ, a)` — the gate | the Correlator / Regulator / Terminator chain: reinforce, or overwrite at the point of surprise |

The controllable-colour whitelist — which separates the agent's piece from HUD churn —
is μ-GIL's functional counterpart to separating **body state** from **world state**.

**NAPOT** describes a *receive → transform → re-express* cycle. In 2.0 this is the
decision layer itself: proposals converge as Pulses on a candidate monad, the
Deliberator integrates, the selection is re-expressed as an `ATTEMPT`. With
`EnabledSince`/`EnabledUntil` windows, `impede` as the inhibitory contribution, and
Cronos as the expiry, the **WHEN** that the predecessor lacked is now present.

---

## Results (the predecessor)

47 ledger entries: 1 replay, 1 scripted probe, and **45 live LS20 runs** against the
ARC-AGI-3 competition server. Each live run is up to 16 chained 8-turn sessions
(~129 actions), with the Totality saved and restored across every session boundary.

- The first **11** live runs completed zero levels.
- Run **12** was the first to complete level 1, after dream-as-prediction and the
  frontier rule landed.
- From run **14** onward the level-1 win rate stabilised **above 80%** and stayed there.
- Cost per level-1 win fell from **~640** actions to **~125**, against a theoretical
  floor of **15** (the scripted probe that already knows the route).
- **Level 2 was never completed.**

The win, from the competition's own record: a relational match closed, then the matched
piece carried to its plate over six consecutive decisions. Transform, then deliver —
assembled from general parts. A region-equality predicate said *what* to make true, an
adopted anchor said *where* it mattered, a distance gradient said *which way*, and a
shift ledger said *what not to do on the way*.

**Grep the mind's code for game constants: zero.**

---

## The boundary

Level 2 is a 21-action energy budget the mind must learn from observed teleports,
against a winning route of roughly 19 actions. Five probes tested the empirical
corridor; the furthest reached the cross (the key-display rotator) but none entered the
portal before the budget expired.

The winning mechanism sat 59 walk-steps away, inside the budget, and the mind could not
see it. One-step dreams all read known-and-burned; the bounded walk found no frontier
to route to; re-verification won by default and consumed two-thirds of the level-2
action budget checking a map that was already fine.

> What is missing is not compute or budget. It is **direction** — a reason to commit to
> a forty-step excursion whose value no one-step dream and no bounded walk can see.
> Evidence-driven exploration has a horizon, and forty-five runs found exactly where it
> ends.

**The diagnosis, precisely.** The predecessor's decision procedure was *memoryless* —
every tick re-evaluated from scratch, so nothing carried a commitment forward. The
workaround was an externally supplied waypoint list with a cursor and per-leg patience:
a hand-built Agenda with one item. 2.0 makes that structure native and generates its
content internally.

---

## What 2.0 changes

| | Change | Rationale |
|---|---|---|
| **Out** | Imported waypoint routes | The one lever that moved level 2 — and the one thing the mind could not have earned. |
| **Out** | Single-function, score-ranked selection | Memoryless by construction. No commitment survives the tick that produced it. |
| **In** | Agents over a shared Agenda | Proposers, gates and settlement as concurrent mechanisms. Stigmergy, not a switch statement. |
| **In** | Activation as the decision | Convergent proposals accumulate; endorsement decays; intent persists. |
| **In** | Self-minted Routes | The Navigator BFS-walks the mind's own observed `Tandem` edges and mints a Route with waypoints and a cursor. |
| **In** | A Critic before acting | Rehearse in `Imagined`; promote to `Desired` only what satisfies the telon. |
| **In** | Failure as a first-class monad | The dyad, an impediment, an enablement hypothesis, and an agenda item to discover its cause. |
| **Fix** | Graded identity | An inverted trait index returning a score, not a threshold that collapses two places into one. |
| **Fix** | Persisted Scene and Trace | Provenance and rehearsal survive session boundaries. |

None of these is a new idea. All of them are already written in GIL. The work is
porting them into what runs.

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

**Mid-run verification, natively.** Inline judging is where research is ahead of
product. Nothing reaches `Desired` without the Critic; nothing settles without the
Correlator grading the prediction that preceded it.

**Durable state, tested to destruction.** Sessions end every eight turns by design.
Save, wipe, reload, resume — the H2 problem faced 45 times on the public record.

**A real reward signal.** A live competition API grades every action, and every
decision's basis rides to its `reasoning` field. No simulated environment, no verifier
to reward-hack.

---

## Runtime notes

μ-GIL runs on **Premise 3.3**. Constraints that shape the code:

- Every user function has a **~99-invocation budget per session**. Distributing the
  loop across ~25 agent bodies spreads that ceiling instead of concentrating it in one
  large function.
- **Rules or fallback.** Every proposer's body is a function of explicit `with`
  queries. Where the rules engine fires, wrap it in `(rule …)`; where it does not, call
  the same body from the agent's job. One implementation either way.
- **No network IO on the alpha.** World contact goes through a Python file bridge
  (`bridge.py`), which owns every protocol detail the mind must never see: HTTPS,
  cookies, JSON, and 64×64 frame flattening. If `open` / `tell` / `ask` work on the
  current build, the bridge deletes and the Psyche speaks HTTPS directly.
- **KB persistence is rolled in-language** — one plain-token file per Case under
  `./ken/`, reloaded and re-asserted at boot.

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

*A mind that earns its knowledge is slow to start — and impossible to fool about what
it does not know.*
