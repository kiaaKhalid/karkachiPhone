"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Only load if it's a valid array, otherwise start with empty cart
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart)
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      // If there's an error, start with empty cart
      setItems([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("cart", JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, isLoaded])

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id)
      if (existingItem) {
        return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevItems, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
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
