"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Host actions ──────────────────────────────────────────────

export async function createListing(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Safely parse JSON fields
  let amenities: string[];
  let images: string[];
  try {
    amenities = JSON.parse((formData.get("amenities") as string) ?? "[]");
    images = JSON.parse((formData.get("images") as string) ?? "[]");
  } catch {
    throw new Error("Invalid amenities or images data");
  }

  if (!Array.isArray(amenities) || !Array.isArray(images)) {
    throw new Error("Amenities and images must be arrays");
  }

  const title = (formData.get("title") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const price = Number(formData.get("price_per_night"));
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const maxGuests = Number(formData.get("max_guests"));

  // Basic validation
  if (title.length < 5) throw new Error("Title must be at least 5 characters");
  if (title.length > 120)
    throw new Error("Title must be at most 120 characters");
  if (description.length < 20)
    throw new Error("Description must be at least 20 characters");
  if (isNaN(price) || price < 1000)
    throw new Error("Minimum price is 1,000 FCFA");
  if (isNaN(maxGuests) || maxGuests < 1)
    throw new Error("Must accommodate at least 1 guest");
  if (images.length === 0) throw new Error("At least one image is required");

  const listing = {
    user_id: userId,
    title,
    description,
    price_per_night: price,
    location: (formData.get("location") as string) ?? "",
    category: (formData.get("category") as string) ?? "apartment",
    bedrooms: isNaN(bedrooms) ? 1 : bedrooms,
    bathrooms: isNaN(bathrooms) ? 1 : bathrooms,
    max_guests: maxGuests,
    amenities,
    images,
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

  // Send notification email to admin (fire-and-forget)
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

/** Returns only admin-approved listings, with optional filters */
export async function getListings(filters?: {
  category?: string;
  location?: string;
}) {
  let query = supabaseAdmin
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
  return data || [];
}

/** Returns a single listing by id (approved or owned by the requester) */
export async function getListing(id: string) {
  const { userId } = await auth().catch(() => ({ userId: null }));

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message || "Listing not found");

  // Only show non-approved listings to the owner
  if (data.status !== "approved" && data.user_id !== userId) {
    throw new Error("Listing not found");
  }

  return data;
}

/** Get suggested listings based on popular locations */
export async function getSuggestedListings(limit = 12) {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching suggested listings:", error);
    return [];
  }
  return data || [];
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch metadata directly from Clerk — more reliable than sessionClaims
  // because publicMetadata is not included in the JWT by default.
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;

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

  if (error) throw new Error(error.message || "Failed to approve listing");

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

  if (error) throw new Error(error.message || "Failed to reject listing");

  revalidatePath("/admin");
  revalidatePath("/host/listings");
}

// ─── Host management actions ───────────────────────────────────

/** Update an existing listing (host only) */
export async function updateListing(listingId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("Update listing - userId:", userId, "listingId:", listingId);

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (fetchError || !existing) {
    console.error("Fetch error:", fetchError);
    throw new Error("Listing not found");
  }

  console.log("Listing owner:", existing.user_id, "Current user:", userId);

  if (existing.user_id !== userId) {
    throw new Error("Unauthorized - You don't own this listing");
  }

  // Parse JSON fields
  let amenities: string[];
  let images: string[];
  try {
    amenities = JSON.parse((formData.get("amenities") as string) ?? "[]");
    images = JSON.parse((formData.get("images") as string) ?? "[]");
  } catch {
    throw new Error("Invalid amenities or images data");
  }

  if (!Array.isArray(amenities) || !Array.isArray(images)) {
    throw new Error("Amenities and images must be arrays");
  }

  const title = (formData.get("title") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const price = Number(formData.get("price_per_night"));
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const maxGuests = Number(formData.get("max_guests"));

  // Validation
  if (title.length < 5) throw new Error("Title must be at least 5 characters");
  if (title.length > 120) throw new Error("Title must be at most 120 characters");
  if (description.length < 20) throw new Error("Description must be at least 20 characters");
  if (isNaN(price) || price < 1000) throw new Error("Minimum price is 1,000 FCFA");
  if (isNaN(maxGuests) || maxGuests < 1) throw new Error("Must accommodate at least 1 guest");
  if (images.length === 0) throw new Error("At least one image is required");

  const updates = {
    title,
    description,
    price_per_night: price,
    location: (formData.get("location") as string) ?? "",
    category: (formData.get("category") as string) ?? "apartment",
    bedrooms: isNaN(bedrooms) ? 1 : bedrooms,
    bathrooms: isNaN(bathrooms) ? 1 : bathrooms,
    max_guests: maxGuests,
    amenities,
    images,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("listings")
    .update(updates)
    .eq("id", listingId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Failed to update listing");
  }

  revalidatePath("/host/listings");
  revalidatePath(`/host/listings/${listingId}/edit`);
  revalidatePath(`/listings/${listingId}`);
}

/** Toggle listing snooze status (host only) */
export async function toggleListingSnooze(listingId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get current listing
  const { data: listing, error: fetchError } = await supabaseAdmin
    .from("listings")
    .select("user_id, status")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) throw new Error("Listing not found");
  if (listing.user_id !== userId) throw new Error("Unauthorized");

  // Toggle between approved and snoozed
  const newStatus = listing.status === "snoozed" ? "approved" : "snoozed";

  const { error } = await supabaseAdmin
    .from("listings")
    .update({ status: newStatus })
    .eq("id", listingId);

  if (error) throw new Error(error.message || "Failed to update listing status");

  revalidatePath("/host/listings");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/explore");

  return newStatus;
}

/** Delete a listing (host only) */
export async function deleteListing(listingId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const { data: listing } = await supabaseAdmin
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabaseAdmin
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (error) throw new Error(error.message || "Failed to delete listing");

  revalidatePath("/host/listings");
}
