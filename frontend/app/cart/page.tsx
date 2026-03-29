"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { SlideToAction } from "@/components/ui/slide-to-action"

const url = process.env.NEXT_PUBLIC_API_URL

interface OrderResponse {
  success: boolean
  message: string
  data: {
    id: string
    total: string
    status: string
    items: Array<{
      id: string
      name: string
      unitPrice: string
      quantity: number
      image: string
      totalPrice: string
    }>
  }
}

export default function PanierPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart, isLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const shipping = totalPrice > 50 || totalPrice === 0 ? 0 : 5.99
  const tax = totalPrice * 0.08
  const discount = isPromoApplied ? totalPrice * 0.1 : 0
  const finalTotal = totalPrice + shipping + tax - discount

  const handleCombinedCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/cart")
      return
    }

    try {
      setUpdating(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${url}/person/orders/from-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      const data: OrderResponse = await response.json()
      if (data.success) {
        // Clear promo
        setIsPromoApplied(false)
        setPromoCode('')

        // Prepare WhatsApp message with order details
        const orderId = data.data.id
        const orderItemsList = data.data.items
          .map(
            (orderItem, index) =>
              `${index + 1}. *${orderItem.name}*\n   Quantité: ${orderItem.quantity}\n   Prix unitaire: ${orderItem.unitPrice} MAD\n   Total: ${orderItem.totalPrice} MAD`
          )
          .join("\n\n")

        const message =
          `🛒 *NOUVELLE COMMANDE CONFIRMÉE*\n\n` +
          `📱 *Commande Phone Store*\n` +
          `Numéro de commande: ${orderId}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📦 *ARTICLES COMMANDÉS:*\n${orderItemsList}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 *RÉCAPITULATIF:*\n` +
          `• Sous-total: ${totalPrice.toFixed(2)} MAD\n` +
          `• Livraison: ${shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} MAD`}\n` +
          `• Taxes: ${tax.toFixed(2)} MAD\n` +
          `${isPromoApplied ? `• Remise: -${discount.toFixed(2)} MAD\n` : ""}` +
          `• *Total: ${finalTotal.toFixed(2)} MAD*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📞 Merci de confirmer les détails de livraison:\n` +
          `• Adresse de livraison\n` +
          `• Heure préférée\n` +
          `• Mode de paiement\n\n` +
          `Merci de choisir notre boutique ! 🙏`

        const phoneNumber = "+212676423340"
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

        // clear items after successful checkout orders from backend clearing automatically syncs too
        await clearCart()
        window.open(whatsappUrl, "_blank")
      }
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setUpdating(false)
    }
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setIsPromoApplied(true)
    }
  }

  const handleClearCart = async () => {
    if (confirm('Voulez-vous vider le panier ?')) {
      setUpdating(true)
      await clearCart()
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-28">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-gray-300 rounded mb-8 mx-auto"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Chargement du panier...</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <div className="h-8 w-8 bg-gray-300"></div>
                            <div className="px-3 py-1 min-w-[2rem]"></div>
                            <div className="h-8 w-8 bg-gray-300"></div>
                          </div>
                          <div className="h-8 w-8 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-px bg-gray-300"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-muted/30 pt-4 pb-20">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center min-h-[75vh] text-center animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-28 h-28 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-500/20">
            <ShoppingBag className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-foreground">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Vous n&apos;avez ajouté aucun article à votre panier pour le moment. Commencez vos achats pour le remplir !
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuer vos achats
              </Button>
            </Link>
            <Link href="/deals" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full px-8 py-4 rounded-xl border-border/40 hover:bg-muted text-foreground transition-all duration-300 bg-card/50 cursor-pointer"
              >
                <Tag className="w-4 h-4 mr-2" />
                Voir les promotions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getImageUrl = (img: string | null | undefined) => {
    if (!img || img === "/Placeholder.png") return "/Placeholder.png"
    if (img.startsWith("http") || img.startsWith("data:")) return img
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    const baseUrl = apiUrl.replace(/\/api$/, "")
    const cleanImg = img.startsWith("/") ? img : `/${img}`
    return `${baseUrl}${cleanImg}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-muted/30 pt-4 pb-20">
      <div className="container mx-auto px-4 max-w-lg md:max-w-4xl">
        
        {/* Header Header Header header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <Link href="/">
            <button className="w-10 h-10 bg-card border border-border/20 rounded-full flex items-center justify-center shadow-sm text-foreground hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Panier</h1>
          <button className="w-10 h-10 bg-card border border-border/20 rounded-full flex items-center justify-center shadow-sm text-foreground hover:bg-muted/50 transition-colors">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card List items list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">{items.length} Article{items.length > 1 ? "s" : ""}</span>
              <button 
                onClick={handleClearCart} 
                disabled={updating}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Vider
              </button>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-card backdrop-blur-md rounded-[24px] border border-border/10 shadow-sm relative group">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1 min-w-0 pr-6">
                  <div>
                    <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Électronique</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="font-extrabold text-foreground text-sm md:text-base">{Number(item.price).toFixed(2)} MAD</p>
                    
                    {/* Quantity Controller Pill bounds */}
                    <div className="flex items-center gap-2 bg-muted/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating}
                        className="p-1 hover:bg-muted rounded-full cursor-pointer text-foreground disabled:opacity-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold text-foreground min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating}
                        className="p-1 hover:bg-muted rounded-full cursor-pointer text-foreground disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Absolutely delete absolute anchor bounds */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={updating}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 cursor-pointer p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Totals accordion breakdown section bounds */}
          <div className="space-y-4">
            
            {/* Promotion code / loyalty block style rows bounds */}
            <div className="bg-card rounded-2xl border border-border/10 p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-center py-1 cursor-pointer hover:opacity-80">
                <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                  <Tag className="w-4 h-4 text-orange-500" />
                  Code Promo
                </div>
                <ArrowLeft className="w-3.5 h-3.5 transform -rotate-90 text-muted-foreground" />
              </div>
              <Separator className="opacity-50" />
              <div className="flex justify-between items-center py-1 cursor-pointer hover:opacity-80">
                <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Points de Fidélité
                </div>
                <ArrowLeft className="w-3.5 h-3.5 transform -rotate-90 text-muted-foreground" />
              </div>
            </div>

            {/* Price breakdown and order summary items bounds */}
            <div className="bg-card rounded-2xl border border-border/10 p-5 space-y-3 shadow-sm">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total de la commande</span>
                <span className="font-medium text-foreground">{totalPrice.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">Livraison</span>
                <span className="font-medium text-foreground">{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} MAD`}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold text-foreground">Montant Total</span>
                <span className="text-lg font-extrabold text-foreground">{finalTotal.toFixed(2)} MAD</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Entrez votre code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={isPromoApplied}
                className="rounded-xl h-11 border-border/20 text-sm bg-card"
              />
              <Button 
                onClick={applyPromoCode} 
                className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-11 px-4 text-sm font-semibold"
                disabled={isPromoApplied || !promoCode}
              >
                Appliquer
              </Button>
            </div>

            <div className="mt-2 md:block hidden">
              <SlideToAction
                onSuccess={handleCombinedCheckout}
                label={updating ? "Traitement..." : `Glisser pour Payer (${finalTotal.toFixed(2)} MAD)`}
                className="shadow-md"
              />
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md p-4 border-t border-border/10 shadow-lg md:hidden animate-slide-up">
            <SlideToAction
              onSuccess={handleCombinedCheckout}
              label={updating ? "Traitement..." : `Glisser pour Payer (${finalTotal.toFixed(2)} MAD)`}
              className="max-w-md mx-auto"
            />
          </div>
        )}

      </div>
    </div>
  )
}