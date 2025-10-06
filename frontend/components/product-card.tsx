"use client"

import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Star, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlistApi } from "@/hooks/use-wishlist-api"
import { useAuth } from "@/hooks/use-auth"
import { LoginPopup } from "@/components/login-popup"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import AddToCartButton from "@/components/add-to-cart-button"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { checkWishlistStatus, toggleWishlist, isInWishlist, isLoading } = useWishlistApi()
  const { isAuthenticated } = useAuth()
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const handleLoginSuccess = () => {
    // Handle login success logic here
  }

  useEffect(() => {
    if (isAuthenticated && product.id) {
      checkWishlistStatus(product.id)
    }
  }, [isAuthenticated, product.id, checkWishlistStatus])

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPopup(true)
      return
    }

    await toggleWishlist(product.id)
  }

  const isWishlisted = isInWishlist(product.id)
  const wishlistLoading = isLoading(product.id)

  return (
    <>
      <div className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
        {/* Mobile horizontal layout, Desktop vertical layout */}
        <div className="flex md:flex-col flex-1">
          <Link href={`/products/${product.id}`} className="flex md:flex-col flex-1">
            <div className="relative w-24 h-24 md:w-full md:h-48 flex-shrink-0 overflow-hidden">
              <Image
                src={product.image || "/Placeholder.png"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Badge for discount */}
              {product.savePrice && (
                <div className="absolute top-1 right-1 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">%</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-3 md:p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 md:line-clamp-2 mb-1 md:mb-2">
                  {product.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 h-12 md:h-16 line-clamp-2 md:line-clamp-3 mb-2 md:mb-4 overflow-hidden">
                  {product.description || `Experience next-level performance with the ${product.name}.`}
                </p>

                {/* Rating - visible on both mobile and desktop, aligned horizontally */}
                <div className="flex items-center gap-3 mb-2 md:mb-2">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3 md:w-4 md:h-4",
                          (product.rating ?? 0) > i ? "fill-current" : "fill-gray-300 dark:fill-gray-600",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  {product.comparePrice && (
                    <span className="text-xs md:text-sm text-gray-400 line-through">
                      {product.comparePrice} MAD
                    </span>
                  )}
                  <span className="text-lg md:text-xl font-bold text-red-500">{product.price.toFixed(2)} MAD</span>
                </div>

                <div className="md:hidden">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image ?? "/Placeholder.png", // Provide fallback
                      category: product.category ?? undefined, // Handle null to undefined
                      stock: product.stock,
                    }}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          </Link>

          <div className="hidden md:block p-4 pt-0 mt-auto">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image ?? "/Placeholder.png", // Provide fallback
                category: product.category ?? undefined, // Handle null to undefined
                stock: product.stock,
              }}
              className="w-full"
            />
          </div>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 left-1 md:top-2 md:left-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
          >
            {wishlistLoading ? (
              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-gray-500" />
            ) : (
              <Heart
                className={cn(
                  "w-3 h-3 md:w-4 md:h-4 transition-colors duration-200",
                  isWishlisted
                    ? "fill-red-500 text-red-500 stroke-red-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-red-400 dark:hover:text-red-400",
                )}
              />
            )}
          </Button>
        </div>
      </div>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}