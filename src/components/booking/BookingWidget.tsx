"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { differenceInDays } from "date-fns";
import { createBooking } from "@/actions/bookings";
import { useRouter } from "next/navigation";

interface BookingWidgetProps {
  listing: {
    id: string;
    price_per_night: number;
    max_guests: number;
  };
}

export function BookingWidget({ listing }: BookingWidgetProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)))
      : 0;
  const subtotal = nights * listing.price_per_night;
  const serviceFee = Math.round(subtotal * 0.14);
  const total = subtotal + serviceFee;

  const handleReserve = async () => {
    if (!checkIn || !checkOut || nights === 0) return;
    setLoading(true);
    try {
      await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: total,
      });
      router.push("/bookings");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6 shadow-lg">
      {/* Price + Rating */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-semibold text-[#222222]">
            {listing.price_per_night.toLocaleString()} XAF
          </span>
          <span className="text-[#717171]"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
          <span className="font-medium text-[#222222]">4.92</span>
          <span className="text-[#717171]">· 12 reviews</span>
        </div>
      </div>

      {/* Date + Guest inputs */}
      <div className="border border-[#DDDDDD] rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-[#DDDDDD]">
          <div className="p-3">
            <p className="text-xs font-semibold text-[#222222] uppercase tracking-wide mb-1">
              Check in
            </p>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm text-[#717171] bg-transparent focus:outline-none"
            />
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-[#222222] uppercase tracking-wide mb-1">
              Check out
            </p>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm text-[#717171] bg-transparent focus:outline-none"
            />
          </div>
        </div>
        <div className="border-t border-[#DDDDDD] p-3">
          <p className="text-xs font-semibold text-[#222222] uppercase tracking-wide mb-1">
            Guests
          </p>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm text-[#717171] bg-transparent focus:outline-none"
          >
            {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={loading || nights === 0}
        className="w-full py-3.5 bg-gradient-to-r from-[#E61E4D] to-[#FF385C] text-white
                   font-semibold rounded-xl hover:from-[#D01243] hover:to-[#E31C5F]
                   transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Reserving..." : "Reserve"}
      </button>
      <p className="text-center text-sm text-[#717171] mb-4">You won&apos;t be charged yet</p>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between text-[#222222] text-sm">
            <span className="underline">
              {listing.price_per_night.toLocaleString()} XAF × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span>{subtotal.toLocaleString()} XAF</span>
          </div>
          <div className="flex justify-between text-[#222222] text-sm">
            <span className="underline">La Famille service fee</span>
            <span>{serviceFee.toLocaleString()} XAF</span>
          </div>
          <div className="border-t border-[#DDDDDD] pt-3 flex justify-between font-semibold text-[#222222]">
            <span>Total before taxes</span>
            <span>{total.toLocaleString()} XAF</span>
          </div>
        </div>
      )}
    </div>
  );
}
