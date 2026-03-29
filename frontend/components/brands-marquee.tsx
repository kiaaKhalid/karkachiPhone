"use client"

import { useState, useEffect } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function BrandsMarquee() {
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API}/public/brands/logo`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setBrands(d.data)
      })
      .catch(() => {})
  }, [])

  if (brands.length === 0) return null

  // Duplicate for seamless loop (4x for small list coverage)
  const items = [...brands, ...brands, ...brands, ...brands]

  return (
    <section className="bg-secondary/30 border-y border-border">
      <div className="py-4 overflow-hidden">
        <div className="flex items-center animate-marquee gap-12 w-max">
          {items.map((brand: any, i: number) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background border border-border/50 shrink-0 hover:shadow-card-hover transition-shadow"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-8 h-8 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                  {brand.name?.[0]}
                </div>
              )}
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
