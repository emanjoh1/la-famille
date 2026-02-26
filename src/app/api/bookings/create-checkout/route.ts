import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, listingTitle, totalPrice } = await req.json();

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
            unit_amount: totalPrice, // XAF is zero-decimal currency
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/bookings?success=true`,
      cancel_url: `${baseUrl}/bookings?cancelled=true`,
      metadata: {
        booking_id: bookingId,
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
