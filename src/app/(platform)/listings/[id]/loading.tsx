export default function ListingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8 rounded-2xl overflow-hidden">
        <div className="aspect-square bg-gray-200" />
        <div className="hidden md:grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200" />
          ))}
        </div>
      </div>
      {/* Content + Sidebar skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="border-t pt-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="border rounded-2xl p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-14 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
