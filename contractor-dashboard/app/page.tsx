"use client";

import { useEffect, useMemo, useState } from "react";
import { AddMetricPanel } from "../components/add-metric-panel";
import {
  DashboardGrid,
  type LayoutCardState,
} from "../components/dashboard-grid";
import {
  type DashboardMetric,
  type ExecutiveSecondaryMetric,
  executiveSecondaryMetrics,
} from "../lib/dashboard-data";

type MetricsApiResponse = {
  metrics: DashboardMetric[];
};

type DashboardLayoutApiResponse = {
  ownerId: string;
  cards: LayoutCardState[];
  revisionTs: string;
  updatedAt: string;
};

type DashboardLayoutSaveResponse = {
  layout: DashboardLayoutApiResponse;
  conflict: boolean;
};

const MAX_VISIBLE_CARDS = 6;

const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", active: true },
  { id: "operations", label: "Operations", active: false },
  { id: "financials", label: "Financials", active: false },
  { id: "reports", label: "Reports", active: false },
  { id: "settings", label: "Settings", active: false },
] as const;

const TIMEFRAMES = ["Today", "Week", "Month", "Custom"] as const;

function formatSecondaryValue(metric: ExecutiveSecondaryMetric): string {
  if (metric.unit === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(metric.value);
  }
  if (metric.unit === "percent") {
    return `${metric.value}%`;
  }
  return new Intl.NumberFormat("en-US").format(metric.value);
}

function buildDefaultCards(metrics: DashboardMetric[]): LayoutCardState[] {
  return metrics.map((metric, index) => ({
    metricId: metric.metricId,
    x: index % 3,
    y: Math.floor(index / 3),
    w: 1,
    h: 1,
    visible: metric.isCore,
  }));
}

function mergeCards(
  metrics: DashboardMetric[],
  savedCards: LayoutCardState[] | null,
): LayoutCardState[] {
  const metricIds = new Set(metrics.map((metric) => metric.metricId));
  const fallback = buildDefaultCards(metrics);
  if (!savedCards || savedCards.length === 0) return fallback;

  const filtered = savedCards.filter((card) => metricIds.has(card.metricId));
  const existing = new Set(filtered.map((card) => card.metricId));
  const missing = fallback.filter((card) => !existing.has(card.metricId));
  return [...filtered, ...missing];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [cards, setCards] = useState<LayoutCardState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [revisionTs, setRevisionTs] = useState<string>(
    new Date(0).toISOString(),
  );
  const [layoutNotice, setLayoutNotice] = useState<string | null>(null);
  const [timeframe, setTimeframe] =
    useState<(typeof TIMEFRAMES)[number]>("Today");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [metricsResponse, layoutResponse] = await Promise.all([
          fetch("/api/metrics?timeRange=this_week"),
          fetch("/api/dashboard-layout?ownerId=default-owner"),
        ]);

        if (!metricsResponse.ok) {
          throw new Error(
            `Metrics request failed with status ${metricsResponse.status}`,
          );
        }
        if (!layoutResponse.ok) {
          throw new Error(
            `Layout request failed with status ${layoutResponse.status}`,
          );
        }

        const metricsPayload =
          (await metricsResponse.json()) as MetricsApiResponse;
        const layoutPayload =
          (await layoutResponse.json()) as DashboardLayoutApiResponse;
        if (isMounted) {
          const nextMetrics = metricsPayload.metrics ?? [];
          setMetrics(nextMetrics);
          setCards(mergeCards(nextMetrics, layoutPayload.cards));
          setRevisionTs(layoutPayload.revisionTs);
          setIsHydrated(true);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard metrics",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    let isMounted = true;

    async function saveLayout() {
      const nextRevision = new Date().toISOString();
      const response = await fetch("/api/dashboard-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId: "default-owner",
          cards,
          revisionTs: nextRevision,
        }),
      });

      if (!response.ok) {
        if (isMounted) {
          setLayoutNotice(
            "Unable to save layout. Changes remain local for now.",
          );
        }
        return;
      }

      const payload = (await response.json()) as DashboardLayoutSaveResponse;
      if (!isMounted) return;

      if (payload.conflict) {
        setLayoutNotice(
          "A newer layout from another tab was kept (last-write-wins).",
        );
        setCards(payload.layout.cards);
      } else {
        setLayoutNotice("Layout saved.");
      }

      setRevisionTs(payload.layout.revisionTs);
    }

    saveLayout();
    return () => {
      isMounted = false;
    };
  }, [cards, isHydrated]);

  const hasMetrics = useMemo(() => metrics.length > 0, [metrics.length]);
  const visibleCount = useMemo(
    () => cards.filter((card) => card.visible).length,
    [cards],
  );

  const availableToAdd = useMemo(() => {
    const hiddenIds = new Set(
      cards.filter((card) => !card.visible).map((card) => card.metricId),
    );
    return metrics.filter((metric) => hiddenIds.has(metric.metricId));
  }, [cards, metrics]);

  const reorderCards = (fromMetricId: string, toMetricId: string) => {
    setCards((prev) => {
      const fromIndex = prev.findIndex(
        (card) => card.metricId === fromMetricId,
      );
      const toIndex = prev.findIndex((card) => card.metricId === toMetricId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const resizeCard = (metricId: string, nextW: number, nextH: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.metricId === metricId ? { ...card, w: nextW, h: nextH } : card,
      ),
    );
  };

  const hideCard = (metricId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.metricId === metricId ? { ...card, visible: false } : card,
      ),
    );
  };

  const addMetric = (metricId: string) => {
    if (visibleCount >= MAX_VISIBLE_CARDS) return;
    setCards((prev) =>
      prev.map((card) =>
        card.metricId === metricId ? { ...card, visible: true } : card,
      ),
    );
  };

  const mainBody = isLoading ? (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Loading metrics...
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Pulling this week&apos;s summary from the dashboard API.
      </p>
    </section>
  ) : loadError ? (
    <section className="rounded-xl border border-amber-500/50 bg-white p-6 shadow-sm dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
        Metrics unavailable
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {loadError}. Please refresh or try again shortly.
      </p>
    </section>
  ) : !hasMetrics ? (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        No metrics available
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Metrics are currently unavailable for this week. Please check back
        shortly.
      </p>
    </section>
  ) : (
    <>
      <DashboardGrid
        metrics={metrics}
        cards={cards}
        onReorder={reorderCards}
        onResize={resizeCard}
        onHide={hideCard}
        trailingEmptySlot
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Recent Jobs by Region
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Heat-style preview (seed data — replace with a live map in a later
            release).
          </p>
          <div
            className="mt-3 flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100/90 via-orange-50 to-slate-200/80 text-center text-xs text-slate-600 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 dark:text-slate-500"
            role="img"
            aria-label="Map placeholder for job density by region"
          >
            United States — regional job density (mock)
          </div>
        </section>

        <div className="flex flex-col gap-3">
          {executiveSecondaryMetrics.map((row) => (
            <section
              key={row.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {row.label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {formatSecondaryValue(row)}
              </p>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AddMetricPanel
          visibleCount={visibleCount}
          maxVisible={MAX_VISIBLE_CARDS}
          availableMetrics={availableToAdd}
          onAddMetric={addMetric}
        />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 lg:flex">
        <div className="border-b border-slate-800 px-4 py-5 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Logo
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                item.active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-200 px-4 py-3 text-slate-900 sm:px-6 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Executive Dashboard
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
              Layout revision: {revisionTs}
              {layoutNotice ? ` · ${layoutNotice}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex flex-wrap gap-1 rounded-lg bg-white/80 p-0.5 dark:bg-slate-800/80"
              role="group"
              aria-label="Time range"
            >
              {TIMEFRAMES.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTimeframe(label)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    timeframe === label
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="region-filter">
              Region
            </label>
            <select
              id="region-filter"
              defaultValue="all"
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">All Regions</option>
            </select>
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Search"
            >
              <span aria-hidden className="text-base">
                🔍
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
          {mainBody}
        </main>
      </div>
    </div>
  );
}
