"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { WishlistProvider } from "@/hooks/use-wishlist"
import { LanguageProvider } from "@/hooks/use-language"
import { AdminProvider } from "@/hooks/use-admin"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <AdminProvider>
                <CartProvider>
                  <WishlistProvider>
                    <div className="min-h-screen bg-background">
                      <Navbar />
                      <main className="pt-16">{children}</main>
                      <FloatingWhatsAppButton />
                    </div>
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