"use client";

import {
  Wifi,
  AirVent,
  Car,
  Waves,
  CookingPot,
  Tv,
  Zap,
  Droplets,
  ShieldCheck,
  Fence,
  Flame,
  WashingMachine,
} from "lucide-react";
import { useLanguageContext } from "@/lib/i18n/provider";
import type { LucideIcon } from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  ac: AirVent,
  parking: Car,
  pool: Waves,
  kitchen: CookingPot,
  washer: WashingMachine,
  tv: Tv,
  generator: Zap,
  water_tank: Droplets,
  security_guard: ShieldCheck,
  gated: Fence,
  hot_water: Flame,
};

interface AmenityItem {
  key: string;
  label_en: string;
  label_fr: string;
}

export function AmenityList({ amenities }: { amenities: AmenityItem[] }) {
  const { locale, t } = useLanguageContext();

  if (amenities.length === 0) return null;

  return (
    <div className="py-6 border-b border-[#DDDDDD]">
      <h3 className="text-xl font-semibold text-[#222222] mb-6">
        {t("listing.amenities")}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {amenities.map((amenity) => {
          const Icon = AMENITY_ICONS[amenity.key] ?? Wifi;
          const label = locale === "fr" ? amenity.label_fr : amenity.label_en;
          return (
            <div key={amenity.key} className="flex items-center gap-4">
              <Icon className="w-5 h-5 text-[#222222] flex-shrink-0" />
              <span className="text-[#222222]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
