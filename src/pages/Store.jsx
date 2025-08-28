import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ShoppingCart, Star, Eye } from 'lucide-react'
import { productService } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const Store = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { addItem, cartCount, cartTotal, cartItems } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const { data: products, isLoading } = useQuery({
    queryKey: ['store-products'],
    queryFn: () => productService.getAvailable(),
    staleTime: 5 * 60 * 1000
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
    staleTime: 10 * 60 * 1000
  })

  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.materials?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === '' || 
        product.category?.id.toString() === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const handleAddToCart = (product) => {
    if (product.status !== 'available') {
      toast.error('This item is not available for purchase')
      return
    }
    console.log('🛒 Store: Adding product to cart:', product) // Debug log
    addItem(product)
    toast.success(`Added ${product.name} to cart`)
  }

  const handleProceedToCheckout = () => {
    console.log('🛒 Proceeding to checkout. Cart items:', cartItems) // Debug log
    console.log('🛒 Cart total:', cartTotal) // Debug log
    console.log('🛒 Is authenticated:', isAuthenticated) // Debug log
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    if (!isAuthenticated) {
      toast.error('Please log in to checkout')
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    
    navigate('/checkout')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading store..." />
        </div>
      </div>
    )
  }

  const StoreProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card card-hover"
    >
      <div className="relative overflow-hidden h-64">
        <img
          src={product.primary_image?.image || '/images/placeholder-furniture.jpg'}
          alt={product.primary_image?.alt_text || product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {product.featured && (
          <div className="absolute top-4 right-4">
            <div className="bg-rustic-600 text-white p-2 rounded-full">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="text-sm text-wood-600 font-medium">{product.category?.name}</span>
        </div>
        <h3 className="text-xl font-semibold text-wood-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-wood-800">${product.price}</span>
        </div>

        <div className="flex space-x-3">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-wood-100 hover:bg-wood-200 text-wood-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
          <Button
            onClick={() => handleAddToCart(product)}
            className="flex-1 py-2 flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen section-padding">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-wood-900 mb-6">
            Our Store
          </h1>
          <p className="text-xl text-wood-600 max-w-3xl mx-auto leading-relaxed">
            Purchase beautiful handcrafted furniture directly from our workshop. 
            Each available piece is ready to ship and become part of your home.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search available products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>

              {/* Cart Summary & Checkout Button */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-wood-600">{cartCount} items</p>
                  <p className="font-semibold text-wood-900">${cartTotal.toFixed(2)}</p>
                </div>
                <Button
                  onClick={handleProceedToCheckout}
                  className="flex items-center space-x-2"
                  disabled={cartCount === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Checkout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-wood-50 rounded-lg border border-wood-200"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="form-input"
                    >
                      <option value="">All Categories</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                      }}
                      className="mt-6"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Debug Cart Info - REMOVE AFTER TESTING */}
        {cartItems.length > 0 && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">🛒 CART DEBUG (Remove after testing):</h3>
            <p className="text-sm text-green-700">
              Items: {cartCount} | Total: ${cartTotal.toFixed(2)} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </p>
            <div className="text-xs text-green-600 mt-2">
              {cartItems.map(item => (
                <div key={item.id}>{item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-wood-600">
            {filteredProducts.length} available piece{filteredProducts.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && categories && ` in ${categories.find(c => c.id.toString() === selectedCategory)?.name}`}
          </p>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <StoreProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-wood-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-wood-400" />
            </div>
            <h3 className="text-2xl font-semibold text-wood-700 mb-4">No available pieces found</h3>
            <p className="text-wood-600 mb-8 max-w-md mx-auto">
              We couldn't find any available pieces matching your criteria. Try adjusting your search or check back later.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Store