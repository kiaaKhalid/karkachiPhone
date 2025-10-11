import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./clientLayout"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KARKACHI PHONE - Premium Mobile Devices & Electronics",
    description: "Discover the latest smartphones, tablets, laptops, and tech accessories.",
    images: ["/images/twitter-image.jpg"],
    creator: "@karkachi_phone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
