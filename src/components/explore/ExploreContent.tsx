"use client";

import { ListingCard } from "@/components/listings/ListingCard";
import { useDict } from "@/lib/i18n/use-dict";

interface ExploreContentProps {
  listings: any[];
  location?: string;
  hasFilters: boolean;
}

export function ExploreContent({ listings, location, hasFilters }: ExploreContentProps) {
  const { t } = useDict();

  if (!hasFilters) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {location ? `${t("search.results_in")} ${location}` : t("search.results_cameroon")}
        </h1>
        {listings.length > 0 && (
          <p className="text-gray-600 mt-2">
            {listings.length} {listings.length === 1 ? t("search.property") : t("search.properties")}
          </p>
        )}
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">{t("search.no_results")}</p>
          <p className="text-gray-600 mt-2">{t("search.try_adjusting")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              location={listing.location}
              title={listing.title}
              bedrooms={listing.bedrooms}
              bathrooms={listing.bathrooms}
              price_per_night={listing.price_per_night}
              images={listing.images}
            />
          ))}
        </div>
      )}
    </>
  );
}
