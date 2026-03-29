"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import ProductSkeleton from "@/components/product-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { HeartCrack, Filter, Heart, TrendingUp, Package, Star, ShoppingBag, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useWishlist } from "@/hooks/use-wishlist"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { SlideToAction } from "@/components/ui/slide-to-action"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface WishlistItem {
  id: string
  name: string
  description: string
  image: string
  price: number
  priceOriginal: number
  stock: number
  isAvailable: boolean
}

interface WishlistResponse {
  success: boolean
  message: string
  data: {
    items: WishlistItem[]
    total: number
    page: number
    limit: number
  }
}

interface WishlistFilters {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
}

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { addItem } = useCart()
  const { removeFromWishlist } = useWishlist()
  const router = useRouter()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const getImageUrl = (img: string | null | undefined) => {
    if (!img || img === "/Placeholder.png") return "/Placeholder.png"
    if (img.startsWith("http") || img.startsWith("data:")) return img
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    const baseUrl = apiUrl.replace(/\/api$/, "")
    const cleanImg = img.startsWith("/") ? img : `/${img}`
    return `${baseUrl}${cleanImg}`
  }

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || "/Placeholder.png",
    })
    toast({
      title: "Succès",
      description: `${item.name} ajouté au panier!`,
    })
  }
  const [error, setError] = useState<string | null>(null)
  const [clearingWishlist, setClearingWishlist] = useState(false)
  const { toast } = useToast()

  const [filters, setFilters] = useState<WishlistFilters>({
    page: 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const url = process.env.NEXT_PUBLIC_API_URL

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      })

      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${url}/person/product/wishlist?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist")
      }

      const data: WishlistResponse = await response.json()

      if (data.success) {
        setWishlistItems(data.data.items)
        setTotalItems(data.data.total)
        setTotalPages(Math.ceil(data.data.total / filters.limit))
      } else {
        throw new Error("Failed to load wishlist")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wishlist")
      toast({
        title: "Error",
        description: "Failed to load wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearWishlist = async () => {
    try {
      setClearingWishlist(true)

      const token = localStorage.getItem("auth_token")

      // Supprimer chaque élément individuellement
      const deletePromises = wishlistItems.map(item =>
        fetch(`${url}/person/wishlist`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: item.id }),
        })
      )

      await Promise.all(deletePromises)
      await fetchWishlist()
      wishlistItems.forEach(item => removeFromWishlist(item.id))
      toast({
        title: "Success",
        description: "Wishlist cleared successfully!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setClearingWishlist(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${url}/person/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist")
      }

      await fetchWishlist()
      removeFromWishlist(productId)
      toast({
        title: "Success",
        description: "Item removed from wishlist!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateFilters = (newFilters: Partial<WishlistFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
      return
    }
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [filters, isAuthenticated, authLoading])

  // Calcul des statistiques
  const stats = {
    totalItems,
    totalValue: wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0),
    totalSavings: wishlistItems.reduce((sum, item) => sum + ((item.priceOriginal || item.price) - item.price), 0),
    averageRating: 0, // Non disponible dans la nouvelle API
    inStockItems: wishlistItems.filter(item => item.isAvailable).length,
    outOfStockItems: wishlistItems.filter(item => !item.isAvailable).length,
    onSaleItems: wishlistItems.filter(item => item.price < item.priceOriginal).length,
  }

  if (authLoading || loading || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary text-foreground border-b border-border/40">
          <div className="absolute inset-0 bg-black/[0.02]"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
          </div>

          <div className="relative container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-64 mx-auto bg-white/20" />
              <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
                    <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-muted/30 pt-4 pb-20">
      <div className="container mx-auto px-4 max-w-lg md:max-w-4xl">
        
        {/* Simple Header Header Header header */}
        <div className="flex justify-between items-center mb-6 px-1 animate-in fade-in slide-in-from-top-3 duration-300">
          <Link href="/">
            <button className="w-10 h-10 bg-card border border-border/20 rounded-full flex items-center justify-center shadow-sm text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Favoris</h1>
          <button 
            onClick={handleClearWishlist} 
            disabled={clearingWishlist}
            className="w-10 h-10 bg-card border border-border/20 rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="w-28 h-28 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-500/20">
              <HeartCrack className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2 text-foreground">
              Votre liste est vide
            </h1>
            <p className="text-muted-foreground mb-8 max-w-sm text-sm">
              Commencez à ajouter des produits que vous aimez à vos favoris !
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md cursor-pointer text-sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Parcourir les produits
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {showFilters && (
          <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Filter className="h-5 w-5 text-accent" />
                Filters & Sorting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sort Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-")
                      updateFilters({ sortBy, sortOrder })
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Items per page */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Items per page</Label>
                  <Select
                    value={filters.limit.toString()}
                    onValueChange={(value) => updateFilters({ limit: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                      <SelectItem value="32">32 items</SelectItem>
                      <SelectItem value="48">48 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="inStock"
                    checked={filters.sortBy === "availability"}
                    onCheckedChange={(checked) => updateFilters({ 
                      sortBy: checked ? "availability" : "name",
                      sortOrder: "desc"
                    })}
                  />
                  <Label htmlFor="inStock" className="text-sm font-medium">
                    Show Available First
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3 max-w-xl mx-auto">
          {wishlistItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-card backdrop-blur-md rounded-[24px] border border-border/10 shadow-sm relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-1 min-w-0 pr-6">
                <div>
                  <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Électronique</p>
                </div>

                <div className="flex items-end justify-between">
                  <p className="font-extrabold text-foreground text-sm md:text-base">{Number(item.price).toFixed(2)} MAD</p>
                  
                  {/* Ajouter Action Button Action Button layout mockup bounds */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1 bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Delete Heartbreak absolute overlay bounds */}
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-400 cursor-pointer p-1"
              >
                <HeartCrack className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {wishlistItems.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md p-4 border-t border-border/10 shadow-lg md:hidden animate-slide-up">
            <SlideToAction
              onSuccess={async () => {
                for (const item of wishlistItems) {
                  addItem({ id: item.id, name: item.name, price: Number(item.price), image: item.image || "/Placeholder.png" });
                }
                toast({ title: "Panier mis à jour !", description: "Tous les favoris ont été ajoutés au panier." });
              }}
              label="Glisser pour Ajouter au Panier"
              className="max-w-md mx-auto"
            />
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-border/50">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="bg-card/50 backdrop-blur-sm"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, filters.page - 2) + i
                if (pageNum > totalPages) return null

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === filters.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      pageNum === filters.page
                        ? "bg-accent hover:bg-accent/90"
                        : "bg-card/50 backdrop-blur-sm"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="bg-card/50 backdrop-blur-sm"
            >
              Next
            </Button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}