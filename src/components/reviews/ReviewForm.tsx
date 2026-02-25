"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/actions/reviews";

interface ReviewFormProps {
  bookingId: string;
  listingId: string;
  onSuccess?: () => void;
}

function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#222222]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5"
            aria-label={`Rate ${label} ${star} stars`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= value
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "text-[#DDDDDD]"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ bookingId, listingId, onSuccess }: ReviewFormProps) {
  const [ratings, setRatings] = useState({
    overall_rating: 0,
    cleanliness_rating: 0,
    communication_rating: 0,
    location_rating: 0,
    value_rating: 0,
  });
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (Object.values(ratings).some((r) => r === 0)) {
      setError("Please rate all categories");
      return;
    }
    setLoading(true);
    try {
      await createReview({
        booking_id: bookingId,
        listing_id: listingId,
        ...ratings,
        comment: comment || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#222222]">Leave a review</h3>
      <div className="space-y-1">
        <StarInput
          label="Overall"
          value={ratings.overall_rating}
          onChange={(v) => setRatings((prev) => ({ ...prev, overall_rating: v }))}
        />
        <StarInput
          label="Cleanliness"
          value={ratings.cleanliness_rating}
          onChange={(v) => setRatings((prev) => ({ ...prev, cleanliness_rating: v }))}
        />
        <StarInput
          label="Communication"
          value={ratings.communication_rating}
          onChange={(v) => setRatings((prev) => ({ ...prev, communication_rating: v }))}
        />
        <StarInput
          label="Location"
          value={ratings.location_rating}
          onChange={(v) => setRatings((prev) => ({ ...prev, location_rating: v }))}
        />
        <StarInput
          label="Value"
          value={ratings.value_rating}
          onChange={(v) => setRatings((prev) => ({ ...prev, value_rating: v }))}
        />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        rows={3}
        className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                   placeholder-[#717171] focus:outline-none focus:border-[#222222]
                   transition-colors text-sm resize-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2.5 bg-[#FF385C] text-white rounded-xl text-sm font-medium
                   hover:bg-[#E31C5F] disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
