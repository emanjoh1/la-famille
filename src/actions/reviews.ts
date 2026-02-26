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
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, status, check_out")
    .eq("id", data.booking_id)
    .eq("user_id", userId)
    .single();

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed") throw new Error("Can only review confirmed bookings");
  
  const checkOutDate = new Date(booking.check_out);
  if (checkOutDate > new Date()) throw new Error("Can only review after check-out");

  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", data.booking_id)
    .single();

  if (existing) throw new Error("Review already submitted");

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to create review");

  revalidatePath(`/listings/${data.listing_id}`);
  revalidatePath("/bookings");
  return review;
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

  const clerk = await clerkClient();
  const reviewsWithUsers = await Promise.all(
    (data || []).map(async (review) => {
      try {
        const user = await clerk.users.getUser(review.user_id);
        return {
          ...review,
          user_name: user.firstName || "Guest",
          user_avatar: user.imageUrl,
        };
      } catch {
        return {
          ...review,
          user_name: "Guest",
          user_avatar: null,
        };
      }
    })
  );

  return reviewsWithUsers;
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
