"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createBooking(data: {
  listing_id: string;
  check_in: string;
  check_out: string;
  guests: number;
}): Promise<{ error: string } | { data: any }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch listing to validate and get real price
  const { data: listing, error: listingError } = await supabaseAdmin
    .from("listings")
    .select("id, price_per_night, max_guests, status, user_id")
    .eq("id", data.listing_id)
    .eq("status", "approved")
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found or not available" };
  }

  // Prevent hosts from booking their own properties
  if (listing.user_id === userId) {
    return { error: "You cannot book your own property" };
  }

  if (data.guests > listing.max_guests) {
    return { error: `Maximum ${listing.max_guests} guests allowed` };
  }

  const checkIn = new Date(data.check_in);
  const checkOut = new Date(data.check_out);

  if (checkOut <= checkIn) {
    return { error: "Check-out must be after check-in" };
  }

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = nights * listing.price_per_night;
  const serviceFee = Math.round(subtotal * 0.14);
  const total_price = subtotal + serviceFee;

  // Check for date conflicts with confirmed or pending bookings
  const { data: conflicts } = await supabaseAdmin
    .from("bookings")
    .select("id, check_in, check_out")
    .eq("listing_id", data.listing_id)
    .in("status", ["pending", "confirmed"])
    .gte("check_out", data.check_in)
    .lte("check_in", data.check_out);

  if (conflicts && conflicts.length > 0) {
    return { error: "These dates are no longer available" };
  }

  const booking = {
    listing_id: data.listing_id,
    user_id: userId,
    check_in: data.check_in,
    check_out: data.check_out,
    guests: data.guests,
    nights,
    total_price,
    status: "pending" as const,
  };

  const { data: result, error } = await supabaseAdmin
    .from("bookings")
    .insert(booking)
    .select("*, listings(*)")
    .single();

  if (error) return { error: error.message || "Failed to create booking" };

  // Create conversation between guest and host
  try {
    const listingData = result.listings as any;
    const { data: existingConv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", data.listing_id)
      .eq("guest_id", userId)
      .eq("host_id", listingData.user_id)
      .single();

    if (!existingConv) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from("conversations")
        .insert({
          listing_id: data.listing_id,
          host_id: listingData.user_id,
          guest_id: userId,
        })
        .select("id")
        .single();
      
      if (convError) {
        console.error("Conversation creation error:", convError);
      } else {
        console.log("Conversation created:", newConv);
      }
    }
    revalidatePath("/messages");
  } catch (convError) {
    console.error("Failed to create conversation:", convError);
  }

  // Send pending reservation emails
  try {
    const listing = result.listings as any;
    const clerk = await clerkClient();
    const [guestUser, hostUser] = await Promise.all([
      clerk.users.getUser(userId),
      clerk.users.getUser(listing.user_id),
    ]);

    const guestEmail = guestUser.emailAddresses[0]?.emailAddress;
    const hostEmail = hostUser.emailAddresses[0]?.emailAddress;
    const guestName = guestUser.fullName || guestUser.firstName || "Guest";
    const hostName = hostUser.fullName || hostUser.firstName || "Host";

    if (guestEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: guestEmail,
        subject: `🏠 Reservation Pending - ${listing.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-row:last-child { border-bottom: none; }
              .label { font-weight: 600; color: #6b7280; }
              .value { font-weight: 600; color: #1a1a1a; }
              .total { background: #fff; padding: 15px; border-radius: 8px; margin-top: 15px; border: 2px solid #1E3A8A; }
              .button { display: inline-block; background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎉 Almost There!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your payment to confirm your stay</p>
              </div>
              <div class="content">
                <p style="font-size: 16px;">Hi <strong>${guestName}</strong>,</p>
                <p>Your reservation has been created and is waiting for payment confirmation. Complete the payment process to secure your booking.</p>
                
                <div class="details">
                  <h3 style="margin-top: 0; color: #1a1a1a;">📋 Reservation Details</h3>
                  <div class="detail-row">
                    <span class="label">Property</span>
                    <span class="value">${listing.title}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Location</span>
                    <span class="value">${listing.location}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-in</span>
                    <span class="value">${new Date(result.check_in).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-out</span>
                    <span class="value">${new Date(result.check_out).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Nights</span>
                    <span class="value">${nights} night${nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Guests</span>
                    <span class="value">${result.guests} guest${result.guests !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="total">
                    <div class="detail-row" style="border: none;">
                      <span class="label" style="font-size: 18px; color: #1a1a1a;">Total Amount</span>
                      <span class="value" style="font-size: 20px; color: #1E3A8A;">${Number(result.total_price).toLocaleString()} XAF</span>
                    </div>
                  </div>
                </div>

                <p style="margin-top: 25px;"><strong>What's Next?</strong></p>
                <ul style="color: #4b5563;">
                  <li>Complete your payment through the secure checkout</li>
                  <li>You'll receive a confirmation email once payment is processed</li>
                  <li>Your host will be notified and can prepare for your arrival</li>
                </ul>

                <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">Need help? Contact us at support@lafamille.com</p>
              </div>
              <div class="footer">
                <p>© 2024 La Famille. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    if (hostEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: hostEmail,
        subject: `🔔 New Reservation - ${listing.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
              .detail-row:last-child { border-bottom: none; }
              .label { font-weight: 600; color: #6b7280; }
              .value { font-weight: 600; color: #1a1a1a; }
              .status { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">💰 New Booking Request</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment pending confirmation</p>
              </div>
              <div class="content">
                <p style="font-size: 16px;">Hi <strong>${hostName}</strong>,</p>
                <p>Great news! You have a new reservation request for your property. The guest is completing their payment.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                  <span class="status">⏳ PAYMENT PENDING</span>
                </div>

                <div class="details">
                  <h3 style="margin-top: 0; color: #1a1a1a;">📋 Booking Details</h3>
                  <div class="detail-row">
                    <span class="label">Property</span>
                    <span class="value">${listing.title}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Guest Name</span>
                    <span class="value">${guestName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-in</span>
                    <span class="value">${new Date(result.check_in).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-out</span>
                    <span class="value">${new Date(result.check_out).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Duration</span>
                    <span class="value">${nights} night${nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Number of Guests</span>
                    <span class="value">${result.guests} guest${result.guests !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="detail-row" style="border: none; margin-top: 10px; padding-top: 15px; border-top: 2px solid #10B981;">
                    <span class="label" style="font-size: 18px; color: #1a1a1a;">Your Earnings</span>
                    <span class="value" style="font-size: 20px; color: #10B981;">${Number(result.total_price).toLocaleString()} XAF</span>
                  </div>
                </div>

                <p style="margin-top: 25px;"><strong>What Happens Next?</strong></p>
                <ul style="color: #4b5563;">
                  <li>You'll receive a confirmation email once payment is completed</li>
                  <li>The booking will be automatically confirmed</li>
                  <li>You can start preparing for your guest's arrival</li>
                </ul>

                <p style="margin-top: 25px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; color: #92400e;">
                  <strong>⚠️ Note:</strong> This booking is not confirmed until payment is completed. We'll notify you immediately once it's confirmed.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 La Famille. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }
  } catch (emailError) {
    console.error("Pending email error:", emailError);
  }

  revalidatePath("/bookings");
  return { data: result };
}

export async function getUserBookings() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*, listings(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("getUserBookings exception:", e);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled"
): Promise<{ error: string } | { data: any }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, listing_id, status, listings(user_id)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) return { error: "Booking not found" };

  const isGuest = booking.user_id === userId;
  const listingData = booking.listings as unknown as { user_id: string } | null;
  const isHost = listingData?.user_id === userId;

  if (status === "cancelled") {
    if (!isGuest && !isHost) throw new Error("Forbidden");
    if (booking.status === "confirmed" && isGuest) {
      return { error: "Cannot cancel confirmed bookings. Please contact support." };
    }
  }
  if (status === "confirmed" && !isHost) {
    return { error: "Only the host can confirm bookings" };
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) return { error: error.message || "Failed to update booking" };

  revalidatePath("/bookings");
  return { data };
}
