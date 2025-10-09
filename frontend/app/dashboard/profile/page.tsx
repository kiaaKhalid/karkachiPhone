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
    <div className="min-h-screen pt-24 sm:pt-28 bg-background -mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">Mon Compte</h1>
            <p className="text-muted-foreground text-lg">Gérez votre profil, vos commandes et vos préférences</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEditing} disabled={isLoading}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les Modifications
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
                Modifier le Profil
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={avatarUrl} alt={profile.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h2>
                <p className="text-muted-foreground mb-4">{profile.email}</p>

                <div className="flex justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    {user.role === "admin" ? "Administrateur" : "Client"}
                  </Badge>
                  {user.role === "admin" && (
                    <Badge variant="default" className="bg-purple-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Statistiques du Compte</CardTitle>
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
                      <span className="text-sm text-muted-foreground">Membre depuis</span>
                      <span className="text-sm font-medium">
                        {new Date(accountStats.memberSince).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total des Commandes</span>
                      <span className="text-sm font-medium">{accountStats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Dépensé</span>
                      <span className="text-sm font-medium">{accountStats.totalSpent.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Achèvement du profil</span>
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
                      <span className="text-sm text-muted-foreground">Statut du compte</span>
                      <Badge
                        variant="default"
                        className={accountStats.accountStatus ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {accountStats.accountStatus ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Favoris</span>
                      <span className="text-sm font-medium">{accountStats.favoriteProductsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avis Écrits</span>
                      <span className="text-sm font-medium">{accountStats.reviewsWritten}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Échec du chargement des statistiques du compte</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations Personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom Complet</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={!isEditing}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse Email</Label>
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
                      <Label htmlFor="phone">Numéro de Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                        placeholder="+212 6XX XXX XXX"
                        className="bg-background"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Ancien Mot de Passe</Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Votre ancien mot de passe"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe (min. 8 caractères)"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirmer le Nouveau Mot de Passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirmez le nouveau mot de passe"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !oldPassword || !newPassword || !confirmNewPassword}
                    className="w-full"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour en cours...
                      </>
                    ) : (
                      "Changer le Mot de Passe"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FloatingWhatsAppButton />
    </div>
  )
}