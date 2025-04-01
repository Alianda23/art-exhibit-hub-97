
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { exhibitions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Calendar, MapPin } from 'lucide-react';

const ExhibitionCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Get slots from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSlots = parseInt(queryParams.get('slots') || '1');
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    slots: initialSlots,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exhibition = useMemo(() => {
    return exhibitions.find((e) => e.id === id);
  }, [id]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'slots' ? parseInt(value) || 1 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.slots > exhibition.availableSlots) {
      toast({
        title: "Error",
        description: `Only ${exhibition.availableSlots} slots available`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your exhibition booking has been confirmed!"
      });
      setIsSubmitting(false);
      navigate('/profile');
    }, 2000);
  };

  const totalAmount = exhibition.ticketPrice * formData.slots;

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="font-serif text-3xl font-bold mb-8 text-center">Exhibition Booking</h1>
            
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
              <div>
                <div className="sticky top-8">
                  <h3 className="font-medium text-lg mb-4">Booking Summary</h3>
                  <div className="bg-secondary rounded-lg p-4 mb-4">
                    <div className="mb-4">
                      <AspectRatio ratio={16/9} className="overflow-hidden rounded-lg mb-3">
                        <img 
                          src={exhibition.imageUrl} 
                          alt={exhibition.title}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <h4 className="font-medium">{exhibition.title}</h4>
                      
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <Calendar className="h-4 w-4 mr-1 text-gold" />
                        <span>{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gold" />
                        <span>{exhibition.location}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between mb-1">
                        <span>Ticket Price:</span>
                        <span>{formatPrice(exhibition.ticketPrice)} x {formData.slots}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number (for M-Pesa) *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254..."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="slots">Number of Tickets *</Label>
                      <Input
                        id="slots"
                        name="slots"
                        type="number"
                        min={1}
                        max={exhibition.availableSlots}
                        value={formData.slots}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {exhibition.availableSlots} slots available
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Pay with M-Pesa"}
                      </Button>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        You will receive an M-Pesa prompt on your phone to complete payment
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionCheckout;
