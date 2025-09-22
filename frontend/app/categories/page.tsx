"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CategoryChoix {
  id: number
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
        const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/category/all`)

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
            <Card className="flex flex-col items-center justify-center p-4 text-center hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <img
                  src={category.image || "/Placeholder.png?height=100&width=100"}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="mb-2 rounded-full object-cover"
                />
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
