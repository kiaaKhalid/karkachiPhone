"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  description: string
  productCount: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

interface BrandVDTO {
  name: string
  slug: string
  logoUrl: string
  description: string
  isActive: boolean
  isFeatured: boolean
}

interface EditBrandDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
  onBrandUpdated: () => void
}

export default function EditBrandDialog({ isOpen, onOpenChange, brand, onBrandUpdated }: EditBrandDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<BrandVDTO>({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    isActive: true,
    isFeatured: false,
  })
  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (brand && isOpen) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logoUrl: brand.logo,
        description: brand.description,
        isActive: brand.isActive,
        isFeatured: brand.isFeatured,
      })
    }
  }, [brand, isOpen])

  const handleSubmit = async () => {
    if (!brand || !formData.name.trim() || !formData.slug.trim() || !formData.logoUrl.trim()) {
      toast({
        title: "Error",
        description: "Brand name, slug, and logo URL are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${url}/admin/brands/${brand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          logoUrl: formData.logoUrl,
          description: formData.description,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update brand")
      }

      const resData = await response.json()
      if (!resData.success) {
        throw new Error(resData.message || "Failed to update brand")
      }

      onBrandUpdated()
      onOpenChange(false)

      toast({
        title: "Success",
        description: resData.message || "Brand updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update brand",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>Update the brand information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Brand Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter brand name"
                maxLength={150}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="brand-slug"
                maxLength={150}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter brand description"
              rows={3}
              maxLength={1024}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="edit-logo">Logo URL *</Label>
            <Input
              id="edit-logo"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="Enter logo URL"
              disabled={isLoading}
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <img
                  src={formData.logoUrl || "/Placeholder.png"}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
                disabled={isLoading}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
                disabled={isLoading}
              />
              <Label htmlFor="edit-isFeatured">Featured</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={isLoading ? "bg-gray-400" : "bg-[#01A0EA] hover:bg-[#0190D4]"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Brand"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}