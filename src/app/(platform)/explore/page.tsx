import { getListings } from "@/actions/listings";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ListingCard } from "@/components/listings/ListingCard";
import { CategoryBar } from "@/components/listings/CategoryBar";

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
  let allListings = await getListings({
    category: category || undefined,
    location: location || undefined,
  });

  // Filter by date availability
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#222222]">
            {location ? `Stays in ${location}` : "Stays in Cameroon"}
          </h1>
          {listings.length > 0 && (
            <p className="text-[#717171] mt-2">
              {listings.length} propert{listings.length !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#717171]">No properties found</p>
            <p className="text-[#717171] mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                location={listing.location}
                title={listing.title}
                bedrooms={listing.bedrooms}
                bathrooms={listing.bathrooms}
                price_per_night={listing.price_per_night}
                images={listing.images}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
