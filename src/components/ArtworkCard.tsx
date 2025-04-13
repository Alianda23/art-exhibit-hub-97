
import React from 'react';
import { Link } from 'react-router-dom';
import { Artwork } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  // Function to get a valid image URL and handle common issues
  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    
    // Fix protocol issue in URLs (common in the dataset)
    if (url.includes(';')) {
      return url.replace(';', ':');
    }
    
    // If it's a relative URL from the server, prefix with API base URL
    if (url.startsWith('/static/')) {
      // Use dynamic hostname from window.location
      return `${window.location.protocol}//${window.location.hostname}:8000${url}`;
    }
    
    // Handle other types of URLs
    if (url.startsWith('http')) {
      return url;
    }
    
    return '/placeholder.svg';
  };

  return (
    <div className="group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <div className="image-container relative">
        <AspectRatio ratio={4/3}>
          <img
            src={getValidImageUrl(artwork.imageUrl)}
            alt={artwork.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Artwork image failed to load:", artwork.imageUrl);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        {artwork.status === 'sold' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium">
            Sold
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">
          {artwork.title}
        </h3>
        <p className="text-gray-600 mb-3">
          By <span className="font-medium">{artwork.artist}</span>
        </p>
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium text-lg text-gold">
            {formatPrice(artwork.price)}
          </p>
          {artwork.status === 'sold' ? (
            <Badge className="bg-red-500 text-white">Sold Out</Badge>
          ) : (
            <Badge className="bg-green-500 text-white">Available</Badge>
          )}
        </div>
        <Link to={`/artworks/${artwork.id}`}>
          <Button className="w-full bg-gold hover:bg-gold-dark text-white">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ArtworkCard;
