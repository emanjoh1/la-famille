import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const checkoutSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Fetch booking from DB - verify ownership and get server-side price
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

    const listing = booking.listings as unknown as { title: string } | null;
    const listingTitle = listing?.title || `Booking for ${booking.nights || 1} night(s)`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "xaf",
            product_data: {
              name: listingTitle,
            },
            unit_amount: booking.total_price, // Server-side price, XAF is zero-decimal
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/bookings?success=true`,
      cancel_url: `${baseUrl}/bookings?cancelled=true`,
      metadata: {
        booking_id: booking.id,
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
