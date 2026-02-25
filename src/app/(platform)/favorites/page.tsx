import { getUserFavorites } from "@/actions/favorites";
import { ListingCard } from "@/components/listings/ListingCard";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Wishlists | La Famille",
  description: "Your saved properties on La Famille",
};

export default async function FavoritesPage() {
  const favorites = await getUserFavorites();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-[#222222] mb-8">Wishlists</h1>

      {favorites.length === 0 ? (
        <div className="border border-[#DDDDDD] rounded-2xl p-12 text-center">
          <Heart className="w-10 h-10 text-[#717171] mx-auto mb-4" />
          <p className="text-2xl font-semibold text-[#222222] mb-3">
            Create your first wishlist
          </p>
          <p className="text-[#717171] mb-8 max-w-sm mx-auto">
            As you search, tap the heart icon to save your favourite places to a wishlist
          </p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 border border-[#222222] rounded-xl
                       text-[#222222] font-medium hover:bg-[#F7F7F7] transition-colors"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            const listing = Array.isArray(fav.listings) ? fav.listings[0] : fav.listings;
            return (
              <ListingCard
                key={fav.id}
                id={listing.id}
                location={listing.location}
                title={listing.title}
                bedrooms={listing.bedrooms}
                bathrooms={listing.bathrooms}
                price_per_night={listing.price_per_night}
                images={listing.images}
                isFavorited={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
