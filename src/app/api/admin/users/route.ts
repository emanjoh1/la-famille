import { NextResponse } from "next/server";
import { getAllUsers } from "@/actions/admin";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
