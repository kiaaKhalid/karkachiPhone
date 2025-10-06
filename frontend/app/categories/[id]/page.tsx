"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { notFound, useRouter, useParams, useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import ProductSkeleton from "@/components/product-skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Product } from "@/lib/types"

interface CategoryChoix {
  id: string
  name: string
  image: string
}

interface BrandLogo {
  id: string
  name: string
  logoUrl: string
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

interface BrandsResponse {
  success: boolean
  message: string
  data: BrandLogo[]
}

const FiltersSkeleton = () => (
  <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 ml-2.5">
    <Skeleton className="h-8 w-20 mb-6" />
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-24 mb-3" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-16 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </aside>
)

const ProductGridSkeleton = () => (
  <main className="flex-1 overflow-y-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 25 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  </main>
)

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [brands, setBrands] = useState<BrandLogo[]>([])
  const [products, setProducts] = useState<PublicListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState(false)

  const params = useParams()
  const searchParams = useSearchParams()
  
  const id = params.id as string
  const minPrice = searchParams.get('minPrice') || undefined
  const maxPrice = searchParams.get('maxPrice') || undefined
  const brand = searchParams.get('brand') || undefined
  const page = searchParams.get('page') || "0"
  
  const currentPage = Number.parseInt(page)
  const url = process.env.NEXT_PUBLIC_API_URL

  const router = useRouter()

  const category = useMemo(() => 
    categories.find(c => c.id === id), [categories, id]
  )

  const brandMap = useMemo(() => new Map(brands.map(b => [b.id, b.name])), [brands])

  const normalizeProduct = useCallback((item: ProductItem): Product => {
    const currentPriceStr = item.isFlashDeal && item.flashPrice ? item.flashPrice : item.price
    const priceNum = parseFloat(currentPriceStr)
    const origNum = parseFloat(item.originalPrice)
    const savings = Math.round((origNum - priceNum) * 100) / 100
    const brandName = brandMap.get(item.brandId) || ""
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      shortDescription: null,
      price: priceNum,
      comparePrice: origNum,
      savePrice: savings > 0 ? savings.toFixed(2) : "0",
      image: item.image || "/Placeholder.png?height=300&width=300",
      category: category?.name || "",
      brand: brandName,
      rating: parseFloat(item.rating),
      reviewCount: item.reviewsCount,
      stock: item.stock,
      isOnPromotion: savings > 0 || item.isFlashDeal,
      promotionEndDate: item.isFlashDeal ? item.flashEndsAt : null,
      specs: [],
    }
  }, [brandMap, category])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/public/category`)
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data: CategoryChoix[] = await response.json()
      setCategories(data)
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${url}/public/brands/logo`)
      if (!response.ok) {
        throw new Error("Failed to fetch brands")
      }
      const data: BrandsResponse = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (err) {
      console.error("Error fetching brands:", err)
    }
  }

  const fetchCategoryProducts = async (apiPage = 1) => {
    if (!category) {
      setError(true)
      setLoading(false)
      return
    }

    try {
      setProductsLoading(apiPage > 1)
      if (apiPage === 1) {
        setLoading(true)
      }
      setError(false)

      const params = new URLSearchParams({
        page: apiPage.toString(),
        limit: "25",
      })

      if (brand) params.append("brandId", brand)
      if (minPrice) params.append("priceMin", minPrice)
      if (maxPrice) params.append("priceMax", maxPrice)

      const response = await fetch(`${url}/public/products/category/${category.id}?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch category products")
      }

      const data: PublicListResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch category products")
      }
      setProducts(data.data)

      if (data.data.items.length === 0 && apiPage === 1) {
        notFound()
      }
    } catch (error) {
      console.error("Error fetching category products:", error)
      setError(true)
    } finally {
      setLoading(false)
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && !category) {
      notFound()
    }
    if (category) {
      fetchCategoryProducts(1)
    }
  }, [category])

  useEffect(() => {
    if (category) {
      const apiPage = currentPage + 1
      fetchCategoryProducts(apiPage)
    }
  }, [currentPage, brand, minPrice, maxPrice, category])

  const updateSearchParams = (key: string, value: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (value) {
      newSearchParams.set(key, value)
    } else {
      newSearchParams.delete(key)
    }
    if (key !== "page") {
      newSearchParams.delete("page")
    }
    router.push(`/categories/${id}?${newSearchParams.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", newPage.toString())
  }

  const handleClearFilters = () => {
    router.push(`/categories/${id}`)
  }

  if (loading && !products) {
    return (
      <div className="container mx-auto px-4 h-screen flex flex-col">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          <FiltersSkeleton />
          <ProductGridSkeleton />
        </div>
      </div>
    )
  }

  if (error || !category || !products) {
    return notFound()
  }

  const totalPages = Math.ceil(products.total / products.limit)
  const currentUiPage = products.page - 1
  const hasFilters = minPrice || maxPrice || brand

  return (
    <div className="container mx-auto px-4 h-screen flex flex-col">
      <h1 className="text-4xl font-bold mb-8 capitalize flex-none">{category.name}</h1>
      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex-shrink-0 ml-2.5">
          <h2 className="text-2xl font-semibold mb-6">Filtres</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Marque</h3>
              <Select
                value={brand || "all"}
                onValueChange={(value) => updateSearchParams("brand", value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les marques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {brands.map((brandOption) => (
                    <SelectItem key={brandOption.id} value={brandOption.id}>
                      {brandOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Plage de prix</h3>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  placeholder="0"
                  defaultValue={minPrice}
                  className="w-1/2"
                  onBlur={(e) => updateSearchParams("minPrice", e.target.value || null)}
                />
                <Input
                  type="number"
                  placeholder="10000"
                  defaultValue={maxPrice}
                  className="w-1/2"
                  onBlur={(e) => updateSearchParams("maxPrice", e.target.value || null)}
                />
              </div>
            </div>

            {hasFilters && (
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent"
                onClick={handleClearFilters}
              >
                <X className="mr-2 h-4 w-4" /> Réinitialiser les filtres
              </Button>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 25 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : products.items.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Affichage de {products.items.length} sur {products.total} produits
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {products.items.map((product) => (
                  <ProductCard key={product.id} product={normalizeProduct(product)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentUiPage - 1)}
                    disabled={currentUiPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i
                      if (totalPages > 5) {
                        if (currentUiPage < 3) {
                          pageNum = i
                        } else if (currentUiPage > totalPages - 3) {
                          pageNum = totalPages - 5 + i
                        } else {
                          pageNum = currentUiPage - 2 + i
                        }
                      }
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
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Aucun produit ne correspond à vos critères.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}