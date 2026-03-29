import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

// Changed to a named export
export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-[#01A0EA]" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
