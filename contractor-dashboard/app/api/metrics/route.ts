import { NextRequest, NextResponse } from "next/server";
import { getSummaryMetrics } from "../../../lib/dashboard-data";

export async function GET(request: NextRequest) {
  const requestedTimeRange = request.nextUrl.searchParams.get("timeRange");
  const timeRange =
    requestedTimeRange === "this_week" ? "this_week" : "this_week";
  const metrics = getSummaryMetrics(timeRange);

  return NextResponse.json({ metrics }, { status: 200 });
}
