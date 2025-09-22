import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Category } from "@/lib/types"

interface FeaturedCategoriesProps {
  categories: Category[]
}

export default function FeaturedCategories({ categories = [] }: FeaturedCategoriesProps) {
  return (
    <section className="py-8">
      <h2 className="mb-6 text-center text-3xl font-bold">Featured Categories</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group flex h-full flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Image
                  src={category.image || "/Placeholder.png"}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="mb-4 h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.name}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
