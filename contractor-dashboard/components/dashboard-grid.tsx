"use client";

import { MetricCard } from "./metric-card";
import type { DashboardMetric } from "../lib/dashboard-data";

export type LayoutCardState = {
  metricId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
};

const MAX_VISIBLE_CARDS = 6;

type DashboardGridProps = {
  metrics: DashboardMetric[];
  cards: LayoutCardState[];
  onReorder: (fromMetricId: string, toMetricId: string) => void;
  onResize: (metricId: string, nextW: number, nextH: number) => void;
  onHide: (metricId: string) => void;
  /** Fifth column placeholder when fewer than five cards are visible (executive layout). */
  trailingEmptySlot?: boolean;
};

export function DashboardGrid({
  metrics,
  cards,
  onReorder,
  onResize,
  onHide,
  trailingEmptySlot = false,
}: DashboardGridProps) {
  const metricMap = new Map(metrics.map((metric) => [metric.metricId, metric]));
  const visibleCards = cards
    .filter((card) => card.visible)
    .slice(0, MAX_VISIBLE_CARDS);
  const showEmptySlot =
    trailingEmptySlot && visibleCards.length > 0 && visibleCards.length < 5;

  return (
    <section
      aria-label="Dashboard metrics grid"
      data-max-visible-cards={MAX_VISIBLE_CARDS}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
    >
      {visibleCards.map((card) => {
        const metric = metricMap.get(card.metricId);
        if (!metric) return null;

        return (
          <div
            key={card.metricId}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", card.metricId);
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const fromMetricId = event.dataTransfer.getData("text/plain");
              if (fromMetricId && fromMetricId !== card.metricId) {
                // Collision resolution strategy: we do stable list reordering only.
                // This avoids overlapping absolute coordinates for newcomers.
                onReorder(fromMetricId, card.metricId);
              }
            }}
            style={{
              gridColumn: `span ${card.w} / span ${card.w}`,
              gridRow: `span ${card.h} / span ${card.h}`,
            }}
            className="space-y-2"
          >
            <MetricCard metric={metric} href={`/metric/${metric.metricId}`} />
            <div className="flex flex-wrap gap-2 text-xs">
              {/* Save-conflict resolution is handled by the page-level API sync,
                  while this component focuses on local interaction controls. */}
              <button
                type="button"
                onClick={() =>
                  onResize(
                    metric.metricId,
                    clampCardSize(card.w - 1, 1, 2),
                    card.h,
                  )
                }
                className="rounded border border-neonTeal/25 px-2 py-1 text-muted hover:bg-neonTeal/10"
              >
                Width -
              </button>
              <button
                type="button"
                onClick={() =>
                  onResize(
                    metric.metricId,
                    clampCardSize(card.w + 1, 1, 2),
                    card.h,
                  )
                }
                className="rounded border border-neonTeal/25 px-2 py-1 text-muted hover:bg-neonTeal/10"
              >
                Width +
              </button>
              <button
                type="button"
                onClick={() =>
                  onResize(
                    metric.metricId,
                    card.w,
                    clampCardSize(card.h - 1, 1, 2),
                  )
                }
                className="rounded border border-neonTeal/25 px-2 py-1 text-muted hover:bg-neonTeal/10"
              >
                Height -
              </button>
              <button
                type="button"
                onClick={() =>
                  onResize(
                    metric.metricId,
                    card.w,
                    clampCardSize(card.h + 1, 1, 2),
                  )
                }
                className="rounded border border-neonTeal/25 px-2 py-1 text-muted hover:bg-neonTeal/10"
              >
                Height +
              </button>
              <button
                type="button"
                onClick={() => onHide(metric.metricId)}
                className="rounded border border-accentOrange/40 px-2 py-1 text-accentOrange hover:bg-neonTeal/10"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      {showEmptySlot && (
        <div
          aria-hidden
          className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-400/40 bg-white/40 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-500"
        >
          Open slot
        </div>
      )}
    </section>
  );
}

export function clampCardSize(size: number, min: number, max: number): number {
  return Math.min(Math.max(size, min), max);
}
