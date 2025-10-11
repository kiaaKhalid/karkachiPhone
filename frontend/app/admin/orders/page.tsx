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
  Calendar,
  Shield,
  Info,
  AlertCircle,
  Star,
  User,
  ShoppingCart,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
  version?: number
  orderNumber?: string // Computed
  date?: string // Computed from createdAt
}

interface OrderDetail extends Order {
  user: {
    id: string
    name: string
    email: string
    phone: string
    avatarUrl?: string
    isEmailVerified: boolean
    role: string
    authProvider: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    version: number
  }
  items: {
    id: string
    name: string
    unitPrice: number
    quantity: number
    image: string
    totalPrice: number
    orderId: string
    productId: string
  }[]
}

interface ConfirmData {
  id: string
  newStatus: string
  version: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState("")
  const limit = 25
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  const { toast } = useToast()

  const fetchOrders = async (page: number = currentPage, filter: string = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (filter) {
        params.append("status", filter)
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const result = await response.json()
      if (result.success) {
        const mappedOrders = result.data.data.map((order: any) => ({
          ...order,
          total: Number(order.total),
          version: order.version || 0,
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

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }
      const result = await response.json()
      if (result.success) {
        const orderWithNumber = {
          ...result.data,
          total: parseFloat(result.data.total),
          orderNumber: `KP-${new Date(result.data.createdAt).getFullYear()}-${result.data.id.slice(-4).toUpperCase()}`,
          items: result.data.items.map((item: any) => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
          })),
        }
        setSelectedOrder(orderWithNumber)
      } else {
        throw new Error(result.message || 'Failed to fetch order details')
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la commande",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchOrders(1, statusFilter)
    setCurrentPage(1)
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
  }

  const updateStatus = async (id: string, newStatus: Order["status"], version: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, version }),
      })
      if (!response.ok) {
        throw new Error("Failed to update status")
      }
      const result = await response.json()
      if (result.success) {
        setOrders(orders.map((o) => (o.id === id ? { ...o, ...result.data } : o)))
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, ...result.data, status: newStatus })
        }
        toast({
          title: "Succès",
          description: "Statut mis à jour avec succès",
        })
      } else {
        throw new Error(result.message || "Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = (id: string, currentStatus: Order["status"], version: number, newStatus: string) => {
    if (newStatus === currentStatus) return;
    setConfirmData({ id, newStatus, version });
  }

  const confirmStatusChange = () => {
    if (confirmData) {
      updateStatus(confirmData.id, confirmData.newStatus as Order["status"], confirmData.version);
      setConfirmData(null);
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/exports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to export")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "orders-export.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le PDF",
        variant: "destructive",
      })
    }
  }

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
      <div className="mb-8 -mt-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez et gérez l'état de toutes les commandes</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Select value={statusFilter === "" ? "all" : statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="processing">En traitement</SelectItem>
            <SelectItem value="shipped">Expédié</SelectItem>
            <SelectItem value="delivered">Livré</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExport}>
          Exporter en PDF
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Aucune commande ne correspond aux critères de recherche.
            </p>
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
                        Cette commande est en attente de confirmation par l'équipe.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "processing" && (
                    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Cette commande est en cours de préparation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "shipped" && (
                    <Alert className="mb-6 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                      <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <AlertDescription className="text-purple-800 dark:text-purple-200">
                        Cette commande a été expédiée.
                      </AlertDescription>
                    </Alert>
                  )}

                  {order.status === "delivered" && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Cette commande a été livrée avec succès.
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
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, order.status, order.version || 0, value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={`Statut actuel: ${getStatusText(order.status)}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{getStatusText("pending")}</SelectItem>
                        <SelectItem value="processing">{getStatusText("processing")}</SelectItem>
                        <SelectItem value="shipped">{getStatusText("shipped")}</SelectItem>
                        <SelectItem value="delivered">{getStatusText("delivered")}</SelectItem>
                        <SelectItem value="cancelled">{getStatusText("cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={() => fetchOrderDetails(order.id)}>
                      Voir les détails
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Détails de la commande #{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la commande et ses articles.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Résumé de la commande
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Statut:</p>
                    <Badge className={cn("mt-1", getStatusColor(selectedOrder.status))}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Date de création:</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total:</p>
                    <p className="font-bold text-lg">{selectedOrder.total.toLocaleString()} DH</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Version:</p>
                    <p>{selectedOrder.version}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations client
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Nom:</p>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Email:</p>
                    <p>{selectedOrder.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Téléphone:</p>
                    <p>{selectedOrder.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Vérifié:</p>
                    <p>{selectedOrder.user.isEmailVerified ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Rôle:</p>
                    <p className="capitalize">{selectedOrder.user.role.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Actif:</p>
                    <p>{selectedOrder.user.isActive ? "Oui" : "Non"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Articles commandés
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <div>
                            <p>Quantité: <span className="font-medium">{item.quantity}</span></p>
                            <p>Prix unitaire: <span className="font-medium">{item.unitPrice.toLocaleString()} DH</span></p>
                          </div>
                          <div>
                            <p>Total article: <span className="font-bold">{item.totalPrice.toLocaleString()} DH</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={!!confirmData} onOpenChange={() => setConfirmData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment changer le statut de la commande vers{" "}
              <span className="font-medium">{getStatusText(confirmData?.newStatus as Order["status"])}</span> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmData(null)}>
              Annuler
            </Button>
            <Button onClick={confirmStatusChange}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}