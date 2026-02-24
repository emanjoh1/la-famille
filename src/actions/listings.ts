"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Host actions ──────────────────────────────────────────────

export async function createListing(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const listing = {
    user_id: userId,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price_per_night: Number(formData.get("price_per_night")),
    location: formData.get("location") as string,
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    max_guests: Number(formData.get("max_guests")),
    amenities: JSON.parse(formData.get("amenities") as string),
    images: JSON.parse(formData.get("images") as string),
    status: "pending_review" as const,
  };

  const { data, error } = await supabaseAdmin
    .from("listings")
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Failed to create listing");
  }

  // Send notification email to admin
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: data.id, title: listing.title }),
    });
  } catch (e) {
    console.error("Failed to send admin notification:", e);
  }

  revalidatePath("/host/listings");
  return data;
}

// ─── Public listing queries ────────────────────────────────────

/** Returns only admin-approved listings (shown on /explore) */
export async function getListings() {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
  return data || [];
}

/** Returns a single listing by id (approved or owned by the requester) */
export async function getListing(id: string) {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/** Returns all listings owned by the signed-in host (all statuses) */
export async function getUserListings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
  return data || [];
}

// ─── Admin actions ─────────────────────────────────────────────

async function assertAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") throw new Error("Forbidden: admin only");
  return userId;
}

/** Returns all listings pending admin review */
export async function getPendingListings() {
  await assertAdmin();

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true }); // oldest first

  if (error) {
    console.error("Error fetching pending listings:", error);
    return [];
  }
  return data || [];
}

/** Returns all listings for the admin overview (all statuses) */
export async function getAllListingsAdmin() {
  await assertAdmin();

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all listings:", error);
    return [];
  }
  return data || [];
}

/** Admin approves a listing — it becomes visible on /explore */
export async function approveListing(listingId: string) {
  await assertAdmin();

  const { error } = await supabaseAdmin
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", listingId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/explore");
  revalidatePath("/host/listings");
}

/** Admin rejects a listing with an optional reason sent back to the host */
export async function rejectListing(listingId: string, reason?: string) {
  await assertAdmin();

  const { error } = await supabaseAdmin
    .from("listings")
    .update({
      status: "rejected",
      rejection_reason: reason ?? null,
    })
    .eq("id", listingId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/host/listings");
}
