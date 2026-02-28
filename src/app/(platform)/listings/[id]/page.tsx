import { getListing } from "@/actions/listings";
import { getListingReviews, getAverageRating } from "@/actions/reviews";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { AMENITIES } from "@/lib/utils/constants";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ReviewList } from "@/components/reviews/ReviewList";
import { SaveButton } from "@/components/listings/SaveButton";
import { ShareButton } from "@/components/listings/ShareButton";
import { MobileBookingButton } from "./ListingClient";
import { LocationMap } from "@/components/map/LocationMap";
import { AmenityList } from "@/components/listings/AmenityList";
import { T } from "@/components/i18n/T";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await getListing(id);
    return {
      title: `${listing.title} | La Famille`,
      description: listing.description?.slice(0, 160),
      openGraph: {
        images: listing.images?.[0] ? [listing.images[0]] : [],
      },
    };
  } catch {
    return { title: "Listing | La Famille" };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let listing;
  try {
    listing = await getListing(id);
  } catch {
    notFound();
  }

  const [reviews, ratingData] = await Promise.all([
    getListingReviews(id).catch(() => []),
    getAverageRating(id).catch(() => null),
  ]);

  // Check if user has saved this listing
  const { userId } = await auth();
  let isSaved = false;
  if (userId) {
    const { data } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", id)
      .single();
    isSaved = !!data;
  }

  // Fetch host info
  let hostName = "Host";
  let hostAvatar: string | null = null;
  try {
    const clerk = await clerkClient();
    const hostUser = await clerk.users.getUser(listing.user_id);
    hostName = hostUser.fullName || hostUser.firstName || "Host";
    hostAvatar = hostUser.imageUrl || null;
  } catch {
    // fallback to defaults
  }

  const amenityDetails = AMENITIES.filter((a) =>
    listing.amenities?.includes(a.key)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title row */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#222222] flex-1 pr-4">
          {listing.title}
        </h1>
        <div className="flex items-center gap-4 flex-shrink-0">
          <ShareButton title={listing.title} />
          <SaveButton listingId={id} initialSaved={isSaved} />
        </div>
      </div>

      {/* Photo gallery with swipe / lightbox */}
      <ImageGallery images={listing.images ?? []} title={listing.title} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
        {/* LEFT */}
        <div>
          {/* Location + quick stats */}
          <div className="pb-6 border-b border-[#DDDDDD]">
            <h2 className="text-xl font-semibold text-[#222222] mb-1">
              {listing.location}
            </h2>
            <p className="text-[#717171]">
              <T k="listing.bedrooms" vars={{ count: listing.bedrooms }} /> ·{" "}
              <T k="listing.bathrooms" vars={{ count: listing.bathrooms }} /> ·{" "}
              <T k="listing.guests" vars={{ count: listing.max_guests }} />
            </p>
          </div>

          {/* Host info */}
          <div className="py-6 border-b border-[#DDDDDD]">
            <Link href={`/host/${listing.user_id}`} className="flex items-center gap-4 hover:bg-gray-50 p-4 rounded-xl transition-colors">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 flex-shrink-0 overflow-hidden">
                {hostAvatar ? (
                  <Image src={hostAvatar} alt={hostName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                    {hostName[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-[#222222]">
                  <T k="listing.hosted_by" vars={{ name: hostName }} />
                </p>
                <p className="text-sm text-[#717171]">
                  <T k="listing.contact_host" /> →
                </p>
              </div>
            </Link>
          </div>

          {/* Description */}
          <div className="py-6 border-b border-[#DDDDDD]">
            <p className="text-[#222222] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <AmenityList amenities={amenityDetails} />

          {/* Location Map */}
          <LocationMap location={listing.location} />

          {/* Reviews */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 fill-[#222222] text-[#222222]" />
              {ratingData ? (
                <>
                  <span className="text-xl font-semibold text-[#222222]">
                    {ratingData.average.toFixed(2)}
                  </span>
                  <span className="text-[#222222]">
                    · {ratingData.count} <T k="listing.reviews" />
                  </span>
                </>
              ) : (
                <span className="text-xl font-semibold text-[#222222]">
                  <T k="booking.new_listing" />
                </span>
              )}
            </div>
            <ReviewList reviews={reviews} />
          </div>
        </div>

        {/* RIGHT: Sticky booking widget */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <BookingWidget listing={listing} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <MobileBookingButton listing={listing} />
    </div>
  );
}
