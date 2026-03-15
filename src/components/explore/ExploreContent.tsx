"use client";

import { ListingCard } from "@/components/listings/ListingCard";
import { useDict } from "@/lib/i18n/use-dict";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

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

  if (!hasFilters) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-[#166534] font-medium">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {location
              ? `${t("search.results_in")} ${location}`
              : t("search.results_cameroon")}
          </h1>
          {totalCount > 0 && (
            <span className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
              {totalCount} {totalCount === 1 ? t("search.property") : t("search.properties")}
            </span>
          )}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("search.no_results")}</h3>
          <p className="text-gray-500 max-w-sm">{t("search.try_adjusting")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
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
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200
                           disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50
                           hover:border-gray-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          p === currentPage
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200
                           disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50
                           hover:border-gray-300 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
