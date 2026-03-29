"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Truck, Shield, Headphones } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function HeroSection() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API}/public/category`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setCategories(d.data.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Main Hero */}
      <div className="bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="section-container py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Side */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-subtle" />
                Nouveau — Arrivages 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                Trouvez Votre{" "}
                <span className="text-accent">Compagnon</span>{" "}
                Tech Idéal
              </h1>

              <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                Smartphones, tablettes et accessoires premium aux meilleurs prix.
                Livraison rapide partout au Maroc.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn-cta inline-flex items-center gap-2">
                  Explorer la boutique
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/deals" className="btn-cta-outline inline-flex items-center gap-2">
                  Voir les deals
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                {[
                  { icon: Truck, label: "Livraison rapide" },
                  { icon: Shield, label: "Garantie 12 mois" },
                  { icon: Headphones, label: "Support 24/7" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Side */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-sm mx-auto">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full bg-accent/5 animate-pulse-subtle" />
                <div className="absolute inset-8 rounded-full bg-accent/8" />
                <div className="absolute inset-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-foreground">4.8</p>
                    <p className="text-xs text-muted-foreground">Note moyenne</p>
                  </div>
                </div>

                {/* Floating Product Image OVER the circles */}
                <div className="absolute inset-0 flex items-center justify-center -right-10">
                  <Image 
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop" 
                    alt="iPhone 15 Pro Max" 
                    width={256}
                    height={256}
                    className="w-56 md:w-64 object-contain drop-shadow-2xl transform rotate-12 hover:rotate-6 transition-all duration-500 hover:scale-105 cursor-pointer"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Ribbon */}
      {categories.length > 0 && (
        <div className="border-t border-border bg-background">
          <div className="section-container py-6">
            <div className="flex items-center gap-6 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] group"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-xl">📱</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-accent transition-colors whitespace-nowrap">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}