"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  description: string
  isActive: boolean
  sortOrder: number
  isRebone: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

interface EditCategoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category: Category | null
}

export default function EditCategoryDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  category,
}: EditCategoryDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    sortOrder: 0,
    isRebone: false,
  })
  const url = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image || "",
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        isRebone: category.isRebone,
      })
    }
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Category name and slug are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${url}/admin/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          image: formData.image || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
          isRebone: formData.isRebone,
        }),
      })

      if (response.ok) {
        const resData = await response.json()
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    const slug = name
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : ""

    setFormData((prev) => ({ ...prev, name, slug }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Category</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update category information and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name"
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="category-url-slug"
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this category..."
              rows={3}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || "/Placeholder.png"}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort Order
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Status
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.isActive ? "Category is visible to customers" : "Category is hidden"}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="isRebone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rebone Category
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable rebone features for this category
              </p>
            </div>
            <Switch
              id="isRebone"
              checked={formData.isRebone}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRebone: checked }))}
              disabled={isLoading}
            />
          </div>

          {/* Move DialogFooter INSIDE the form */}
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}