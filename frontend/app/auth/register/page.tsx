"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Chrome } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface SignUpData {
  name: string
  prenom: string
  email: string
  password: string
  confirmPassword: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const { register: userRegister } = useAuth()

  const updateFormData = (field: keyof SignUpData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Efface l'erreur quand l'utilisateur tape
  }

  const handleSocialLogin = (provider: string) => {
    if (provider === "Google") {
      window.location.href = `${apiUrl}/auth/google`;
      return;
    }
    toast({
      title: "Bientôt disponible",
      description: `L'inscription via ${provider} sera bientôt disponible !`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      setIsLoading(false)
      return
    }

    if (!formData.name.trim() || !formData.prenom.trim()) {
      setError("Le prénom et le nom sont obligatoires.")
      setIsLoading(false)
      return
    }

    if (formData.name.length > 100 || formData.prenom.length > 100) {
      setError("Le prénom et le nom ne doivent pas dépasser 100 caractères.")
      setIsLoading(false)
      return
    }

    try {
      const fullName = `${formData.prenom.trim()} ${formData.name.trim()}`

      const result = await userRegister(fullName, formData.email.trim(), formData.password)

      if (result.success && result.user) {
        toast({
          title: "Compte créé !",
          description: "Votre compte a été créé avec succès.",
        })
        router.push("/dashboard")
        return
      }

      setError(result.error || "Échec de la création du compte. Veuillez réessayer.")
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err)
      setError("Une erreur imprévue est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 -mt-8">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Entrez vos informations pour créer votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("Google")}
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <Image
                src="/google.png" // Ensure this Google logo image exists in the public directory
                alt="Google Logo"
                width={20}
                height={20}
                className="object-contain mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">S'inscrire avec Google</span>
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Ou s'inscrire avec
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom & Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Entrez votre prénom"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="prenom"
                      type="text"
                      placeholder="Entrez votre nom"
                      value={formData.prenom}
                      onChange={(e) => updateFormData("prenom", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Entrez votre email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Création du compte...</span>
                  </div>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}