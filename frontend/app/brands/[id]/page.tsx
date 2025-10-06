"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react"

interface BrandInfo {
  name: string
  logo?: string
  description?: string
}

interface CategoryChoix {
  id: string
  name: string
  image: string
}

interface ProductItem {
  id: string
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  stock: number
  rating: string
  reviewsCount: number
  discount: number | null
  isFlashDeal: boolean
  flashPrice: string | null
  flashEndsAt: string | null
  categoryId: string
  brandId: string
}

interface PublicListData {
  items: ProductItem[]
  total: number
  page: number
  limit: number
}

interface PublicListResponse {
  success: boolean
  message: string
  data: PublicListData
}

const BrandInfoSkeleton = () => (
  <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
  </div>
)

const FiltersSkeleton = () => (
  <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0">
    <Skeleton className="h-6 w-20 mb-4" />
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </aside>
)

const ProductsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 20 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function BrandProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const brandSlug = params?.id as string

  const [initialLoading, setInitialLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [brandLoading, setBrandLoading] = useState(true)
  const [error, setError] = useState(false)
  const [products, setProducts] = useState<PublicListData | null>(null)
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const [showFilters, setShowFilters] = useState(false)
  const url = process.env.NEXT_PUBLIC_API_URL

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories])

  const fetchBrandProducts = async (apiPage = 1) => {
    if (!brandSlug) {
      setError(true)
      setInitialLoading(false)
      return
    }

    try {
      setProductsLoading(apiPage > 1)
      if (apiPage === 1) {
        setInitialLoading(true)
      }
      setError(false)

      const params = new URLSearchParams({
        page: apiPage.toString(),
        limit: "20",
      })

      if (selectedCategoryId) params.append("categoryId", selectedCategoryId)
      if (minPrice) params.append("priceMin", minPrice)
      if (maxPrice) params.append("priceMax", maxPrice)

      const response = await fetch(`${url}/public/products/brand/${brandSlug}?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch brand products")
      }

      const data: PublicListResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch brand products")
      }
      setProducts(data.data)
      setCurrentPage(data.data.page - 1)
    } catch (error) {
      console.error("Error fetching brand products:", error)
      setError(true)
    } finally {
      setInitialLoading(false)
      setProductsLoading(false)
    }
  }

  const fetchBrandInfo = async () => {
    if (!brandSlug) {
      setError(true)
      setBrandLoading(false)
      return
    }

    try {
      setBrandLoading(true)
      setError(false)
      const response = await fetch(`${url}/public/brands/${brandSlug}`)

      if (!response.ok) {
        throw new Error("Failed to fetch brand info")
      }

      const responseData = await response.json()
      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to fetch brand info")
      }
      setBrandInfo({
        name: responseData.data.name,
        logo: responseData.data.logoUrl,
        description: responseData.data.description,
      })
    } catch (error) {
      console.error("Error fetching brand info:", error)
      setError(true)
    } finally {
      setBrandLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch(`${url}/public/category`)

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data: CategoryChoix[] = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const debouncedFetchProducts = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          fetchBrandProducts(1)
        }, 500)
      }
    })(),
    [brandSlug, selectedCategoryId, minPrice, maxPrice],
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (brandSlug) {
      fetchBrandInfo()
      if (minPrice || maxPrice) {
        debouncedFetchProducts()
      } else {
        fetchBrandProducts(1)
      }
    } else {
      setError(true)
      setInitialLoading(false)
      setBrandLoading(false)
    }
  }, [brandSlug, selectedCategoryId, minPrice, maxPrice])

  const handlePageChange = (newPage: number) => {
    fetchBrandProducts(newPage + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClearFilters = () => {
    setSelectedCategoryId(null)
    setMinPrice("")
    setMaxPrice("")
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const convertToProduct = useCallback((item: ProductItem): Product => {
    const currentPriceStr = item.isFlashDeal && item.flashPrice ? item.flashPrice : item.price
    const priceNum = parseFloat(currentPriceStr)
    const origNum = parseFloat(item.originalPrice)
    const savings = Math.round((origNum - priceNum) * 100) / 100
    const categoryName = categoryMap.get(item.categoryId) || ""
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      shortDescription: null,
      price: priceNum,
      comparePrice: origNum,
      savePrice: savings > 0 ? savings.toFixed(2) : "0",
      image: item.image || "/Placeholder.png?height=300&width=300",
      category: categoryName,
      brand: brandInfo?.name || "",
      rating: parseFloat(item.rating),
      reviewCount: item.reviewsCount,
      stock: item.stock,
      isOnPromotion: savings > 0 || item.isFlashDeal,
      promotionEndDate: item.isFlashDeal ? item.flashEndsAt : null,
      specs: [],
    }
  }, [brandInfo, categoryMap])

  if (brandLoading || initialLoading || error) {
    return (
      <div className="container mx-auto px-4 h-screen flex flex-col">
        <BrandInfoSkeleton />
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          <FiltersSkeleton />
          <main className="flex-1 overflow-y-auto">
            <ProductsSkeleton />
          </main>
        </div>
      </div>
    )
  }

  if (!brandInfo || !brandSlug || !products) {
    return (
      <div className="container mx-auto px-4 h-screen flex flex-col justify-center items-center">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Brand not found.</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(products.total / products.limit)
  const currentUiPage = products.page - 1

  return (
    <div className="container mx-auto px-4 h-screen flex flex-col">
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-none">
        <div className="flex items-center gap-4 mb-4">
          {brandInfo.logo && (
            <img
              src={brandInfo.logo}
              alt={brandInfo.name}
              className="w-16 h-16 object-contain rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{brandInfo.name} - Produits</h1>
            {brandInfo.description && <p className="text-muted-foreground mt-2">{brandInfo.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        <div className="lg:hidden mb-4 flex-none">
          <Button
            onClick={toggleFilters}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-transparent"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Button>
        </div>

        <aside
          className={`
            w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 flex-shrink-0
            ${showFilters ? "block" : "hidden"}
            lg:block
          `}
        >
          <div className="flex items-center justify-between mb-4 lg:block">
            <h3 className="font-semibold">Filtres</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={selectedCategoryId || "all"} onValueChange={(value) => setSelectedCategoryId(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Toutes les catégories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-4 h-4 mr-2 inline-block"
                      />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minPrice">Prix min</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxPrice">Prix max</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <Button onClick={handleClearFilters} variant="outline" className="w-full bg-transparent">
              Réinitialiser les filtres
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {productsLoading ? (
            <ProductsSkeleton />
          ) : products.items && products.items.length > 0 ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Affichage de {products.items.length} sur {products.total} produits
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                {products.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={convertToProduct(product)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentUiPage - 1)}
                    disabled={currentUiPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, currentUiPage - 2)) + i
                      return (
                        <Button
                          key={pageNum}
                          variant={currentUiPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentUiPage + 1)}
                    disabled={currentUiPage >= totalPages - 1}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé pour cette marque avec les filtres appliqués.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}