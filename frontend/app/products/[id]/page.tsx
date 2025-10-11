"use client"

import { useEffect, useState } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, MessageCircle, Plus, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/hooks/use-cart"

interface ProductImageResponse {
  url: string
}

interface ProductSpecResponse {
  key: string
  value: string
}

interface ReviewItemResponse {
  id: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  userName: string
  userImage: string | null
  isMine: boolean
}

interface ReviewsResponse {
  success: true
  message: string
  data: {
    items: ReviewItemResponse[]
    total: number
    page: number
    limit: number
  }
}

interface ProductDetailResponse {
  success: true
  message: string
  data: {
    id: string
    name: string
    description: string
    price: number
    priceOriginal?: number
    stock: number
    images: ProductImageResponse[]
    specs: ProductSpecResponse[]
  }
}

interface ProductReviewDTO {
  id: string
  userName: string
  userImage: string | null
  comment: string
  rating: number
  createdAt: string
  isMine: boolean
}

function ModernImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const safeImages = images || []

  useEffect(() => {
    if (safeImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % safeImages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [safeImages.length])

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-card">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {safeImages.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              src={image || "/Placeholder.png"}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {safeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function ModernProductInfo({ product, averageRating, totalReviews }: { product: any; averageRating: number; totalReviews: number }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const url = process.env.NEXT_PUBLIC_API_URL as string

  const whatsappMessage = `Salut! Je suis intéressé par ${product.name} - ${product.price} MAD`
  const whatsappUrl = `https://wa.me/+212676423340?text=${encodeURIComponent(whatsappMessage)}`

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/Placeholder.png",
      category: undefined,
      brand: undefined,
    })
  }

  const handleWhatsAppOrder = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      alert("Veuillez vous connecter pour commander.")
      return
    }

    setOrderSubmitting(true)
    try {
      const response = await fetch(`${url}/person/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Échec de la création de la commande")
      }

      const data = await response.json()
      const orderId = data.data.id
      const total = data.data.total

      // Construct WhatsApp message with order details
      const orderMessage = `Salut! J'ai créé une commande pour ${product.name}.\nNuméro de commande: ${orderId}\nTotal: ${total} MAD\nPouvez-vous confirmer et procéder au paiement?`
      const orderWhatsAppUrl = `https://wa.me/1234567890?text=${encodeURIComponent(orderMessage)}`

      // Redirect to WhatsApp
      window.open(orderWhatsAppUrl, "_blank")
    } catch (err) {
      console.error("Erreur lors de la commande:", err)
      alert("Erreur lors de la création de la commande. Veuillez réessayer.")
    } finally {
      setOrderSubmitting(false)
    }
  }

  const savePrice = product.priceOriginal ? (product.priceOriginal - product.price).toFixed(2) : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-muted-foreground">({totalReviews} avis)</span>
          </div>
          {product.isOnPromotion && <Badge variant="destructive">Promotion</Badge>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-primary">{product.price} MAD</span>
          {product.priceOriginal && (
            <span className="text-xl text-muted-foreground line-through">{product.priceOriginal} MAD</span>
          )}
          {savePrice && <Badge variant="secondary">Économisez {savePrice} MAD</Badge>}
        </div>
        <p className="text-muted-foreground">Stock: {product.stock} disponible</p>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-foreground leading-relaxed">{product.description}</p>
      </div>

      <div className="space-y-3 md:space-y-0 md:flex md:space-x-4 pt-4">
        <Button
          size="lg"
          className="w-full md:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ajouter au Panier
        </Button>
        <Button
          size="lg"
          className="w-full md:flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={handleWhatsAppOrder}
          disabled={orderSubmitting}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          {orderSubmitting ? "Création..." : "Commander via WhatsApp"}
        </Button>
      </div>
    </div>
  )
}

function ModernReviews({ productId, averageRating, totalReviews, onReviewsUpdate }: { 
  productId: string 
  averageRating: number 
  totalReviews: number 
  onReviewsUpdate: (newAverage: number, newTotal: number) => void 
}) {
  const [reviews, setReviews] = useState<ProductReviewDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [submitting, setSubmitting] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const reviewsPerPage = 6
  const url = process.env.NEXT_PUBLIC_API_URL as string

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsAuthenticated(!!token)
  }, [])

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: reviewsPerPage.toString(),
      })

      const response = await fetch(
        `${url}/public/reviews/products/${productId}?${params}`,
      )

      if (!response.ok) {
        throw new Error("Échec du chargement des avis")
      }

      const reviewsData: ReviewsResponse = await response.json()
      const mappedReviews: ProductReviewDTO[] = (reviewsData.data.items || []).map((item: ReviewItemResponse) => ({
        id: item.id,
        userName: item.userName,
        userImage: item.userImage,
        comment: item.comment,
        rating: item.rating,
        createdAt: item.createdAt,
        isMine: item.isMine,
      }))
      setReviews(mappedReviews)
      setTotalPages(Math.ceil(reviewsData.data.total / reviewsPerPage))
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
      setReviews([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchReviews(1)
    }
  }, [productId])

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      setSubmitError("Le commentaire est requis")
      return
    }

    if (!isAuthenticated) {
      setShowErrorPopup(true)
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      const token = localStorage.getItem("authToken")

      const reviewData = {
        productId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      }

      const response = await fetch(`${url}/person/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        setShowErrorPopup(true)
        return
      }

      await fetchReviews(currentPage)
      onReviewsUpdate(averageRating, totalReviews + 1) // Update totals

      setShowAddReview(false)
      setNewReview({ rating: 5, comment: "" })
    } catch (err) {
      setShowErrorPopup(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!isAuthenticated) return

    try {
      setDeletingReviewId(reviewId)
      const token = localStorage.getItem("authToken")

      const response = await fetch(`${url}/person/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage)
        onReviewsUpdate(averageRating, totalReviews - 1) // Update totals
      }
    } catch (err) {
      console.error("Failed to delete review:", err)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const goToPrevious = () => currentPage > 1 && setCurrentPage(prev => prev - 1) && fetchReviews(currentPage - 1)
  const goToNext = () => currentPage < totalPages && setCurrentPage(prev => prev + 1) && fetchReviews(currentPage + 1)

  return (
    <div className="space-y-6">
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-destructive">Impossible d'ajouter un avis</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowErrorPopup(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-foreground mb-4">Tu n'as pas le droit d'ajouter un avis</p>
              <Button onClick={() => setShowErrorPopup(false)} className="w-full">
                Compris
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avis Clients</h2>
          <p className="text-muted-foreground text-sm">{totalReviews || 0} avis</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowAddReview(!showAddReview)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un Avis
          </Button>
        )}
      </div>

      {showAddReview && isAuthenticated && (
        <Card className="border-accent/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Écrire un Avis</h3>

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note *</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                      disabled={submitting}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commentaire *</label>
                <Textarea
                  placeholder="Écrivez votre avis..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmitReview}
                  className="bg-primary"
                  disabled={submitting || !newReview.comment.trim()}
                >
                  {submitting ? "Envoi en cours..." : "Envoyer l'Avis"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddReview(false)
                    setSubmitError(null)
                  }}
                  disabled={submitting}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Erreur lors du chargement des avis: {error}</p>
            <Button variant="outline" onClick={() => fetchReviews(currentPage)} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.userImage || "/Placeholder.png?height=32&width=32"}
                          alt={review.userName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="font-medium text-foreground text-sm truncate">{review.userName}</span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {isAuthenticated && review.isMine && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingReviewId === review.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-foreground text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Aucun avis pour le moment. Soyez le premier à donner votre avis sur ce produit!
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={goToPrevious} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ModernSpecs({ specs }: { specs: any[] }) {
  const safeSpecs = specs || []

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Spécifications</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeSpecs.map((spec, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
              >
                <span className="font-medium text-foreground">{spec.key}</span>
                <span className="text-muted-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Skeleton className="w-full h-96 md:h-[500px] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>

        <div className="mb-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductDetailResponse["data"] | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewsResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const url = process.env.NEXT_PUBLIC_API_URL as string

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${url}/public/products/${params.id}`,
        )

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error("Failed to fetch product")
        }

        const productResponse: ProductDetailResponse = await response.json()
        setProduct(productResponse.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      if (!params.id) return

      try {
        const paramsStr = new URLSearchParams({
          page: "1",
          limit: "100", // Fetch more to compute average
        }).toString()

        const response = await fetch(
          `${url}/public/reviews/products/${params.id}?${paramsStr}`,
        )

        if (response.ok) {
          const reviewsResponse: ReviewsResponse = await response.json()
          setReviewsData(reviewsResponse.data)

          const ratings = reviewsResponse.data.items.map((item: ReviewItemResponse) => item.rating)
          const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
          setAverageRating(avg)
          setTotalReviews(reviewsResponse.data.total)
        }
      } catch (err) {
        console.error("Failed to fetch reviews for average:", err)
      }
    }

    fetchProduct()
    fetchReviews()
  }, [params.id])

  if (loading || error) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    notFound()
  }

  const mappedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    priceOriginal: product.priceOriginal,
    stock: product.stock,
    image: product.images?.[0]?.url || "/Placeholder.png",
    isOnPromotion: !!product.priceOriginal,
    specs: product.specs || [],
  }

  const productImages = product.images?.map((img) => img.url) || [mappedProduct.image]

  const handleReviewsUpdate = (newAvg: number, newTotal: number) => {
    setAverageRating(newAvg)
    setTotalReviews(newTotal)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ModernImageCarousel images={productImages} />
          <ModernProductInfo product={mappedProduct} averageRating={averageRating} totalReviews={totalReviews} />
        </div>

        <section className="mb-12">
          <ModernSpecs specs={mappedProduct.specs} />
        </section>

        <section>
          <ModernReviews 
            productId={product.id} 
            averageRating={averageRating} 
            totalReviews={totalReviews} 
            onReviewsUpdate={handleReviewsUpdate} 
          />
        </section>
      </div>
    </div>
  )
}