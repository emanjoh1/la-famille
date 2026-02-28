"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/actions/reviews";
import { useRouter } from "next/navigation";
import { useLanguageContext } from "@/lib/i18n/provider";

export function ReviewForm({ bookingId, listingId }: { bookingId: string; listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    communication: 0,
    location: 0,
    value: 0,
  });
  const [comment, setComment] = useState("");
  const { t } = useLanguageContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratings.overall === 0) {
      alert("Please provide an overall rating");
      return;
    }

    setLoading(true);
    try {
      const result = await createReview({
        booking_id: bookingId,
        listing_id: listingId,
        overall_rating: ratings.overall,
        cleanliness_rating: ratings.cleanliness,
        communication_rating: ratings.communication,
        location_rating: ratings.location,
        value_rating: ratings.value,
        comment,
      });
      if ("error" in result) {
        alert(result.error);
        setLoading(false);
        return;
      }
      router.push("/bookings");
    } catch (error) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RatingInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? "fill-[#166534] text-[#166534]" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8">
      <RatingInput
        label={`${t("review.overall")} *`}
        value={ratings.overall}
        onChange={(v) => setRatings({ ...ratings, overall: v })}
      />

      <RatingInput
        label={t("review.cleanliness")}
        value={ratings.cleanliness}
        onChange={(v) => setRatings({ ...ratings, cleanliness: v })}
      />

      <RatingInput
        label={t("review.communication")}
        value={ratings.communication}
        onChange={(v) => setRatings({ ...ratings, communication: v })}
      />

      <RatingInput
        label={t("review.location")}
        value={ratings.location}
        onChange={(v) => setRatings({ ...ratings, location: v })}
      />

      <RatingInput
        label={t("review.value")}
        value={ratings.value}
        onChange={(v) => setRatings({ ...ratings, value: v })}
      />

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t("review.comment")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent resize-none"
          placeholder={t("review.comment_placeholder")}
        />
      </div>

      <button
        type="submit"
        disabled={loading || ratings.overall === 0}
        className="w-full py-4 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-xl font-bold
                   hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("common.loading") : t("review.submit_review")}
      </button>
    </form>
  );
}
