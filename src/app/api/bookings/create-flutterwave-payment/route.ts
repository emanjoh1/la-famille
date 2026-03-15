import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createFlutterwavePayment } from "@/lib/flutterwave";

const schema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Fetch booking — verify ownership, status, payment state
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, total_price, status, payment_status, nights, listings(title)")
      .eq("id", parsed.data.bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in pending status" }, { status: 400 });
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
    }

    // Get user email from Clerk
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "guest@lafamille.cm";
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest";

    const listing = booking.listings as unknown as { title: string } | null;
    const description = listing?.title ?? `Booking for ${booking.nights ?? 1} night(s)`;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

    const txRef = `lafamille_${booking.id}_${Date.now()}`;

    const flwResponse = await createFlutterwavePayment({
      tx_ref: txRef,
      amount: booking.total_price,
      currency: "XAF",
      redirect_url: `${baseUrl}/bookings?flw_status=success`,
      customer: { email, name },
      payment_options: "mobilemoneycameroon,card",
      meta: { booking_id: booking.id },
      customizations: {
        title: "La Famille",
        description,
      },
    });

    if (flwResponse.status !== "success" || !flwResponse.data?.link) {
      throw new Error("Failed to get payment link from Flutterwave");
    }

    return NextResponse.json({ url: flwResponse.data.link });
  } catch (error) {
    console.error("Flutterwave payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
