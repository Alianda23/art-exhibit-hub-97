
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
  
  // For development environment, construct the full URL to the server
  // This is the key fix - always add the server URL in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')) {
    // Ensure the path starts with /static correctly
    let serverPath = url;
    if (!url.startsWith('/')) {
      serverPath = '/' + url;
    }
    if (!url.startsWith('/static/')) {
      serverPath = '/static/uploads/' + url.replace(/^\/+/, '');
    }
    
    // Always use the development server URL in development mode
    return `http://localhost:8000${serverPath}`;
  }
  
  // For all other cases, just ensure it has the proper static prefix
  if (!url.startsWith('/static/')) {
    return `/static/uploads/${url.replace(/^\/+/, '')}`;
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
