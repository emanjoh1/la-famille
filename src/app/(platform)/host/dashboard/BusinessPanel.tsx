"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Calendar, Home } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BusinessPanel({
  earningsByMonth,
  confirmedBookings,
  listings,
}: {
  earningsByMonth: Record<string, number>;
  confirmedBookings: any[];
  listings: any[];
}) {
  const years = useMemo(() => {
    const ys = new Set(Object.keys(earningsByMonth).map((k) => k.slice(0, 4)));
    if (ys.size === 0) ys.add(String(new Date().getFullYear()));
    return Array.from(ys).sort((a, b) => Number(b) - Number(a));
  }, [earningsByMonth]);

  const [year, setYear] = useState(years[0]);

  const monthlyData = useMemo(() =>
    MONTHS.map((_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      return earningsByMonth[key] ?? 0;
    }), [earningsByMonth, year]);

  const yearTotal = monthlyData.reduce((s, v) => s + v, 0);
  const maxVal = Math.max(...monthlyData, 1);

  const yearBookings = confirmedBookings.filter((b) =>
    b.check_in.startsWith(year)
  ).sort((a: any, b: any) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());

  const totalAllTime = confirmedBookings.reduce((s, b) => s + Number(b.total_price), 0);
  const avgPerBooking = confirmedBookings.length
    ? Math.round(totalAllTime / confirmedBookings.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-4 h-4" />} label="All-time earnings" value={`${totalAllTime.toLocaleString()} XAF`} color="text-green-700 bg-green-50" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label={`${year} earnings`} value={`${yearTotal.toLocaleString()} XAF`} color="text-blue-700 bg-blue-50" />
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Total bookings" value={confirmedBookings.length} color="text-purple-700 bg-purple-50" />
        <StatCard icon={<Home className="w-4 h-4" />} label="Avg per booking" value={`${avgPerBooking.toLocaleString()} XAF`} color="text-amber-700 bg-amber-50" />
      </div>

      {/* Chart */}
      <div className="border border-[#DDDDDD] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-[#222222]">Monthly Earnings</h2>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-1.5 border border-[#DDDDDD] rounded-lg text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {yearTotal === 0 ? (
          <p className="text-sm text-[#717171] text-center py-10">No confirmed earnings in {year}.</p>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {monthlyData.map((val, i) => {
              const heightPct = (val / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: "160px" }}>
                    {val > 0 && (
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#222222] text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                        {val.toLocaleString()} XAF
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${val > 0 ? "bg-[#166534] hover:bg-[#15803D]" : "bg-[#F7F7F7]"}`}
                      style={{ height: `${Math.max(heightPct, val > 0 ? 4 : 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#717171]">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <h2 className="font-semibold text-[#222222]">Transaction History</h2>
          <span className="text-xs text-[#717171]">{year} · {yearBookings.length} booking{yearBookings.length !== 1 ? "s" : ""}</span>
        </div>

        {yearBookings.length === 0 ? (
          <p className="text-sm text-[#717171] text-center py-10">No transactions in {year}.</p>
        ) : (
          <div className="divide-y divide-[#DDDDDD]">
            {yearBookings.map((b: any) => {
              const checkIn  = new Date(b.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              const checkOut = new Date(b.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#222222] truncate">{b.listing?.title ?? "Listing"}</p>
                    <p className="text-xs text-[#717171]">{checkIn} → {checkOut} · {b.guest?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-700">+{Number(b.total_price).toLocaleString()} XAF</p>
                    <p className="text-xs text-[#717171]">{b.nights} night{b.nights !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-lg font-bold text-[#222222] leading-tight">{value}</p>
      <p className="text-xs text-[#717171] mt-0.5">{label}</p>
    </div>
  );
}
