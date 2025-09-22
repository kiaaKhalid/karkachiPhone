"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Heart, Eye, Sparkles, Loader2 } from "lucide-react"
import AddToCartButton from "@/components/add-to-cart-button"
import { useWishlistApi } from "@/hooks/use-wishlist-api"
import { useAuth } from "@/hooks/use-auth"
import LoginPopup from "@/components/login-popup"

interface TopWishlistProductDto {
  id: number
  name: string
  description: string
  price: number
  rating: number
  reviewCount: number
  brand: string
  imageUrl: string
  wishCount: number
}

function ProductSkeleton() {
  return (
    <Card className="group border-border bg-background/80 backdrop-blur-sm relative overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Skeleton className="w-full h-48" />
          <div className="absolute top-3 left-3">
            <Skeleton className="w-12 h-6 rounded" />
          </div>
          <div className="absolute top-3 right-3">
            <Skeleton className="w-16 h-6 rounded" />
          </div>
        </div>
        <div className="p-4">
          <Skeleton className="w-24 h-3 mb-2" />
          <Skeleton className="w-16 h-3 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <div className="flex items-center mb-3">
            <Skeleton className="w-20 h-3" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-16 h-6" />
          </div>
          <Skeleton className="w-full h-8 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProductsForYouSection() {
  const { checkWishlistStatus, toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlistApi()
  const [products, setProducts] = useState<TopWishlistProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { isAuthenticated } = useAuth()
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [pendingWishlistProductId, setPendingWishlistProductId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTopWishlistProducts = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/wishlist/top-products")
        if (!response.ok) {
          throw new Error("Échec du chargement des produits")
        }
        const data: TopWishlistProductDto[] = await response.json()
        setProducts(data)

        if (isAuthenticated) {
          data.forEach((product) => {
            checkWishlistStatus(product.id)
          })
        }
      } catch (err) {
        console.error("Erreur lors du chargement des produits les plus souhaités :", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTopWishlistProducts()
  }, [isAuthenticated, checkWishlistStatus])

  const handleWishlistClick = async (product: TopWishlistProductDto) => {
    if (!isAuthenticated) {
      setPendingWishlistProductId(product.id)
      setShowLoginPopup(true)
      return
    }

    await toggleWishlist(product.id)
  }

  const handleLoginSuccess = () => {
    setShowLoginPopup(false)
    if (pendingWishlistProductId) {
      checkWishlistStatus(pendingWishlistProductId)
      setPendingWishlistProductId(null)
    }
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-blue-50/30 via-indigo-50/40 to-purple-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <div className="text-left">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-medium mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 mr-1" />
              Produits les plus souhaités
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Produits pour vous
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez les produits les plus souhaités - ce que tout le monde veut
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hidden sm:flex"
            asChild
          >
            <Link href="/recommendations">
              <Sparkles className="mr-2 h-5 w-5" />
              Voir tout
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {loading || error
            ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
            : products.map((product) => {
                const productId = product.id
                const isWishlisted = isInWishlist(productId)
                const wishlistLoading = isWishlistLoading(productId)

                return (
                  <Card
                    key={product.id}
                    className="group hover:shadow-xl transition-all duration-300 border-border bg-background/80 backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>

                    <CardContent className="p-0 relative z-10">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.imageUrl || "/Placeholder.png"}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {product.wishCount > 0 && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm px-3 py-1 font-bold shadow-sm">
                            ❤️ {product.wishCount}
                          </Badge>
                        )}

                        <Badge className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 shadow-sm">
                          {product.brand}
                        </Badge>

                        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            variant="secondary"
                            className={`w-8 h-8 p-0 shadow-md transition-colors duration-300 ${
                              isWishlisted
                                ? "bg-red-100 hover:bg-red-200 text-red-600"
                                : "bg-white/90 hover:bg-white text-gray-600"
                            }`}
                            onClick={() => handleWishlistClick(product)}
                            disabled={wishlistLoading}
                          >
                            {wishlistLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
                            ) : (
                              <Heart
                                className={`w-3 h-3 ${
                                  isWishlisted ? "fill-red-600 text-red-600" : "fill-gray-600 text-gray-600"
                                }`}
                              />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-md"
                            asChild
                          >
                            <Link href={`/products/${product.id}`}>
                              <Eye className="w-3 h-3 text-gray-600" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                            {product.wishCount > 50
                              ? "Très souhaité"
                              : product.wishCount > 20
                                ? "Choix populaire"
                                : "Montée en popularité"}
                          </span>
                        </div>

                        <div className="mb-2">
                          <span className="text-xs text-muted-foreground">{product.brand}</span>
                        </div>

                        <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-blue-500 transition-colors">
                          {product.name}
                        </h3>

                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold text-foreground">{product.price} MAD</span>
                          </div>
                        </div>

                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.imageUrl,
                            category: product.brand,
                            stock: 100, // Stock par défaut
                          }}
                          variant="compact"
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs shadow-md hover:shadow-lg"
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
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href="/recommendations">
              <Sparkles className="mr-2 h-5 w-5" />
              Voir plus de recommandations
            </Link>
          </Button>
        </div>
      </div>

      {showLoginPopup && (
        <LoginPopup
          isOpen={showLoginPopup}
          onClose={() => {
            setShowLoginPopup(false)
            setPendingWishlistProductId(null)
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </section>
  )
}
