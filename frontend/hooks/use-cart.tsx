"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { useAuth } from "./use-auth"
import { useToast } from "@/components/ui/use-toast"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category?: string
  brand?: string
  stock?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const API = process.env.NEXT_PUBLIC_API_URL

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  // Load from API or LocalStorage
  const fetchCart = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        // Fetch from API
        const res = await fetch(`${API}/person/cart`, { headers: getHeaders() })
        const json = await res.json()
        if (json.success && json.data?.items) {
          const apiItems = json.data.items.map((apiItem: any) => ({
            id: apiItem.productId,
            name: apiItem.product?.name || "Produit",
            price: Number(apiItem.price),
            image: apiItem.product?.image || "/Placeholder.png",
            quantity: apiItem.quantity,
          }))
          setItems(apiItems)
        }
      } else {
        // Load from LocalStorage
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) setItems(parsedCart)
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsLoaded(true)
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Sync guest cart to API after login
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated && isLoaded) {
        const localCartStr = localStorage.getItem("cart")
        if (localCartStr) {
          try {
            const localCart = JSON.parse(localCartStr)
            if (Array.isArray(localCart) && localCart.length > 0) {
              const itemsToAdd = localCart.map((i) => ({ productId: i.id, quantity: i.quantity }))
              await fetch(`${API}/person/cart/items/all`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ items: itemsToAdd }),
              })
              // Clear local mapping to avoid re-syncing over and over
              localStorage.removeItem("cart")
              // Refetch to get the merged reality
              await fetchCart()
              toast({ title: "Panier synchronisé", description: "Vos articles ont été ajoutés à votre compte." })
            }
          } catch (err) {
            console.error("Error syncing cart data", err)
          }
        }
      }
    }
    syncGuestCart()
  }, [isAuthenticated, isLoaded, fetchCart, toast])

  // Save to localStorage if not authenticated
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isLoaded, isAuthenticated])

  const addItem = async (newItem: Omit<CartItem, "quantity">) => {
    // Optimistic update
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === newItem.id)
      if (existing) {
        return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevItems, { ...newItem, quantity: 1 }]
    })

    toast({
      title: "Produit ajouté",
      description: `${newItem.name} a été ajouté à votre panier.`,
    })

    if (isAuthenticated) {
      try {
        await fetch(`${API}/person/cart/items`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ productId: newItem.id, quantity: 1 }),
        })
      } catch (err) {
        console.error("Add item API failed", err)
        fetchCart() // Revert on failure
      }
    }
  }

  const removeItem = async (id: string) => {
    // Optimistic update
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))

    if (isAuthenticated) {
      try {
        await fetch(`${API}/person/cart/items/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
      } catch (err) {
        console.error("Remove item API failed", err)
        fetchCart()
      }
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))

    if (isAuthenticated) {
      try {
        await fetch(`${API}/person/cart/items/${id}`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ quantity }),
        })
      } catch (err) {
        console.error("Update qty API failed", err)
        fetchCart()
      }
    }
  }

  const clearCart = async () => {
    setItems([])
    if (isAuthenticated) {
      try {
        await fetch(`${API}/person/cart/clear`, {
          method: "DELETE",
          headers: getHeaders(),
        })
      } catch (err) {
        console.error("Clear cart API failed", err)
        fetchCart()
      }
    } else {
      localStorage.removeItem("cart")
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}