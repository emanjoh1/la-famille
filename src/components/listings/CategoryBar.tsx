"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Home, Castle, DoorOpen, LayoutGrid, Hotel, SlidersHorizontal } from "lucide-react";
import { LISTING_CATEGORIES } from "@/lib/utils/constants";
import type { LucideIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { useLanguageContext } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils/cn";

const ICON_MAP: Record<string, LucideIcon> = { Building2, Home, Castle, DoorOpen, LayoutGrid, Hotel };

function CategoryBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");
  const { locale, t } = useLanguageContext();

  const handleClick = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    active === value ? params.delete("category") : params.set("category", value);
    router.push(`/explore?${params.toString()}`);
  }, [active, router, searchParams]);

  return (
    <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar">
          {LISTING_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Home;
            const isActive = active === cat.value;
            const label = locale === "fr" ? cat.label_fr : cat.label_en;
            return (
              <button
                key={cat.value}
                onClick={() => handleClick(cat.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0",
                  "transition-all duration-200 whitespace-nowrap border",
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}

          <div className="flex-shrink-0 ml-auto pl-3 border-l border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                               border border-gray-200 bg-white text-gray-700 hover:border-gray-400
                               transition-all duration-200 whitespace-nowrap">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("search.filters")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CategoryBar = memo(CategoryBarInner);
