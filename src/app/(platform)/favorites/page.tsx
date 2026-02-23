import { getUserFavorites } from "@/actions/favorites";
import Link from "next/link";
import Image from "next/image";

export default async function FavoritesPage() {
  const favorites = await getUserFavorites();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/listings/${fav.listings.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="relative h-48 bg-gray-200 rounded-t-lg">
                {fav.listings.images[0] && (
                  <Image
                    src={fav.listings.images[0]}
                    alt={fav.listings.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {fav.listings.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {fav.listings.location}
                </p>
                <p className="text-blue-600 font-bold">
                  {fav.listings.price_per_night.toLocaleString()} XAF/night
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
