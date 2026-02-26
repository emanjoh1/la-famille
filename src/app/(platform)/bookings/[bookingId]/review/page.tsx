import { ReviewForm } from "@/components/reviews/ReviewForm";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/auth");

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("*, listings(*)")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();

  if (!booking) redirect("/bookings");

  const { data: existingReview } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .single();

  if (existingReview) redirect("/bookings");

  const listing = booking.listings as any;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
      <p className="text-gray-600 mb-8">Share your experience at {listing.title}</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-2">{listing.title}</h3>
        <p className="text-gray-600">{listing.location}</p>
      </div>

      <ReviewForm bookingId={bookingId} listingId={listing.id} />
    </div>
  );
}
