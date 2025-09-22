"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Star, Heart, Eye, Zap, Loader2 } from "lucide-react"
import AddToCartButton from "@/components/add-to-cart-button"
import { useWishlistApi } from "@/hooks/use-wishlist-api"
import { useAuth } from "@/hooks/use-auth"
import LoginPopup from "@/components/login-popup"

interface Deal {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  discountPercentage: number
  savingsAmount: number
  image: string
  rating: number
  reviewCount: number
  stock: number
  dealType: string
  dealEndDate: string
  timeRemaining: string
}

interface DealResponse {
  deals: Deal[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export default function DealsSection() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }[]>([])
  const { checkWishlistStatus, toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlistApi()
  const { isAuthenticated } = useAuth()
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [pendingWishlistProductId, setPendingWishlistProductId] = useState<number | null>(null)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/deals?page=0&size=6")
        if (!response.ok) throw new Error("Failed to fetch deals")

        const data: DealResponse = await response.json()
        setDeals(data.deals)

        if (isAuthenticated) {
          data.deals.forEach((deal) => {
            checkWishlistStatus(deal.id)
          })
        }

        const initialTimers = data.deals.map((deal) => {
          if (deal.timeRemaining) {
            const parts = deal.timeRemaining.split(":")
            return {
              hours: Number.parseInt(parts[0] || "0"),
              minutes: Number.parseInt(parts[1] || "0"),
              seconds: Number.parseInt(parts[2] || "0"),
            }
          }
          return { hours: 0, minutes: 0, seconds: 0 }
        })
        setTimeLeft(initialTimers)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [isAuthenticated, checkWishlistStatus])

  useEffect(() => {
    if (deals.length === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) =>
        prevTime.map((time) => {
          let { hours, minutes, seconds } = time

          if (seconds > 0) {
            seconds--
          } else if (minutes > 0) {
            minutes--
            seconds = 59
          } else if (hours > 0) {
            hours--
            minutes = 59
            seconds = 59
          }

          return { hours, minutes, seconds }
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [deals])

  const handleWishlistClick = async (deal: Deal) => {
    if (!isAuthenticated) {
      setPendingWishlistProductId(deal.id)
      setShowLoginPopup(true)
      return
    }

    await toggleWishlist(deal.id)
  }

  const handleLoginSuccess = () => {
    setShowLoginPopup(false)
    if (pendingWishlistProductId) {
      checkWishlistStatus(pendingWishlistProductId)
      setPendingWishlistProductId(null)
    }
  }

  const SkeletonCard = () => (
    <Card className="group border-border bg-background/80 backdrop-blur-sm relative overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Fix this line by removing animate-pulse */}
          <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer"></div>
          <div className="absolute top-3 left-3 w-12 h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="absolute top-3 right-3 w-16 h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3">
          <div className="w-16 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="w-3/4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-20 h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-full h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="w-full h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-yellow-50/10 via-amber-50/20 to-orange-50/10 dark:from-gray-800 dark:via-gray-900 dark:to-amber-900/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <div className="text-left">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-medium mb-4 animate-pulse shadow-sm">
              <Zap className="w-4 h-4 mr-1" />
              Offres Limitées
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Bons Plans Flash
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Ne ratez pas ces offres exceptionnelles à durée limitée. Dépêchez-vous, les stocks sont limités !
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hidden sm:flex"
            asChild
          >
            <Link href="/deals">
              <Zap className="mr-2 h-5 w-5" />
              Voir Tout
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {loading || error
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : deals.map((deal, index) => {
                const productId = deal.id
                const isWishlisted = isInWishlist(productId)
                const wishlistLoading = isWishlistLoading(productId)

                return (
                  <Card
                    key={deal.id}
                    className="group hover:shadow-xl transition-all duration-300 border-border bg-background/80 backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>

                    <CardContent className="p-0 relative z-10">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={deal.image || "/Placeholder.png"}
                          alt={deal.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 font-bold shadow-sm">
                          -{Math.round(deal.discountPercentage)}%
                        </Badge>

                        <Badge className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 animate-pulse shadow-sm">
                          {deal.dealType}
                        </Badge>

                        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-md"
                            onClick={() => handleWishlistClick(deal)}
                            disabled={wishlistLoading}
                          >
                            {wishlistLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
                            ) : (
                              <Heart
                                className={`w-3 h-3 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                              />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-md"
                            asChild
                          >
                            <Link href={`/products/${deal.id}`}>
                              <Eye className="w-3 h-3 text-gray-600" />
                            </Link>
                          </Button>
                        </div>

                        {deal.stock <= 10 && (
                          <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                            Plus que {deal.stock} en stock !
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs text-muted-foreground">{deal.category}</span>
                        </div>

                        <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-orange-500 transition-colors">
                          {deal.name}
                        </h3>

                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(deal.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">({deal.reviewCount})</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold text-foreground">{deal.price} MAD</span>
                            <span className="text-sm text-muted-foreground line-through">{deal.originalPrice} MAD</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-center space-x-1 text-xs font-mono">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="text-orange-600 dark:text-orange-400 font-semibold">
                              {String(timeLeft[index]?.hours || 0).padStart(2, "0")}:
                              {String(timeLeft[index]?.minutes || 0).padStart(2, "0")}:
                              {String(timeLeft[index]?.seconds || 0).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="text-center text-xs text-muted-foreground mt-1">Temps Restant</div>
                        </div>

                        <AddToCartButton
                          product={{
                            id: deal.id,
                            name: deal.name,
                            price: deal.price,
                            image: deal.image,
                            category: deal.category,
                            stock: deal.stock,
                          }}
                          variant="compact"
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs shadow-md hover:shadow-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        <div className="text-center sm:hidden">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            asChild
          >
            <Link href="/deals">
              <Zap className="mr-2 h-5 w-5" />
              Voir Tous les Bons Plans Flash
            </Link>
          </Button>
        </div>
      </div>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => {
          setShowLoginPopup(false)
          setPendingWishlistProductId(null)
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </section>
  )
}
