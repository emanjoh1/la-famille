"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";
import { useRouter } from "next/navigation";

export function SaveButton({ listingId, initialSaved = false }: { listingId: string; initialSaved?: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleFavorite(listingId);
      setSaved(!saved);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                 hover:border-[#FF385C] hover:bg-rose-50 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      <Heart className={`w-5 h-5 transition-all duration-200 ${
        saved 
          ? "fill-[#FF385C] text-[#FF385C] scale-110" 
          : "text-gray-600 group-hover:text-[#FF385C] group-hover:scale-110"
      }`} />
      <span className={`text-sm font-semibold transition-colors ${
        saved ? "text-[#FF385C]" : "text-gray-700 group-hover:text-[#FF385C]"
      }`}>
        {saved ? "Saved" : "Save"}
      </span>
    </button>
  );
}
