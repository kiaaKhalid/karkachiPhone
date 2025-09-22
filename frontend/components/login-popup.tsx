"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void // Added onLoginSuccess callback prop
  mode?: "login" | "register"
  onModeChange?: (mode: "login" | "register") => void
}

export function LoginPopup({ isOpen, onClose, onLoginSuccess, mode = "login", onModeChange }: LoginPopupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === "login") {
        const success = await login(email, password)
        if (success) {
          onLoginSuccess?.() // Call onLoginSuccess callback if provided
          onClose()
          resetForm()
        }
      } else {
        if (password !== confirmPassword) {
          toast({
            title: "Erreur",
            description: "Les mots de passe ne correspondent pas",
            variant: "destructive",
          })
          return
        }
        const success = await register(name, email, password)
        if (success) {
          onLoginSuccess?.() // Call onLoginSuccess callback for registration too
          onClose()
          resetForm()
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const fillDemoCredentials = () => {
    setEmail("demo@example.com")
    setPassword("demo123")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === "login" ? <User className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            <span>{mode === "login" ? "Connexion" : "Inscription"}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Connectez-vous à votre compte pour continuer"
              : "Créez un nouveau compte pour commencer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{mode === "login" ? "Connexion..." : "Inscription..."}</span>
              </div>
            ) : (
              <span>{mode === "login" ? "Se connecter" : "S'inscrire"}</span>
            )}
          </Button>
        </form>

        {mode === "login" && (
          <>
            <Separator />
            <Button variant="outline" onClick={fillDemoCredentials} className="w-full bg-transparent">
              Utiliser le compte de démonstration
            </Button>
          </>
        )}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              onModeChange?.(mode === "login" ? "register" : "login")
              resetForm()
            }}
            className="text-sm"
          >
            {mode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginPopup
