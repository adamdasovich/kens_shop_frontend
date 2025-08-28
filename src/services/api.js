import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = 'http://localhost:8000/api'
const MEDIA_URL = 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling and image URL processing
api.interceptors.response.use(
  (response) => {
    // Process image URLs in the response
    if (response.data) {
      response.data = processImageUrls(response.data)
    }
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          })
          localStorage.setItem('token', response.data.access)
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.access}`
          return api.request(error.config)
        } catch (refreshError) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    
    // Show error toast
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Something went wrong'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

// Helper function to process image URLs in API responses
function processImageUrls(data) {
  if (Array.isArray(data)) {
    return data.map(item => processImageUrls(item))
  }
  
  if (data && typeof data === 'object') {
    const processed = { ...data }
    
    // Process common image fields
    if (processed.image && !processed.image.startsWith('http')) {
      processed.image = processed.image.startsWith('/') 
        ? `${MEDIA_URL}${processed.image}`
        : `${MEDIA_URL}/media/${processed.image}`
    }
    
    if (processed.thumbnail && !processed.thumbnail.startsWith('http')) {
      processed.thumbnail = processed.thumbnail.startsWith('/') 
        ? `${MEDIA_URL}${processed.thumbnail}`
        : `${MEDIA_URL}/media/${processed.thumbnail}`
    }
    
    if (processed.video_file && !processed.video_file.startsWith('http')) {
      processed.video_file = processed.video_file.startsWith('/') 
        ? `${MEDIA_URL}${processed.video_file}`
        : `${MEDIA_URL}/media/${processed.video_file}`
    }
    
    // Process images array for products
    if (processed.images && Array.isArray(processed.images)) {
      processed.images = processed.images.map(img => ({
        ...img,
        image: img.image && !img.image.startsWith('http') 
          ? (img.image.startsWith('/') ? `${MEDIA_URL}${img.image}` : `${MEDIA_URL}/media/${img.image}`)
          : img.image
      }))
    }
    
    // Process primary_image for products
    if (processed.primary_image && processed.primary_image.image && !processed.primary_image.image.startsWith('http')) {
      processed.primary_image.image = processed.primary_image.image.startsWith('/') 
        ? `${MEDIA_URL}${processed.primary_image.image}`
        : `${MEDIA_URL}/media/${processed.primary_image.image}`
    }
    
    // Recursively process nested objects
    Object.keys(processed).forEach(key => {
      if (processed[key] && typeof processed[key] === 'object') {
        processed[key] = processImageUrls(processed[key])
      }
    })
    
    return processed
  }
  
  return data
}

// Auth services
export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login/', credentials)
        return response.data
    },
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData)
        return response.data
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile/')
        return response.data
    },
    updateProfile: async () => {
        const response = await api.put('/auth/profile/', userData)
    }
}

// Product services
export const productService = {
    getProducts: async (params = {}) => {
        const response = await api.get('/products/', { params })
        return response.data
    },
    getProduct: async (id) => {
        const response = await api.get(`/products/${id}/`)
        return response.data
    },
    getFeatured: async() => {
        const response = await api.get('/products/featured/')
        return response.data
    },
    getAvailable: async() => {
        const response = await api.get('/products/available/')
        return response.data
    },
    getCategories: async() => {
        const response = await api.get('/categories/')
        return response.data
    }
}

export const orderService = {
    getOrders: async () => {
        const response = await api.get('/orders/')
        return response.data
    },
    createOrder: async(orderData) => {
        const response = await api.post('/orders/', orderData)
        return response.data
    },
    cancelOrder: async (orderId) => {
        const response = await api.post(`/orders/${orderId}/cancel`)
        return response.data
    }
}

export const videoService = {
    getVideos: async (params={}) => {
        const response = await api.get('/videos/', { params })
        return response.data
    },
    getVideo: async(id) => {
        const response = await api.get(`/videos/${id}/`)
        return response.data
    },
    getFeatured: async() => {
        const response = await api.get('/videos/featured/')
        return response.data
    },
    getCategories: async() => {
        const response = await api.get('/video-categories/')
        return response.data
    }
}

export { paymentService } from './stripe'

export const commentService = {
    getComments: async(contentType, objectId) => {
        const response = await api.get('/comments/for_product/', {
            params: { product_id: objectId}
        })
        return response.data
    },
    createComment: async(commentData) => {
        const response = await api.post('/comments/', commentData)
        return response.data
    },
    getRatings: async (productId) => {
        const response = await api.get('/ratings/for_product/', {
            params: { product_id: productId}
        })
        return response.data
    },
    getAverageRating: async(productId) => {
        const response = await api.get('/ratings/average/', {
            params: { product_id: productId}
        })
        return response.data
    },
    createRating: async(ratingData) => {
        const response = await api.post('/ratings/', ratingData)
        return response.data
    }
}

export { api, BASE_URL, MEDIA_URL }