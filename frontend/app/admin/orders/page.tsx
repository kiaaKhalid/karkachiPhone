"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreHorizontal,
  Download,
  Calendar,
  MessageCircle,
  Settings,
  Send,
  AlertCircle,
  CheckCircle2,
  User,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner" // Changed to named import

// WhatsApp delivery status type
type WhatsAppStatus = "disabled" | "enabled" | "sent" | "delivered" | "failed"

// Delivery person type
interface DeliveryPerson {
  id: string
  name: string
  email: string
  phone: string
  whatsappNumber: string
  whatsappLink?: string
  isActive: boolean
  avatar?: string
}

// Extended Order type with WhatsApp delivery and delivery person
interface ExtendedOrder extends Order {
  whatsappDelivery: {
    enabled: boolean
    status: WhatsAppStatus
    lastSent?: string
    deliveryMessage?: string
    phoneNumber: string
  }
  deliveryPerson?: DeliveryPerson
}

// Mock delivery persons data
const mockDeliveryPersons: DeliveryPerson[] = [
  {
    id: "dp-001",
    name: "Ahmed Ben Ali",
    email: "ahmed@delivery.com",
    phone: "+216-98-123-456",
    whatsappNumber: "+216-98-123-456",
    whatsappLink: "https://wa.me/21698123456",
    isActive: true,
    avatar: "/Placeholder.png?height=40&width=40",
  },
  {
    id: "dp-002",
    name: "Mohamed Trabelsi",
    email: "mohamed@delivery.com",
    phone: "+216-97-654-321",
    whatsappNumber: "+216-97-654-321",
    whatsappLink: "https://wa.me/21697654321",
    isActive: true,
    avatar: "/Placeholder.png?height=40&width=40",
  },
  {
    id: "dp-003",
    name: "Fatma Bouazizi",
    email: "fatma@delivery.com",
    phone: "+216-99-888-777",
    whatsappNumber: "+216-99-888-777",
    whatsappLink: "https://wa.me/21699888777",
    isActive: true,
    avatar: "/Placeholder.png?height=40&width=40",
  },
  {
    id: "dp-004",
    name: "Karim Sassi",
    email: "karim@delivery.com",
    phone: "+216-95-111-222",
    whatsappNumber: "+216-95-111-222",
    whatsappLink: "https://wa.me/21695111222",
    isActive: false,
    avatar: "/Placeholder.png?height=40&width=40",
  },
]

// Mock orders data with WhatsApp delivery and delivery persons
const mockOrders: ExtendedOrder[] = [
  {
    id: "ORD-001",
    userId: "1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        price: 1199,
        image: "/images/iphone-15-pro-max.png",
        quantity: 1,
        imei: "123456789012345", // IMEI assigned by admin
      },
    ],
    total: 1199,
    status: "delivered",
    createdAt: "2024-01-15T10:30:00Z",
    shippingAddress: {
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      phone: "+1-555-0123",
      name: "John Doe",
    },
    paymentMethod: "card",
    whatsappDelivery: {
      enabled: true,
      status: "delivered",
      phoneNumber: "+1-555-0123",
      deliveryMessage: "Hello {{customerName}}, your order {{orderId}} is being processed and will be shipped soon!",
    },
    deliveryPerson: mockDeliveryPersons[0],
  },
  {
    id: "ORD-002",
    userId: "2",
    customerName: "Sarah Wilson",
    customerEmail: "sarah@example.com",
    items: [
      {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        price: 1299,
        image: "/images/samsung-galaxy-s24-ultra.png",
        quantity: 1,
        // No IMEI assigned yet
      },
    ],
    total: 1299,
    status: "processing",
    createdAt: "2024-01-15T09:15:00Z",
    shippingAddress: {
      address: "456 Oak Ave",
      city: "Los Angeles",
      zipCode: "90210",
      phone: "+1-555-0456",
      name: "Sarah Wilson",
    },
    paymentMethod: "paypal",
    whatsappDelivery: {
      enabled: true,
      status: "sent",
      phoneNumber: "+1-555-0456",
      lastSent: "2024-01-15T10:00:00Z",
      deliveryMessage:
        "Hi {{customerName}}! Great news - your order {{orderId}} is now being processed. We'll keep you updated!",
    },
    deliveryPerson: mockDeliveryPersons[1],
  },
  {
    id: "ORD-003",
    userId: "3",
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    items: [
      {
        id: "3",
        name: 'MacBook Pro 16"',
        brand: "Apple",
        price: 2499,
        image: "/images/macbook-pro-16.png",
        quantity: 1,
        // No IMEI for laptops
      },
    ],
    total: 2499,
    status: "shipped",
    createdAt: "2024-01-14T16:45:00Z",
    shippingAddress: {
      address: "789 Pine St",
      city: "Chicago",
      zipCode: "60601",
      phone: "+1-555-0789",
      name: "Mike Johnson",
    },
    paymentMethod: "card",
    trackingNumber: "TRK123456789",
    whatsappDelivery: {
      enabled: true,
      status: "delivered",
      phoneNumber: "+1-555-0789",
      lastSent: "2024-01-14T18:00:00Z",
      deliveryMessage: "🚚 Your order {{orderId}} has been shipped! Track it with: {{trackingNumber}}",
    },
    deliveryPerson: mockDeliveryPersons[2],
  },
  {
    id: "ORD-004",
    userId: "4",
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    items: [
      {
        id: "4",
        name: "iPad Pro 12.9",
        brand: "Apple",
        price: 1099,
        image: "/images/ipad-pro-12-9.png",
        quantity: 1,
        imei: "987654321098765", // IMEI assigned by admin
      },
    ],
    total: 1099,
    status: "pending",
    createdAt: "2024-01-13T14:20:00Z",
    shippingAddress: {
      address: "321 Elm St",
      city: "Miami",
      zipCode: "33101",
      phone: "+1-555-0321",
      name: "Emily Davis",
    },
    paymentMethod: "card",
    trackingNumber: "TRK987654321",
    whatsappDelivery: {
      enabled: false,
      status: "disabled",
      phoneNumber: "+1-555-0321",
    },
  },
  {
    id: "ORD-005",
    userId: "5",
    customerName: "Alex Chen",
    customerEmail: "alex@example.com",
    items: [
      {
        id: "5",
        name: "AirPods Pro 2",
        brand: "Apple",
        price: 249,
        image: "/images/airpods-pro-2.png",
        quantity: 2,
        // No IMEI for accessories
      },
    ],
    total: 498,
    status: "cancelled",
    createdAt: "2024-01-12T11:30:00Z",
    shippingAddress: {
      address: "654 Maple Dr",
      city: "Seattle",
      zipCode: "98101",
      phone: "+1-555-0654",
      name: "Alex Chen",
    },
    paymentMethod: "card",
    whatsappDelivery: {
      enabled: false,
      status: "disabled",
      phoneNumber: "+1-555-0654",
    },
  },
]

// Default message templates
const messageTemplates = {
  pending:
    "Hello {{customerName}}, your order {{orderId}} has been received and is being processed. We'll keep you updated!",
  processing:
    "Hi {{customerName}}! Great news - your order {{orderId}} is now being processed. We'll notify you once it ships!",
  shipped:
    "🚚 Exciting news {{customerName}}! Your order {{orderId}} has been shipped and is on its way. Track it with: {{trackingNumber}}",
  delivered:
    "🎉 Your order {{orderId}} has been delivered! We hope you love your new purchase. Thank you for choosing us!",
  cancelled:
    "We're sorry to inform you that your order {{orderId}} has been cancelled. If you have any questions, please contact us.",
}

// Function to check if a product category requires IMEI
const requiresIMEI = (productName: string): boolean => {
  const deviceKeywords = ["iphone", "samsung", "galaxy", "pixel", "ipad", "tablet", "smartphone", "phone"]
  return deviceKeywords.some((keyword) => productName.toLowerCase().includes(keyword))
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<ExtendedOrder[]>(mockOrders)
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(mockDeliveryPersons)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null)
  const [newDeliveryPerson, setNewDeliveryPerson] = useState<Partial<DeliveryPerson>>({})
  const [editingDeliveryPerson, setEditingDeliveryPerson] = useState<DeliveryPerson | null>(null)
  const [imeiInputs, setImeiInputs] = useState<Record<string, string>>({}) // Track IMEI inputs for each item
  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: "",
    phoneNumberId: "",
    accessToken: "",
    webhookUrl: "",
    enabled: true,
  })
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "processing":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
      case "shipped":
        return "text-purple-700 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400"
      case "delivered":
        return "text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
      case "cancelled":
        return "text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getWhatsAppStatusColor = (status: WhatsAppStatus) => {
    switch (status) {
      case "enabled":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
      case "sent":
        return "text-purple-700 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400"
      case "delivered":
        return "text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
      case "failed":
        return "text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />
      case "processing":
        return <RefreshCw className="h-3 w-3" />
      case "shipped":
        return <Truck className="h-3 w-3" />
      case "delivered":
        return <CheckCircle className="h-3 w-3" />
      case "cancelled":
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus }

          // Auto-send WhatsApp message if enabled
          if (order.whatsappDelivery.enabled && whatsappSettings.enabled) {
            sendWhatsAppMessage(updatedOrder, newStatus)
          }

          return updatedOrder
        }
        return order
      }),
    )
  }

  const updateItemIMEI = (orderId: string, itemId: string, imei: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, imei: imei.trim() || undefined }
              }
              return item
            }),
          }
        }
        return order
      }),
    )

    // Update selected order if it's the one being modified
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        items: selectedOrder.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, imei: imei.trim() || undefined }
          }
          return item
        }),
      })
    }

    toast({
      title: "IMEI Updated",
      description: `IMEI ${imei ? "assigned" : "removed"} for the device in order ${orderId}`,
    })
  }

  const copyIMEI = (imei: string) => {
    navigator.clipboard.writeText(imei)
    toast({
      title: "IMEI Copied!",
      description: "The IMEI number has been copied to your clipboard.",
    })
  }

  const assignDeliveryPerson = (orderId: string, deliveryPersonId: string) => {
    const deliveryPerson = deliveryPersons.find((dp) => dp.id === deliveryPersonId)
    if (!deliveryPerson) return

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              deliveryPerson,
            }
          : order,
      ),
    )

    toast({
      title: "Livreur Assigné",
      description: `${deliveryPerson.name} a été assigné à la commande ${orderId}`,
    })
  }

  const removeDeliveryPerson = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              deliveryPerson: undefined,
            }
          : order,
      ),
    )

    toast({
      title: "Livreur Retiré",
      description: `Le livreur a été retiré de la commande ${orderId}`,
    })
  }

  const addDeliveryPerson = () => {
    if (
      !newDeliveryPerson.name ||
      !newDeliveryPerson.email ||
      !newDeliveryPerson.phone ||
      !newDeliveryPerson.whatsappNumber
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const deliveryPerson: DeliveryPerson = {
      id: `dp-${Date.now()}`,
      name: newDeliveryPerson.name,
      email: newDeliveryPerson.email,
      phone: newDeliveryPerson.phone,
      whatsappNumber: newDeliveryPerson.whatsappNumber,
      whatsappLink:
        newDeliveryPerson.whatsappLink || `https://wa.me/${newDeliveryPerson.whatsappNumber.replace(/[^0-9]/g, "")}`,
      isActive: true,
      avatar: "/Placeholder.png?height=40&width=40",
    }

    setDeliveryPersons([...deliveryPersons, deliveryPerson])
    setNewDeliveryPerson({})

    toast({
      title: "Livreur Ajouté",
      description: `${deliveryPerson.name} a été ajouté avec succès`,
    })
  }

  const updateDeliveryPerson = () => {
    if (!editingDeliveryPerson) return

    setDeliveryPersons(
      deliveryPersons.map((dp) =>
        dp.id === editingDeliveryPerson.id
          ? {
              ...editingDeliveryPerson,
              whatsappLink:
                editingDeliveryPerson.whatsappLink ||
                `https://wa.me/${editingDeliveryPerson.whatsappNumber.replace(/[^0-9]/g, "")}`,
            }
          : dp,
      ),
    )

    // Update orders with the updated delivery person
    setOrders(
      orders.map((order) =>
        order.deliveryPerson?.id === editingDeliveryPerson.id
          ? {
              ...order,
              deliveryPerson: {
                ...editingDeliveryPerson,
                whatsappLink:
                  editingDeliveryPerson.whatsappLink ||
                  `https://wa.me/${editingDeliveryPerson.whatsappNumber.replace(/[^0-9]/g, "")}`,
              },
            }
          : order,
      ),
    )

    setEditingDeliveryPerson(null)

    toast({
      title: "Livreur Modifié",
      description: `Les informations de ${editingDeliveryPerson.name} ont été mises à jour`,
    })
  }

  const deleteDeliveryPerson = (deliveryPersonId: string) => {
    const deliveryPerson = deliveryPersons.find((dp) => dp.id === deliveryPersonId)
    if (!deliveryPerson) return

    // Remove from delivery persons list
    setDeliveryPersons(deliveryPersons.filter((dp) => dp.id !== deliveryPersonId))

    // Remove from orders
    setOrders(
      orders.map((order) =>
        order.deliveryPerson?.id === deliveryPersonId
          ? {
              ...order,
              deliveryPerson: undefined,
            }
          : order,
      ),
    )

    toast({
      title: "Livreur Supprimé",
      description: `${deliveryPerson.name} a été supprimé`,
    })
  }

  const toggleWhatsAppDelivery = (orderId: string, enabled: boolean) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              whatsappDelivery: {
                ...order.whatsappDelivery,
                enabled,
                status: enabled ? "enabled" : "disabled",
              },
            }
          : order,
      ),
    )

    toast({
      title: enabled ? "WhatsApp Delivery Enabled" : "WhatsApp Delivery Disabled",
      description: `Order ${orderId} WhatsApp notifications ${enabled ? "enabled" : "disabled"}.`,
    })
  }

  const updateWhatsAppMessage = (orderId: string, message: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              whatsappDelivery: {
                ...order.whatsappDelivery,
                deliveryMessage: message,
              },
            }
          : order,
      ),
    )
  }

  const sendWhatsAppMessage = async (order: ExtendedOrder, status?: string) => {
    try {
      // Simulate API call to WhatsApp Business API (Twilio/Meta)
      const messageTemplate = status
        ? messageTemplates[status as keyof typeof messageTemplates]
        : order.whatsappDelivery.deliveryMessage

      if (!messageTemplate) {
        throw new Error("No message template found")
      }

      // Replace template variables
      const personalizedMessage = messageTemplate
        .replace(/\{\{customerName\}\}/g, order.customerName)
        .replace(/\{\{orderId\}\}/g, order.id)
        .replace(/\{\{trackingNumber\}\}/g, order.trackingNumber || "N/A")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update order status
      setOrders(
        orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                whatsappDelivery: {
                  ...o.whatsappDelivery,
                  status: "sent",
                  lastSent: new Date().toISOString(),
                },
              }
            : o,
        ),
      )

      toast({
        title: "WhatsApp Message Sent",
        description: `Delivery update sent to ${order.customerName} at ${order.whatsappDelivery.phoneNumber}`,
      })

      // Simulate delivery confirmation after 2 seconds
      setTimeout(() => {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  whatsappDelivery: {
                    ...o.whatsappDelivery,
                    status: "delivered",
                  },
                }
              : o,
          ),
        )
      }, 2000)
    } catch (error) {
      setOrders(
        orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                whatsappDelivery: {
                  ...o.whatsappDelivery,
                  status: "failed",
                },
              }
            : o,
        ),
      )

      toast({
        title: "WhatsApp Message Failed",
        description: "Failed to send WhatsApp message. Please check your settings.",
        variant: "destructive",
      })
    }
  }

  const contactDeliveryPerson = (deliveryPerson: DeliveryPerson) => {
    if (deliveryPerson.whatsappLink) {
      window.open(deliveryPerson.whatsappLink, "_blank")
    } else {
      window.open(`https://wa.me/${deliveryPerson.whatsappNumber.replace(/[^0-9]/g, "")}`, "_blank")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.imei && item.imei.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérer les commandes, livreurs et notifications WhatsApp
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Delivery Persons Management Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <User className="h-4 w-4 mr-2" />
                Gérer les Livreurs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gestion des Livreurs</DialogTitle>
                <DialogDescription>Ajouter, modifier ou supprimer des livreurs</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Add New Delivery Person */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Ajouter un Nouveau Livreur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-name">Nom Complet *</Label>
                      <Input
                        id="new-name"
                        placeholder="Ex: Ahmed Ben Ali"
                        value={newDeliveryPerson.name || ""}
                        onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Ex: ahmed@delivery.com"
                        value={newDeliveryPerson.email || ""}
                        onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-phone">Téléphone *</Label>
                      <Input
                        id="new-phone"
                        placeholder="Ex: +216-98-123-456"
                        value={newDeliveryPerson.phone || ""}
                        onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-whatsapp">Numéro WhatsApp *</Label>
                      <Input
                        id="new-whatsapp"
                        placeholder="Ex: +216-98-123-456"
                        value={newDeliveryPerson.whatsappNumber || ""}
                        onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, whatsappNumber: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="new-whatsapp-link">Lien WhatsApp (Optionnel)</Label>
                      <Input
                        id="new-whatsapp-link"
                        placeholder="Ex: https://wa.me/21698123456"
                        value={newDeliveryPerson.whatsappLink || ""}
                        onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, whatsappLink: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addDeliveryPerson} className="mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter le Livreur
                  </Button>
                </div>

                {/* Existing Delivery Persons */}
                <div>
                  <h3 className="font-semibold mb-4">Livreurs Existants ({deliveryPersons.length})</h3>
                  <div className="space-y-3">
                    {deliveryPersons.map((deliveryPerson) => (
                      <div
                        key={deliveryPerson.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={deliveryPerson.avatar || "/Placeholder.png"}
                            alt={deliveryPerson.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{deliveryPerson.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{deliveryPerson.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Tel: {deliveryPerson.phone} | WhatsApp: {deliveryPerson.whatsappNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={cn(
                              "px-2 py-1 text-xs",
                              deliveryPerson.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                            )}
                          >
                            {deliveryPerson.isActive ? "Actif" : "Inactif"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactDeliveryPerson(deliveryPerson)}
                            className="bg-transparent"
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDeliveryPerson(deliveryPerson)}
                            className="bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDeliveryPerson(deliveryPerson.id)}
                            className="bg-transparent text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Delivery Person Dialog */}
          {editingDeliveryPerson && (
            <Dialog open={!!editingDeliveryPerson} onOpenChange={() => setEditingDeliveryPerson(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Modifier le Livreur</DialogTitle>
                  <DialogDescription>Modifier les informations de {editingDeliveryPerson.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Nom Complet</Label>
                      <Input
                        id="edit-name"
                        value={editingDeliveryPerson.name}
                        onChange={(e) => setEditingDeliveryPerson({ ...editingDeliveryPerson, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingDeliveryPerson.email}
                        onChange={(e) => setEditingDeliveryPerson({ ...editingDeliveryPerson, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Téléphone</Label>
                      <Input
                        id="edit-phone"
                        value={editingDeliveryPerson.phone}
                        onChange={(e) => setEditingDeliveryPerson({ ...editingDeliveryPerson, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-whatsapp">Numéro WhatsApp</Label>
                      <Input
                        id="edit-whatsapp"
                        value={editingDeliveryPerson.whatsappNumber}
                        onChange={(e) =>
                          setEditingDeliveryPerson({ ...editingDeliveryPerson, whatsappNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-whatsapp-link">Lien WhatsApp</Label>
                      <Input
                        id="edit-whatsapp-link"
                        value={editingDeliveryPerson.whatsappLink || ""}
                        onChange={(e) =>
                          setEditingDeliveryPerson({ ...editingDeliveryPerson, whatsappLink: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingDeliveryPerson.isActive}
                      onCheckedChange={(isActive) => setEditingDeliveryPerson({ ...editingDeliveryPerson, isActive })}
                    />
                    <Label>Livreur Actif</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingDeliveryPerson(null)}>
                      Annuler
                    </Button>
                    <Button onClick={updateDeliveryPerson}>Sauvegarder</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* WhatsApp Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres WhatsApp
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Paramètres WhatsApp Business API</DialogTitle>
                <DialogDescription>
                  Configurer votre intégration WhatsApp Business API pour les notifications de commandes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey">Clé API</Label>
                    <Input
                      id="apiKey"
                      placeholder="Votre clé API WhatsApp Business"
                      value={whatsappSettings.apiKey}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, apiKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumberId">ID du Numéro de Téléphone</Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="ID du numéro WhatsApp Business"
                      value={whatsappSettings.phoneNumberId}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumberId: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accessToken">Token d'Accès</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Token d'accès WhatsApp Business"
                    value={whatsappSettings.accessToken}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, accessToken: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="webhookUrl">URL Webhook</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://votre-domaine.com/webhook/whatsapp"
                    value={whatsappSettings.webhookUrl}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, webhookUrl: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsappEnabled"
                    checked={whatsappSettings.enabled}
                    onCheckedChange={(enabled) => setWhatsappSettings({ ...whatsappSettings, enabled })}
                  />
                  <Label htmlFor="whatsappEnabled">Activer les Notifications WhatsApp</Label>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Guide d'Intégration</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Inscrivez-vous à l'API WhatsApp Business via Meta ou Twilio</li>
                    <li>• Obtenez vos identifiants API depuis le tableau de bord du fournisseur</li>
                    <li>• Configurez l'URL webhook pour les confirmations de livraison</li>
                    <li>• Testez l'intégration avec un message d'exemple</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Période
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par ID, nom client, email ou IMEI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les Statuts</SelectItem>
                <SelectItem value="pending">En Attente</SelectItem>
                <SelectItem value="processing">En Traitement</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
          <CardDescription>
            {statusFilter === "all" ? "Toutes les commandes" : `Commandes avec statut: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== "all"
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Les nouvelles commandes apparaîtront ici"}
                </p>
              </div>
            )}
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  <img
                    src={order.items[0]?.image || "/Placeholder.png?height=60&width=60"}
                    alt={order.items[0]?.name}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{order.id}</p>
                      <Badge
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(order.status),
                        )}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      {/* WhatsApp Status Badge */}
                      <Badge
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          getWhatsAppStatusColor(order.whatsappDelivery.status),
                        )}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {order.whatsappDelivery.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{order.items[0]?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} à{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {/* Delivery Person Info */}
                    {order.deliveryPerson && (
                      <div className="flex items-center space-x-2 mt-2">
                        <img
                          src={order.deliveryPerson.avatar || "/Placeholder.png"}
                          alt={order.deliveryPerson.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Livreur: {order.deliveryPerson.name}
                        </span>
                      </div>
                    )}
                    {/* IMEI Info */}
                    {order.items.some((item) => item.imei) && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">IMEI assigné</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                  <div className="text-left lg:text-right">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{order.paymentMethod}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Delivery Person Assignment */}
                    <Select
                      value={order.deliveryPerson?.id || ""}
                      onValueChange={(value) => {
                        if (value === "remove") {
                          removeDeliveryPerson(order.id)
                        } else {
                          assignDeliveryPerson(order.id, value)
                        }
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <User className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Assigner livreur" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryPersons
                          .filter((dp) => dp.isActive)
                          .map((deliveryPerson) => (
                            <SelectItem key={deliveryPerson.id} value={deliveryPerson.id}>
                              {deliveryPerson.name}
                            </SelectItem>
                          ))}
                        {order.deliveryPerson && (
                          <SelectItem value="remove" className="text-red-600">
                            Retirer le livreur
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Contact Delivery Person */}
                    {order.deliveryPerson && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contactDeliveryPerson(order.deliveryPerson!)}
                        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        title="Contacter votre livreur"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Votre Livreur
                      </Button>
                    )}

                    {/* WhatsApp Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={order.whatsappDelivery.enabled}
                        onCheckedChange={(enabled) => toggleWhatsAppDelivery(order.id, enabled)}
                        disabled={!whatsappSettings.enabled}
                      />
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>

                    {/* Send WhatsApp Message */}
                    {order.whatsappDelivery.enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendWhatsAppMessage(order)}
                        className="bg-transparent"
                        disabled={!whatsappSettings.enabled}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Contact Buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${order.shippingAddress.phone}`)}
                      className="bg-transparent"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${order.customerEmail}`)}
                      className="bg-transparent"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>

                    {/* View Details */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="bg-transparent"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails de la Commande - {selectedOrder?.id}</DialogTitle>
                          <DialogDescription>
                            Informations complètes de la commande et paramètres de livraison WhatsApp
                          </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold mb-2">Informations Client</h3>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <strong>Nom:</strong> {selectedOrder.customerName}
                                  </p>
                                  <p>
                                    <strong>Email:</strong> {selectedOrder.customerEmail}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <strong>Téléphone:</strong>
                                    <span>{selectedOrder.shippingAddress.phone}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`tel:${selectedOrder.shippingAddress.phone}`)}
                                      className="p-1 h-auto"
                                    >
                                      <Phone className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Adresse de Livraison</h3>
                                <div className="space-y-1 text-sm">
                                  <p>{selectedOrder.shippingAddress.address}</p>
                                  <p>
                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        `https://maps.google.com/?q=${encodeURIComponent(selectedOrder.shippingAddress.address + ", " + selectedOrder.shippingAddress.city)}`,
                                      )
                                    }
                                    className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Voir sur la Carte
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Order Items with IMEI Management */}
                            <div>
                              <h3 className="font-semibold mb-2">Articles Commandés</h3>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                  >
                                    <img
                                      src={item.image || "/Placeholder.png"}
                                      alt={item.name}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand}</p>
                                      <p className="text-sm font-semibold">
                                        {formatCurrency(item.price)} x {item.quantity}
                                      </p>

                                      {/* IMEI Section for devices */}
                                      {requiresIMEI(item.name) && (
                                        <div className="mt-3 space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                            <Label className="text-sm font-medium">IMEI du Dispositif</Label>
                                          </div>

                                          {item.imei ? (
                                            <div className="flex items-center space-x-2">
                                              <code className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-sm font-mono">
                                                {item.imei}
                                              </code>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyIMEI(item.imei!)}
                                                className="p-1 h-auto"
                                              >
                                                <Copy className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateItemIMEI(selectedOrder.id, item.id, "")}
                                                className="p-1 h-auto text-red-600 hover:text-red-800"
                                              >
                                                <XCircle className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2">
                                              <Input
                                                placeholder="Entrer l'IMEI (15 chiffres)"
                                                value={imeiInputs[`${selectedOrder.id}-${item.id}`] || ""}
                                                onChange={(e) => {
                                                  const value = e.target.value.replace(/\D/g, "").slice(0, 15)
                                                  setImeiInputs({
                                                    ...imeiInputs,
                                                    [`${selectedOrder.id}-${item.id}`]: value,
                                                  })
                                                }}
                                                className="max-w-xs"
                                                maxLength={15}
                                              />
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  const imei = imeiInputs[`${selectedOrder.id}-${item.id}`]
                                                  if (imei && imei.length === 15) {
                                                    updateItemIMEI(selectedOrder.id, item.id, imei)
                                                    setImeiInputs({
                                                      ...imeiInputs,
                                                      [`${selectedOrder.id}-${item.id}`]: "",
                                                    })
                                                  } else {
                                                    toast({
                                                      title: "IMEI Invalide",
                                                      description: "L'IMEI doit contenir exactement 15 chiffres",
                                                      variant: "destructive",
                                                    })
                                                  }
                                                }}
                                                disabled={
                                                  !imeiInputs[`${selectedOrder.id}-${item.id}`] ||
                                                  imeiInputs[`${selectedOrder.id}-${item.id}`].length !== 15
                                                }
                                              >
                                                <Shield className="h-4 w-4 mr-1" />
                                                Assigner IMEI
                                              </Button>
                                            </div>
                                          )}

                                          <p className="text-xs text-gray-500">
                                            L'IMEI est requis pour la sécurité et la vérification lors de la livraison
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Person Assignment */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <h3 className="font-semibold mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Gestion du Livreur
                              </h3>

                              <div className="space-y-4">
                                {selectedOrder.deliveryPerson ? (
                                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={selectedOrder.deliveryPerson.avatar || "/Placeholder.png"}
                                        alt={selectedOrder.deliveryPerson.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {selectedOrder.deliveryPerson.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {selectedOrder.deliveryPerson.phone}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        onClick={() => contactDeliveryPerson(selectedOrder.deliveryPerson!)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Contacter sur WhatsApp
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => removeDeliveryPerson(selectedOrder.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        Retirer
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                      Aucun livreur assigné à cette commande
                                    </p>
                                    <Select
                                      onValueChange={(value) => {
                                        assignDeliveryPerson(selectedOrder.id, value)
                                        const deliveryPerson = deliveryPersons.find((dp) => dp.id === value)
                                        if (deliveryPerson) {
                                          setSelectedOrder({
                                            ...selectedOrder,
                                            deliveryPerson,
                                          })
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un livreur" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {deliveryPersons
                                          .filter((dp) => dp.isActive)
                                          .map((deliveryPerson) => (
                                            <SelectItem key={deliveryPerson.id} value={deliveryPerson.id}>
                                              <div className="flex items-center space-x-2">
                                                <img
                                                  src={deliveryPerson.avatar || "/Placeholder.png"}
                                                  alt={deliveryPerson.name}
                                                  className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span>{deliveryPerson.name}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* WhatsApp Delivery Settings */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <h3 className="font-semibold mb-4 flex items-center">
                                <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                                Paramètres de Livraison WhatsApp
                              </h3>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="whatsapp-toggle">Activer les Notifications WhatsApp</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Envoyer les mises à jour de commande via WhatsApp à{" "}
                                      {selectedOrder.whatsappDelivery.phoneNumber}
                                    </p>
                                  </div>
                                  <Switch
                                    id="whatsapp-toggle"
                                    checked={selectedOrder.whatsappDelivery.enabled}
                                    onCheckedChange={(enabled) => {
                                      toggleWhatsAppDelivery(selectedOrder.id, enabled)
                                      setSelectedOrder({
                                        ...selectedOrder,
                                        whatsappDelivery: {
                                          ...selectedOrder.whatsappDelivery,
                                          enabled,
                                          status: enabled ? "enabled" : "disabled",
                                        },
                                      })
                                    }}
                                    disabled={!whatsappSettings.enabled}
                                  />
                                </div>

                                {selectedOrder.whatsappDelivery.enabled && (
                                  <>
                                    <div>
                                      <Label htmlFor="delivery-message">Message de Livraison Personnalisé</Label>
                                      <Textarea
                                        id="delivery-message"
                                        placeholder="Entrez un message personnalisé pour cette commande..."
                                        value={selectedOrder.whatsappDelivery.deliveryMessage || ""}
                                        onChange={(e) => {
                                          const updatedOrder = {
                                            ...selectedOrder,
                                            whatsappDelivery: {
                                              ...selectedOrder.whatsappDelivery,
                                              deliveryMessage: e.target.value,
                                            },
                                          }
                                          setSelectedOrder(updatedOrder)
                                          updateWhatsAppMessage(selectedOrder.id, e.target.value)
                                        }}
                                        className="mt-1"
                                        rows={3}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Utilisez les variables: {`{{customerName}}, {{orderId}}, {{trackingNumber}}`}
                                      </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Button
                                        onClick={() => sendWhatsAppMessage(selectedOrder)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={!whatsappSettings.enabled}
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Envoyer Message WhatsApp
                                      </Button>

                                      <div className="flex items-center space-x-2">
                                        <Badge
                                          className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            getWhatsAppStatusColor(selectedOrder.whatsappDelivery.status),
                                          )}
                                        >
                                          {selectedOrder.whatsappDelivery.status === "delivered" && (
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                          )}
                                          {selectedOrder.whatsappDelivery.status === "failed" && (
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                          )}
                                          {selectedOrder.whatsappDelivery.status === "sent" && (
                                            <Send className="h-3 w-3 mr-1" />
                                          )}
                                          <span className="capitalize">{selectedOrder.whatsappDelivery.status}</span>
                                        </Badge>

                                        {selectedOrder.whatsappDelivery.lastSent && (
                                          <span className="text-xs text-gray-500">
                                            Dernier envoi:{" "}
                                            {new Date(selectedOrder.whatsappDelivery.lastSent).toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {!whatsappSettings.enabled && (
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        WhatsApp Business API n'est pas configuré. Configurez-le dans les paramètres
                                        pour activer les notifications.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Update */}
                            <div>
                              <h3 className="font-semibold mb-2">Mettre à Jour le Statut</h3>
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(newStatus) => {
                                  updateOrderStatus(selectedOrder.id, newStatus)
                                  setSelectedOrder({ ...selectedOrder, status: newStatus })
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">En Attente</SelectItem>
                                  <SelectItem value="processing">En Traitement</SelectItem>
                                  <SelectItem value="shipped">Expédié</SelectItem>
                                  <SelectItem value="delivered">Livré</SelectItem>
                                  <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-xl font-bold text-[#01A0EA]">
                                  {formatCurrency(selectedOrder.total)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Méthode de paiement: {selectedOrder.paymentMethod}
                              </p>
                              {selectedOrder.trackingNumber && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Numéro de suivi: {selectedOrder.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          disabled={order.status === "processing"}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Marquer en Traitement
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          disabled={order.status === "shipped" || order.status === "delivered"}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Marquer comme Expédié
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={order.status === "delivered"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer comme Livré
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={order.status === "cancelled" || order.status === "delivered"}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler la Commande
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== "all"
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Les nouvelles commandes apparaîtront ici"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
