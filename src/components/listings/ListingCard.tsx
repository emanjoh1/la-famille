"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { toggleFavorite } from "@/actions/favorites";

interface ListingCardProps {
  id: string;
  location: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  images: string[];
  isFavorited?: boolean;
  rating?: number | null;
}

function ListingCardInner({
  id,
  location,
  title,
  bedrooms,
  bathrooms,
  price_per_night,
  images,
  isFavorited = false,
  rating,
}: ListingCardProps) {
  const [hearted, setHearted] = useState(isFavorited);

  const handleHeart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = hearted;
      setHearted(!prev);
      try {
        await toggleFavorite(id);
      } catch {
        setHearted(prev); // revert on error
      }
    },
    [hearted, id]
  );

  return (
    <Link href={`/listings/${id}`} className="group cursor-pointer block">
      {/* Image */}
      <div className="relative aspect-square mb-3 rounded-2xl overflow-hidden bg-gray-200">
        {images[0] ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        {/* Heart */}
        <button
          onClick={handleHeart}
          className="absolute top-3 right-3 p-1 hover:scale-110 transition-transform"
          aria-label={hearted ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-6 h-6 drop-shadow transition-colors ${
              hearted
                ? "text-[#1E3A8A] fill-[#1E3A8A]"
                : "text-white fill-black/30"
            }`}
          />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[#222222] truncate pr-2">
            {location}
          </h3>
          {rating != null && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
              <span className="text-sm text-[#222222]">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <p className="text-[#717171] text-sm truncate">{title}</p>
        <p className="text-[#717171] text-sm">
          {bedrooms} bed{bedrooms !== 1 ? "s" : ""} · {bathrooms} bath
          {bathrooms !== 1 ? "s" : ""}
        </p>
        <p className="text-[#222222]">
          <span className="font-semibold">
            {price_per_night.toLocaleString()} XAF
          </span>
          <span className="font-normal text-[#717171]"> / night</span>
        </p>
      </div>
    </Link>
  );
}

export const ListingCard = memo(ListingCardInner);
