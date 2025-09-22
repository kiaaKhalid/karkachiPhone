"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Edit, UserPlus, Shield, User, UserCheck, UserX } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditUserPopup from "@/components/admin/edit-user-popup"

interface UserDTO {
  id: number
  name: string
  email: string
  imageUrl?: string
  phone?: string
  role: string
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  authProvider?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
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

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "USER" as string,
    password: "",
  })
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole !== "all" && { role: filterRole }),
        ...(filterStatus !== "all" && { status: filterStatus === "active" ? "true" : "false" }),
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data: PageResponse<UserDTO> = await response.json()
      setUsers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const action = currentStatus ? "deactivate" : "activate"
      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/super-admin/users/${userId}/${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)))

      toast({
        title: "Success",
        description: `User ${action}d successfully`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to update user status`,
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    // TODO: Implement role change API call
    toast({
      title: "Info",
      description: "Role change functionality will be implemented",
    })
  }

  const handleAddUser = async () => {
    if (user?.role !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only Super Admins can create new users",
        variant: "destructive",
      })
      return
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password,
          isActive: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`)
      }

      const createdUser: UserDTO = await response.json()

      setUsers([createdUser, ...users])

      toast({
        title: "Success ✅",
        description: `User "${createdUser.name}" created successfully`,
      })

      setNewUser({ name: "", email: "", role: "USER", password: "" })
      setIsAddingUser(false)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: UserDTO) => {
    setEditingUser(user)
    setIsEditingUser(true)
  }

  const handleUserUpdated = (updatedUser: any) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)))
    setIsEditingUser(false)
    setEditingUser(null)
  }

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filterRole, filterStatus])

  const UserTableSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          {user?.role === "super_admin" && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient-blue mb-2">User Management</h1>
            <p className="text-lg text-high-contrast">Manage user accounts, roles, and permissions</p>
          </div>
          {user?.role === "super_admin" && (
            <Button className="btn-primary rounded-xl" onClick={() => setIsAddingUser(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>

        <Card className="glass border-visible shadow-elegant mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl border-visible"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="rounded-xl border-visible">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
                    <SelectItem value="LIVREUR">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="rounded-xl border-visible">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-visible shadow-elegant">
          <CardHeader>
            <CardTitle className="text-high-contrast">Users ({loading ? "..." : totalElements})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <UserTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-visible">
                      <th className="text-left py-3 px-2 text-high-contrast font-semibold">User</th>
                      <th className="text-left py-3 px-2 text-high-contrast font-semibold">Email</th>
                      <th className="text-left py-3 px-2 text-high-contrast font-semibold">Role</th>
                      <th className="text-left py-3 px-2 text-high-contrast font-semibold">Status</th>
                      <th className="text-left py-3 px-2 text-high-contrast font-semibold">Verified</th>
                      {user?.role === "super_admin" && (
                        <th className="text-left py-3 px-2 text-high-contrast font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-visible hover:bg-secondary/50">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            {u.imageUrl ? (
                              <img
                                src={u.imageUrl || "/placeholder.svg"}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {u.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-high-contrast">{u.name}</div>
                              <div className="text-sm text-medium-contrast">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-high-contrast">{u.email}</td>
                        <td className="py-4 px-2">
                          <Select
                            value={u.role}
                            onValueChange={(value: string) => handleRoleChange(u.id, value)}
                            disabled={u.id === Number(user?.id)}
                          >
                            <SelectTrigger className="w-32 rounded-lg border-visible">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="ADMIN">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="SUPER_ADMIN">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  Super Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="LIVREUR">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-500" />
                                  Delivery
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-2">
                          <Badge
                            variant={u.isActive ? "default" : "secondary"}
                            className={`rounded-full ${
                              u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-1">
                            {u.emailVerified && (
                              <Badge variant="outline" className="text-xs">
                                Email ✓
                              </Badge>
                            )}
                            {u.phoneVerified && (
                              <Badge variant="outline" className="text-xs">
                                Phone ✓
                              </Badge>
                            )}
                          </div>
                        </td>
                        {user?.role === "super_admin" && (
                          <td className="py-4 px-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg bg-transparent"
                                onClick={() => handleEditUser(u)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={u.isActive ? "destructive" : "default"}
                                size="sm"
                                className="rounded-lg"
                                onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                disabled={u.id === Number(user?.id)}
                              >
                                {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-medium-contrast">
                  Showing {users.length} of {totalElements} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account (Super Admin only)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-high-contrast mb-2 block">Name *</label>
                <Input
                  placeholder="Enter user name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="rounded-xl border-visible"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-high-contrast mb-2 block">Email *</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="rounded-xl border-visible"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-high-contrast mb-2 block">Password *</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="rounded-xl border-visible"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-high-contrast mb-2 block">Role</label>
                <Select value={newUser.role} onValueChange={(value: string) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="rounded-xl border-visible">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="SUPER_ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        Super Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="LIVREUR">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        Delivery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingUser(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="btn-primary rounded-xl">
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EditUserPopup
          isOpen={isEditingUser}
          onClose={() => {
            setIsEditingUser(false)
            setEditingUser(null)
          }}
          user={editingUser}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </div>
  )
}
