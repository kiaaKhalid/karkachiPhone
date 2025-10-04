export interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string | null;
  price: number;
  comparePrice?: string; 
  savePrice?: string;
  brand?: string;
  category?: string | null;
  stock: number;
  rating?: number;
  reviewCount?: number;
  image?: string | null;
  isOnPromotion?: boolean;
  promotionEndDate?: string | null;
  specs?: { name: string; value: string }[];
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
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
  imei?: string // IMEI assigned by admin during order processing
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
