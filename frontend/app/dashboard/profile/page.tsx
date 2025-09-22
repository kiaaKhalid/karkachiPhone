"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Save,
  Edit3,
  Camera,
  User,
  Shield,
  MapPin,
  Eye,
  Bell,
  Upload,
  ImageIcon,
  Edit,
  X,
} from "lucide-react"

interface ProfileDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: "M" | "F"
  dateOfBirth: string
  profileImage: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  preferences: {
    language: string
    currency: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    marketing: boolean
  }
  addresses: Array<{
    id: string
    type: string
    firstName: string
    lastName: string
    company: string
    address: string
    address2: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
    isDefault: boolean
  }>
}

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  country: string
  bio: string
  dateOfBirth: string
  avatar: string
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    orderUpdates: boolean
    newsletter: boolean
  }
}

interface AccountStatsDTO {
  memberSince: string
  totalOrders: number
  totalSpent: number
  profileCompletionPercentage: number
  accountStatus: boolean
  favoriteProductsCount: number
  reviewsWritten: number
  lastLoginAt: string
  emailVerified: boolean
  phoneVerified: boolean
  addressesCount: number
  cancelledOrders: number
  returnedOrders: number
}

interface OrderResponseV {
  orders: OrderV[]
  pagination: Pagination
  summary: Summary
}

interface OrderV {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  itemsCount: number
  items: ItemV[]
  shippingAddress: AddressV
  trackingNumber?: string
  estimatedDeliveryDate?: string
  createdAt: string
  updatedAt: string
  shippedAt?: string
  deliveredAt?: string
}

interface ItemV {
  id: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  total: number
  sku: string
}

interface AddressV {
  firstName: string
  lastName: string
  address: string
  city: string
  zipCode: string
  country: string
  phone: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface Summary {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  statusCounts: Record<string, number>
}

const updateProfile = async (profileData: { name: string; email: string }) => {
  // Implement your updateProfile function here
  // This is a placeholder, replace with your actual API call
  console.log("Updating profile:", profileData)
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ordersData, setOrdersData] = useState<OrderResponseV | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [accountStats, setAccountStats] = useState<AccountStatsDTO | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Morocco",
    bio: "",
    dateOfBirth: "",
    avatar: "",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      orderUpdates: true,
      newsletter: true,
    },
  })

  const fetchProfile = async () => {
    if (!user?.id) return

    setProfileLoading(true)
    try {
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const profileData: ProfileDTO = await response.json()

      const defaultAddress = profileData.addresses?.find((addr) => addr.isDefault) || profileData.addresses?.[0]

      setProfile({
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone || "",
        address: defaultAddress?.address || "",
        city: defaultAddress?.city || "",
        zipCode: defaultAddress?.zipCode || "",
        country: defaultAddress?.country || "Morocco",
        bio: "", // Not available in ProfileDTO
        dateOfBirth: profileData.dateOfBirth || "",
        avatar: profileData.profileImage || "",
        preferences: {
          emailNotifications: profileData.preferences?.notifications?.email ?? true,
          smsNotifications: profileData.preferences?.notifications?.sms ?? false,
          marketingEmails: profileData.preferences?.marketing ?? true,
          orderUpdates: true, // Default value
          newsletter: true, // Default value
        },
      })

      if (profileData.profileImage) {
        setAvatarUrl(profileData.profileImage)
      } else {
        const fallbackAvatar =
          profileData.gender === "M"
            ? "https://i.ibb.co/R4zBgc66/user-male.png"
            : profileData.gender === "F"
              ? "https://i.ibb.co/GfwFkRB9/user-female.png"
              : "https://i.ibb.co/C3R4f9gT/user.png"
        setAvatarUrl(fallbackAvatar)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })

      const savedProfile = localStorage.getItem(`profile_${user?.id}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchAccountStats = async () => {
    if (!user?.id) return

    setStatsLoading(true)
    try {
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/profile/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const statsData: AccountStatsDTO = await response.json()
      setAccountStats(statsData)
    } catch (error) {
      console.error("Error fetching account stats:", error)
      toast({
        title: "Error",
        description: "Failed to load account statistics",
        variant: "destructive",
      })

      setAccountStats({
        memberSince: user?.createdAt || new Date().toISOString(),
        totalOrders: 0, // orders variable is undeclared, setting to 0 as a placeholder
        totalSpent: 0,
        profileCompletionPercentage: 75,
        accountStatus: true,
        favoriteProductsCount: 0,
        reviewsWritten: 0,
        lastLoginAt: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        addressesCount: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchOrders = async (page = 1, status = "") => {
    if (!user?.id) return

    setOrdersLoading(true)
    setOrdersError(false)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      if (status) {
        params.append("status", status)
      }

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/profile/orders?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OrderResponseV = await response.json()
      setOrdersData(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrdersError(true)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchAccountStats()
    fetchOrders(currentPage, statusFilter)
  }, [user?.id, currentPage, statusFilter])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profile))
      await updateProfile({
        name: profile.name,
        email: profile.email,
      })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (preference: keyof UserProfile["preferences"], value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [preference]: value },
    }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const OrdersSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-l-4 border-l-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-40 animate-pulse"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const updateAvatar = async (avatarUrl: string) => {
    try {
      setAvatarUploading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://storrephone.onrender.com"

      const response = await fetch(`${apiBaseUrl}/api/profile/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(avatarUrl),
      })

      if (!response.ok) {
        throw new Error("Failed to update avatar")
      }

      const updatedProfile = await response.json()
      setAvatarUrl(avatarUrl)
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }))

      toast({
        title: "Avatar updated successfully",
        description: "Your profile picture has been updated.",
      })
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Error updating avatar",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setAvatarUploading(true)

      // Upload to Vercel Blob or your preferred storage
      const formData = new FormData()
      formData.append("file", file)

      // For now, we'll create a temporary URL - replace with your actual upload logic
      const imageUrl = URL.createObjectURL(file)

      // In a real implementation, you would upload to your storage service first
      // const uploadResponse = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const { url } = await uploadResponse.json()

      await updateAvatar(imageUrl)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!user) {
    return <div>Please log in to access your profile.</div>
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const updateProfile = async () => {
    if (!user?.id) return

    setIsUpdating(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://storrephone.onrender.com"

      // Convert UserProfile to ProfileDTO format
      const [firstName, ...lastNameParts] = profile.name.trim().split(" ")
      const lastName = lastNameParts.join(" ")

      const defaultAddress = {
        type: "HOME",
        firstName: firstName,
        lastName: lastName,
        company: "",
        address: profile.address,
        address2: "",
        city: profile.city,
        state: "",
        zipCode: profile.zipCode,
        country: profile.country,
        phone: profile.phone,
        isDefault: true,
      }

      const profileDTO = {
        firstName: firstName,
        lastName: lastName,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        preferences: {
          language: "en",
          currency: "MAD",
          notifications: {
            email: profile.preferences.emailNotifications,
            sms: profile.preferences.smsNotifications,
            push: false,
          },
          marketing: profile.preferences.marketingEmails,
        },
        addresses: [defaultAddress],
      }

      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        credentials: "include",
        body: JSON.stringify(profileDTO),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedProfile: ProfileDTO = await response.json()

      // Update local state with response
      const defaultAddr = updatedProfile.addresses?.find((addr) => addr.isDefault) || updatedProfile.addresses?.[0]

      setProfile({
        name: `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim(),
        email: updatedProfile.email,
        phone: updatedProfile.phone || "",
        address: defaultAddr?.address || "",
        city: defaultAddr?.city || "",
        zipCode: defaultAddr?.zipCode || "",
        country: defaultAddr?.country || "Morocco",
        bio: profile.bio, // Keep existing bio as it's not in ProfileDTO
        dateOfBirth: updatedProfile.dateOfBirth || "",
        avatar: updatedProfile.profileImage || "",
        preferences: {
          emailNotifications: updatedProfile.preferences?.notifications?.email ?? true,
          smsNotifications: updatedProfile.preferences?.notifications?.sms ?? false,
          marketingEmails: updatedProfile.preferences?.marketing ?? true,
          orderUpdates: profile.preferences.orderUpdates,
          newsletter: profile.preferences.newsletter,
        },
      })

      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    // Refetch profile to reset any unsaved changes
    fetchProfile()
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground text-lg">Manage your profile, orders, and preferences</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div
                    className={`relative ${isEditing ? "cursor-pointer" : ""}`}
                    onDragOver={isEditing ? handleDragOver : undefined}
                    onDragLeave={isEditing ? handleDragLeave : undefined}
                    onDrop={isEditing ? handleDrop : undefined}
                    onClick={isEditing ? triggerFileInput : undefined}
                  >
                    <Avatar
                      className={`w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg transition-all duration-200 ${
                        isEditing && isDragOver ? "scale-105 border-blue-500" : ""
                      } ${isEditing ? "hover:scale-105" : ""}`}
                    >
                      {avatarLoading || avatarUploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <AvatarImage src={avatarUrl || "/Placeholder.png"} alt={profile.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>

                    {isEditing && isDragOver && (
                      <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-blue-500" />
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            triggerFileInput()
                          }}
                          disabled={avatarUploading}
                          className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {isEditing && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p className="flex items-center justify-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        Click or drag to upload
                      </p>
                      <p className="text-xs">Supports JPG, PNG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h2>
                <p className="text-muted-foreground mb-4">{profile.email}</p>

                <div className="flex justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    {user.role === "admin" ? "Administrator" : "Customer"}
                  </Badge>
                  {user.role === "admin" && (
                    <Badge variant="default" className="bg-purple-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-sm text-muted-foreground italic border-l-4 border-blue-300 pl-4 text-left">
                    "{profile.bio}"
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : accountStats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Member since</span>
                      <span className="text-sm font-medium">
                        {new Date(accountStats.memberSince).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <span className="text-sm font-medium">{accountStats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Spent</span>
                      <span className="text-sm font-medium">${accountStats.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profile completion</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${accountStats.profileCompletionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{accountStats.profileCompletionPercentage}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account status</span>
                      <Badge
                        variant="default"
                        className={accountStats.accountStatus ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {accountStats.accountStatus ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Favorites</span>
                      <span className="text-sm font-medium">{accountStats.favoriteProductsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reviews Written</span>
                      <span className="text-sm font-medium">{accountStats.reviewsWritten}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Addresses</span>
                      <span className="text-sm font-medium">{accountStats.addressesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Login</span>
                      <span className="text-sm font-medium">
                        {new Date(accountStats.lastLoginAt).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Failed to load account statistics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={updateProfile}
                            disabled={isUpdating}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button onClick={cancelEditing} disabled={isUpdating} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                          placeholder="+212 6XX XXX XXX"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        className="bg-background min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </CardTitle>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button
                          onClick={updateProfile}
                          disabled={isUpdating}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button onClick={cancelEditing} disabled={isUpdating} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        disabled={!isEditing}
                        placeholder="123 Main Street"
                        className="bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profile.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Casablanca"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={profile.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          disabled={!isEditing}
                          placeholder="20000"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profile.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button
                        variant={statusFilter === "" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter("")}
                      >
                        All Orders
                      </Button>
                      <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter("pending")}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={statusFilter === "processing" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter("processing")}
                      >
                        Processing
                      </Button>
                      <Button
                        variant={statusFilter === "shipped" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter("shipped")}
                      >
                        Shipped
                      </Button>
                      <Button
                        variant={statusFilter === "delivered" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusFilter("delivered")}
                      >
                        Delivered
                      </Button>
                    </div>

                    {ordersLoading || ordersError ? (
                      <OrdersSkeleton />
                    ) : !ordersData || ordersData.orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground">Start shopping to see your orders here!</p>
                      </div>
                    ) : (
                      <>
                        {ordersData.summary && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{ordersData.summary.totalOrders}</p>
                              <p className="text-sm text-muted-foreground">Total Orders</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">${ordersData.summary.totalSpent.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">Total Spent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">${ordersData.summary.averageOrderValue.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">Average Order</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{ordersData.pagination.totalItems}</p>
                              <p className="text-sm text-muted-foreground">Filtered Results</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          {ordersData.orders.map((order) => (
                            <Card key={order.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                      </p>
                                      {order.estimatedDeliveryDate && (
                                        <p className="text-sm text-muted-foreground">
                                          Est. delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                                      {getStatusIcon(order.status)}
                                      <span className="ml-1 capitalize">{order.status}</span>
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {order.paymentStatus}
                                    </Badge>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                      <img
                                        src={item.image || "/Placeholder.png"}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                        <p className="text-sm font-semibold">
                                          ${item.price} MAD x {item.quantity} = ${item.total} MAD
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      Items: <span className="font-medium">{order.itemsCount}</span>
                                    </p>
                                    {order.trackingNumber && (
                                      <p className="text-sm text-muted-foreground">
                                        Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      Shipping to: {order.shippingAddress?.firstName || "N/A"}{" "}
                                      {order.shippingAddress?.lastName || ""}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold">
                                      {order.currency} {order.total}
                                    </p>
                                  </div>
                                </div>

                                {order.status === "shipped" && order.trackingNumber && (
                                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Truck className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-blue-800 dark:text-blue-200">
                                        Package Shipped
                                      </span>
                                    </div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                      Your order is on its way! Track your package with: {order.trackingNumber}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {ordersData.pagination && ordersData.pagination.totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={!ordersData.pagination.hasPreviousPage}
                            >
                              Previous
                            </Button>

                            <div className="flex gap-1">
                              {Array.from({ length: ordersData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  variant={page === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="w-10"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={!ordersData.pagination.hasNextPage}
                            >
                              Next
                            </Button>
                          </div>
                        )}

                        {ordersData.pagination && (
                          <div className="text-center text-sm text-muted-foreground mt-4">
                            Showing {(ordersData.pagination.currentPage - 1) * ordersData.pagination.itemsPerPage + 1}{" "}
                            to{" "}
                            {Math.min(
                              ordersData.pagination.currentPage * ordersData.pagination.itemsPerPage,
                              ordersData.pagination.totalItems,
                            )}{" "}
                            of {ordersData.pagination.totalItems} orders
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(profile.preferences).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">
                            {key === "emailNotifications" && "Email Notifications"}
                            {key === "smsNotifications" && "SMS Notifications"}
                            {key === "marketingEmails" && "Marketing Emails"}
                            {key === "orderUpdates" && "Order Updates"}
                            {key === "newsletter" && "Newsletter"}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {key === "emailNotifications" && "Receive general notifications via email"}
                            {key === "smsNotifications" && "Receive important updates via SMS"}
                            {key === "marketingEmails" && "Receive promotional offers and deals"}
                            {key === "orderUpdates" && "Get notified about order status changes"}
                            {key === "newsletter" && "Subscribe to our weekly newsletter"}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange(key as keyof UserProfile["preferences"], checked)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">Password Security</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-300 hover:bg-yellow-100 bg-transparent"
                      >
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Two-Factor Authentication</p>
                          <p className="text-sm text-green-600 dark:text-green-400">Your account is secured</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500 text-white">
                        Enabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <FloatingWhatsAppButton />
    </div>
  )
}
