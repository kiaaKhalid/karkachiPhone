"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, MessageCircle, Plus, X, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/hooks/use-cart"

interface ProductImageResponse {
  id: number
  image: string
}

interface ProductSpecificationResponse {
  id: number
  specName: string
  specValue: string
  sortOrder: number | null
}

interface ReviewProductResponse {
  id: number
  title: string
  comment: string
  rating: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
}

interface ProductDetaileResponse {
  id: number
  name: string
  description: string
  shortDescription: string | null
  price: number
  comparePrice: string
  costPrice: string
  savePrice: string
  brand: string
  category: string | null
  stock: number
  rating: string
  reviewCount: string
  image: string | null
  images: ProductImageResponse[]
  specifications: ProductSpecificationResponse[]
  reviews: ReviewProductResponse[]
  isOnPromotion: boolean
  promotionEndDate: string | null
  createdAt: string
  updatedAt: string
}

interface ProductReviewDTO {
  id: number
  nameUser: string
  imageUser: string
  title: string
  comment: string
  imageData: string
  rating: number
  dateCreation: string
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

function ModernProductInfo({ product }: { product: any }) {
  const { addItem } = useCart()

  const whatsappMessage = `Salut! Je suis intéressé par ${product.name} - ${product.price} MAD`
  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/Placeholder.png",
      category: product.category,
      brand: product.brand,
    })
  }

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
                  i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-muted-foreground">({product.reviews} avis)</span>
          </div>
          {product.isOnPromotion && <Badge variant="destructive">Promotion</Badge>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-primary">{product.price} MAD</span>
          {product.comparePrice && (
            <span className="text-xl text-muted-foreground line-through">{product.comparePrice} MAD</span>
          )}
          {product.savePrice && <Badge variant="secondary">Économisez {product.savePrice} MAD</Badge>}
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
          variant="outline"
          className="w-full md:flex-1 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
          onClick={() => window.open(whatsappUrl, "_blank")}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Commander via WhatsApp
        </Button>
      </div>
    </div>
  )
}

function ModernReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReviewDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "", wouldRecommend: true })
  const [submitting, setSubmitting] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsAuthenticated(!!token)
    if (token) {
      fetchCurrentUser(token)
    }
  }, [])

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err)
    }
  }

  const fetchReviews = async (page = 0) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/reviews/product/${productId}`,
      )

      if (!response.ok) {
        throw new Error("Échec du chargement des avis")
      }

      const reviewsData: ProductReviewDTO[] = await response.json()
      setReviews(reviewsData || [])
      setTotalReviews(reviewsData?.length || 0)
      setTotalPages(1) // Since it's not paginated
      setCurrentPage(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
      setReviews([])
      setTotalPages(0)
      setTotalReviews(0)
      setCurrentPage(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchReviews(0)
    }
  }, [productId])

  const handleSubmitReview = async () => {
    if (!newReview.title.trim()) {
      setSubmitError("Le titre est requis")
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
        productId: Number.parseInt(productId),
        rating: newReview.rating,
        title: newReview.title.trim(),
        comment: newReview.comment.trim(),
        wouldRecommend: newReview.wouldRecommend,
      }

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/user/reviews`, {
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

      await fetchReviews(0)
      setCurrentPage(0)

      setShowAddReview(false)
      setNewReview({ rating: 5, title: "", comment: "", wouldRecommend: true })
    } catch (err) {
      setShowErrorPopup(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!isAuthenticated) return

    try {
      setDeletingReviewId(reviewId)
      const token = localStorage.getItem("authToken")

      const response = await fetch(`https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/user/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchReviews(currentPage)
      }
    } catch (err) {
      console.error("Failed to delete review:", err)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const isUserReview = (review: ProductReviewDTO) => {
    return (
      currentUser &&
      (currentUser.name === review.nameUser || currentUser.email === review.nameUser || currentUser.id === review.id)
    )
  }

  const handlePageChange = (page: number) => {
    fetchReviews(page)
  }

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
                <label className="block text-sm font-medium mb-2">Titre *</label>
                <Input
                  placeholder="Titre de l'avis"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commentaire</label>
                <Textarea
                  placeholder="Écrivez votre avis..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={newReview.wouldRecommend}
                  onChange={(e) => setNewReview({ ...newReview, wouldRecommend: e.target.checked })}
                  disabled={submitting}
                  className="rounded border-gray-300"
                />
                <label htmlFor="wouldRecommend" className="text-sm font-medium">
                  Je recommande ce produit
                </label>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmitReview}
                  className="bg-primary"
                  disabled={submitting || !newReview.title.trim()}
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
            {(reviews || []).length > 0 ? (
              (reviews || []).map((review) => (
                <Card key={review.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.imageUser || "/Placeholder.png?height=32&width=32"}
                          alt={review.nameUser}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="font-medium text-foreground text-sm truncate">{review.nameUser}</span>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (review.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {isAuthenticated && isUserReview(review) && (
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
                        {review.title && (
                          <h4 className="font-semibold text-foreground text-sm line-clamp-2">{review.title}</h4>
                        )}
                        <p className="text-foreground text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                      </div>

                      {review.imageData && (
                        <img
                          src={review.imageData || "/Placeholder.png"}
                          alt="Image de l'avis"
                          className="w-full h-24 object-cover rounded-md"
                        />
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.dateCreation).toLocaleDateString("fr-FR")}
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
                <span className="font-medium text-foreground">{spec.name}</span>
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
  const [product, setProduct] = useState<ProductDetaileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/products/${params.id}`,
        )

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error("Failed to fetch product")
        }

        const productData: ProductDetaileResponse = await response.json()
        setProduct(productData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading || error) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    notFound()
  }

  const mappedProduct = {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    comparePrice: product.comparePrice,
    savePrice: product.savePrice,
    brand: product.brand,
    category: product.category,
    stock: product.stock,
    rating: Number.parseFloat(product.rating) || 0,
    reviews: Number.parseInt(product.reviewCount) || 0,
    image: product.image,
    isOnPromotion: product.isOnPromotion,
    promotionEndDate: product.promotionEndDate,
    specs: (product.specifications || []).map((spec) => ({ name: spec.specName, value: spec.specValue })),
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image)
      : [product.image || "/Placeholder.png"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ModernImageCarousel images={productImages} />
          <ModernProductInfo product={mappedProduct} />
        </div>

        <section className="mb-12">
          <ModernSpecs specs={mappedProduct.specs} />
        </section>

        <section>
          <ModernReviews productId={product.id.toString()} />
        </section>
      </div>
    </div>
  )
}
