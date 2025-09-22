"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Search, Plus, Edit, Trash2, Copy } from "lucide-react"

const coupons = [
  {
    id: "1",
    code: "WELCOME20",
    description: "Welcome discount for new customers",
    type: "Percentage",
    value: 20,
    minOrder: 100,
    maxDiscount: 50,
    usageLimit: 1000,
    usageCount: 245,
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    code: "SAVE50",
    description: "Fixed $50 discount",
    type: "Fixed",
    value: 50,
    minOrder: 200,
    maxDiscount: null,
    usageLimit: 500,
    usageCount: 89,
    isActive: true,
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    code: "FLASH15",
    description: "Flash sale 15% off",
    type: "Percentage",
    value: 15,
    minOrder: 50,
    maxDiscount: 30,
    usageLimit: 200,
    usageCount: 156,
    isActive: false,
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    createdAt: "2024-01-10",
  },
]

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && coupon.isActive) ||
      (statusFilter === "inactive" && !coupon.isActive)
    const matchesType = typeFilter === "all" || coupon.type.toLowerCase() === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (isActive: boolean, endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)

    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    } else if (end < now) {
      return <Badge variant="destructive">Expired</Badge>
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Active
        </Badge>
      )
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "Percentage" ? (
      <Badge variant="outline" className="bg-blue-100 text-blue-800">
        %
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-100 text-purple-800">
        $
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const activeCoupons = coupons.filter((c) => c.isActive).length
  const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons & Discounts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage discount codes and promotional offers</p>
        </div>
        <Button className="bg-[#01A0EA] hover:bg-[#0190D4]">
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">All coupon codes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCoupons}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Usage Rate</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalUsage / coupons.reduce((sum, c) => sum + c.usageLimit, 0)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Usage percentage</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Codes</CardTitle>
          <CardDescription>Manage your discount codes and promotional offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search coupons..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium">{coupon.code}</span>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{coupon.description}</TableCell>
                    <TableCell>{getTypeBadge(coupon.type)}</TableCell>
                    <TableCell className="font-medium">
                      {coupon.type === "Percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{coupon.usageCount}</span>
                        <span className="text-gray-400">/ {coupon.usageLimit}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon.isActive, coupon.endDate)}</TableCell>
                    <TableCell className="text-sm">{formatDate(coupon.endDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-3 w-3" />
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
