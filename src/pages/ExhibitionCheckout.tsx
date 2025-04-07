
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getExhibition } from '@/services/api';
import { Exhibition } from '@/types';

const ExhibitionCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const slots = parseInt(searchParams.get('slots') || '1');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
          description: "Failed to load exhibition details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [id, toast]);

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

  const totalAmount = exhibition.ticketPrice * slots;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Store order details in localStorage for the payment page
    const orderDetails = {
      type: 'exhibition',
      itemId: exhibition.id,
      title: exhibition.title,
      slots: slots,
      pricePerSlot: exhibition.ticketPrice,
      totalAmount: totalAmount,
      ...formData
    };
    
    localStorage.setItem('pendingOrder', JSON.stringify(orderDetails));
    
    // Navigate to payment page
    navigate(`/payment`);
  };

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="font-serif text-3xl font-bold mb-8 text-center">Booking Details</h1>
            
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
              <div>
                <div className="sticky top-8">
                  <h3 className="font-medium text-lg mb-4">Booking Summary</h3>
                  <div className="bg-secondary rounded-lg p-4 mb-4">
                    <div className="mb-4">
                      <h4 className="font-medium">{exhibition.title}</h4>
                      <p className="text-sm text-gray-600">{exhibition.location}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {new Date(exhibition.startDate).toLocaleDateString()} to {new Date(exhibition.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between mb-1">
                        <span>Tickets:</span>
                        <span>{slots} x {formatPrice(exhibition.ticketPrice)}</span>
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
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        readOnly
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500 mt-1">Name from your account</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        readOnly
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500 mt-1">Email from your account</p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Continue to Payment"}
                      </Button>
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
