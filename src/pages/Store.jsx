import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ShoppingCart, Plus, Minus, Star } from 'lucide-react'
import { productService } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const Store = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [cart, setCart] = useState({}) // Simple cart state - you might want to move this to context
  const [showCart, setShowCart] = useState(false)

  const { data: products, isLoading } = useQuery({
    queryKey: ['store-products'],
    queryFn: () => productService.getAvailable(),
    staleTime: 5 * 60 * 1000
})

  const { data: categories } = useQuery({
    queryKey:['categories'],
    queryFn: productService.getCategories,
    staleTime: 10 * 60 * 1000
})

  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.materials.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === '' || 
        product.category?.id.toString() === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1
      }
    }))
    toast.success(`Added ${product.name} to cart`)
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      const { [productId]: removed, ...rest } = cart
      setCart(rest)
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity
        }
      }))
    }
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading store..." />
        </div>
      </div>
    )
  }

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

        {/* Search, Filters, and Cart */}
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

              <Button
                variant="outline"
                onClick={() => setShowCart(!showCart)}
                className="flex items-center space-x-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rustic-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
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

          {/* Shopping Cart */}
          <AnimatePresence>
            {showCart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-6 bg-white rounded-lg border border-wood-200 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-wood-900 mb-4">Shopping Cart</h3>
                
                {cartItems.length === 0 ? (
                  <p className="text-wood-600">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-wood-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.primary_image?.image || '/placeholder-furniture.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-wood-900">{item.name}</h4>
                            <p className="text-wood-600">${item.price}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-wood-200 rounded-full flex items-center justify-center hover:bg-wood-300 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-wood-900 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-wood-200 rounded-full flex items-center justify-center hover:bg-wood-300 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-wood-200 pt-4">
                      <div className="flex items-center justify-between text-lg font-semibold text-wood-900 mb-4">
                        <span>Total: ${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full">
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
                  <div className="card card-hover">
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={product.primary_image?.image || '/placeholder-furniture.jpg'}
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
                          View Details
                        </Link>
                        <Button
                          onClick={() => addToCart(product)}
                          className="flex-1 py-2 flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
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
