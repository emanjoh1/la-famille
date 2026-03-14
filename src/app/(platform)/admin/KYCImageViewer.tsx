"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function KYCImageViewer({
  images,
}: {
  images: { url: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <>
      <div className="flex gap-3 mb-4">
        {images.map((img, i) => (
          <button
            key={img.label}
            onClick={() => { setIndex(i); setOpen(true); }}
            className="flex flex-col items-center"
          >
            <img
              src={img.url}
              alt={img.label}
              className="h-16 rounded-lg border border-[#DDDDDD] object-cover hover:opacity-80 transition-opacity"
            />
            <p className="text-xs text-[#717171] mt-1">{img.label}</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30"
            disabled={images.length <= 1}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="flex flex-col items-center gap-3 max-w-2xl w-full">
            <img
              src={images[index].url}
              alt={images[index].label}
              className="max-h-[75vh] w-full object-contain rounded-xl"
            />
            <p className="text-white text-sm font-medium">{images[index].label}</p>
            <div className="flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30"
            disabled={images.length <= 1}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
}
