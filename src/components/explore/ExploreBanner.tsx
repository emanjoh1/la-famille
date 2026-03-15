"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

const FALLBACK = [
  "https://leqneftjgk.ufs.sh/f/EP2T4g5LAgD2yCPEvbOMzluCnvYhej2AEfH9dVcw8BrgG1Is",
];

export function ExploreBanner() {
  const [images, setImages] = useState<string[]>(FALLBACK);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/admin/site-images")
      .then((r) => {
        if (!r.ok) return;
        return r.json().then((data) => {
          const urls = (data.images ?? [])
            .filter((i: { type: string }) => i.type === "hero")
            .map((i: { url: string }) => i.url);
          if (urls.length > 0) setImages(urls);
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images]);

  return (
    <div className="relative h-52 md:h-64 overflow-hidden">
      {/* Sliding images */}
      {images.map((url, i) => (
        <div
          key={url}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image src={url} alt="" fill className="object-cover object-center" sizes="100vw" quality={100} unoptimized />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-3">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-semibold text-white">Cameroon · Africa</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          Discover Amazing Stays
        </h1>
        <p className="text-white/70 text-sm mt-2">
          Handpicked properties across Cameroon
        </p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
