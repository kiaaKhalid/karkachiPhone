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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, X, Upload, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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

interface SpecDTO {
  name: string
  value: string
}

interface ProductCreateRequest {
  name: string
  brand: string
  category: string
  sku: string
  description: string
  price: number
  originalPrice?: number
  isOnPromotion: boolean
  promotionEndDate?: string
  stock: number
  images: string[]
  specs: SpecDTO[]
  tags: string[]
  isActive: boolean
  costPrice?: number
  barcode?: string
  weight?: number
  dimensions?: string
  isFeatured: boolean
  isDigital: boolean
  requiresShipping: boolean
  minStock?: number
  maxStock?: number
  imei?: string
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
    category: "",
    brand: "",
    stock: "",
    sku: "",
    isActive: true,
    isOnPromotion: false,
    promotionEndDate: "",
    images: [] as string[],
    specs: [] as SpecDTO[],
    tags: [] as string[],
    costPrice: "",
    barcode: "",
    weight: "",
    dimensions: "",
    isFeatured: false,
    isDigital: false,
    requiresShipping: true,
    minStock: "",
    maxStock: "",
    imei: "",
  })

  const [newSpec, setNewSpec] = useState({ name: "", value: "" })
  const [newTag, setNewTag] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true)
      setBrandsError(false)
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/logo/brands", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: BrandLogo[] = await response.json()
      setBrands(data)
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
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/category/all", {
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
    if (newSpec.name && newSpec.value) {
      setFormData((prev) => ({
        ...prev,
        specs: [...prev.specs, { name: newSpec.name, value: newSpec.value }],
      }))
      setNewSpec({ name: "", value: "" })
    }
  }

  const removeSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
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

    if (!formData.name || !formData.sku || !formData.price || !formData.category || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const requestData: ProductCreateRequest = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        sku: formData.sku,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        isOnPromotion: formData.isOnPromotion,
        promotionEndDate: formData.promotionEndDate || undefined,
        stock: Number.parseInt(formData.stock),
        images: formData.images,
        specs: formData.specs,
        tags: formData.tags,
        isActive: formData.isActive,
        costPrice: formData.costPrice ? Number.parseFloat(formData.costPrice) : undefined,
        barcode: formData.barcode || undefined,
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        dimensions: formData.dimensions || undefined,
        isFeatured: formData.isFeatured,
        isDigital: formData.isDigital,
        requiresShipping: formData.requiresShipping,
        minStock: formData.minStock ? Number.parseInt(formData.minStock) : undefined,
        maxStock: formData.maxStock ? Number.parseInt(formData.maxStock) : undefined,
        imei: formData.imei || undefined,
      }

      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/products", {
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
    <div className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                    placeholder="Enter barcode"
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
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange("costPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange("minStock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Max Stock</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange("maxStock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="promotion"
                    checked={formData.isOnPromotion}
                    onCheckedChange={(checked) => handleInputChange("isOnPromotion", checked)}
                  />
                  <Label htmlFor="promotion">On Promotion</Label>
                </div>
                {formData.isOnPromotion && (
                  <div className="space-y-2">
                    <Label htmlFor="promotionEndDate">Promotion End Date</Label>
                    <Input
                      id="promotionEndDate"
                      type="datetime-local"
                      value={formData.promotionEndDate}
                      onChange={(e) => handleInputChange("promotionEndDate", e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
                <CardDescription>Set physical characteristics of the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange("dimensions", e.target.value)}
                      placeholder="e.g., 10 x 5 x 2 cm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imei">IMEI (International Mobile Equipment Identity)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="imei"
                      value={formData.imei}
                      onChange={(e) => handleInputChange("imei", e.target.value)}
                      placeholder="Enter IMEI number (15 digits)"
                      maxLength={15}
                      pattern="[0-9]{15}"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const randomImei = Math.floor(Math.random() * 1000000000000000)
                          .toString()
                          .padStart(15, "0")
                        handleInputChange("imei", randomImei)
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">IMEI is required for mobile phones and cellular devices</p>
                </div>
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
                    placeholder="Specification name"
                    value={newSpec.name}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, name: e.target.value }))}
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
                        <strong>{spec.name}:</strong> {spec.value}
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
                    id="digital"
                    checked={formData.isDigital}
                    onCheckedChange={(checked) => handleInputChange("isDigital", checked)}
                  />
                  <Label htmlFor="digital">Digital Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shipping"
                    checked={formData.requiresShipping}
                    onCheckedChange={(checked) => handleInputChange("requiresShipping", checked)}
                  />
                  <Label htmlFor="shipping">Requires Shipping</Label>
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
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
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
                  <Label htmlFor="brand">Brand</Label>
                  {brandsLoading || brandsError ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={formData.brand} onValueChange={(value) => handleInputChange("brand", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.name}>
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
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help customers find this product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Add product image URLs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter image URL"
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
                        No images added yet. Add image URLs above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
