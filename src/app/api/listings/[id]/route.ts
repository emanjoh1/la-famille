import { NextRequest, NextResponse } from "next/server";
import { getListing } from "@/actions/listings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListing(id);
    return NextResponse.json(listing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch listing";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
