"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import ProductCard from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ProductsForYouSection() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    setIsLoading(true)
    fetch(`${API}/public/products/top-ordered`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setProducts(d.data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section className="bg-white">
      <div className="section-container py-10 md:py-16 border-t border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="section-heading">Recommandé Pour Vous</h2>
              <p className="section-subheading">Sélectionné selon vos goûts</p>
            </div>
          </div>
          <Link
            href="/products?sort=popular"
            className="group flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors hidden sm:flex"
          >
            Découvrir
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 stagger-children">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
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