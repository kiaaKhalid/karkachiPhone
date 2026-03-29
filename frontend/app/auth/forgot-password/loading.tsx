import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
          </CardTitle>
          <CardDescription className="text-center">
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step indicator skeleton */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-1" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-1" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
