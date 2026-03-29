// hooks/use-admin.tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Product, User, Order, AdminStats, AdminSettings, Analytics } from "@/lib/types"
import { useAuth } from "./use-auth"
import { useToast } from "@/components/ui/use-toast"

interface AdminContextType {
  // Products
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  refreshProducts: () => Promise<void>

  // Users
  users: User[]
  updateUser: (id: string, user: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  addUser: (user: Omit<User, "id">) => Promise<void>
  refreshUsers: () => Promise<void>

  // Orders
  orders: Order[]
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>
  refreshOrders: () => Promise<void>

  // Settings
  settings: AdminSettings
  updateSettings: (settings: Partial<AdminSettings>) => Promise<void>

  // Analytics
  analytics: Analytics

  // Admin Stats
  stats: AdminStats
  isLoading: boolean
  refreshStats: () => Promise<void>
  isAdmin: boolean
}

const AdminContext = createContext<AdminContextType | null>(null)
const API = process.env.NEXT_PUBLIC_API_URL

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: "KARKACHI PHONE",
    siteDescription: "Premium Mobile Devices",
    contactEmail: "contact@karkachiphone.com",
    contactPhone: "+212 600-000000",
    address: "Casablanca, Maroc",
    currency: "MAD",
    taxRate: 20,
    shippingFee: 49,
    enableRegistration: true,
    enableReviews: true,
    enableWishlist: true,
    enableNotifications: true,
    maintenanceMode: false,
    defaultLanguage: "fr",
    timezone: "Africa/Casablanca",
    businessHours: "9:00 - 19:00"
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

  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    topProducts: [],
    recentOrders: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"
  const isSuperAdmin = user?.role === "super_admin"

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const refreshStats = useCallback(async () => {
    if (!isAdmin) return
    setIsLoading(true)
    try {
      const [staticRes, ordersRes] = await Promise.all([
        fetch(`${API}/admin/dashboard/static`, { headers: getHeaders() }),
        fetch(`${API}/admin/dashboard/orders`, { headers: getHeaders() })
      ])
      
      const staticData = await staticRes.json()
      const ordersData = await ordersRes.json()

      if (staticData.success) {
        setStats(prev => ({
          ...prev,
          totalRevenue: staticData.data.revenue || 0,
          totalOrders: staticData.data.orders || 0,
          totalProducts: staticData.data.products || 0,
          totalUsers: staticData.data.clients || 0,
        }))
        setAnalytics(prev => ({
          ...prev,
          totalRevenue: staticData.data.revenue || 0,
          totalOrders: staticData.data.orders || 0,
          totalUsers: staticData.data.clients || 0,
          totalProducts: staticData.data.products || 0,
        }))
      }

      if (ordersData.success) {
        setAnalytics(prev => ({
          ...prev,
          recentOrders: ordersData.data || [],
        }))
      }
    } catch (error) {
      console.error("Failed to refresh admin stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  const refreshProducts = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch(`${API}/admin/products?limit=100`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success && data.data?.data) {
        setProducts(data.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch products", error)
    }
  }, [isAdmin])

  const refreshOrders = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch(`${API}/admin/orders?limit=100`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success && data.data?.data) {
        setOrders(data.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders", error)
    }
  }, [isAdmin])

  const refreshUsers = useCallback(async () => {
    if (!isSuperAdmin) return
    try {
      const res = await fetch(`${API}/super-admin/users?limit=100`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success && data.data?.data) {
        setUsers(data.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    }
  }, [isSuperAdmin])

  // Initial Data Fetch
  useEffect(() => {
    if (isAdmin) {
      refreshStats()
      refreshProducts()
      refreshOrders()
      if (isSuperAdmin) refreshUsers()
    } else {
      setProducts([])
      setUsers([])
      setOrders([])
    }
  }, [isAdmin, isSuperAdmin, refreshStats, refreshProducts, refreshOrders, refreshUsers])

  // Product functions
  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const res = await fetch(`${API}/admin/products`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(product),
      })
      if (res.ok) {
        toast({ title: "Succès", description: "Produit ajouté" })
        refreshProducts()
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Échec d'ajout du produit", variant: "destructive" })
    }
  }

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const res = await fetch(`${API}/admin/products/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(updatedProduct),
      })
      if (res.ok) {
        toast({ title: "Succès", description: "Produit mis à jour" })
        refreshProducts()
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la mise à jour", variant: "destructive" })
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API}/admin/products/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      })
      if (res.ok) {
        toast({ title: "Succès", description: "Produit supprimé" })
        refreshProducts()
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de suppression", variant: "destructive" })
    }
  }

  // User functions
  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    try {
      const res = await fetch(`${API}/super-admin/users/${id}/role`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ role: updatedUser.role }), // Assuming basic role update via super-admin
      })
      if (res.ok) refreshUsers()
    } catch (err) {
      console.error("Failed to update user", err)
    }
  }

  const deleteUser = async (id: string) => {
    // Implement API call if exists in super-admin
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const addUser = async (user: Omit<User, "id">) => {
    // Super-admin route to create users? fallback to local mock if not
  }

  // Order functions
  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const res = await fetch(`${API}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: "Succès", description: "Statut mis à jour" })
        refreshOrders()
      }
    } catch (err) {
      console.error("Failed to update order status", err)
    }
  }

  // Settings functions (Fallback to mock for now since no explicit settings API found)
  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    toast({ title: "Succès", description: "Paramètres enregistrés" })
  }

  const value: AdminContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    users,
    updateUser,
    deleteUser,
    addUser,
    refreshUsers,
    orders,
    updateOrderStatus,
    refreshOrders,
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