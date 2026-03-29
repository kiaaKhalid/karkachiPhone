"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product } from "@/lib/types"

const API = process.env.NEXT_PUBLIC_API_URL

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true)
        // Fetch products with a flag for promotions or just best sellers
        const res = await fetch(`${API}/public/products?limit=20`)
        if (!res.ok) throw new Error("Erreur de chargement")
        const data = await res.json()
        
        // Filter products that have originalPrice > price
        const promoItems = (data.data.items || []).filter((p: any) => p.originalPrice && Number(p.originalPrice) > Number(p.price))
        
        // If no proms found, just show first 10
        setProducts(promoItems.length > 0 ? promoItems : (data.data.items || []).slice(0, 12))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchPromoProducts()
  }, [])

  return (
    <div className="min-h-screen bg-background pt-4">
      <div className="section-container py-8 md:py-12">
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Offres <span className="text-accent">Spéciales</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Découvrez nos meilleures promotions et bons plans.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">Aucune promotion en cours pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
