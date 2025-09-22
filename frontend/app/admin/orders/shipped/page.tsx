"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Eye, Truck, CheckCircle, Clock, DollarSign, AlertTriangle, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  shippedAt: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
  shippingAddress: {
    name: string
    address: string
    city: string
    zipCode: string
    country: string
  }
}

// Mock data for shipped orders
const initialShippedOrders: Order[] = [
  {
    id: "ORD-010",
    customerName: "Emma Wilson",
    customerEmail: "emma@example.com",
    items: [
      { id: "1", name: "iPhone 15", quantity: 1, price: 799 },
      { id: "2", name: "Lightning Cable", quantity: 1, price: 19 },
    ],
    total: 818,
    status: "shipped",
    paymentStatus: "paid",
    priority: "medium",
    createdAt: "2024-01-10T09:30:00Z",
    shippedAt: "2024-01-12T14:20:00Z",
    trackingNumber: "1Z999AA1234567890",
    carrier: "UPS",
    estimatedDelivery: "2024-01-16T00:00:00Z",
    shippingAddress: {
      name: "Emma Wilson",
      address: "123 Oak Street",
      city: "Portland",
      zipCode: "97201",
      country: "USA",
    },
  },
  {
    id: "ORD-011",
    customerName: "Frank Miller",
    customerEmail: "frank@example.com",
    items: [{ id: "3", name: "MacBook Pro 14", quantity: 1, price: 1999 }],
    total: 1999,
    status: "shipped",
    paymentStatus: "paid",
    priority: "high",
    createdAt: "2024-01-09T16:45:00Z",
    shippedAt: "2024-01-11T10:30:00Z",
    trackingNumber: "1Z999AA1234567891",
    carrier: "FedEx",
    estimatedDelivery: "2024-01-15T00:00:00Z",
    shippingAddress: {
      name: "Frank Miller",
      address: "456 Pine Avenue",
      city: "Seattle",
      zipCode: "98101",
      country: "USA",
    },
  },
  {
    id: "ORD-012",
    customerName: "Grace Chen",
    customerEmail: "grace@example.com",
    items: [
      { id: "4", name: "iPad Pro 11", quantity: 1, price: 799 },
      { id: "5", name: "Apple Pencil 2", quantity: 1, price: 129 },
    ],
    total: 928,
    status: "shipped",
    paymentStatus: "paid",
    priority: "urgent",
    createdAt: "2024-01-08T11:15:00Z",
    shippedAt: "2024-01-10T08:45:00Z",
    trackingNumber: "1Z999AA1234567892",
    carrier: "DHL",
    estimatedDelivery: "2024-01-14T00:00:00Z",
    shippingAddress: {
      name: "Grace Chen",
      address: "789 Maple Drive",
      city: "Denver",
      zipCode: "80201",
      country: "USA",
    },
  },
  {
    id: "ORD-013",
    customerName: "Henry Davis",
    customerEmail: "henry@example.com",
    items: [{ id: "6", name: "AirPods Max", quantity: 1, price: 549 }],
    total: 549,
    status: "shipped",
    paymentStatus: "paid",
    priority: "low",
    createdAt: "2024-01-07T13:20:00Z",
    shippedAt: "2024-01-09T15:10:00Z",
    trackingNumber: "1Z999AA1234567893",
    carrier: "USPS",
    estimatedDelivery: "2024-01-17T00:00:00Z",
    shippingAddress: {
      name: "Henry Davis",
      address: "321 Cedar Lane",
      city: "Phoenix",
      zipCode: "85001",
      country: "USA",
    },
  },
]

export default function ShippedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialShippedOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("shipped")
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock },
      processing: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Package },
      shipped: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Truck },
      delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.shipped
    const Icon = config.icon

    return (
      <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
      medium: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      high: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
      urgent: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium

    return (
      <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getCarrierBadge = (carrier: string) => {
    const carrierConfig = {
      UPS: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
      FedEx: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
      DHL: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      USPS: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    }

    const config = carrierConfig[carrier as keyof typeof carrierConfig] || carrierConfig.UPS

    return (
      <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Truck className="h-3 w-3 mr-1" />
        {carrier}
      </Badge>
    )
  }

  const handleTrackPackage = (trackingNumber: string, carrier: string) => {
    // In a real app, this would open the carrier's tracking page
    toast({
      title: "Tracking Package",
      description: `Opening ${carrier} tracking for ${trackingNumber}`,
    })
  }

  const handleMarkDelivered = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Order Delivered",
      description: `Order ${orderId} has been marked as delivered.`,
    })
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCarrier = carrierFilter === "all" || order.carrier === carrierFilter
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

      return matchesSearch && matchesCarrier && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "shipped":
          return new Date(b.shippedAt).getTime() - new Date(a.shippedAt).getTime()
        case "delivery":
          return new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime()
        case "amount":
          return b.total - a.total
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        default:
          return 0
      }
    })

  // Calculate stats
  const totalOrders = orders.length
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0)
  const urgentOrders = orders.filter((order) => order.priority === "urgent").length
  const deliveringSoon = orders.filter(
    (order) => new Date(order.estimatedDelivery) <= new Date(Date.now() + 24 * 60 * 60 * 1000),
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipped Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and monitor shipped orders and deliveries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipped</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{urgentOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivering Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{deliveringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by ID, customer, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Carrier</Label>
              <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Carriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="USPS">USPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipped">Ship Date (Recent)</SelectItem>
                  <SelectItem value="delivery">Delivery Date (Soon)</SelectItem>
                  <SelectItem value="amount">Amount (Highest)</SelectItem>
                  <SelectItem value="priority">Priority (Urgent First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>Orders that have been shipped and are in transit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <p key={item.id} className="text-sm">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{getCarrierBadge(order.carrier)}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleTrackPackage(order.trackingNumber, order.carrier)}
                        className="p-0 h-auto font-mono text-xs"
                      >
                        {order.trackingNumber}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(order.estimatedDelivery)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDelivered(order.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackPackage(order.trackingNumber, order.carrier)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No shipped orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || carrierFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No orders have been shipped yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
