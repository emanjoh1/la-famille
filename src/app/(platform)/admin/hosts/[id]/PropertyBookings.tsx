"use client";

import { useState } from "react";
import Image from "next/image";
import { Home, ChevronDown, ChevronUp, Calendar, Users, DollarSign, Clock } from "lucide-react";

export default function PropertyBookings({ listing }: { listing: any }) {
  const [open, setOpen] = useState(false);

  const confirmed = listing.bookings.filter((b: any) => b.status === "confirmed").length;
  const revenue = listing.bookings
    .filter((b: any) => b.status === "confirmed")
    .reduce((s: number, b: any) => s + Number(b.total_price), 0);

  const mostRecent = listing.bookings[0] ?? null;

  return (
    <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
      {/* Property header */}
      <div className="flex gap-4 p-5">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          {listing.images?.[0] ? (
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-[#222222]">{listing.title}</p>
              <p className="text-sm text-[#717171]">{listing.location}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#717171]">
                <span>{listing.bedrooms} bed · {listing.bathrooms} bath · {listing.max_guests} guests</span>
                <span className="font-medium text-[#222222]">{listing.price_per_night?.toLocaleString()} XAF/night</span>
              </div>
            </div>
            <ListingStatusBadge status={listing.status} />
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 mt-3 text-xs">
            <span className="text-[#717171]">
              <span className="font-semibold text-[#222222]">{listing.bookings.length}</span> booking{listing.bookings.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[#717171]">
              <span className="font-semibold text-green-700">{confirmed}</span> confirmed
            </span>
            <span className="text-[#717171]">
              <span className="font-semibold text-[#222222]">{revenue.toLocaleString()} XAF</span> revenue
            </span>
          </div>

          {/* Most recent booking preview */}
          {mostRecent && !open && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#717171] bg-[#F7F7F7] rounded-lg px-3 py-2">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>
                Latest: {new Date(mostRecent.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                {" → "}
                {new Date(mostRecent.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}
                <BookingStatusDot status={mostRecent.status} />
                {" · "}
                {Number(mostRecent.total_price).toLocaleString()} XAF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle */}
      {listing.bookings.length > 0 && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-center gap-2 py-3 border-t border-[#DDDDDD] text-sm text-[#717171] hover:bg-[#F7F7F7] transition-colors"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {open ? "Hide bookings" : `View all ${listing.bookings.length} booking${listing.bookings.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Bookings list */}
      {open && (
        <div className="border-t border-[#DDDDDD] divide-y divide-[#DDDDDD]">
          {listing.bookings.map((booking: any) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const checkIn  = new Date(booking.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const checkOut = new Date(booking.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const bookedOn = new Date(booking.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#717171]">Check-in → Check-out</p>
          <p className="font-medium text-[#222222]">{checkIn} → {checkOut}</p>
        </div>
        <div>
          <p className="text-xs text-[#717171]">Guests · Nights</p>
          <p className="font-medium text-[#222222]">{booking.guests} guests · {booking.nights ?? "—"} nights</p>
        </div>
        <div>
          <p className="text-xs text-[#717171]">Total</p>
          <p className="font-medium text-[#222222]">{Number(booking.total_price).toLocaleString()} XAF</p>
        </div>
        <div>
          <p className="text-xs text-[#717171]">Booked on</p>
          <p className="font-medium text-[#222222]">{bookedOn}</p>
        </div>
      </div>
      <BookingStatusBadge status={booking.status} />
    </div>
  );
}

function BookingStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "text-green-700 font-semibold",
    pending:   "text-amber-700 font-semibold",
    cancelled: "text-red-600 font-semibold",
  };
  return <span className={colors[status] ?? "text-gray-600"}>{status}</span>;
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending:   "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ListingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved:       "bg-green-100 text-green-800",
    pending_review: "bg-amber-100 text-amber-800",
    rejected:       "bg-red-100 text-red-800",
    snoozed:        "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = {
    approved: "Approved", pending_review: "Pending", rejected: "Rejected", snoozed: "Snoozed",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}
