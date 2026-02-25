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

  const [bookingsData, listingsData, usersData] = await Promise.all([
    supabaseAdmin.from("bookings").select("total_price, status, created_at"),
    supabaseAdmin.from("listings").select("status, created_at"),
    (async () => {
      const clerk = await clerkClient();
      return clerk.users.getUserList({ limit: 500 });
    })(),
  ]);

  const bookings = bookingsData.data || [];
  const listings = listingsData.data || [];
  const users = usersData.data || [];

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
    total: users.length,
    hosts: users.filter((u) => u.publicMetadata?.role === "host").length,
    admins: users.filter((u) => u.publicMetadata?.role === "admin").length,
    guests: users.filter((u) => !u.publicMetadata?.role || u.publicMetadata?.role === "guest").length,
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
