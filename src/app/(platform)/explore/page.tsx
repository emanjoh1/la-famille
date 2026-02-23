import { getListings } from "@/actions/listings";
import Link from "next/link";
import Image from "next/image";

export default async function ExplorePage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="relative h-48 bg-gray-200 rounded-t-lg">
              {listing.images[0] && (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
              <p className="text-blue-600 font-bold">
                ${listing.price_per_night}/night
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
