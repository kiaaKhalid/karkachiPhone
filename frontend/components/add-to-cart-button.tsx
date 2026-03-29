"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
  stock: number
}

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "icon" | "compact"
  className?: string
  disabled?: boolean
}

// Couleurs par catégorie
const categoryColors = {
  smartphones: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
  laptops: "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  tablets: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
  smartwatches: "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
  audio: "from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600",
  cameras: "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-700",
  gaming: "from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
  accessories: "from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600",
  playstation: "from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700",
  default: "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
}

export default function AddToCartButton({
  product,
  variant = "default",
  className,
  disabled = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const url = process.env.NEXT_PUBLIC_API_URL

  // Déterminer la catégorie
  const getCurrentCategory = (): keyof typeof categoryColors => {
    const urlCategory = pathname.split("/categories/")[1]?.split("/")[0] as keyof typeof categoryColors | undefined
    if (urlCategory && urlCategory in categoryColors) {
      return urlCategory
    }

    const productCategory = product.category?.toLowerCase() as keyof typeof categoryColors | undefined
    if (productCategory && productCategory in categoryColors) {
      return productCategory
    }

    return "default"
  }

  const currentCategory = getCurrentCategory()
  const colorClasses = categoryColors[currentCategory]

  const addToCartAPI = async (productId: string, quantity = 1) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("Aucun jeton d'authentification trouvé")

      const response = await fetch(`${url}/person/cart/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          productId: productId,
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

  const handleAddToCart = async () => {
    if (disabled || isAdding || product.stock === 0) return

    setIsAdding(true)

    try {
      if (isAuthenticated) {
        await addToCartAPI(product.id)
      } else {
        // Simulation pour les invités
        await new Promise((resolve) => setTimeout(resolve, 500))

        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        })
      }

      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      if (isAuthenticated) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
      }
    } finally {
      setIsAdding(false)
    }
  }

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-300 transform",
    "bg-gradient-to-r text-white font-medium",
    "hover:scale-105 hover:shadow-lg",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    colorClasses,
  )

  if (variant === "icon") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || product.stock === 0}
        size="icon"
        className={cn(baseClasses, "h-10 w-10 rounded-full", className)}
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : justAdded ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    )
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || product.stock === 0}
        size="sm"
        className={cn(baseClasses, "px-3 py-1.5 text-xs rounded-full", className)}
      >
        {isAdding ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Ajout...
          </>
        ) : justAdded ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Ajouté !
          </>
        ) : (
          <>
            <ShoppingCart className="h-3 w-3 mr-1" />
            Ajouter
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || product.stock === 0}
      className={cn(baseClasses, "px-6 py-3 rounded-xl shadow-md", className)}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Ajout au panier...
        </>
      ) : justAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Ajouté au panier !
        </>
      ) : product.stock === 0 ? (
        "Rupture de stock"
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ajouter au panier
        </>
      )}
    </Button>
  )
}