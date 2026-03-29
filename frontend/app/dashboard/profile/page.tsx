"use client"
// Redesigned layout with beautiful settings and sub-views bounds bounds

import type React from "react"
import Link from "next/link"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"
import {
  Save,
  Edit3,
  User,
  Shield,
  Edit,
  X,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle,
  ArrowLeft,
  Camera,
} from "lucide-react"

interface ProfileResponse {
  name: string
  phone: string
  email: string
  avatarUrl: string | null
  createdAt: string
  version: number
}

interface UserProfile {
  name: string
  email: string
  phone: string
  createdAt: string
  version: number
  avatar: string
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

interface AccountStatsResponse {
  accountStatus: string
  totalOrders: number
  totalSpent: number
  profileCompletionPercent: number
  numberFavorites: number
  numberReviewsWritten: number
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

function ProfileContent() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [accountStats, setAccountStats] = useState<AccountStatsDTO | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    createdAt: "",
    version: 0,
    avatar: "",
  })

  // Password change states
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  // View states for redesign
  const [currentView, setCurrentView] = useState<"settings" | "profile">("settings")
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)

  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")

  useEffect(() => {
    if (viewParam === "profile") {
      setCurrentView("profile")
    } else if (viewParam === "password") {
      setIsChangePasswordOpen(true)
    }
  }, [viewParam])

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

  const fetchProfile = async () => {
    if (!user?.id) return

    setProfileLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${apiBaseUrl}/profile/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const profileData: ProfileResponse = await response.json()

      const fallbackAvatar = "https://i.ibb.co/C3R4f9gT/user.png"

      setProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        createdAt: profileData.createdAt,
        version: profileData.version,
        avatar: profileData.avatarUrl || fallbackAvatar,
      })

      setAvatarUrl(profileData.avatarUrl || fallbackAvatar)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement des données de profil",
        variant: "destructive",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchAccountStats = async () => {
    if (!user?.id) return

    setStatsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${apiBaseUrl}/profile/account-stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const statsData: AccountStatsResponse = await response.json()

      setAccountStats({
        memberSince: profile.createdAt || new Date().toISOString(),
        totalOrders: statsData.totalOrders,
        totalSpent: statsData.totalSpent,
        profileCompletionPercentage: statsData.profileCompletionPercent,
        accountStatus: statsData.accountStatus === "active",
        favoriteProductsCount: statsData.numberFavorites,
        reviewsWritten: statsData.numberReviewsWritten,
        lastLoginAt: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        addressesCount: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
      })
    } catch (error) {
      console.error("Error fetching account stats:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement des statistiques du compte",
        variant: "destructive",
      })

      setAccountStats({
        memberSince: profile.createdAt || new Date().toISOString(),
        totalOrders: 0,
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

  useEffect(() => {
    fetchProfile()
    fetchAccountStats()
  }, [user?.id])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateProfile()
      setIsEditing(false)
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du profil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user?.id) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("auth_token")
      const updateBody = {
        version: profile.version,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
      }

      const response = await fetch(`${apiBaseUrl}/profile/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(updateBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedProfileData: ProfileResponse = await response.json()

      setProfile({
        ...profile,
        name: updatedProfileData.name,
        email: updatedProfileData.email,
        phone: updatedProfileData.phone,
        version: updatedProfileData.version,
      })

      setAvatarUrl(updatedProfileData.avatarUrl || avatarUrl)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit faire au moins 8 caractères",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${apiBaseUrl}/profile/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setOldPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        toast({
          title: "Succès",
          description: "Mot de passe mis à jour avec succès",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du mot de passe",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    fetchProfile()
  }

  if (!user) {
    return <div>Veuillez vous connecter pour accéder à votre profil.</div>
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-950 -mt-20">
      <div className="container mx-auto px-4 max-w-md">
        {currentView === "settings" && (
          <div className="animate-fade-in space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">Settings</h1>

            {/* Profile Welcome Widget bounds */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border border-slate-200">
                  <AvatarImage src={avatarUrl} alt={profile.name} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-slate-400">Welcome</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{profile.name}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-500"
                onClick={() => {
                  localStorage.removeItem("auth_token");
                  window.location.href = "/auth/login";
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu List bounds */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
              {/* User Profile item bounds */}
              <div onClick={() => setCurrentView("profile")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500"><User className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">User Profile</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>

              {/* Change Password item bounds */}
              <div onClick={() => setIsChangePasswordOpen(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500"><Shield className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Change Password</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
              
              {/* FAQs bounds */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500"><HelpCircle className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">FAQs</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>

              {/* Push Notifications bounds */}
              <div className="flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500"><Bell className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Push Notification</span>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              {/* Logout bounds */}
              <div 
                onClick={() => {
                  localStorage.removeItem("auth_token");
                  localStorage.removeItem("user");
                  window.location.href = "/auth/login";
                }} 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors text-red-500"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-500">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Déconnexion</span>
                </div>
                <ChevronRight className="h-5 w-5 text-red-500" />
              </div>
            </div>

            {/* WhatsApp Banner bounds */}
            <div className="bg-blue-50/50 dark:bg-slate-900 rounded-2xl p-6 text-center border border-blue-100/50 dark:border-slate-800 mt-10">
              <p className="text-slate-600600 dark:text-slate-300 text-sm mb-3">If you have any other query you can reach out to us.</p>
              <Link href="https://wa.me/+212676423340" target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm inline-flex items-center gap-1">
                WhatsApp Us
              </Link>
            </div>
          </div>
        )}

        {currentView === "profile" && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentView("settings")} className="text-slate-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Profile</h2>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="relative">
                <Avatar className="w-28 h-28 border-4 border-white shadow-md">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-slate-200 hover:bg-slate-300 text-slate-600 border-2 border-white shadow-sm">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="space-y-1">
                <Label className="text-xs text-slate-400 ml-1">Full Name</Label>
                <Input value={profile.name} onChange={(e) => handleInputChange("name", e.target.value)} className="rounded-2xl bg-white dark:bg-slate-800 border-none h-12 shadow-sm" placeholder="John Doe" />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-slate-400 ml-1">E-Mail</Label>
                <Input value={profile.email} onChange={(e) => handleInputChange("email", e.target.value)} className="rounded-2xl bg-white dark:bg-slate-800 border-none h-12 shadow-sm" placeholder="Email" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400 ml-1">Mobile</Label>
                <Input value={profile.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="rounded-2xl bg-white dark:bg-slate-800 border-none h-12 shadow-sm" placeholder="+212 6..." />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full h-12 rounded-2xl bg-[#0F174A] hover:bg-[#1A235D] text-white font-semibold mt-10">
              {isLoading ? "Enregistrement..." : "SAVE"}
            </Button>

            <Button 
              onClick={() => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                window.location.href = "/auth/login";
              }} 
              variant="outline"
              className="w-full h-12 rounded-2xl border-red-200 hover:border-red-300 text-red-500 hover:text-red-600 font-semibold mt-4 gap-2 flex items-center justify-center bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        )}

        <Sheet open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl border-none p-6 bg-slate-50 dark:bg-slate-900">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold text-[#0F174A] dark:text-white text-center">Change Password</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 h-12 pr-10"
                  placeholder="New Password"
                />
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 h-12 pr-10"
                  placeholder="Confirm Password"
                />
              </div>

              <Button onClick={handlePasswordChange} disabled={changingPassword || !newPassword || !confirmNewPassword} className="w-full h-12 rounded-2xl bg-[#0F174A] hover:bg-[#1A235D] text-white font-semibold mt-4">
                {changingPassword ? "Mise à jour..." : "SAVE"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <FloatingWhatsAppButton />
    </div>
  )
}