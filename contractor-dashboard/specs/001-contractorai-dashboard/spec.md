# Feature Specification: ContractorAI Dashboard

**Feature Branch**: `001-contractorai-dashboard`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "I am looking to build a dashboard application called ContractorAI..."

## Clarifications

### Session 2026-03-27

- Q: What conflict policy should apply when the same user saves dashboard layout changes from multiple tabs/devices? → A: Last write wins.
- Q: What should be the default time window for all default dashboard cards? → A: This week.
- Q: Who can customize dashboard layout (move/resize/add metrics)? → A: Any authenticated user.
- Q: What is the maximum number of visible metric cards? → A: 6 metric cards.
- Q: What accessibility target applies to v1? → A: Visual accessibility only (contrast).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Business Performance Snapshot (Priority: P1)

As a business owner, I want to open one page and immediately see high-level performance metrics so I
can quickly understand how the business is doing this week.

**Why this priority**: Without a clear overview, the dashboard does not provide core value.

**Independent Test**: Open the dashboard with sample business data and confirm the owner can see all
core summary metrics without navigating elsewhere.

**Acceptance Scenarios**:

1. **Given** a signed-in business owner with available data, **When** they open the dashboard,
   **Then** they see tiles for total service calls, services completed this week, revenue, and job
   estimates.
2. **Given** the dashboard is visible, **When** the owner reviews metric cards and charts,
   **Then** the information is presented in a clear, scannable layout that supports quick decisions.

---

### User Story 2 - Drill Into Metric Details (Priority: P2)

As a business owner, I want to click a metric and view detailed breakdown information so I can
understand what is driving the number and take action.

**Why this priority**: Detail views turn dashboard summaries into actionable insights.

**Independent Test**: From the dashboard, click each core metric and verify navigation to the
matching detail page, then return to the dashboard.

**Acceptance Scenarios**:

1. **Given** a metric card on the dashboard, **When** the owner clicks it, **Then** the app opens a
   detail page with specifics for that metric.
2. **Given** the owner is on a metric detail page, **When** they choose to return, **Then** they
   are taken back to the main dashboard page.

---

### User Story 3 - Customize Dashboard Layout (Priority: P3)

As a business owner, I want to move and resize dashboard metrics and add additional high-level fields
so the dashboard matches how I run my business.

**Why this priority**: Personalization increases long-term usefulness and engagement.

**Independent Test**: Rearrange and resize multiple metric cards, add a new metric field, refresh
the dashboard, and confirm the customized layout persists for that owner.

**Acceptance Scenarios**:

1. **Given** the owner is on the dashboard, **When** they drag and drop metric cards, **Then** card
   positions update to the new arrangement.
2. **Given** the owner selects a metric card, **When** they resize it, **Then** the card size changes
   and the layout remains readable.
3. **Given** the owner wants another summary metric, **When** they add a new field to the dashboard,
   **Then** the new metric appears in the high-level view and can also be rearranged or resized.

---

### Edge Cases

- What happens when one or more metrics have no available data for the selected period?
- How does the system handle invalid or unavailable detail data after a metric is clicked?
- What happens when a user moves or resizes cards into a conflicting layout area?
- How does the dashboard behave when many metrics are added beyond the initial screen space?
- How are concurrent layout saves handled when the same user edits in multiple tabs/devices?
- How does the dashboard behave when a metric has no values for the default `this week` window?
- What should happen when a user tries to add a seventh metric card beyond the 6-card limit?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST present a main dashboard for business owners with high-level business
  performance metrics.
- **FR-002**: System MUST display, at minimum, total service calls, services completed this week,
  revenue, and job estimates in the default dashboard view.
- **FR-003**: Users MUST be able to select any displayed metric and open a dedicated detail view for
  that metric.
- **FR-004**: System MUST provide a clear way to return from any metric detail page to the main
  dashboard page.
- **FR-005**: Users MUST be able to reposition dashboard metric cards.
- **FR-006**: Users MUST be able to resize dashboard metric cards.
- **FR-007**: Users MUST be able to add additional high-level metric fields to the dashboard from an
  available set of metrics.
- **FR-008**: System MUST persist each user's dashboard layout preferences (positions, sizes, and
  selected metric fields) across sessions.
- **FR-009**: System MUST show a clear empty or fallback state when metric data is unavailable.
- **FR-010**: System MUST maintain readable dashboard content after user-driven rearrangement and
  resizing actions.
- **FR-011**: The visual and interaction flow MUST align with the reference dashboard style provided
  by the user image (high-level cards/charts leading to detail drill-down and back navigation).
- **FR-012**: Implementation MUST prioritize readability and simplicity for newcomer maintainers.
- **FR-013**: Non-obvious behavior MUST include intent-focused comments in implementation notes.
- **FR-014**: Solution design MUST justify any new file creation when an existing file could be
  extended.
- **FR-015**: When concurrent layout saves occur for the same user, the system MUST apply a
  last-write-wins policy based on the most recent successful save timestamp.
- **FR-016**: The default time window for all default high-level dashboard metrics MUST be `this week`.
- **FR-017**: Any authenticated user MUST be able to customize dashboard layout by moving, resizing,
  and adding available metric cards.
- **FR-018**: The dashboard MUST allow a maximum of 6 visible metric cards at one time.
- **FR-019**: For v1, the dashboard MUST meet a visual accessibility baseline focused on readable
  contrast between text/controls and background.

### Key Entities _(include if feature involves data)_

- **Dashboard Metric**: A high-level business metric shown on the dashboard (for example service
  calls, completed services, revenue, estimates), including current value, label, and optional trend
  context.
- **Metric Detail View**: A detailed representation for a selected metric, including expanded context
  and historical or categorical breakdowns.
- **Dashboard Layout Preference**: A user-specific configuration describing which metric cards are
  shown and each card's position and size.
- **Business Owner Profile**: The dashboard user identity and associated permissions for viewing and
  customizing business metrics.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of business owners can identify all four core metrics on the main dashboard
  within 10 seconds of page load during usability validation.
- **SC-002**: At least 90% of users can navigate from a metric tile to its detail page and back to
  the dashboard without assistance on first attempt.
- **SC-003**: At least 85% of users successfully rearrange and resize at least two metric cards and
  add one new metric field in a single session.
- **SC-004**: At least 95% of saved dashboard customizations are correctly restored when users return
  to the application.
- **SC-005**: 100% of dashboard and detail page text/controls meet the project's defined contrast
  threshold during visual QA.

## Assumptions

- The primary users are business owners or managers monitoring day-to-day service performance.
- Authentication and basic account access already exist and are outside this feature's scope.
- Authenticated users share a single customization permission level for v1 (no role-based restriction
  for layout changes).
- The first release targets desktop-first dashboard usage; mobile-specific layout optimization can
  follow in later iterations.
- A defined catalog of available metrics exists (or will be provided) for users to add to the
  dashboard.
- The provided reference image defines interaction expectations and presentation style, but exact
  visual branding can be adapted to ContractorAI.
- Accessibility scope for v1 is limited to visual contrast validation; broader assistive interaction
  support is deferred.
