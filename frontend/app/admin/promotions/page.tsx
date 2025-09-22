"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Star,
  MoreHorizontal,
  Download,
  Upload,
  Clock,
  TrendingUp,
  Percent,
  Calendar,
  Tag,
} from "lucide-react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

// Mock products data with promotions
const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "smartphones",
    price: 999,
    originalPrice: 1199,
    isOnPromotion: true,
    promotionEndDate: "2024-02-15T23:59:59Z",
    image: "/images/iphone-15-pro-max.png",
    rating: 4.8,
    reviewCount: 1250,
    stock: 45,
    description: "The most advanced iPhone ever with titanium design and A17 Pro chip.",
    specs: [
      { name: "Display", value: "6.7-inch Super Retina XDR" },
      { name: "Chip", value: "A17 Pro" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Storage", value: "256GB" },
    ],
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphones",
    price: 1299,
    isOnPromotion: false,
    image: "/images/samsung-galaxy-s24-ultra.png",
    rating: 4.7,
    reviewCount: 980,
    stock: 32,
    description: "Ultimate Galaxy experience with S Pen and AI-powered features.",
    specs: [
      { name: "Display", value: "6.8-inch Dynamic AMOLED 2X" },
      { name: "Processor", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto" },
      { name: "Storage", value: "512GB" },
    ],
    createdAt: "2024-01-14T15:20:00Z",
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    brand: "Apple",
    category: "laptops",
    price: 2199,
    originalPrice: 2499,
    isOnPromotion: true,
    promotionEndDate: "2024-02-20T23:59:59Z",
    image: "/images/macbook-pro-16.png",
    rating: 4.9,
    reviewCount: 750,
    stock: 18,
    description: "Supercharged by M3 Pro and M3 Max chips for extreme performance.",
    specs: [
      { name: "Display", value: "16.2-inch Liquid Retina XDR" },
      { name: "Chip", value: "Apple M3 Pro" },
      { name: "Memory", value: "18GB Unified Memory" },
      { name: "Storage", value: "512GB SSD" },
    ],
    createdAt: "2024-01-13T09:45:00Z",
  },
  {
    id: "4",
    name: "iPad Pro 12.9",
    brand: "Apple",
    category: "tablets",
    price: 1099,
    isOnPromotion: false,
    image: "/images/ipad-pro-12-9.png",
    rating: 4.6,
    reviewCount: 420,
    stock: 28,
    description: "The ultimate iPad experience with M2 chip and Liquid Retina XDR display.",
    specs: [
      { name: "Display", value: "12.9-inch Liquid Retina XDR" },
      { name: "Chip", value: "Apple M2" },
      { name: "Storage", value: "256GB" },
      { name: "Connectivity", value: "Wi-Fi 6E + 5G" },
    ],
    createdAt: "2024-01-12T14:30:00Z",
  },
  {
    id: "5",
    name: "AirPods Pro 2",
    brand: "Apple",
    category: "accessories",
    price: 199,
    originalPrice: 249,
    isOnPromotion: true,
    promotionEndDate: "2024-02-10T23:59:59Z",
    image: "/images/airpods-pro-2.png",
    rating: 4.5,
    reviewCount: 890,
    stock: 120,
    description: "Next-level Active Noise Cancellation and Adaptive Transparency.",
    specs: [
      { name: "Chip", value: "Apple H2" },
      { name: "Battery Life", value: "Up to 6 hours listening time" },
      { name: "Features", value: "Active Noise Cancellation, Spatial Audio" },
      { name: "Charging", value: "MagSafe, Lightning, Wireless" },
    ],
    createdAt: "2024-01-11T11:15:00Z",
  },
]

export default function AdminPromotions() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [promotionFilter, setPromotionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false)
  const [isEditingPromotion, setIsEditingPromotion] = useState(false)
  const [promotionData, setPromotionData] = useState({
    productId: "",
    promotionPrice: 0,
    endDate: "",
  })
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateDiscount = (originalPrice: number, promotionPrice: number) => {
    return Math.round(((originalPrice - promotionPrice) / originalPrice) * 100)
  }

  const isPromotionExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const createPromotion = () => {
    if (!promotionData.productId || !promotionData.promotionPrice || !promotionData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === promotionData.productId)
    if (!product) return

    if (promotionData.promotionPrice >= product.price) {
      toast({
        title: "Error",
        description: "Promotion price must be lower than the original price",
        variant: "destructive",
      })
      return
    }

    setProducts(
      products.map((p) =>
        p.id === promotionData.productId
          ? {
              ...p,
              originalPrice: p.price,
              price: promotionData.promotionPrice,
              isOnPromotion: true,
              promotionEndDate: promotionData.endDate,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )

    setPromotionData({ productId: "", promotionPrice: 0, endDate: "" })
    setIsCreatingPromotion(false)

    toast({
      title: "Promotion Created",
      description: `Promotion for ${product.name} has been created successfully`,
    })
  }

  const updatePromotion = () => {
    if (!selectedProduct || !promotionData.promotionPrice || !promotionData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (promotionData.promotionPrice >= (selectedProduct.originalPrice || selectedProduct.price)) {
      toast({
        title: "Error",
        description: "Promotion price must be lower than the original price",
        variant: "destructive",
      })
      return
    }

    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              price: promotionData.promotionPrice,
              promotionEndDate: promotionData.endDate,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )

    setSelectedProduct(null)
    setPromotionData({ productId: "", promotionPrice: 0, endDate: "" })
    setIsEditingPromotion(false)

    toast({
      title: "Promotion Updated",
      description: `Promotion for ${selectedProduct.name} has been updated successfully`,
    })
  }

  const removePromotion = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              price: p.originalPrice || p.price,
              originalPrice: undefined,
              isOnPromotion: false,
              promotionEndDate: undefined,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )

    toast({
      title: "Promotion Removed",
      description: `Promotion for ${product.name} has been removed`,
    })
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesPromotion =
      promotionFilter === "all" ||
      (promotionFilter === "on-promotion" && product.isOnPromotion) ||
      (promotionFilter === "no-promotion" && !product.isOnPromotion) ||
      (promotionFilter === "expired" &&
        product.isOnPromotion &&
        product.promotionEndDate &&
        isPromotionExpired(product.promotionEndDate))

    return matchesSearch && matchesCategory && matchesPromotion
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case "discount-high":
        const discountA = a.isOnPromotion && a.originalPrice ? calculateDiscount(a.originalPrice, a.price) : 0
        const discountB = b.isOnPromotion && b.originalPrice ? calculateDiscount(b.originalPrice, b.price) : 0
        return discountB - discountA
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "name-asc":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const promotionStats = {
    total: products.length,
    onPromotion: products.filter((p) => p.isOnPromotion).length,
    noPromotion: products.filter((p) => !p.isOnPromotion).length,
    expired: products.filter((p) => p.isOnPromotion && p.promotionEndDate && isPromotionExpired(p.promotionEndDate))
      .length,
    totalSavings: products
      .filter((p) => p.isOnPromotion && p.originalPrice)
      .reduce((sum, product) => sum + (product.originalPrice! - product.price), 0),
    avgDiscount: products
      .filter((p) => p.isOnPromotion && p.originalPrice)
      .reduce((sum, product, _, arr) => sum + calculateDiscount(product.originalPrice!, product.price) / arr.length, 0),
  }

  const availableProducts = products.filter((p) => !p.isOnPromotion)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Promotion Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage product promotions and discounts
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            onClick={() => setIsCreatingPromotion(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
          <Button variant="outline" className="bg-transparent text-sm" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="bg-transparent text-sm" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Package className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-lg sm:text-2xl font-bold">{promotionStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Tag className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-green-500" />
            <p className="text-lg sm:text-2xl font-bold">{promotionStats.onPromotion}</p>
            <p className="text-xs text-muted-foreground">On Promotion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Package className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-gray-500" />
            <p className="text-lg sm:text-2xl font-bold">{promotionStats.noPromotion}</p>
            <p className="text-xs text-muted-foreground">No Promotion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Clock className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-red-500" />
            <p className="text-lg sm:text-2xl font-bold">{promotionStats.expired}</p>
            <p className="text-xs text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm sm:text-2xl font-bold">{formatCurrency(promotionStats.totalSavings)}</p>
            <p className="text-xs text-muted-foreground">Total Savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Percent className="h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-lg sm:text-2xl font-bold">{promotionStats.avgDiscount.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Avg Discount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, brand, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48 text-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="smartwatches">Smartwatches</SelectItem>
                  <SelectItem value="cameras">Cameras</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
              <Select value={promotionFilter} onValueChange={setPromotionFilter}>
                <SelectTrigger className="w-full lg:w-48 text-sm">
                  <SelectValue placeholder="Promotion Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="on-promotion">On Promotion</SelectItem>
                  <SelectItem value="no-promotion">No Promotion</SelectItem>
                  <SelectItem value="expired">Expired Promotions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="discount-high">Highest Discount</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Products ({sortedProducts.length})</CardTitle>
          <CardDescription className="text-sm">
            {promotionFilter === "all" ? "All products" : `Products with ${promotionFilter.replace("-", " ")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="relative">
                    <img
                      src={product.image || "/Placeholder.png?height=60&width=60"}
                      alt={product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {product.isOnPromotion && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {product.originalPrice && calculateDiscount(product.originalPrice, product.price)}%
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{product.name}</p>
                      {product.isOnPromotion && (
                        <Badge className="bg-red-500 text-white px-2 py-0.5 text-xs">PROMOTION</Badge>
                      )}
                      {product.isOnPromotion &&
                        product.promotionEndDate &&
                        isPromotionExpired(product.promotionEndDate) && (
                          <Badge className="bg-gray-500 text-white px-2 py-0.5 text-xs">EXPIRED</Badge>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{product.description}</p>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                      {product.isOnPromotion && product.promotionEndDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Ends: {new Date(product.promotionEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 lg:justify-end lg:space-x-6">
                  <div className="text-left lg:text-right">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </p>
                      {product.isOnPromotion && product.originalPrice && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{product.category}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="bg-transparent"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Product Details - {selectedProduct?.name}</DialogTitle>
                          <DialogDescription>Complete product information and promotion details</DialogDescription>
                        </DialogHeader>
                        {selectedProduct && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <img
                                  src={selectedProduct.image || "/Placeholder.png"}
                                  alt={selectedProduct.name}
                                  className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.brand}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <p className="text-2xl font-bold text-blue-600">
                                      {formatCurrency(selectedProduct.price)}
                                    </p>
                                    {selectedProduct.isOnPromotion && selectedProduct.originalPrice && (
                                      <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                        {formatCurrency(selectedProduct.originalPrice)}
                                      </p>
                                    )}
                                  </div>
                                  {selectedProduct.isOnPromotion && selectedProduct.originalPrice && (
                                    <p className="text-green-600 font-medium">
                                      Save {formatCurrency(selectedProduct.originalPrice - selectedProduct.price)} (
                                      {calculateDiscount(selectedProduct.originalPrice, selectedProduct.price)}% off)
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{selectedProduct.rating}</span>
                                    <span className="text-gray-500">({selectedProduct.reviewCount} reviews)</span>
                                  </div>
                                </div>
                                {selectedProduct.isOnPromotion && selectedProduct.promotionEndDate && (
                                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                                      Promotion ends: {new Date(selectedProduct.promotionEndDate).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Specifications</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedProduct.specs.map((spec, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                  >
                                    <span className="font-medium">{spec.name}:</span>
                                    <span className="text-gray-600 dark:text-gray-400">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {product.isOnPromotion ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product)
                          setPromotionData({
                            productId: product.id,
                            promotionPrice: product.price,
                            endDate: product.promotionEndDate || "",
                          })
                          setIsEditingPromotion(true)
                        }}
                        className="bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPromotionData({
                            productId: product.id,
                            promotionPrice: product.price * 0.8, // Default 20% discount
                            endDate: "",
                          })
                          setIsCreatingPromotion(true)
                        }}
                        className="bg-transparent text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
                          Copy Product ID
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        {product.isOnPromotion && (
                          <DropdownMenuItem onClick={() => removePromotion(product.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Promotion
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || categoryFilter !== "all" || promotionFilter !== "all"
                    ? "Try adjusting your search filters"
                    : "No products match your criteria"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Promotion Dialog */}
      <Dialog open={isCreatingPromotion} onOpenChange={setIsCreatingPromotion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Promotion</DialogTitle>
            <DialogDescription>Set up a new promotion for a product</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="product-select">Select Product *</Label>
              <Select
                value={promotionData.productId}
                onValueChange={(value) => {
                  const product = products.find((p) => p.id === value)
                  setPromotionData({
                    ...promotionData,
                    productId: value,
                    promotionPrice: product ? product.price * 0.8 : 0,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to promote" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {promotionData.productId && (
              <>
                <div>
                  <Label htmlFor="promotion-price">Promotion Price *</Label>
                  <Input
                    id="promotion-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={promotionData.promotionPrice || ""}
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        promotionPrice: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  {promotionData.productId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Original price:{" "}
                      {formatCurrency(products.find((p) => p.id === promotionData.productId)?.price || 0)}
                      {promotionData.promotionPrice > 0 && (
                        <span className="ml-2 text-green-600">
                          (
                          {calculateDiscount(
                            products.find((p) => p.id === promotionData.productId)?.price || 0,
                            promotionData.promotionPrice,
                          )}
                          % off)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end-date">Promotion End Date *</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={promotionData.endDate}
                    onChange={(e) => setPromotionData({ ...promotionData, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setIsCreatingPromotion(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={createPromotion} className="w-full sm:w-auto">
                Create Promotion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditingPromotion} onOpenChange={setIsEditingPromotion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>Update promotion details for {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedProduct.brand}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Original price: {formatCurrency(selectedProduct.originalPrice || selectedProduct.price)}
                </p>
              </div>
              <div>
                <Label htmlFor="edit-promotion-price">Promotion Price *</Label>
                <Input
                  id="edit-promotion-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={promotionData.promotionPrice || ""}
                  onChange={(e) =>
                    setPromotionData({
                      ...promotionData,
                      promotionPrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
                {promotionData.promotionPrice > 0 && selectedProduct.originalPrice && (
                  <p className="text-sm text-green-600 mt-1">
                    {calculateDiscount(selectedProduct.originalPrice, promotionData.promotionPrice)}% off
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-end-date">Promotion End Date *</Label>
                <Input
                  id="edit-end-date"
                  type="datetime-local"
                  value={promotionData.endDate}
                  onChange={(e) => setPromotionData({ ...promotionData, endDate: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                <Button variant="outline" onClick={() => setIsEditingPromotion(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={updatePromotion} className="w-full sm:w-auto">
                  Update Promotion
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
