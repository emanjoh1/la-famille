"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Bed, Bath, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { useLanguageContext } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils/cn";

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
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguageContext();
  const validImages = images.filter(Boolean);
  const total = validImages.length;

  const handleHeart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prev = hearted;
    setHearted(!prev);
    try { await toggleFavorite(id); } catch { setHearted(prev); }
  }, [hearted, id]);

  const handleNav = useCallback((e: React.MouseEvent, dir: "prev" | "next") => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => dir === "next" ? (i + 1) % total : (i - 1 + total) % total);
  }, [total]);

  const handleDot = useCallback((e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex(i);
  }, []);

  return (
    <Link
      href={`/listings/${id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {total > 0 ? (
          <Image
            src={validImages[imgIndex]}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-5xl opacity-30">🏠</span>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Heart */}
        <button
          onClick={handleHeart}
          aria-label={hearted ? t("listing.remove_favorite") : t("listing.add_favorite")}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                     rounded-full bg-white/20 backdrop-blur-sm border border-white/30
                     hover:bg-white/40 transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart className={cn("w-4 h-4 transition-colors", hearted ? "fill-rose-500 text-rose-500" : "fill-white/70 text-white")} />
        </button>

        {/* Prev/Next arrows — show on hover when multiple images */}
        {total > 1 && hovered && (
          <>
            <button
              onClick={(e) => handleNav(e, "prev")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md
                         flex items-center justify-center hover:scale-110 transition-transform z-10"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={(e) => handleNav(e, "next")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md
                         flex items-center justify-center hover:scale-110 transition-transform z-10"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {validImages.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => handleDot(e, i)}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === imgIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60 hover:bg-white/90"
                )}
              />
            ))}
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-white font-bold text-sm drop-shadow">
            {price_per_night.toLocaleString()} XAF
            <span className="font-normal text-white/80 text-xs"> / night</span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 text-sm truncate leading-snug">{location}</p>
          {rating != null && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-xs truncate">{title}</p>
        <div className="flex items-center gap-2.5 text-gray-400 text-xs pt-0.5">
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" />
            {bedrooms} {bedrooms !== 1 ? t("common.beds") : t("common.bed")}
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" />
            {bathrooms} {bathrooms !== 1 ? t("common.baths") : t("common.bath")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const ListingCard = memo(ListingCardInner);
