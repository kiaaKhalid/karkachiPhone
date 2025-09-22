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

interface WishlistItemDTO {
  id: number
  productId: number
  name: string
  slug: string
  brand: string
  brandSlug: string
  category: string
  categorySlug: string
  price: number
  originalPrice: number
  discount: number
  discountPercentage: number
  currency: string
  image: string
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  inStock: boolean
  specifications: Record<string, string>
  variants: ProductVariantDTO[]
  addedAt: string
  priceHistory: PriceHistoryDTO[]
  isOnSale: boolean
  saleEndDate: string
  notifications: NotificationsDTO
  tags: string[]
  restockDate: string
  removedAt: string
}

interface ProductVariantDTO {
  color: string
  colorCode: string
  storage: string
  price: number
  stock: number
}

interface PriceHistoryDTO {
  price: number
  date: string
}

interface NotificationsDTO {
  priceChange: boolean
  stockAlert: boolean
  targetPrice: number
}

interface WishlistSummaryDTO {
  totalItems: number
  totalValue: number
  totalSavings: number
  averageRating: number
  inStockItems: number
  outOfStockItems: number
  onSaleItems: number
  currency: string
}

interface CategoryCountDTO {
  slug: string
  name: string
  count: number
}

interface BrandCountDTO {
  slug: string
  name: string
  count: number
}

interface PriceRangeDTO {
  min: number
  max: number
}

interface WishlistFiltersDTO {
  categories: CategoryCountDTO[]
  brands: BrandCountDTO[]
  priceRange: PriceRangeDTO
}

interface PaginationDTO {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface WishlistDTO {
  id: number
  userId: number
  items: WishlistItemDTO[]
  pagination: PaginationDTO
  summary: WishlistSummaryDTO
  filters: WishlistFiltersDTO
  updatedAt: string
}

interface WishlistResponseDTO {
  success: boolean
  wishlist: WishlistDTO
}

interface WishlistFilters {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
  category?: string
  brand?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  onSale?: boolean
}

export default function WishlistPage() {
  const [wishlistData, setWishlistData] = useState<WishlistDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clearingWishlist, setClearingWishlist] = useState(false)
  const { toast } = useToast()

  const [filters, setFilters] = useState<WishlistFilters>({
    page: 1,
    limit: 20,
    sortBy: "addedAt",
    sortOrder: "desc",
  })

  const [showFilters, setShowFilters] = useState(false)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      if (filters.category) params.append("category", filters.category)
      if (filters.brand) params.append("brand", filters.brand)
      if (filters.priceMin) params.append("priceMin", filters.priceMin.toString())
      if (filters.priceMax) params.append("priceMax", filters.priceMax.toString())
      if (filters.inStock !== undefined) params.append("inStock", filters.inStock.toString())
      if (filters.onSale !== undefined) params.append("onSale", filters.onSale.toString())

      const token = localStorage.getItem("auth_token")

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist")
      }

      const data: WishlistResponseDTO = await response.json()

      if (data.success) {
        setWishlistData(data.wishlist)
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

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to clear wishlist")
      }

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

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  if (!wishlistData || !wishlistData.items || wishlistData.items.length === 0) {
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
                {wishlistData.summary.totalItems} carefully curated items worth {wishlistData.summary.currency}{" "}
                {wishlistData.summary.totalValue.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{wishlistData.summary.inStockItems}</div>
                <div className="text-sm text-primary-foreground/70">In Stock</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{wishlistData.summary.onSaleItems}</div>
                <div className="text-sm text-primary-foreground/70">On Sale</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{wishlistData.summary.averageRating.toFixed(1)}</div>
                <div className="text-sm text-primary-foreground/70">Avg Rating</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">
                  {wishlistData.summary.currency} {wishlistData.summary.totalSavings.toFixed(0)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <SelectItem value="addedAt-desc">Recently Added</SelectItem>
                      <SelectItem value="addedAt-asc">Oldest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) => updateFilters({ category: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {wishlistData.filters.categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Brand</Label>
                  <Select
                    value={filters.brand || "all"}
                    onValueChange={(value) => updateFilters({ brand: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {wishlistData.filters.brands.map((brand) => (
                        <SelectItem key={brand.slug} value={brand.slug}>
                          {brand.name} ({brand.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="bg-background/50"
                      value={filters.priceMin || ""}
                      onChange={(e) => updateFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="bg-background/50"
                      value={filters.priceMax || ""}
                      onChange={(e) => updateFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="inStock"
                    checked={filters.inStock || false}
                    onCheckedChange={(checked) => updateFilters({ inStock: checked ? true : undefined })}
                  />
                  <Label htmlFor="inStock" className="text-sm font-medium">
                    In Stock Only
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="onSale"
                    checked={filters.onSale || false}
                    onCheckedChange={(checked) => updateFilters({ onSale: checked ? true : undefined })}
                  />
                  <Label htmlFor="onSale" className="text-sm font-medium">
                    On Sale Only
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistData.items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.productId,
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
              }}
              onRemoveFromWishlist={() => handleRemoveFromWishlist(item.productId)}
              showWishlistDate={true}
              wishlistDate={item.addedAt}
            />
          ))}
        </div>

        {wishlistData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-border/50">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePageChange(wishlistData.pagination.page - 1)}
              disabled={!wishlistData.pagination.hasPrev}
              className="bg-card/50 backdrop-blur-sm"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, wishlistData.pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, wishlistData.pagination.page - 2) + i
                if (pageNum > wishlistData.pagination.totalPages) return null

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === wishlistData.pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      pageNum === wishlistData.pagination.page
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
              onClick={() => handlePageChange(wishlistData.pagination.page + 1)}
              disabled={!wishlistData.pagination.hasNext}
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
