"use client";

import { useState } from "react";
import { Clock, History, Settings, BarChart2, Star } from "lucide-react";
import BookingsPanel from "./BookingsPanel";
import ManagePanel from "./ManagePanel";
import BusinessPanel from "./BusinessPanel";
import ReviewsPanel from "./ReviewsPanel";

const TABS = [
  { id: "active",   label: "Active & Upcoming", icon: Clock },
  { id: "history",  label: "Booking History",   icon: History },
  { id: "business", label: "Business",          icon: BarChart2 },
  { id: "reviews",  label: "Reviews",           icon: Star },
  { id: "manage",   label: "Manage Listings",   icon: Settings },
];

export default function HostDashboardClient({ data }: { data: any }) {
  const [tab, setTab] = useState("active");

  const activeCount = data.inProgress.length + data.upcoming.length;
  const totalRevenue = (data.confirmedBookings ?? []).reduce((s: number, b: any) => s + Number(b.total_price), 0);
  const avgRating = data.reviews?.length
    ? (data.reviews.reduce((s: number, r: any) => s + r.overall_rating, 0) / data.reviews.length).toFixed(1)
    : "—";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Host Dashboard</h1>
      <p className="text-[#717171] mb-8">Manage your bookings, pricing and availability</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Properties"        value={data.listings.length} />
        <Stat label="Active / Upcoming" value={activeCount} highlight={activeCount > 0} />
        <Stat label="Confirmed Revenue" value={`${totalRevenue.toLocaleString()} XAF`} />
        <Stat label="Avg Rating"        value={avgRating === "—" ? "—" : `★ ${avgRating}`} highlight={avgRating !== "—"} />
      </div>

      {/* Tabs */}
      <div className="relative mb-8">
        <div className="flex gap-1 overflow-x-auto border-b border-[#DDDDDD] scrollbar-none">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0
                ${tab === id
                  ? "border-[#222222] text-[#222222]"
                  : "border-transparent text-[#717171] hover:text-[#222222]"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "active"   && <BookingsPanel inProgress={data.inProgress} upcoming={data.upcoming} />}
      {tab === "history"  && <BookingsPanel history={data.history} />}
      {tab === "business" && <BusinessPanel earningsByMonth={data.earningsByMonth} confirmedBookings={data.confirmedBookings ?? []} listings={data.listings} />}
      {tab === "reviews"  && <ReviewsPanel reviews={data.reviews ?? []} listings={data.listings} />}
      {tab === "manage"   && <ManagePanel listings={data.listings} blockedDates={data.blockedDates} />}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-4">
      <p className={`text-xl font-bold ${highlight ? "text-[#166534]" : "text-[#222222]"}`}>{value}</p>
      <p className="text-xs text-[#717171] mt-0.5">{label}</p>
    </div>
  );
}
