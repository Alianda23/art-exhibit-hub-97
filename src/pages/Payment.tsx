
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

type PendingOrder = {
  type: 'artwork' | 'exhibition';
  itemId: string;
  title: string;
  totalAmount: number;
  name: string;
  email: string;
  phone?: string;
  deliveryAddress?: string;
  slots?: number;
  pricePerSlot?: number;
  price?: number;
  deliveryFee?: number;
};

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get order details from localStorage
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (!pendingOrder) {
      navigate('/');
      return;
    }

    try {
      const orderData = JSON.parse(pendingOrder) as PendingOrder;
      setOrder(orderData);
      setPhoneNumber(orderData.phone || '');
    } catch (error) {
      console.error('Error parsing order data:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number for M-Pesa payment",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate M-Pesa payment process
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your order has been processed successfully! M-Pesa integration will be added soon.",
      });
      
      // Clear the pending order
      localStorage.removeItem('pendingOrder');
      
      setIsSubmitting(false);
      navigate('/profile');
    }, 2000);
  };

  if (!order) {
    return (
      <div className="py-16 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">No Order Found</h1>
        <p className="mb-6">Please select an item to purchase first.</p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="font-serif text-3xl font-bold mb-6 text-center">Payment</h1>
            
            <div className="mb-8">
              <h3 className="font-medium text-lg mb-4">Order Summary</h3>
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <div className="mb-4">
                  <h4 className="font-medium">{order.title}</h4>
                  <p className="text-sm text-gray-600">
                    {order.type === 'artwork' ? 'Artwork Purchase' : 'Exhibition Booking'}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  {order.type === 'artwork' && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span>Price:</span>
                        <span>{formatPrice(order.price || 0)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Delivery:</span>
                        <span>{formatPrice(order.deliveryFee || 0)}</span>
                      </div>
                    </>
                  )}
                  
                  {order.type === 'exhibition' && (
                    <div className="flex justify-between mb-1">
                      <span>Tickets:</span>
                      <span>{order.slots} x {formatPrice(order.pricePerSlot || 0)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-4">M-Pesa Payment</h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number (for M-Pesa) *</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+254..."
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the phone number to receive M-Pesa payment request
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Pay with M-Pesa"}
                    </Button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      You will receive an M-Pesa prompt on your phone to complete payment
                    </p>
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

export default Payment;
