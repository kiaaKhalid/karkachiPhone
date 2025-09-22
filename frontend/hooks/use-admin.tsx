"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, User, Order } from "@/lib/types"
import { useAuth } from "./use-auth"

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  newUsersToday: number
  ordersToday: number
  revenueToday: number
  conversionRate: number
}

interface AdminContextType {
  // Products
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Users
  users: User[]
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addUser: (user: Omit<User, "id">) => void

  // Orders
  orders: Order[]
  updateOrderStatus: (id: string, status: Order["status"]) => void

  // Settings
  settings: AdminSettings
  updateSettings: (settings: Partial<AdminSettings>) => void

  // Analytics
  analytics: Analytics

  // Admin Stats
  stats: AdminStats
  isLoading: boolean
  refreshStats: () => Promise<void>
  isAdmin: boolean
}

interface AdminSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  currency: string
  taxRate: number
  shippingFee: number
  enableRegistration: boolean
  enableReviews: boolean
  enableWishlist: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
  defaultLanguage: string
  timezone: string
  businessHours: string
}

interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  monthlyRevenue: number[]
  topProducts: { name: string; sales: number }[]
  recentOrders: Order[]
}

const AdminContext = createContext<AdminContextType | null>(null)

// Mock data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 999.99,
    description: "The most advanced iPhone yet with titanium design and A17 Pro chip.",
    image: "/Placeholder.png?height=400&width=400",
    stock: 15,
    rating: 4.8,
    reviewCount: 124,
    specs: [
      { name: "Display", value: '6.1" Super Retina XDR' },
      { name: "Chip", value: "A17 Pro" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide" },
      { name: "Storage", value: "128GB" },
      { name: "Battery", value: "Up to 23 hours video playback" },
    ],
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1199.99,
    description: "Ultimate Galaxy experience with S Pen and 200MP camera.",
    image: "/Placeholder.png?height=400&width=400",
    stock: 8,
    rating: 4.7,
    reviewCount: 89,
    specs: [
      { name: "Display", value: '6.8" Dynamic AMOLED 2X' },
      { name: "Processor", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "200MP Main + 50MP Periscope" },
      { name: "Storage", value: "256GB" },
      { name: "Battery", value: "5000mAh" },
    ],
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 899.99,
    description: "AI-powered photography and pure Android experience.",
    image: "/Placeholder.png?height=400&width=400",
    stock: 12,
    rating: 4.6,
    reviewCount: 67,
    specs: [
      { name: "Display", value: '6.7" LTPO OLED' },
      { name: "Chip", value: "Google Tensor G3" },
      { name: "Camera", value: "50MP Main + 48MP Ultra Wide" },
      { name: "Storage", value: "128GB" },
      { name: "Battery", value: "5050mAh" },
    ],
  },
  {
    id: "4",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 799.99,
    description: "Fast charging and flagship performance at an affordable price.",
    image: "/Placeholder.png?height=400&width=400",
    stock: 20,
    rating: 4.5,
    reviewCount: 45,
    specs: [
      { name: "Display", value: '6.82" LTPO AMOLED' },
      { name: "Processor", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "50MP Main + 64MP Periscope" },
      { name: "Storage", value: "256GB" },
      { name: "Battery", value: "5400mAh" },
    ],
  },
  {
    id: "5",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    price: 1099.99,
    description: "Professional photography with Leica cameras.",
    image: "/Placeholder.png?height=400&width=400",
    stock: 5,
    rating: 4.4,
    reviewCount: 32,
    specs: [
      { name: "Display", value: '6.73" LTPO AMOLED' },
      { name: "Processor", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "50MP Main + 50MP Ultra Wide" },
      { name: "Storage", value: "512GB" },
      { name: "Battery", value: "5300mAh" },
    ],
  },
]

const initialUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "user" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user" },
  { id: "3", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "4", name: "Admin", email: "admin@gmail.com", role: "admin" },
  { id: "5", name: "Mike Johnson", email: "mike@example.com", role: "user" },
  { id: "6", name: "Sarah Wilson", email: "sarah@example.com", role: "user" },
  { id: "7", name: "David Brown", email: "david@example.com", role: "user" },
  { id: "8", name: "Lisa Davis", email: "lisa@example.com", role: "user" },
]

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "1",
    items: [{ id: "1", name: "iPhone 15 Pro", brand: "Apple", price: 999.99, image: "/Placeholder.png", quantity: 1 }],
    total: 1079.99,
    status: "delivered",
    createdAt: "2024-01-15T10:30:00Z",
    shippingAddress: {
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      phone: "+1-555-0123",
    },
    paymentMethod: "card",
  },
  {
    id: "ORD-002",
    userId: "2",
    items: [
      {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        price: 1199.99,
        image: "/Placeholder.png",
        quantity: 1,
      },
    ],
    total: 1295.99,
    status: "shipped",
    createdAt: "2024-01-14T14:20:00Z",
    shippingAddress: {
      address: "456 Oak Ave",
      city: "Los Angeles",
      zipCode: "90210",
      phone: "+1-555-0456",
    },
    paymentMethod: "card",
  },
  {
    id: "ORD-003",
    userId: "5",
    items: [
      { id: "3", name: "Google Pixel 8 Pro", brand: "Google", price: 899.99, image: "/Placeholder.png", quantity: 1 },
    ],
    total: 971.99,
    status: "processing",
    createdAt: "2024-01-13T09:15:00Z",
    shippingAddress: {
      address: "789 Pine St",
      city: "Chicago",
      zipCode: "60601",
      phone: "+1-555-0789",
    },
    paymentMethod: "cod",
  },
  {
    id: "ORD-004",
    userId: "6",
    items: [{ id: "4", name: "OnePlus 12", brand: "OnePlus", price: 799.99, image: "/Placeholder.png", quantity: 2 }],
    total: 1727.98,
    status: "pending",
    createdAt: "2024-01-12T16:45:00Z",
    shippingAddress: {
      address: "321 Elm St",
      city: "Houston",
      zipCode: "77001",
      phone: "+1-555-0321",
    },
    paymentMethod: "card",
  },
]

const initialSettings: AdminSettings = {
  siteName: "Karkachi Phone",
  siteDescription:
    "Your trusted partner in mobile technology. We bring you the latest smartphones with unmatched quality, competitive prices, and exceptional customer service.",
  contactEmail: "info@karachiphone.com",
  contactPhone: "+92 300 1234567",
  address: "123 Tech Street, Karachi, Pakistan",
  currency: "MAD",
  taxRate: 8,
  shippingFee: 0,
  enableRegistration: true,
  enableReviews: true,
  enableWishlist: true,
  enableNotifications: true,
  maintenanceMode: false,
  defaultLanguage: "en",
  timezone: "Asia/Karachi",
  businessHours: "Mon - Sat: 9:00 AM - 8:00 PM, Sunday: 10:00 AM - 6:00 PM",
}

// Mock admin data
const mockStats: AdminStats = {
  totalUsers: 1247,
  totalOrders: 3456,
  totalRevenue: 125000,
  totalProducts: 89,
  newUsersToday: 23,
  ordersToday: 45,
  revenueToday: 2340,
  conversionRate: 3.2,
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [settings, setSettings] = useState<AdminSettings>(initialSettings)
  const [stats, setStats] = useState<AdminStats>(mockStats)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"

  const refreshStats = async () => {
    if (!isAdmin) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would fetch from an API
      const updatedStats = {
        ...mockStats,
        // Add some random variation to simulate real data
        newUsersToday: Math.floor(Math.random() * 50) + 10,
        ordersToday: Math.floor(Math.random() * 100) + 20,
        revenueToday: Math.floor(Math.random() * 5000) + 1000,
        conversionRate: Math.round((Math.random() * 5 + 1) * 10) / 10,
      }

      setStats(updatedStats)
    } catch (error) {
      console.error("Failed to refresh admin stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("admin_products")
    const savedUsers = localStorage.getItem("admin_users")
    const savedOrders = localStorage.getItem("admin_orders")
    const savedSettings = localStorage.getItem("admin_settings")

    if (savedProducts) setProducts(JSON.parse(savedProducts))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedOrders) setOrders(JSON.parse(savedOrders))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("admin_products", JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem("admin_users", JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem("admin_orders", JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (isAdmin) {
      refreshStats()
    }
  }, [isAdmin])

  // Product functions
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updatedProduct } : product)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  // User functions
  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updatedUser } : user)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const addUser = (user: Omit<User, "id">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  // Order functions
  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  // Settings functions
  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // Calculate analytics
  const analytics: Analytics = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    totalUsers: users.filter((user) => user.role === "user").length,
    totalProducts: products.length,
    monthlyRevenue: [45200, 52300, 48900, 61200, 58700, 67800, 72100, 69400, 75600, 82300, 78900, 85200],
    topProducts: [
      { name: "iPhone 15 Pro", sales: 45 },
      { name: "Samsung Galaxy S24 Ultra", sales: 32 },
      { name: "Google Pixel 8 Pro", sales: 28 },
      { name: "OnePlus 12", sales: 24 },
      { name: "Xiaomi 14 Ultra", sales: 18 },
    ],
    recentOrders: orders.slice(0, 5),
  }

  const value: AdminContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    users,
    updateUser,
    deleteUser,
    addUser,
    orders,
    updateOrderStatus,
    settings,
    updateSettings,
    analytics,
    stats,
    isLoading,
    refreshStats,
    isAdmin,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}