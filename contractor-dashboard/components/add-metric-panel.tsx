import type { DashboardMetric } from "../lib/dashboard-data";

type AddMetricPanelProps = {
  visibleCount: number;
  maxVisible?: number;
  availableMetrics: DashboardMetric[];
  onAddMetric?: (metricId: string) => void;
};

export function AddMetricPanel({
  visibleCount,
  maxVisible = 6,
  availableMetrics,
  onAddMetric,
}: AddMetricPanelProps) {
  const canAddMore = visibleCount < maxVisible;

  return (
    <aside className="rounded-xl border border-neonTeal/25 bg-surface p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Add Metric
      </p>
      <p className="mt-1 text-xs text-muted">
        Visible cards: {visibleCount}/{maxVisible}
      </p>

      {!canAddMore && (
        <p className="mt-2 text-xs font-medium text-accentOrange">
          You have reached the 6-card limit. Remove one card before adding
          another.
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {availableMetrics.map((metric) => (
          <button
            key={metric.metricId}
            type="button"
            className="rounded-md border border-neonTeal/30 px-3 py-2 text-left text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canAddMore}
            onClick={() => onAddMetric?.(metric.metricId)}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
