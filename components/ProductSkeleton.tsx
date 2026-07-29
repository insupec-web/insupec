export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="h-44 sm:h-52 bg-gradient-to-br from-gray-200 to-gray-100" />

      <div className="p-4 flex flex-col flex-1">
        {/* Title skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        </div>

        {/* Price skeleton */}
        <div className="mb-3 h-7 bg-gray-200 rounded-lg w-2/5" />

        {/* Metadata skeleton */}
        <div className="flex flex-col gap-2 mb-4 flex-1">
          <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
        </div>

        {/* Button skeleton */}
        <div className="flex gap-2 mt-auto">
          <div className="w-16 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
