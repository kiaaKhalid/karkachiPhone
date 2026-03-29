import { Heart, Share2, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/hooks/use-wishlist"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface FullscreenProductCardProps {
  product: any
  onAddToCart?: () => void
}

export default function FullscreenProductCard({ product, onAddToCart }: FullscreenProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  
  const stringId = product.id?.toString() || product.id || ""
  const isLiked = isInWishlist(stringId)

  // specs helper to extract values dynamically
  const getSpecArray = (key: string) => {
    const specs = product.specs?.filter((s: any) => s.key?.toLowerCase() === key.toLowerCase()) || []
    if (specs.length === 0) return []
    return specs.flatMap((s: any) => s.value.split(",").map((v: string) => v.trim()))
  }

  const colors = getSpecArray("Couleur")
  const capacities = getSpecArray("Capacité")
  const ram = product.specs?.find((s: any) => s.key?.toLowerCase() === "mémoire ram")?.value

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(capacities[0] || null)

  const getImageUrl = (img: string | null) => {
    if (!img) return "/Placeholder.png"
    if (img.startsWith("http") || img.startsWith("data:")) return img
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    const baseUrl = apiUrl.replace(/\/api$/, "")
    const cleanImg = img.startsWith("/") ? img : `/${img}`
    return `${baseUrl}${cleanImg}`
  }

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        toast({ title: "Lien copié !", description: "Lien du produit copié dans le presse-papier." })
      }
    } catch (err) {
      console.error("Share failed", err)
    }
  }

  const handleWishlist = () => {
    if (isLiked) {
      removeFromWishlist(stringId)
    } else {
      addToWishlist({ ...product, id: stringId })
    }
  }

  return (
    <div className="relative bg-white dark:bg-gray-950 rounded-[32px] overflow-hidden p-5 flex flex-col h-full w-full max-w-md mx-auto shadow-2xl border border-gray-100 dark:border-gray-800">
      
      {/* 1. TOP IMAGE BOX with Pager dots */}
      <div className="relative bg-[#F4F5F6] dark:bg-gray-900 rounded-[24px] p-6 flex flex-col items-center justify-center h-[260px] flex-none">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/Placeholder.png"; }}
          className="max-h-full max-w-full object-contain drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Pager dots mock */}
        <div className="absolute bottom-4 flex gap-1.5">
          <span className="w-4 h-2 rounded-full bg-gray-800 dark:bg-white"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
        </div>
      </div>

      {/* 2. SPEC SHEET CONTAINER */}
      <div className="flex-1 flex flex-col pt-5 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* Title & Price Row */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {product.name}
            {ram && <span className="text-sm text-muted-foreground block font-normal mt-0.5">RAM: {ram}</span>}
          </h2>
          <span className="text-xl font-black text-gray-900 dark:text-white whitespace-nowrap ml-2">
            {Number(product.price).toLocaleString("fr-MA")} DH
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {product.description || "Aucune description disponible pour ce produit."}
        </p>

        {/* Color Section */}
        {colors.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Color</span>
            <div className="flex items-center gap-2">
              {colors.map((color: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(color)}
                  className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center ${
                    selectedColor === color 
                      ? "border-black dark:border-white ring-1 ring-offset-2 ring-transparent" 
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                  title={color}
                >
                  <span 
                    className="w-7 h-7 rounded-full shadow-sm" 
                    style={{ backgroundColor: color.startsWith("#") ? color : "#CCCCCC" }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Capacity Section */}
        {capacities.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Capacity</span>
            <div className="flex items-center gap-1.5">
              {capacities.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setSelectedCapacity(opt)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCapacity === opt
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}



        {/* Action Row */}
        <div className="mt-auto pt-4 flex items-center gap-3">
          <Button
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-6 rounded-3xl dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 shadow-none border-0"
          >
            More details
          </Button>

          {/* Cart circle button floating on right */}
          <button
            onClick={onAddToCart}
            className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform flex-none"
          >
            <ShoppingBag className="w-5 h-5 text-white dark:text-black" />
          </button>
        </div>

      </div>

      {/* Floating share/like to respect original functions */}
      <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
        <button onClick={handleShare} className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700">
          <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={handleWishlist} className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700">
          <Heart className={`w-4 h-4 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-600 dark:text-gray-300"}`} />
        </button>
      </div>

    </div>
  )
}
