"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Star, Loader2, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useWishlistApi } from "@/hooks/use-wishlist-api"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { LoginPopup } from "@/components/login-popup"

interface Product {
  id: string
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  stock: number
  rating: string
  isActive: boolean
  isFeatured: boolean
  reviewsCount: number
  isNew: boolean
  isBestSeller: boolean
  discount: number | null
  isFlashDeal: boolean
  flashPrice: string | null
  flashStartsAt: string | null
  flashEndsAt: string | null
  flashStock: number | null
  isPromotionalBanner: boolean
  isPromotional: boolean
  isProductphares: boolean
  isProductFlash: boolean
  categoryId: string
  brandId: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: Product[]
}

export default function MixedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const { checkWishlistStatus, toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlistApi()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [pendingWishlistProductId, setPendingWishlistProductId] = useState<string | null>(null)

  const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await fetch(`${urlBase}/public/products/phares`)

        if (!response.ok) {
          throw new Error("Failed to fetch featured products")
        }

        const data: ApiResponse = await response.json()
        setProducts(data.data || [])

        if (isAuthenticated && data.data.length > 0) {
          // Reverted to individual checkWishlistStatus calls
          data.data.forEach((product) => {
            checkWishlistStatus(product.id)
          })
        }
      } catch (err) {
        console.error("Error fetching featured products:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [isAuthenticated, checkWishlistStatus, urlBase])

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(parseFloat(amount));
  }  

  const handleWishlistClick = async (product: Product) => {
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

  const addToCartAPI = async (productId: string, quantity: number = 1) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("Aucun jeton d'authentification trouvé")

      const response = await fetch(`${urlBase}/person/cart/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const handleAddToCart = async (product: Product) => {
    try {
      // Ajouter au panier localement (pour tous les utilisateurs)
      addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        stock: product.stock,
      })

      // Appeler l'API du panier pour les utilisateurs authentifiés
      if (isAuthenticated) {
        await addToCartAPI(product.id, 1)
      } else {
        // Simulation pour les invités
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      console.log(`Added ${product.name} to cart`)
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error)
    }
  }

  const ProductSkeleton = () => (
    <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800 rounded-2xl">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
        </div>
        <div className="p-6">
          <div className="mb-3">
            <div className="h-5 rounded mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
            <div className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-4 w-20 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulseShimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Produits phares</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Découvrez notre sélection exclusive d&apos;appareils haut de gamme, soigneusement choisis dans toutes les catégories.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-[#01A0EA] hover:bg-[#0190D4] text-white px-6 py-3 rounded-xl hidden sm:flex"
            >
              <Link href="/products">Voir tout</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading || error
              ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
              : products.map((product) => {
                  const productId = product.id
                  const isWishlisted = isInWishlist(productId)
                  const wishlistLoading = isWishlistLoading(productId)

                  return (
                    <Card
                      key={product.id}
                      className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-gray-800 rounded-2xl"
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                          <img
                            src={product.image || "/Placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-md"
                              onClick={() => handleWishlistClick(product)}
                              disabled={wishlistLoading}
                            >
                              {wishlistLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                              ) : (
                                <Heart
                                  className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                                />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-md"
                              asChild
                            >
                              <Link href={`/products/${product.id}`}>
                                <Eye className="h-4 w-4 text-gray-600" />
                              </Link>
                            </Button>
                          </div>

                          {product.discount && (
                            <div className="absolute bottom-3 left-3">
                              <Badge variant="secondary" className="bg-red-500 text-white">
                                -{product.discount}%
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(parseFloat(product.rating)) ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{product.rating}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviewsCount})</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-[#01A0EA]">{formatCurrency(product.price)}</span>
                              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="bg-[#01A0EA] hover:bg-[#0190D4] text-white w-10 h-10 p-0 rounded-lg"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Button asChild size="lg" className="bg-[#01A0EA] hover:bg-[#0190D4] text-white px-8 py-3 rounded-xl">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => {
          setShowLoginPopup(false)
          setPendingWishlistProductId(null)
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
