"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number | string
    originalPrice?: number | string | null
    image?: string | null
    description?: string | null
    specs?: { key: string; value: string }[] | null
    brand?: { name: string } | null
    rating?: number
    reviewsCount?: number
    discount?: number | null
    isNew?: boolean
    isFlashDeal?: boolean
    flashPrice?: number | string | null
    stock?: number
  }
  onAddToCart?: () => void
  onToggleWishlist?: () => void
  isInWishlist?: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(isInWishlist)
  const router = useRouter()

  useEffect(() => {
    setLiked(isInWishlist)
  }, [isInWishlist])

  useEffect(() => {
    if (isFlipped && typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        setIsFlipped(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isFlipped])

  const price = Number(product.flashPrice || product.price) || 0
  const originalPrice = Number(product.originalPrice || (product.flashPrice ? product.price : null)) || null
  const discount = product.discount || (originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null)
  // Fallbacks temporaires pour UI
  const rating = Number(product.rating) || 4.5
  const reviewsCount = product.reviewsCount || 12
  const inStock = (product.stock ?? 0) > 0

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check for token
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null
    if (!token) {
      router.push('/auth/login')
      return
    }

    setLiked(!liked)
    onToggleWishlist?.()
  }

  const getImageUrl = (img: string | null | undefined) => {
    if (!img) return "/Placeholder.png"
    if (img.startsWith("http") || img.startsWith("data:")) return img
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    const baseUrl = apiUrl.replace(/\/api$/, "")
    const cleanImg = img.startsWith("/") ? img : `/${img}`
    return `${baseUrl}${cleanImg}`
  }

  return (
    <div 
      className="group [perspective:1000px] h-[380px] sm:h-[420px] md:h-[440px] w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isHovered || isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
        
        {/* === FRONT SIDE === */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm shadow-black/5">
          {/* Image */}
          <Link 
            href={`/products/${product.id}`} 
            onMouseEnter={() => setIsHovered(true)}
            onClick={(e) => {
              if (window.innerWidth < 768) {
                e.preventDefault()
                e.stopPropagation()
                setIsFlipped(true)
              }
            }}
            className="product-card-image block relative flex-1"
          >
            {discount && discount > 0 && <span className="badge-discount">-{discount}%</span>}
            {product.isNew && <span className="badge-new">Nouveau</span>}
            {product.isFlashDeal && !product.isNew && (
              <span className="absolute top-3 right-3 badge-flash z-10">⚡ Flash</span>
            )}

            <div className="relative w-full h-full p-6 transform group-hover:scale-105 transition-transform duration-500">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                className="object-contain p-6"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </Link>

          {/* Body */}
          <div className="product-card-body p-4 space-y-2 flex-none">
            <Link href={`/products/${product.id}`} className="block" onMouseEnter={() => setIsHovered(false)}>
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-accent transition-colors">
                {product.name}
              </h3>
            </Link>

            {rating > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.round(rating) ? "fill-orange-400 text-orange-400" : "text-border"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({reviewsCount})</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {price.toLocaleString("fr-MA")} DH
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  {originalPrice.toLocaleString("fr-MA")} DH
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1" onMouseEnter={() => setIsHovered(false)}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.() }}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                  inStock ? "bg-accent text-white hover:bg-orange-600" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {inStock ? "Ajouter" : "Épuisé"}
              </button>
              <button
                onClick={handleWishlistClick}
                className={`p-2 rounded-lg border transition-colors ${
                  liked ? "border-red-200 bg-red-50 text-red-500" : "border-border hover:border-accent/30 text-muted-foreground"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* === BACK SIDE === */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card text-foreground border border-border/50 rounded-2xl p-6 flex flex-col justify-between shadow-sm shadow-black/5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-accent border-b border-border/40 pb-2">
              Spécifications
            </h3>
            
            {product.specs && product.specs.length > 0 ? (
              <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 text-xs py-1 border-b border-border/30">
                    <span className="text-muted-foreground flex-shrink-0">{spec.key}</span>
                    <span className="text-foreground font-semibold text-right break-words">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed max-h-[180px] overflow-y-auto custom-scrollbar">
                {product.description || "Aucune description de produit disponible pour le moment."}
              </p>
            )}

            <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/40">
              {product.brand && (
                <div className="flex justify-between">
                  <span>Marque:</span>
                  <span className="text-accent font-semibold">{product.brand.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Disponibilité:</span>
                <span className={inStock ? "text-green-500 font-semibold" : "text-red-500"}>
                  {inStock ? "En stock" : "Épuisé"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-auto">
            <div className="text-lg font-bold text-foreground text-center">
              {price.toLocaleString("fr-MA")} DH
            </div>
            <Link 
              href={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Voir la fiche complète →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}