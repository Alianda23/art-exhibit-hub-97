
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
import { Check } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form for first step
    if (!formData.deliveryAddress) {
      toast({
        title: "Error",
        description: "Please fill in the delivery address",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${currentStep >= 1 ? 'bg-gold text-white' : 'bg-gray-200'}`}>
                    {currentStep > 1 ? <Check className="h-5 w-5" /> : 1}
                  </div>
                  <div className={`h-1 w-20 ${currentStep >= 2 ? 'bg-gold' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${currentStep >= 2 ? 'bg-gold text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex text-sm">
                  <div className="w-20 text-center">Delivery</div>
                  <div className="w-20 text-center">Review & Pay</div>
                </div>
              </div>
            </div>
            
            <h1 className="font-serif text-3xl font-bold mb-8 text-center">
              {currentStep === 1 ? "Delivery Details" : "Review & Payment"}
            </h1>
            
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
                {currentStep === 1 ? (
                  <form onSubmit={handleContinue}>
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
                        >
                          Continue to Review
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="text-gray-600">Name:</div>
                          <div>{formData.name}</div>
                          <div className="text-gray-600">Email:</div>
                          <div>{formData.email}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Delivery Address</h3>
                        <p className="text-sm">{formData.deliveryAddress}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Order Details</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="text-gray-600">Artwork:</div>
                          <div>{artwork.title} by {artwork.artist}</div>
                          <div className="text-gray-600">Artwork Price:</div>
                          <div>{formatPrice(artwork.price)}</div>
                          <div className="text-gray-600">Delivery Fee:</div>
                          <div>{formatPrice(1000)}</div>
                          <div className="text-gray-600">Total Amount:</div>
                          <div className="font-semibold">{formatPrice(artwork.price + 1000)}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-1/3"
                          onClick={() => setCurrentStep(1)}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="w-2/3 bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Continue to Payment"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCheckout;
