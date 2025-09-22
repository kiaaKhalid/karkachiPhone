"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Loader2, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import EditProductPopup from "@/components/admin/edit-product-popup"

interface AllProduct {
  id: number
  name: string
  description: string
  price: number
  rating: number
  reviewCount: number
  brand: string
  imageUrl: string
  isActive: boolean
  stock: number | null // Allow null to match backend
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AllProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(25)
  const [searchTerm, setSearchTerm] = useState("")
  const [brandFilter, setBrandFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [toggleLoading, setToggleLoading] = useState<number | null>(null)
  const { toast } = useToast()
  const [editPopupOpen, setEditPopupOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  const fetchProducts = async (page = 0, size = 25) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/products/all?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data: PageResponse<AllProduct> = await response.json()

      setProducts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setCurrentPage(data.number)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(currentPage, pageSize)
  }, [currentPage, pageSize])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = brandFilter === "all" || product.brand.toLowerCase() === brandFilter.toLowerCase()

    return matchesSearch && matchesBrand
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "rating-high":
        return b.rating - a.rating
      case "rating-low":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  const productStats = {
    total: totalElements,
    totalValue: products.reduce((sum, product) => sum + product.price, 0),
    avgRating: products.length > 0 ? products.reduce((sum, product) => sum + product.rating, 0) / products.length : 0,
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleToggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      setToggleLoading(productId)

      const action = currentStatus ? "deactivate" : "activate"
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/products/${productId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} product`)
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === productId ? { ...product, isActive: !currentStatus } : product)),
      )

      toast({
        title: "Success",
        description: `Product ${currentStatus ? "deactivated" : "activated"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${currentStatus ? "deactivate" : "activate"} product`,
        variant: "destructive",
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const handleEditProduct = (productId: number) => {
    setSelectedProductId(productId)
    setEditPopupOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">{loading ? "Loading..." : `${totalElements} products total`}</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="col-span-full">
          <Input
            placeholder="Search products..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="brand">Brand</Label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="samsung">Samsung</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="huawei">Huawei</SelectItem>
              <SelectItem value="sony">Sony</SelectItem>
              <SelectItem value="lg">LG</SelectItem>
              <SelectItem value="panasonic">Panasonic</SelectItem>
              <SelectItem value="microsoft">Microsoft</SelectItem>
              <SelectItem value="dell">Dell</SelectItem>
              <SelectItem value="hp">HP</SelectItem>
              <SelectItem value="lenovo">Lenovo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="rating-high">Rating High-Low</SelectItem>
              <SelectItem value="rating-low">Rating Low-High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => fetchProducts(currentPage, pageSize)} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || error ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Image
                      src={product.imageUrl && product.imageUrl.trim() !== "" ? product.imageUrl : "/Placeholder.png"}
                      alt={product.name || "Product image"}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/Placeholder.png?height=40&width=40"
                      }}
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{formatCurrency(product.price)} MAD</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        product.stock == null
                          ? "text-gray-500"
                          : product.stock <= 10
                            ? "text-red-500"
                            : product.stock <= 50
                              ? "text-yellow-500"
                              : "text-green-500"
                      }`}
                    >
                      {product.stock ?? "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.reviewCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id.toString())}>
                          Copy product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                          className={product.isActive ? "text-red-600" : "text-green-600"}
                          disabled={toggleLoading === product.id}
                        >
                          {toggleLoading === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {product.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
            {totalElements} products
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EditProductPopup isOpen={editPopupOpen} onClose={() => setEditPopupOpen(false)} productId={selectedProductId} />
    </div>
  )
}
