
/**
 * Utility functions for processing and displaying images
 */

// Process image URL to ensure it works with the server's structure
export const getValidImageUrl = (url: string | undefined): string => {
  // Default fallback for empty or undefined URLs
  if (!url) return "/placeholder.svg";
  
  // If it's already a complete URL (http/https), use it as is
  if (url.startsWith('http') || url.startsWith('https')) {
    return url;
  }
  
  // Handle base64 data
  if (url.startsWith('data:') || url.includes('base64')) {
    // For very long base64 strings, they might be truncated in the database
    // If they're truncated, it's better to use a placeholder
    if (url.length < 100 || !url.includes(',')) {
      console.log("Detected incomplete base64 image, using placeholder instead");
      return "/placeholder.svg";
    }
    return url;
  }
  
  // Fix malformed URLs (a common issue with some APIs)
  if (url.includes(';//')) {
    const fixed = url.replace(';//', '://');
    return fixed;
  }
  
  // Handle static/uploads paths correctly
  if (url.startsWith('/static/uploads/')) {
    // For development environment, prepend with server URL
    // In development, the server typically runs on port 8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8000${url}`;
    }
    return url;
  }
  
  // For server-side image paths that need to be properly formatted
  if (url.startsWith('/')) {
    // If it's a path starting with /, make sure it has the static/uploads prefix
    if (!url.startsWith('/static/uploads/')) {
      const newUrl = `/static/uploads${url}`;
      // For development environment, prepend with server URL
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://${window.location.hostname}:8000${newUrl}`;
      }
      return newUrl;
    }
    
    // For development environment, prepend with server URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8000${url}`;
    }
    return url;
  }
  
  // For simple filenames without path, add the full path
  if (!url.includes('/')) {
    const newUrl = `/static/uploads/${url}`;
    // For development environment, prepend with server URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8000${newUrl}`;
    }
    return newUrl;
  }
  
  // For other cases, assume it's a valid relative path
  // For development environment, prepend with server URL if it starts with /static
  if (url.startsWith('/static/') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `http://${window.location.hostname}:8000${url}`;
  }
  
  return url;
};

// Create a component-ready image URL with fallback
export const createImageSrc = (url: string | undefined, defaultImage = "/placeholder.svg"): string => {
  try {
    const processedUrl = getValidImageUrl(url);
    console.log(`Processing image URL: ${url} → ${processedUrl}`);
    return processedUrl || defaultImage;
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
