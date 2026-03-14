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

export async function submitKYC(formData: {
  full_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
  id_card_front_url: string;
  id_card_back_url: string;
  selfie_url: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("host_kyc")
    .insert({
      user_id: userId,
      ...formData,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/host/listings");
  return data;
}

export async function getKYCStatus(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("host_kyc")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") return null;

    return data;
  } catch {
    return null;
  }
}

export async function getAllKYCSubmissionsAdmin() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("host_kyc")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPendingKYCCount() {
  await assertAdmin();
  const { count, error } = await supabaseAdmin
    .from("host_kyc")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}

export async function approveKYC(kycId: string) {
  const adminId = await assertAdmin();
  const { error } = await supabaseAdmin
    .from("host_kyc")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq("id", kycId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/kyc");
}

export async function rejectKYC(kycId: string, reason?: string) {
  const adminId = await assertAdmin();
  const { error } = await supabaseAdmin
    .from("host_kyc")
    .update({
      status: "rejected",
      rejection_reason: reason ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", kycId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/kyc");
}
