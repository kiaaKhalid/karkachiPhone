"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Copy,
  MapPin,
  Phone,
  Calendar,
  Shield,
  Info,
  AlertCircle,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Order {
  id: string
  userId: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  user: {
    email: string
    name: string
  }
  createdAt: string
  updatedAt: string
  orderNumber?: string // Computed
  date?: string // Computed from createdAt
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10
  const { user } = useAuth()
  const { toast } = useToast()
  const [showSocialModal, setShowSocialModal] = useState<string | null>(null)

  const fetchOrders = async (page: number = currentPage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      const response = await fetch(`/api/orders?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const result = await response.json()
      if (result.success) {
        const mappedOrders = result.data.data.map((order: any) => ({
          ...order,
          orderNumber: `KP-${new Date(order.createdAt).getFullYear()}-${order.id.slice(-4).toUpperCase()}`,
          date: order.createdAt,
        }))
        setOrders(mappedOrders)
        setTotalItems(result.data.total)
      } else {
        throw new Error(result.message || 'Failed to fetch orders')
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const totalPages = Math.ceil(totalItems / limit)

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "En Attente de Confirmation"
      case "processing":
        return "Confirmé - En Traitement"
      case "shipped":
        return "Expédié"
      case "delivered":
        return "Livré"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Commandes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez l'état de vos commandes et gérez vos achats</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune commande</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Vous n'avez pas encore passé de commande. Découvrez nos produits !
            </p>
            <Button className="mt-4 bg-[#01A0EA] hover:bg-[#0190D4]">Voir les produits</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-semibold">Commande #{order.orderNumber}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn("flex items-center gap-1", getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {order.total.toLocaleString()} DH
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Status-specific alerts */}
                  {order.status === "pending" && (
                    <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        Votre commande est en attente de confirmation par notre équipe. Vous recevrez une notification dès
                        qu'elle sera traitée.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "processing" && (
                    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Votre commande a été confirmée et est en cours de préparation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "shipped" && (
                    <Alert className="mb-6 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                      <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <AlertDescription className="text-purple-800 dark:text-purple-200">
                        Votre commande a été expédiée ! Suivez votre colis avec le numéro de suivi ci-dessous.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "delivered" && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Votre commande a été livrée avec succès !
                      </AlertDescription>
                    </Alert>
                  )}

                  <Separator className="my-6" />

                  {/* Order Details */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Client Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Informations client
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="font-medium text-gray-900 dark:text-white">{order.user.name}</div>
                        <div>{order.user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {order.status === "pending" && (
                      <Button variant="outline" size="sm">
                        Annuler la commande
                      </Button>
                    )}

                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSocialModal(order.id)}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Laisser un avis
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      Contacter le support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Social Media Review Modal */}
      <Dialog open={!!showSocialModal} onOpenChange={() => setShowSocialModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partagez votre expérience</DialogTitle>
            <DialogDescription>Laissez un avis sur nos réseaux sociaux ou sur notre plateforme</DialogDescription>
          </DialogHeader>
          {showSocialModal &&
            (() => {
              const order = orders.find((o) => o.id === showSocialModal)
              if (!order) return null

              const reviewText = `Je viens de recevoir ma commande ${order.orderNumber} de KasbaPhone ! Excellent service et livraison rapide. Je recommande ! #KasbaPhone`

              return (
                <div className="space-y-4 py-4">
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-sm font-medium">Commande: {order.orderNumber}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-3">Réseaux sociaux:</h4>

                    {/* Facebook */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                      onClick={() => {
                        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(reviewText)}`
                        window.open(facebookUrl, "_blank", "width=600,height=400")
                      }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Partager sur Facebook
                    </Button>

                    {/* Instagram */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-pink-600 border-pink-200 hover:bg-pink-50 bg-transparent"
                      onClick={() => {
                        const instagramUrl = `https://www.instagram.com/`
                        window.open(instagramUrl, "_blank")
                        toast({
                          title: "Instagram ouvert",
                          description: "Partagez une photo de votre produit avec #KasbaPhone",
                        })
                      }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.138 0c-1.297 0-2.448-.49-3.323-1.297-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297z" />
                      </svg>
                      Partager sur Instagram
                    </Button>

                    {/* Twitter/X */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-gray-900 border-gray-200 hover:bg-gray-50 bg-transparent dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
                      onClick={() => {
                        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(reviewText)}&url=${encodeURIComponent(window.location.origin)}`
                        window.open(twitterUrl, "_blank", "width=600,height=400")
                      }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      Partager sur X (Twitter)
                    </Button>
                  </div>

                  {/* Platform Review */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-sm mb-3">Avis sur notre plateforme:</h4>

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-[#01A0EA] border-[#01A0EA] hover:bg-blue-50 bg-transparent"
                      onClick={() => {
                        toast({
                          title: "Merci !",
                          description: "Redirection vers la page d'avis...",
                        })
                        // You can add navigation logic here
                      }}
                    >
                      <Star className="h-5 w-5" />
                      Laisser un avis sur KasbaPhone
                    </Button>
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSocialModal(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}