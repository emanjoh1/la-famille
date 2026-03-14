import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { updateUserRole } from "@/actions/admin";

const roleUpdateSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  role: z.enum(["guest", "host", "admin"]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = roleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await updateUserRole(parsed.data.userId, parsed.data.role);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    const status = message.includes("Forbidden") || message.includes("admin only") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
