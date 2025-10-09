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
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
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
    fetchWishlist()
  }, [filters])

  // Calcul des statistiques
  const stats = {
    totalItems,
    totalValue: wishlistItems.reduce((sum, item) => sum + item.price, 0),
    totalSavings: wishlistItems.reduce((sum, item) => sum + (item.priceOriginal - item.price), 0),
    averageRating: 0, // Non disponible dans la nouvelle API
    inStockItems: wishlistItems.filter(item => item.isAvailable).length,
    outOfStockItems: wishlistItems.filter(item => !item.isAvailable).length,
    onSaleItems: wishlistItems.filter(item => item.price < item.priceOriginal).length,
  }

  if (loading || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary/80 text-primary-foreground">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
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

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary/80 text-primary-foreground">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>

          <div className="relative container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                <Heart className="h-4 w-4" />
                Your Wishlist
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your Personal Collection</h1>
              <p className="text-lg text-primary-foreground/80 max-w-md mx-auto">
                Save your favorite items and never miss a deal
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl"></div>
              <HeartCrack className="relative h-24 w-24 text-accent" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Start building your dream collection by adding products you love to your wishlist!
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <a href="/products">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Products
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
              <Heart className="h-4 w-4" />
              Your Wishlist
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your Personal Collection</h1>
              <p className="text-lg text-primary-foreground/80 max-w-md mx-auto">
                {stats.totalItems} carefully curated items worth MAD{" "}
                {stats.totalValue.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.inStockItems}</div>
                <div className="text-sm text-primary-foreground/70">In Stock</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.onSaleItems}</div>
                <div className="text-sm text-primary-foreground/70">On Sale</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <div className="text-sm text-primary-foreground/70">Total Items</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">
                  MAD {stats.totalSavings.toFixed(0)}
                </div>
                <div className="text-sm text-primary-foreground/70">Total Savings</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
              >
                <Filter className="h-5 w-5 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearWishlist}
                disabled={clearingWishlist}
                className="bg-transparent hover:bg-white/10 text-primary-foreground border-white/30"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {clearingWishlist ? "Clearing..." : "Clear Wishlist"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard
                product={{
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  comparePrice: item.priceOriginal > item.price ? item.priceOriginal : undefined,
                  savePrice: item.priceOriginal > item.price ? (item.priceOriginal - item.price).toString() : undefined,
                  brand: "",
                  category: "",
                  stock: item.stock,
                  rating: 0, // Non disponible dans la nouvelle API
                  reviewCount: 0, // Non disponible dans la nouvelle API
                  image: item.image,
                  isOnPromotion: item.price < item.priceOriginal,
                }}
              />
              {/* Bouton de suppression overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-8 h-8 p-0 bg-red-600 hover:bg-red-700 shadow-lg"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  )
}