// *************************************************************************************
//
//  Copyright(c) 2013-2026 SubThought Corporation. All Rights Reserved.
//
// *************************************************************************************
//
//  vite.config.ts — the portal build.
//
//  Root is src/portal; the bundle lands in etc/log/portal, beside the
//  HTML windows render.theory writes.  base "./" keeps every asset path
//  relative, so the build opens from the file system as readily as from
//  a server — and Tauri loads the same directory for the desktop target.
//
// *************************************************************************************

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../../etc/log/portal",   // 2.0/gil/etc/log/portal
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,

    // ── the dev server does not know these routes ──────────────
    //
    // /attempt, /portal-*.json and /frames/ are served by
    // gil_serve.py, not by Vite.  Without a proxy, Vite answers
    // them with index.html — so a POST comes back as "<!DOCTYPE"
    // where JSON was expected, and every feed silently falls back to
    // its mock because the parse throws.
    //
    // Both failures look like the portal being broken when it is
    // simply asking the wrong process.
    proxy: {
      "/attempt": "http://127.0.0.1:4390",
      "/frames":  "http://127.0.0.1:4390",
      "^/portal-.*\\.json$": {
        target: "http://127.0.0.1:4390",
        changeOrigin: false,
      },
    },
  },
});
