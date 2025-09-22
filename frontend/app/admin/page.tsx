"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ArrowRight,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DailySummary {
  date: string
  orders: number
  revenue: number
  clients: number
  totalProducts: number
}

interface DashboardResponse {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  totalProducts: number
  dailySummaries: DailySummary[]
}

interface OrderResponseDTO {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  notes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface PageResponseDTO<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("30days")
  const [recentOrders, setRecentOrders] = useState<OrderResponseDTO[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/dashboard?dateRange=${dateRange}&timezone=Africa/Casablanca&currency=MAD&refresh=false`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DashboardResponse = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError(null)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/orders?page=1&limit=5&sortBy=createdAt&sortOrder=desc`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PageResponseDTO<OrderResponseDTO> = await response.json()
      setRecentOrders(data.content)
    } catch (error) {
      console.error("Error fetching recent orders:", error)
      setOrdersError("Failed to load recent orders")
      toast({
        title: "Error",
        description: "Failed to load recent orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchRecentOrders()
  }, [dateRange])

  const calculatePercentageChange = (
    current: number,
    dailySummaries: DailySummary[],
    field: keyof DailySummary,
  ): number => {
    if (!dailySummaries || dailySummaries.length < 2) return 0

    const sortedSummaries = [...dailySummaries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstHalf = sortedSummaries.slice(0, Math.floor(sortedSummaries.length / 2))
    const secondHalf = sortedSummaries.slice(Math.floor(sortedSummaries.length / 2))

    const firstHalfSum = firstHalf.reduce((sum, item) => sum + Number(item[field]), 0)
    const secondHalfSum = secondHalf.reduce((sum, item) => sum + Number(item[field]), 0)

    if (firstHalfSum === 0) return 0
    return ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100
  }

  const quickActions = [
    {
      title: "Add Product",
      description: "Add a new product to your inventory",
      href: "/admin/products",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "View Orders",
      description: "Manage and process customer orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View detailed sales and performance analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-orange-500",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ${dashboardData?.totalRevenue?.toLocaleString() || "0"}
                </div>
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {dashboardData &&
                  calculatePercentageChange(dashboardData.totalRevenue, dashboardData.dailySummaries, "revenue") > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {dashboardData
                    ? Math.abs(
                        calculatePercentageChange(dashboardData.totalRevenue, dashboardData.dailySummaries, "revenue"),
                      ).toFixed(1)
                    : "0"}
                  % from last period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {dashboardData?.totalOrders?.toLocaleString() || "0"}
                </div>
                <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                  {dashboardData &&
                  calculatePercentageChange(dashboardData.totalOrders, dashboardData.dailySummaries, "orders") > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {dashboardData
                    ? Math.abs(
                        calculatePercentageChange(dashboardData.totalOrders, dashboardData.dailySummaries, "orders"),
                      ).toFixed(1)
                    : "0"}
                  % from last period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {dashboardData?.totalProducts?.toLocaleString() || "0"}
                </div>
                <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  0% from last period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData?.totalClients?.toLocaleString() || "0"}
                </div>
                <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {dashboardData &&
                  calculatePercentageChange(dashboardData.totalClients, dashboardData.dailySummaries, "clients") > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {dashboardData
                    ? Math.abs(
                        calculatePercentageChange(dashboardData.totalClients, dashboardData.dailySummaries, "clients"),
                      ).toFixed(1)
                    : "0"}
                  % from last period
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          <CardDescription>Frequently used admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-[#01A0EA]/20">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                          <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#01A0EA] transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#01A0EA] transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
            <CardDescription>Latest customer orders and their status</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordersLoading || ordersError
              ? // Skeleton loading for both loading and error states
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))
              : recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        #{order.id.toString().slice(-3)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customerEmail}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.total.toLocaleString()} {order.currency}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
