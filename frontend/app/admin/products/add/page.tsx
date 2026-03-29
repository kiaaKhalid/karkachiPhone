"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, X, Save, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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

interface SpecDTO {
  key: string
  value: string
}

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [brands, setBrands] = useState<BrandLogo[]>([])
  const [categories, setCategories] = useState<CategoryChoix[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [brandsError, setBrandsError] = useState(false)
  const [categoriesError, setCategoriesError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    brandId: "",
    stock: "",
    isActive: true,
    isFeatured: false,
    reviewsCount: "",
    isNew: false,
    isBestSeller: false,
    isFlashDeal: false,
    flashPrice: "",
    flashStartsAt: "",
    flashEndsAt: "",
    flashStock: "",
    isPromotionalBanner: false,
    isPromotional: false,
    isProductphares: false,
    isProductFlash: false,
    mainImage: "",
    images: [] as string[],
    specs: [] as SpecDTO[],
    discount: 0,
  })

  const [newSpec, setNewSpec] = useState({ key: "", value: "" })
  const [newImageUrl, setNewImageUrl] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const priceNum = parseFloat(formData.price) || 0
    const originalPriceNum = parseFloat(formData.originalPrice) || 0
    if (originalPriceNum > priceNum && priceNum > 0) {
      const disc = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      setFormData((prev) => ({ ...prev, discount: disc }))
    } else {
      setFormData((prev) => ({ ...prev, discount: 0 }))
    }
  }, [formData.price, formData.originalPrice])

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true)
      setBrandsError(false)
      const response = await fetch(`${apiUrl}/public/brands/logo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const fullData = await response.json()
      if (!fullData.success) {
        throw new Error(fullData.message || "Failed to fetch brands")
      }
      const data: any[] = fullData.data
      const mappedBrands = data.map((b: any) => ({
        id: b.id,
        name: b.name,
        logo: b.logoUrl,
      }))
      setBrands(mappedBrands)
    } catch (error) {
      console.error("Error fetching brands:", error)
      setBrandsError(true)
      toast({
        title: "Error",
        description: "Failed to load brands. Please check if the backend server is running.",
        variant: "destructive",
      })
    } finally {
      setBrandsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError(false)
      const response = await fetch(`${apiUrl}/public/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: CategoryChoix[] = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategoriesError(true)
      toast({
        title: "Error",
        description: "Failed to load categories. Please check if the backend server is running.",
        variant: "destructive",
      })
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
    fetchCategories()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpec = () => {
    if (newSpec.key && newSpec.value) {
      setFormData((prev) => ({
        ...prev,
        specs: [...prev.specs, { key: newSpec.key, value: newSpec.value }],
      }))
      setNewSpec({ key: "", value: "" })
    }
  }

  const removeSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }))
  }

  const addImageUrl = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl],
      }))
      setNewImageUrl("")
    }
  }

  const removeImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.categoryId || !formData.brandId || !formData.stock || !formData.mainImage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and set a main image.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const price = Number.parseFloat(formData.price)
      const originalPrice = formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined
      const stock = Number.parseInt(formData.stock)
      const reviewsCount = formData.reviewsCount ? Number.parseInt(formData.reviewsCount) : undefined
      const flashPrice = formData.flashPrice ? Number.parseFloat(formData.flashPrice) : undefined
      const flashStock = formData.flashStock ? Number.parseInt(formData.flashStock) : undefined

      const requestData = {
        name: formData.name,
        description: formData.description,
        price,
        originalPrice,
        image: formData.mainImage,
        stock,
        rating: 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        reviewsCount,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
        discount: formData.discount,
        isFlashDeal: formData.isFlashDeal,
        flashPrice,
        flashStartsAt: formData.flashStartsAt || null,
        flashEndsAt: formData.flashEndsAt || null,
        flashStock,
        isPromotionalBanner: formData.isPromotionalBanner,
        isPromotional: formData.isPromotional,
        isProductphares: formData.isProductphares,
        isProductFlash: formData.isProductFlash,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        images: formData.images.map((url) => ({ url })),
        specs: formData.specs.map((spec) => ({ key: spec.key, value: spec.value })),
      }

      const response = await fetch(`${apiUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "Failed to create product")
      }

      console.log("[v0] Product created successfully:", result)

      toast({
        title: "✅ Success!",
        description: `Product "${formData.name}" has been created successfully!`,
        duration: 5000,
      })

      setTimeout(() => {
        router.push("/admin/products")
      }, 1500)
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "❌ Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create product. Please check if the backend server is running and try again.",
        variant: "destructive",
        duration: 7000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 -mt-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new product for your store</p>
          </div>
        </div>
        <Button onClick={handleSubmit} className="bg-[#01A0EA] hover:bg-[#0190D4]" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewsCount">Reviews Count</Label>
                  <Input
                    id="reviewsCount"
                    type="number"
                    min="0"
                    value={formData.reviewsCount}
                    onChange={(e) => handleInputChange("reviewsCount", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set pricing and stock information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (Auto-calculated)</Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="flashDeal"
                    checked={formData.isFlashDeal}
                    onCheckedChange={(checked) => handleInputChange("isFlashDeal", checked)}
                  />
                  <Label htmlFor="flashDeal">Flash Deal</Label>
                </div>
                {formData.isFlashDeal && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="flashPrice">Flash Price</Label>
                        <Input
                          id="flashPrice"
                          type="number"
                          step="0.01"
                          value={formData.flashPrice}
                          onChange={(e) => handleInputChange("flashPrice", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flashStock">Flash Stock</Label>
                        <Input
                          id="flashStock"
                          type="number"
                          value={formData.flashStock}
                          onChange={(e) => handleInputChange("flashStock", e.target.value)}
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
                          value={formData.flashStartsAt}
                          onChange={(e) => handleInputChange("flashStartsAt", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flashEndsAt">Flash Ends At</Label>
                        <Input
                          id="flashEndsAt"
                          type="datetime-local"
                          value={formData.flashEndsAt}
                          onChange={(e) => handleInputChange("flashEndsAt", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>Add technical specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Specification key"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, key: e.target.value }))}
                  />
                  <Input
                    placeholder="Specification value"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
                  />
                  <Button type="button" onClick={addSpec} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm">
                        <strong>{spec.key}:</strong> {spec.value}
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
                <CardDescription>Configure product visibility and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new"
                    checked={formData.isNew}
                    onCheckedChange={(checked) => handleInputChange("isNew", checked)}
                  />
                  <Label htmlFor="new">New</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bestSeller"
                    checked={formData.isBestSeller}
                    onCheckedChange={(checked) => handleInputChange("isBestSeller", checked)}
                  />
                  <Label htmlFor="bestSeller">Best Seller</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="promotionalBanner"
                    checked={formData.isPromotionalBanner}
                    onCheckedChange={(checked) => handleInputChange("isPromotionalBanner", checked)}
                  />
                  <Label htmlFor="promotionalBanner">Promotional Banner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="promotional"
                    checked={formData.isPromotional}
                    onCheckedChange={(checked) => handleInputChange("isPromotional", checked)}
                  />
                  <Label htmlFor="promotional">Promotional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="productphares"
                    checked={formData.isProductphares}
                    onCheckedChange={(checked) => handleInputChange("isProductphares", checked)}
                  />
                  <Label htmlFor="productphares">Product Phares</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="productFlash"
                    checked={formData.isProductFlash}
                    onCheckedChange={(checked) => handleInputChange("isProductFlash", checked)}
                  />
                  <Label htmlFor="productFlash">Product Flash</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  {categoriesLoading || categoriesError ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              {category.image && (
                                <img
                                  src={category.image || "/placeholder.svg"}
                                  alt={category.name}
                                  className="w-4 h-4 rounded object-cover"
                                />
                              )}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  {brandsLoading || brandsError ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={formData.brandId} onValueChange={(value) => handleInputChange("brandId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            <div className="flex items-center space-x-2">
                              {brand.logo && (
                                <img
                                  src={brand.logo || "/Placeholder.png"}
                                  alt={brand.name}
                                  className="w-4 h-4 rounded object-cover"
                                />
                              )}
                              <span>{brand.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Set the main image and add additional product image URLs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainImage">Main Image URL *</Label>
                  <Input
                    id="mainImage"
                    placeholder="Enter main image URL"
                    value={formData.mainImage}
                    onChange={(e) => handleInputChange("mainImage", e.target.value)}
                    required
                  />
                  {formData.mainImage && (
                    <div className="relative group">
                      <img
                        src={formData.mainImage}
                        alt="Main product image"
                        className="w-full h-32 object-cover rounded border mt-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=128&width=100%"
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter additional image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                    />
                    <Button type="button" onClick={addImageUrl} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.images.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No additional images added yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Additional product image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=80&width=80"
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(url)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}