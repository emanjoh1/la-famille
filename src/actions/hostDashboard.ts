"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function assertHost() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// ─── Dashboard data ────────────────────────────────────────────

export async function getHostDashboardData() {
  const userId = await assertHost();

  const { data: listings } = await supabaseAdmin
    .from("listings")
    .select("id, title, images, location, price_per_night, status, bedrooms, bathrooms, max_guests")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const listingIds = (listings || []).map((l) => l.id);

  const [bookingsRes, blockedRes] = await Promise.all([
    listingIds.length > 0
      ? supabaseAdmin
          .from("bookings")
          .select("*")
          .in("listing_id", listingIds)
          .order("check_in", { ascending: true })
      : { data: [] },
    listingIds.length > 0
      ? supabaseAdmin
          .from("listing_blocked_dates")
          .select("*")
          .in("listing_id", listingIds)
      : { data: [] },
  ]);

  const bookings = bookingsRes.data || [];
  const blockedDates = blockedRes.data || [];

  // Fetch guest info for all bookings
  const guestIds = [...new Set(bookings.map((b) => b.user_id))];
  const clerk = await clerkClient();
  const guestProfiles = await Promise.all(
    guestIds.map((id) => clerk.users.getUser(id).catch(() => null))
  );
  const guestMap = Object.fromEntries(
    guestProfiles.filter(Boolean).map((u) => [
      u!.id,
      {
        name: `${u!.firstName ?? ""} ${u!.lastName ?? ""}`.trim() || "Guest",
        email: u!.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: u!.imageUrl,
      },
    ])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedBookings = bookings.map((b) => ({
    ...b,
    guest: guestMap[b.user_id] ?? { name: "Guest", email: "", imageUrl: "" },
    listing: listings?.find((l) => l.id === b.listing_id) ?? null,
  }));

  const upcoming = enrichedBookings.filter(
    (b) => new Date(b.check_in) >= today && b.status !== "cancelled"
  );
  const inProgress = enrichedBookings.filter(
    (b) =>
      new Date(b.check_in) <= today &&
      new Date(b.check_out) > today &&
      b.status !== "cancelled"
  );
  const history = enrichedBookings.filter(
    (b) => new Date(b.check_out) <= today || b.status === "cancelled"
  ).sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

  // Reviews for all host listings
  const reviewsRes = listingIds.length > 0
    ? await supabaseAdmin
        .from("reviews")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const reviews = reviewsRes.data || [];

  // Fetch reviewer profiles
  const reviewerIds = [...new Set(reviews.map((r) => r.user_id))];
  const reviewerProfiles = await Promise.all(
    reviewerIds.map((id) => clerk.users.getUser(id as string).catch(() => null))
  );
  const reviewerMap = Object.fromEntries(
    reviewerProfiles.filter(Boolean).map((u) => [
      u!.id,
      {
        name: `${u!.firstName ?? ""} ${u!.lastName ?? ""}`.trim() || "Guest",
        imageUrl: u!.imageUrl,
      },
    ])
  );

  const enrichedReviews = reviews.map((r) => ({
    ...r,
    reviewer: reviewerMap[r.user_id] ?? { name: "Guest", imageUrl: "" },
    listing: listings?.find((l) => l.id === r.listing_id) ?? null,
  }));

  // Earnings by month — confirmed bookings only
  const confirmedBookings = [...enrichedBookings].filter((b) => b.status === "confirmed");
  const earningsByMonth: Record<string, number> = {};
  confirmedBookings.forEach((b) => {
    const key = b.check_in.slice(0, 7); // "YYYY-MM"
    earningsByMonth[key] = (earningsByMonth[key] ?? 0) + Number(b.total_price);
  });

  return {
    listings: listings || [],
    upcoming,
    inProgress,
    history,
    blockedDates: blockedDates.map((bd) => ({
      ...bd,
      listing: listings?.find((l) => l.id === bd.listing_id) ?? null,
    })),
    reviews: enrichedReviews,
    earningsByMonth,
    confirmedBookings,
  };
}

// ─── Price update ──────────────────────────────────────────────

export async function updateListingPrice(listingId: string, price: number) {
  const userId = await assertHost();

  const { data: listing } = await supabaseAdmin
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== userId) throw new Error("Unauthorized");
  if (isNaN(price) || price < 1000) throw new Error("Minimum price is 1,000 XAF");

  const { error } = await supabaseAdmin
    .from("listings")
    .update({ price_per_night: price, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) throw new Error(error.message);

  revalidatePath("/host/dashboard");
  revalidatePath("/host/listings");
}

// ─── Blocked dates ─────────────────────────────────────────────

export async function blockDates(listingId: string, startDate: string, endDate: string, reason?: string) {
  const userId = await assertHost();

  const { data: listing } = await supabaseAdmin
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== userId) throw new Error("Unauthorized");

  if (new Date(endDate) < new Date(startDate)) throw new Error("End date must be after start date");

  const { error } = await supabaseAdmin
    .from("listing_blocked_dates")
    .insert({ listing_id: listingId, start_date: startDate, end_date: endDate, reason: reason || null });

  if (error) throw new Error(error.message);

  revalidatePath("/host/dashboard");
}

export async function updateBlockedDates(blockedDateId: string, startDate: string, endDate: string, reason?: string) {
  const userId = await assertHost();

  const { data } = await supabaseAdmin
    .from("listing_blocked_dates")
    .select("id, listings(user_id)")
    .eq("id", blockedDateId)
    .single();

  const owner = (data?.listings as any)?.user_id;
  if (!data || owner !== userId) throw new Error("Unauthorized");
  if (new Date(endDate) < new Date(startDate)) throw new Error("End date must be after start date");

  const { error } = await supabaseAdmin
    .from("listing_blocked_dates")
    .update({ start_date: startDate, end_date: endDate, reason: reason || null })
    .eq("id", blockedDateId);

  if (error) throw new Error(error.message);
  revalidatePath("/host/dashboard");
}

export async function unblockDates(blockedDateId: string) {
  const userId = await assertHost();

  // Verify ownership via join
  const { data } = await supabaseAdmin
    .from("listing_blocked_dates")
    .select("id, listings(user_id)")
    .eq("id", blockedDateId)
    .single();

  const owner = (data?.listings as any)?.user_id;
  if (!data || owner !== userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from("listing_blocked_dates")
    .delete()
    .eq("id", blockedDateId);

  if (error) throw new Error(error.message);

  revalidatePath("/host/dashboard");
}
