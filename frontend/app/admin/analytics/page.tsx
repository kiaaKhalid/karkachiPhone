"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { DollarSign, Package, Users, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface DashboardResponse {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  totalProducts: number
  dailySummaries: DailySummary[]
}

interface DailySummary {
  date: string
  orders: number
  revenue: number
  clients: number
  totalProducts: number
}

interface TopSellingProductDTO {
  id: number
  name: string
  imageUrl: string
  totalQuantity: number
  totalRevenue: number
  categoryName: string
  brandName: string
}

interface CustomerAnalyticsDTO {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  demographics: CustomerDemographicDTO[]
  locations: CustomerLocationDTO[]
}

interface CustomerDemographicDTO {
  ageGroup: string
  count: number
  percentage: number
}

interface CustomerLocationDTO {
  city: string
  region: string
  customerCount: number
  revenue: number
}

interface RevenueTrendDTO {
  period: string
  revenue: number
  orders: number
  growth: number
}

interface OrderAnalyticDTO {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  completionRate: number
  cancellationRate: number
  statusDistribution: OrderStatusDistributionDTO[]
}

interface OrderStatusDistributionDTO {
  status: string
  count: number
  percentage: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [topProducts, setTopProducts] = useState<TopSellingProductDTO[]>([])
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalyticsDTO | null>(null)
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrendDTO[]>([])
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalyticDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/dashboard?dateRange=${timeRange}days`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")

    }
  }

  const fetchTopProducts = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/products/top-selling?days=${timeRange}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch top products")
      }

      const data = await response.json()
      setTopProducts(data)
    } catch (err) {
      console.error("Error fetching top products:", err)
    }
  }

  const fetchCustomerAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/customers?days=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch customer analytics")
      }

      const data = await response.json()
      setCustomerAnalytics(data)
    } catch (err) {
      console.error("Error fetching customer analytics:", err)
    }
  }

  const fetchRevenueTrends = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/revenue/trends?days=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch revenue trends")
      }

      const data = await response.json()
      setRevenueTrends(data)
    } catch (err) {
      console.error("Error fetching revenue trends:", err)
    }
  }

  const fetchOrderAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/analytics/orders?days=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch order analytics")
      }

      const data = await response.json()
      setOrderAnalytics(data)
    } catch (err) {
      console.error("Error fetching order analytics:", err)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchDashboardData(),
        fetchTopProducts(),
        fetchCustomerAnalytics(),
        fetchRevenueTrends(),
        fetchOrderAnalytics(),
      ])
    } catch (err) {
      setError("Failed to load analytics data")
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  const calculateGrowth = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const growth = ((current - previous) / previous) * 100
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${dashboardData?.totalRevenue?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {revenueTrends.length > 1
                    ? calculateGrowth(
                        revenueTrends[revenueTrends.length - 1]?.revenue || 0,
                        revenueTrends[0]?.revenue || 0,
                      )
                    : "+0%"}{" "}
                  from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.totalOrders?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {orderAnalytics?.completionRate
                    ? `${orderAnalytics.completionRate.toFixed(1)}% completion rate`
                    : "No data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{customerAnalytics?.totalCustomers?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">{customerAnalytics?.newCustomers || 0} new customers</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.totalProducts?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">Active products</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Revenue generated over the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with the highest sales volume.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalQuantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
            <CardDescription>Breakdown of customers by age group.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerAnalytics?.demographics || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage?.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {customerAnalytics?.demographics?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of orders by status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderAnalytics?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage?.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderAnalytics?.statusDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {!loading && topProducts.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top Selling Products Details</CardTitle>
            <CardDescription>Detailed view of your best performing products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 10).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                    <img
                      src={product.imageUrl || "/Placeholder.png?height=40&width=40"}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.brandName} • {product.categoryName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.totalQuantity} sold</div>
                    <div className="text-sm text-muted-foreground">${product.totalRevenue?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
