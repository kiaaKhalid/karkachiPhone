"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  clearWishlist: () => void
  wishlistCount: number
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const { user, isAuthenticated } = useAuth()

  const fetchWishlistFromAPI = async () => {
    if (!isAuthenticated || !user) {
      setWishlist([])
      return
    }

    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.wishlist?.items) {
          // Convert API items to Product format
          const products: Product[] = data.wishlist.items.map((item: any) => ({
            id: item.productId.toString(),
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            image: item.image,
            images: item.images,
            rating: item.rating,
            reviewCount: item.reviewCount,
            brand: item.brand,
            category: item.category,
            inStock: item.inStock,
            isOnSale: item.isOnSale,
            discount: item.discountPercentage,
            slug: item.slug,
          }))
          setWishlist(products)
        }
      }
    } catch (error) {
      console.error("Failed to fetch wishlist from API:", error)
      // Fallback to localStorage for backward compatibility
      loadWishlistFromStorage()
    }
  }

  const loadWishlistFromStorage = () => {
    if (isAuthenticated && user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`)
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist))
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage:", error)
          setWishlist([])
        }
      }
    } else {
      setWishlist([])
    }
  }

  // Load wishlist when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlistFromAPI()
    } else {
      setWishlist([])
    }
  }, [user, isAuthenticated])

  // Save wishlist to localStorage for backward compatibility
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist))
    }
  }, [wishlist, user, isAuthenticated])

  const addToWishlist = (product: Product) => {
    if (!isAuthenticated) return

    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: number) => {
    if (!isAuthenticated) return

    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: number) => {
    if (!isAuthenticated) return false
    return wishlist.some((item) => item.id === productId)
  }

  const clearWishlist = () => {
    if (!isAuthenticated) return
    setWishlist([])
  }

  const refreshWishlist = async () => {
    await fetchWishlistFromAPI()
  }

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
    refreshWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
