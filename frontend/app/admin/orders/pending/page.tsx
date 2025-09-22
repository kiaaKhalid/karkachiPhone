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
import { Package, Search, Eye, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from "lucide-react"
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
  shippingAddress: {
    name: string
    address: string
    city: string
    zipCode: string
    country: string
  }
}

// Mock data for pending orders
const initialPendingOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    items: [
      { id: "1", name: "iPhone 15 Pro Max", quantity: 1, price: 1199 },
      { id: "2", name: "AirPods Pro", quantity: 1, price: 249 },
    ],
    total: 1448,
    status: "pending",
    paymentStatus: "paid",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA",
    },
  },
  {
    id: "ORD-002",
    customerName: "Sarah Wilson",
    customerEmail: "sarah@example.com",
    items: [{ id: "3", name: "Samsung Galaxy S24 Ultra", quantity: 1, price: 1299 }],
    total: 1299,
    status: "pending",
    paymentStatus: "pending",
    priority: "medium",
    createdAt: "2024-01-15T09:15:00Z",
    shippingAddress: {
      name: "Sarah Wilson",
      address: "456 Oak Ave",
      city: "Los Angeles",
      zipCode: "90210",
      country: "USA",
    },
  },
  {
    id: "ORD-003",
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    items: [
      { id: "4", name: 'MacBook Pro 16"', quantity: 1, price: 2499 },
      { id: "5", name: "Magic Mouse", quantity: 1, price: 99 },
    ],
    total: 2598,
    status: "pending",
    paymentStatus: "paid",
    priority: "urgent",
    createdAt: "2024-01-14T16:45:00Z",
    shippingAddress: {
      name: "Mike Johnson",
      address: "789 Pine St",
      city: "Chicago",
      zipCode: "60601",
      country: "USA",
    },
  },
  {
    id: "ORD-004",
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    items: [{ id: "6", name: "iPad Pro 12.9", quantity: 1, price: 1099 }],
    total: 1099,
    status: "pending",
    paymentStatus: "failed",
    priority: "low",
    createdAt: "2024-01-14T14:20:00Z",
    shippingAddress: {
      name: "Emily Davis",
      address: "321 Elm St",
      city: "Houston",
      zipCode: "77001",
      country: "USA",
    },
  },
  {
    id: "ORD-005",
    customerName: "David Brown",
    customerEmail: "david@example.com",
    items: [
      { id: "7", name: "Apple Watch Ultra 2", quantity: 1, price: 799 },
      { id: "8", name: "Sport Band", quantity: 2, price: 49 },
    ],
    total: 897,
    status: "pending",
    paymentStatus: "paid",
    priority: "medium",
    createdAt: "2024-01-14T11:30:00Z",
    shippingAddress: {
      name: "David Brown",
      address: "654 Maple Ave",
      city: "Phoenix",
      zipCode: "85001",
      country: "USA",
    },
  },
]

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialPendingOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
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
      shipped: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Package },
      delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      paid: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      failed: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      refunded: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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

  const handleApproveOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Order Approved",
      description: `Order ${orderId} has been moved to processing.`,
    })
  }

  const handleRejectOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
    toast({
      title: "Order Rejected",
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
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter

      return matchesSearch && matchesPriority && matchesPayment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and process pending customer orders</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{urgentOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidOrders}</p>
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
              <Label>Payment Status</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                  <SelectItem value="date">Date (Newest)</SelectItem>
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
          <CardDescription>Review and process pending orders</CardDescription>
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
                  <TableHead>Payment</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
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
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
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
                          onClick={() => handleApproveOrder(order.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle className="h-3 w-3" />
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
                              <AlertDialogTitle>Reject Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject order {order.id}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRejectOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject Order
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || priorityFilter !== "all" || paymentFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "All orders have been processed."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
