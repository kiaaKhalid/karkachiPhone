"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BrandResponse {
  id: string
  name: string
  logoUrl: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/brands/logo`)

        if (!response.ok) {
          throw new Error("Échec du chargement des marques")
        }

        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setBrands(data.data)
        } else {
          setBrands([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-6 border-dashed">
              <Skeleton className="w-16 h-16 rounded-full mb-3" />
              <Skeleton className="h-5 w-24" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Toutes les marques</h1>
        <Alert variant="destructive">
          <AlertDescription>Erreur lors du chargement des marques : {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Nos Marques Partenaires</h1>
      
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="group"
            >
              <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-accent/40 bg-card/50 backdrop-blur-sm h-full rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center p-0 w-full">
                  <div className="w-20 h-20 rounded-full bg-background border border-border/40 flex items-center justify-center mb-3 p-3 group-hover:scale-105 transition-transform duration-300">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-accent">{brand.name?.[0]}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    {brand.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Aucune marque trouvée.
        </div>
      )}
    </div>
  )
}
