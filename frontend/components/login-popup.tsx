"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { User } from "lucide-react"

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

export function LoginPopup({ isOpen, onClose, onLoginSuccess }: LoginPopupProps) {
  const { user } = useAuth()

  const handleLoginRedirect = () => {
    onLoginSuccess?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Connexion requise</span>
          </DialogTitle>
          <DialogDescription>
            Vous devez vous connecter à votre compte pour continuer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button asChild className="w-full" onClick={handleLoginRedirect}>
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginPopup