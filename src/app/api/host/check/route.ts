import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isHost: false });

  const [listingsRes, kycRes] = await Promise.all([
    supabaseAdmin.from("listings").select("id").eq("user_id", userId).limit(1),
    supabaseAdmin.from("host_kyc").select("id").eq("user_id", userId).limit(1),
  ]);

  const isHost =
    (listingsRes.data?.length ?? 0) > 0 || (kycRes.data?.length ?? 0) > 0;

  return NextResponse.json({ isHost });
}
