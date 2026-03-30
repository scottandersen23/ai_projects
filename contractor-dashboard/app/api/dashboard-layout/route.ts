import { NextRequest, NextResponse } from "next/server";

type LayoutCard = {
  metricId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
};

type DashboardLayout = {
  ownerId: string;
  cards: LayoutCard[];
  revisionTs: string;
  updatedAt: string;
};

type LayoutPostResponse = {
  layout: DashboardLayout;
  conflict: boolean;
};

// In-memory store for v1 local development. This can be swapped
// for Supabase-backed persistence without changing the API contract.
const layoutStore = new Map<string, DashboardLayout>();

const DEFAULT_OWNER = "default-owner";
const MAX_VISIBLE_CARDS = 6;

const isIsoDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

function visibleCardCount(cards: LayoutCard[]): number {
  return cards.filter((card) => card.visible).length;
}

function validateLayoutPayload(
  payload: Partial<DashboardLayout>,
): string | null {
  if (!Array.isArray(payload.cards)) return "cards must be an array";
  if (
    typeof payload.revisionTs !== "string" ||
    !isIsoDate(payload.revisionTs)
  ) {
    return "revisionTs must be a valid ISO date";
  }
  if (visibleCardCount(payload.cards) > MAX_VISIBLE_CARDS) {
    return `visible cards must be <= ${MAX_VISIBLE_CARDS}`;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("ownerId") ?? DEFAULT_OWNER;
  const existing = layoutStore.get(ownerId);

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const initialLayout: DashboardLayout = {
    ownerId,
    cards: [],
    revisionTs: new Date(0).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  layoutStore.set(ownerId, initialLayout);
  return NextResponse.json(initialLayout, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<DashboardLayout>;
  const validationError = validateLayoutPayload(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ownerId = body.ownerId ?? DEFAULT_OWNER;
  const existing = layoutStore.get(ownerId);

  // Last-write-wins based on newest revision timestamp.
  if (
    existing &&
    Date.parse(body.revisionTs!) < Date.parse(existing.revisionTs)
  ) {
    const conflictResponse: LayoutPostResponse = {
      layout: existing,
      conflict: true,
    };
    return NextResponse.json(conflictResponse, { status: 200 });
  }

  const nextLayout: DashboardLayout = {
    ownerId,
    cards: body.cards!,
    revisionTs: body.revisionTs!,
    updatedAt: new Date().toISOString(),
  };

  layoutStore.set(ownerId, nextLayout);
  const response: LayoutPostResponse = {
    layout: nextLayout,
    conflict: false,
  };
  return NextResponse.json(response, { status: 200 });
}
