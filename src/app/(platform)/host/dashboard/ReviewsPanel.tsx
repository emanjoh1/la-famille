"use client";

import { useState, useMemo } from "react";
import { Star, Home, User } from "lucide-react";

export default function ReviewsPanel({ reviews, listings }: { reviews: any[]; listings: any[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.listing_id === filter);
  }, [reviews, filter]);

  const overallAvg = reviews.length
    ? reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.overall_rating === star).length,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="border border-[#DDDDDD] rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
        {/* Overall score */}
        <div className="flex flex-col items-center justify-center sm:w-36 flex-shrink-0">
          <p className="text-5xl font-bold text-[#222222]">{overallAvg.toFixed(1)}</p>
          <Stars rating={overallAvg} size="md" />
          <p className="text-xs text-[#717171] mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Rating bars */}
        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-[#717171] w-4 text-right">{star}</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
              <div className="flex-1 h-2 bg-[#F7F7F7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-xs text-[#717171] w-4">{count}</span>
            </div>
          ))}
        </div>

        {/* Per-listing averages */}
        {listings.length > 1 && (
          <div className="sm:w-48 space-y-2">
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-2">By property</p>
            {listings.map((l) => {
              const lr = reviews.filter((r) => r.listing_id === l.id);
              const avg = lr.length ? lr.reduce((s: number, r: any) => s + r.overall_rating, 0) / lr.length : null;
              return (
                <div key={l.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Home className="w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-[#222222] truncate flex-1">{l.title}</p>
                  {avg !== null ? (
                    <span className="text-xs font-semibold text-amber-600 flex-shrink-0">★ {avg.toFixed(1)}</span>
                  ) : (
                    <span className="text-xs text-[#717171] flex-shrink-0">—</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter by listing */}
      {listings.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <FilterChip label="All properties" value="all" active={filter === "all"} onClick={setFilter} />
          {listings.map((l) => (
            <FilterChip key={l.id} label={l.title} value={l.id} active={filter === l.id} onClick={setFilter} />
          ))}
        </div>
      )}

      {/* Review cards */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#DDDDDD] rounded-2xl p-10 text-center">
          <p className="text-[#717171] text-sm">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <ReviewCard key={r.id} review={r} showListing={filter === "all" && listings.length > 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review: r, showListing }: { review: any; showListing: boolean }) {
  const date = new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const categories = [
    { label: "Cleanliness",    value: r.cleanliness_rating },
    { label: "Communication",  value: r.communication_rating },
    { label: "Location",       value: r.location_rating },
    { label: "Value",          value: r.value_rating },
  ];

  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        {r.reviewer?.imageUrl ? (
          <img src={r.reviewer.imageUrl} alt={r.reviewer.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-[#222222] text-sm">{r.reviewer?.name}</p>
            <span className="text-xs text-[#717171]">{date}</span>
          </div>
          <Stars rating={r.overall_rating} size="sm" />
          {showListing && r.listing && (
            <p className="text-xs text-[#717171] mt-0.5 flex items-center gap-1">
              <Home className="w-3 h-3" /> {r.listing.title}
            </p>
          )}
        </div>
      </div>

      {r.comment && (
        <p className="text-sm text-[#222222] mb-4 leading-relaxed">{r.comment}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(({ label, value }) => (
          <div key={label} className="bg-[#F7F7F7] rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-[#717171]">{label}</p>
            <p className="text-sm font-semibold text-[#222222] flex items-center justify-center gap-0.5 mt-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ rating, size }: { rating: number; size: "sm" | "md" }) {
  const sz = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function FilterChip({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: (v: string) => void }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors truncate max-w-[160px]
        ${active ? "bg-[#222222] text-white" : "border border-[#DDDDDD] text-[#717171] hover:border-[#222222] hover:text-[#222222]"}`}
    >
      {label}
    </button>
  );
}
