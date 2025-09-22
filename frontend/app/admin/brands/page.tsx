"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Tag, Power, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AddBrandDialog from "@/components/admin/add-brand-dialog"
import EditBrandDialog from "@/components/admin/edit-brand-dialog"

interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  bannerUrl: string
  website: string
  country: string
  founded: number
  productCount: number
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BrandResponseDTO {
  success: boolean
  brands: Brand[]
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
  metadata: {
    totalCount: number
    activeCount: number
    inactiveCount: number
    featuredCount: number
  }
}

interface BrandVDTO {
  name: string
  slug: string
  description: string
  logo: string
  website: string
  sorteOrder: number
  isActive: boolean
  isFeatured: boolean
}

export default function BrandsPage() {
  const { toast } = useToast()

  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [loadingBrands, setLoadingBrands] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<BrandVDTO>({
    name: "",
    slug: "",
    description: "",
    logo: "",
    website: "",
    sorteOrder: 0,
    isActive: true,
    isFeatured: false,
  })

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/brands?includeProducts=false&includeCount=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch brands")
      }
      const data: BrandResponseDTO = await response.json()
      if (data.success) {
        setBrands(data.brands)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditBrand = async () => {
    if (!selectedBrand || !formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Brand name and slug are required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/brands/${selectedBrand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update brand")
      }

      // Refresh the brands list
      await fetchBrands()

      // Reset form
      setFormData({
        name: "",
        slug: "",
        description: "",
        logo: "",
        website: "",
        sorteOrder: 0,
        isActive: true,
        isFeatured: false,
      })
      setIsEditDialogOpen(false)
      setSelectedBrand(null)

      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update brand",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (brandId: string, currentStatus: boolean) => {
    setLoadingBrands((prev) => new Set(prev).add(brandId))

    try {
      const endpoint = currentStatus
        ? `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/brands/${brandId}/deactivate`
        : `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/brands/${brandId}/activate`
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to update brand status")
      }

      // Update local state
      setBrands(brands.map((brand) => (brand.id === brandId ? { ...brand, isActive: !currentStatus } : brand)))

      toast({
        title: "Success",
        description: currentStatus ? "Brand deactivated successfully" : "Brand activated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brand status",
        variant: "destructive",
      })
    } finally {
      setLoadingBrands((prev) => {
        const newSet = new Set(prev)
        newSet.delete(brandId)
        return newSet
      })
    }
  }

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading brands...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product brands and their status</p>
        </div>
        <AddBrandDialog onBrandAdded={fetchBrands} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
            <Tag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{brands.filter((b) => b.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Brands</CardTitle>
            <Tag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{brands.filter((b) => !b.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.reduce((sum, brand) => sum + brand.productCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>Manage your brands, toggle their status, and edit their information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Brands Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={brand.logoUrl || "/Placeholder.png"}
                          alt={brand.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{brand.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{brand.description}</div>
                    </TableCell>
                    <TableCell>
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#01A0EA] hover:underline"
                        >
                          Visit
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{brand.productCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {brand.isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                              Inactive
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(brand)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(brand.id, brand.isActive)}
                          disabled={loadingBrands.has(brand.id)}
                          className={
                            loadingBrands.has(brand.id)
                              ? "text-gray-400"
                              : brand.isActive
                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }
                        >
                          {loadingBrands.has(brand.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditBrandDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        brand={selectedBrand}
        onBrandUpdated={fetchBrands}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  )
}
