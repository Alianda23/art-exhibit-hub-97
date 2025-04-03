
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artworks } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const ArtworkCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    deliveryAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const artwork = useMemo(() => {
    return artworks.find((a) => a.id === id);
  }, [id]);

  if (!artwork) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Artwork Not Found</h1>
        <p className="mb-6">The artwork you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/artworks')}>
          Back to Artworks
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.deliveryAddress) {
      toast({
        title: "Error",
        description: "Please fill in the delivery address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store order details in localStorage for the payment page
    const orderDetails = {
      type: 'artwork',
      itemId: artwork.id,
      title: artwork.title,
      price: artwork.price,
      deliveryFee: 1000,
      totalAmount: artwork.price + 1000,
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
            <h1 className="font-serif text-3xl font-bold mb-8 text-center">Delivery Details</h1>
            
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-8">
              <div>
                <div className="sticky top-8">
                  <h3 className="font-medium text-lg mb-4">Order Summary</h3>
                  <div className="bg-secondary rounded-lg p-4 mb-4">
                    <div className="mb-4">
                      <AspectRatio ratio={3/4} className="overflow-hidden rounded-lg mb-3">
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <h4 className="font-medium">{artwork.title}</h4>
                      <p className="text-sm text-gray-600">by {artwork.artist}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between mb-1">
                        <span>Price:</span>
                        <span>{formatPrice(artwork.price)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Delivery:</span>
                        <span>{formatPrice(1000)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>{formatPrice(artwork.price + 1000)}</span>
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
                    
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <Textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        placeholder="Enter your full delivery address"
                      />
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

export default ArtworkCheckout;
