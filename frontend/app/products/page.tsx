"use client"
import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Interfaces pour le backend
interface ProductFeaturedDetaileResponse {
  id: number
  name: string
  description: string
  price: number
  rating: number
  reviewCount: number
  brand: string
  imageUrl: string
  stock: number
  minStock: number
  maxStock: number
}

interface ProductSearchResult {
  id: number
  name: string
  brand: string
  category: string
  price: number
  image: string
  rating: number
  reviewCount: number
  stock: number
  relevanceScore: number
  highlightedText: string
}

interface SearchResponse {
  content: ProductSearchResult[]
  query: string
  totalResults: number
  page: number
  size: number
  totalPages: number
}

interface PageResponse {
  content: ProductFeaturedDetaileResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Interface Product pour le frontend
export interface Product {
  id: number
  name: string
  description?: string
  shortDescription?: string | null
  price: number
  comparePrice?: string
  savePrice?: string
  brand?: string
  category?: string | null
  stock: number
  rating?: number
  reviewCount?: number
  image?: string | null
  minStock?: number
  maxStock?: number
}

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
)

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const productsPerPage = 24

  const fetchAllProducts = async (page: number) => {
    try {
      setLoading(true)
      setError(false)
      const response = await fetch(
        `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/all?page=${page - 1}&size=${productsPerPage}`
      )
      if (!response.ok) throw new Error("Impossible de récupérer les produits")
      const data: PageResponse = await response.json()
      setProducts(data.content.map(normalizeProduct))
      setTotalPages(data.totalPages)
      setTotalResults(data.totalElements)
      setIsSearching(false)
    } catch (error) {
      console.error(error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (query: string, page: number) => {
    try {
      setLoading(true)
      setError(false)
      const response = await fetch(
        `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/search?query=${encodeURIComponent(
          query
        )}&page=${page - 1}&size=${productsPerPage}&sortBy=relevance`
      )
      if (!response.ok) throw new Error("Impossible de rechercher les produits")
      const data: SearchResponse = await response.json()
      setProducts(data.content.map(normalizeProduct))
      setTotalPages(data.totalPages)
      setTotalResults(data.totalResults)
      setIsSearching(true)
    } catch (error) {
      console.error(error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllProducts(1)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery.trim(), 1)
      setCurrentPage(1)
    } else {
      fetchAllProducts(1)
      setCurrentPage(1)
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    if (searchQuery.trim() && isSearching) {
      searchProducts(searchQuery.trim(), page)
    } else {
      fetchAllProducts(page)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPrevious = () => currentPage > 1 && goToPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && goToPage(currentPage + 1)
  const handleRetry = () => (searchQuery && isSearching ? searchProducts(searchQuery, currentPage) : fetchAllProducts(currentPage))

  const normalizeProduct = (product: ProductFeaturedDetaileResponse | ProductSearchResult): Product => {
    if ("imageUrl" in product) {
      return {
        id: product.id,
        name: product.name,
        category: product.brand,
        price: product.price,
        image: product.imageUrl,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock ?? 0,
        minStock: product.minStock,
        maxStock: product.maxStock,
        description: product.description,
      }
    } else {
      return {
        id: product.id,
        name: product.name,
        category: product.category || null,
        price: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock ?? 0,
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tous les produits</h1>

      {/* Barre de recherche */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center max-w-md mx-auto">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Recherche en cours..." : "Rechercher"}
        </Button>
      </div>

      {/* Grille des produits */}
      <main>
        {loading || error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: productsPerPage }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Affichage de {(currentPage - 1) * productsPerPage + 1}-
                  {Math.min(currentPage * productsPerPage, totalResults)} sur {totalResults} produits
                  {isSearching && searchQuery && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">pour "{searchQuery}"</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPrevious} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" /> Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) pageNumber = i + 1
                      else if (currentPage <= 3) pageNumber = i + 1
                      else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i
                      else pageNumber = currentPage - 2 + i
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className="w-10 h-10"
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  <Button variant="outline" size="sm" onClick={goToNext} disabled={currentPage === totalPages}>
                    Suivant <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="text-lg mb-4">Aucun produit trouvé correspondant à votre recherche.</p>
            {error && (
              <Button onClick={handleRetry} variant="outline">
                Réessayer
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
