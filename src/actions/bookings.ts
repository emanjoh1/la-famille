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
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch listing to validate and get real price
  const { data: listing, error: listingError } = await supabaseAdmin
    .from("listings")
    .select("id, price_per_night, max_guests, status")
    .eq("id", data.listing_id)
    .eq("status", "approved")
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found or not available");
  }

  if (data.guests > listing.max_guests) {
    throw new Error(`Maximum ${listing.max_guests} guests allowed`);
  }

  const checkIn = new Date(data.check_in);
  const checkOut = new Date(data.check_out);

  if (checkOut <= checkIn) {
    throw new Error("Check-out must be after check-in");
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
    throw new Error("These dates are no longer available");
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

  if (error) throw new Error(error.message || "Failed to create booking");

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
    const guestName = guestUser.firstName || "Guest";
    const hostName = hostUser.firstName || "Host";

    if (guestEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: guestEmail,
        subject: "Reservation Pending - Complete Your Payment",
        html: `
          <h2>Your reservation is pending payment</h2>
          <p>Hi ${guestName},</p>
          <p>You're almost there! Complete your payment to confirm your booking.</p>
          <h3>Reservation Details:</h3>
          <ul>
            <li><strong>Property:</strong> ${listing.title}</li>
            <li><strong>Location:</strong> ${listing.location}</li>
            <li><strong>Check-in:</strong> ${new Date(result.check_in).toLocaleDateString()}</li>
            <li><strong>Check-out:</strong> ${new Date(result.check_out).toLocaleDateString()}</li>
            <li><strong>Guests:</strong> ${result.guests}</li>
            <li><strong>Total:</strong> ${Number(result.total_price).toLocaleString()} XAF</li>
          </ul>
          <p>You'll receive a confirmation email once payment is complete.</p>
        `,
      });
    }

    if (hostEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: hostEmail,
        subject: "New Reservation (Pending Payment)",
        html: `
          <h2>New reservation pending payment</h2>
          <p>Hi ${hostName},</p>
          <p>You have a new reservation. Payment is pending.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Property:</strong> ${listing.title}</li>
            <li><strong>Guest:</strong> ${guestName}</li>
            <li><strong>Check-in:</strong> ${new Date(result.check_in).toLocaleDateString()}</li>
            <li><strong>Check-out:</strong> ${new Date(result.check_out).toLocaleDateString()}</li>
            <li><strong>Guests:</strong> ${result.guests}</li>
            <li><strong>Total:</strong> ${Number(result.total_price).toLocaleString()} XAF</li>
          </ul>
          <p>You'll be notified once payment is complete.</p>
        `,
      });
    }
  } catch (emailError) {
    console.error("Pending email error:", emailError);
  }

  revalidatePath("/bookings");
  return result;
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
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch booking with listing to verify authorization
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, listing_id, listings(user_id)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found");

  const isGuest = booking.user_id === userId;
  const listingData = booking.listings as unknown as { user_id: string } | null;
  const isHost = listingData?.user_id === userId;

  if (status === "cancelled" && !isGuest && !isHost) {
    throw new Error("Forbidden");
  }
  if (status === "confirmed" && !isHost) {
    throw new Error("Only the host can confirm bookings");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to update booking");

  revalidatePath("/bookings");
  return data;
}
