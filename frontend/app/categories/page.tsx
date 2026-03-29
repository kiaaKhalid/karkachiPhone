"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface CategoryChoix {
  id: string
  name: string
  image: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/category`)

        if (!response.ok) {
          throw new Error("Échec du chargement des catégories")
        }

        const data: CategoryChoix[] = await response.json()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-9 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-4">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Skeleton className="w-[100px] h-[100px] rounded-full mb-2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Toutes les catégories</h1>
        <Alert variant="destructive">
          <AlertDescription>Erreur lors du chargement des catégories : {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-4">
      <div className="section-container py-8 md:py-12">
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Toutes les <span className="text-accent">Catégories</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Explorez notre univers par thématique.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-xl transition-all duration-500 border border-border/40 bg-card hover:border-accent/40 h-full rounded-2xl group overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-0 w-full">
                  <div className="w-24 h-24 rounded-full bg-secondary/30 border border-border/20 flex items-center justify-center mb-4 p-4 group-hover:bg-accent/5 transition-all duration-500 group-hover:scale-110 relative">
                    <Image
                      src={category.image || "/Placeholder.png"}
                      alt={category.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <h3 className="text-base font-black text-foreground group-hover:text-accent transition-colors tracking-tight">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}