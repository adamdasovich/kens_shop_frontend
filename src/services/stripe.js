import { loadStripe } from '@stripe/stripe-js'
import { api } from './api'

let stripePromise

export const getStripe = () => {
  if (!stripePromise) {
    console.log('🔄 Loading Stripe with key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...')
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Payment service functions
export const paymentService = {
  getConfig: async () => {
    console.log('🔄 Getting Stripe config...')
    const response = await api.get('/payments/config/')
    console.log('✅ Stripe config received:', response.data)
    return response.data
  },

  createPaymentIntent: async (orderData) => {
    console.log('🔄 Creating payment intent with data:', orderData)
    const response = await api.post('/payments/create_payment_intent/', orderData)
    console.log('✅ Payment intent created:', response.data)
    return response.data
  },

  confirmPayment: async (paymentData) => {
    console.log('🔄 Confirming payment with data:', paymentData)
    const response = await api.post('/payments/confirm_payment/', paymentData)
    console.log('✅ Payment confirmed:', response.data)
    return response.data
  },

  getPaymentMethods: async () => {
    const response = await api.get('/payments/payment_methods/')
    return response.data
  },

  deletePaymentMethod: async (paymentMethodId) => {
    const response = await api.delete('/payments/delete_payment_method/', {
      data: { payment_method_id: paymentMethodId }
    })
    return response.data
  }
}
