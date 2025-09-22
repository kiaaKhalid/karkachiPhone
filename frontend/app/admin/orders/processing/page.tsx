"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Package, Search, Eye, Truck, XCircle, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
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
  processingStarted: string
  estimatedShipping?: string
  shippingAddress: {
    name: string
    address: string
    city: string
    zipCode: string
    country: string
  }
}

// Mock data for processing orders
const initialProcessingOrders: Order[] = [
  {
    id: "ORD-006",
    customerName: "Alice Cooper",
    customerEmail: "alice@example.com",
    items: [
      { id: "1", name: "iPhone 15 Pro", quantity: 1, price: 999 },
      { id: "2", name: "MagSafe Charger", quantity: 1, price: 39 },
    ],
    total: 1038,
    status: "processing",
    paymentStatus: "paid",
    priority: "high",
    createdAt: "2024-01-13T08:30:00Z",
    processingStarted: "2024-01-13T10:15:00Z",
    estimatedShipping: "2024-01-16T00:00:00Z",
    shippingAddress: {
      name: "Alice Cooper",
      address: "789 Broadway",
      city: "New York",
      zipCode: "10003",
      country: "USA",
    },
  },
  {
    id: "ORD-007",
    customerName: "Bob Smith",
    customerEmail: "bob@example.com",
    items: [{ id: "3", name: "MacBook Air M2", quantity: 1, price: 1199 }],
    total: 1199,
    status: "processing",
    paymentStatus: "paid",
    priority: "medium",
    createdAt: "2024-01-12T14:20:00Z",
    processingStarted: "2024-01-13T09:30:00Z",
    estimatedShipping: "2024-01-17T00:00:00Z",
    shippingAddress: {
      name: "Bob Smith",
      address: "456 Tech Ave",
      city: "San Francisco",
      zipCode: "94102",
      country: "USA",
    },
  },
  {
    id: "ORD-008",
    customerName: "Carol Johnson",
    customerEmail: "carol@example.com",
    items: [
      { id: "4", name: "iPad Air", quantity: 1, price: 599 },
      { id: "5", name: "Apple Pencil", quantity: 1, price: 129 },
      { id: "6", name: "Smart Keyboard", quantity: 1, price: 179 },
    ],
    total: 907,
    status: "processing",
    paymentStatus: "paid",
    priority: "urgent",
    createdAt: "2024-01-12T11:45:00Z",
    processingStarted: "2024-01-12T16:20:00Z",
    estimatedShipping: "2024-01-15T00:00:00Z",
    shippingAddress: {
      name: "Carol Johnson",
      address: "321 Design St",
      city: "Austin",
      zipCode: "73301",
      country: "USA",
    },
  },
  {
    id: "ORD-009",
    customerName: "Daniel Lee",
    customerEmail: "daniel@example.com",
    items: [{ id: "7", name: "Apple Watch Series 9", quantity: 1, price: 399 }],
    total: 399,
    status: "processing",
    paymentStatus: "paid",
    priority: "low",
    createdAt: "2024-01-11T16:30:00Z",
    processingStarted: "2024-01-12T08:45:00Z",
    estimatedShipping: "2024-01-18T00:00:00Z",
    shippingAddress: {
      name: "Daniel Lee",
      address: "654 Fitness Blvd",
      city: "Miami",
      zipCode: "33101",
      country: "USA",
    },
  },
]

export default function ProcessingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialProcessingOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("processing")
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
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing
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

  const handleShipOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Order Shipped",
      description: `Order ${orderId} has been marked as shipped.`,
    })
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Order Cancelled",
      description: `Order ${orderId} has been cancelled.`,
      variant: "destructive",
    })
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

      return matchesSearch && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "processing":
          return new Date(b.processingStarted).getTime() - new Date(a.processingStarted).getTime()
        case "shipping":
          if (!a.estimatedShipping || !b.estimatedShipping) return 0
          return new Date(a.estimatedShipping).getTime() - new Date(b.estimatedShipping).getTime()
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
  const readyToShip = orders.filter(
    (order) => order.estimatedShipping && new Date(order.estimatedShipping) <= new Date(),
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Processing Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage orders currently being processed</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Ship</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{readyToShip}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by ID, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                  <SelectItem value="processing">Processing Date</SelectItem>
                  <SelectItem value="shipping">Shipping Date</SelectItem>
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
          <CardDescription>Orders currently being processed and prepared for shipping</CardDescription>
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
                  <TableHead>Processing Started</TableHead>
                  <TableHead>Est. Shipping</TableHead>
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
                    <TableCell className="text-sm">{formatDate(order.processingStarted)}</TableCell>
                    <TableCell className="text-sm">
                      {order.estimatedShipping ? formatDate(order.estimatedShipping) : "TBD"}
                    </TableCell>
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
                          onClick={() => handleShipOrder(order.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Truck className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel order {order.id}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No processing orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || priorityFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No orders are currently being processed."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
