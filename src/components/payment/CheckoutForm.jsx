import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useMutation } from '@tanstack/react-query'
import { 
  CreditCard, 
  Lock, 
  User, 
  MapPin, 
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { paymentService, orderService } from '../../services/api'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { cartItems, cartTotal, shippingAddress, notes, setShippingAddress, setNotes, clearCart } = useCart()
  const navigate = useNavigate()

  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [saveCard, setSaveCard] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0
  })

  // Create order and payment intent
  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (order) => {
      try {
        const paymentData = await paymentService.createPaymentIntent({
          order_id: order.id,
          save_payment_method: saveCard
        })
        
        setClientSecret(paymentData.client_secret)
        setPaymentIntentId(paymentData.payment_intent_id)
        setTotals({
          subtotal: paymentData.subtotal,
          tax: paymentData.tax_amount,
          total: paymentData.total
        })
      } catch (error) {
        toast.error('Failed to create payment intent')
      }
    },
    onError: () => {
      toast.error('Failed to create order')
    }
  })

  // Confirm payment
  const confirmPaymentMutation = useMutation({
    mutationFn: paymentService.confirmPayment, 
    onSuccess: (data) => {
      if (data.status === 'succeeded') {
        clearCart()
        toast.success('Payment successful! Your order has been confirmed.')
        navigate(`/profile?tab=orders`)
      } else {
        toast.error('Payment failed. Please try again.')
      }
    },
    onError: () => {
      toast.error('Payment confirmation failed')
    }
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      // First, create the order if we don't have a client secret yet
      if (!clientSecret) {
        const orderItems = cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))

        await createOrderMutation.mutateAsync({
          shipping_address: shippingAddress,
          notes: notes,
          items: orderItems
        })
        return // Wait for the payment intent to be created
      }

      const cardElement = elements.getElement(CardElement)

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
          },
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        // Confirm payment on our backend
        await confirmPaymentMutation.mutateAsync({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentIntent.payment_method
        })
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#5c4f42',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': {
          color: '#a3b8a3',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-wood-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-wood-400" />
        </div>
        <h3 className="text-2xl font-semibold text-wood-700 mb-4">Your cart is empty</h3>
        <p className="text-wood-600 mb-8">Add some items to your cart before checking out.</p>
        <Button onClick={() => navigate('/store')}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-wood-600" />
              <h2 className="text-2xl font-semibold text-wood-900">Secure Checkout</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-wood-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address..."
                  rows="4"
                  className="form-input resize-none"
                  required
                />
              </div>

              {/* Order Notes */}
              <div>
                <h3 className="text-lg font-medium text-wood-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Order Notes (Optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, delivery preferences, etc..."
                  rows="3"
                  className="form-input resize-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-wood-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                
                <div className="p-4 border border-wood-200 rounded-lg bg-wood-50">
                  <CardElement options={cardElementOptions} />
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded border-wood-300 text-wood-600 focus:ring-wood-500"
                    />
                    <span className="ml-2 text-sm text-wood-600">
                      Save this card for future purchases
                    </span>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Secure Payment</h4>
                    <p className="text-sm text-green-700">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="large"
                loading={processing || createOrderMutation.isLoading || confirmPaymentMutation.isLoading}
                disabled={!stripe || processing || createOrderMutation.isLoading || confirmPaymentMutation.isLoading}
              >
                {processing ? (
                  'Processing Payment...'
                ) : clientSecret ? (
                  `Pay ${totals.total?.toFixed(2) || cartTotal.toFixed(2)}`
                ) : (
                  'Create Order & Pay'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-wood-900 mb-6">Order Summary</h3>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.primary_image?.image || '/placeholder-furniture.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-wood-900 truncate">{item.name}</h4>
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

            {/* Pricing Breakdown */}
            <div className="border-t border-wood-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-wood-600">Subtotal</span>
                <span className="font-medium text-wood-900">
                  ${(totals.subtotal || cartTotal).toFixed(2)}
                </span>
              </div>
              
              {totals.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-wood-600">Tax</span>
                  <span className="font-medium text-wood-900">
                    ${totals.tax.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold text-wood-900 border-t border-wood-200 pt-3">
                <span>Total</span>
                <span>${(totals.total || cartTotal).toFixed(2)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-wood-200">
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-wood-600">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm
