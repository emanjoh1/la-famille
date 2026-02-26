import { getListing } from "@/actions/listings";
import { getListingReviews, getAverageRating } from "@/actions/reviews";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Star,
  Wifi,
  AirVent,
  Car,
  Waves,
  CookingPot,
  Tv,
  Zap,
  Droplets,
  ShieldCheck,
  Fence,
  Flame,
  WashingMachine,
} from "lucide-react";
import { AMENITIES } from "@/lib/utils/constants";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ReviewList } from "@/components/reviews/ReviewList";
import { SaveButton } from "@/components/listings/SaveButton";
import { ShareButton } from "@/components/listings/ShareButton";
import type { LucideIcon } from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  ac: AirVent,
  parking: Car,
  pool: Waves,
  kitchen: CookingPot,
  washer: WashingMachine,
  tv: Tv,
  generator: Zap,
  water_tank: Droplets,
  security_guard: ShieldCheck,
  gated: Fence,
  hot_water: Flame,
};

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
              {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
              {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? "s" : ""} ·
              Up to {listing.max_guests} guest
              {listing.max_guests !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Host info */}
          <div className="py-6 border-b border-[#DDDDDD]">
            <Link href={`/host/${listing.user_id}`} className="flex items-center gap-4 hover:bg-gray-50 p-4 rounded-xl transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">H</span>
              </div>
              <div>
                <p className="font-medium text-[#222222]">
                  Hosted by La Famille host
                </p>
                <p className="text-sm text-[#717171]">
                  View host profile →
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
          {amenityDetails.length > 0 && (
            <div className="py-6 border-b border-[#DDDDDD]">
              <h3 className="text-xl font-semibold text-[#222222] mb-6">
                What this place offers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {amenityDetails.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.key] ?? Wifi;
                  return (
                    <div
                      key={amenity.key}
                      className="flex items-center gap-4"
                    >
                      <Icon className="w-5 h-5 text-[#222222] flex-shrink-0" />
                      <span className="text-[#222222]">
                        {amenity.label_en}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                    · {ratingData.count} review
                    {ratingData.count !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <span className="text-xl font-semibold text-[#222222]">
                  New
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
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD]
                      px-6 py-4 flex items-center justify-between z-50"
      >
        <div>
          <span className="font-semibold text-[#222222]">
            {listing.price_per_night.toLocaleString()} XAF
          </span>
          <span className="text-[#717171]"> / night</span>
        </div>
        <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E40AF] transition-colors">
          Reserve
        </button>
      </div>
    </div>
  );
}
