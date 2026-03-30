# Tasks: ContractorAI Dashboard

**Input**: Design documents from `/specs/001-contractorai-dashboard/` plus **Executive Dashboard** reference layout (sidebar, header, top metric row with optional empty slot, map + secondary metrics).  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/dashboard-api.yaml`, `quickstart.md`

**Tests**: No explicit TDD/testing mandate in the feature spec, so test tasks are not required in this list.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable task (different files, no direct dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project skeleton and baseline styling/config

- [x] T001 Initialize Next.js + Tailwind project scaffolding in `package.json`
- [x] T002 Create base app shell and global styles in `app/layout.tsx` and `app/globals.css`
- [x] T003 [P] Define theme color tokens (black, neon teal, accent orange/yellow) in `tailwind.config.ts`
- [x] T004 [P] Add starter metric seed dataset and shared types in `lib/dashboard-data.ts`
- [x] T005 [P] Add basic lint/type scripts and project scripts in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API and shared UI primitives needed by all stories

**⚠️ CRITICAL**: Complete before story implementation

- [x] T006 Implement summary metrics API with default `this_week` handling in `app/api/metrics/route.ts`
- [x] T007 [P] Implement metric detail API endpoint contract in `app/api/metrics/[metricId]/route.ts`
- [x] T008 [P] Implement layout read/write API with `revisionTs` last-write-wins behavior in `app/api/dashboard-layout/route.ts`
- [x] T009 Create reusable metric card component with contrast-safe defaults in `components/metric-card.tsx`
- [x] T010 Create dashboard grid container with layout bounds (max 6 visible cards) in `components/dashboard-grid.tsx`
- [x] T011 Add add-metric control panel with card-cap guardrail message in `components/add-metric-panel.tsx`

**Checkpoint**: Shared data contracts and UI primitives are ready for independent story delivery.

---

## Phase 3: User Story 1 - View Business Performance Snapshot (Priority: P1) 🎯 MVP

**Goal**: Authenticated user sees core high-level metrics immediately on dashboard.

**Independent Test**: Open dashboard and verify four core metrics render using `this week` defaults with contrast-compliant styling.

### Implementation for User Story 1

- [x] T012 [US1] Build dashboard page composition using grid and metric cards in `app/page.tsx`
- [x] T013 [US1] Wire dashboard page to fetch and render summary metrics from API in `app/page.tsx`
- [x] T014 [US1] Apply high-contrast futuristic visual system to summary cards in `app/globals.css`
- [x] T015 [US1] Implement empty/fallback state for missing summary metric values in `app/page.tsx`
- [x] T016 [US1] Add intent-focused comments for non-obvious metric formatting and defaults in `app/page.tsx`

**Checkpoint**: Dashboard overview is functional and independently demonstrable.

---

## Phase 4: User Story 2 - Drill Into Metric Details (Priority: P2)

**Goal**: User can click any metric to open a detail page and return to dashboard.

**Independent Test**: Click each metric card, confirm detail data appears, and navigate back to dashboard successfully.

### Implementation for User Story 2

- [x] T017 [US2] Add metric-card click navigation to detail routes in `components/metric-card.tsx`
- [x] T018 [US2] Implement metric detail page route and data fetch in `app/metric/[metricId]/page.tsx`
- [x] T019 [US2] Implement detail-page fallback and invalid-metric handling in `app/metric/[metricId]/page.tsx`
- [x] T020 [US2] Add clear back-to-dashboard action in `app/metric/[metricId]/page.tsx`
- [x] T021 [US2] Add intent-focused comments for detail-state transitions (`loading`, `empty`, `error`) in `app/metric/[metricId]/page.tsx`

**Checkpoint**: Summary-to-detail drill-down flow is complete and independently testable.

---

## Phase 5: User Story 3 - Customize Dashboard Layout (Priority: P3)

**Goal**: User can move/resize cards, add cards up to six visible, and persist layout.

**Independent Test**: Reorder and resize cards, add cards up to six, block seventh card, refresh to verify persistence, and verify latest save wins across tabs.

### Implementation for User Story 3

- [x] T022 [US3] Implement drag/reorder interactions with bounded layout behavior in `components/dashboard-grid.tsx`
- [x] T023 [US3] Implement resize interactions with min/max card dimensions in `components/dashboard-grid.tsx`
- [x] T024 [US3] Implement add-metric flow with 6-card cap enforcement in `components/add-metric-panel.tsx`
- [x] T025 [US3] Persist and rehydrate layout preferences via layout API in `app/page.tsx`
- [x] T026 [US3] Implement last-write-wins update strategy using `revisionTs` in `app/api/dashboard-layout/route.ts`
- [x] T027 [US3] Add user-facing conflict/update feedback copy for saved layout state in `app/page.tsx`
- [x] T028 [US3] Add intent-focused comments for collision resolution and save conflict behavior in `components/dashboard-grid.tsx`

**Checkpoint**: Customizable dashboard behavior is complete and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, readability, and final verification across stories

- [x] T029 [P] Normalize naming and simplify control flow for newcomer readability in `app/page.tsx`
- [x] T030 [P] Normalize naming and simplify control flow for newcomer readability in `app/metric/[metricId]/page.tsx`
- [x] T031 [P] Run visual contrast pass and adjust token usage in `app/globals.css`
- [x] T032 Validate all quickstart acceptance flows and document outcomes in `specs/001-contractorai-dashboard/quickstart.md`
- [x] T033 Verify all new file additions are justified against single-file bias in `specs/001-contractorai-dashboard/plan.md`

---

## Phase 7: Executive Dashboard Layout & Metric Set (Reference Mockup)

**Goal**: Match the **Executive Dashboard** structure (left nav, top bar with time range + region + search, primary metric row with fifth empty slot, map section, right-stack secondary metrics) and rename core metrics to **Inbound Calls**, **Revenue**, **Pending Estimates**, **Service Jobs** with mockup-aligned seed values and week-over-week trend labels.

**Independent Test**: Load `/` and confirm four renamed metrics, optional fifth empty slot when fewer than five cards are visible, header controls render, bottom map placeholder and three secondary tiles (Jobs Completed Today, Avg Job Value, Conversion Rate) appear; `GET /api/metrics/inbound-calls` returns detail data.

### Implementation for Phase 7

- [x] T034 [P] Replace `defaultDashboardMetrics` with executive metric ids (`inbound-calls`, `revenue`, `pending-estimates`, `service-jobs`) and labels/values/trends in `lib/dashboard-data.ts`
- [x] T035 [P] Add `ExecutiveSecondaryMetric`, `executiveSecondaryMetrics`, and document v1 static seed purpose in `lib/dashboard-data.ts`
- [x] T036 Rebuild `metricDetails` entries and weekly history for all four core metric ids in `lib/dashboard-data.ts`
- [x] T037 Render trend delta row (↑/↓ with signed %) on each metric card when `trendDelta` / `trendDirection` are set in `components/metric-card.tsx`
- [x] T038 Use per-instance SVG gradient ids to avoid duplicate `id` attributes across cards in `components/metric-card.tsx`
- [x] T039 Add `"use client"` to `components/metric-card.tsx` where hooks are required
- [x] T040 Implement executive shell: sidebar nav, light header strip, timeframe pill group, region `<select>`, search control, and main content region in `app/page.tsx`
- [x] T041 Add bottom layout: “Recent Jobs by Region” map placeholder and stacked secondary metric cards in `app/page.tsx`
- [x] T042 Use `xl:grid-cols-5` and optional trailing empty slot when `visibleCards.length < 5` in `components/dashboard-grid.tsx`
- [x] T043 Add `"use client"` to `components/dashboard-grid.tsx` for explicit client boundary with interactive controls
- [x] T044 [P] Update metric detail API example path in `specs/001-contractorai-dashboard/quickstart.md`

**Checkpoint**: Executive layout and renamed metrics are visible end-to-end; drill-down works for new `metricId` values.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1, blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2, delivers MVP
- **Phase 4 (US2)**: Depends on Phase 2 and uses US1 UI primitives
- **Phase 5 (US3)**: Depends on Phase 2 and integrates with US1 dashboard rendering
- **Phase 6 (Polish)**: Depends on completed selected stories
- **Phase 7 (Executive layout)**: Depends on US1–US3 building blocks; updates data, shell, and grid without breaking APIs

### User Story Dependencies

- **US1 (P1)**: No story dependency, first MVP slice
- **US2 (P2)**: Uses summary card interactions delivered in US1
- **US3 (P3)**: Builds on US1 dashboard rendering and foundational layout API

### Parallel Opportunities

- Setup parallel tasks: `T003`, `T004`, `T005`
- Foundational parallel tasks: `T007`, `T008`
- Polish parallel tasks: `T029`, `T030`, `T031`
- Phase 7 parallel tasks: `T034`, `T035`, `T044`

---

## Parallel Example: Phase 7

```bash
Task: "T034 Replace defaultDashboardMetrics in lib/dashboard-data.ts"
Task: "T035 Add executiveSecondaryMetrics in lib/dashboard-data.ts"
Task: "T044 Update quickstart.md metric detail example"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate dashboard overview behavior from quickstart
4. Demo MVP before proceeding

### Incremental Delivery

1. Deliver US1 (overview metrics)
2. Deliver US2 (detail drill-down)
3. Deliver US3 (customization + persistence)
4. Run polish and full quickstart validation
5. Apply Phase 7 executive layout refresh when stakeholder mockup is approved

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Phase 7 keeps bar charts (existing implementation); the reference image used area sparklines—swap chart type only if spec is updated

---

## Report (generated 2026-03-27)

| Item                          | Value                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Generated file**            | `specs/001-contractorai-dashboard/tasks.md`                                             |
| **Total tasks**               | 44 (`T001`–`T044`)                                                                      |
| **Open tasks**                | None                                                                                    |
| **Phase 7 tasks**             | 11 (`T034`–`T044`) — all complete                                                       |
| **Checklist format**          | All rows use `- [ ]` / `- [x]` + `Tnnn` + optional `[P]` + optional `[USn]` + file path |
| **Suggested MVP scope**       | Phases 1–3 (through US1), then Phase 2 foundational must precede US1                    |
| **Independent test criteria** | See **Independent Test** blocks under Phases 3–7                                        |

**Extension hooks**: `.specify/extensions.yml` not present — no pre/post hooks.
