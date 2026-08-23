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
perception*. **GIL** (Generally Intelligent Learner) is its reference
instantiation. **μ-GIL** is the second — a minimal system that keeps the perception
pipeline and the Piagetian epistemology intact while replacing GIL's designed spatial
ontology, concurrent solver system, formal reasoning engine and developmental
trajectory with something empirical and streamlined.

μ-GIL exists to answer two questions:

1. Does GIL's perception pipeline hold up against a live, unforgiving testbed?
2. Which coordination and reflection mechanisms does a working spatial abstraction
   learner *actually* need?

**μ-GIL 2.0** is the next iteration: tabula rasa, no imported direction, and the
planning horizon closed by machinery the mind builds for itself.

---

## The three defining properties

**Perception is active and constructive.** Sensory input passes through detectors
into a variable-length *trait vector*, compared against stored cases. A miss
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

**Invariant — the mind:** the tuple grammar, and Perceiver · Matcher · Lexer · Storer ·
Activator · Scener · Simulator · Coordinator · Correlator. Every stage downstream of
detection operates on the trait set alone.

**Per-device — the world:** `:Channel` (which sensory domains exist at all), `:Data`
(which parsable structures arrive), `:Content` (the device's own slot vocabulary), and
`:Action` (its actuation repertoire).

### Eidos — the ARC-AGI-3 device

εἶδος, *"to see."* A 64 × 64 grid, 16 colours, 7 standardised actions, turn-based —
the world changes only when the agent acts. No instructions are given: mechanics,
goal and win condition must all be discovered. Scored by RHAE = (human actions ÷ agent
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

## GIL and μ-GIL

| Dimension | GIL | μ-GIL |
|---|---|---|
| Source | ~50 files, 20,000+ lines Premise | ~30 files, ~8,000 Premise + 1,200 Python |
| Processes | 4 concurrent, stigmergic | 1 procedural loop, single-threaded |
| Memory areas | 6, incl. Glue spatial layout | 3 — case, scheme, activation |
| Realities | 8 parallel layers | 1 — everything is Observed |
| Spatial ontology | 7 levels, designed a priori | 4 layers, learned from transitions |
| Planning | 10 solvers, 136 reasoning ops | ~15 scoring bands, BFS depth ≤ 7 |
| Forgetting | Amneator + 3 compressors | stale-cluster cull |
| Status | reference system, specified | runs live, wins level 1 reliably |

### What μ-GIL shares

The perception pipeline, implemented faithfully. Assimilation and accommodation as
the only two paths. Jaccard similarity matching at a configurable threshold.
Content-addressed reifiers — a deterministic rolling hash means identity survives
restarts by construction. The Correlator grading every consequence. An audit trace at
every pipeline stage.

### What μ-GIL replaces

Seven-level spatial hierarchy → empirical arrangement graph. Ten concurrent solvers →
single-threaded band auction. 136 reasoning operators → learned transitions only.
Eight reflection patterns → simulation alone. Four consolidation patterns → a
stale-cluster cull. Developmental gating, narration and theorizing → absent.

### What μ-GIL invents

Mechanisms GIL's specification does not anticipate, each discovered by running against
the live competition, diagnosing the failure, building the fix, and verifying it with
a unit demo before the next run:

- **Relational state layer** — clusters summarised by scale-normalised pattern tokens
  (binarize → crop → GCD-downscale → `"WxH:bits"`), so a glyph drawn at 2×2 scale
  yields the same token as the same glyph at 1×1.
- **Anchor adoption** — a mutable cluster whose alphabet contains a static cluster's
  token adopts it: *"this indicator can show what that plate shows."*
- **Chain-walk** — bounded BFS over the learned arrangement graph, propagating
  terminal value back to each candidate's first action, discounted per leg.
- **Evidence confidence** — majority-based edge recording. A single fluke cannot
  overwrite 26 consistent observations.
- **The budget gate** — learns the world's action budget from visible teleports, and
  vetoes any carry the remaining budget cannot complete.
- **Question-the-map** — when the walk proves the map has no way out, re-try the
  least-recently-settled pair: accommodation applied to the frontier ledger itself.

---

## Spatial abstraction — designed vs empirical

The deepest divergence between the two systems, and the paper's most significant
finding.

**GIL** starts with a seven-level hierarchy — Scene, Venue, Locale, Place, Area,
Region, Map — with Spots binding objects to 3-D coordinates and ten image schemas as
spatial templates. A Locater builds bottom-up, a Mapper accumulates top-down, and a
Navigator does BFS pathfinding over the graph. The structural grammar is innate;
experience fills it.

**μ-GIL** has no hierarchy, no image schemas, no Locater, no Mapper, no Navigator and
no prior spatial grammar. Four layers emerge from the pipeline and the experience
record:

1. **Regions** — two-pass connected components → colour, bbox, size, shape class.
2. **Arrangements** — a controllable-colour whitelist filters regions into a multiset
   of `"colour@x,y"` keys. *≈ GIL's Place.*
3. **Edge graph** — `PairTried` records `(arrangement, action) → destination` with a
   settle-order stamp and majority evidence. *≈ GIL's Map.*
4. **Relational state** — clusters, normalised tokens, anchor adoption.
   *≈ GIL's image schemas.*

> A system built on this architecture can learn spatial structure from scratch,
> without a built-in spatial hierarchy, if its perception pipeline produces
> position-bearing traits and its coordination loop records which transitions lead
> where.

---

## The band auction

Roughly fifteen scoring bands compete deterministically. Highest score wins; first-max
breaks ties; candidate order rotates by trial count to prevent persistent ties.

| Score | Mechanism | Meaning |
|---|---|---|
| 400+p | kace | direct progress evidence from this exact context |
| 350 | dream-progress | dreamed future is a state progress was made from |
| 340 | dream-match | dreamed action closes a relational match |
| 335–325 | chain-progress | multi-leg walk reaches a progress arrangement |
| 332 | dream-deliver | match held, dreamed future carries it closer to the plate |
| 325–315 | chain-match | multi-leg walk closes a relational match |
| 300 | reactor | globally reliable action (effects/tries ≥ 80%) |
| 250 | explorer | untried anywhere |
| 250 | hold-default | null action in an untrustable world |
| 248 | muse-directed | dreamed future approaches an imported waypoint |
| 245 | explorer | untried (arrangement, action) pair |
| 244–242 | chain-carry | multi-leg walk with the match held throughout |
| 240−f | dream-novel | dreamed future never seen (f = curiosity fatigue) |
| 150 | residue | causes effects here, no known progress |
| 120 | extrapolated | untried pair the fallback model predicts is a no-op |
| 108–104 | chain-frontier | multi-leg walk reaches untried pairs |
| 105 | question-map | the map has no way out; re-try the stalest edge |
| 100 | dream-known | dreamed future is a known dead-end |
| 10 | dead | tried here, does nothing |
| 5 | inhibited | model predicts this action does nothing here |

The hierarchy was not designed top-down. Each band was the fix for a diagnosed live
failure.

---

## Correspondence with Neural Rendering

μ-GIL's predict–compare–update loop has an independent parallel in Blumberg's
biological vision theory:

| Blumberg | μ-GIL |
|---|---|
| `ŷ = F(s_world, s_body, a)` — forward model | the `TransitionScheme` row: action + context → predicted moved/vanished/appeared |
| `δ = encode(y) − ŷ` — structured residual | the Correlator's symmetric difference over predicted and observed arrangement keys |
| `s_t+1 = G(s_t, δ, a)` — the gate | the Correlator / Regulator / Terminator chain: reinforce, or overwrite at the point of surprise |

The controllable-colour whitelist — which separates the agent's piece from HUD churn —
is μ-GIL's functional counterpart to separating **body state** from **world state**.

**NAPOT** (Neural Array Projection Oscillation Tomography) describes a
*receive → transform → re-express* cycle. μ-GIL has this topology in three places: the
Matcher's Jaccard scan (traits converge at each Case, overlap integrates, the 85%
threshold is the quorum gate), the band auction (winner-take-all), and the chain-walk
(value propagating back through a learned graph).

The **WHAT** and **WHERE** are present. The **WHEN** is missing — μ-GIL's Activator is
a binary mark of relevance, with none of GIL's temporal windows, quorums or spreading.

---

## Results

47 ledger entries: 1 replay, 1 scripted probe, and **45 live LS20 runs** against the
ARC-AGI-3 competition server. Each live run is up to 16 chained 8-turn sessions
(~129 actions), with the Totality saved and restored across every session boundary.

- The first **11** live runs completed zero levels.
- Run **12** was the first to complete level 1, after dream-as-prediction and the
  frontier-pair exploration rule landed.
- From run **14** onward the level-1 win rate stabilised **above 80%** and stayed there.
- Cost per level-1 win fell from **~640** actions to **~125**, against a theoretical
  floor of **15** (the scripted probe that already knows the route).
- **Level 2 was never completed.**

The win, verbatim from the competition's own record:

```
ACTION1   dream-match     340     lock display == door
ACTION4   dream-deliver   332  ┐
ACTION4   dream-deliver   332  │
ACTION4   dream-deliver   332  ├  carry the matched piece to the plate
ACTION1   dream-deliver   332  │
ACTION1   dream-deliver   332  ┘
→ levels = 1
```

Transform, then deliver — assembled from general parts. A region-equality predicate
said *what* to make true, an adopted anchor said *where* it mattered, a distance
gradient said *which way*, and a shift ledger said *what not to do on the way*.

**Grep the mind's code for game constants: zero.**

---

## The boundary

Level 2 is a 21-action energy budget the mind must learn from observed teleports,
against a winning route of roughly 19 actions. Five muse probes tested the empirical
corridor; the furthest reached the cross (the key-display rotator) but none entered
the portal before the budget expired.

The winning mechanism sat 59 walk-steps away, inside the budget, and the mind could
not see it. One-step dreams all read known-and-burned; the chain-walk found no
frontier to route to; question-the-map won by default and consumed two-thirds of the
level-2 action budget re-verifying a map that was already fine.

> What is missing is not compute or budget. It is **direction** — a reason to commit
> to a forty-step excursion whose value no one-step dream and no bounded walk can see.
> Evidence-driven exploration has a horizon, and forty-five runs found exactly where
> it ends.

The mind cannot yet tell an untrustworthy map from a frontier that is out of reach:
same signature, opposite causes.

---

## μ-GIL 2.0 — what changes

| | Change | Rationale |
|---|---|---|
| **Out** | The muse channel | Waypoint routes written from outside. It moved the piece further than anything else — and it is the one thing the mind could not have earned. |
| **In** | Self-minted Routes | GIL's Router and Navigator already specify it: BFS over the mind's own observed edges, producing a Route with waypoints, a cursor and a destination. |
| **In** | A Critic before acting | Rehearse the imagined outcome against the objective; promote only what survives. A doomed carry is vetoed before a budget gate has to catch it. |
| **In** | Failure as a first-class monad | *"That did not work"* becomes an impediment, an enablement hypothesis, and an agenda item to discover what causes it. |
| **Fix** | Graded identity, temporal activation | An inverted trait index returning a score, not a threshold that collapses two places into one — and the WHEN the NAPOT correspondence is missing. |

None of these is a new idea. All five are already written in GIL. The work is porting
them into what runs.

---

## Long-horizon agents

A long-horizon task is defined by its **structure**, not its clock time: a goal whose
solution requires composing many tightly coupled, interdependent decisions into one
coherent trajectory, with feedback and revision along the way.

- **H1, intra-context** — many coupled steps in one window; reasoning that verifies
  and recovers before the chain derails.
- **H2, cross-context** — the task outgrows the window; state compressed,
  externalised, checkpointed, faithfully resumed.
- **H3, cross-task** — an open-ended stream with shifting goals; reusable skills that
  accumulate.

μ-GIL is an H3 system by construction, and contributes three things to that
conversation:

**Mid-run verification, natively.** Inline judging is where research is ahead of
product. μ-GIL cannot act without first dreaming the outcome and settling it
confirmed or surprised.

**Durable state, tested to destruction.** Sessions end every eight turns by design.
Save, wipe, reload, resume — the H2 problem faced 45 times on the public record.

**A real reward signal.** A live competition API grades every action, and every
decision's basis rides to its `reasoning` field. No simulated environment, no verifier
to reward-hack.

---

## Runtime notes

μ-GIL runs on **Premise 3.3.alpha**, a pre-release runtime. Consequences worth knowing
before reading the source:

- Every user function has a **~99-invocation budget per session**, so all hot paths
  are inlined into single functions — the frame parser, the grid detector, the
  cluster-pass, the chain-walk and `dream-transition` are each one call per frame.
- **No network IO.** All world contact goes through a Python file bridge
  (`bridge.py`), which owns every protocol detail the mind must never see: HTTPS,
  cookies, JSON, and 64×64 frame flattening.
- **No rules engine and no agents** on this build, so every mechanism is an explicit
  function driven by a procedural loop rather than a stigmergic agent.
- **KB persistence is rolled in-language** — one plain-token file per Case under
  `./ken/`, reloaded and re-asserted at boot.

An 8-turn session exhausts the budget and saves the Totality; `play.py` chains
sessions.

---

## Repository map

| Path | Role |
|---|---|
| `boot.theory` | groks everything in dependency order; hosts the `demo-*` suite |
| `gil.daicho` | configuration — mechanism URLs, KB provider, activation dynamics |
| `totality/totality.theory` | memory: relations, `trait-signature`, `reify`, save/load |
| `mechanisms/*.theory` | detectors, matcher, lexer, storer, activator, scener, perceiver, deliberator, simulator, coordinator, grids |
| `psyche/grid-psyche.theory` | the Eidos world interface (file protocol) |
| `psyche/camera-psyche.theory` | the camera / Expanse world interface |
| `imagine/imagine.theory` | Canvas · Taxis · Dream and the manipulation verbs |
| `portal/render.theory` | perception, deliberation and dream audit windows |
| `bridge.py` · `play.py` · `premrun.py` | world-side bridge, session orchestrator, pty driver |
| `analysis/*.py` | replicas — validate each mechanism over archived frames before writing Premise |
| `replays/ledger.txt` | one greppable line per run: verdict, actions, levels, archive |

### Running the demos

```
(grok "./boot.theory")
(demo-camera)      ; perceive a scene twice: NEW, then RECALLED
(demo-grid)        ; token frames → percepts → delta → action file
(demo-similar)     ; Jaccard assimilation at threshold
(demo-coordinate)  ; play a toy level unattended — explore, learn, exploit, win
(demo-predict)     ; dreams replace actions; a betrayed prediction self-corrects
(demo-match)       ; relational state-match across render scales
(demo-chain)       ; multi-leg dream chains; pocket escape and match carry
(demo-persist)     ; memory survives a wipe and restart
```

Run demos **one per eval** — chaining two trips the invocation budget.

---

## Method

**Replica-first.** Every mechanism was validated by a Python replica over archived
frames *before* any Premise was written. It paid for itself every time: question-the-map's
replica found the exact stale edge and Monte-Carlo'd the repair before a line of code;
shift-generalization was *refuted* by its replica and zero Premise was written.

**Demo-proven or it doesn't count.** Every phase lands with a runnable `demo-*` that
proves its Done condition.

**No game-specific constants in the mind.** Hand-decoding a public game is legitimate
spec-writing; only general mechanisms may land in Premise. The checkable standard is
a grep.

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
