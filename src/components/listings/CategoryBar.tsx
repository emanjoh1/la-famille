"use client";

import { useState } from "react";
import {
  Building2,
  Home,
  Castle,
  DoorOpen,
  LayoutGrid,
  Hotel,
  SlidersHorizontal,
} from "lucide-react";
import { LISTING_CATEGORIES } from "@/lib/utils/constants";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Home,
  Castle,
  DoorOpen,
  LayoutGrid,
  Hotel,
};

export function CategoryBar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="sticky top-20 bg-white border-b border-[#DDDDDD] z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 py-4">
          {/* Scrollable categories */}
          <div className="flex items-center gap-6 flex-1 overflow-x-auto no-scrollbar">
            {LISTING_CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] ?? Home;
              const isActive = active === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActive(isActive ? null : cat.value)}
                  className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 flex-shrink-0
                              transition-all duration-150
                              ${
                                isActive
                                  ? "border-[#222222] text-[#222222]"
                                  : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                              }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className={`text-xs whitespace-nowrap ${isActive ? "font-semibold" : "font-medium"}`}>
                    {cat.label_en}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters button */}
          <div className="flex-shrink-0 ml-4 pl-4 border-l border-[#DDDDDD]">
            <button
              className="flex items-center gap-2 px-4 py-2.5 border border-[#DDDDDD] rounded-xl
                         text-sm font-medium text-[#222222] hover:bg-[#F7F7F7] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
