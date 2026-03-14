"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;

  if (role !== "admin") throw new Error("Forbidden: admin only");
  return userId;
}

// ─── Analytics ─────────────────────────────────────────────────

export async function getAdminAnalytics() {
  await assertAdmin();

  const [bookingsData, listingsData, profilesData, hostData] = await Promise.all([
    supabaseAdmin.from("bookings").select("total_price, status, created_at"),
    supabaseAdmin.from("listings").select("status, created_at, user_id"),
    supabaseAdmin.from("profiles").select("id", { count: "exact" }),
    supabaseAdmin.from("listings").select("user_id"),
  ]);

  const bookings = bookingsData.data || [];
  const listings = listingsData.data || [];
  const totalUsers = profilesData.count || 0;
  const uniqueHosts = new Set((hostData.data || []).map((l) => l.user_id)).size;

  // Calculate metrics
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  const platformCommission = Math.round(totalRevenue * 0.14);

  const bookingStats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const listingStats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending_review").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
    snoozed: listings.filter((l) => l.status === "snoozed").length,
  };

  const userStats = {
    total: totalUsers,
    hosts: uniqueHosts,
    admins: 1,
    guests: Math.max(0, totalUsers - uniqueHosts),
  };

  return {
    totalRevenue,
    platformCommission,
    bookingStats,
    listingStats,
    userStats,
  };
}

// ─── Bookings Management ───────────────────────────────────────

export async function getAllBookingsAdmin() {
  await assertAdmin();

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, listings(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
  return data || [];
}

export async function cancelBookingAdmin(bookingId: string, reason?: string) {
  await assertAdmin();

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) throw new Error(error.message || "Failed to cancel booking");

  revalidatePath("/admin/bookings");
  revalidatePath("/bookings");
}

// ─── User Management ───────────────────────────────────────────

export async function getAllUsers() {
  await assertAdmin();

  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ limit: 500 });

  return users.data.map((user) => ({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    role: (user.publicMetadata?.role as string) || "guest",
    createdAt: user.createdAt,
    imageUrl: user.imageUrl,
  }));
}

export async function updateUserRole(userId: string, role: "guest" | "host" | "admin") {
  await assertAdmin();

  const clerk = await clerkClient();
  await clerk.users.updateUser(userId, {
    publicMetadata: { role },
  });

  revalidatePath("/admin/users");
}

export async function banUser(userId: string) {
  await assertAdmin();

  const clerk = await clerkClient();
  await clerk.users.banUser(userId);

  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  await assertAdmin();

  const clerk = await clerkClient();
  await clerk.users.unbanUser(userId);

  revalidatePath("/admin/users");
}

// ─── Hosts Overview ───────────────────────────────────────────

export async function getAllHostsAdmin() {
  await assertAdmin();

  const clerk = await clerkClient();

  const [listingsData, kycData] = await Promise.all([
    supabaseAdmin.from("listings").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("host_kyc").select("*"),
  ]);

  const listings = listingsData.data || [];
  const kycs = kycData.data || [];

  // Derive host IDs from listings + KYC submissions (source of truth)
  const hostIds = Array.from(
    new Set([
      ...listings.map((l) => l.user_id),
      ...kycs.map((k) => k.user_id),
    ])
  );

  if (hostIds.length === 0) return [];

  // Fetch Clerk profiles for each host id
  const clerkUsers = await Promise.all(
    hostIds.map((id) => clerk.users.getUser(id).catch(() => null))
  );

  return clerkUsers
    .filter(Boolean)
    .map((user) => ({
      id: user!.id,
      email: user!.emailAddresses[0]?.emailAddress ?? "",
      firstName: user!.firstName ?? "",
      lastName: user!.lastName ?? "",
      imageUrl: user!.imageUrl,
      createdAt: new Date(user!.createdAt).toISOString(),
      banned: user!.banned,
      listings: listings.filter((l) => l.user_id === user!.id),
      kyc: kycs.find((k) => k.user_id === user!.id) ?? null,
    }));
}

// ─── Host Detail ──────────────────────────────────────────────

export async function getHostDetailAdmin(hostId: string) {
  await assertAdmin();

  const clerk = await clerkClient();

  const [clerkUser, listingsData, kycData] = await Promise.all([
    clerk.users.getUser(hostId),
    supabaseAdmin.from("listings").select("*").eq("user_id", hostId).order("created_at", { ascending: false }),
    supabaseAdmin.from("host_kyc").select("*").eq("user_id", hostId).single(),
  ]);

  const listings = listingsData.data || [];
  const listingIds = listings.map((l) => l.id);

  const bookingsData = listingIds.length > 0
    ? await supabaseAdmin
        .from("bookings")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const bookings = bookingsData.data || [];

  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    firstName: clerkUser.firstName ?? "",
    lastName: clerkUser.lastName ?? "",
    imageUrl: clerkUser.imageUrl,
    createdAt: new Date(clerkUser.createdAt).toISOString(),
    banned: clerkUser.banned,
    kyc: kycData.data ?? null,
    listings: listings.map((listing) => ({
      ...listing,
      bookings: bookings
        .filter((b) => b.listing_id === listing.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    })),
  };
}

// ─── Financial Reports ─────────────────────────────────────────

export async function getFinancialReport(startDate?: string, endDate?: string) {
  await assertAdmin();

  let query = supabaseAdmin
    .from("bookings")
    .select("total_price, status, created_at, nights, listings(title, user_id)")
    .eq("status", "confirmed");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching financial report:", error);
    return { bookings: [], summary: { totalRevenue: 0, platformCommission: 0, hostPayouts: 0 } };
  }

  const bookings = data || [];
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const platformCommission = Math.round(totalRevenue * 0.14);
  const hostPayouts = totalRevenue - platformCommission;

  return {
    bookings,
    summary: {
      totalRevenue,
      platformCommission,
      hostPayouts,
      bookingCount: bookings.length,
    },
  };
}
