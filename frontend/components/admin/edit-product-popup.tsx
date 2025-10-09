"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Package, DollarSign, Warehouse, ImageIcon, Settings, Edit, Save, X, Plus, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DetailedProductAdminDTO {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive: boolean
  isNew: boolean
  isBestSeller: boolean
  discount?: number
  isFlashDeal: boolean
  flashPrice?: number | null
  flashStartsAt?: string | null
  flashEndsAt?: string | null
  flashStock?: number | null
  isPromotionalBanner: boolean
  isPromotional: boolean
  isProductphares: boolean
  isProductFlash: boolean
  brandId: string
  brandName: string
  brandLogo: string
  categoryId: string
  categoryName: string
  categoryImage: string
  createdAt: string
  updatedAt: string
  imageIds: string[]
  imageUrls: string[]
  primaryImageUrl?: string
  specificationIds: string[]
  specificationNames: string[]
  specificationValues: string[]
}

interface ProductImage {
  id: string
  url: string
  sortOrder: number
}

interface ProductSpecification {
  id: string
  specName: string
  specValue: string
  sortOrder: number
}

interface BrandLogo {
  id: string
  name: string
  logo: string
}

interface CategoryChoix {
  id: string
  name: string
  image: string
}

interface EditProductPopupProps {
  isOpen: boolean
  onClose: () => void
  productId: string | null
}

export default function EditProductPopup({ isOpen, onClose, productId }: EditProductPopupProps) {
  const [product, setProduct] = useState<DetailedProductAdminDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<DetailedProductAdminDTO>>({})
  const [brands, setBrands] = useState<BrandLogo[]>([])
  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [editableImages, setEditableImages] = useState<ProductImage[]>([])
  const [editableSpecs, setEditableSpecs] = useState<ProductSpecification[]>([])
  const [newSpecName, setNewSpecName] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const { toast } = useToast()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const enrichedProduct = useMemo(() => {
    if (!product || brands.length === 0 || categories.length === 0) return product

    const brand = brands.find((b) => b.id === product.brandId)
    const category = categories.find((c) => c.id === product.categoryId)

    return {
      ...product,
      brandName: brand?.name || "",
      brandLogo: brand?.logo || "",
      categoryName: category?.name || "",
      categoryImage: category?.image || "",
    }
  }, [product, brands, categories])

  const transformImages = (product: DetailedProductAdminDTO): ProductImage[] => {
    if (!product.imageIds || product.imageIds.length === 0) return []

    return product.imageIds.map((id, index) => ({
      id,
      url: product.imageUrls[index] || "",
      sortOrder: index + 1,
    }))
  }

  const transformSpecifications = (product: DetailedProductAdminDTO): ProductSpecification[] => {
    if (!product.specificationIds || product.specificationIds.length === 0) return []

    return product.specificationIds.map((id, index) => ({
      id,
      specName: product.specificationNames[index] || "",
      specValue: product.specificationValues[index] || "",
      sortOrder: index + 1,
    }))
  }

  const fetchProductDetails = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${baseUrl}/admin/products/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch product details")
      }

      const fullResponse = await response.json()
      if (!fullResponse.success) {
        throw new Error(fullResponse.message || "Failed to fetch product details")
      }

      const apiData = fullResponse.data
      const mappedProduct: DetailedProductAdminDTO = {
        id: apiData.id,
        name: apiData.name,
        description: apiData.description,
        price: parseFloat(apiData.price || "0"),
        originalPrice: apiData.originalPrice ? parseFloat(apiData.originalPrice) : undefined,
        stock: apiData.stock || 0,
        rating: parseFloat(apiData.rating || "0"),
        reviewCount: apiData.reviewsCount || 0,
        isFeatured: apiData.isFeatured || false,
        isActive: apiData.isActive || false,
        isNew: apiData.isNew || false,
        isBestSeller: apiData.isBestSeller || false,
        discount: apiData.discount ? parseInt(apiData.discount) : undefined,
        isFlashDeal: apiData.isFlashDeal || false,
        flashPrice: apiData.flashPrice ? parseFloat(apiData.flashPrice) : null,
        flashStartsAt: apiData.flashStartsAt || null,
        flashEndsAt: apiData.flashEndsAt || null,
        flashStock: apiData.flashStock ? parseInt(apiData.flashStock) : null,
        isPromotionalBanner: apiData.isPromotionalBanner || false,
        isPromotional: apiData.isPromotional || false,
        isProductphares: apiData.isProductphares || false,
        isProductFlash: apiData.isProductFlash || false,
        brandId: apiData.brandId,
        brandName: "",
        brandLogo: "",
        categoryId: apiData.categoryId,
        categoryName: "",
        categoryImage: "",
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        primaryImageUrl: apiData.image || "",
        imageIds: apiData.images?.map((img: any) => img.id) || [],
        imageUrls: apiData.images?.map((img: any) => img.url) || [],
        specificationIds: apiData.specs?.map((s: any) => s.id) || [],
        specificationNames: apiData.specs?.map((s: any) => s.key) || [],
        specificationValues: apiData.specs?.map((s: any) => s.value) || [],
      }

      setProduct(mappedProduct)
      initializeFormData(mappedProduct)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product details")
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true)
      const response = await fetch(`${baseUrl}/public/brands/logo`)
      if (!response.ok) throw new Error("Failed to fetch brands")
      const fullData = await response.json()
      const mappedBrands = fullData.data.map((b: any) => ({
        id: b.id,
        name: b.name,
        logo: b.logoUrl,
      }))
      setBrands(mappedBrands)
    } catch (err) {
      console.error("Error fetching brands:", err)
    } finally {
      setLoadingBrands(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch(`${baseUrl}/public/category`)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return

    const newImage: ProductImage = {
      id: `${Date.now()}`,
      url: newImageUrl.trim(),
      sortOrder: editableImages.length + 1,
    }

    const updatedImages = [...editableImages, newImage]
    setEditableImages(updatedImages)
    setNewImageUrl("")
  }

  const removeImage = (imageId: string) => {
    const updatedImages = editableImages.filter((img) => img.id !== imageId)
    setEditableImages(updatedImages)
  }

  const addSpecification = () => {
    if (!newSpecName.trim() || !newSpecValue.trim()) return

    const newSpec: ProductSpecification = {
      id: `${Date.now()}`,
      specName: newSpecName.trim(),
      specValue: newSpecValue.trim(),
      sortOrder: editableSpecs.length + 1,
    }

    const updatedSpecs = [...editableSpecs, newSpec]
    setEditableSpecs(updatedSpecs)
    setNewSpecName("")
    setNewSpecValue("")
  }

  const removeSpecification = (specId: string) => {
    const updatedSpecs = editableSpecs.filter((spec) => spec.id !== specId)
    setEditableSpecs(updatedSpecs)
  }

  const updateSpecification = (specId: string, field: "specName" | "specValue", value: string) => {
    setEditableSpecs(editableSpecs.map((spec) => (spec.id === specId ? { ...spec, [field]: value } : spec)))
  }

  const initializeFormData = (productData: DetailedProductAdminDTO) => {
    setFormData({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      originalPrice: productData.originalPrice,
      stock: productData.stock,
      reviewCount: productData.reviewCount,
      primaryImageUrl: productData.primaryImageUrl,
      isActive: productData.isActive,
      isFeatured: productData.isFeatured,
      isNew: productData.isNew,
      isBestSeller: productData.isBestSeller,
      discount: productData.discount,
      isFlashDeal: productData.isFlashDeal,
      flashPrice: productData.flashPrice,
      flashStartsAt: productData.flashStartsAt,
      flashEndsAt: productData.flashEndsAt,
      flashStock: productData.flashStock,
      isPromotionalBanner: productData.isPromotionalBanner,
      isPromotional: productData.isPromotional,
      isProductphares: productData.isProductphares,
      isProductFlash: productData.isProductFlash,
      brandId: productData.brandId,
      categoryId: productData.categoryId,
      imageIds: productData.imageIds,
      imageUrls: productData.imageUrls,
      specificationIds: productData.specificationIds,
      specificationNames: productData.specificationNames,
      specificationValues: productData.specificationValues,
    })
    setEditableImages(transformImages(productData))
    setEditableSpecs(transformSpecifications(productData))
  }

  const handleSave = async () => {
    if (!product || !productId) return

    try {
      setSaving(true)

      const updateData: any = {
        name: formData.name ?? product.name,
        description: formData.description ?? product.description,
        price: formData.price ?? product.price,
        originalPrice: formData.originalPrice !== undefined ? formData.originalPrice : product.originalPrice,
        stock: formData.stock !== undefined ? formData.stock : product.stock,
        reviewsCount: formData.reviewCount !== undefined ? formData.reviewCount : product.reviewCount,
        image: formData.primaryImageUrl !== undefined ? formData.primaryImageUrl : product.primaryImageUrl,
        isActive: formData.isActive !== undefined ? formData.isActive : product.isActive,
        isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : product.isFeatured,
        isNew: formData.isNew !== undefined ? formData.isNew : product.isNew,
        isBestSeller: formData.isBestSeller !== undefined ? formData.isBestSeller : product.isBestSeller,
        discount: formData.discount !== undefined ? formData.discount : product.discount,
        isFlashDeal: formData.isFlashDeal !== undefined ? formData.isFlashDeal : product.isFlashDeal,
        flashPrice: formData.flashPrice !== undefined ? formData.flashPrice : product.flashPrice,
        flashStartsAt: formData.flashStartsAt !== undefined ? formData.flashStartsAt : product.flashStartsAt,
        flashEndsAt: formData.flashEndsAt !== undefined ? formData.flashEndsAt : product.flashEndsAt,
        flashStock: formData.flashStock !== undefined ? formData.flashStock : product.flashStock,
        isPromotionalBanner: formData.isPromotionalBanner !== undefined ? formData.isPromotionalBanner : product.isPromotionalBanner,
        isPromotional: formData.isPromotional !== undefined ? formData.isPromotional : product.isPromotional,
        isProductphares: formData.isProductphares !== undefined ? formData.isProductphares : product.isProductphares,
        isProductFlash: formData.isProductFlash !== undefined ? formData.isProductFlash : product.isProductFlash,
        brandId: formData.brandId ?? product.brandId,
        categoryId: formData.categoryId ?? product.categoryId,
        images: editableImages
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => ({ url: img.url })),
        specs: editableSpecs
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((spec) => ({ key: spec.specName, value: spec.specValue })),
      }

      console.log("[v0] Sending update data:", updateData)

      const response = await fetch(`${baseUrl}/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update product")
      }

      const fullResponse = await response.json()
      if (!fullResponse.success) {
        throw new Error(fullResponse.message || "Failed to update product")
      }

      await fetchProductDetails(productId)
      setIsEditing(false)

      toast({
        title: "✅ Product Updated Successfully",
        description: `All product information for "${product.name}" has been successfully modified and saved.`,
        duration: 5000,
      })
    } catch (err) {
      console.error("Error updating product:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (product) {
      initializeFormData(product)
    }
    setIsEditing(false)
  }

  const updateFormField = (field: keyof DetailedProductAdminDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const moveImageUp = (imageId: string) => {
    const currentIndex = editableImages.findIndex((img) => img.id === imageId)
    if (currentIndex > 0) {
      const newImages = [...editableImages]
      ;[newImages[currentIndex - 1], newImages[currentIndex]] = [newImages[currentIndex], newImages[currentIndex - 1]]

      newImages.forEach((img, index) => {
        img.sortOrder = index + 1
      })

      setEditableImages(newImages)
    }
  }

  const moveImageDown = (imageId: string) => {
    const currentIndex = editableImages.findIndex((img) => img.id === imageId)
    if (currentIndex < editableImages.length - 1) {
      const newImages = [...editableImages]
      ;[newImages[currentIndex + 1], newImages[currentIndex]] = [newImages[currentIndex], newImages[currentIndex + 1]]

      newImages.forEach((img, index) => {
        img.sortOrder = index + 1
      })

      setEditableImages(newImages)
    }
  }

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails(productId)
      fetchBrands()
      fetchCategories()
      setIsEditing(false)
    }
  }, [isOpen, productId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const images = enrichedProduct ? transformImages(enrichedProduct) : []
  const specifications = enrichedProduct ? transformSpecifications(enrichedProduct) : []
  const currentIsFlashDeal = isEditing ? (formData.isFlashDeal ?? enrichedProduct?.isFlashDeal ?? false) : enrichedProduct?.isFlashDeal ?? false
  const primaryImageUrl = isEditing ? (formData.primaryImageUrl || enrichedProduct?.primaryImageUrl || "") : (enrichedProduct?.primaryImageUrl || "")

  if (!enrichedProduct) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? "Edit Product Details" : "Product Details"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify product information" : "View comprehensive product information"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => productId && fetchProductDetails(productId)}>Retry</Button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Enter the basic details of your product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Image</Label>
                      {primaryImageUrl ? (
                        <div className="relative">
                          <Image
                            src={primaryImageUrl || "/Placeholder.png"}
                            alt={enrichedProduct.name}
                            width={200}
                            height={200}
                            className="w-full max-w-xs h-48 object-cover rounded border"
                          />
                          {isEditing && (
                            <Input
                              type="url"
                              value={formData.primaryImageUrl || ""}
                              onChange={(e) => updateFormField("primaryImageUrl", e.target.value)}
                              placeholder="Enter primary image URL"
                              className="mt-2"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No primary image available.
                          </p>
                          {isEditing && (
                            <Input
                              type="url"
                              value={formData.primaryImageUrl || ""}
                              onChange={(e) => updateFormField("primaryImageUrl", e.target.value)}
                              placeholder="Enter primary image URL"
                              className="mt-2"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? formData.name || "" : enrichedProduct.name}
                        readOnly={!isEditing}
                        onChange={(e) => updateFormField("name", e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={isEditing ? formData.description || "" : enrichedProduct.description || ""}
                        readOnly={!isEditing}
                        rows={4}
                        onChange={(e) => updateFormField("description", e.target.value)}
                        placeholder="Enter product description"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pricing & Inventory
                    </CardTitle>
                    <CardDescription>Set pricing and stock information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={isEditing ? (formData.price || 0).toString() : enrichedProduct.price.toString()}
                          readOnly={!isEditing}
                          onChange={(e) => updateFormField("price", parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={isEditing ? (formData.originalPrice || 0).toString() : (enrichedProduct.originalPrice || 0).toString()}
                          readOnly={!isEditing}
                          onChange={(e) => updateFormField("originalPrice", parseFloat(e.target.value) || undefined)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount (Auto-calculated)</Label>
                        <Input
                          type="number"
                          value={(isEditing ? (formData.discount || 0) : enrichedProduct.discount || 0).toString()}
                          readOnly
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={isEditing ? (formData.stock || 0).toString() : enrichedProduct.stock.toString()}
                        readOnly={!isEditing}
                        onChange={(e) => updateFormField("stock", parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="flashDeal"
                        checked={currentIsFlashDeal}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => {
                          updateFormField("isFlashDeal", checked)
                          if (!checked) {
                            updateFormField("flashPrice", null)
                            updateFormField("flashStock", null)
                            updateFormField("flashStartsAt", null)
                            updateFormField("flashEndsAt", null)
                          }
                        }}
                      />
                      <Label htmlFor="flashDeal">Flash Deal</Label>
                    </div>
                    {currentIsFlashDeal && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="flashPrice">Flash Price</Label>
                            <Input
                              id="flashPrice"
                              type="number"
                              step="0.01"
                              value={isEditing ? (formData.flashPrice || 0).toString() : (enrichedProduct.flashPrice || 0).toString()}
                              readOnly={!isEditing}
                              onChange={(e) => updateFormField("flashPrice", parseFloat(e.target.value) || null)}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="flashStock">Flash Stock</Label>
                            <Input
                              id="flashStock"
                              type="number"
                              value={isEditing ? (formData.flashStock || 0).toString() : (enrichedProduct.flashStock || 0).toString()}
                              readOnly={!isEditing}
                              onChange={(e) => updateFormField("flashStock", parseInt(e.target.value) || null)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="flashStartsAt">Flash Starts At</Label>
                            <Input
                              id="flashStartsAt"
                              type="datetime-local"
                              value={isEditing ? formData.flashStartsAt || "" : enrichedProduct.flashStartsAt || ""}
                              readOnly={!isEditing}
                              onChange={(e) => updateFormField("flashStartsAt", e.target.value || null)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="flashEndsAt">Flash Ends At</Label>
                            <Input
                              id="flashEndsAt"
                              type="datetime-local"
                              value={isEditing ? formData.flashEndsAt || "" : enrichedProduct.flashEndsAt || ""}
                              readOnly={!isEditing}
                              onChange={(e) => updateFormField("flashEndsAt", e.target.value || null)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Product Specifications
                    </CardTitle>
                    <CardDescription>Add technical specifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Specification key"
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                        />
                        <Input
                          placeholder="Specification value"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                        />
                        <Button type="button" onClick={addSpecification} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {(isEditing ? editableSpecs : specifications)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((spec, index) => (
                          <div
                            key={spec.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            {isEditing ? (
                              <>
                                <Input
                                  value={spec.specName}
                                  onChange={(e) => updateSpecification(spec.id, "specName", e.target.value)}
                                  className="flex-1 mr-2"
                                  placeholder="Specification name"
                                />
                                <Input
                                  value={spec.specValue}
                                  onChange={(e) => updateSpecification(spec.id, "specValue", e.target.value)}
                                  className="flex-1 mr-2"
                                  placeholder="Specification value"
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeSpecification(spec.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm flex-1">
                                  <strong>{spec.specName}:</strong> {spec.specValue}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Product Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                    <CardDescription>Configure product visibility and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={isEditing ? (formData.isActive ?? enrichedProduct.isActive) : enrichedProduct.isActive}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isActive", checked)}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={isEditing ? (formData.isFeatured ?? enrichedProduct.isFeatured) : enrichedProduct.isFeatured}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isFeatured", checked)}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="new"
                        checked={isEditing ? (formData.isNew ?? enrichedProduct.isNew) : enrichedProduct.isNew}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isNew", checked)}
                      />
                      <Label htmlFor="new">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bestSeller"
                        checked={isEditing ? (formData.isBestSeller ?? enrichedProduct.isBestSeller) : enrichedProduct.isBestSeller}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isBestSeller", checked)}
                      />
                      <Label htmlFor="bestSeller">Best Seller</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="promotionalBanner"
                        checked={isEditing ? (formData.isPromotionalBanner ?? enrichedProduct.isPromotionalBanner) : enrichedProduct.isPromotionalBanner}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isPromotionalBanner", checked)}
                      />
                      <Label htmlFor="promotionalBanner">Promotional Banner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="promotional"
                        checked={isEditing ? (formData.isPromotional ?? enrichedProduct.isPromotional) : enrichedProduct.isPromotional}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isPromotional", checked)}
                      />
                      <Label htmlFor="promotional">Promotional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="productphares"
                        checked={isEditing ? (formData.isProductphares ?? enrichedProduct.isProductphares) : enrichedProduct.isProductphares}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isProductphares", checked)}
                      />
                      <Label htmlFor="productphares">Product Phares</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="productFlash"
                        checked={isEditing ? (formData.isProductFlash ?? enrichedProduct.isProductFlash) : enrichedProduct.isProductFlash}
                        disabled={!isEditing}
                        onCheckedChange={(checked) => updateFormField("isProductFlash", checked)}
                      />
                      <Label htmlFor="productFlash">Product Flash</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      {isEditing ? (
                        <Select
                          value={formData.categoryId || ""}
                          onValueChange={(value) => updateFormField("categoryId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center space-x-2">
                                    {category.image && (
                                      <Image
                                        src={category.image || "/placeholder.svg"}
                                        alt={category.name}
                                        width={16}
                                        height={16}
                                        className="rounded object-cover"
                                      />
                                    )}
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 border rounded-md">
                          {enrichedProduct.categoryImage && (
                            <Image
                              src={enrichedProduct.categoryImage || "/placeholder.svg"}
                              alt={enrichedProduct.categoryName}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <span>{enrichedProduct.categoryName || "No category selected"}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      {isEditing ? (
                        <Select
                          value={formData.brandId || ""}
                          onValueChange={(value) => updateFormField("brandId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingBrands ? (
                              <SelectItem value="loading" disabled>
                                Loading brands...
                              </SelectItem>
                            ) : (
                              brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  <div className="flex items-center space-x-2">
                                    {brand.logo && (
                                      <Image
                                        src={brand.logo || "/Placeholder.png"}
                                        alt={brand.name}
                                        width={16}
                                        height={16}
                                        className="rounded object-cover"
                                      />
                                    )}
                                    <span>{brand.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 border rounded-md">
                          {enrichedProduct.brandLogo && (
                            <Image
                              src={enrichedProduct.brandLogo || "/Placeholder.png"}
                              alt={enrichedProduct.brandName}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <span>{enrichedProduct.brandName || "No brand selected"}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Product Images
                    </CardTitle>
                    <CardDescription>Set the main image and add additional product image URLs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(isEditing ? editableImages : images).length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {(isEditing ? editableImages : images)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((image, index) => (
                            <div key={image.id} className="relative group">
                              {isEditing && (
                                <>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 z-10"
                                    onClick={() => removeImage(image.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>

                                  <div className="absolute bottom-1 right-1 flex gap-1 z-10">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0 bg-transparent"
                                      onClick={() => moveImageUp(image.id)}
                                      disabled={index === 0}
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0 bg-transparent"
                                      onClick={() => moveImageDown(image.id)}
                                      disabled={index === (isEditing ? editableImages.length : images.length) - 1}
                                    >
                                      ↓
                                    </Button>
                                  </div>
                                </>
                              )}

                              <Image
                                src={image.url || "/Placeholder.png"}
                                alt={enrichedProduct.name}
                                width={150}
                                height={150}
                                className="w-full h-20 object-cover rounded border"
                              />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No images available.
                        </p>
                      </div>
                    )}
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addImageUrl()}
                        />
                        <Button type="button" onClick={addImageUrl} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats - Keep as separate since not in add, but fits right */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Rating</Label>
                        <p className="text-lg font-semibold">{enrichedProduct.rating.toFixed(2)} / 5</p>
                      </div>
                      <div>
                        <Label>Reviews Count</Label>
                        <p className="text-lg font-semibold">{enrichedProduct.reviewCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} disabled={!product}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#01A0EA] hover:bg-[#0190D4]">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Product"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}