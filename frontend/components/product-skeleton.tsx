import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton() {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Mobile horizontal layout */}
      <div className="flex md:flex-col">
        <div className="relative w-24 h-24 md:w-full md:h-48 flex-shrink-0">
          <Skeleton className="w-full h-full" />
          {/* Badge skeleton */}
          <div className="absolute top-1 right-1 md:top-2 md:right-2">
            <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
          <div>
            {/* Title skeleton */}
            <Skeleton className="h-4 md:h-6 w-3/4 mb-1 md:mb-2" />

            {/* Description skeleton */}
            <div className="space-y-1 md:space-y-2 mb-2 md:mb-4">
              <Skeleton className="h-3 md:h-4 w-full" />
              <Skeleton className="h-3 md:h-4 w-2/3 md:w-full" />
              <Skeleton className="hidden md:block h-4 w-1/2" />
            </div>

            {/* Rating skeleton - hidden on mobile */}
            <div className="hidden md:flex items-center mb-4 space-x-2">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Price section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <Skeleton className="h-3 md:h-4 w-16 md:w-20 mb-1 md:mb-0" />
              <Skeleton className="h-5 md:h-6 w-20 md:w-24" />
            </div>

            {/* Mobile button skeleton */}
            <div className="md:hidden">
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>

          {/* Desktop button skeleton */}
          <div className="hidden md:block mt-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Wishlist button skeleton */}
        <div className="absolute top-1 left-1 md:top-2 md:left-2">
          <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}
