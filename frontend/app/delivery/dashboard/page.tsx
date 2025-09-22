"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Truck,
  MapPin,
  Phone,
  Star,
  Package,
  Clock,
  DollarSign,
  Navigation,
  Camera,
  CheckCircle,
  AlertCircle,
  LogOut,
  Menu,
  X,
  Loader2,
  QrCode,
} from "lucide-react"
import { useDeliveryAuth } from "@/hooks/use-delivery-auth"
import { cn } from "@/lib/utils"

interface DeliveryOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  total: number
  status: "assigned" | "picked_up" | "in_transit" | "delivered"
  estimatedTime: string
  distance: string
  paymentMethod: "cash" | "card" | "online"
  specialInstructions?: string
  qrCode: string
}

const mockOrders: DeliveryOrder[] = [
  {
    id: "ord_001",
    orderNumber: "KP-2024-001",
    customerName: "Sarah Al-Mahmoud",
    customerPhone: "+966501234567",
    address: "King Fahd Road, Al Olaya District, Riyadh 12333",
    coordinates: {
      lat: 24.7136,
      lng: 46.6753,
    },
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro Max",
        quantity: 1,
        price: 4999,
        image: "/images/iphone-15-pro-max.png",
      },
      {
        id: "2",
        name: "AirPods Pro 2",
        quantity: 1,
        price: 899,
        image: "/images/airpods-pro-2.png",
      },
    ],
    total: 5898,
    status: "assigned",
    estimatedTime: "25 mins",
    distance: "3.2 km",
    paymentMethod: "cash",
    specialInstructions: "Call when you arrive at the building entrance",
    qrCode: "QR_KP_2024_001",
  },
  {
    id: "ord_002",
    orderNumber: "KP-2024-002",
    customerName: "Mohammed Al-Rashid",
    customerPhone: "+966507654321",
    address: "Prince Sultan Road, Al Khobar 31952",
    coordinates: {
      lat: 26.2172,
      lng: 50.1971,
    },
    items: [
      {
        id: "3",
        name: "Samsung Galaxy S24 Ultra",
        quantity: 1,
        price: 4599,
        image: "/images/samsung-galaxy-s24-ultra.png",
      },
      {
        id: "4",
        name: "Galaxy Buds Pro",
        quantity: 1,
        price: 699,
        image: "/images/samsung-galaxy-buds-pro.png",
      },
    ],
    total: 5298,
    status: "picked_up",
    estimatedTime: "18 mins",
    distance: "2.8 km",
    paymentMethod: "online",
    qrCode: "QR_KP_2024_002",
  },
  {
    id: "ord_003",
    orderNumber: "KP-2024-003",
    customerName: "Fatima Al-Zahra",
    customerPhone: "+966509876543",
    address: "Tahlia Street, Al Salamah District, Jeddah 23433",
    coordinates: {
      lat: 21.5433,
      lng: 39.1728,
    },
    items: [
      {
        id: "5",
        name: "MacBook Pro 16-inch",
        quantity: 1,
        price: 8999,
        image: "/images/macbook-pro-16.png",
      },
    ],
    total: 8999,
    status: "in_transit",
    estimatedTime: "12 mins",
    distance: "1.5 km",
    paymentMethod: "card",
    specialInstructions: "Apartment 304, Building B",
    qrCode: "QR_KP_2024_003",
  },
]

export default function DeliveryDashboard() {
  const { user, logout, isLoading } = useDeliveryAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockOrders)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scanningOrder, setScanningOrder] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/delivery/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#01A0EA]" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const todayStats = {
    completed: 12,
    pending: orders.filter((o) => o.status !== "delivered").length,
    earnings: 450.75,
    rating: user.rating,
  }

  const handleNavigate = (order: DeliveryOrder) => {
    if (order.coordinates) {
      // Open Google Maps with coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}&travelmode=driving`
      window.open(url, "_blank")
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(order.address)
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(url, "_blank")
    }
  }

  const handleScanQR = async (orderId: string) => {
    setScanningOrder(orderId)
    setScanProgress(0)

    // Simulate QR scanning process
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Mark order as delivered
          setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? { ...order, status: "delivered" as const } : order)),
          )
          setScanningOrder(null)
          setScanProgress(0)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  const getStatusColor = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "picked_up":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "in_transit":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "assigned":
        return <AlertCircle className="w-4 h-4" />
      case "picked_up":
        return <Package className="w-4 h-4" />
      case "in_transit":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#01A0EA] rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">KARKACHI PHONE</p>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-[#01A0EA]">
                  <AvatarImage src={user.avatar || "/Placeholder.png"} alt={user.name} />
                  <AvatarFallback className="bg-[#01A0EA] text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.zone} • {user.vehicleType}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-[#01A0EA]">
                  <AvatarImage src={user.avatar || "/Placeholder.png"} alt={user.name} />
                  <AvatarFallback className="bg-[#01A0EA] text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.zone} • {user.vehicleType}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.completed}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.pending}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${todayStats.earnings}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Today's Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.rating}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Active Deliveries</span>
            </CardTitle>
            <CardDescription>Manage your current delivery assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders
              .filter((order) => order.status !== "delivered")
              .map((order) => (
                <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h3>
                        <Badge className={cn("text-xs", getStatusColor(order.status))}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.customerName} • {order.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${order.total}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Items ({order.items.length}):
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2"
                        >
                          <img
                            src={item.image || "/Placeholder.png"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} • ${item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{order.address}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.distance} • {order.estimatedTime}
                      </p>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Special Instructions:</strong> {order.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* QR Scanning Progress */}
                  {scanningOrder === order.id && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <QrCode className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Scanning QR Code...
                        </span>
                      </div>
                      <Progress value={scanProgress} className="h-2" />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">{scanProgress}% Complete</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNavigate(order)}
                      className="flex items-center space-x-1"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Navigate</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCall(order.customerPhone)}
                      className="flex items-center space-x-1"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </Button>

                    {(order.status === "picked_up" || order.status === "in_transit") && (
                      <Button
                        size="sm"
                        onClick={() => handleScanQR(order.id)}
                        disabled={scanningOrder === order.id}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {scanningOrder === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <span>Scan QR & Deliver</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            {orders.filter((order) => order.status !== "delivered").length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active deliveries at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
