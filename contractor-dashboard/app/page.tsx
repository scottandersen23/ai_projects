"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DashboardGrid,
  type LayoutCardState,
} from "../components/dashboard-grid";
import { RegionMap } from "../components/region-map";
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
  const mainBody = isLoading ? (
    <section className="rounded-md border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Loading metrics...
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Pulling this week&apos;s summary from the dashboard API.
      </p>
    </section>
  ) : loadError ? (
    <section className="rounded-md border border-amber-500/50 bg-white p-6">
      <h2 className="text-lg font-semibold text-amber-700">
        Metrics unavailable
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {loadError}. Please refresh or try again shortly.
      </p>
    </section>
  ) : !hasMetrics ? (
    <section className="rounded-md border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        No metrics available
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Metrics are currently unavailable for this week. Please check back
        shortly.
      </p>
    </section>
  ) : (
    <>
      <DashboardGrid metrics={metrics} cards={cards} trailingEmptySlot />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-semibold text-slate-800">
            Recent Jobs by Region
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Interactive map seeded from regional activity points.
          </p>
          <RegionMap />
        </section>

        <div className="flex flex-col gap-3">
          {executiveSecondaryMetrics.map((row) => (
            <section
              key={row.id}
              className="rounded-md border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-600">{row.label}</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums text-slate-800">
                {formatSecondaryValue(row)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-300 bg-slate-700 text-slate-100 lg:flex">
        <div className="border-b border-slate-600 px-4 py-5 text-lg font-semibold">
          i LOGO
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3" aria-label="Main">
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                item.active
                  ? "bg-slate-600 text-white"
                  : "text-slate-200/90 hover:bg-slate-600/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Executive Dashboard
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Layout revision: {revisionTs}
              {layoutNotice ? ` · ${layoutNotice}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex flex-wrap gap-1 rounded-md p-0.5"
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
                      ? "bg-slate-200 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100"
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
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">All Regions</option>
            </select>
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
              aria-label="Search"
            >
              <span aria-hidden className="text-base">
                🔍
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 bg-slate-100 px-4 py-5 sm:px-6">
          {mainBody}
        </main>
      </div>
    </div>
  );
}
