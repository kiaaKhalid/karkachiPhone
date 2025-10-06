export interface Product {
  id: string
  name: string
  description?: string
  shortDescription?: string | null
  price: number
  comparePrice?: number
  savePrice?: string
  brand?: string
  category?: string | null
  stock: number
  rating?: number
  reviewCount?: number
  image?: string | null
  isOnPromotion?: boolean
  promotionEndDate?: string | null
  specs?: { name: string; value: string }[]
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin"
  avatar?: string
  phone?: string
  address?: string
  createdAt?: string
  lastLogin?: string
}

export interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  image: string
  quantity: number
  imei?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt?: string
  shippingAddress: {
    address: string
    city: string
    zipCode: string
    phone: string
    name?: string
  }
  paymentMethod: "card" | "cod" | "paypal"
  trackingNumber?: string
  notes?: string
  customerEmail?: string
  customerName?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
}

export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  newUsersToday: number
  ordersToday: number
  revenueToday: number
  conversionRate: number
  pendingOrders: number
  lowStockProducts: number
}

export interface AdminSettings {
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

export interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  monthlyRevenue: number[]
  topProducts: { name: string; sales: number }[]
  recentOrders: Order[]
}

export interface ContactMessage {
  id: string
  orderId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  subject: string
  message: string
  status: "new" | "in-progress" | "resolved"
  createdAt: string
  adminResponse?: string
  respondedAt?: string
  respondedBy?: string
}