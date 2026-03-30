"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { MetricDetail } from "../../../lib/dashboard-data";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-lg font-semibold text-foreground">{children}</h2>;
}

export default function MetricDetailPage() {
  const params = useParams<{ metricId: string }>();
  const metricId = params?.metricId ?? "";
  const [detail, setDetail] = useState<MetricDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMetricDetail() {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Keep the detail view coupled to the API route contract so
        // error/empty states behave the same in development and production.
        const response = await fetch(`/api/metrics/${metricId}`);
        if (response.status === 404) {
          if (isMounted) setDetail(null);
          return;
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as MetricDetail;
        if (isMounted) {
          setDetail(payload);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load metric detail",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMetricDetail();
    return () => {
      isMounted = false;
    };
  }, [metricId]);

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{metricId}</h1>
          <p className="mt-2 text-sm text-muted">
            Detailed view for this week.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-md border border-neonTeal/40 px-4 py-2 text-sm font-medium text-neonTeal hover:bg-neonTeal/10"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Explicit UI states keep the detail route behavior predictable for newcomers. */}
      {isLoading ? (
        <section className="rounded-xl border border-neonTeal/25 bg-surface p-6">
          <h2 className="text-lg font-semibold">Loading metric detail...</h2>
          <p className="mt-2 text-sm text-muted">
            Pulling detail data from the metrics API.
          </p>
        </section>
      ) : loadError ? (
        <section className="rounded-xl border border-accentOrange/40 bg-surface p-6">
          <h2 className="text-lg font-semibold text-accentOrange">
            Unable to load detail
          </h2>
          <p className="mt-2 text-sm text-muted">{loadError}</p>
        </section>
      ) : !detail ? (
        <section className="rounded-xl border border-neonTeal/25 bg-surface p-6">
          <h2 className="text-lg font-semibold">Metric not found</h2>
          <p className="mt-2 text-sm text-muted">
            This metric is unavailable or no longer exists.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-neonTeal/25 bg-surface p-6">
            <p className="text-xs uppercase tracking-wide text-muted">
              Headline Value
            </p>
            <p className="mt-2 text-3xl font-bold">{detail.headlineValue}</p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-neonTeal/25 bg-surface p-6">
              <SectionTitle>Breakdown</SectionTitle>
              <ul className="mt-3 space-y-2">
                {detail.breakdownItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-xl border border-neonTeal/25 bg-surface p-6">
              <SectionTitle>History</SectionTitle>
              <ul className="mt-3 space-y-2">
                {detail.historyPoints.map((point) => (
                  <li
                    key={point.period}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted">{point.period}</span>
                    <span className="font-medium">{point.value}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
