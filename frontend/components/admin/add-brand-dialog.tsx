"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateBrandDto {
  name: string
  logoUrl: string
  description?: string
  isActive?: boolean
  isFeatured?: boolean
}

interface AddBrandDialogProps {
  onBrandAdded: () => void
}

const initialFormData: CreateBrandDto = {
  name: "",
  logoUrl: "",
  description: "",
  isActive: true,
  isFeatured: false,
}

export default function AddBrandDialog({ onBrandAdded }: AddBrandDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CreateBrandDto>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setFormData(initialFormData)
    }
  }

  const handleAddBrand = async () => {
    if (!formData.name.trim() || !formData.logoUrl.trim()) {
      toast({
        title: "Error",
        description: "Brand name and logo URL are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = process.env.NEXT_PUBLIC_API_URL
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${url}/admin/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create brand")
      }

      const data = await response.json()

      if (data.success) {
        setFormData(initialFormData)
        setIsOpen(false)
        onBrandAdded()

        toast({
          title: "Success",
          description: "Brand added successfully",
        })
      } else {
        throw new Error("Failed to create brand")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create brand",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#01A0EA] hover:bg-[#0190D4]">
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>Create a new brand for your products</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter brand name"
              maxLength={150}
              required
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL *</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              maxLength={255}
              required
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter brand description"
              rows={3}
              maxLength={1024}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddBrand}
            disabled={isLoading}
            className={isLoading ? "bg-gray-400 hover:bg-gray-400" : "bg-[#01A0EA] hover:bg-[#0190D4]"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Brand"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}