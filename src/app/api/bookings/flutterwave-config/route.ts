import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ bookingId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, total_price, status, payment_status, nights, listings(title)")
    .eq("id", parsed.data.bookingId)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "pending") return NextResponse.json({ error: "Booking is not pending" }, { status: 400 });
  if (booking.payment_status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "guest@lafamille.cm";
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest";
  const listing = booking.listings as unknown as { title: string } | null;

  return NextResponse.json({
    public_key: process.env.FLW_PUBLIC_KEY!,
    tx_ref: `lafamille_${booking.id}_${Date.now()}`,
    amount: booking.total_price,
    currency: "XAF",
    language: "en",
    customer: { email, name },
    payment_options: "card,account,mobilemoneycameroon,ussd,banktransfer",
    meta: { booking_id: booking.id },
    customizations: {
      title: "La Famille",
      description: listing?.title ?? `Booking for ${booking.nights ?? 1} night(s)`,
    },
  });
}
