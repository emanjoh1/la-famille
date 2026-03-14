export default function MessagesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2 border rounded-2xl p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="h-10 bg-gray-200 rounded-2xl w-2/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
