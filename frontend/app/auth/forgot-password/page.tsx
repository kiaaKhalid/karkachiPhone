"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Step = 1 | 2 | 3

interface ForgotPasswordData {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const updateFormData = (field: keyof ForgotPasswordData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const url = `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/auth/send-reset-code?email=${encodeURIComponent(formData.email)}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const code = await response.json()
        toast({
          title: "Code sent!",
          description: "Please check your email for the reset code.",
        })
        setCurrentStep(2)
      } else if (response.status === 404) {
        setError("Email not found. Please check your email address.")
      } else {
        setError("Failed to send reset code. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please check if the server is running and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.code || formData.code.length !== 6) {
      setError("Please enter a valid 6-digit code.")
      return
    }

    if (!/^\d{6}$/.test(formData.code)) {
      setError("Code must contain only numbers.")
      return
    }

    setCurrentStep(3)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]{8,}$/
    if (!passwordRegex.test(formData.newPassword)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      )
      setIsLoading(false)
      return
    }

    try {
      const url = `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/auth/forget-password`

      const requestBody = {
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Password updated!",
          description: "Your password has been successfully updated.",
        })
        router.push("/auth/login")
      } else {
        const errorMessage = await response.text()

        if (response.status === 404) {
          setError("Email not found.")
        } else if (response.status === 400) {
          if (errorMessage.includes("Password reset is not allowed")) {
            setError("Password reset is not allowed for users authenticated via social login.")
          } else if (errorMessage.includes("do not match")) {
            setError("New password and confirm password do not match.")
          } else {
            setError("Invalid request. Please try again.")
          }
        } else {
          setError("Failed to reset password. Please try again.")
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please check if the server is running on https://karkachiphon-app-a513bd8dab1d.herokuapp.com")
      } else {
        setError("Network error. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
      setError("")
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Réinitialiser le mot de passe"
      case 2: return "Entrer le code de vérification"
      case 3: return "Créer un nouveau mot de passe"
      default: return "Réinitialiser le mot de passe"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Entrez votre adresse email pour recevoir un code"
      case 2: return "Entrez le code à 6 chiffres envoyé par email"
      case 3: return "Créez un nouveau mot de passe sécurisé"
      default: return ""
    }
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3].map((step) => (
                  <Skeleton key={step} className="w-8 h-8 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="text-center pt-4">
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                {currentStep === 3 ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <Lock className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
              ))}
            </div>

            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{getStepDescription()}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse Email</Label>
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi du code...</span>
                    </div>
                  ) : (
                    "Envoyer le code"
                  )}
                </Button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de Vérification</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.code}
                    onChange={(e) => updateFormData("code", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-gray-500 text-center">Code envoyé à {formData.email}</p>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1 bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Vérifier le code
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => updateFormData("newPassword", e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
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

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Exigences du mot de passe :</p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Au moins 8 caractères</li>
                    <li>• Une lettre majuscule (A-Z)</li>
                    <li>• Une lettre minuscule (a-z)</li>
                    <li>• Un chiffre (0-9)</li>
                    <li>• Un caractère spécial (@$!%*?&#+-_=)</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="flex-1 bg-transparent"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mise à jour...</span>
                      </div>
                    ) : (
                      "Mettre à jour le mot de passe"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
