"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, Truck, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PanierPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  const shipping = totalPrice > 50 ? 0 : 5.99
  const tax = totalPrice * 0.08
  const discount = isPromoApplied ? totalPrice * 0.1 : 0
  const finalTotal = totalPrice + shipping + tax - discount

  const handleWhatsAppCheckout = () => {
    const itemsList = items
      .map(
        (item, index) =>
          `${index + 1}. *${item.name}*\n   Quantité: ${item.quantity}\n   Prix: ${item.price.toFixed(2)} MAD\n   Total: $${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n\n")

    const message =
      `🛒 *NOUVELLE COMMANDE*\n\n` +
      `📱 *Commande Phone Store*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📦 *ARTICLES COMMANDÉS:*\n${itemsList}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *RÉCAPITULATIF:*\n` +
      `• Sous-total: ${totalPrice.toFixed(2)} MAD\n` +
      `• Livraison: ${shipping === 0 ? "Gratuite" : `$${shipping.toFixed(2)}`}\n` +
      `• Taxes: $${tax.toFixed(2)}\n` +
      `${isPromoApplied ? `• Remise: -$${discount.toFixed(2)}\n` : ""}` +
      `• *Total: $${finalTotal.toFixed(2)}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📞 Merci de confirmer la commande et de fournir:\n` +
      `• Adresse de livraison\n` +
      `• Heure préférée\n` +
      `• Mode de paiement\n\n` +
      `Merci de choisir notre boutique ! 🙏`

    const phoneNumber = "+212676423340"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setIsPromoApplied(true)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 sm:pt-28">
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
                          src={item.image || "/Placeholder.png?height=80&width=80"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.price.toFixed(2)} MAD</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
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
                    <span>{shipping === 0 ? "Gratuite" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Taxes</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Remise (SAVE10)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Code promo */}
                <div className="mt-6 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Entrer le code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                      disabled={isPromoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={isPromoApplied || !promoCode}
                      className="px-4 bg-transparent"
                    >
                      Appliquer
                    </Button>
                  </div>
                  {isPromoApplied && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Code promo appliqué !
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleWhatsAppCheckout}
                >
                  📱 Commander via WhatsApp
                </Button>

                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Livraison gratuite</span>
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
