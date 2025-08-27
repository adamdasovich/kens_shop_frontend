import { loadStripe } from '@stripe/stripe-js'

let stripePromise

export const getStripe = () => {
  if (!stripePromise) {
    // Add conditional loading to suppress warning in development
    if (import.meta.env.DEV) {
      // Only show the warning once in development
      if (!window.stripeWarningShown) {
        console.info('ℹ️ Stripe: Using HTTP in development mode. HTTPS required for production.')
        window.stripeWarningShown = true
      }
    }
    
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
      // Suppress console warnings in development
      stripeAccount: undefined,
      locale: 'en',
    })
  }
  return stripePromise
}

// Rest of your payment service functions...
export const paymentService = {
  getConfig: async () => {
    const response = await api.get('/payments/config/')
    return response.data
  },

  createPaymentIntent: async (orderData) => {
    const response = await api.post('/payments/create_payment_intent/', orderData)
    return response.data
  },

  confirmPayment: async (paymentData) => {
    const response = await api.post('/payments/confirm_payment/', paymentData)
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