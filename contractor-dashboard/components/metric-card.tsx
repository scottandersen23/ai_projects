"use client";

import Link from "next/link";
import { useId } from "react";
import type { DashboardMetric } from "../lib/dashboard-data";

type MetricCardProps = {
  metric: DashboardMetric;
  className?: string;
  href?: string;
};

const WEEKDAY_TICKS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type BarLayoutItem = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  dayLabel: string;
};

function buildBarLayout(points: number[]): BarLayoutItem[] {
  if (points.length === 0) return [];

  const chartWidth = 100;
  const chartTop = 6;
  const baselineY = 30;
  const maxBarHeight = baselineY - chartTop;
  const max = Math.max(...points);
  const normalizedMax = max <= 0 ? 1 : max;
  const slotWidth = chartWidth / points.length;
  const barWidth = slotWidth * 0.62;

  return points.map((value, index) => {
    const height = Math.max(2, (value / normalizedMax) * maxBarHeight);
    const x = index * slotWidth + (slotWidth - barWidth) / 2;
    const y = baselineY - height;
    return {
      x,
      y,
      width: barWidth,
      height,
      value,
      dayLabel: WEEKDAY_TICKS[index] ?? `D${index + 1}`,
    };
  });
}

function formatValue(metric: DashboardMetric): string {
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

/** Same rules as the headline value, for per-day bar labels on the chart. */
function formatTrendBarLabel(
  unit: DashboardMetric["unit"],
  value: number,
): string {
  if (unit === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === "percent") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function formatTrendDelta(metric: DashboardMetric): string | null {
  if (metric.trendDelta == null || metric.trendDirection == null) return null;
  if (metric.trendDirection === "flat" && metric.trendDelta === 0) return null;
  const abs = Math.abs(metric.trendDelta);
  const sign =
    metric.trendDirection === "up"
      ? "+"
      : metric.trendDirection === "down"
        ? "-"
        : "";
  return `${sign}${abs}%`;
}

export function MetricCard({ metric, className = "", href }: MetricCardProps) {
  const gradientId = useId().replace(/:/g, "");
  const trendLabel = formatTrendDelta(metric);
  const trendClass =
    metric.trendDirection === "down"
      ? "text-red-400"
      : metric.trendDirection === "up"
        ? "text-emerald-400"
        : "text-muted";

  const content = (
    <article
      className={`metric-card-surface rounded-xl border border-neonTeal/25 bg-surface p-4 text-foreground ${className} ${href ? "transition hover:border-neonTeal/40" : ""}`}
    >
      <p className="text-xs uppercase tracking-wide text-muted">
        {metric.label}
      </p>
      <p className="mt-2 text-3xl font-bold text-foreground">
        {formatValue(metric)}
      </p>
      {trendLabel && (
        <p className={`mt-1 text-sm font-semibold tabular-nums ${trendClass}`}>
          {metric.trendDirection === "up" && "↑ "}
          {metric.trendDirection === "down" && "↓ "}
          {trendLabel}
        </p>
      )}
      {metric.weeklyTrend && metric.weeklyTrend.length > 1 && (
        <div className="mt-3 rounded border border-neonTeal/20 bg-slate-950/35 p-1">
          {/*
            We compute bars, day labels, and value labels from the same
            geometry model to guarantee day tick alignment per bar.
          */}
          {(() => {
            const bars = buildBarLayout(metric.weeklyTrend);
            return (
              <svg
                viewBox="0 0 100 42"
                role="img"
                aria-label={`${metric.label} weekly trend by day`}
                className="h-6 w-full"
              >
                <line
                  x1="0"
                  y1="30"
                  x2="100"
                  y2="30"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                <line
                  x1="0"
                  y1="22"
                  x2="100"
                  y2="22"
                  stroke="#1f2937"
                  strokeWidth="0.6"
                />
                <line
                  x1="0"
                  y1="14"
                  x2="100"
                  y2="14"
                  stroke="#1f2937"
                  strokeWidth="0.6"
                />
                {bars.map((bar, index) => {
                  const centerX = bar.x + bar.width / 2;
                  return (
                    <g key={`${metric.metricId}-bar-${index}`}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        rx="0.8"
                        fill={`url(#metricBarGradient-${gradientId})`}
                        opacity="0.95"
                      />
                      <text
                        x={centerX}
                        y={Math.max(5, bar.y - 1.4)}
                        textAnchor="middle"
                        fontSize="3"
                        fill="#cbd5e1"
                        fontWeight="600"
                      >
                        {formatTrendBarLabel(metric.unit, bar.value)}
                      </text>
                      <text
                        x={centerX}
                        y="39.2"
                        textAnchor="middle"
                        fontSize="3"
                        fill="#94a3b8"
                      >
                        {bar.dayLabel}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient
                    id={`metricBarGradient-${gradientId}`}
                    x1="0"
                    y1="30"
                    x2="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
            );
          })()}
        </div>
      )}
      <p className="mt-2 text-xs text-neonTeal">Time Range: this week</p>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neonTeal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`View ${metric.label} details`}
    >
      {content}
    </Link>
  );
}
