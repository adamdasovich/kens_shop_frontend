import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Calendar,
  Eye,
  Clock,
  Share2
} from 'lucide-react'
import { videoService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const VideoDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => videoService.getVideo(id),
    enabled: !!id
})

  const { data: relatedVideos } = useQuery({
    queryKey: ['related-videos'],
    queryFn: () => videoService.getVideos({ category: video?.category?.id }),
    enabled: !!video?.category?.id
})

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration)

    videoElement.addEventListener('timeupdate', updateTime)
    videoElement.addEventListener('loadedmetadata', updateDuration)
    videoElement.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime)
      videoElement.removeEventListener('loadedmetadata', updateDuration)
      videoElement.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [video])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen section-padding">
        <div className="container-custom">
          <LoadingSpinner message="Loading video..." />
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-wood-900 mb-4">Video Not Found</h2>
          <p className="text-wood-600 mb-8">The video you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/videos')}>
            Back to Videos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen section-padding">
      <div className="container-custom">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-wood-600 hover:text-wood-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Videos</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Video Player */}
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  src={video.video_file}
                  poster={video.thumbnail}
                  className="w-full aspect-video object-contain"
                  onClick={togglePlay}
                />
                
                {/* Custom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #b8935a 0%, #b8935a ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-rustic-300 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-rustic-300 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-rustic-300 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-wood-600 font-medium">{video.category?.name}</span>
                    <h1 className="text-3xl font-bold text-wood-900 mt-2">{video.title}</h1>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleShare}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-6 text-wood-600">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(video.duration / 60)} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="prose prose-wood max-w-none">
                  <p className="text-wood-700 leading-relaxed">{video.description}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
            {relatedVideos && relatedVideos.results && relatedVideos.results.length > 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h3 className="text-xl font-semibold text-wood-900 mb-4">Related Videos</h3>
                <div className="space-y-4">
                  {relatedVideos.results
                    .filter(v => v.id !== video.id)
                    .slice(0, 5)
                    .map((relatedVideo) => (
                      <Link
                        key={relatedVideo.id}
                        to={`/video/${relatedVideo.id}`}
                        className="flex space-x-3 hover:bg-wood-50 p-2 rounded-lg transition-colors group"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={relatedVideo.thumbnail || '/placeholder-video.jpg'}
                            alt={relatedVideo.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded">
                            <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-wood-900 text-sm line-clamp-2 group-hover:text-wood-700 transition-colors">
                            {relatedVideo.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-wood-600">
                            <span>{relatedVideo.views.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{Math.floor(relatedVideo.duration / 60)}m</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Video Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-wood-900 mb-4">Video Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-wood-600">Duration</span>
                  <span className="font-medium text-wood-900">
                    {Math.floor(video.duration / 60)}m {video.duration % 60}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-600">Views</span>
                  <span className="font-medium text-wood-900">
                    {video.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-600">Published</span>
                  <span className="font-medium text-wood-900">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wood-600">Category</span>
                  <span className="font-medium text-wood-900">
                    {video.category?.name}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetail
