import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-1/3 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="w-full lg:w-1/4 p-6 bg-filter-bg dark:bg-gray-800 rounded-lg shadow-md">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-2/3 mb-3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full mt-2" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
            <div>
              <Skeleton className="h-6 w-2/3 mb-3" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-2/3 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
