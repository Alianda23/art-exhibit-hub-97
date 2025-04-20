
/**
 * Utility functions for processing and displaying images
 */

// Process image URL to ensure it works with the server's structure
export const getValidImageUrl = (url: string | undefined): string => {
  // Default fallback for empty or undefined URLs
  if (!url) {
    console.log("Empty image URL, using placeholder");
    return "/placeholder.svg";
  }
  
  // If it's already a complete URL (http/https), use it as is
  if (url.startsWith('http') || url.startsWith('https')) {
    console.log(`Using complete URL as is: ${url}`);
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
    console.log("Using base64 image data");
    return url;
  }
  
  // Fix malformed URLs (a common issue with some APIs)
  if (url.includes(';//')) {
    const fixed = url.replace(';//', '://');
    console.log(`Fixed malformed URL: ${url} → ${fixed}`);
    return fixed;
  }
  
  // Handle static/uploads paths correctly
  if (url.startsWith('/static/uploads/')) {
    // For development environment, prepend with server URL
    // In development, the server typically runs on port 8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const serverUrl = `http://localhost:8000${url}`;
      console.log(`Development static URL: ${url} → ${serverUrl}`);
      return serverUrl;
    }

    // For production environment, prepend with the actual server URL
    const serverUrl = `http://localhost:8000${url}`;
    console.log(`Production static URL: ${url} → ${serverUrl}`);
    return serverUrl;
  }
  
  // For other cases, assume it's a valid relative path
  // For development environment, prepend with server URL if it starts with /static
  if (url.startsWith('/static/') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const serverUrl = `http://localhost:8000${url}`;
    console.log(`Development relative path: ${url} → ${serverUrl}`);
    return serverUrl;
  }
  
  // If we're in production, we still need to prepend server URL for static files
  if (url.startsWith('/static/')) {
    const serverUrl = `http://localhost:8000${url}`;
    console.log(`Production static path: ${url} → ${serverUrl}`);
    return serverUrl;
  }
  
  console.log(`Using URL as is (default case): ${url}`);
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

// Preload images to ensure they're in the browser cache
export const preloadImage = (url: string | undefined): void => {
  if (!url) return;
  
  try {
    const imageUrl = getValidImageUrl(url);
    const img = new Image();
    img.src = imageUrl;
    console.log(`Preloading image: ${imageUrl}`);
  } catch (error) {
    console.error("Error preloading image:", error);
  }
};
