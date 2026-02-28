"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useLanguageContext } from "@/lib/i18n/provider";

interface Review {
  id: string;
  overall_rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const { locale, t } = useLanguageContext();

  if (reviews.length === 0) {
    return <p className="text-gray-600">{t("listing.no_reviews")}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-200 to-amber-200">
              {review.user_avatar ? (
                <Image src={review.user_avatar} alt={review.user_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {review.user_name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{review.user_name}</p>
              <p className="text-sm text-gray-600">
                {new Date(review.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.overall_rating ? "fill-[#166534] text-[#166534]" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
