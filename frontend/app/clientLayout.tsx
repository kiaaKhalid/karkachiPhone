"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { WishlistProvider } from "@/hooks/use-wishlist"
import { LanguageProvider } from "@/hooks/use-language"
import { AdminProvider } from "@/hooks/use-admin"
import { DeliveryAuthProvider } from "@/hooks/use-delivery-auth" // Import DeliveryAuthProvider
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"
import { usePathname } from "next/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDeliveryApp = pathname?.startsWith("/delivery")

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <AdminProvider>
                <CartProvider>
                  <WishlistProvider>
                    {/* Wrap children with DeliveryAuthProvider */}
                    <DeliveryAuthProvider>
                      <div className="min-h-screen bg-background">
                        {!isDeliveryApp && <Navbar />}
                        <main className={!isDeliveryApp ? "pt-16" : ""}>{children}</main>
                        {!isDeliveryApp && <FloatingWhatsAppButton />}
                      </div>
                    </DeliveryAuthProvider>
                    <Toaster />
                  </WishlistProvider>
                </CartProvider>
              </AdminProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
