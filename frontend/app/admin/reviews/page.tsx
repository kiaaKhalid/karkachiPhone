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
} from "lucide-react"

interface ProductReviewAdminDTO {
  idReview: number
  title: string
  comment: string
  rating: number
  createdAt: string
  isApproved: number | null
  nameUser: string
  emailUser: string
  urlUser: string
  nameProduct: string
  UrlProduct: string
}

interface PageResponse {
  content: ProductReviewAdminDTO[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviewAdminDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedReview, setSelectedReview] = useState<ProductReviewAdminDTO | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchReviews = async (page = 0, isRefresh = false) => {
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

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/reviews/all?page=${page}&size=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PageResponse = await response.json()
      setReviews(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setCurrentPage(data.number)
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

  const handleApproveReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/reviews/${reviewId}/approved`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage, true)
      } else {
        setError("Failed to approve review")
      }
    } catch (error) {
      console.error("Error approving review:", error)
      setError("Failed to approve review")
    }
  }

  const handleDisagreeReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/admin/reviews/${reviewId}/disagree`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage, true)
      } else {
        setError("Failed to disagree review")
      }
    } catch (error) {
      console.error("Error disagreeing review:", error)
      setError("Failed to disagree review")
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
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

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/super-admin/reviews/${reviewToDelete}`, {
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
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.nameUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.nameProduct.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && review.isApproved === 2.0) ||
      (statusFilter === "pending" && review.isApproved === 0.0) ||
      (statusFilter === "rejected" && review.isApproved === 1.0)

    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter

    return matchesSearch && matchesStatus && matchesRating
  })

  const stats = {
    total: totalElements,
    approved: reviews.filter((r) => r.isApproved === 2.0).length,
    pending: reviews.filter((r) => r.isApproved === 0.0).length,
    rejected: reviews.filter((r) => r.isApproved === 1.0).length,
    averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
  }

  const getStatusBadge = (isApproved: number | null) => {
    if (isApproved === 2.0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Approved
        </Badge>
      )
    } else if (isApproved === 0.0) {
      return <Badge variant="secondary">Pending</Badge>
    } else if (isApproved === 1.0) {
      return <Badge variant="destructive">Rejected</Badge>
    } else {
      return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              <Card key={review.idReview}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <Avatar>
                        <AvatarImage src={review.urlUser || "/Placeholder.png"} alt={review.nameUser} />
                        <AvatarFallback>{review.nameUser.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{review.nameUser}</h3>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{review.emailUser}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">for {review.nameProduct}</span>
                        </div>
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(review.isApproved)}
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
                                <img
                                  src={selectedReview.UrlProduct || "/Placeholder.png"}
                                  alt={selectedReview.nameProduct}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h3 className="font-semibold">{selectedReview.nameProduct}</h3>
                                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">{selectedReview.title}</h4>
                                <p className="text-sm">{selectedReview.comment}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>User:</strong> {selectedReview.nameUser}
                                </div>
                                <div>
                                  <strong>Email:</strong> {selectedReview.emailUser}
                                </div>
                                <div>
                                  <strong>Created:</strong> {new Date(selectedReview.createdAt).toLocaleString()}
                                </div>
                                <div>
                                  <strong>Status:</strong>{" "}
                                  {selectedReview.isApproved === 2.0
                                    ? "Approved"
                                    : selectedReview.isApproved === 1.0
                                      ? "Rejected"
                                      : selectedReview.isApproved === 0.0
                                        ? "Pending"
                                        : "Unknown"}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {selectedReview.isApproved === 0.0 && (
                                  <>
                                    <Button
                                      onClick={() => handleApproveReview(selectedReview.idReview)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDisagreeReview(selectedReview.idReview)}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {userRole === "SUPER_ADMIN" && (
                                  <Button variant="outline" onClick={() => handleDeleteReview(selectedReview.idReview)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {review.isApproved === 0.0 && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveReview(review.idReview)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDisagreeReview(review.idReview)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {userRole === "SUPER_ADMIN" && (
                        <Button size="sm" variant="outline" onClick={() => handleDeleteReview(review.idReview)}>
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
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
            {totalElements} reviews
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || reviewsLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 1))
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={reviewsLoading}
                  >
                    {pageNum + 1}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || reviewsLoading}
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
