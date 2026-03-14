"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createReview(data: {
  booking_id: string;
  listing_id: string;
  overall_rating: number;
  cleanliness_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string;
}): Promise<{ error: string } | { data: Record<string, unknown> }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, status, check_out")
    .eq("id", data.booking_id)
    .eq("user_id", userId)
    .single();

  if (!booking) return { error: "Booking not found" };
  if (booking.status !== "confirmed") return { error: "Can only review confirmed bookings" };

  const checkOutDate = new Date(booking.check_out);
  if (checkOutDate > new Date()) return { error: "Can only review after check-out" };

  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", data.booking_id)
    .single();

  if (existing) return { error: "Review already submitted" };

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message || "Failed to create review" };

  revalidatePath(`/listings/${data.listing_id}`);
  revalidatePath("/bookings");
  return { data: review };
}

export async function getListingReviews(listingId: string) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  // Batch-fetch users instead of N+1 individual calls
  const clerk = await clerkClient();
  const uniqueUserIds = [...new Set((data || []).map((r) => r.user_id))];

  const userMap = new Map<string, { name: string; avatar: string | null }>();
  if (uniqueUserIds.length > 0) {
    try {
      const users = await clerk.users.getUserList({ userId: uniqueUserIds, limit: 100 });
      for (const user of users.data) {
        userMap.set(user.id, {
          name: user.firstName || "Guest",
          avatar: user.imageUrl,
        });
      }
    } catch {
      // Fall back to empty map — reviews still show with "Guest"
    }
  }

  return (data || []).map((review) => {
    const userData = userMap.get(review.user_id);
    return {
      ...review,
      user_name: userData?.name || "Guest",
      user_avatar: userData?.avatar || null,
    };
  });
}

export async function getHostReviews(hostId: string) {
  const { data: listings } = await supabaseAdmin
    .from("listings")
    .select("id")
    .eq("user_id", hostId);

  if (!listings || listings.length === 0) return [];

  const listingIds = listings.map((l) => l.id);

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching host reviews:", error);
    return [];
  }

  return data || [];
}

export async function getAverageRating(listingId: string) {
  const { data } = await supabaseAdmin
    .from("reviews")
    .select("overall_rating")
    .eq("listing_id", listingId);

  if (!data || data.length === 0) return null;

  const average = data.reduce((sum, r) => sum + r.overall_rating, 0) / data.length;
  return { average, count: data.length };
}

export async function canReviewBooking(bookingId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, status, check_out")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();

  if (!booking || booking.status !== "confirmed") return false;

  const checkOutDate = new Date(booking.check_out);
  if (checkOutDate > new Date()) return false;

  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .single();

  const canReview = !existing;
  return canReview;
}
