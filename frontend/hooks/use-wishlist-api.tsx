"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"

interface WishlistStatusDTO {
  inWishlist: boolean
  wishlistItemId: string
  addedAt: string
}

interface WishlistItemRequestDTO {
  productId: string
  notifyOnPriceChange?: boolean
  notifyOnStock?: boolean
  targetPrice?: number
}

interface WishlistItemDTO {
  id: string
  productId: string
  addedAt: string
}

interface WishlistResponseDTO {
  success: boolean
  message: string
  data: any
}

export function useWishlistApi() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [wishlistStatuses, setWishlistStatuses] = useState<Map<string, WishlistStatusDTO>>(new Map())
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map())

  const getAuthToken = () => localStorage.getItem("auth_token")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // ✅ Vérifier statut
  const checkWishlistStatus = useCallback(
    async (productId: string): Promise<WishlistStatusDTO | null> => {
      if (!isAuthenticated) return null
      try {
        const token = getAuthToken()
        if (!token) return null

        const res = await fetch(`${apiUrl}/person/wishlist/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch status")
        const data: WishlistResponseDTO = await res.json()

        if (data.success) {
          const status: WishlistStatusDTO = {
            inWishlist: data.data.present,
            wishlistItemId: "",
            addedAt: "",
          }

          setWishlistStatuses((prev) => new Map(prev.set(productId, status)))
          return status
        }
        return null
      } catch (e) {
        console.error("checkWishlistStatus error:", e)
        return null
      }
    },
    [isAuthenticated],
  )

  // ✅ Ajouter produit
  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return false
      try {
        setLoadingStates((prev) => new Map(prev.set(productId, true)))

        const token = getAuthToken()
        if (!token) return false

        const body = {
          productId
        }

        const res = await fetch(`${apiUrl}/person/wishlist`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error("Failed to add")

        const result: WishlistResponseDTO = await res.json()

        if (result.success) {
          setWishlistStatuses(
            (prev) =>
              new Map(
                prev.set(productId, {
                  inWishlist: true,
                  wishlistItemId: "",
                  addedAt: new Date().toISOString(),
                }),
              ),
          )

          toast({ title: "Ajouté", description: "Produit ajouté à ta wishlist !" })
          return true
        }
        return false
      } catch (e) {
        console.error("addToWishlist error:", e)
        toast({ title: "Erreur", description: "Impossible d'ajouter à la wishlist", variant: "destructive" })
        return false
      } finally {
        setLoadingStates((prev) => new Map(prev.set(productId, false)))
      }
    },
    [isAuthenticated, toast],
  )

  // ✅ Supprimer produit
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return false
      try {
        setLoadingStates((prev) => new Map(prev.set(productId, true)))

        const token = getAuthToken()
        if (!token) return false

        const body = { productId }

        const res = await fetch(`${apiUrl}/person/wishlist`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error("Failed to delete")

        const result: WishlistResponseDTO = await res.json()

        if (result.success) {
          setWishlistStatuses(
            (prev) =>
              new Map(
                prev.set(productId, {
                  inWishlist: false,
                  wishlistItemId: "",
                  addedAt: "",
                }),
              ),
          )
          toast({ title: "Supprimé", description: "Produit retiré de ta wishlist." })
          return true
        }
        return false
      } catch (e) {
        console.error("removeFromWishlist error:", e)
        toast({ title: "Erreur", description: "Impossible de retirer", variant: "destructive" })
        return false
      } finally {
        setLoadingStates((prev) => new Map(prev.set(productId, false)))
      }
    },
    [isAuthenticated, toast],
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const status = wishlistStatuses.get(productId)
      return status?.inWishlist ? removeFromWishlist(productId) : addToWishlist(productId)
    },
    [wishlistStatuses, addToWishlist, removeFromWishlist],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistStatuses(new Map())
      setLoadingStates(new Map())
    }
  }, [isAuthenticated])

  return {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    checkWishlistStatus,
    isInWishlist: (id: string) => wishlistStatuses.get(id)?.inWishlist || false,
    isLoading: (id: string) => loadingStates.get(id) || false,
    wishlistStatuses,
  }
}