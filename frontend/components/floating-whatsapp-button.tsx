"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function FloatingWhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Show on all pages except admin and auth routes
  const shouldShow = !pathname.startsWith("/admin") && !pathname.startsWith("/auth/") && user?.role !== "admin"

  const handleWhatsAppClick = () => {
    const phoneNumber = "+212676423340"
    const message = "Hello! I'm interested in your products."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        size="icon"
        aria-label="Chat with us on WhatsApp"
      >
        <Image
          src="/whatsapp.png" // Ensure this image exists in the public directory
          alt="WhatsApp Logo"
          width={54}
          height={54}
          className="object-contain"
        />
      </Button>

      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm border border-gray-200 dark:border-gray-700">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}

export default FloatingWhatsAppButton