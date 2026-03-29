import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <div className="product-card group bg-white dark:bg-card border-none rounded-2xl overflow-hidden shadow-smooth relative flex flex-col h-full">
      {/* Image Area Skeleton */}
      <div className="relative aspect-[4/3] w-full p-4 bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-xl" />
        
        {/* Buttons overlay skeleton */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Skeleton className="w-9 h-9 rounded-full shadow-sm" />
          <Skeleton className="w-9 h-9 rounded-full shadow-sm" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category & Status */}
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-3" />

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-8 h-4 ml-1" />
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-end gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Button */}
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
