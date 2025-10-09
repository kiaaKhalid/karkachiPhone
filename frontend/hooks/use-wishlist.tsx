"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
  refreshWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const { user, isAuthenticated } = useAuth()

  // Charger le wishlist depuis localStorage
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
      } else {
        setWishlist([])
      }
    } else {
      setWishlist([])
    }
  }

  // Charger à chaque changement d'utilisateur
  useEffect(() => {
    loadWishlistFromStorage()
  }, [user, isAuthenticated])

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist))
    }
  }, [wishlist, user, isAuthenticated])

  const addToWishlist = (product: Product) => {
    if (!isAuthenticated) return

    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    if (!isAuthenticated) return
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    if (!isAuthenticated) return false
    return wishlist.some((item) => item.id === productId)
  }

  const clearWishlist = () => {
    if (!isAuthenticated) return
    setWishlist([])
  }

  const refreshWishlist = () => {
    loadWishlistFromStorage()
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
