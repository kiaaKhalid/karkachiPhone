export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  rating?: number
  image?: string | null
  // Backend specific fields
  originalPrice?: number | null
  categoryId?: string | null
  brandId?: string | null
  reviewsCount?: number
  isNew?: boolean
  isBestSeller?: boolean
  discount?: number
  isFlashDeal?: boolean
  flashPrice?: number | null
  flashStartsAt?: string | null
  flashEndsAt?: string | null
  isPromotionalBanner?: boolean
  isPromotional?: boolean
  isProductphares?: boolean
  isProductFlash?: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string

  // Legacy frontend fields
  shortDescription?: string | null
  comparePrice?: number
  savePrice?: string
  brand?: string
  category?: string | null
  reviewCount?: number
  isOnPromotion?: boolean
  promotionEndDate?: string | null
  specs?: { key: string; value: string }[] | null
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin" | "livreur"
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