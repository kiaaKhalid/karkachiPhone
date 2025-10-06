// hooks/use-admin.tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, User, Order, AdminStats, AdminSettings, Analytics } from "@/lib/types"
import { useAuth } from "./use-auth"

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

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    currency: "",
    taxRate: 0,
    shippingFee: 0,
    enableRegistration: false,
    enableReviews: false,
    enableWishlist: false,
    enableNotifications: false,
    maintenanceMode: false,
    defaultLanguage: "",
    timezone: "",
    businessHours: ""
  })
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
    conversionRate: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"

  const refreshStats = async () => {
    if (!isAdmin) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        newUsersToday: 0,
        ordersToday: 0,
        revenueToday: 0,
        conversionRate: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      })
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
    setSettings((prev: AdminSettings) => ({ ...prev, ...newSettings }))
  }

  // Calculate analytics
  const analytics: Analytics = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    totalUsers: users.filter((user) => user.role === "user").length,
    totalProducts: products.length,
    monthlyRevenue: [],
    topProducts: [],
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