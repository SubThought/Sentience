# GIL — A Generally Intelligent Learner

**SubThought Corporation**

Michael S. P. Miller

---

GIL is a **cognitive system** that instantiates the **Piagetian Modeler**
cognitive architecture.

The distinction matters and it is not pedantry. **An architecture is a
blueprint** — a theory of what a mind is made of and how its parts relate. **A
system is the physical implementation** — a thing that runs, holds a knowledge
base, occupies ports, and can be pointed at a world.

So: the Piagetian Modeler says what a mind *is*. GIL is one that *exists*. Other
systems could instantiate the same architecture; each would be a distinct mind
with its own Totality.

What GIL does: perceives a world, builds a model of it, forms goals, acts, and
learns from what happened — continuously, and without being trained on the
answer beforehand.

It is not a language model with tools attached. It is a mind: a running
population of mechanisms operating over a shared knowledge base, written in
**Premise**, a language built for representing thought.

---

## 0. The architecture it instantiates

The **Piagetian Modeler** takes its name from Jean Piaget, whose account of
intelligence is the one this architecture implements rather than merely cites.

Piaget's claim is that knowledge is not received but **constructed** — by a
subject acting on a world and accommodating when the world answers unexpectedly.
A **scheme** is what is repeatable and generalizable in an action. It is
consolidated by repetition, coordinated with other schemes by exercise, and
generalised by being applied to new situations. Intelligence is the moving
equilibrium between **assimilation** — taking the world into what you already
know — and **accommodation** — changing what you know because the world would
not fit.

Every mechanism in GIL is named against that theory. The Assimilator and the
Accommodator sit at the head of perception. The reasoning operators include the
INRC group of concrete operations. The Automator performs reciprocal
assimilation. Exploration is the circular reaction. Play and imitation are the
two poles — assimilation-dominant and accommodation-dominant — and the mind runs
both.

The architecture is a blueprint. This document describes the system built to it.

---

## 1. What a GIL mind is

A GIL mind has five components, each a set of independent mechanisms that fire
on what they find rather than on being called.

| Component | What it does |
|---|---|
| **Totality** | The knowledge base. Everything the mind holds — percepts, schemes, cases, beliefs, activations — lives here. |
| **Observation** | Perceiving. Detectors, the Matcher, the Storer, the Activator. Turns what arrives into what is known. |
| **Coordination** | Wanting and acting. Urges, agendas, deliberation, solving, the Executor. |
| **Reflection** | Thinking about itself. Simulation, exploration, imitation, play, monitoring. |
| **Consolidation** | Keeping house. Compression, automaticity, forgetting, skill formation. |

**Nothing calls anything.** The mechanisms are **stigmergic** — each fires when
its conditions are met and leaves its result in the Totality, where the next one
finds it. A percept becomes a Scene; the Scene becomes a staged arrangement; the
arrangement evokes a memory; the memory poses a prediction. No dispatcher, no
pipeline, no orchestration. The coordination is the shared structure.

This is how brains work and it is why the architecture scales: adding a
mechanism does not mean editing a controller.

---

## 2. The monad

Everything the mind knows has an identity — a **monad**, a 128-bit signed
integer minted by the `reifier`. A monad is not a pointer. It is what the mind
*refers to*, and it is the same identity whether the thing is being perceived,
remembered, imagined, or reasoned about.

Its negative is its **dyad**: `(- monad)`. The proposition and its negation are
two identities, each with its own belief and its own activations — so a mind can
be uncertain about both (honest ignorance) or confident of one (knowledge), and
tell the two apart.

Things too numerous to reason about — a mesh's vertices, a cloud's blobs — carry
a **glyph** instead, or no mark at all. The rule is simple: does anything
outside this thing's parent need to refer to it?

---

## 3. Perception and imagination

A GIL mind keeps two parallel families, joined but never mixed:

| Perceptual — 2D, seen | Imaginative — 3D, staged |
|---|---|
| **Figure** — a region in a frame | **Figment** — meshes and clouds |
| **Spot** — where the detector found it | **Ambit** — where the mind put it |
| **Scene** — one arrangement, witnessed | **Taxis** — one arrangement, staged |
| **Clip** — the scenes of one visit | **Animation** — a sequence of shots |
| **Venue** — where an activity occurs | **Canvas** — the stage surface |
| **Video** — the clips | **Dream** — the animations |

Perception is flat. Imagination is solid. **Staging** is the only mechanism that
crosses, and the only one that *infers*: it reads a Scene of Figures and builds
a Taxis of Figments — a solid proposed for a picture.

Three schemes join the families, all minted by staging:

- **Embodies** — this solid is my reading of that region
- **Evokes** — this sight called up that arrangement
- **Depicts** — this canvas is my model of that place

And the mind can **look at what it imagined**: the Projector renders a staged
arrangement and hands the image back to its own perceiver, which detects and
recognises it exactly as it would a frame from the world. That is hypothesis
testing without acting — and it is how a dreamt form becomes one the mind can
recognise in the world.

---

## 4. Space

A GIL mind builds a **spatial ladder** as it wanders:

```
Scene → Venue → Locale → Place → Area → Region → Map
```

**Chunking is discovery, not splitting.** Wander; accumulate ungrouped things at
every rung; when five to nine of them belong together, make the chunk in one act
and close it. Nothing accretes, nothing splits, nothing merges. The depth is not
decided — it is whatever wandering long enough yields. A mind that never leaves
one building forms no Region, because it never has five Areas to chunk.

A **Venue** is where an activity occurs, and holds about sixteen Scenes — a
panorama, `360° ÷ FOV` at the device's overlap. A **Locale** is identified by a
**landmark**: a Figment that does not move across its venues, and therefore a
fixed point everything else can be measured against.

Directions are **egocentric** — forward, left, back — because that is all a body
can report. The mind finds itself by *recognition* rather than dead reckoning,
which is what discards accumulated drift. Allocentric layout is **derived**:
egocentric edges composed around a loop that closes, with landmarks as the
anchors.

---

## 5. Belief, hypothesis, skill

**One Belief per scheme, per viewpoint.** Viewpoint 1 is General Awareness — the
learner's own. Every other viewpoint models what another entity believes about
the same monad, which is how a GIL mind holds a **false belief**: two Beliefs,
one monad, two viewpoints, and the expectation that the other party will act on
theirs.

A Belief carries a **`:Certainty`** (a degree, which drifts) and a
**`:Finding`** (a decision a mechanism took, which does not). A hypothesis at
0.4 that has been disconfirmed is a different state from one at 0.4 nobody has
settled.

Three claim shapes, each meaning something different:

- **`Causes`** — physical. Pushing the door opens it. Established by the world.
- **`Implies`** — logical. Holds by structure, not by observation.
- **`Hypothesis`** — a guess, carrying its own `:Examples` and `:Counters`.

A **Skill** is a way to activate relevant actions and reasons for a new or
recurring problem, *so that less search is done and more recognition*. It gathers
reliable actions by the similarity of the goal sets they serve, within one
abstraction band and consistent modalities — and it must **differentiate** as it
grows, because activation dispersing to hundreds of actions is not priming, it is
flooding.

---

## 6. The Psyche — how a mind meets a world

A GIL mind has no senses of its own. It has a **Psyche**: a device that mediates
two flows — **percepts** inward from a world, **actuations** outward to it.

Every percept has the same shape whatever the world:

```lisp
[PERCEPT :Modality  <which Psyche>
         :Channel   <domain within it>
         :Address   <where it came from>
         :Data      <what structure this is>
         :Content   {:Slot value …}
         :Moment    \@m{…}
         :Token     <the world's credential>]
```

And every act:

```lisp
[ATTEMPT :Action <verb> :Parameters {…} :Token <tok>]
[RESULT  :Action <verb> :Status <s> :Reason <r> :Trial <n>]
```

**Four tuple types — PERCEPT, ATTEMPT, RESULT, URGE — and one door.** A Psyche
registers with the mind's Registrar and is granted a token; from then on, that
token is on every tuple it sends. The mind learns what it said by *perceiving*
its own results.

Which means **the architecture does not change when the world does.** The same
Perceiver that handles a camera frame handles a Slack message, a stock tick, or
a torque reading — because all of them arrive as percepts with a modality, a
channel, and an idiom.

---

## 7. The possible worlds

A world is anything that can be perceived and acted upon. Each has a Psyche.

### Eidos — the grid

The ARC-AGI-3 interactive reasoning benchmark: a 64×64 grid, 16 colours, 7
actions, **no instructions**. The mind must discover the mechanics, infer the
goal, and solve efficiently — scored by Relative Human Action Efficiency,
`(human_actions ÷ ai_actions)²`.

Turn-based and adversarially plain. The purest test of *learning without being
told*, and the one where a mind that memorised cannot hide.

### Expanse — physical reality

Earth, the oceans, inner and outer space. One interface across Figure, Optimus,
NAO, Unitree G2 and others, with channels for Visual, Auditory, Haptic,
Proprioceptive, Spatial and Communication.

Real bodies, real latency, real consequences — and **odometry as a sense**:
angle and velocity arrive as their own percepts, because you know you turned with
your eyes shut.

### Aether — the internet

Web services, file systems, shell processes, messaging, browser automation,
knowledge stores, external APIs. An open-ended, layered environment rather than a
bounded simulation, unifying the action surfaces of OmegaClaw (ASI Alliance /
OpenCog Hyperon) and OpenClaw.

### Kojin — one human being

個人, *the individual*. The interface between a mind and a **single person** as
world: what they say, what they write, what they share, what they want, what they
can do, what surrounds them — and who they are beneath the surface.

The Kojin maintains a two-register Jungian model. The **ego** is the person as
they know and present themselves. The **shadow** is the person as they do not
yet know themselves: avoided topics, projections, gaps between stated and
revealed preference.

Three invariants govern it: **evidence or nothing**; **confidence decays**; and
**the shadow is offered, never imposed** — it shapes the mind's questions, not
its assertions.

### Shudan — one organization

集団, *the group*. The same architecture turned toward a collective — a company,
a team, an institution — treated as a subject with its own preferences,
strengths, weaknesses, ego and shadow.

Where the Kojin's unit is the utterance, the Shudan's is **the meeting and the
thread**. Where the Kojin's journal is a diary, the Shudan's is **the
retrospective**. Where the Kojin infers a shadow from one person's avoidances,
the Shudan infers it from **what an entire organization systematically cannot
discuss**.

Channels: Discourse, Record, Structure, Preference, Capability, Environment,
Depth, System.

### Gotham — the open world

Grand Theft Auto IV's Liberty City: a persistent, populated, physically
simulated open world with traffic, pedestrians, weather, day and night, and no
episode boundary.

Where Eidos is bounded and turn-based, Gotham runs whether or not the mind acts.
It is the bridge between the grid and the Expanse — real-world spatial scale and
real-world social density, at simulation cost and simulation safety.

---

## 8. Unity Mind — one mind, many bodies

A GIL mind and its Psyche are separate processes joined by tuples over a
network. Nothing requires them to be one-to-one.

**One mind can hold several Psyches at once** — an Expanse body in a warehouse,
a Shudan attached to the company that owns it, an Aether reading the market. All
percepts land in **one Totality**. Everything learned in one world is available
in every other, because a monad is a monad wherever it was minted.

That is **Unity Mind**: not a fleet of agents coordinating, but *one subject with
several bodies*. The robot that learns a shelf layout and the organization model
that knows why the shelf matters are the same mind, and neither has to tell the
other.

The Psyche's registration protocol is what makes it possible. Each body
announces itself, is granted a token, and declares what it can sense and do. The
mind's Registrar mints an Action scheme for each capability offered, with an
**empty result** — the frontier — and exploration fills it in.

---

## 9. Auditability

A GIL mind is **inspectable by construction**. Every conclusion it reaches is a
row: the percept that arrived, the case it matched, the score it matched at, the
scheme it minted, the belief it holds, the attempt it made, the result that came
back.

The **Curator** — the dashboard's own process — records what the *observer* did,
separately from what the mind did. Without that record, an archive cannot
distinguish an attempt the mind decided from one a person typed. A campaign whose
evidence cannot be told apart from its operator's interference proves nothing.

---

## 10. Why it matters for enterprises

An enterprise already has data systems, dashboards, and models. What it does not
have is a **subject** — something that perceives the organization continuously,
builds a model of it, notices what the organization cannot say about itself, and
acts.

A GIL mind with a Shudan Psyche:

- **Learns** the organization's real preferences — not the stated ones, the
  revealed ones, from budgets, calendars, promotions, and what actually ships
- **Models** its ego and its shadow, so guidance addresses how the organization
  behaves rather than how its mission statement says it does
- **Guides** toward opportunities scored against actual capability, and away
  from threats it is inflicting on itself
- **Journals** with it — facilitated retrospectives, prompts about what was
  avoided
- **Remembers** across years, because its knowledge base is durable and every
  inference carries its evidence

And because the Piagetian Modeler is world-agnostic, the same mind can extend
into the warehouse, into the market, and into the individual careers of the
people in it — one subject, many bodies, one memory.

---

## 11. The language

GIL is written in **Premise**: a language whose primitives are the things minds
are made of — relations, schemes, agents, rules, activations, moments, beats.
Not a general-purpose language with a knowledge library bolted on.

```lisp
(rule Recognise-Skill
  memo "An active objective probes the skills; the fit primes its actions."
  domain Deliberation
  salience 9600
  with [Competency :Name deliberating :Enabled yes]
       [Agenda ^ as ?agendum :Telon as ?telon]
       [Activation :M = ?telon :Reality = Desired :Pulses > 0]
  do
    (var ?fit (skill-serving ?telon))
    (unless (null-p ?fit)
      (enable :reifiers {?fit} :moment (moment) :reality Desired)))
```

---

## Reading and resources

**Latest Interview** — https://www.youtube.com/watch?v=MVEz9QSOZjM

**Building Sentient Beings** — https://zenodo.org/records/15522356

**Building Minds with Patterns** — https://a.co/d/eqYOLBX

**Coding Artificial Minds** — https://bit.ly/4gZs6bn (hardcover) ·
https://bit.ly/3UZswXF (paperback)

**Premise Language** — https://github.com/subthought/premise/releases

**Cognitive Architectures Channel** — https://youtube.com/@CognitiveArchitectures

---

## Contact

**Michael S. P. Miller**
SubThought Corporation

+1 310 925 5160
subthought@hotmail.com

---

Copyright &copy; 2013-2026 SubThought Corporation. All Rights Reserved.
