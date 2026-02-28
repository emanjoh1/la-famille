import type { Locale } from "@/lib/i18n/provider";
import { LISTING_CATEGORIES, AMENITIES } from "./constants";

/**
 * Get the localized label for a category
 */
export function getCategoryLabel(value: string, locale: Locale): string {
  const category = LISTING_CATEGORIES.find((c) => c.value === value);
  return category ? (locale === "fr" ? category.label_fr : category.label_en) : value;
}

/**
 * Get the localized label for an amenity
 */
export function getAmenityLabel(key: string, locale: Locale): string {
  const amenity = AMENITIES.find((a) => a.key === key);
  return amenity ? (locale === "fr" ? amenity.label_fr : amenity.label_en) : key;
}
