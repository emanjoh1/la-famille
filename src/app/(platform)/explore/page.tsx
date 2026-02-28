import { getListings, getSuggestedListings } from "@/actions/listings";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CategoryBar } from "@/components/listings/CategoryBar";
import { LocationBasedListings } from "@/components/listings/LocationBasedListings";
import { ExploreContent } from "@/components/explore/ExploreContent";

export const metadata = {
  title: "Explore Properties | La Famille",
  description:
    "Browse and book unique properties across Cameroon. Find apartments, houses, villas, and more.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    category?: string;
  }>;
}) {
  const { location, checkIn, checkOut, category } = await searchParams;
  const hasFilters = !!(location || checkIn || checkOut || category);
  
  let allListings = hasFilters 
    ? await getListings({
        category: category || undefined,
        location: location || undefined,
      })
    : await getSuggestedListings(12);

  if (checkIn && checkOut) {
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("listing_id")
      .gte("check_out", checkIn)
      .lte("check_in", checkOut)
      .in("status", ["pending", "confirmed"]);

    const bookedIds = new Set(bookings?.map((b) => b.listing_id) || []);
    allListings = allListings.filter((l) => !bookedIds.has(l.id));
  }

  const listings = allListings;

  return (
    <div>
      <CategoryBar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!hasFilters ? (
          <LocationBasedListings fallbackListings={listings} />
        ) : (
          <ExploreContent listings={listings} location={location} hasFilters={hasFilters} />
        )}
      </div>
    </div>
  );
}
