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
import { DollarSign, Package, Users, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsStaticResponse {
  success: boolean
  message: string
  data: {
    period: string
    revenue: {
      amount: number
      growth: number
    }
    orders: number
    customers: {
      total: number
      new: number
    }
    products: number
    range: {
      from: string
      to: string
    }
  }
}

interface AnalyticsGraphResponse {
  success: boolean
  message: string
  data: {
    period: string
    revenueTrends: RevenueTrend[]
    topSellingProducts: TopSellingProduct[]
    customerDemographics: any[]
    orderStatusDistribution: OrderStatusDistribution[]
    range: {
      from: string
      to: string
    }
  }
}

interface ProductImageResponse {
  success: boolean
  message: string
  data: {
    image: string
  }
}

interface RevenueTrend {
  day: string
  amount: number
}

interface TopSellingProduct {
  id: string
  name: string
  quantity: number
  imageUrl?: string // Nous allons récupérer cette donnée
}

interface OrderStatusDistribution {
  status: string
  count: number
}

enum AnalyticsPeriod {
  LAST_7_DAYS = 'last7days',
  LAST_30_DAYS = 'last30days',
  LAST_90_DAYS = 'last90days',
  LAST_YEAR = 'lastYear',
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AnalyticsPeriod>(AnalyticsPeriod.LAST_30_DAYS)
  const { toast } = useToast()

  const [staticData, setStaticData] = useState<AnalyticsStaticResponse['data'] | null>(null)
  const [graphData, setGraphData] = useState<AnalyticsGraphResponse['data'] | null>(null)
  const [productImages, setProductImages] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const url = process.env.NEXT_PUBLIC_API_URL

  // Fonction pour récupérer l'image d'un produit
  const fetchProductImage = async (productId: string): Promise<string> => {
    try {
      const response = await fetch(
        `${url}/public/products/${productId}/image`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch product image")
      }

      const data: ProductImageResponse = await response.json()
      return data.data.image
    } catch (err) {
      console.error(`Error fetching image for product ${productId}:`, err)
      return "/placeholder.png"
    }
  }

  // Fonction pour récupérer toutes les images des produits top
  const fetchTopProductsImages = async (products: TopSellingProduct[]) => {
    const imagePromises = products.map(async (product) => {
      const imageUrl = await fetchProductImage(product.id)
      return { id: product.id, imageUrl }
    })

    const images = await Promise.all(imagePromises)
    const imageMap: {[key: string]: string} = {}
    images.forEach(({ id, imageUrl }) => {
      imageMap[id] = imageUrl
    })
    setProductImages(imageMap)
  }

  const fetchStaticData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `${url}/admin/analytics/static?period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch static analytics data")
      }

      const data: AnalyticsStaticResponse = await response.json()
      setStaticData(data.data)
    } catch (err) {
      console.error("Error fetching static analytics data:", err)
      throw err
    }
  }

  const fetchGraphData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `${url}/admin/analytics/graph?period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch graph analytics data")
      }

      const data: AnalyticsGraphResponse = await response.json()
      setGraphData(data.data)
      
      // Récupérer les images pour les produits top
      if (data.data.topSellingProducts.length > 0) {
        await fetchTopProductsImages(data.data.topSellingProducts)
      }
    } catch (err) {
      console.error("Error fetching graph analytics data:", err)
      throw err
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchStaticData(),
        fetchGraphData(),
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "#00C49F"
      case "pending":
        return "#FFBB28"
      case "processing":
      case "confirmed":
        return "#0088FE"
      case "cancelled":
        return "#FF8042"
      case "shipped":
        return "#8884D8"
      default:
        return "#8884D8"
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="container mx-auto -mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select 
          value={timeRange} 
          onValueChange={(value: AnalyticsPeriod) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AnalyticsPeriod.LAST_7_DAYS}>Last 7 Days</SelectItem>
            <SelectItem value={AnalyticsPeriod.LAST_30_DAYS}>Last 30 Days</SelectItem>
            <SelectItem value={AnalyticsPeriod.LAST_90_DAYS}>Last 90 Days</SelectItem>
            <SelectItem value={AnalyticsPeriod.LAST_YEAR}>Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {/* Total Revenue Card */}
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
                <div className="text-2xl font-bold">
                  {formatCurrency(staticData?.revenue.amount || 0)}
                </div>
                <div className="flex items-center text-xs mt-1">
                  {staticData?.revenue.growth !== undefined && (
                    <>
                      {staticData.revenue.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span className={staticData.revenue.growth >= 0 ? "text-green-600" : "text-red-600"}>
                        {staticData.revenue.growth >= 0 ? "+" : ""}{staticData.revenue.growth.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground ml-1">from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Orders Card */}
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
                <div className="text-2xl font-bold">{staticData?.orders?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  Orders in selected period
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Customers Card */}
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
                <div className="text-2xl font-bold">{staticData?.customers.total?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {staticData?.customers.new || 0} new customers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Products Card */}
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
                <div className="text-2xl font-bold">{staticData?.products?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">Active products</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Revenue Trends Chart */}
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
                <LineChart data={graphData?.revenueTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products Chart */}
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
                <BarChart data={graphData?.topSellingProducts.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="quantity" 
                    fill="#8884d8" 
                    name="Quantity Sold"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status Distribution */}
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
                    data={graphData?.orderStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {graphData?.orderStatusDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getStatusColor(entry.status)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products Details */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Detailed view of your best performing products.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {graphData?.topSellingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                      {/* Image du produit */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={productImages[product.id] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png"
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {product.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">{product.quantity} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Top Products Table */}
      {!loading && graphData && graphData.topSellingProducts.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top Selling Products Details</CardTitle>
            <CardDescription>Complete list of your best performing products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {graphData.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                    {/* Image du produit */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={productImages[product.id] || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png"
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        ID: {product.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {product.quantity} units sold
                    </div>
                    <div className="text-sm text-muted-foreground">Rank #{index + 1}</div>
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