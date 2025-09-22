export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  rating: number
  reviewCount: number
  brand: string
  inStock: boolean
  features: string[]
}

// Sample product data - replace with actual API calls or database queries
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    description: "The most advanced iPhone with titanium design and A17 Pro chip",
    price: 999,
    category: "Smartphones",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.8,
    reviewCount: 1250,
    brand: "Apple",
    inStock: true,
    features: ["A17 Pro chip", "Titanium design", "48MP camera", "USB-C"],
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android flagship with S Pen and advanced AI features",
    price: 1199,
    category: "Smartphones",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.7,
    reviewCount: 980,
    brand: "Samsung",
    inStock: true,
    features: ["S Pen included", "200MP camera", "AI features", "5000mAh battery"],
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    description: "Google's flagship with advanced computational photography",
    price: 899,
    category: "Smartphones",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.6,
    reviewCount: 750,
    brand: "Google",
    inStock: true,
    features: ["Tensor G3 chip", "Magic Eraser", "Night Sight", "Pure Android"],
  },
  {
    id: "4",
    name: "AirPods Pro (2nd Gen)",
    description: "Premium wireless earbuds with active noise cancellation",
    price: 249,
    category: "Accessories",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.5,
    reviewCount: 2100,
    brand: "Apple",
    inStock: true,
    features: ["Active Noise Cancellation", "Spatial Audio", "MagSafe charging", "H2 chip"],
  },
  {
    id: "5",
    name: "Samsung Galaxy Buds2 Pro",
    description: "Premium wireless earbuds with 360 Audio and ANC",
    price: 199,
    category: "Accessories",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.4,
    reviewCount: 850,
    brand: "Samsung",
    inStock: true,
    features: ["360 Audio", "Active Noise Cancellation", "IPX7 rating", "8-hour battery"],
  },
  {
    id: "6",
    name: "iPad Pro 12.9-inch",
    description: "The ultimate iPad experience with M2 chip and Liquid Retina XDR display",
    price: 1099,
    category: "Tablets",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.8,
    reviewCount: 650,
    brand: "Apple",
    inStock: true,
    features: ["M2 chip", "Liquid Retina XDR", "Apple Pencil support", "Thunderbolt"],
  },
  {
    id: "7",
    name: "MacBook Air M2",
    description: "Supercharged by M2 chip with all-day battery life",
    price: 1199,
    category: "Laptops",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.7,
    reviewCount: 1100,
    brand: "Apple",
    inStock: true,
    features: ["M2 chip", "18-hour battery", "MagSafe charging", "1080p camera"],
  },
  {
    id: "8",
    name: "Apple Watch Series 9",
    description: "The most advanced Apple Watch with Double Tap gesture",
    price: 399,
    category: "Wearables",
    image: "/Placeholder.png?height=300&width=300",
    rating: 4.6,
    reviewCount: 920,
    brand: "Apple",
    inStock: true,
    features: ["S9 chip", "Double Tap", "Always-On display", "Health monitoring"],
  },
]

export async function getProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // In a real application, this would fetch from your API
  // Example: const response = await fetch('/api/products')
  // return response.json()

  return sampleProducts
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((product) => product.id === id) || null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
}
