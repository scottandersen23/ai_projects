# Implementation Plan: ContractorAI Dashboard

**Branch**: `001-contractorai-dashboard` | **Date**: 2026-03-27 | **Spec**: `/specs/001-contractorai-dashboard/spec.md`
**Input**: Feature specification from `/specs/001-contractorai-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a ContractorAI dashboard for authenticated users that shows high-level service business metrics,
supports metric drill-down, and enables layout customization (move, resize, add metrics) with
persisted preferences.

The refreshed plan incorporates clarifications: default time window is `this week`, layout conflict
resolution is last-write-wins, all authenticated users can customize, visible cards are capped at 6,
and v1 accessibility scope is visual contrast compliance.

## Technical Context

**Language/Version**: TypeScript on Node.js runtime with Next.js compatibility  
**Primary Dependencies**: Next.js, React, Tailwind CSS, Vercel Serverless Functions  
**Storage**: No formal database in v1; seeded metric data + local/browser layout persistence. Supabase local integration deferred.  
**Testing**: Vitest + React Testing Library; Playwright for key user journeys  
**Target Platform**: Desktop web browsers (primary), local dev and Vercel-compatible runtime  
**Project Type**: Web application with UI routes and serverless API routes  
**Performance Goals**: Dashboard load under 2 seconds on local baseline; metric detail navigation under 1 second after click  
**Constraints**: Max 6 visible cards; default time window `this week`; last-write-wins layout saves; contrast-focused accessibility baseline  
**Scale/Scope**: Single dashboard for authenticated users with 4 core default metrics plus up to 2 additional visible cards

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Readability First**: Proposed code paths use explicit naming and simple control flow.
- **Simplicity Over Cleverness**: No new abstraction is added without a concrete need.
- **Comments That Teach**: Non-obvious logic has planned intent-focused comments.
- **Newcomer-Friendly Defaults**: A relative full-stack newcomer can follow the design.
- **Single-File Bias**: Existing files are reused unless file split justification is documented.

Pre-Phase-0 gate result: **PASS**

- Core behavior maps directly to explicit requirements FR-015 through FR-019.
- Constraints are encoded with simple, testable defaults (6-card cap, week default, contrast check).

Post-Phase-1 design re-check: **PASS**

- Data model and API contracts include clarified rules without adding unnecessary architecture.
- File structure remains compact and newcomer-navigable.

## Project Structure

### Documentation (this feature)

```text
specs/001-contractorai-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── page.tsx                               # Main dashboard view
├── metric/[metricId]/page.tsx             # Metric detail route
├── api/
│   ├── metrics/route.ts                   # Summary metrics
│   ├── metrics/[metricId]/route.ts        # Detail payload
│   └── dashboard-layout/route.ts          # Read/write layout preferences
components/
├── dashboard-grid.tsx
├── metric-card.tsx
└── add-metric-panel.tsx
lib/
└── dashboard-data.ts
tests/
├── unit/
└── integration/
```

**Structure Decision**: Single Next.js app structure with minimal directories. Keep logic close to
its usage and avoid extra layers unless justified by complexity.

## Complexity Tracking

No constitution violations identified in this refreshed plan.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## File additions and single-file bias (T033)

Each top-level file below exists because extending a single file would hurt clarity, break Next.js
routing/API conventions, or mix unrelated concerns. Newcomers can navigate by feature: **pages** under
`app/`, **reusable UI** under `components/`, **shared data** under `lib/`.

| Path                                     | Role                                             | Why not one mega-file                                                             |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `app/layout.tsx`                         | Root HTML shell, metadata, global CSS import     | Next.js App Router requires a root layout; keeps all routes wrapped consistently. |
| `app/page.tsx`                           | Client dashboard page (data fetch, layout state) | Co-locating every route in one file would break file-based routing.               |
| `app/metric/[metricId]/page.tsx`         | Metric detail route                              | Dynamic segment must live in its own route module.                                |
| `app/api/*/route.ts`                     | Serverless handlers per URL                      | Next.js maps one entry per API path; merging would obscure HTTP boundaries.       |
| `components/dashboard-grid.tsx`          | Drag/resize grid + card chrome                   | Large interactive subtree; separating it keeps `page.tsx` readable.               |
| `components/metric-card.tsx`             | Metric presentation + chart                      | Reused by grid; isolates SVG and formatting.                                      |
| `components/add-metric-panel.tsx`        | Add-metric UX                                    | Isolated form/list logic from main page orchestration.                            |
| `lib/dashboard-data.ts`                  | Types, seed data, getters                        | Single shared module avoids duplicating types across API routes and UI.           |
| `tailwind.config.ts` / `app/globals.css` | Design tokens and global styles                  | Tailwind expects these entry points; tokens belong outside components.            |

**Bias check**: No extra abstraction layers (no `services/` or `repositories/` in v1). Prefer extending
the files above before adding new ones unless a new **route** or **API contract** requires it.
