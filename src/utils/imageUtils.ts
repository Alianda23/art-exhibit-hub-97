
/**
 * Utility functions for processing and displaying images
 */

// Process image URL to ensure it works with the server's structure
export const getValidImageUrl = (url: string | undefined): string => {
  // Default fallback for empty or undefined URLs
  if (!url) return "/placeholder.svg";
  
  // If it's already a complete URL or a valid static path, use it as is
  if (url.startsWith('http') || url.startsWith('https') || 
      url.startsWith('/static/uploads/')) {
    return url;
  }
  
  // Fix malformed URLs (a common issue with some APIs)
  if (url.includes(';//')) {
    const fixed = url.replace(';//', '://');
    return fixed;
  }
  
  // For server-side image paths that need to be properly formatted
  if (url.startsWith('/')) {
    // If it's a path starting with /, make sure it has the static/uploads prefix
    if (!url.startsWith('/static/uploads/')) {
      const newUrl = `/static/uploads${url}`;
      return newUrl;
    }
    return url;
  }
  
  // For simple filenames without path, add the full path
  if (!url.includes('/')) {
    const newUrl = `/static/uploads/${url}`;
    return newUrl;
  }
  
  // For other cases, assume it's a valid relative path
  return url;
};

// Create a component-ready image URL with fallback
export const createImageSrc = (url: string | undefined, defaultImage = "/placeholder.svg"): string => {
  try {
    return getValidImageUrl(url) || defaultImage;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return defaultImage;
  }
};

// Handle image loading errors
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc = "/placeholder.svg") => {
  const target = e.target as HTMLImageElement;
  console.error(`Image failed to load: ${target.src}`);
  target.onerror = null; // Prevent infinite loop if fallback also fails
  target.src = fallbackSrc;
};
