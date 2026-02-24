import { getListings } from "@/actions/listings";
import { CategoryBar } from "@/components/listings/CategoryBar";
import { ListingCard } from "@/components/listings/ListingCard";

export default async function ExplorePage() {
  const listings = await getListings();

  return (
    <div>
      <CategoryBar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold text-[#222222] mb-2">No listings yet</p>
            <p className="text-[#717171]">Check back soon for available properties in Cameroon</p>
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
