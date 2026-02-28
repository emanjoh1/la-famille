import { getHostProfile } from "@/actions/hosts";
import { getHostReviews } from "@/actions/reviews";
import { Star, MapPin, Home, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function HostProfilePage({ params }: { params: Promise<{ hostId: string }> }) {
  const { hostId } = await params;
  const [profile, reviews] = await Promise.all([
    getHostProfile(hostId),
    getHostReviews(hostId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-200 to-orange-200 flex-shrink-0">
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-white font-bold">
                {profile.name[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[#166534] text-[#166534]" />
                <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                <span>({profile.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                <span>Joined {profile.joinedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gradient-to-br from-green-50 to-orange-50 rounded-xl">
                <div className="flex items-center gap-2 text-[#166534] mb-1">
                  <Home className="w-5 h-5" />
                  <span className="font-bold text-2xl">{profile.totalListings}</span>
                </div>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-2xl">{profile.totalReviews}</span>
                </div>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{profile.name}'s Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {profile.listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="relative h-48 bg-gray-200">
              {listing.images?.[0] && (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 truncate">{listing.title}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4" />
                {listing.location}
              </p>
              <p className="font-semibold text-gray-900">
                {listing.price_per_night.toLocaleString()} XAF <span className="font-normal text-gray-600">/ night</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {reviews.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.overall_rating ? "fill-[#166534] text-[#166534]" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
