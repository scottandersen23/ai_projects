# Research: ContractorAI Dashboard

## Decision 1: Next.js App Router for dashboard + details

- **Decision**: Use Next.js App Router with route-based pages for dashboard and metric detail views.
- **Rationale**: The feature requires clear navigation between a summary dashboard and detail pages.
  Route-based pages map directly to this flow and stay easy for newcomers to follow.
- **Alternatives considered**:
  - Single-page-only view with modal details: rejected because deep linking and back navigation are
    less explicit.
  - Multi-app split (separate frontend/backend repositories): rejected as unnecessary complexity.

## Decision 2: Vercel Serverless Functions for metric APIs

- **Decision**: Expose dashboard data through serverless API endpoints.
- **Rationale**: Matches requested deployment model and keeps frontend independent from raw data shape.
  Also allows later migration from local mock data to Supabase without rewriting UI routes.
- **Alternatives considered**:
  - Client-only hardcoded data: rejected because detail pages and persistence flows need a stable API contract.
  - Long-running custom backend service: rejected as overkill for current scope.

## Decision 3: No formal database in phase 1

- **Decision**: Use seeded in-memory/static data for metrics and browser-local persistence for layout
  preferences.
- **Rationale**: User requested no database for now. This supports local development speed and avoids
  infrastructure setup while preserving future migration paths.
- **Alternatives considered**:
  - Introduce Supabase tables immediately: deferred to a later milestone.
  - File-based server persistence: rejected due to environment differences and avoidable complexity.

## Decision 4: Tailwind CSS + tokenized dark futuristic theme

- **Decision**: Implement a black-first design system with neon teal primary highlights and yellow/orange
  accent states using shared theme tokens.
- **Rationale**: Directly aligns with requested visual identity while keeping styling consistent and
  maintainable.
- **Alternatives considered**:
  - Inline, one-off utility classes without token conventions: rejected due to consistency risk.
  - Traditional light theme baseline: rejected because it conflicts with the brand direction.

## Decision 5: Drag/resize customization with bounded layout rules

- **Decision**: Allow card reordering and resizing with guardrails (minimum sizes, collision handling,
  and reset option).
- **Rationale**: Meets customization requirements while preventing broken layouts and unreadable states.
- **Alternatives considered**:
  - Reorder-only, no resize: rejected (does not satisfy spec FR-006).
  - Free-form absolute positioning: rejected due to high breakage risk and poor responsiveness.

## Decision 6: Conflict handling for layout persistence

- **Decision**: Use last-write-wins for concurrent layout saves for the same authenticated user.
- **Rationale**: This keeps behavior deterministic and simple in a local-first, no-database v1 scope.
  It also prevents blocking writes while still preserving a clear rule for testing.
- **Alternatives considered**:
  - First-write-wins: rejected because it can surprise active users editing in another tab.
  - Prompt-on-conflict: rejected as unnecessary UX complexity for v1.

## Decision 7: Dashboard defaults and limits

- **Decision**: Set default metric time window to `this week` and cap visible metric cards at 6.
- **Rationale**: A single default window improves interpretation consistency; a hard card cap protects
  readability and layout stability.
- **Alternatives considered**:
  - Per-metric mixed windows: rejected due to comparison ambiguity.
  - Unlimited cards: rejected due to clutter and degraded scanability.

## Decision 8: Customization permission scope

- **Decision**: Allow any authenticated user to customize layout in v1.
- **Rationale**: Matches clarified product intent and avoids introducing role-based gating logic before
  it is needed.
- **Alternatives considered**:
  - Owner-only customization: rejected because it restricts operational flexibility.
  - Owner/manager-only customization: deferred unless role policies tighten later.

## Decision 9: Accessibility baseline for v1

- **Decision**: Enforce visual accessibility baseline focused on contrast only.
- **Rationale**: Aligns with clarified scope while providing an objective quality gate in v1.
- **Alternatives considered**:
  - Full WCAG AA compliance in v1: deferred due to timeline/scope.
  - Accessibility deferred entirely: rejected due to readability and usability risk.
