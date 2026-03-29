"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import FullscreenProductCard from "@/components/fullscreen-product-card"
import FullscreenCarousel from "@/components/fullscreen-carousel"
import Image from "next/image"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Grid2X2, Maximize2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useWishlist } from "@/hooks/use-wishlist"
import type { Product } from "@/lib/types"

interface ApiResponse {
  success: boolean
  message: string
  data: {
    items?: any[]
    total?: number
    page?: number
    limit?: number
  } | any[]
}

const urlBase = process.env.NEXT_PUBLIC_API_URL
const productsPerPage = 24

export default function ProductsPage() {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const [viewMode, setViewMode] = useState<'grid' | 'fullscreen'>('grid')

  useEffect(() => {
    if (viewMode === 'fullscreen') {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = ''
    }
    return () => { document.body.style.overflowY = '' }
  }, [viewMode])

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000])

  const fetchLookups = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch(`${urlBase}/public/category`),
        fetch(`${urlBase}/public/brands/logo`)
      ])

      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(Array.isArray(catData) ? catData : [])
      }

      if (brandRes.ok) {
        const brandData = await brandRes.json()
        setBrands(brandData.success && Array.isArray(brandData.data) ? brandData.data : [])
      }
    } catch (error) {
      console.error("Error fetching lookups:", error)
    }
  }

  const fetchProducts = async (page: number, query: string = "") => {
    try {
      setLoading(true)
      setError(false)
      const trimmedQuery = query.trim()
      let endpoint: string
      let params = new URLSearchParams()

      if (trimmedQuery) {
        endpoint = `${urlBase}/public/products/search`
        params.append("q", trimmedQuery)
      } else {
        endpoint = `${urlBase}/public/products`
        params.append("page", page.toString())
        params.append("limit", productsPerPage.toString())

        if (selectedCategory !== "all") params.append("categoryId", selectedCategory)
        if (selectedBrand !== "all") params.append("brandId", selectedBrand)
        if (priceRange[0] > 0) params.append("priceMin", priceRange[0].toString())
        if (priceRange[1] < 50000) params.append("priceMax", priceRange[1].toString())
      }

      const response = await fetch(`${endpoint}?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Impossible de récupérer les produits")
      }
      const data: ApiResponse = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Erreur lors de la récupération des produits")
      }

      const responseData = data.data
      let items: any[] = []
      let total: number = 0

      if (trimmedQuery) {
        if (Array.isArray(responseData)) {
          items = responseData
          total = responseData.length
        }
      } else {
        if (responseData && typeof responseData === 'object' && 'items' in responseData) {
          items = (responseData as any).items || []
          total = (responseData as any).total || 0
        }
      }

      const normalizedProducts: Product[] = items.map((item: any) => {
        const price = parseFloat(item.price) || 0
        const originalPrice = item.originalPrice ? parseFloat(item.originalPrice) : undefined
        const savePercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined
        return {
          id: item.id?.toString() || item.id || "",
          name: item.name || "",
          description: item.description || "",
          price,
          comparePrice: originalPrice,
          savePrice: savePercentage ? savePercentage.toString() : undefined,
          brand: item.brand ? { name: item.brand.name || "" } : undefined,
          category: item.categoryId || null,
          stock: item.stock ?? 0,
          rating: parseFloat(item.rating) || 0,
          reviewCount: item.reviewsCount || item.reviewCount || 0,
          image: item.image || null,
          isOnPromotion: item.isFlashDeal || item.isPromotional || !!originalPrice || false,
          promotionEndDate: item.flashEndsAt || null,
          specs: item.specs?.map((s: any) => ({ key: s.key || "", value: s.value })) || []
        } as any
      })

      setProducts(normalizedProducts)
      setTotalResults(total)

      if (trimmedQuery) {
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        setTotalPages(Math.ceil(total / productsPerPage))
      }
    } catch (error: any) {
      console.error("Erreur de fetch des produits:", error.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLookups()
  }, [])

  useEffect(() => {
    fetchProducts(currentPage, searchQuery)
  }, [selectedCategory, selectedBrand, priceRange, currentPage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1, searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = () => {
    fetchProducts(1, searchQuery)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPrevious = () => currentPage > 1 && goToPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && goToPage(currentPage + 1)
  const handleRetry = () => fetchProducts(currentPage, searchQuery)

  const FilterWidgets = () => (
    <Accordion type="multiple" defaultValue={["categories", "brands", "price"]} className="space-y-4">
      <AccordionItem value="categories">
        <AccordionTrigger className="font-semibold text-foreground">Catégories</AccordionTrigger>
        <AccordionContent>
          <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" className="border-orange-500 text-orange-500" />
              <Label htmlFor="cat-all" className="cursor-pointer">Toutes les catégories</Label>
            </div>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} className="border-orange-500 text-orange-500" />
                <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">{cat.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="brands">
        <AccordionTrigger className="font-semibold text-foreground">Marques</AccordionTrigger>
        <AccordionContent>
          <RadioGroup value={selectedBrand} onValueChange={setSelectedBrand} className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="brand-all" className="border-orange-500 text-orange-500" />
              <Label htmlFor="brand-all" className="cursor-pointer">Toutes les marques</Label>
            </div>
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <RadioGroupItem value={brand.id} id={`brand-${brand.id}`} className="border-orange-500 text-orange-500" />
                <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer">{brand.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger className="font-semibold text-foreground">Prix (MAD)</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <Slider
            defaultValue={[0, 50000]}
            max={50000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>{priceRange[0]} MAD</span>
            <span>{priceRange[1]} MAD</span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  return (
    <div className="min-h-screen bg-background pt-4 pb-20">
      <div className="section-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Catalogue <span className="text-accent">Premium</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium">
              Découvrez notre sélection exclusive de technologies haut de gamme.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-secondary/80 backdrop-blur-sm rounded-xl p-0.5 md:hidden border border-border/40">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className={`h-10 w-10 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-accent' : 'text-muted-foreground'}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('fullscreen')}
                className={`h-10 w-10 rounded-lg transition-all ${viewMode === 'fullscreen' ? 'bg-background shadow-sm text-accent' : 'text-muted-foreground'}`}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  <DrawerHeader>
                    <DrawerTitle>Filtres</DrawerTitle>
                    <DrawerDescription>Affinez votre recherche par catégorie, marque ou prix.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 py-6">
                    <FilterWidgets />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="hidden md:block col-span-1 border-r pr-6 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Filtrer par</h2>
            <FilterWidgets />
          </aside>

          <main className="col-span-1 md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 border rounded-xl bg-card">
                <p className="text-destructive mb-4">Une erreur s&apos;est produite lors du chargement des produits.</p>
                <Button onClick={handleRetry} variant="outline">Réessayer</Button>
              </div>
            ) : products.length > 0 ? (
              <>
                {viewMode === 'fullscreen' ? (
                  <FullscreenCarousel>
                    {products.map((product) => (
                      <FullscreenProductCard key={product.id} product={product as any} />
                    ))}
                  </FullscreenCarousel>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product as any} 
                        isInWishlist={isInWishlist(product.id)}
                        onToggleWishlist={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                      />
                    ))}
                  </div>
                )}

                {(!viewMode || viewMode === 'grid') && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {(currentPage - 1) * productsPerPage + 1}-
                      {Math.min(currentPage * productsPerPage, totalResults)} sur {totalResults} produits
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToPrevious} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" /> Précédent
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber
                          if (totalPages <= 5) pageNumber = i + 1
                          else if (currentPage <= 3) pageNumber = i + 1
                          else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i
                          else pageNumber = currentPage - 2 + i
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNumber)}
                              className="w-10 h-10"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>

                      <Button variant="outline" size="sm" onClick={goToNext} disabled={currentPage === totalPages}>
                        Suivant <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border">
                <p className="text-lg">Aucun produit trouvé avec ces critères.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}