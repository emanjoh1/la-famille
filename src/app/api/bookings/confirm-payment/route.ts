import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  bookingId: z.string().uuid(),
  transactionId: z.number(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { bookingId, transactionId } = parsed.data;

  // Verify with Flutterwave directly
  const verification = await verifyFlutterwaveTransaction(transactionId);

  if (
    verification.status !== "success" ||
    verification.data.status !== "successful"
  ) {
    return NextResponse.json({ error: "Transaction not successful" }, { status: 400 });
  }

  // Confirm booking_id in meta matches
  if (verification.data.meta?.booking_id !== bookingId) {
    return NextResponse.json({ error: "Booking mismatch" }, { status: 400 });
  }

  // Fetch booking to verify ownership + amount
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, total_price, payment_status, check_in, check_out, guests, nights, listing_id, listings(title, location, user_id)")
    .eq("id", bookingId)
    .single();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.payment_status === "paid") return NextResponse.json({ success: true }); // idempotent

  if (verification.data.amount < booking.total_price) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "paid",
      flutterwave_transaction_id: String(transactionId),
      payment_provider: "flutterwave",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });

  // Send confirmation emails
  try {
    const listingRaw = Array.isArray(booking.listings) ? booking.listings[0] : booking.listings;
    const listing = listingRaw as unknown as { title: string; location: string; user_id: string } | null;
    if (listing) {
      const clerk = await clerkClient();
      const [guestUser, hostUser] = await Promise.all([
        clerk.users.getUser(booking.user_id),
        clerk.users.getUser(listing.user_id),
      ]);
      const guestEmail = guestUser.emailAddresses[0]?.emailAddress;
      const hostEmail = hostUser.emailAddresses[0]?.emailAddress;
      const guestName = guestUser.fullName || guestUser.firstName || "Guest";
      const hostName = hostUser.fullName || hostUser.firstName || "Host";
      const checkIn = new Date(booking.check_in).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
      const checkOut = new Date(booking.check_out).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

      const sharedDetails = `
        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Property</span><span style="font-weight:600;">${listing.title}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Location</span><span style="font-weight:600;">${listing.location}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Check-in</span><span style="font-weight:600;">${checkIn}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Check-out</span><span style="font-weight:600;">${checkOut}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Nights</span><span style="font-weight:600;">${booking.nights}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="font-weight:600;color:#6b7280;">Guests</span><span style="font-weight:600;">${booking.guests}</span></div>
          <div style="display:flex;justify-content:space-between;padding:15px 0 0 0;"><span style="font-weight:700;font-size:18px;">Total</span><span style="font-weight:700;font-size:20px;color:#166534;">${Number(booking.total_price).toLocaleString()} XAF</span></div>
        </div>`;

      if (guestEmail) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: guestEmail,
          subject: `✅ Booking Confirmed - ${listing.title}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#166534,#15803D);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;">✅ Booking Confirmed!</h1>
                <p style="margin:10px 0 0;opacity:.9;">Your payment was successful</p>
              </div>
              <div style="background:#fff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p style="font-size:16px;">Hi <strong>${guestName}</strong>,</p>
                <p>Your booking is confirmed and payment has been received. We look forward to hosting you!</p>
                ${sharedDetails}
                <p style="margin-top:20px;color:#6b7280;font-size:14px;">Need help? Contact us at support@lafamille.cm</p>
              </div>
            </div>`,
        });
      }

      if (hostEmail) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: hostEmail,
          subject: `💰 Booking Confirmed - ${listing.title}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#10B981,#059669);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;">💰 Payment Received!</h1>
                <p style="margin:10px 0 0;opacity:.9;">A booking for your property is confirmed</p>
              </div>
              <div style="background:#fff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p style="font-size:16px;">Hi <strong>${hostName}</strong>,</p>
                <p>Payment has been received and the booking is now confirmed. Please prepare for your guest's arrival.</p>
                <p><strong>Guest:</strong> ${guestName}</p>
                ${sharedDetails}
                <p style="margin-top:20px;color:#6b7280;font-size:14px;">Need help? Contact us at support@lafamille.cm</p>
              </div>
            </div>`,
        });
      }
    }
  } catch (emailError) {
    console.error("Confirmation email error:", emailError);
  }

  return NextResponse.json({ success: true });
}
