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
  /** Fifth column placeholder when fewer than five cards are visible (executive layout). */
  trailingEmptySlot?: boolean;
};

export function DashboardGrid({
  metrics,
  cards,
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
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
    >
      {visibleCards.map((card) => {
        const metric = metricMap.get(card.metricId);
        if (!metric) return null;

        return (
          <div key={card.metricId}>
            <MetricCard metric={metric} href={`/metric/${metric.metricId}`} />
          </div>
        );
      })}
      {showEmptySlot && (
        <div
          aria-hidden
          className="flex min-h-[132px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500"
        >
          Open slot
        </div>
      )}
    </section>
  );
}
