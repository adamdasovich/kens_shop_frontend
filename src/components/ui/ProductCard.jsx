import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, ShoppingBag, Star } from 'lucide-react'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const ProductCard = ({ product, showActions = true }) => {
  const { id, name, price, status, images, category } = product

  // Get the primary image from the images array
  const primaryImage = images?.find(img => img.is_primary) || images?.[0]

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
    showcase: 'Showcase'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card card-hover"
    >
      {/* Image with proper URL handling */}
      <div className="relative overflow-hidden h-64">
        <img
          src={getImageUrl(primaryImage?.image)}
          alt={primaryImage?.alt_text || name}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusText[status]}
          </span>
        </div>
        {product.featured && (
          <div className="absolute top-4 right-4">
            <div className="bg-rustic-600 text-white p-2 rounded-full">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-sm text-wood-600 font-medium">{category?.name}</span>
        </div>
        <h3 className="text-xl font-semibold text-wood-900 mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-wood-800">${price}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3">
            <Link
              to={`/product/${id}`}
              className="flex-1 bg-wood-100 hover:bg-wood-200 text-wood-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Link>
            {status === 'available' && (
              <button className="flex-1 btn-primary py-2 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard