"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Toutes les catégories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-all duration-300 border border-border/50 bg-card/50 h-full rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center p-0 w-full">
                <div className="w-20 h-20 rounded-full bg-background border border-border/40 flex items-center justify-center mb-3 p-3 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={category.image || "/Placeholder.png?height=100&width=100"}
                    alt={category.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-foreground">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}