// *************************************************************************************
//
//  Copyright(c) 2013-2026 SubThought Corporation. All Rights Reserved.
//
// *************************************************************************************
//
//  main.tsx — the portal entry point.  Mounts the dashboard; the feed
//  arrives later, at which point the mock constants in the dashboard are
//  replaced by rows pushed from the mind.
//
// *************************************************************************************

import React from "react";
import { createRoot } from "react-dom/client";
import GilPortal from "./gil_dashboard";

const el = document.getElementById("root");
if (!el) throw new Error("portal: no #root to mount on");

createRoot(el).render(
  <React.StrictMode>
    <GilPortal />
  </React.StrictMode>
);
