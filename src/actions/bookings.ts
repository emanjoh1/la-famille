"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createBooking(data: {
  listing_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const booking = {
    ...data,
    user_id: userId,
    status: "pending" as const,
  };

  const { data: result, error } = await supabaseAdmin
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to create booking");

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

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to update booking");

  revalidatePath("/bookings");
  return data;
}
