"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Package, DollarSign, Warehouse, ImageIcon, Settings, Edit, Save, X, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DetailedProductAdminDTO {
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string
  brandId: number
  brandName: string
  brandLogo: string
  categoryId: number
  categoryName: string
  categoryImage: string
  price: number
  comparePrice: number
  costPrice: number
  sku: string
  barcode: string
  stock: number
  minStock: number
  maxStock: number
  weight: number
  dimensions: string
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive: boolean
  isDigital: boolean
  requiresShipping: boolean
  metaTitle: string
  metaDescription: string
  imei: string
  isOnPromotion: boolean
  promotionEndDate: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  tags: string
  imageIds: number[]
  imageUrls: string[]
  imageAltTexts: string[]
  imageIsPrimaries: boolean[]
  imageSortOrders: number[]
  imageCreatedAts: string[]
  specificationIds: number[]
  specificationNames: string[]
  specificationValues: string[]
  specificationSortOrders: number[]
  specificationCreatedAts: string[]
}

interface ProductImage {
  id: number
  url: string
  altText: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

interface ProductSpecification {
  id: number
  specName: string
  specValue: string
  sortOrder: number
  createdAt: string
}

interface BrandLogo {
  id: number
  name: string
  logo: string
}

interface CategoryChoix {
  id: number
  name: string
  image: string
}

interface EditProductPopupProps {
  isOpen: boolean
  onClose: () => void
  productId: number | null
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

  const transformImages = (product: DetailedProductAdminDTO): ProductImage[] => {
    if (!product.imageIds || product.imageIds.length === 0) return []

    return product.imageIds.map((id, index) => ({
      id,
      url: product.imageUrls[index] || "",
      altText: product.imageAltTexts[index] || "",
      isPrimary: product.imageIsPrimaries[index] || false,
      sortOrder: product.imageSortOrders[index] || 0,
      createdAt: product.imageCreatedAts[index] || "",
    }))
  }

  const transformSpecifications = (product: DetailedProductAdminDTO): ProductSpecification[] => {
    if (!product.specificationIds || product.specificationIds.length === 0) return []

    return product.specificationIds.map((id, index) => ({
      id,
      specName: product.specificationNames[index] || "",
      specValue: product.specificationValues[index] || "",
      sortOrder: product.specificationSortOrders[index] || 0,
      createdAt: product.specificationCreatedAts[index] || "",
    }))
  }

  const fetchProductDetails = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/products/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch product details")
      }

      const data: DetailedProductAdminDTO = await response.json()
      setProduct(data)
      initializeFormData(data)
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
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/logo/brands")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      setBrands(data)
    } catch (err) {
      console.error("Error fetching brands:", err)
    } finally {
      setLoadingBrands(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/category/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
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
      id: Date.now(), // Temporary ID for new images
      url: newImageUrl.trim(),
      altText: product?.name || "",
      isPrimary: editableImages.length === 0,
      sortOrder: editableImages.length + 1,
      createdAt: new Date().toISOString(),
    }

    const updatedImages = [...editableImages, newImage]
    setEditableImages(updatedImages)
    setNewImageUrl("")
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      imageIds: updatedImages.map((img) => img.id), // plus de `|| null`
      imageUrls: updatedImages.map((img) => img.url),
      imageAltTexts: updatedImages.map((img) => img.altText || ""),
      imageIsPrimaries: updatedImages.map((img) => img.isPrimary),
      imageSortOrders: updatedImages.map((img) => img.sortOrder),
      imageCreatedAts: updatedImages.map((img) => img.createdAt || ""),
    }))
    
  }

  const removeImage = (imageId: number) => {
    const updatedImages = editableImages.filter((img) => img.id !== imageId)
    setEditableImages(updatedImages)
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      imageIds: updatedImages.map((img) => img.id), // plus de `|| null`
      imageUrls: updatedImages.map((img) => img.url),
      imageAltTexts: updatedImages.map((img) => img.altText || ""),
      imageIsPrimaries: updatedImages.map((img) => img.isPrimary),
      imageSortOrders: updatedImages.map((img) => img.sortOrder),
      imageCreatedAts: updatedImages.map((img) => img.createdAt || ""),
    }))
    
  }

  const addSpecification = () => {
    if (!newSpecName.trim() || !newSpecValue.trim()) return

    const newSpec: ProductSpecification = {
      id: Date.now(), // Temporary ID for new specs
      specName: newSpecName.trim(),
      specValue: newSpecValue.trim(),
      sortOrder: editableSpecs.length + 1,
      createdAt: new Date().toISOString(),
    }

    const updatedSpecs = [...editableSpecs, newSpec]
    setEditableSpecs(updatedSpecs)
    setNewSpecName("")
    setNewSpecValue("")
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      specificationIds: updatedSpecs.map((spec) => spec.id), // plus de `|| null`
      specificationNames: updatedSpecs.map((spec) => spec.specName),
      specificationValues: updatedSpecs.map((spec) => spec.specValue),
      specificationSortOrders: updatedSpecs.map((spec) => spec.sortOrder),
      specificationCreatedAts: updatedSpecs.map((spec) => spec.createdAt || ""),
    }))
    
  }

  const removeSpecification = (specId: number) => {
    const updatedSpecs = editableSpecs.filter((spec) => spec.id !== specId)
    setEditableSpecs(updatedSpecs)
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      specificationIds: updatedSpecs.map((spec) => spec.id), // plus de `|| null`
      specificationNames: updatedSpecs.map((spec) => spec.specName),
      specificationValues: updatedSpecs.map((spec) => spec.specValue),
      specificationSortOrders: updatedSpecs.map((spec) => spec.sortOrder),
      specificationCreatedAts: updatedSpecs.map((spec) => spec.createdAt || ""),
    }))
    
  }

  const updateSpecification = (specId: number, field: "specName" | "specValue", value: string) => {
    setEditableSpecs(editableSpecs.map((spec) => (spec.id === specId ? { ...spec, [field]: value } : spec)))
    const updatedSpecs = editableSpecs.map((spec) =>
      spec.id === specId ? { ...spec, [field]: value } : spec
    )
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      specificationNames: updatedSpecs.map((spec) => spec.specName),
      specificationValues: updatedSpecs.map((spec) => spec.specValue),
    }))
  }

  const initializeFormData = (productData: DetailedProductAdminDTO) => {
    setFormData({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      shortDescription: productData.shortDescription,
      price: productData.price,
      comparePrice: productData.comparePrice,
      costPrice: productData.costPrice,
      stock: productData.stock,
      minStock: productData.minStock,
      maxStock: productData.maxStock,
      sku: productData.sku,
      weight: productData.weight,
      dimensions: productData.dimensions,
      barcode: productData.barcode,
      imei: productData.imei,
      isFeatured: productData.isFeatured,
      isActive: productData.isActive,
      isDigital: productData.isDigital,
      requiresShipping: productData.requiresShipping,
      isOnPromotion: productData.isOnPromotion,
      promotionEndDate: productData.promotionEndDate,
      brandId: productData.brandId,
      categoryId: productData.categoryId,
      imageIds: productData.imageIds,
      imageUrls: productData.imageUrls,
      imageAltTexts: productData.imageAltTexts,
      imageIsPrimaries: productData.imageIsPrimaries,
      imageSortOrders: productData.imageSortOrders,
      imageCreatedAts: productData.imageCreatedAts,
      specificationIds: productData.specificationIds,
      specificationNames: productData.specificationNames,
      specificationValues: productData.specificationValues,
      specificationSortOrders: productData.specificationSortOrders,
      specificationCreatedAts: productData.specificationCreatedAts,
    })
    setEditableImages(transformImages(productData))
    setEditableSpecs(transformSpecifications(productData))
  }

  const handleSave = async () => {
    if (!product || !productId) return

    try {
      setSaving(true)

      const updateData: Partial<DetailedProductAdminDTO> = {
        ...formData,
        imageIds: formData.imageIds,
        imageUrls: formData.imageUrls,
        imageAltTexts: formData.imageAltTexts,
        imageIsPrimaries: formData.imageIsPrimaries,
        imageSortOrders: formData.imageSortOrders,
        imageCreatedAts: formData.imageCreatedAts,
        specificationIds: formData.specificationIds,
        specificationNames: formData.specificationNames,
        specificationValues: formData.specificationValues,
        specificationSortOrders: formData.specificationSortOrders,
        specificationCreatedAts: formData.specificationCreatedAts,
      }

      console.log("[v0] Sending update data:", updateData)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/products/${productId}`, {
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

      const updatedProduct: DetailedProductAdminDTO = await response.json()
      setProduct(updatedProduct)
      initializeFormData(updatedProduct)
      setIsEditing(false)

      toast({
        title: "✅ Product Updated Successfully",
        description: `All product information for "${updatedProduct.name}" has been successfully modified and saved.`,
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

  const setPrimaryImage = (imageId: number) => {
    const updatedImages = editableImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }))
    setEditableImages(updatedImages)
    // Synchroniser avec formData
    setFormData((prev) => ({
      ...prev,
      imageIsPrimaries: updatedImages.map((img) => img.isPrimary),
    }))
  }

  const moveImageUp = (imageId: number) => {
    const currentIndex = editableImages.findIndex((img) => img.id === imageId)
    if (currentIndex > 0) {
      const newImages = [...editableImages]
      const temp = newImages[currentIndex]
      newImages[currentIndex] = newImages[currentIndex - 1]
      newImages[currentIndex - 1] = temp

      // Update sort orders
      newImages.forEach((img, index) => {
        img.sortOrder = index + 1
      })

      setEditableImages(newImages)
      // Synchroniser avec formData
      setFormData((prev) => ({
        ...prev,
        imageSortOrders: newImages.map((img) => img.sortOrder),
      }))
    }
  }

  const moveImageDown = (imageId: number) => {
    const currentIndex = editableImages.findIndex((img) => img.id === imageId)
    if (currentIndex < editableImages.length - 1) {
      const newImages = [...editableImages]
      const temp = newImages[currentIndex]
      newImages[currentIndex] = newImages[currentIndex + 1]
      newImages[currentIndex + 1] = temp

      // Update sort orders
      newImages.forEach((img, index) => {
        img.sortOrder = index + 1
      })

      setEditableImages(newImages)
      // Synchroniser avec formData
      setFormData((prev) => ({
        ...prev,
        imageSortOrders: newImages.map((img) => img.sortOrder),
      }))
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

  const images = product ? transformImages(product) : []
  const specifications = product ? transformSpecifications(product) : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? "Edit Product Details" : "Product Details"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify product information" : "View comprehensive product information"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-6">
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
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => productId && fetchProductDetails(productId)}>Retry</Button>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      value={isEditing ? formData.name || "" : product.name}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={isEditing ? formData.slug || "" : product.slug}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("slug", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={isEditing ? formData.description || "" : product.description || ""}
                      readOnly={!isEditing}
                      rows={3}
                      onChange={(e) => updateFormField("description", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Short Description</Label>
                    <Textarea
                      value={isEditing ? formData.shortDescription || "" : product.shortDescription || ""}
                      readOnly={!isEditing}
                      rows={2}
                      onChange={(e) => updateFormField("shortDescription", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Brand</Label>
                    {isEditing ? (
                      <Select
                        value={formData.brandId?.toString() || ""}
                        onValueChange={(value) => updateFormField("brandId", Number.parseInt(value))}
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
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={brand.logo || "/Placeholder.png"}
                                    alt={brand.name}
                                    width={20}
                                    height={20}
                                    className="rounded"
                                  />
                                  {brand.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-md">
                        {product.brandLogo && (
                          <Image
                            src={product.brandLogo || "/Placeholder.png"}
                            alt={product.brandName}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                        <span>{product.brandName}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Category</Label>
                    {isEditing ? (
                      <Select
                        value={formData.categoryId?.toString() || ""}
                        onValueChange={(value) => updateFormField("categoryId", Number.parseInt(value))}
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
                              <SelectItem key={category.id} value={category.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={category.image || "/Placeholder.png"}
                                    alt={category.name}
                                    width={20}
                                    height={20}
                                    className="rounded"
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-md">
                        {product.categoryImage && (
                          <Image
                            src={product.categoryImage || "/Placeholder.png"}
                            alt={product.categoryName}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                        <span>{product.categoryName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={isEditing ? formData.price || "" : product.price}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("price", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Compare Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={isEditing ? formData.comparePrice || "" : product.comparePrice || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("comparePrice", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={isEditing ? formData.costPrice || "" : product.costPrice || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("costPrice", Number.parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={isEditing ? formData.stock || "" : product.stock}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("stock", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Min Stock</Label>
                    <Input
                      type="number"
                      value={isEditing ? formData.minStock || "" : product.minStock}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("minStock", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Max Stock</Label>
                    <Input
                      type="number"
                      value={isEditing ? formData.maxStock || "" : product.maxStock}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("maxStock", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={isEditing ? formData.sku || "" : product.sku || "N/A"}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("sku", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={isEditing ? formData.weight || "" : product.weight || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("weight", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Dimensions</Label>
                    <Input
                      value={isEditing ? formData.dimensions || "" : product.dimensions || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("dimensions", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input
                      value={isEditing ? formData.barcode || "" : product.barcode || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("barcode", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>IMEI</Label>
                    <Input
                      value={isEditing ? formData.imei || "" : product.imei || ""}
                      readOnly={!isEditing}
                      onChange={(e) => updateFormField("imei", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Product Images ({isEditing ? editableImages.length : images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-4 flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addImageUrl()}
                    />
                    <Button onClick={addImageUrl} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {(isEditing ? editableImages : images).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(isEditing ? editableImages : images)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((image, index) => (
                        <div key={image.id} className="relative">
                          {isEditing && (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 z-10"
                                onClick={() => removeImage(image.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>

                              {/* Primary image toggle */}
                              <Button
                                variant={image.isPrimary ? "default" : "outline"}
                                size="sm"
                                className="absolute top-1 left-1 h-6 px-2 text-xs z-10"
                                onClick={() => setPrimaryImage(image.id)}
                              >
                                {image.isPrimary ? "Primary" : "Set Primary"}
                              </Button>

                              {/* Sort controls */}
                              <div className="absolute bottom-1 right-1 flex gap-1 z-10">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-transparent"
                                  onClick={() => moveImageUp(image.id)}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button
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
                            alt={image.altText || product.name}
                            width={150}
                            height={150}
                            className="rounded-lg object-cover w-full h-32"
                          />
                          {image.isPrimary && !isEditing && (
                            <Badge className="absolute top-2 left-2 text-xs">Primary</Badge>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">Order: {image.sortOrder}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No images available</p>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Specifications ({isEditing ? editableSpecs.length : specifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        placeholder="Specification name"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                      />
                      <Input
                        placeholder="Specification value"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                      />
                      <Button onClick={addSpecification} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Spec
                      </Button>
                    </div>
                  </div>
                )}

                {(isEditing ? editableSpecs : specifications).length > 0 ? (
                  <div className="space-y-2">
                    {(isEditing ? editableSpecs : specifications)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((spec) => (
                        <div key={spec.id} className="flex items-center gap-2 p-3 border rounded-lg">
                          {isEditing ? (
                            <>
                              <Input
                                value={spec.specName}
                                onChange={(e) => updateSpecification(spec.id, "specName", e.target.value)}
                                className="flex-1"
                                placeholder="Specification name"
                              />
                              <Input
                                value={spec.specValue}
                                onChange={(e) => updateSpecification(spec.id, "specValue", e.target.value)}
                                className="flex-1"
                                placeholder="Specification value"
                              />
                              <Button variant="destructive" size="sm" onClick={() => removeSpecification(spec.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-medium flex-1">{spec.specName}</span>
                              <span className="text-muted-foreground flex-1">{spec.specValue}</span>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available</p>
                )}
              </CardContent>
            </Card>

            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={isEditing ? (formData.isActive ?? product.isActive) : product.isActive}
                      disabled={!isEditing}
                      onCheckedChange={(checked) => updateFormField("isActive", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured</Label>
                    <Switch
                      checked={isEditing ? (formData.isFeatured ?? product.isFeatured) : product.isFeatured}
                      disabled={!isEditing}
                      onCheckedChange={(checked) => updateFormField("isFeatured", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Digital</Label>
                    <Switch
                      checked={isEditing ? (formData.isDigital ?? product.isDigital) : product.isDigital}
                      disabled={!isEditing}
                      onCheckedChange={(checked) => updateFormField("isDigital", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Requires Shipping</Label>
                    <Switch
                      checked={
                        isEditing ? (formData.requiresShipping ?? product.requiresShipping) : product.requiresShipping
                      }
                      disabled={!isEditing}
                      onCheckedChange={(checked) => updateFormField("requiresShipping", checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>On Promotion</Label>
                    <Switch
                      checked={isEditing ? (formData.isOnPromotion ?? product.isOnPromotion) : product.isOnPromotion}
                      disabled={!isEditing}
                      onCheckedChange={(checked) => updateFormField("isOnPromotion", checked)}
                    />
                  </div>
                  {(isEditing ? formData.isOnPromotion : product.isOnPromotion) && product.promotionEndDate && (
                    <div>
                      <Label>Promotion End Date</Label>
                      <Input
                        type="datetime-local"
                        value={isEditing ? formData.promotionEndDate || "" : product.promotionEndDate}
                        readOnly={!isEditing}
                        onChange={(e) => updateFormField("promotionEndDate", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-4">
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
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}