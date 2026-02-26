"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getHostProfile(hostId: string) {
  const clerk = await clerkClient();
  
  try {
    const user = await clerk.users.getUser(hostId);
    
    const { data: listings } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("user_id", hostId)
      .eq("status", "approved");

    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("overall_rating")
      .in("listing_id", (listings || []).map(l => l.id));

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
      ? reviews!.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews
      : 0;

    return {
      id: hostId,
      name: user.firstName || "Host",
      avatar: user.imageUrl,
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      listings: listings || [],
      totalListings: listings?.length || 0,
      totalReviews,
      averageRating,
    };
  } catch (error) {
    console.error("Error fetching host profile:", error);
    throw new Error("Host not found");
  }
}
