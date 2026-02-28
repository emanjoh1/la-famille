"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { memo, useCallback } from "react";
import { useLanguageContext } from "@/lib/i18n/provider";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Home,
  Castle,
  DoorOpen,
  LayoutGrid,
  Hotel,
};

function CategoryBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");
  const { locale, t } = useLanguageContext();

  const handleCategoryClick = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (active === value) {
        params.delete("category");
      } else {
        params.set("category", value);
      }
      router.push(`/explore?${params.toString()}`);
    },
    [active, router, searchParams]
  );

  return (
    <div className="sticky top-20 bg-white border-b border-[#DDDDDD] z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 py-4">
          {/* Scrollable categories */}
          <div className="flex items-center gap-6 flex-1 overflow-x-auto no-scrollbar">
            {LISTING_CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] ?? Home;
              const isActive = active === cat.value;
              const label = locale === "fr" ? cat.label_fr : cat.label_en;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 flex-shrink-0
                              transition-all duration-150
                              ${
                                isActive
                                  ? "border-[#222222] text-[#222222]"
                                  : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                              }`}
                >
                  <Icon className="w-6 h-6" />
                  <span
                    className={`text-xs whitespace-nowrap ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {label}
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
              {t("search.filters")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CategoryBar = memo(CategoryBarInner);
