"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"

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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const fetchDeals = async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products/deals?page=${pageNum}&limit=12`)
      if (!res.ok) throw new Error("Erreur de chargement")
      const data = await res.json()
      setDeals(data.data.items)
      setTotalPages(Math.ceil(data.data.total / data.data.limit))
      setPage(data.data.page - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const convertToProduct = (deal: Deal): Product => ({
    id: deal.id,
    name: deal.name,
    brand: { name: "" },
    category: "",
    price: parseFloat(deal.flashPrice || deal.price),
    originalPrice: parseFloat(deal.originalPrice),
    image: deal.image,
    rating: parseFloat(deal.rating),
    reviewsCount: deal.reviewsCount,
    stock: deal.flashStock !== null ? deal.flashStock : deal.stock,
    description: deal.description,
    discount: deal.discount !== null ? deal.discount : undefined,
    isFlashDeal: deal.isFlashDeal,
    flashPrice: deal.flashPrice ? parseFloat(deal.flashPrice) : null,
  })

  return (
    <div className="min-h-screen bg-background pt-4 text-foreground font-inter">
      <div className="section-container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" />
              Offres Limitées
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Meilleures <span className="text-accent">Offres</span> du Jour
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl">
              Des réductions exceptionnelles sur une sélection de produits premium. Profitez-en avant l&apos;expiration.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-2xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {deals.map((deal) => {
                const product = convertToProduct(deal)
                const sId = deal.id.toString()
                return (
                  <ProductCard
                    key={sId}
                    product={product as any}
                    isInWishlist={isInWishlist(sId)}
                    onToggleWishlist={() => 
                      isInWishlist(sId) ? removeFromWishlist(sId) : addToWishlist({ ...product, id: sId } as any)
                    }
                  />
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-8 border-t border-border/40">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchDeals(page)}
                  disabled={page === 0}
                  className="rounded-xl border-border/40 hover:bg-secondary transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchDeals(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        page === i 
                          ? "bg-accent text-white shadow-lg shadow-accent/20" 
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent hover:border-border/40"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchDeals(page + 2)}
                  disabled={page >= totalPages - 1}
                  className="rounded-xl border-border/40 hover:bg-secondary transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-secondary/30 rounded-[3rem] border border-dashed border-border/60">
            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aucune offre flash disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}