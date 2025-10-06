"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import ProductCard from "@/components/product-card"
import ProductSkeleton from "@/components/product-skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { use } from "react"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    minPrice?: string
    maxPrice?: string
    brand?: string
    sortBy?: string
    sortDir?: string
    page?: string
  }>
}

interface ProductCategoryResult {
  id: number
  name: string
  brand: string
  price: number
  image: string
  rating: number
  reviewCount: number
  stock: number
  isOnPromotion: boolean
  category: string
}

interface CategoryProductsResponse {
  category: string
  categoryName: string
  products: {
    content: ProductCategoryResult[]
    totalElements: number
    totalPages: number
    page: number
    size: number
  }
  filters: {
    brands: string[]
    priceRange: {
      min: number
      max: number
    }
  }
}

const FiltersSkeleton = () => (
  <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ml-2.5">
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
      <div>
        <Skeleton className="h-6 w-16 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </aside>
)

const ProductGridSkeleton = () => (
  <main className="flex-1">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 25 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  </main>
)

const normalizeProduct = (product: ProductCategoryResult): Product => ({
  id: product.id,
  name: product.name,
  description: "",
  shortDescription: null,
  price: product.price,
  comparePrice: "",
  savePrice: "",
  brand: product.brand,
  category: product.category,
  stock: product.stock,
  rating: product.rating,
  reviewCount: product.reviewCount,
  image: product.image || null,
  isOnPromotion: product.isOnPromotion,
  promotionEndDate: null,
  specs: [],
})

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [categoryData, setCategoryData] = useState<CategoryProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState(false)

  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)

  const { minPrice, maxPrice, brand, sortBy = "createdAt", sortDir = "desc", page = "0" } = resolvedSearchParams
  const { slug } = resolvedParams
  const currentPage = Number.parseInt(page)

  const router = useRouter()

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        if (categoryData) {
          setProductsLoading(true)
        } else {
          setLoading(true)
        }
        setError(false)

        const apiParams = new URLSearchParams({
          page: currentPage.toString(),
          size: "25",
          sortBy,
          sortDir,
        })

        if (brand) apiParams.append("brand", brand)
        if (minPrice) apiParams.append("minPrice", minPrice)
        if (maxPrice) apiParams.append("maxPrice", maxPrice)

        const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/category/${slug}?${apiParams}`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data: CategoryProductsResponse = await response.json()
        setCategoryData(data)

        if (!data.products.content || data.products.content.length === 0) {
          if (currentPage === 0) {
            notFound()
          }
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
        setProductsLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [slug, currentPage, brand, minPrice, maxPrice, sortBy, sortDir])

  const updateSearchParams = (key: string, value: string | null) => {
    const newSearchParams = new URLSearchParams(resolvedSearchParams as any)
    if (value) {
      newSearchParams.set(key, value)
    } else {
      newSearchParams.delete(key)
    }
    if (key !== "page") {
      newSearchParams.delete("page")
    }

    // Use router.push instead of window.history.pushState to trigger re-render
    router.push(`/categories/${slug}?${newSearchParams.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", newPage.toString())
  }

  if (loading && !categoryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSkeleton />
          <ProductGridSkeleton />
        </div>
      </div>
    )
  }

  if (error || !categoryData) {
    return notFound()
  }

  const { products, filters } = categoryData
  const hasFilters = minPrice || maxPrice || brand || sortBy !== "createdAt" || sortDir !== "desc"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 capitalize">{categoryData.categoryName}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ml-2.5">
          <h2 className="text-2xl font-semibold mb-6">Filtres</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Marque</h3>
              <Select
                value={brand || "all"}
                onValueChange={(value) => updateSearchParams("brand", value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {filters.brands.map((brandOption) => (
                    <SelectItem key={brandOption} value={brandOption}>
                      {brandOption}
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
                  placeholder={`Min ({filters.priceRange.min} MAD)`}
                  defaultValue={minPrice}
                  className="w-1/2"
                  onBlur={(e) => updateSearchParams("minPrice", e.target.value || null)}
                />
                <Input
                  type="number"
                  placeholder={`Max ({filters.priceRange.max} MAD)`}
                  defaultValue={maxPrice}
                  className="w-1/2"
                  onBlur={(e) => updateSearchParams("maxPrice", e.target.value || null)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Trier par</h3>
              <Select
                value={`${sortBy}-${sortDir}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortDir] = value.split("-")
                  updateSearchParams("sortBy", newSortBy)
                  updateSearchParams("sortDir", newSortDir)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Plus récent</SelectItem>
                  <SelectItem value="createdAt-asc">Plus ancien</SelectItem>
                  <SelectItem value="price-asc">Prix : du plus bas au plus élevé</SelectItem>
                  <SelectItem value="price-desc">Prix : du plus élevé au plus bas</SelectItem>
                  <SelectItem value="name-asc">Nom : A → Z</SelectItem>
                  <SelectItem value="name-desc">Nom : Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent"
                onClick={() => router.push(`/categories/${slug}`)}
              >
                <X className="mr-2 h-4 w-4" /> Réinitialiser les filtres
              </Button>
            )}
          </div>
        </aside>

        <main className="flex-1">
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 25 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : products.content.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Affichage de {products.content.length} sur {products.totalElements} produits
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {products.content.map((product) => (
                  <ProductCard key={product.id} product={normalizeProduct(product)} />
                ))}
              </div>

              {products.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, products.totalPages) }, (_, i) => {
                      let pageNum = i
                      if (products.totalPages > 5) {
                        if (currentPage < 3) {
                          pageNum = i
                        } else if (currentPage > products.totalPages - 3) {
                          pageNum = products.totalPages - 5 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= products.totalPages - 1}
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
