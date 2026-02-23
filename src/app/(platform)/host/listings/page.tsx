import { getUserListings } from "@/actions/listings";
import Link from "next/link";
import Image from "next/image";

export default async function HostListingsPage() {
  const listings = await getUserListings();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          href="/host/listings/new"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Listing
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="text-gray-600">No listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow">
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
                  {listing.price_per_night.toLocaleString()} XAF/night
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
