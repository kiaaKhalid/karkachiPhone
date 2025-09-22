"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"

interface WishlistStatusDTO {
  inWishlist: boolean
  wishlistItemId: number
  addedAt: string
}

interface WishlistItemRequestDTO {
  productId: number
  notifyOnPriceChange?: boolean
  notifyOnStock?: boolean
  targetPrice?: number
}

interface WishlistItemDTO {
  id: number
  productId: number
  addedAt: string
}

interface WishlistResponseDTO {
  success: boolean
  wishlist: {
    id: number
    userId: number
    items: WishlistItemDTO[]
    updatedAt: string
  }
}

export function useWishlistApi() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [wishlistStatuses, setWishlistStatuses] = useState<Map<number, WishlistStatusDTO>>(new Map())
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map())

  const getAuthToken = () => localStorage.getItem("auth_token")

  // ✅ Vérifier statut
  const checkWishlistStatus = useCallback(
    async (productId: number): Promise<WishlistStatusDTO | null> => {
      if (!isAuthenticated) return null
      try {
        const token = getAuthToken()
        if (!token) return null

        const res = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist/status/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch status")
        const status: WishlistStatusDTO = await res.json()

        setWishlistStatuses((prev) => new Map(prev.set(productId, status)))
        return status
      } catch (e) {
        console.error("checkWishlistStatus error:", e)
        return null
      }
    },
    [isAuthenticated],
  )

  // ✅ Ajouter produit
  const addToWishlist = useCallback(
    async (productId: number, options?: Partial<WishlistItemRequestDTO>) => {
      if (!isAuthenticated) return false
      try {
        setLoadingStates((prev) => new Map(prev.set(productId, true)))

        const token = getAuthToken()
        if (!token) return false

        const body: WishlistItemRequestDTO = {
          productId,
          notifyOnPriceChange: options?.notifyOnPriceChange || false,
          notifyOnStock: options?.notifyOnStock || false,
          targetPrice: options?.targetPrice,
        }

        const res = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist/items`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error("Failed to add")

        const result: WishlistResponseDTO = await res.json()

        if (result.success) {
          // 👉 trouver le nouvel item ajouté
          const item = result.wishlist.items.find((i) => i.productId === productId)
          if (item) {
            setWishlistStatuses(
              (prev) =>
                new Map(
                  prev.set(productId, {
                    inWishlist: true,
                    wishlistItemId: item.id,
                    addedAt: item.addedAt,
                  }),
                ),
            )
          }

          toast({ title: "Ajouté", description: "Produit ajouté à ta wishlist !" })
          return true
        }
        return false
      } catch (e) {
        console.error("addToWishlist error:", e)
        toast({ title: "Erreur", description: "Impossible d’ajouter à la wishlist", variant: "destructive" })
        return false
      } finally {
        setLoadingStates((prev) => new Map(prev.set(productId, false)))
      }
    },
    [isAuthenticated, toast],
  )

  // ✅ Supprimer produit
  const removeFromWishlist = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) return false
      try {
        setLoadingStates((prev) => new Map(prev.set(productId, true)))

        const token = getAuthToken()
        if (!token) return false

        const status = wishlistStatuses.get(productId) || (await checkWishlistStatus(productId))
        if (!status?.wishlistItemId) throw new Error("WishlistItemId manquant")

        const res = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist/items/${status.wishlistItemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to delete")

        const result: WishlistResponseDTO = await res.json()

        if (result.success) {
          setWishlistStatuses(
            (prev) =>
              new Map(
                prev.set(productId, {
                  inWishlist: false,
                  wishlistItemId: 0,
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
    [isAuthenticated, toast, wishlistStatuses, checkWishlistStatus],
  )

  const toggleWishlist = useCallback(
    async (productId: number, options?: Partial<WishlistItemRequestDTO>) => {
      const status = wishlistStatuses.get(productId)
      return status?.inWishlist ? removeFromWishlist(productId) : addToWishlist(productId, options)
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
    isInWishlist: (id: number) => wishlistStatuses.get(id)?.inWishlist || false,
    isLoading: (id: number) => loadingStates.get(id) || false,
    wishlistStatuses,
  }
}
