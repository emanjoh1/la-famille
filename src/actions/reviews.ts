"use server";

import { auth } from "@clerk/nextjs/server";
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
  comment?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify the user owns this booking and it's confirmed
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, status")
    .eq("id", data.booking_id)
    .single();

  if (bookingError || !booking) throw new Error("Booking not found");
  if (booking.user_id !== userId) throw new Error("Forbidden");
  if (booking.status !== "confirmed") {
    throw new Error("Can only review confirmed bookings");
  }

  // Check if already reviewed
  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", data.booking_id)
    .single();

  if (existing) throw new Error("You have already reviewed this booking");

  // Validate ratings
  const ratings = [
    data.overall_rating,
    data.cleanliness_rating,
    data.communication_rating,
    data.location_rating,
    data.value_rating,
  ];
  if (ratings.some((r) => r < 1 || r > 5 || !Number.isInteger(r))) {
    throw new Error("Ratings must be integers between 1 and 5");
  }

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      booking_id: data.booking_id,
      listing_id: data.listing_id,
      user_id: userId,
      overall_rating: data.overall_rating,
      cleanliness_rating: data.cleanliness_rating,
      communication_rating: data.communication_rating,
      location_rating: data.location_rating,
      value_rating: data.value_rating,
      comment: data.comment?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to create review");

  revalidatePath(`/listings/${data.listing_id}`);
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
  return data || [];
}

export async function getAverageRating(listingId: string) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("overall_rating")
    .eq("listing_id", listingId);

  if (error || !data || data.length === 0) {
    return null;
  }

  const sum = data.reduce((acc, r) => acc + r.overall_rating, 0);
  return {
    average: Math.round((sum / data.length) * 100) / 100,
    count: data.length,
  };
}
