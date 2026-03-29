import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          {/* Search and Add Button Skeleton */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Table Skeleton */}
          <div className="rounded-md border">
            {/* Table Header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-b p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Brand Name */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  {/* Description */}
                  <Skeleton className="h-4 w-32" />

                  {/* Website */}
                  <Skeleton className="h-4 w-24" />

                  {/* Sort Order */}
                  <Skeleton className="h-4 w-8" />

                  {/* Status */}
                  <Skeleton className="h-6 w-16 rounded-full" />

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
