import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from './services/stripe'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Showcase from './pages/Showcase'
import Store from './pages/Store'
import ProductDetail from './pages/ProductDetail'
import Videos from './pages/Videos'
import VideoDetail from './pages/VideoDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

// Initialize Stripe outside of component to avoid re-initialization
const stripePromise = getStripe()

function App() {
  return (
    <div className="min-h-screen bg-wood-50 flex flex-col">
      <Elements 
        stripe={stripePromise}
        options={{
          // Add options to suppress warnings
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#8b6f5e',
            }
          }
        }}
      >
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/store" element={
                <ProtectedRoute>
                  <Store />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/videos" element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              } />
              <Route path="/video/:id" element={
                <ProtectedRoute>
                  <VideoDetail />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </Elements>
    </div>
  )
}

export default App
