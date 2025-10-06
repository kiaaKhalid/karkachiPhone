"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface DealsResponse {
  success: boolean
  message: string
  data: {
    items: Deal[]
    total: number
    page: number
    limit: number
  }
}

interface Deal {
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
  flashStartsAt: string
  flashEndsAt: string
  flashStock: number | null
  categoryId: string
  brandId: string
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}

function ErrorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden opacity-50">
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-9 bg-gray-200 rounded w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchDeals = async (pageNum = 1, categoryId?: string, brandId?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "30",
      })

      if (categoryId) params.append("categoryId", categoryId)
      if (brandId) params.append("brandId", brandId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products/deals?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DealsResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch deals")
      }
      setDeals(data.data.items)
      setTotalPages(Math.ceil(data.data.total / data.data.limit))
      setPage(data.data.page - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deals")
      console.error("Error fetching deals:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const handlePreviousPage = () => {
    if (page > 0) {
      const newPage = page - 1
      setPage(newPage)
      fetchDeals(newPage + 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      const newPage = page + 1
      setPage(newPage)
      fetchDeals(newPage + 1)
    }
  }

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum)
    fetchDeals(pageNum + 1)
  }

  const convertDealToProduct = (deal: Deal): Product => {
    const currentPrice = parseFloat(deal.flashPrice || deal.price)
    const originalPriceNum = parseFloat(deal.originalPrice)
    const savings = originalPriceNum - currentPrice
    return {
      id: deal.id,
      name: deal.name,
      brand: "", // Brand not directly available, would need to fetch or adjust
      category: "", // Category not directly available, would need to fetch or adjust
      price: currentPrice,
      comparePrice: originalPriceNum,
      image: deal.image,
      rating: parseFloat(deal.rating),
      reviewCount: deal.reviewsCount,
      stock: deal.flashStock !== null ? deal.flashStock : deal.stock,
      description: deal.description,
      shortDescription: null,
      savePrice: savings.toString(),
      isOnPromotion: deal.isFlashDeal,
      promotionEndDate: deal.flashEndsAt,
      specs: [],
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meilleures offres du jour</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {deals.map((deal) => (
            <ProductCard key={deal.id} product={convertDealToProduct(deal)} />
          ))}
        </div>
      )}

      {!loading && !error && deals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune offre disponible pour le moment.</p>
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 0}
            className="flex items-center gap-1 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              let pageNum = index
              if (totalPages > 5) {
                if (page < 3) {
                  pageNum = index
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 5 + index
                } else {
                  pageNum = page - 2 + index
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum + 1}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!loading && !error && totalPages > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Page {page + 1} of {totalPages}
        </div>
      )}
    </div>
  )
}