export type MetricUnit = "count" | "currency" | "percent";

export type TrendDirection = "up" | "down" | "flat";

export type DashboardMetric = {
  metricId: string;
  label: string;
  value: number;
  unit: MetricUnit;
  trendDirection?: TrendDirection;
  trendDelta?: number;
  weeklyTrend?: number[];
  timeRange: "this_week";
  isCore: boolean;
};

export type MetricDetail = {
  metricId: string;
  headlineValue: number | string;
  breakdownItems: Array<{ label: string; value: number | string }>;
  historyPoints: Array<{ period: string; value: number | string }>;
  lastUpdatedAt: string;
};

/** Right-column snapshot tiles from the executive dashboard mockup (v1 static seed). */
export type ExecutiveSecondaryMetric = {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
};

/**
 * Core summary metrics aligned with the executive dashboard reference:
 * Inbound Calls, Revenue, Pending Estimates, Service Jobs.
 */
export const defaultDashboardMetrics: DashboardMetric[] = [
  {
    metricId: "inbound-calls",
    label: "Inbound Calls",
    value: 142,
    unit: "count",
    trendDirection: "up",
    trendDelta: 12,
    timeRange: "this_week",
    isCore: true,
  },
  {
    metricId: "revenue",
    label: "Revenue",
    value: 48230,
    unit: "currency",
    trendDirection: "down",
    trendDelta: 4,
    timeRange: "this_week",
    isCore: true,
  },
  {
    metricId: "pending-estimates",
    label: "Pending Estimates",
    value: 27,
    unit: "count",
    trendDirection: "up",
    trendDelta: 8,
    timeRange: "this_week",
    isCore: true,
  },
  {
    metricId: "service-jobs",
    label: "Service Jobs",
    value: 63,
    unit: "count",
    trendDirection: "up",
    trendDelta: 5,
    timeRange: "this_week",
    isCore: true,
  },
];

export const executiveSecondaryMetrics: ExecutiveSecondaryMetric[] = [
  {
    id: "jobs-completed-today",
    label: "Jobs Completed Today",
    value: 14,
    unit: "count",
  },
  {
    id: "avg-job-value",
    label: "Avg Job Value",
    value: 320,
    unit: "currency",
  },
  {
    id: "conversion-rate",
    label: "Conversion Rate",
    value: 45,
    unit: "percent",
  },
];

const nowIso = () => new Date().toISOString();

const metricDetails: Record<string, MetricDetail> = {
  "inbound-calls": {
    metricId: "inbound-calls",
    headlineValue: 142,
    breakdownItems: [
      { label: "Answered", value: 128 },
      { label: "Missed", value: 14 },
    ],
    historyPoints: [
      { period: "Mon", value: 18 },
      { period: "Tue", value: 20 },
      { period: "Wed", value: 19 },
      { period: "Thu", value: 22 },
      { period: "Fri", value: 21 },
      { period: "Sat", value: 22 },
      { period: "Sun", value: 20 },
    ],
    lastUpdatedAt: nowIso(),
  },
  revenue: {
    metricId: "revenue",
    headlineValue: "$48,230",
    breakdownItems: [
      { label: "Residential", value: "$28,100" },
      { label: "Commercial", value: "$20,130" },
    ],
    historyPoints: [
      { period: "Mon", value: "$6,412" },
      { period: "Tue", value: "$6,030" },
      { period: "Wed", value: "$5,987" },
      { period: "Thu", value: "$7,824" },
      { period: "Fri", value: "$7,102" },
      { period: "Sat", value: "$5,318" },
      { period: "Sun", value: "$5,319" },
    ],
    lastUpdatedAt: nowIso(),
  },
  "pending-estimates": {
    metricId: "pending-estimates",
    headlineValue: 27,
    breakdownItems: [
      { label: "Awaiting reply", value: 14 },
      { label: "Follow-up scheduled", value: 13 },
    ],
    historyPoints: [
      { period: "Mon", value: 3 },
      { period: "Tue", value: 4 },
      { period: "Wed", value: 4 },
      { period: "Thu", value: 5 },
      { period: "Fri", value: 4 },
      { period: "Sat", value: 4 },
      { period: "Sun", value: 3 },
    ],
    lastUpdatedAt: nowIso(),
  },
  "service-jobs": {
    metricId: "service-jobs",
    headlineValue: 63,
    breakdownItems: [
      { label: "Scheduled", value: 38 },
      { label: "In progress", value: 25 },
    ],
    historyPoints: [
      { period: "Mon", value: 8 },
      { period: "Tue", value: 9 },
      { period: "Wed", value: 10 },
      { period: "Thu", value: 9 },
      { period: "Fri", value: 9 },
      { period: "Sat", value: 9 },
      { period: "Sun", value: 9 },
    ],
    lastUpdatedAt: nowIso(),
  },
};

export const getMetricDetail = (metricId: string): MetricDetail | null => {
  return metricDetails[metricId] ?? null;
};

export const getSummaryMetrics = (
  timeRange: "this_week" | string = "this_week",
): DashboardMetric[] => {
  // v1 supports only this_week for consistent dashboard comparisons.
  const normalizedRange = "this_week" as const;

  const trendByMetricId: Record<string, number[]> = Object.fromEntries(
    Object.entries(metricDetails).map(([metricId, detail]) => {
      const weeklyTrend = detail.historyPoints.map((point) => {
        if (typeof point.value === "number") return point.value;
        const numeric = Number(String(point.value).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(numeric) ? numeric : 0;
      });
      return [metricId, weeklyTrend];
    }),
  );

  return defaultDashboardMetrics.map((metric) => ({
    ...metric,
    weeklyTrend: trendByMetricId[metric.metricId] ?? [],
    timeRange: timeRange === "this_week" ? "this_week" : normalizedRange,
  }));
};
