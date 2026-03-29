"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

const API = process.env.NEXT_PUBLIC_API_URL

export default function PromotionalBannerSection() {
  const [bigBanners, setBigBanners] = useState<any[]>([])
  const [smallBanners, setSmallBanners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch(`${API}/public/products/panale-big`).then((r) => r.json()).catch(() => ({ data: [] })),
      fetch(`${API}/public/products/panale-smale`).then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([big, small]) => {
        if (big?.data) setBigBanners(big.data.slice(0, 1))
        if (small?.data) setSmallBanners(small.data.slice(0, 2))
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && bigBanners.length === 0 && smallBanners.length === 0) return null

  return (
    <section className="bg-background">
      <div className="section-container py-8 md:py-12">
        <div className={`grid gap-4 ${smallBanners.length > 0 ? "md:grid-cols-3" : "grid-cols-1"}`}>
          {/* Big Banner */}
          {isLoading ? (
            <Skeleton className={`${smallBanners.length > 0 ? "md:col-span-2" : "col-span-1"} rounded-2xl min-h-[250px] w-full`} />
          ) : bigBanners[0] ? (
            <div className={`${smallBanners.length > 0 ? "md:col-span-2" : "col-span-1"} relative rounded-2xl overflow-hidden bg-gradient-to-r from-navy-500 to-navy-400 p-8 md:p-12 min-h-[250px] flex items-center group`}>
              <div className="relative z-10 space-y-3 max-w-sm">
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  Offre spéciale
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {bigBanners[0].name}
                </h3>
                <p className="text-white/60 text-sm line-clamp-2">
                  {bigBanners[0].description || "Découvrez notre sélection premium"}
                </p>
                <Link
                  href={`/products/${bigBanners[0].id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Découvrir →
                </Link>
              </div>
              {bigBanners[0].image && (
                <div className="absolute right-4 bottom-4 md:right-8 md:bottom-0 w-40 md:w-56 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                  <Image src={bigBanners[0].image} alt="" width={224} height={224} className="w-full h-auto object-contain" />
                </div>
              )}
            </div>
          ) : null}

          {/* Small Banners */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <Skeleton className="rounded-2xl flex-1 min-h-[120px] w-full" />
                <Skeleton className="rounded-2xl flex-1 min-h-[120px] w-full" />
              </>
            ) : (
              smallBanners.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="relative rounded-2xl overflow-hidden bg-secondary p-6 flex-1 min-h-[120px] flex items-center group hover:shadow-card-hover transition-shadow"
                >
                  <div className="space-y-1.5 z-10">
                    <span className="text-xs font-semibold text-accent">Promo</span>
                    <h4 className="text-sm font-bold text-foreground line-clamp-2">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {Number(item.price).toLocaleString("fr-MA")} DH
                    </p>
                  </div>
                  {item.image && (
                    <div className="absolute right-3 bottom-0 w-24 h-24 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform translate-x-2">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}