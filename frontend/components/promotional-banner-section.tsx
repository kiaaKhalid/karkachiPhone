"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

interface BrandLogo {
  id: string
  name: string
  logoUrl: string
}

interface PromotionalProduct {
  id: string
  name: string
  brandId: string
  price: string
  image: string
  description: string
}

const urlBase = process.env.NEXT_PUBLIC_API_URL || "https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api"

export default function PromotionalBannerSection() {
  const { settings } = useAdmin()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isAutoSliding, setIsAutoSliding] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [brands, setBrands] = useState<BrandLogo[]>([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(true)

  const [promotionalProducts, setPromotionalProducts] = useState<PromotionalProduct[]>([])
  const [isLoadingPromotional, setIsLoadingPromotional] = useState(true)

  const [smallProducts, setSmallProducts] = useState<PromotionalProduct[]>([])
  const [isLoadingSmall, setIsLoadingSmall] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true)
        const response = await fetch(`${urlBase}/public/brands/logo`)
        if (response.ok) {
          const data = await response.json()
          setBrands(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setIsLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    const fetchPromotionalProducts = async () => {
      try {
        setIsLoadingPromotional(true)
        const response = await fetch(`${urlBase}/public/products/panale-big`)
        if (response.ok) {
          const data = await response.json()
          setPromotionalProducts(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching promotional products:", error)
      } finally {
        setIsLoadingPromotional(false)
      }
    }

    fetchPromotionalProducts()
  }, [])

  useEffect(() => {
    const fetchSmallProducts = async () => {
      try {
        setIsLoadingSmall(true)
        const response = await fetch(`${urlBase}/public/products/panale-smale`)
        if (response.ok) {
          const data = await response.json()
          setSmallProducts(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching small promotional products:", error)
      } finally {
        setIsLoadingSmall(false)
      }
    }

    fetchSmallProducts()
  }, [])

  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands])

  const promotionalBanners = useMemo(() => {
    if (!promotionalProducts.length) return []
    return promotionalProducts.map((product, index) => ({
      id: product.id,
      title: product.name || "FEATURED PRODUCT",
      subtitle: brandMap.get(product.brandId) || "PREMIUM",
      description: product.description || `Découvrez ${product.name}`,
      buttonText: index === 0 ? "COMMANDER" : index === 1 ? "DÉCOUVRIR" : "EXPLORER",
      image: product.image || "/Placeholder.png",
      backgroundColor:
        index === 0
          ? "from-orange-100 via-amber-50 to-yellow-100"
          : index === 1
            ? "from-blue-100 via-indigo-50 to-purple-100"
            : "from-green-100 via-emerald-50 to-teal-100",
      textColor: "text-gray-900",
      link: `/products/${product.id}`,
      badge: index === 0 ? "NOUVEAU" : index === 1 ? "POPULAIRE" : "INNOVATION",
      price: parseFloat(product.price || "0"),
      allImages: [product.image || "/Placeholder.png"],
    }))
  }, [promotionalProducts, brandMap])

  // Auto-slide effect for main banner
  useEffect(() => {
    if (!isAutoSliding || promotionalBanners.length === 0) return

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promotionalBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentBanner, isAutoSliding, promotionalBanners.length])

  const nextBanner = () => {
    if (promotionalBanners.length === 0) return
    setCurrentBanner((prev) => (prev + 1) % promotionalBanners.length)
    setIsAutoSliding(false)
    setTimeout(() => setIsAutoSliding(true), 8000)
  }

  const prevBanner = () => {
    if (promotionalBanners.length === 0) return
    setCurrentBanner((prev) => (prev - 1 + promotionalBanners.length) % promotionalBanners.length)
    setIsAutoSliding(false)
    setTimeout(() => setIsAutoSliding(true), 8000)
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationFrameId: number
    const scrollSpeed = 0.5 // pixels per frame

    const animateScroll = () => {
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft = 0
      } else {
        carousel.scrollLeft += scrollSpeed
      }
      animationFrameId = requestAnimationFrame(animateScroll)
    }

    animationFrameId = requestAnimationFrame(animateScroll)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (isLoadingPromotional || isLoadingBrands || isLoadingSmall || promotionalBanners.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 dark:from-gray-950 dark:via-transparent dark:to-gray-950"></div>

        {/* Main Banner Layout - Matching Reference Image */}
        <div className="relative mb-16 px-4 sm:px-6 lg:px-8 pt-0 sm:pt-0 lg:pt-0 -mt-9">
          <div className="flex gap-4 lg:gap-6 h-[400px] lg:h-[500px]">
            {/* Main Banner Skeleton */}
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              {/* Skeleton Content Layout */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8 lg:flex-row lg:justify-between lg:p-12 lg:py-0">
                {/* Left Side Skeleton - Price, Brand, Button */}
                <div className="flex flex-col justify-center space-y-4 w-full lg:w-1/3 order-2 lg:order-none lg:text-left mt-0 lg:mt-0 items-center lg:items-start text-center">
                  {/* Price Skeleton */}
                  <div className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>

                  {/* Brand Logo Skeleton */}
                  <div className="w-32 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>

                  {/* Button Skeleton */}
                  <div className="w-36 h-12 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                </div>

                {/* Center Skeleton - Product Images and Title */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full order-1 lg:order-none">
                  {/* Product Images Skeleton */}
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 w-full">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className={`transform transition-transform duration-500 ${
                          index === 0 ? "-rotate-12" : index === 1 ? "scale-125" : "rotate-12"
                        }`}
                      >
                        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-32 lg:h-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Title Skeleton */}
                  <div className="text-center space-y-2">
                    <div className="w-48 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse mx-auto"></div>
                    <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows Skeleton */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>

              {/* Dots Indicator Skeleton */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Side Banner Skeleton */}
            <div className="hidden lg:block w-80 relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <div className="relative z-10 h-full p-8">
                {/* Side Banner Content Skeleton */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-6 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
                  </div>
                  <div className="w-40 h-6 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
                </div>

                {/* Product Slider Skeleton */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex space-x-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-gray-400 dark:bg-gray-500 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Carousel Skeleton */}
        <div className="relative overflow-hidden py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:py-8 lg:px-8 xl:px-12">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 mx-8">
                <div className="w-24 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 dark:from-gray-950 dark:via-transparent dark:to-gray-950"></div>

      {/* Main Banner Layout - Matching Reference Image */}
      <div className="relative mb-16 px-4 sm:px-6 lg:px-8 pt-0 sm:pt-0 lg:pt-0 -mt-9">
        <div className="flex gap-4 lg:gap-6 h-[400px] lg:h-[500px]">
          {/* Main Banner - Takes most of the width */}
          <div
            className={`flex-1 relative rounded-3xl overflow-hidden shadow-2xl group bg-gradient-to-br ${promotionalBanners[currentBanner].backgroundColor}`}
          >
            {/* Dynamic Background Shapes based on current banner */}
            <div className="absolute inset-0">
              <div
                className={`absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r ${
                  promotionalBanners[currentBanner].backgroundColor.includes("orange")
                    ? "from-orange-200/40 to-yellow-200/40"
                    : promotionalBanners[currentBanner].backgroundColor.includes("blue")
                      ? "from-blue-200/40 to-indigo-200/40"
                      : "from-green-200/40 to-emerald-200/40"
                } rounded-r-full transform -translate-x-1/4`}
              ></div>
              <div
                className={`absolute bottom-0 right-0 w-1/2 h-3/4 bg-gradient-to-l ${
                  promotionalBanners[currentBanner].backgroundColor.includes("orange")
                    ? "from-orange-100/30 to-yellow-100/30"
                    : promotionalBanners[currentBanner].backgroundColor.includes("blue")
                      ? "from-blue-100/30 to-indigo-100/30"
                      : "from-green-100/30 to-emerald-100/30"
                } rounded-tl-full transform translate-x-1/4`}
              ></div>
            </div>

            {/* Content Layout with Admin-controlled data */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8 lg:flex-row lg:justify-between lg:p-12 lg:py-0 leading-3">
              {/* Left Side - Price, Brand Logo, and Button */}
              <div className="flex flex-col justify-center space-y-4 w-full lg:w-1/3 order-2 lg:order-none lg:text-left mt-8 lg:mt-0 items-center lg:items-start text-center">
                {/* Price Display with large "MAD" and "Prix spécial" */}
                {promotionalBanners[currentBanner].price > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                      {promotionalBanners[currentBanner].price} MAD
                    </span>
                    <span className="text-lg sm:text-xl font-semibold text-green-600">Prix spécial</span>
                  </div>
                )}
                {/* Brand Logo from Admin Settings */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r ${
                        promotionalBanners[currentBanner].backgroundColor.includes("orange")
                          ? "from-orange-500 via-yellow-500 to-red-500"
                          : promotionalBanners[currentBanner].backgroundColor.includes("blue")
                            ? "from-blue-500 via-indigo-500 to-purple-500"
                            : "from-green-500 via-emerald-500 to-teal-500"
                      } bg-clip-text text-transparent`}
                      style={{
                        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        letterSpacing: "-0.02em",
                        fontWeight: "900",
                      }}
                    >
                      {settings.siteName}
                    </span>
                  </div>
                </div>
                {/* Dynamic Order Button */}
                <Button
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-fit"
                  asChild
                >
                  <Link href={promotionalBanners[currentBanner].link}>
                    {promotionalBanners[currentBanner].buttonText}
                  </Link>
                </Button>
              </div>

              {/* Center - Dynamic Product Display */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full order-1 lg:order-none">
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 w-full">
                  {promotionalBanners[currentBanner].allImages.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className={`transform transition-transform duration-500 ${
                        index === 0
                          ? "-rotate-12 hover:rotate-0"
                          : index === 1
                            ? "scale-125 hover:scale-150"
                            : "rotate-12 hover:rotate-0"
                      }`}
                    >
                      <img
                        src={image || "/Placeholder.png"}
                        alt={`${promotionalBanners[currentBanner].title} ${index + 1}`}
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-32 lg:h-32 object-contain drop-shadow-xl"
                      />
                    </div>
                  ))}
                  {promotionalBanners[currentBanner].allImages.length < 3 &&
                    Array.from({ length: 3 - promotionalBanners[currentBanner].allImages.length }).map((_, index) => (
                      <div
                        key={`fallback-${index}`}
                        className={`transform transition-transform duration-500 ${
                          (promotionalBanners[currentBanner].allImages.length + index) === 0
                            ? "-rotate-12 hover:rotate-0"
                            : promotionalBanners[currentBanner].allImages.length + index === 1
                              ? "scale-125 hover:scale-150"
                              : "rotate-12 hover:rotate-0"
                        }`}
                      >
                        <img
                          src={promotionalBanners[currentBanner].image || "/Placeholder.png"}
                          alt={`${promotionalBanners[currentBanner].title} ${promotionalBanners[currentBanner].allImages.length + index + 1}`}
                          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-32 lg:h-32 object-contain drop-shadow-xl"
                        />
                      </div>
                    ))}
                </div>

                {/* Product Title with Admin Data */}
                <div className="text-center space-y-2">
                  <div className="relative">
                    <h1
                      className={`text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 ${promotionalBanners[currentBanner].textColor}`}
                      style={{
                        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        letterSpacing: "-0.02em",
                        fontWeight: "800",
                      }}
                    >
                      {promotionalBanners[currentBanner].title}
                    </h1>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                  <h2
                    className="text-xs sm:text-base lg:text-lg font-medium text-gray-600 tracking-wide"
                    style={{
                      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      letterSpacing: "0.05em",
                      fontWeight: "500",
                    }}
                  >
                    {promotionalBanners[currentBanner].subtitle}
                  </h2>
                  <p
                    className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-md leading-relaxed"
                    style={{
                      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {promotionalBanners[currentBanner].description}
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 opacity-70 hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 opacity-70 hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {promotionalBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentBanner(index)
                    setIsAutoSliding(false)
                    setTimeout(() => setIsAutoSliding(true), 8000)
                  }}
                  className={`transition-all duration-300 ${
                    index === currentBanner
                      ? "w-8 h-3 bg-gray-800 rounded-full"
                      : "w-3 h-3 bg-gray-400 hover:bg-gray-600 rounded-full"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side Banner with Admin Products */}
          <div className="hidden lg:block w-80 relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
            <div className="relative z-10 h-full">
              {/* Background Image */}
              <img
                src={smallProducts[0]?.image || "/Placeholder.png"}
                alt="Side Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

              {/* Text Content */}
              <div className="relative z-10 p-8 text-white dark:text-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-black">FEATURED</div>
                    <div className="bg-white text-blue-600 px-2 py-1 rounded font-black text-sm dark:bg-gray-800/20 dark:text-blue-400">
                      COLLECTION
                    </div>
                  </div>
                  <h3 className="text-xl font-bold dark:text-gray-200">DISCOVER MORE PRODUCTS</h3>
                </div>
              </div>

              {/* Product Slider with Admin Products */}
              <div className="absolute bottom-8 left-0 right-0 px-8">
                <div className="flex items-center justify-center space-x-4 overflow-hidden">
                  <div className="flex space-x-3 animate-slide-products">
                    {smallProducts.slice(0, 4).map((product, index) => (
                      <img
                        key={index}
                        src={product.image || "/Placeholder.png"}
                        alt={product.name}
                        className="w-16 h-16 object-contain bg-white/20 rounded-lg p-2 dark:bg-gray-800/20"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Carousel - Infinite Scroll */}
      <div className="relative overflow-hidden py-4 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:py-8 lg:px-8 xl:px-12">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-r from-white via-blue-50/80 to-transparent z-10 pointer-events-none dark:from-gray-900 dark:via-blue-950/80"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-l from-white via-blue-50/80 to-transparent z-10 pointer-events-none dark:from-gray-900 dark:via-blue-950/80"></div>

        {isLoadingBrands ? (
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 mx-8">
                <div className="w-24 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, index) => (
              <Link
                href={`/brands/${brand.id}`}
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 mx-8 cursor-pointer hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src={brand.logoUrl || "/Placeholder.png"}
                  alt={brand.name}
                  width={100}
                  height={50}
                  className="object-contain h-12 grayscale hover:grayscale-0 transition-all duration-300 hover:drop-shadow-lg"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}