"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Grid2X2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const safeImages = images?.length ? images : [];
  const total = safeImages.length;

  const openAt = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  const close = () => setLightboxOpen(false);

  const prev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setCurrentIndex((i) => (i + 1) % total),
    [total]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Touch / swipe handlers
  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStartX(e.touches[0].clientX);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    setTouchStartX(null);
  };

  // ── No images fallback ────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="h-[400px] md:h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
        <span className="text-6xl">🏠</span>
      </div>
    );
  }

  // ── Photo grid ────────────────────────────────────────────────
  return (
    <>
      <div className="relative mb-8">
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[500px]">
          {/* Large left photo */}
          <div
            className="relative cursor-pointer group"
            onClick={() => openAt(0)}
          >
            <Image
              src={safeImages[0]}
              alt={title}
              fill
              className="object-cover group-hover:brightness-90 transition"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* 2 × 2 right grid */}
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative cursor-pointer group"
                onClick={() => safeImages[i] && openAt(i)}
              >
                {safeImages[i] ? (
                  <>
                    <Image
                      src={safeImages[i]}
                      alt={`${title} photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:brightness-90 transition"
                      sizes="25vw"
                    />
                    {/* Overlay on last cell when there are more photos */}
                    {i === 4 && total > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          +{total - 4} photos
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Show all photos button */}
        {total > 1 && (
          <button
            onClick={() => openAt(0)}
            className="absolute bottom-4 right-4 bg-white border border-[#222222]
                       rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2
                       hover:bg-[#F7F7F7] transition-colors shadow-sm"
          >
            <Grid2X2 className="w-4 h-4" />
            Show all {total} photo{total !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
            <button
              onClick={close}
              className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {total}
            </span>
            {/* Spacer */}
            <div className="w-9" />
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 md:px-20">
            {/* Prev arrow */}
            {total > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 md:left-4 text-white bg-white/10 hover:bg-white/20
                           rounded-full p-3 transition z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main image */}
            <div className="relative w-full h-full max-w-5xl mx-auto">
              <Image
                key={safeImages[currentIndex]}
                src={safeImages[currentIndex]}
                alt={`${title} — photo ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Next arrow */}
            {total > 1 && (
              <button
                onClick={next}
                className="absolute right-2 md:right-4 text-white bg-white/10 hover:bg-white/20
                           rounded-full p-3 transition z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Dot indicators (up to 10) */}
          {total > 1 && total <= 20 && (
            <div className="flex justify-center gap-1.5 py-4 flex-shrink-0">
              {safeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-white w-5 h-2"
                      : "bg-white/40 w-2 h-2"
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip for > 20 photos */}
          {total > 20 && (
            <div className="flex justify-center py-3 flex-shrink-0">
              <span className="text-white/50 text-xs">
                Swipe or use arrow keys to navigate
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
