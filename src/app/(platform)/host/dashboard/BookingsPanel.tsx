"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, User, Home, Calendar, Users, DollarSign } from "lucide-react";

interface Props {
  inProgress?: any[];
  upcoming?: any[];
  history?: any[];
}

export default function BookingsPanel({ inProgress, upcoming, history }: Props) {
  if (history !== undefined) {
    return (
      <div>
        {history.length === 0 ? (
          <Empty message="No past bookings yet." />
        ) : (
          <div className="space-y-3">
            {history.map((b: any) => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* In progress */}
      <section>
        <h2 className="text-sm font-semibold text-[#222222] uppercase tracking-wide mb-4">
          Currently Hosting ({inProgress?.length ?? 0})
        </h2>
        {!inProgress?.length ? (
          <Empty message="No guests currently staying." />
        ) : (
          <div className="space-y-3">
            {inProgress.map((b: any) => <BookingCard key={b.id} booking={b} highlight />)}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-[#222222] uppercase tracking-wide mb-4">
          Upcoming ({upcoming?.length ?? 0})
        </h2>
        {!upcoming?.length ? (
          <Empty message="No upcoming bookings." />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b: any) => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({ booking: b, highlight }: { booking: any; highlight?: boolean }) {
  const [open, setOpen] = useState(false);

  const checkIn  = new Date(b.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const checkOut = new Date(b.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const bookedOn = new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className={`border rounded-2xl overflow-hidden ${highlight ? "border-[#166534]" : "border-[#DDDDDD]"}`}>
      {highlight && (
        <div className="bg-[#166534] text-white text-xs font-semibold px-4 py-1.5">
          🏠 Guest currently staying
        </div>
      )}

      {/* Summary row */}
      <div className="flex items-center gap-4 p-4">
        {/* Guest avatar */}
        <div className="flex-shrink-0">
          {b.guest?.imageUrl ? (
            <img src={b.guest.imageUrl} alt={b.guest.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#222222]">{b.guest?.name}</p>
            <StatusBadge status={b.status} />
          </div>
          <p className="text-sm text-[#717171] truncate">{b.listing?.title}</p>
          <p className="text-xs text-[#717171]">{checkIn} → {checkOut} · {b.nights} night{b.nights !== 1 ? "s" : ""}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-semibold text-[#222222]">{Number(b.total_price).toLocaleString()} XAF</p>
          <p className="text-xs text-[#717171]">{b.guests} guest{b.guests !== 1 ? "s" : ""}</p>
        </div>

        <button onClick={() => setOpen((o) => !o)} className="text-[#717171] hover:text-[#222222] ml-2">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-[#DDDDDD] p-4 bg-[#F7F7F7] grid sm:grid-cols-2 gap-6">
          {/* Guest info */}
          <div>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-3">Guest Details</p>
            <div className="space-y-2 text-sm">
              <Row label="Name"     value={b.guest?.name} />
              <Row label="Email"    value={b.guest?.email || "—"} />
              <Row label="Guests"   value={`${b.guests} guest${b.guests !== 1 ? "s" : ""}`} />
              <Row label="Booked on" value={bookedOn} />
              {b.stripe_payment_intent_id && (
                <Row label="Payment ref" value={b.stripe_payment_intent_id.slice(0, 20) + "…"} />
              )}
            </div>
          </div>

          {/* Booking info */}
          <div>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-3">Booking Details</p>
            <div className="space-y-2 text-sm">
              <Row label="Property"  value={b.listing?.title ?? "—"} />
              <Row label="Location"  value={b.listing?.location ?? "—"} />
              <Row label="Check-in"  value={checkIn} />
              <Row label="Check-out" value={checkOut} />
              <Row label="Nights"    value={`${b.nights}`} />
              <Row label="Total"     value={`${Number(b.total_price).toLocaleString()} XAF`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#717171] w-28 flex-shrink-0">{label}</span>
      <span className="text-[#222222] font-medium truncate">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending:   "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#DDDDDD] rounded-2xl p-10 text-center">
      <p className="text-[#717171] text-sm">{message}</p>
    </div>
  );
}
