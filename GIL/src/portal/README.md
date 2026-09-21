# src/portal — the audit surface

Two renderers over the same Totality.

| File | Role |
|---|---|
| `render.theory` | in-language HTML windows — perception, deliberation, space. Written by the mind itself at the end of a session. |
| `gil_dashboard.tsx` | the interactive portal — ten views, web and desktop from one source. |

## Building

```
npm install
npm run dev          # web, http://localhost:5173
npm run build        # bundle -> ../../etc/log/portal
npm run preview      # serve the built bundle
npm run desktop      # desktop window, live reload
npm run desktop:build  # packaged desktop app
```

The build lands in **`etc/log/portal/`**, beside the HTML windows
`render.theory` writes, so one folder holds the whole audit surface. Asset
paths are relative, so `etc/log/portal/index.html` opens from the file
system without a server. Tauri loads that same directory for the desktop
target — one codebase, two targets, no divergence.

## The feed

The dashboard currently runs on **mock data** held in constants at the top
of `gil_dashboard.tsx` — a simulated LS20 session, with the level-2 board
extracted from Figure 3 of the GIL paper. Every view reads only from
those constants, so wiring the live feed is a matter of replacing them, not
of touching the views.

Two feeds are planned, in order:

1. **File** — `render.theory` emits `etc/log/portal-*.json` alongside its
   HTML and the app polls. No C# needed.
2. **Socket** — `pkg/gil-ui` hosts a WebSocket over the six Totality
   areas and pushes snapshots, then deltas.

## The views

Psyches · Percepts · Association · Cases · Ontology · Activation ·
Imagination · Agenda · Attempts · About · Settings

Every panel renders the rows the mind acted on: raw premises with their
slot names, monad reifiers as identity, moments in `\@m{…}` form.

---

Copyright &copy; 2013-2026 SubThought Corporation. All Rights Reserved.
