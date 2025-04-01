
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exhibitions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Ticket, Users } from 'lucide-react';
import ExhibitionCard from '@/components/ExhibitionCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ExhibitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState(1);

  const exhibition = useMemo(() => {
    return exhibitions.find((e) => e.id === id);
  }, [id]);

  const relatedExhibitions = useMemo(() => {
    if (!exhibition) return [];
    return exhibitions
      .filter((e) => e.id !== id)
      .slice(0, 2);
  }, [id, exhibition]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book exhibition tickets",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (slots > exhibition?.availableSlots!) {
      toast({
        title: "Error",
        description: `Only ${exhibition?.availableSlots} slots available`,
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/checkout/exhibition/${id}?slots=${slots}`);
  };

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

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            <div className="p-6 lg:p-8">
              <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg">
                <img 
                  src={exhibition.imageUrl} 
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            
            <div className="p-6 lg:p-8 flex flex-col">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                {exhibition.title}
              </h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gold" />
                  <span>{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gold" />
                  <span>{exhibition.location}</span>
                </div>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2 text-gold" />
                  <span>{formatPrice(exhibition.ticketPrice)} per ticket</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gold" />
                  <span>{exhibition.availableSlots} slots available</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-medium text-lg mb-2">About the Exhibition</h3>
                <p className="text-gray-600">{exhibition.description}</p>
              </div>
              
              <div className="mt-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="slots">Number of Tickets</Label>
                  <Input
                    id="slots"
                    type="number"
                    min={1}
                    max={exhibition.availableSlots}
                    value={slots}
                    onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-gray-500">
                    Total: {formatPrice(exhibition.ticketPrice * slots)}
                  </p>
                </div>
                
                <Button 
                  onClick={handleBookNow}
                  className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                  disabled={exhibition.availableSlots === 0 || exhibition.status === 'past'}
                >
                  {exhibition.availableSlots > 0 && exhibition.status !== 'past' 
                    ? 'Book Now' 
                    : 'Unavailable'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {relatedExhibitions.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold mb-8">
              Other Exhibitions You Might Like
            </h2>
            <div className="exhibition-grid">
              {relatedExhibitions.map((relatedExhibition) => (
                <ExhibitionCard key={relatedExhibition.id} exhibition={relatedExhibition} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionDetail;
