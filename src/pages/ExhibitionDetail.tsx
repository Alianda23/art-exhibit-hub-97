import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Exhibition } from '@/types';
import { getExhibition } from '@/services/api';
import { Calendar, MapPin, Users } from 'lucide-react';

const ExhibitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Function to get a valid image URL and handle common issues
  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    
    // Fix protocol issue in URLs (common in the dataset)
    if (url.includes(';')) {
      return url.replace(';', ':');
    }
    
    // If it's a relative URL from the server, prefix with API base URL if needed
    if (url.startsWith('/static/')) {
      // If your backend is on a different port or domain, you'd need to adjust this
      return `http://localhost:8000${url}`;
    }
    
    return url;
  };

  useEffect(() => {
    const fetchExhibition = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getExhibition(id);
        setExhibition(data);
      } catch (error) {
        console.error('Failed to fetch exhibition:', error);
        toast({
          title: "Error",
          description: "Failed to load exhibition details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [id, toast]);

  const handleTicketCountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTicketCount(parseInt(event.target.value, 10));
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book tickets",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    navigate(`/checkout/exhibition/${id}?slots=${ticketCount}`);
  };

  if (loading) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Loading Exhibition...</h1>
        <p className="mb-6">Please wait while we fetch the exhibition details.</p>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Exhibition Not Found</h1>
        <p className="mb-6">The exhibition you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/exhibitions')}>
          Back to Exhibitions
        </Button>
      </div>
    );
  }

  const isSoldOut = exhibition.availableSlots === 0;
  const isPast = new Date(exhibition.endDate) < new Date();
  const maxTickets = Math.min(exhibition.availableSlots, 10);

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            <div className="p-6 lg:p-8">
              <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
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
            </div>
            
            <div className="p-6 lg:p-8 flex flex-col">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                {exhibition.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1 text-gold" />
                <span className="text-sm">{exhibition.location}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-6">
                <Calendar className="h-4 w-4 mr-1 text-gold" />
                <span className="text-sm">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
              </div>
              
              <div className="bg-secondary p-4 rounded-md mb-6">
                <p className="text-2xl font-medium text-gold">
                  {formatPrice(exhibition.ticketPrice)} per slot
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isSoldOut ? 'Sold Out' : `${exhibition.availableSlots} slots available`}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="font-medium text-lg mb-2">Description</h3>
                <p className="text-gray-600">{exhibition.description}</p>
              </div>

              {(!isSoldOut && !isPast) && (
                <div className="mb-6">
                  <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-700">
                    Number of Tickets
                  </label>
                  <select
                    id="ticketCount"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gold focus:border-gold-500 sm:text-sm rounded-md"
                    value={ticketCount}
                    onChange={handleTicketCountChange}
                  >
                    {Array.from({ length: maxTickets }, (_, i) => i + 1).map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mt-auto">
                <Button 
                  onClick={handleBookNow}
                  className={`w-full py-6 text-lg ${
                    isSoldOut || isPast
                      ? 'bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gold hover:bg-gold-dark text-white'
                  }`}
                  disabled={isSoldOut || isPast}
                >
                  {isSoldOut ? 'Sold Out' : isPast ? 'Exhibition Ended' : 'Book Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetail;
