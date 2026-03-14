import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllUsers } from "@/actions/admin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    const status = message.includes("Forbidden") || message.includes("admin only") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
