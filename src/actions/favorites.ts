"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(listingId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: existing } = await supabaseAdmin
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    await supabaseAdmin.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabaseAdmin
      .from("favorites")
      .insert({ user_id: userId, listing_id: listingId });
  }

  revalidatePath("/favorites");
  revalidatePath("/explore");
}

export async function getUserFavorites() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("favorites")
    .select("*, listings(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
  return data || [];
}
