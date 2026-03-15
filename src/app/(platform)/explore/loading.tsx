export default function ExploreLoading() {
  return (
    <div className="animate-pulse">
      {/* Category bar skeleton */}
      <div className="sticky top-20 bg-white border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-100 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="h-7 bg-gray-100 rounded-full w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl mb-3" />
              <div className="space-y-2 px-0.5">
                <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
