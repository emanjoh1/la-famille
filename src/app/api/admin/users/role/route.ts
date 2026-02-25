import { NextRequest, NextResponse } from "next/server";
import { updateUserRole } from "@/actions/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    await updateUserRole(userId, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
