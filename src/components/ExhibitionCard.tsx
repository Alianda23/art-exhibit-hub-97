
import React from 'react';
import { Link } from 'react-router-dom';
import { Exhibition } from '@/types';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { MapPin, Calendar, Ban } from 'lucide-react';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

const ExhibitionCard = ({ exhibition }: ExhibitionCardProps) => {
  const isSoldOut = exhibition.availableSlots === 0;

  // Function to get a valid image URL and handle common issues
  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    
    // Fix protocol issue in URLs (common in the dataset)
    if (url.includes(';')) {
      return url.replace(';', ':');
    }
    
    // If it's a relative URL from the server, prefix with API base URL
    if (url.startsWith('/static/')) {
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
        <AspectRatio ratio={16/9}>
          <img
            src={getValidImageUrl(exhibition.imageUrl)}
            alt={exhibition.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Exhibition image failed to load:", exhibition.imageUrl);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        {isSoldOut && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
            <Ban className="h-4 w-4" />
            <span>Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">
          {exhibition.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1 text-gold" />
          <span className="text-sm">{exhibition.location}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <Calendar className="h-4 w-4 mr-1 text-gold" />
          <span className="text-sm">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium text-lg text-gold">
            {formatPrice(exhibition.ticketPrice)}
          </p>
          <p className="text-sm text-gray-600">
            {isSoldOut ? (
              <span className="text-red-500 font-medium">No slots available</span>
            ) : (
              `${exhibition.availableSlots} slots available`
            )}
          </p>
        </div>
        <Link to={`/exhibitions/${exhibition.id}`}>
          <Button className="w-full bg-gold hover:bg-gold-dark text-white">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ExhibitionCard;
