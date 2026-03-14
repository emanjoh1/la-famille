export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
      {/* Category bar skeleton */}
      <div className="flex gap-4 mb-8 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[64px]">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-14" />
          </div>
        ))}
      </div>
      {/* Listing grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
