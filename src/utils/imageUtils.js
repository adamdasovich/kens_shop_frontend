export const getImageUrl = (imagePath, fallback = '/images/placeholder-furniture.jpg') => {
  if (!imagePath) {
    return fallback
  }
  
  // If it's already a full URL (starts with http), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // If it's a Django media URL (starts with /media/), prepend Django server URL
  if (imagePath.startsWith('/media/')) {
    return `http://localhost:8000${imagePath}`
  }
  
  // Default fallback
  return fallback
}

export const handleImageError = (event, fallback = '/images/placeholder-furniture.jpg') => {
  console.log('Image failed to load:', event.target.src)
  event.target.src = fallback
  event.target.onerror = null // Prevent infinite loop
}