"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import ProductCard from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

const API = process.env.NEXT_PUBLIC_API_URL

export default function MixedProductsSection() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    setIsLoading(true)
    fetch(`${API}/public/products/saller`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setProducts(d.data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section className="bg-secondary/30">
      <div className="section-container py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="section-heading">Meilleures Ventes</h2>
              <p className="section-subheading">Les produits les plus populaires</p>
            </div>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-accent hover:underline underline-offset-4 hidden sm:inline"
          >
            Voir tout →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p: any) => {
                const stringId = p.id?.toString() || p.id || "";
                const normalizedProduct = { ...p, id: stringId };
                return (
                  <ProductCard
                    key={stringId}
                    product={normalizedProduct}
                    isInWishlist={isInWishlist(stringId)}
                    onToggleWishlist={() => 
                      isInWishlist(stringId) 
                        ? removeFromWishlist(stringId) 
                        : addToWishlist(normalizedProduct)
                    }
                    onAddToCart={() =>
                      addItem({ id: stringId, name: p.name, price: Number(p.price), image: p.image || "" })
                    }
                  />
                );
              })}
        </div>
      </div>
    </section>
  )
}
