"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react"

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
  description: string
}

interface BrandInfo {
  name: string
  logo: string
  description: string
}

interface ProductsPage {
  content: ProductCategoryResult[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

interface BrandProductsResponse {
  brand: string
  brandInfo: BrandInfo
  products: ProductsPage
}

interface CategoryChoix {
  id: number
  name: string
  image: string
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
  <aside className="w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
  const brandSlug = params?.slug as string

  const [initialLoading, setInitialLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [brandData, setBrandData] = useState<BrandProductsResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortDir, setSortDir] = useState<string>("desc")

  const [showFilters, setShowFilters] = useState(false)

  const fetchBrandProducts = async (page = 0, isInitialLoad = false) => {
    if (!brandSlug) {
      setError(true)
      setInitialLoading(false)
      return
    }

    try {
      if (isInitialLoad) {
        setInitialLoading(true)
      } else {
        setProductsLoading(true)
      }
      setError(false)

      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
        sortBy,
        sortDir,
      })

      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/brand/${brandSlug}?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch brand products")
      }

      const data: BrandProductsResponse = await response.json()
      setBrandData(data)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching brand products:", error)
      setError(true)
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false)
      } else {
        setProductsLoading(false)
      }
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/category/all")

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
          fetchBrandProducts(0)
        }, 500)
      }
    })(),
    [brandSlug, selectedCategory, minPrice, maxPrice, sortBy, sortDir],
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (brandSlug) {
      if (minPrice || maxPrice) {
        debouncedFetchProducts()
      } else {
        const isFirstLoad = !brandData
        fetchBrandProducts(0, isFirstLoad)
      }
    } else {
      setError(true)
      setInitialLoading(false)
    }
  }, [brandSlug, selectedCategory, minPrice, maxPrice, sortBy, sortDir])

  const handlePageChange = (newPage: number) => {
    fetchBrandProducts(newPage, false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("createdAt")
    setSortDir("desc")
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  if (initialLoading || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BrandInfoSkeleton />
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSkeleton />
          <main className="flex-1">
            <ProductsSkeleton />
          </main>
        </div>
      </div>
    )
  }

  if (!brandData || !brandSlug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Brand not found.</p>
        </div>
      </div>
    )
  }

  const { brandInfo, products } = brandData

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-4">
          {brandInfo.logo && (
            <img
              src={brandInfo.logo || "/Placeholder.png"}
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

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:hidden mb-4">
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
          w-full lg:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
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

            <div>
              <Label htmlFor="sortBy">Trier par</Label>
              <Select
                value={`${sortBy}-${sortDir}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortDir] = value.split("-")
                  setSortBy(newSortBy)
                  setSortDir(newSortDir)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Plus récent</SelectItem>
                  <SelectItem value="createdAt-asc">Plus ancien</SelectItem>
                  <SelectItem value="price-asc">Prix : croissant</SelectItem>
                  <SelectItem value="price-desc">Prix : décroissant</SelectItem>
                  <SelectItem value="name-asc">Nom : A → Z</SelectItem>
                  <SelectItem value="name-desc">Nom : Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleClearFilters} variant="outline" className="w-full bg-transparent">
            Réinitialiser les filtres
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          {productsLoading ? (
            <ProductsSkeleton />
          ) : products.content && products.content.length > 0 ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                Affichage de {products.content.length} sur {products.totalElements} produits
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                {products.content.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      shortDescription: null,
                      price: product.price,
                      comparePrice: "",
                      savePrice: "",
                      image: product.image || "/Placeholder.png?height=300&width=300",
                      category: product.category,
                      brand: product.brand,
                      rating: product.rating,
                      reviewCount: product.reviewCount,
                      stock: product.stock,
                      isOnPromotion: product.isOnPromotion,
                      promotionEndDate: null,
                      specs: [],
                    }}
                  />
                ))}
              </div>

              {products.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, products.totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(products.totalPages - 5, currentPage - 2)) + i
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
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé pour cette marque avec les filtres appliqués.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
