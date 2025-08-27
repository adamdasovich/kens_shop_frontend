import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Trash2, Plus, Calendar } from 'lucide-react'
import { paymentService } from '../../services/stripe'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

const SavedPaymentMethods = () => {
  const [deletingId, setDeletingId] = useState(null)
  const queryClient = useQueryClient()

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentService.getPaymentMethods,
    staleTime: 5 * 60 * 1000
})

  const deletePaymentMethodMutation = useMutation({
    mutationFn: paymentService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries('payment-methods')
      toast.success('Payment method deleted successfully')
      setDeletingId(null)
    },
    onError: () => {
      toast.error('Failed to delete payment method')
      setDeletingId(null)
    }
  })

  const handleDeletePaymentMethod = (paymentMethodId) => {
    setDeletingId(paymentMethodId)
    deletePaymentMethodMutation.mutate(paymentMethodId)
  }

  const getCardIcon = (brand) => {
    // You can replace these with actual card brand icons
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      default: '💳'
    }
    return icons[brand] || icons.default
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading payment methods..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-wood-900">Saved Payment Methods</h3>
      </div>

      {paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-wood-100 rounded flex items-center justify-center">
                      <span className="text-lg">{getCardIcon(method.card_brand)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-wood-900">
                        {method.card_brand.toUpperCase()} ending in {method.card_last4}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-wood-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {method.card_exp_month.toString().padStart(2, '0')}/{method.card_exp_year}
                          </span>
                        </span>
                        {method.is_default && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDeletePaymentMethod(method.stripe_payment_method_id)}
                    loading={deletingId === method.stripe_payment_method_id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-wood-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-wood-700 mb-2">No saved payment methods</h4>
          <p className="text-wood-600 mb-6">
            Add a payment method during checkout to save it for future purchases.
          </p>
        </div>
      )}
    </div>
  )
}

export default SavedPaymentMethods
