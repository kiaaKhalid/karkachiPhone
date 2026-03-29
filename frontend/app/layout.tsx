import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./clientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KARKACHI PHONE - Premium Mobile Devices & Electronics",
  description:
    "Discover the latest smartphones, tablets, laptops, and tech accessories at KARKACHI PHONE. Premium quality, competitive prices, and exceptional service.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: "smartphones, mobile phones, tablets, laptops, electronics, tech accessories, Apple, Samsung, Google",
  authors: [{ name: "KARKACHI PHONE" }],
  creator: "KARKACHI PHONE",
  publisher: "KARKACHI PHONE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://karkachi-phone.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KARKACHI PHONE - Premium Mobile Devices & Electronics",
    description: "Discover the latest smartphones, tablets, laptops, and tech accessories at KARKACHI PHONE.",
    url: "https://karkachi-phone.vercel.app",
    siteName: "KARKACHI PHONE",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "KARKACHI PHONE - Premium Mobile Devices",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
