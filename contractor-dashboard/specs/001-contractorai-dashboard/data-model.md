# Data Model: ContractorAI Dashboard

## Entity: BusinessOwner

- **Description**: Authenticated user who views and customizes a dashboard.
- **Fields**:
  - `ownerId` (string, required)
  - `displayName` (string, required)
  - `role` (string, optional metadata only)
- **Validation**:
  - `ownerId` must be stable and unique per user.
  - Any authenticated user can customize layout in v1.

## Entity: DashboardMetric

- **Description**: Summary card metric shown on dashboard.
- **Fields**:
  - `metricId` (string, required)
  - `label` (string, required)
  - `value` (number or currency-formatted string, required)
  - `unit` (enum: `count`, `currency`, `percent`, optional)
  - `trendDirection` (enum: `up`, `down`, `flat`, optional)
  - `trendDelta` (number, optional)
  - `timeRange` (string, required; example: `this_week`)
  - `isCore` (boolean, required)
- **Validation**:
  - `metricId` must be unique in a metric catalog.
  - `label` must be non-empty and human-readable.
  - `value` must map to selected `unit`.
  - Default `timeRange` for dashboard summary cards is `this_week`.

## Entity: MetricDetail

- **Description**: Expanded data payload for one metric detail page.
- **Fields**:
  - `metricId` (string, required)
  - `headlineValue` (number/string, required)
  - `breakdownItems` (array of `{ label, value }`, optional)
  - `historyPoints` (array of `{ period, value }`, optional)
  - `lastUpdatedAt` (ISO datetime string, required)
- **Validation**:
  - `metricId` must reference an existing `DashboardMetric`.
  - At least one of `breakdownItems` or `historyPoints` must be present for non-empty detail state.

## Entity: DashboardLayoutPreference

- **Description**: Owner-specific layout configuration for visible cards.
- **Fields**:
  - `ownerId` (string, required)
  - `cards` (array of `LayoutCard`, required)
  - `revisionTs` (ISO datetime string, required; used for last-write-wins saves)
  - `updatedAt` (ISO datetime string, required)

### Child Entity: LayoutCard

- **Fields**:
  - `metricId` (string, required)
  - `x` (integer, required)
  - `y` (integer, required)
  - `w` (integer, required)
  - `h` (integer, required)
  - `visible` (boolean, required)
- **Validation**:
  - `metricId` must exist in metric catalog.
  - `w` and `h` must be within defined min/max bounds.
  - Total visible cards (`visible = true`) must not exceed 6.
  - No two visible cards may occupy conflicting grid regions after normalization.

## State Transitions

- `DashboardLayoutPreference`:
  - `loaded` -> `modified` when user drags/resizes/adds/removes a card
  - `modified` -> `saved` when persistence succeeds (last write wins by newest `revisionTs`)
  - `modified` -> `error` when persistence fails
  - `error` -> `modified` after retry
- `MetricDetail`:
  - `loading` -> `ready` when detail payload is available
  - `loading` -> `empty` when no data exists
  - `loading` -> `error` on fetch failure
