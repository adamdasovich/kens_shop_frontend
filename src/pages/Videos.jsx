import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Eye, 
  Star,
  Grid,
  List
} from 'lucide-react'
import { videoService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

const Videos = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.getVideos(),
    staleTime: 5 * 60 * 1000
})

  const { data: categories } = useQuery({
    queryKey: ['video-categories'],
    queryFn: videoService.getCategories,
    staleTime: 10 * 60 * 1000
})

  const filteredVideos = useMemo(() => {
    if (!videos?.results) return []
    
    return videos.results.filter(video => {
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === '' || 
        video.category?.id.toString() === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [videos, searchTerm, selectedCategory])

  const featuredVideos = filteredVideos.filter(video => video.featured)
  const regularVideos = filteredVideos.filter(video => !video.featured)

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading videos..." />
        </div>
      </div>
    )
  }

  const VideoCard = ({ video, featured = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card card-hover group"
    >
      <Link to={`/video/${video.id}`}>
        <div className="relative overflow-hidden h-48 md:h-56">
          <img
            src={video.thumbnail || '/placeholder-video.jpg'}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-wood-800 ml-1" />
            </div>
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(video.duration)}
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <div className="bg-rustic-600 text-white p-2 rounded-full">
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-2">
            <span className="text-sm text-wood-600 font-medium">{video.category?.name}</span>
          </div>
          <h3 className="text-xl font-semibold text-wood-900 mb-2 line-clamp-2 group-hover:text-wood-700 transition-colors">
            {video.title}
          </h3>
          <p className="text-wood-600 text-sm mb-4 line-clamp-3">{video.description}</p>
          
          <div className="flex items-center justify-between text-sm text-wood-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {video.views.toLocaleString()}
              </span>
            </div>
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )

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
            Behind the Craft
          </h1>
          <p className="text-xl text-wood-600 max-w-3xl mx-auto leading-relaxed">
            Step into our workshop and witness the artistry behind each piece. 
            From traditional techniques to modern innovations, discover the passion that drives our craft.
          </p>
        </motion.div>

        {/* Search and Filters */}
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
                placeholder="Search videos..."
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

              <div className="flex items-center space-x-1 bg-wood-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-wood-900' : 'text-wood-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-wood-900' : 'text-wood-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
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
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-wood-600">
            Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && categories && ` in ${categories.find(c => c.id.toString() === selectedCategory)?.name}`}
          </p>
        </motion.div>

        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center space-x-3 mb-8">
              <Star className="w-6 h-6 text-rustic-600 fill-current" />
              <h2 className="text-3xl font-bold text-wood-900">Featured Videos</h2>
            </div>
            
            <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-6'}>
              {featuredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <VideoCard video={video} featured />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Videos */}
        {regularVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: featuredVideos.length > 0 ? 0.4 : 0.3 }}
          >
            {featuredVideos.length > 0 && (
              <h2 className="text-3xl font-bold text-wood-900 mb-8">All Videos</h2>
            )}
            
            <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-6'}>
              {regularVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-wood-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-wood-400" />
            </div>
            <h3 className="text-2xl font-semibold text-wood-700 mb-4">No videos found</h3>
            <p className="text-wood-600 mb-8 max-w-md mx-auto">
              We couldn't find any videos matching your criteria. Try adjusting your search or filters.
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

export default Videos