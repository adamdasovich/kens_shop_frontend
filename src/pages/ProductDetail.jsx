// src/pages/ProductDetail.jsx
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react'
import { productService, commentService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [commentText, setCommentText] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey:['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id
})

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['product-comments', id],
    queryFn: () => commentService.getComments('product', id),
    enabled: !!id && isAuthenticated
})

  // Fetch ratings
  const { data: ratings } = useQuery({
    queryKey:['product-ratings', id],
    queryFn: () => commentService.getRatings(id),
    enabled: !!id && isAuthenticated
})

  // Fetch average rating
  const { data: averageRating } = useQuery({
    queryKey: ['product-average-rating', id],
    queryFn: () => commentService.getAverageRating(id),
    enabled: !!id
})

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData) => commentService.createComment({
      content: commentData.content,
      content_type: 'product',
      object_id: parseInt(id)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-comments', id])
      setCommentText('')
      toast.success('Comment added successfully!')
      },
      onError: () => {
        toast.error('Failed to add comment')
      }
    })

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: (ratingData) => commentService.createRating({
      content_type: 'product',
      object_id: parseInt(id),
      rating: ratingData.rating,
      review: ratingData.review
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-ratings', id])
      queryClient.invalidateQueries(['product-average-rating', id])
      setSelectedRating(0)
      setReviewText('')
      setShowReviewForm(false)
      toast.success('Review added successfully!')
      },
      onError: () => {
        toast.error('Failed to add review')
      }
    })

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    
    addCommentMutation.mutate({ content: commentText })
  }

  const handleAddReview = (e) => {
    e.preventDefault()
    if (selectedRating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    addRatingMutation.mutate({
      rating: selectedRating,
      review: reviewText
    })
  }

  const nextImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (productLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading product details..." />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-wood-900 mb-4">Product not found</h2>
          <Link to="/showcase">
            <Button variant="outline">Back to Showcase</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    showcase: 'bg-blue-100 text-blue-800'
  }

  const statusText = {
    available: 'Available',
    sold: 'Sold',
    in_progress: 'In Progress',
    showcase: 'Showcase Only'
  }

  const currentImage = product.images?.[currentImageIndex] || product.primary_image

  return (
    <div className="min-h-screen section-padding">
      <div className="container-custom">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-wood-600 hover:text-wood-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-square overflow-hidden rounded-2xl bg-wood-100">
                <img
                  src={currentImage?.image || '/placeholder-furniture.jpg'}
                  alt={currentImage?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-wood-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-wood-700" />
                  </button>
                </>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[product.status]}`}>
                  {statusText[product.status]}
                </span>
              </div>

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 right-4">
                  <div className="bg-rustic-600 text-white p-2 rounded-full">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-wood-600' : 'border-wood-200'
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            <div>
              <Link
                to={`/showcase?category=${product.category?.id}`}
                className="text-rustic-600 hover:text-rustic-700 font-medium transition-colors"
              >
                {product.category?.name}
              </Link>
            </div>

            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-wood-900 mb-4">
                {product.name}
              </h1>
              
              {averageRating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= averageRating.average_rating
                            ? 'text-rustic-600 fill-current'
                            : 'text-wood-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-wood-600">
                    ({averageRating.total_ratings} review{averageRating.total_ratings !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-wood-800">
              ${product.price}
            </div>

            {/* Description */}
            <div className="prose prose-wood max-w-none">
              <p className="text-wood-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-wood-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-wood-900 mb-3">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-wood-700">Dimensions:</span>
                  <p className="text-wood-600">{product.dimensions}</p>
                </div>
                <div>
                  <span className="font-medium text-wood-700">Weight:</span>
                  <p className="text-wood-600">{product.weight} lbs</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-wood-700">Materials:</span>
                  <p className="text-wood-600">{product.materials}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {product.status === 'available' && (
                <Button className="flex-1 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              )}
              
              <div className="flex space-x-3">
                <Button variant="outline" className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comments and Reviews Section - Only for authenticated users */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 space-y-8"
          >
            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-wood-900">Reviews & Ratings</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write a Review
                </Button>
              </div>

              {/* Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 p-6 bg-wood-50 rounded-lg"
                  >
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-wood-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              className="p-1"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= selectedRating
                                    ? 'text-rustic-600 fill-current'
                                    : 'text-wood-300 hover:text-rustic-400'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-wood-700 mb-2">
                          Your Review (Optional)
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows="4"
                          className="form-input resize-none"
                          placeholder="Share your thoughts about this piece..."
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="submit"
                          loading={addRatingMutation.isLoading}
                          disabled={selectedRating === 0}
                        >
                          Submit Review
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing Reviews */}
              {ratings && ratings.length > 0 ? (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-wood-100 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-wood-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-wood-50" />
                          </div>
                          <div>
                            <p className="font-medium text-wood-900">{rating.user}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= rating.rating
                                        ? 'text-rustic-600 fill-current'
                                        : 'text-wood-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-wood-500">
                                {new Date(rating.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {rating.review && (
                        <p className="text-wood-700 leading-relaxed ml-13">{rating.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-wood-300 mx-auto mb-4" />
                  <p className="text-wood-600">No reviews yet. Be the first to review this piece!</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-wood-900 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3" />
                Comments
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-wood-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-wood-50" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows="3"
                      className="form-input resize-none mb-3"
                      placeholder="Share your thoughts about this piece..."
                    />
                    <Button
                      type="submit"
                      loading={addCommentMutation.isLoading}
                      disabled={!commentText.trim()}
                      className="flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              {commentsLoading ? (
                <LoadingSpinner message="Loading comments..." />
              ) : comments && comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-wood-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-wood-50" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-wood-900">{comment.user}</span>
                          <span className="text-sm text-wood-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-wood-700 leading-relaxed">{comment.content}</p>
                        
                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-wood-100 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-wood-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-wood-50" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-wood-900 text-sm">{reply.user}</span>
                                    <span className="text-xs text-wood-500">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-wood-700 text-sm leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-wood-300 mx-auto mb-4" />
                  <p className="text-wood-600">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center bg-wood-50 rounded-2xl p-8"
          >
            <MessageCircle className="w-16 h-16 text-wood-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wood-900 mb-2">Join the Conversation</h3>
            <p className="text-wood-600 mb-6">
              Sign up to view and share comments, reviews, and connect with other furniture enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button>Create Account</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail