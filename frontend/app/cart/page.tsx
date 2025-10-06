"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    description: string
    price: string
    image: string
    categoryId: string
    brandId: string
  }
  productId: string
  quantity: number
  price: string
}

interface CartResponse {
  success: boolean
  message: string
  data: {
    cartId: string
    items: CartItem[]
    total: number
  }
}

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

const url = process.env.NEXT_PUBLIC_API_URL

export default function PanierPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const items: CartItem[] = cart?.data?.items || []
  const totalPrice = cart?.data?.total || 0

  const shipping = totalPrice > 50 ? 0 : 5.99
  const tax = totalPrice * 0.08
  const discount = isPromoApplied ? totalPrice * 0.1 : 0
  const finalTotal = totalPrice + shipping + tax - discount

  const fetchCart = async () => {
    if (!token) {
      router.push('auth/login')
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`${url}/person/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }
      const data: CartResponse = await response.json()
      if (data.success) {
        setCart(data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      setUpdating(true)
      const response = await fetch(`${url}/person/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      })
      if (!response.ok) {
        throw new Error('Failed to update quantity')
      }
      const data: CartResponse = await response.json()
      if (data.success) {
        setCart(data)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`${url}/person/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to remove item')
      }
      const data: CartResponse = await response.json()
      if (data.success) {
        setCart(data)
      }
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(false)
    }
  }

  const clearCart = async () => {
    if (!confirm('Voulez-vous vider le panier ?')) return
    try {
      setUpdating(true)
      const response = await fetch(`${url}/person/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }
      const data: CartResponse = await response.json()
      if (data.success) {
        setCart(data)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCombinedCheckout = async () => {
    try {
      setUpdating(true)
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

  useEffect(() => {
    fetchCart()
  }, [])

  if (loading) {
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
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-300 rounded flex-1"></div>
                    <div className="h-10 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded w-full"></div>
                </CardContent>
              </Card>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-28">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <ShoppingBag className="w-16 h-16 text-gray-500 dark:text-gray-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Votre panier est vide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Vous n&apos;avez ajouté aucun article à votre panier pour le moment. Commencez vos achats pour le remplir !
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continuer vos achats
              </Button>
            </Link>
            <Link href="/deals">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 bg-transparent"
              >
                <Tag className="w-5 h-5 mr-2" />
                Voir les promotions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-28 mb-12">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panier
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Vérifiez vos articles sélectionnés</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles du panier */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Articles ({items.length})</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    disabled={updating}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tout supprimer
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                        <Image
                          src={item.product.image || "/Placeholder.png?height=80&width=80"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.product.description}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{parseFloat(item.price).toFixed(2)} MAD</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating}
                            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating}
                            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif de la commande */}
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Résumé de la commande</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span>{totalPrice.toFixed(2)} MAD</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Livraison
                    </span>
                    <span>{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} MAD`}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Taxes</span>
                    <span>{tax.toFixed(2)} MAD</span>
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Remise (SAVE10)</span>
                      <span>-{discount.toFixed(2)} MAD</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(2)} MAD</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  onClick={handleCombinedCheckout}
                  disabled={updating}
                >
                  {updating ? "Traitement..." : "Passer commande & WhatsApp"}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Livraison gratuite {'>'} 50 MAD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/">
              <Button
                variant="outline"
                className="w-full py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuer vos achats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}