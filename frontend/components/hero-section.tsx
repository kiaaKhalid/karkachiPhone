"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface TopSoldProductDto {
  id: string
  name: string
  image: string
  price: string
  originalPrice: string
  description: string
  stock: number
  rating: string
  reviewsCount: number
  discount: number | null
  isNew: boolean
  isBestSeller: boolean
}

const urlBase = process.env.NEXT_PUBLIC_API_URL || "https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoSliding, setIsAutoSliding] = useState(true)
  const [topProducts, setTopProducts] = useState<TopSoldProductDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchTopSoldProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${urlBase}/public/products/saller`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setTopProducts(data.data || [])
        setError(false)
      } catch (err) {
        console.error("Error fetching top sold products:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopSoldProducts()
  }, [])

  const nextSlide = () => {
    if (topProducts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % topProducts.length)
      setIsAutoSliding(false)
      setTimeout(() => setIsAutoSliding(true), 5000)
    }
  }

  const prevSlide = () => {
    if (topProducts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + topProducts.length) % topProducts.length)
      setIsAutoSliding(false)
      setTimeout(() => setIsAutoSliding(true), 5000)
    }
  }

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoSliding || topProducts.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % topProducts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentSlide, isAutoSliding, topProducts.length])

  const SkeletonLoader = () => (
    <section className="relative bg-gradient-to-br from-amber-50/30 via-white to-yellow-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/10 overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100/10 to-yellow-100/5 dark:from-amber-400/5 dark:to-yellow-400/3"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-20 lg:mb-24 mt-[19px] pt-[19px]">
          {/* Left Content Skeleton */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse mx-auto lg:mx-0"></div>
              <div className="space-y-3">
                <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
                <div className="h-12 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse mx-auto lg:mx-0"></div>
              </div>
              <div className="h-6 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse mx-auto lg:mx-0"></div>
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>

            {/* Price and CTA Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
                <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
                <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <div className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse"></div>
                <div className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right Content Skeleton */}
          <div className="relative">
            <div className="relative bg-background/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-border">
              <div className="relative w-full h-[500px] sm:h-[600px] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  if (isLoading || error || topProducts.length === 0) {
    return <SkeletonLoader />
  }

  const currentProduct = topProducts[currentSlide]

  return (
    <section className="relative bg-gradient-to-br from-amber-50/30 via-white to-yellow-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/10 overflow-hidden transition-colors duration-300">
      {/* Background Elements - Subtle Gold Accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100/10 to-yellow-100/5 dark:from-amber-400/5 dark:to-yellow-400/3"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 lg:pb-0">
        {/* Main Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-20 lg:mb-24 mt-[19px] pt-[19px]">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] text-white px-4 py-2 text-sm font-medium shadow-sm">
                Best Seller
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground">
                <span className="bg-gradient-to-r from-[#01A0EA] via-[#03669A] to-[#01A0EA] bg-clip-text text-transparent">
                  {currentProduct.name}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                {currentProduct.description}
              </p>
            </div>

            {/* Price and CTA */}
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">{parseFloat(currentProduct.price).toFixed(2)} MAD</span>
                {currentProduct.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {parseFloat(currentProduct.originalPrice).toFixed(2)} MAD
                  </span>
                )}
                {currentProduct.discount && currentProduct.discount > 0 && (
                  <Badge className="bg-red-500 text-white shadow-sm">-{currentProduct.discount}%</Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#01A0EA] to-[#03669A] hover:from-[#01A0EA]/90 hover:to-[#03669A]/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  asChild
                >
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border hover:border-[#01A0EA] hover:bg-[#01A0EA]/5 dark:hover:bg-[#01A0EA]/10 text-foreground px-8 py-3 rounded-xl transition-all duration-300 bg-transparent shadow-sm hover:shadow-md"
                  asChild
                >
                  <Link href={`/products/${currentProduct.id}`}>Learn More</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative">
            <div
              className="relative bg-background/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-border group cursor-pointer"
              onMouseEnter={() => setIsAutoSliding(false)}
              onMouseLeave={() => setIsAutoSliding(true)}
            >
              <div className="relative w-full h-[500px] sm:h-[600px] overflow-hidden">
                <img
                  src={currentProduct.image || "/Placeholder.png"}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Slide Navigation */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {topProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index)
                      setIsAutoSliding(false)
                      setTimeout(() => setIsAutoSliding(true), 5000)
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-gradient-to-r from-[#01A0EA] to-[#03669A] scale-125 shadow-lg"
                        : "bg-white/70 hover:bg-white/90 backdrop-blur-sm"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 border border-white/20 opacity-0 group-hover:opacity-100 z-10"
              >
                <ArrowRight className="w-5 h-5 text-gray-700 rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 border border-white/20 opacity-0 group-hover:opacity-100 z-10"
              >
                <ArrowRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Product Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="text-xl font-bold mb-2">{currentProduct.name}</h3>
                <p className="text-sm opacity-90">Best Seller - Top performer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}