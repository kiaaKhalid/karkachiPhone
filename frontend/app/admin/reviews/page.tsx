"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Package,
} from "lucide-react"

interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string
  isVerified: number
  createdAt: string
  userName: string
  userImage: string | null
  productName: string
}

interface ReviewsResponse {
  success: boolean
  message: string
  data: {
    items: Review[]
    total: number
    page: number
    limit: number
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const url = process.env.NEXT_PUBLIC_API_URL
  const defaultUserImage = "https://i.ibb.co/C3R4f9gT/user.png"

  const fetchReviews = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setReviewsLoading(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${url}/admin/reviews?page=${page}&limit=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ReviewsResponse = await response.json()
      setReviews(data.data.items)
      setTotalPages(Math.ceil(data.data.total / pageSize))
      setTotalElements(data.data.total)
      setCurrentPage(data.data.page)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setError("Failed to load reviews")
    } finally {
      setLoading(false)
      setReviewsLoading(false)
    }
  }

  const getUserRole = () => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserRole(payload.role || "")
      } catch (error) {
        console.error("Error parsing token:", error)
      }
    }
  }

  useEffect(() => {
    getUserRole()
    fetchReviews()
  }, [])

  const handleVerifyReview = async (reviewId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${url}/admin/reviews/${reviewId}/verified`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage, true)
      } else {
        setError("Failed to verify review")
      }
    } catch (error) {
      console.error("Error verifying review:", error)
      setError("Failed to verify review")
    }
  }

  const handleUnverifyReview = async (reviewId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${url}/admin/reviews/${reviewId}/not-verified`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage, true)
      } else {
        setError("Failed to unverify review")
      }
    } catch (error) {
      console.error("Error unverifying review:", error)
      setError("Failed to unverify review")
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (userRole !== "SUPER_ADMIN") {
      setError("Only Super Admin can delete reviews")
      return
    }

    setReviewToDelete(reviewId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!reviewToDelete) return

    try {
      setIsDeleting(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${url}/super-admin/reviews/${reviewToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage, true)
        setDeleteDialogOpen(false)
        setReviewToDelete(null)
      } else {
        setError("Failed to delete review")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      setError("Failed to delete review")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && review.isVerified === 1) ||
      (statusFilter === "unverified" && review.isVerified === 0)

    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter

    return matchesSearch && matchesStatus && matchesRating
  })

  const stats = {
    total: totalElements,
    verified: reviews.filter((r) => r.isVerified === 1).length,
    unverified: reviews.filter((r) => r.isVerified === 0).length,
    averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
  }

  const getStatusBadge = (isVerified: number) => {
    if (isVerified === 1) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Verified
        </Badge>
      )
    } else {
      return <Badge variant="secondary">Unverified</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchReviews(newPage, true)
    }
  }

  const ReviewSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4 flex-1">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-3xl font-bold">Review Management</h1>
        <p className="text-muted-foreground">Manage customer reviews and ratings</p>
      </div>

      {/* Statistics Cards - Always visible */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unverified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setRatingFilter("all")
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button variant="outline" onClick={() => fetchReviews(currentPage, true)} disabled={reviewsLoading}>
              {reviewsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List - Shows loading state only for this section */}
      <div className="space-y-4">
        {reviewsLoading
          ? Array.from({ length: 5 }).map((_, i) => <ReviewSkeleton key={i} />)
          : filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <Avatar>
                        <AvatarImage src={review.userImage || defaultUserImage} alt={review.userName} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{review.userName}</h3>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">for {review.productName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          <span>ID: {review.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(review.isVerified)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Details</DialogTitle>
                            <DialogDescription>Full review information and moderation options</DialogDescription>
                          </DialogHeader>
                          {selectedReview && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{selectedReview.productName}</h3>
                                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Avatar>
                                    <AvatarImage src={selectedReview.userImage || defaultUserImage} alt={selectedReview.userName} />
                                    <AvatarFallback>
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">{selectedReview.userName}</h4>
                                    <p className="text-sm text-muted-foreground">User ID: {selectedReview.userId}</p>
                                  </div>
                                </div>
                                <p className="text-sm border-l-4 border-gray-200 pl-4 py-2">{selectedReview.comment}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Review ID:</strong> {selectedReview.id}
                                </div>
                                <div>
                                  <strong>Product ID:</strong> {selectedReview.productId}
                                </div>
                                <div>
                                  <strong>Created:</strong> {new Date(selectedReview.createdAt).toLocaleString()}
                                </div>
                                <div>
                                  <strong>Status:</strong> {selectedReview.isVerified === 1 ? "Verified" : "Unverified"}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {selectedReview.isVerified === 0 ? (
                                  <Button
                                    onClick={() => handleVerifyReview(selectedReview.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Verify
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUnverifyReview(selectedReview.id)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Unverify
                                  </Button>
                                )}
                                {userRole === "SUPER_ADMIN" && (
                                  <Button variant="outline" onClick={() => handleDeleteReview(selectedReview.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {review.isVerified === 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyReview(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleUnverifyReview(review.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {userRole === "SUPER_ADMIN" && (
                        <Button size="sm" variant="outline" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalElements)} of{" "}
            {totalElements} reviews
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || reviewsLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages))
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={reviewsLoading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || reviewsLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredReviews.length === 0 && !reviewsLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              No reviews match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}