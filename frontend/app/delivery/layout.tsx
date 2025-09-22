import type React from "react"
import { DeliveryAuthProvider } from "@/hooks/use-delivery-auth"

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeliveryAuthProvider>
      <div className="min-h-screen flex flex-col">{children}</div>
    </DeliveryAuthProvider>
  )
}
