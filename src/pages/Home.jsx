import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Award, Users, Clock, Star } from 'lucide-react'
import { productService } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import backlessStool from '../assets/one_stool_with_back_from_back.jpg'

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: productService.getFeatured,
    staleTime: 5 * 60 * 1000
})

// TEMPORARY DEBUG - Add this to see what data Home is receiving
  console.log('🏠 HOME PAGE - Featured products data:', featuredProducts)
  if (featuredProducts && featuredProducts.length > 0) {
    console.log('🏠 HOME PAGE - First product structure:', featuredProducts[0])
    console.log('🏠 HOME PAGE - First product images:', featuredProducts[0].images)
    console.log('🏠 HOME PAGE - First product primary_image:', featuredProducts[0].primary_image)
  }

  const stats = [
    { icon: Award, number: '15+', label: 'Years Experience' },
    { icon: Users, number: '200+', label: 'Happy Clients' },
    { icon: Clock, number: '500+', label: 'Pieces Crafted' },
    { icon: Star, number: '4.9', label: 'Average Rating' }
  ]

  const features = [
    {
      title: 'Master Craftsmanship',
      description: 'Each piece is meticulously handcrafted using traditional techniques passed down through generations.',
      image: '/craft-feature.jpg'
    },
    {
      title: 'Premium Materials',
      description: 'We source only the finest hardwoods and materials to ensure lasting beauty and durability.',
      image: '/materials-feature.jpg'
    },
    {
      title: 'Custom Designs',
      description: 'Work with our master craftsman to create unique pieces tailored to your specific needs.',
      image: '/custom-feature.jpg'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-background min-h-screen flex items-center">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-wood-900 leading-tight">
                Handcrafted
                <span className="text-gradient block">Furniture</span>
                That Lasts
              </h1>
              <p className="text-xl text-wood-700 leading-relaxed">
                Discover our collection of meticulously crafted chairs and bar stools, 
                where traditional woodworking meets contemporary design.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/showcase">
                  <Button size="large" className="w-full sm:w-auto">
                    Explore Showcase
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/store">
                  <Button variant="outline" size="large" className="w-full sm:w-auto">
                    Visit Store
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src={backlessStool}
                  alt="Handcrafted wooden chair"
                  className="w-72 h-72 rounded-2xl shadow-2xl"
                />
              </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-wood-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-wood-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-wood-50" />
                </div>
                <div className="text-3xl font-bold text-wood-900 mb-2">{stat.number}</div>
                <div className="text-wood-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!isLoading && featuredProducts && featuredProducts.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-wood-900 mb-6">
                Featured Pieces
              </h2>
              <p className="text-xl text-wood-600 max-w-3xl mx-auto">
                Discover our most celebrated creations, each piece representing the pinnacle of craftsmanship and design.
              </p>
            </motion.div>

            <div className="product-grid">
              {featuredProducts.slice(0, 3).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/showcase">
                <Button variant="outline" size="large">
                  View All Pieces
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {isLoading && (
        <section className="section-padding">
          <div className="container-custom">
            <LoadingSpinner message="Loading featured products..." />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="section-padding bg-wood-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-wood-900 mb-6">
              Why Choose Master Woodworks
            </h2>
            <p className="text-xl text-wood-600 max-w-3xl mx-auto">
              Our commitment to excellence ensures every piece meets the highest standards of quality and craftsmanship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="h-48 overflow-hidden mb-6">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-wood-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-wood-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-wood-900 text-wood-50">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Own a Masterpiece?
            </h2>
            <p className="text-xl text-wood-300 mb-8 leading-relaxed">
              Join our community of furniture enthusiasts and discover the perfect piece for your home. 
              Access exclusive content, browse our store, and witness the crafting process behind each creation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/register">
                <Button variant="secondary" size="large" className="w-full sm:w-auto">
                  Join Our Community
                </Button>
              </Link>
              <Link to="/showcase">
                <Button variant="outline" size="large" className="w-full sm:w-auto border-wood-300 text-wood-300 hover:bg-wood-300 hover:text-wood-900">
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home