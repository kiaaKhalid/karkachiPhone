"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Shield } from "lucide-react"

interface UserUpdate {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  password?: string
}

interface EditUserPopupProps {
  isOpen: boolean
  onClose: () => void
  user: UserUpdate | null
  onUserUpdated: (updatedUser: UserUpdate) => void
}

export default function EditUserPopup({ isOpen, onClose, user, onUserUpdated }: EditUserPopupProps) {
  const [formData, setFormData] = useState<UserUpdate>({
    id: "",
    name: "",
    email: "",
    role: "USER",
    isActive: true,
    password: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: "",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Prepare update data (partial, exclude password if empty)
      const updateData: any = {
        ...(formData.name && { name: formData.name }),
        ...(formData.email && { email: formData.email }),
        ...(formData.role && { role: formData.role }),
        ...(typeof formData.isActive !== 'undefined' && { isActive: formData.isActive }),
        ...(formData.password && { password: formData.password }),
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/users/${formData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`)
      }

      const result = await response.json()
      const updatedUser: UserUpdate = result.data

      toast({
        title: "Success ✅",
        description: `User "${updatedUser.name}" updated successfully`,
        duration: 5000,
      })

      onUserUpdated(updatedUser)
      onClose()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="text-sm font-medium text-high-contrast mb-2 block">Name *</label>
            <Input
              placeholder="Enter user name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-visible"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-high-contrast mb-2 block">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border-visible"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-high-contrast mb-2 block">Role</label>
            <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="rounded-xl border-visible">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="SUPER_ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Super Admin
                  </div>
                </SelectItem>
                <SelectItem value="LIVREUR">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Delivery
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-high-contrast mb-2 block">New Password (optional)</label>
            <Input
              type="password"
              placeholder="Leave empty to keep current password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-xl border-visible"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-high-contrast">Active Status</label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl bg-transparent" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="btn-primary rounded-xl" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}