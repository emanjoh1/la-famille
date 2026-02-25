import { getUserBookings } from "@/actions/bookings";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Trips | La Famille",
  description: "View your upcoming and past trips on La Famille",
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-gray-100 text-[#717171] border border-[#DDDDDD]",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-[#222222] mb-8">Trips</h1>

      {bookings.length === 0 ? (
        <div className="border border-[#DDDDDD] rounded-2xl p-12 text-center">
          <p className="text-2xl font-semibold text-[#222222] mb-3">
            No trips booked... yet!
          </p>
          <p className="text-[#717171] mb-8 max-w-sm mx-auto">
            Time to dust off your bags and start planning your next adventure
          </p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 border border-[#222222] rounded-xl
                       text-[#222222] font-medium hover:bg-[#F7F7F7] transition-colors"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/listings/${booking.listing_id}`}
              className="flex gap-6 p-4 border border-[#DDDDDD] rounded-2xl
                         hover:shadow-md transition-shadow group"
            >
              <div className="relative w-40 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                {booking.listings?.images?.[0] ? (
                  <Image
                    src={booking.listings.images[0]}
                    alt={booking.listings.title ?? "Listing"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                ) : (
                  <span className="text-3xl">🏠</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 gap-4">
                  <h3 className="font-semibold text-[#222222] text-lg truncate">
                    {booking.listings?.title ?? "Listing"}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      STATUS_STYLES[booking.status ?? "pending"] ?? STATUS_STYLES.pending
                    }`}
                  >
                    {booking.status
                      ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                      : "Pending"}
                  </span>
                </div>
                <p className="text-[#717171] text-sm mb-3">{booking.listings?.location ?? ""}</p>
                <p className="text-sm text-[#222222]">
                  {booking.check_in
                    ? format(new Date(booking.check_in), "MMM d")
                    : "—"}{" "}
                  –{" "}
                  {booking.check_out
                    ? format(new Date(booking.check_out), "MMM d, yyyy")
                    : "—"}
                </p>
                <p className="text-sm font-semibold text-[#222222] mt-1">
                  {Number(booking.total_price ?? 0).toLocaleString()} XAF
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
