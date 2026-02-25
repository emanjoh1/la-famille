import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  overall_rating: number;
  cleanliness_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  comment?: string | null;
  created_at: string;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-[#717171] text-sm">No reviews yet. Be the first!</p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-[#DDDDDD] pb-6 last:border-0"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
              <span className="text-sm font-medium text-[#222222]">
                {review.overall_rating}
              </span>
            </div>
            <span className="text-sm text-[#717171]">
              {format(new Date(review.created_at), "MMM yyyy")}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-[#222222] leading-relaxed">
              {review.comment}
            </p>
          )}
          <div className="flex gap-4 mt-3 text-xs text-[#717171]">
            <span>Cleanliness {review.cleanliness_rating}/5</span>
            <span>Communication {review.communication_rating}/5</span>
            <span>Location {review.location_rating}/5</span>
            <span>Value {review.value_rating}/5</span>
          </div>
        </div>
      ))}
    </div>
  );
}
