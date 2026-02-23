import { getListings } from "@/actions/listings";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export default async function ExplorePage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-8">Stays in Cameroon</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square mb-3 rounded-xl overflow-hidden">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <button className="absolute top-3 right-3 p-2 hover:scale-110 transition">
                <Heart className="w-6 h-6 text-white fill-black/50" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 truncate">
                  {listing.location}
                </h3>
              </div>
              <p className="text-gray-600 text-sm truncate">{listing.title}</p>
              <p className="text-gray-600 text-sm">
                {listing.bedrooms} beds · {listing.bathrooms} baths
              </p>
              <p className="font-semibold">
                <span className="text-gray-900">
                  {listing.price_per_night.toLocaleString()} XAF
                </span>
                <span className="text-gray-600 font-normal"> / night</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
