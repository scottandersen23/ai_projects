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
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-800">
        Add Metric
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Visible cards: {visibleCount}/{maxVisible}
      </p>

      {!canAddMore && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          You have reached the 6-card limit. Remove one card before adding
          another.
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {availableMetrics.map((metric) => (
          <button
            key={metric.metricId}
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
