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

interface AddCategoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AddCategoryDialog({ isOpen, onOpenChange, onSuccess }: AddCategoryDialogProps) {
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

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
      sortOrder: 0,
      isRebone: false,
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.slug.trim() || !formData.image.trim()) {
      toast({
        title: "Error",
        description: "Category name, slug, and image are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${url}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
          description: formData.description || undefined,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
          isRebone: formData.isRebone,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category",
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-lg">📁</span>
            </div>
            Add New Category
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-2">
            Create a new product category with all necessary information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name"
                required
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="slug"
                className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="category-url-slug"
                required
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this category..."
              rows={3}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 resize-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="image"
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Image URL *
            </Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              required
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
            />
            {formData.image && (
              <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-600">
                <img
                  src={formData.image || "/Placeholder.png"}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="sortOrder"
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min={0}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Category Status
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.isActive ? "Category will be visible to customers" : "Category will be hidden"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                disabled={isLoading}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
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
        </form>

        <DialogFooter className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim() || !formData.slug.trim() || !formData.image.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}