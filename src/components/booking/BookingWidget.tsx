"use client";

import { useState, useMemo } from "react";
import { Star, AlertCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { createBooking } from "@/actions/bookings";
import { useRouter } from "next/navigation";
import { useLanguageContext } from "@/lib/i18n/provider";
import { FlutterwaveInline } from "./FlutterwaveInline";

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
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const { t } = useLanguageContext();

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
    if (!checkIn || !checkOut) { setError(t("booking.select_dates")); return; }
    if (nights === 0) { setError(t("booking.checkout_after_checkin")); return; }
    setLoading(true);
    try {
      const result = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      if ("error" in result) { setError(result.error); return; }
      setPendingBookingId(result.data.id as string);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed. Please try again.";
      if (msg === "Unauthorized") {
        router.push("/auth?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }
      setError(msg);
    } finally {
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
          <span className="text-gray-500"> {t("listing.per_night")}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
          <span className="text-sm font-semibold text-gray-900">{t("booking.new_listing")}</span>
        </div>
      </div>

      {/* Date + Guest inputs */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 hover:border-gray-300 transition-colors">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3 hover:bg-gray-50 transition-colors">
            <label htmlFor="booking-checkin" className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
              {t("booking.check_in")}
            </label>
            <input
              id="booking-checkin"
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setError(null);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full text-sm text-gray-900 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] cursor-pointer"
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
              required
            />
          </div>
          <div className="p-3 hover:bg-gray-50 transition-colors">
            <label htmlFor="booking-checkout" className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
              {t("booking.check_out")}
            </label>
            <input
              id="booking-checkout"
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError(null);
              }}
              className="w-full text-sm text-gray-900 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] cursor-pointer"
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
              required
              disabled={!checkIn}
            />
          </div>
        </div>
        <div className="border-t border-gray-200 p-3 hover:bg-gray-50 transition-colors">
          <label htmlFor="booking-guests" className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5 block">
            {t("booking.guests")}
          </label>
          <select
            id="booking-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] cursor-pointer"
          >
            {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} {n !== 1 ? t("common.guests") : t("common.guest")}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-200 mb-4">
        {nights > 0 ? (
          <>
            <div className="flex justify-between text-gray-900 text-sm">
              <span className="underline decoration-gray-400">
                {listing.price_per_night.toLocaleString()} XAF × {nights} {nights !== 1 ? t("common.nights") : t("common.night")}
              </span>
              <span className="font-semibold">{subtotal.toLocaleString()} XAF</span>
            </div>
            <div className="flex justify-between text-gray-900 text-sm">
              <span className="underline decoration-gray-400">{t("booking.service_fee_label")}</span>
              <span className="font-semibold">{serviceFee.toLocaleString()} XAF</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
              <span>{t("booking.total_before_taxes")}</span>
              <span>{total.toLocaleString()} XAF</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-gray-500 text-sm">
            <span className="underline decoration-gray-400">{t("booking.service_fee_label")}</span>
            <span>14%</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Reserve — Step 2: Pay inline */}
      {!pendingBookingId ? (
        <>
          <button
            onClick={handleReserve}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#166534] to-[#15803D] text-white
                       font-bold text-base rounded-xl hover:from-[#15803D] hover:to-[#D97706]
                       transition-all duration-200 mb-4 disabled:opacity-60 disabled:cursor-not-allowed
                       shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            {loading ? t("booking.reserving") : t("booking.reserve")}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t("booking.no_charge_yet")}
          </p>
        </>
      ) : (
        <FlutterwaveInline
          bookingId={pendingBookingId}
          label="Pay Now"
          className="w-full py-4 justify-center text-base"
          onSuccess={() => router.push("/bookings?flw_status=success")}
          onClose={() => setPendingBookingId(null)}
        />
      )}
    </div>
  );
}
