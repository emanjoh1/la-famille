import { getUserListings } from "@/actions/listings";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Your Listings | La Famille",
  description: "Manage your property listings on La Famille",
};

const STATUS_STYLES: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  approved:       "bg-green-100 text-green-800",
  rejected:       "bg-red-100 text-red-800",
  snoozed:        "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Under review",
  approved:       "Live",
  rejected:       "Rejected",
  snoozed:        "Snoozed",
};

export default async function HostListingsPage() {
  const listings = await getUserListings();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#222222]">Your listings</h1>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 px-5 py-3 bg-[#1E3A8A] text-white
                     rounded-xl font-medium hover:bg-[#1E40AF] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="border border-[#DDDDDD] rounded-2xl p-12 text-center">
          <p className="text-2xl font-semibold text-[#222222] mb-3">
            Ready to be a host?
          </p>
          <p className="text-[#717171] mb-8 max-w-sm mx-auto">
            Share your space and earn extra income. Your first listing takes just a few minutes.
          </p>
          <Link
            href="/host/listings/new"
            className="inline-block px-6 py-3 bg-[#1E3A8A] text-white rounded-xl
                       font-medium hover:bg-[#1E40AF] transition-colors"
          >
            Get started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="group cursor-pointer">
              <div className="relative aspect-square mb-3 rounded-2xl overflow-hidden bg-[#F7F7F7]">
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#717171] text-sm">
                    No photos yet
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full
                                ${STATUS_STYLES[listing.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {STATUS_LABELS[listing.status] ?? listing.status}
                  </span>
                </div>

                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Link
                    href={`/host/listings/${listing.id}/edit`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               px-4 py-2 bg-white rounded-xl text-sm font-medium
                               text-[#222222] hover:bg-[#F7F7F7]"
                  >
                    Edit listing
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-[#222222] truncate">{listing.location}</h3>
                <p className="text-[#717171] text-sm truncate">{listing.title}</p>
                <p className="text-[#222222]">
                  <span className="font-semibold">
                    {listing.price_per_night.toLocaleString()} XAF
                  </span>
                  <span className="text-[#717171] font-normal"> / night</span>
                </p>
                {listing.status === "rejected" && listing.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1 line-clamp-2">
                    ⚠ {listing.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
