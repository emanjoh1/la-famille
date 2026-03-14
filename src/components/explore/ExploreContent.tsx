"use client";

import { ListingCard } from "@/components/listings/ListingCard";
import { useDict } from "@/lib/i18n/use-dict";
import { useRouter, useSearchParams } from "next/navigation";

interface ExploreContentProps {
  listings: Array<{
    id: string;
    location: string;
    title: string;
    bedrooms: number;
    bathrooms: number;
    price_per_night: number;
    images: string[];
  }>;
  location?: string;
  hasFilters: boolean;
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

export function ExploreContent({
  listings,
  location,
  hasFilters,
  currentPage,
  totalCount,
  pageSize,
}: ExploreContentProps) {
  const { t } = useDict();
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (!hasFilters) {
    return null;
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {location ? `${t("search.results_in")} ${location}` : t("search.results_cameroon")}
        </h1>
        {totalCount > 0 && (
          <p className="text-gray-600 mt-2">
            {totalCount} {totalCount === 1 ? t("search.property") : t("search.properties")}
          </p>
        )}
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">{t("search.no_results")}</p>
          <p className="text-gray-600 mt-2">{t("search.try_adjusting")}</p>
        </div>
      ) : (
        <>
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
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
