import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Elements } from '@stripe/react-stripe-js'
import { useQuery } from '@tanstack/react-query'
import { getStripe, paymentService } from '../services/stripe'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import CheckoutForm from '../components/payment/CheckoutForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Checkout = () => {
  const { isAuthenticated, loading } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const { data: stripeConfig, isLoading: configLoading } = useQuery({
    queryKey: ['stripe-config'],
    queryFn: paymentService.getConfig,
    staleTime: 10 * 60 * 1000
})

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    }
  }, [isAuthenticated, loading, navigate])

  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirect to store if cart is empty, but with a small delay to allow for cart loading
      const timer = setTimeout(() => {
        navigate('/store')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cartItems, navigate])

  if (loading || configLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading checkout..." />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const stripePromise = getStripe()

  return (
    <div className="min-h-screen section-padding bg-wood-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-wood-900 mb-4">Checkout</h1>
          <p className="text-xl text-wood-600">
            Complete your purchase securely and safely
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </motion.div>
      </div>
    </div>
  )
}

export default Checkout
