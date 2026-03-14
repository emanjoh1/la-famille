"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  const supabase = createServerSupabaseClient();

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
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
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
