"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/types"

interface ApiResponse {
  success: boolean
  message: string
  data: {
    items?: any[]
    total?: number
    page?: number
    limit?: number
  } | any[]
}

const urlBase = process.env.NEXT_PUBLIC_API_URL
const productsPerPage = 24

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

  const fetchProducts = async (page: number, query: string = "") => {
    try {
      setLoading(true)
      setError(false)
      const trimmedQuery = query.trim()
      let endpoint: string
      let params: URLSearchParams

      if (trimmedQuery) {
        endpoint = `${urlBase}/public/products/search`
        params = new URLSearchParams({
          q: trimmedQuery,
          limit: productsPerPage.toString(),
          page: "1"
        })
      } else {
        endpoint = `${urlBase}/public/products`
        params = new URLSearchParams({
          page: page.toString(),
          limit: productsPerPage.toString(),
        })
      }

      const response = await fetch(`${endpoint}?${params}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Impossible de récupérer les produits")
      }
      const data: ApiResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Erreur lors de la récupération des produits")
      }

      const responseData = data.data
      let items: any[]
      let total: number

      if (trimmedQuery) {
        if (Array.isArray(responseData)) {
          items = responseData
          total = responseData.length
        } else {
          items = []
          total = 0
        }
      } else {
        if (responseData && typeof responseData === 'object' && 'items' in responseData) {
          items = (responseData as any).items || []
          total = (responseData as any).total || 0
        } else {
          items = []
          total = 0
        }
      }

      const normalizedProducts: Product[] = items.map((item: any) => {
        const price = parseFloat(item.price) || 0
        const originalPrice = item.originalPrice ? parseFloat(item.originalPrice) : undefined
        const savePercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined
        return {
          id: item.id?.toString() || item.id || "",
          name: item.name || "",
          description: item.description || "",
          price,
          comparePrice: originalPrice,
          savePrice: savePercentage ? savePercentage.toString() : undefined,
          brand: item.brandId || undefined,
          category: item.categoryId || null,
          stock: item.stock ?? 0,
          rating: parseFloat(item.rating) || 0,
          reviewCount: item.reviewsCount || item.reviewCount || 0,
          image: item.image || null,
          isOnPromotion: item.isFlashDeal || item.isPromotional || !!originalPrice || false,
          promotionEndDate: item.flashEndsAt || null,
        }
      })

      setProducts(normalizedProducts)
      setTotalResults(total)

      if (trimmedQuery) {
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        setTotalPages(Math.ceil(total / productsPerPage))
      }

      setIsSearching(!!trimmedQuery)
    } catch (error: any) {
      console.error("Erreur de fetch des produits:", error.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1, searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = () => {
    fetchProducts(1, searchQuery)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || isSearching) return
    setCurrentPage(page)
    fetchProducts(page, searchQuery)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPrevious = () => currentPage > 1 && !isSearching && goToPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && !isSearching && goToPage(currentPage + 1)
  const handleRetry = () => fetchProducts(currentPage, searchQuery)

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

            {totalPages > 1 && !isSearching && (
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