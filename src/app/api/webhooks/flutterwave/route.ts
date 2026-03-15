import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const secretHash = process.env.FLW_SECRET_HASH;

  if (!secretHash) {
    return NextResponse.json({ error: "Missing FLW_SECRET_HASH" }, { status: 500 });
  }

  // Verify webhook signature
  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: {
    event: string;
    data: {
      id: number;
      tx_ref: string;
      status: string;
      amount: number;
      currency: string;
      meta?: { booking_id?: string };
    };
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const bookingId = payload.data.meta?.booking_id;

      if (!bookingId) {
        console.error("Flutterwave webhook: missing booking_id in meta");
        return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
      }

      // Verify transaction directly with Flutterwave to prevent replay attacks
      const verification = await verifyFlutterwaveTransaction(payload.data.id);

      if (
        verification.status !== "success" ||
        verification.data.status !== "successful" ||
        verification.data.currency !== "XAF"
      ) {
        console.error("Flutterwave transaction verification failed", verification);
        return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
      }

      // Fetch booking to verify the amount matches
      const { data: existingBooking } = await supabaseAdmin
        .from("bookings")
        .select("id, total_price, payment_status")
        .eq("id", bookingId)
        .single();

      if (!existingBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Idempotency — skip if already paid
      if (existingBooking.payment_status === "paid") {
        return NextResponse.json({ received: true });
      }

      // Confirm verified amount matches booking total
      if (verification.data.amount < existingBooking.total_price) {
        console.error("Flutterwave amount mismatch", {
          expected: existingBooking.total_price,
          received: verification.data.amount,
        });
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      // Update booking to confirmed + paid
      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
          flutterwave_transaction_id: String(payload.data.id),
          payment_provider: "flutterwave",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select("*, listings(*)")
        .single();

      if (error || !booking) {
        console.error("Error updating booking after Flutterwave payment:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
      }

      // Send confirmation emails
      try {
        const listing = booking.listings as {
          user_id: string;
          title: string;
          location: string;
        } | null;

        if (!listing) throw new Error("Listing data missing from booking");

        const clerk = await clerkClient();
        const [guestUser, hostUser] = await Promise.all([
          clerk.users.getUser(booking.user_id),
          clerk.users.getUser(listing.user_id),
        ]);

        const guestEmail = guestUser.emailAddresses[0]?.emailAddress;
        const hostEmail = hostUser.emailAddresses[0]?.emailAddress;
        const guestName = guestUser.firstName || "Guest";
        const hostName = hostUser.firstName || "Host";

        if (guestEmail) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: guestEmail,
            subject: "Booking Confirmed - La Famille",
            html: `
              <h2>Your booking is confirmed!</h2>
              <p>Hi ${guestName},</p>
              <p>Your Mobile Money payment was successful and your booking is confirmed.</p>
              <h3>Booking Details:</h3>
              <ul>
                <li><strong>Property:</strong> ${listing.title}</li>
                <li><strong>Location:</strong> ${listing.location}</li>
                <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
                <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
                <li><strong>Guests:</strong> ${booking.guests}</li>
                <li><strong>Total Paid:</strong> ${Number(booking.total_price).toLocaleString()} XAF</li>
              </ul>
              <p>View your booking: ${process.env.NEXT_PUBLIC_APP_URL}/bookings</p>
            `,
          });
        }

        if (hostEmail) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: hostEmail,
            subject: "New Booking Received - La Famille",
            html: `
              <h2>You have a new booking!</h2>
              <p>Hi ${hostName},</p>
              <p>You have a new confirmed booking paid via Mobile Money.</p>
              <h3>Booking Details:</h3>
              <ul>
                <li><strong>Property:</strong> ${listing.title}</li>
                <li><strong>Guest:</strong> ${guestName}</li>
                <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
                <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
                <li><strong>Guests:</strong> ${booking.guests}</li>
                <li><strong>Total:</strong> ${Number(booking.total_price).toLocaleString()} XAF</li>
              </ul>
              <p>Manage bookings: ${process.env.NEXT_PUBLIC_APP_URL}/host/bookings</p>
            `,
          });
        }
      } catch (emailError) {
        console.error("Email error after Flutterwave payment:", emailError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Flutterwave webhook handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
