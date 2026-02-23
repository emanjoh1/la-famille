"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  };

  const { data, error } = await supabaseAdmin
    .from("listings")
    .insert(listing)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/explore");
  revalidatePath("/host/listings");
  return data;
}

export async function getListings() {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getListing(id: string) {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserListings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
