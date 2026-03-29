"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Timer, ArrowRight } from "lucide-react"
import ProductCard from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

const API = process.env.NEXT_PUBLIC_API_URL

export default function DealsSection() {
  const [deals, setDeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 })
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    setIsLoading(true)
    fetch(`${API}/public/products/flash`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setDeals(d.data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isLoading && deals.length === 0) return null

  return (
    <section className="bg-white">
      <div className="section-container py-10 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded tracking-wide uppercase">
                Flash Deals
              </span>
            </div>
            <h2 className="section-heading text-red-500 flex items-center gap-2">
              <Timer className="w-6 h-6 md:w-8 md:h-8" />
              Offres Limitées
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 text-center">
              {[
                { label: "Heures", value: timeLeft.hours },
                { label: "Min", value: timeLeft.minutes },
                { label: "Sec", value: timeLeft.seconds },
              ].map((time, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-xl tabular-nums">
                    {time.value.toString().padStart(2, "0")}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 mt-1 uppercase tracking-wider">
                    {time.label}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/deals" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 stagger-children">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : deals.map((p: any) => {
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