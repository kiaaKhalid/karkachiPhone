"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface DealResponse {
  deals: Deal[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface Deal {
  id: number
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  discountPercentage: number
  savingsAmount: number
  image: string
  rating: number
  reviewCount: number
  stock: number
  dealType: string
  dealEndDate: string
  timeRemaining: string
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

  const fetchDeals = async (pageNum = 0, category?: string, dealType?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        size: "30",
      })

      if (category) params.append("category", category)
      if (dealType) params.append("dealType", dealType)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/deals?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DealResponse = await response.json()
      setDeals(data.deals)
      setTotalPages(data.totalPages)
      setPage(data.page)
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
      fetchDeals(newPage)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      const newPage = page + 1
      setPage(newPage)
      fetchDeals(newPage)
    }
  }

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum)
    fetchDeals(pageNum)
  }

  const convertDealToProduct = (deal: Deal): Product => ({
    id: deal.id,
    name: deal.name,
    brand: deal.brand,
    category: deal.category,
    price: deal.price,
    comparePrice: deal.originalPrice.toString(),
    image: deal.image,
    rating: deal.rating,
    reviewCount: deal.reviewCount,
    stock: deal.stock,
    description: undefined,
    shortDescription: null,
    savePrice: deal.savingsAmount.toString(),
    isOnPromotion: deal.dealType !== "",
    promotionEndDate: deal.dealEndDate,
    specs: [],
  });

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
