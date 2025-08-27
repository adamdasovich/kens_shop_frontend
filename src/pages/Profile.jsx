// src/pages/Profile.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authService, orderService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: orderService.getOrders,
    staleTime: 5 * 60 * 1000
})

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateUser(data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries('user-profile')
    },
    onError: (error) => {
      toast.error('Failed to update profile')
    }
  })

  const cancelOrderMutation = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries('user-orders')
      toast.success('Order cancelled successfully')
    },
    onError: () => {
      toast.error('Failed to cancel order')
    }
  })

  const onSubmit = async (data) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancelEdit = () => {
    reset()
    setIsEditing(false)
  }

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'in_progress':
        return <Package className="w-5 h-5 text-orange-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Confirmed'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: ShoppingBag }
  ]

  return (
    <div className="min-h-screen section-padding bg-wood-50">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-wood-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-wood-50" />
          </div>
          <h1 className="text-4xl font-bold text-wood-900 mb-2">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-wood-600">{user?.email}</p>
          <p className="text-sm text-wood-500 mt-2">
            Member since {new Date(user?.date_joined).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-white rounded-lg shadow-sm border border-wood-200 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-wood-700 text-white shadow-md'
                    : 'text-wood-600 hover:text-wood-800 hover:bg-wood-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-wood-900">Profile Information</h2>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-400 w-5 h-5" />
                        <input
                          {...register('first_name', { required: 'First name is required' })}
                          className="form-input pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="form-error">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-400 w-5 h-5" />
                        <input
                          {...register('last_name', { required: 'Last name is required' })}
                          className="form-input pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.last_name && (
                        <p className="form-error">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-400 w-5 h-5" />
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="form-input pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                    {errors.email && (
                      <p className="form-error">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-400 w-5 h-5" />
                      <input
                        {...register('phone')}
                        className="form-input pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-wood-400 w-5 h-5" />
                      <textarea
                        {...register('address')}
                        rows="3"
                        className="form-input pl-10 resize-none"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="card p-8">
                <h2 className="text-2xl font-semibold text-wood-900 mb-6">Order History</h2>

                {ordersLoading ? (
                  <LoadingSpinner message="Loading orders..." />
                ) : orders && orders.results && orders.results.length > 0 ? (
                  <div className="space-y-6">
                    {orders.results.map((order) => (
                      <div key={order.id} className="border border-wood-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-wood-900">
                                Order #{order.order_number}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-wood-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              </span>
                              <span>${order.total_amount}</span>
                              <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleCancelOrder(order.id)}
                              loading={cancelOrderMutation.isLoading}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-wood-100 pt-4">
                            <h4 className="font-medium text-wood-900 mb-3">Items</h4>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-3 bg-wood-50 rounded-lg">
                                  <img
                                    src={item.product.primary_image?.image || '/placeholder-furniture.jpg'}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-wood-900 truncate">
                                      {item.product.name}
                                    </h5>
                                    <p className="text-sm text-wood-600">
                                      Quantity: {item.quantity} × ${item.price}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-wood-900">
                                      ${(item.quantity * item.price).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address */}
                        {order.shipping_address && (
                          <div className="border-t border-wood-100 pt-4 mt-4">
                            <h4 className="font-medium text-wood-900 mb-2">Shipping Address</h4>
                            <p className="text-sm text-wood-600 whitespace-pre-line">
                              {order.shipping_address}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="border-t border-wood-100 pt-4 mt-4">
                            <h4 className="font-medium text-wood-900 mb-2">Notes</h4>
                            <p className="text-sm text-wood-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-wood-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-wood-700 mb-2">No Orders Yet</h3>
                    <p className="text-wood-600 mb-6">
                      You haven't placed any orders yet. Start shopping to see your order history here.
                    </p>
                    <Button onClick={() => window.location.href = '/store'}>
                      Browse Store
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Profile