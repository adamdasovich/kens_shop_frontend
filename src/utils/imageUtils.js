export const getImageUrl = (imagePath, fallback = '/images/placeholder-furniture.jpg') => {
  if (!imagePath) return fallback
  
  // If it's already a full URL (starts with http), return as-is
  if (imagePath.startsWith('http')) return imagePath
  
  // If it's a Django media URL (starts with /media/), prepend Django server URL
  if (imagePath.startsWith('/media/')) {
    return `http://localhost:8000${imagePath}`
  }
  
  // If it's just a filename or relative path, assume it's in Django media
  if (!imagePath.startsWith('/')) {
    return `http://localhost:8000/media/${imagePath}`
  }
  
  // Default: prepend Django server URL
  return `http://localhost:8000${imagePath}`
}

export const handleImageError = (event, fallback = '/images/placeholder-furniture.jpg') => {
  console.log('Image failed to load:', event.target.src)
  event.target.src = fallback
  event.target.onerror = null // Prevent infinite loop
}