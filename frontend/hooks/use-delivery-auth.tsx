"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DeliveryUser {
  id: string
  name: string
  email: string
  phone: string
  vehicleType: "motorcycle" | "car" | "bicycle"
  vehicleNumber: string
  zone: string
  rating: number
  totalDeliveries: number
  avatar?: string
  isActive: boolean
  currentLocation?: {
    lat: number
    lng: number
  }
}

interface DeliveryAuthContextType {
  user: DeliveryUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateLocation: (lat: number, lng: number) => void
}

const DeliveryAuthContext = createContext<DeliveryAuthContextType | undefined>(undefined)

export function DeliveryAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DeliveryUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const sessionData = localStorage.getItem("delivery_session")
        if (sessionData) {
          const { userId, timestamp } = JSON.parse(sessionData)

          // Check if session is still valid (24 hours)
          const now = Date.now()
          const sessionAge = now - timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (sessionAge < maxAge) {
            // In a real app, fetch user data using userId
            // For now, simulate with mock data or assume data is stored
            const storedUser = localStorage.getItem("delivery_user")
            if (storedUser) {
              setUser(JSON.parse(storedUser))
            }
          } else {
            localStorage.removeItem("delivery_session")
            localStorage.removeItem("delivery_user")
          }
        }
      } catch (error) {
        console.error("Session check error:", error)
        localStorage.removeItem("delivery_session")
        localStorage.removeItem("delivery_user")
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // API call to /login
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/auth/login", { // Adjust URL to your backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (data.role !== "LIVREUR") {
        return false
      }

      // Construct DeliveryUser from API response (assuming backend returns necessary fields; defaults for missing)
      const deliveryUser: DeliveryUser = {
        id: data.id.toString(),
        name: data.name || email.split("@")[0], // Fallback if name not returned
        email: data.email,
        phone: data.phone || "+966501234567", // Fallback or from response
        vehicleType: data.vehicleType || "motorcycle", // Assume from response or default
        vehicleNumber: data.vehicleNumber || "ABC-123",
        zone: data.zone || "Riyadh Central",
        rating: data.rating || 4.8,
        totalDeliveries: data.totalDeliveries || 0,
        avatar: data.avatar || "/Placeholder.png?height=40&width=40",
        isActive: true,
        currentLocation: data.currentLocation || { lat: 24.7136, lng: 46.6753 },
      }

      setUser(deliveryUser)

      // Store session
      const sessionData = {
        userId: deliveryUser.id,
        timestamp: Date.now(),
      }
      localStorage.setItem("delivery_session", JSON.stringify(sessionData))
      localStorage.setItem("delivery_user", JSON.stringify(deliveryUser))
      localStorage.setItem("auth_token", data.token) // Store JWT token

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("delivery_session")
    localStorage.removeItem("delivery_user")
    localStorage.removeItem("auth_token")
    router.push("/delivery/login")
  }

  const updateLocation = (lat: number, lng: number) => {
    if (user) {
      setUser({
        ...user,
        currentLocation: { lat, lng },
      })
    }
  }

  const value: DeliveryAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateLocation,
  }

  return <DeliveryAuthContext.Provider value={value}>{children}</DeliveryAuthContext.Provider>
}

export function useDeliveryAuth() {
  const context = useContext(DeliveryAuthContext)
  if (context === undefined) {
    throw new Error("useDeliveryAuth must be used within a DeliveryAuthProvider")
  }
  return context
}