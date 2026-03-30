import { NextRequest, NextResponse } from "next/server";
import { getMetricDetail } from "../../../../lib/dashboard-data";

type Params = {
  params: Promise<{ metricId: string }>;
};

export async function GET(_request: NextRequest, context: Params) {
  const { metricId } = await context.params;
  const detail = getMetricDetail(metricId);

  if (!detail) {
    return NextResponse.json(
      { error: `Metric '${metricId}' not found` },
      { status: 404 },
    );
  }

  return NextResponse.json(detail, { status: 200 });
}
