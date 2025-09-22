"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Package, Search, Download, Plus, Minus } from "lucide-react"

const inventoryData = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    sku: "IPH15PM-256-TB",
    category: "Smartphones",
    currentStock: 15,
    minStock: 10,
    maxStock: 100,
    reserved: 3,
    available: 12,
    cost: 999,
    value: 14985,
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SGS24U-512-BK",
    category: "Smartphones",
    currentStock: 5,
    minStock: 10,
    maxStock: 80,
    reserved: 1,
    available: 4,
    cost: 899,
    value: 4495,
    status: "Low Stock",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "MacBook Pro 16-inch",
    sku: "MBP16-1TB-SG",
    category: "Laptops",
    currentStock: 0,
    minStock: 5,
    maxStock: 30,
    reserved: 0,
    available: 0,
    cost: 2499,
    value: 0,
    status: "Out of Stock",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Apple Watch Ultra 2",
    sku: "AWU2-49-TI",
    category: "Smartwatches",
    currentStock: 25,
    minStock: 15,
    maxStock: 60,
    reserved: 2,
    available: 23,
    cost: 799,
    value: 19975,
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const getStatusBadge = (status: string, currentStock: number, minStock: number) => {
    if (currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (currentStock <= minStock) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          In Stock
        </Badge>
      )
    }
  }

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase().replace(" ", "") === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0)
  const lowStockItems = inventoryData.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > 0,
  ).length
  const outOfStockItems = inventoryData.filter((item) => item.currentStock === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your product inventory</p>
        </div>
        <Button className="bg-[#01A0EA] hover:bg-[#0190D4]">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>View and manage your product inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="lowstock">Low Stock</SelectItem>
                <SelectItem value="outofstock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="smartphones">Smartphones</SelectItem>
                <SelectItem value="laptops">Laptops</SelectItem>
                <SelectItem value="smartwatches">Smartwatches</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${
                            item.currentStock === 0
                              ? "text-red-600"
                              : item.currentStock <= item.minStock
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {item.currentStock}
                        </span>
                        <span className="text-gray-400 text-sm">/ {item.maxStock}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.available}</TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell>{getStatusBadge(item.status, item.currentStock, item.minStock)}</TableCell>
                    <TableCell>${item.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Minus className="h-3 w-3" />
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
    </div>
  )
}
