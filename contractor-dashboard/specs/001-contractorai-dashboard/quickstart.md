# Quickstart: ContractorAI Dashboard

## Purpose

Run and validate the ContractorAI dashboard locally with:

- summary KPI cards,
- metric detail navigation,
- drag/resize/add metric customization,
- dark futuristic styling.

## Prerequisites

- Node.js (current LTS)
- npm (or compatible package manager)

## Setup

1. Install dependencies:
   - `npm install`
2. Start local development server:
   - `npm run dev`
3. Open the app in a browser:
   - `http://localhost:3000`

## Validation Flow

1. **Dashboard overview**
   - Confirm default cards exist for total service calls, services completed this week, revenue, and
     job estimates.
   - Confirm all default cards render with time range `this week`.
   - Confirm visual style uses black foundation, neon teal emphasis, and selective yellow/orange accents.
2. **Metric detail drill-down**
   - Click each default metric card.
   - Confirm detail page opens with metric-specific information.
   - Use back navigation and confirm return to dashboard.
3. **Layout customization**
   - Drag cards to new positions.
   - Resize at least two cards.
   - Add metric cards up to a maximum of 6 visible cards.
   - Try adding a seventh card and confirm the app blocks the action with a clear message.
   - Refresh page and confirm the customized layout remains.
   - Open a second tab, save a different layout in each tab, and confirm latest save wins.
4. **Fallback states**
   - Verify dashboard and detail views show clear empty/error states when data is unavailable.
5. **Visual accessibility baseline**
   - Validate text/control contrast against the project-defined threshold on dashboard and detail pages.

## Notes for Current Phase

- No formal database is required in this phase.
- Local metric data and local layout persistence are acceptable while Supabase-backed persistence is
  deferred.
- Any authenticated user can customize the dashboard in v1.
- Keep implementation newcomer-friendly: explicit naming, simple flows, and comments on non-obvious logic.

## Validation Results (2026-03-27)

- **Build validation**: PASS (`npm run build` completes successfully).
- **Dashboard overview API**: PASS (`GET /api/metrics?timeRange=this_week` returns 4 default cards with `this_week`).
- **Metric detail API**: PASS (`GET /api/metrics/inbound-calls` returns detail payload; unknown metric returns 404 payload).
- **Layout persistence API**: PASS (`GET/POST /api/dashboard-layout` persists cards and returns latest layout).
- **Last-write-wins conflict rule**: PASS (older `revisionTs` save returns `conflict: true` and keeps newest layout).
- **6-card limit enforcement**: PASS (posting 7 visible cards returns `visible cards must be <= 6`).
- **Interactive UI checks (drag, resize, add/remove, back navigation)**: PARTIAL - implementation is present, but browser-based manual validation remains.
- **Visual accessibility contrast baseline**: PARTIAL - token/contrast styles are applied; manual visual QA still required.
