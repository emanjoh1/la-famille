"use client";

import { useState, useMemo } from "react";
import { Star, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const { nights, subtotal, serviceFee, total } = useMemo(() => {
    const n =
      checkIn && checkOut
        ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)))
        : 0;
    const sub = n * listing.price_per_night;
    const fee = Math.round(sub * 0.14);
    return { nights: n, subtotal: sub, serviceFee: fee, total: sub + fee };
  }, [checkIn, checkOut, listing.price_per_night]);

  const handleReserve = async () => {
    setError(null);
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (nights === 0) {
      setError("Check-out must be after check-in.");
      return;
    }
    setLoading(true);
    try {
      // Create booking
      const result = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch("/api/bookings/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: result.data.id,
          listingTitle: `Booking for ${nights} night${nights !== 1 ? "s" : ""}`,
          totalPrice: total,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url; // Redirect to Stripe checkout
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed. Please try again.";

      // If unauthorized, redirect to login
      if (msg === "Unauthorized") {
        router.push("/auth?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
      {/* Price + Rating */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {listing.price_per_night.toLocaleString()} XAF
          </span>
          <span className="text-gray-500"> / night</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
          <span className="text-sm font-semibold text-gray-900">New</span>
        </div>
      </div>

      {/* Date + Guest inputs */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 hover:border-gray-300 transition-colors">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3 hover:bg-gray-50 transition-colors">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
              Check in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setError(null);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer"
              required
            />
          </div>
          <div className="p-3 hover:bg-gray-50 transition-colors">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
              Check out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError(null);
              }}
              className="w-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer"
              required
              disabled={!checkIn}
            />
          </div>
        </div>
        <div className="border-t border-gray-200 p-3 hover:bg-gray-50 transition-colors">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none cursor-pointer"
          >
            {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} guest{n !== 1 ? "s" : ""}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white
                   font-bold text-base rounded-xl hover:from-[#1E40AF] hover:to-[#D01243]
                   transition-all duration-200 mb-4 disabled:opacity-60 disabled:cursor-not-allowed
                   shadow-md hover:shadow-lg hover:scale-[1.02]"
      >
        {loading ? "Reserving…" : "Reserve"}
      </button>
      <p className="text-center text-sm text-gray-600 mb-4">
        You won&apos;t be charged yet
      </p>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-gray-900 text-sm">
            <span className="underline decoration-gray-400">
              {listing.price_per_night.toLocaleString()} XAF × {nights} night
              {nights !== 1 ? "s" : ""}
            </span>
            <span className="font-semibold">{subtotal.toLocaleString()} XAF</span>
          </div>
          <div className="flex justify-between text-gray-900 text-sm">
            <span className="underline decoration-gray-400">La Famille service fee</span>
            <span className="font-semibold">{serviceFee.toLocaleString()} XAF</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
            <span>Total before taxes</span>
            <span>{total.toLocaleString()} XAF</span>
          </div>
        </div>
      )}
    </div>
  );
}
