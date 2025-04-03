
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { initiateSTKPush } from '@/utils/mpesa';
import { DollarSign, Loader2 } from 'lucide-react';

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
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    // Simple validation for Kenyan phone numbers
    const phoneRegex = /^(?:\+254|0)([17][0-9]{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid Kenyan phone number (starting with +254, 0, or 07...)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setPaymentStatus('processing');
    
    try {
      if (!order) {
        throw new Error('Order details not found');
      }

      // Generate a reference for this transaction
      const accountReference = order.type === 'artwork' 
        ? `ART-${order.itemId}` 
        : `EXH-${order.itemId}`;

      // Call M-Pesa STK Push
      const response = await initiateSTKPush(
        phoneNumber,
        order.totalAmount,
        order.type,
        order.itemId,
        accountReference
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setCheckoutRequestId(response.CheckoutRequestID);
      
      toast({
        title: "Payment initiated",
        description: "Please check your phone and enter your M-Pesa PIN to complete the payment",
      });
      
      // Simulate waiting for the transaction to complete
      // In a real app, you would poll the server to check the transaction status
      setTimeout(() => {
        // Clear the pending order
        localStorage.removeItem('pendingOrder');
        
        setIsSubmitting(false);
        setPaymentStatus('success');
        
        toast({
          title: "Payment successful",
          description: "Your order has been processed successfully!",
        });
        
        // In a real app, you might want to delay this navigation
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }, 5000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setIsSubmitting(false);
      setPaymentStatus('failed');
      
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process your payment. Please try again.",
        variant: "destructive"
      });
    }
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
              
              {paymentStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-lg">Payment Successful!</h3>
                    <p>Your order has been processed successfully.</p>
                  </div>
                  <Button onClick={() => navigate('/profile')} className="mt-4">
                    View My Orders
                  </Button>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="text-center py-8">
                  <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-lg">Payment Failed</h3>
                    <p>Something went wrong with your payment. Please try again.</p>
                  </div>
                  <Button onClick={() => setPaymentStatus('pending')} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : (
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
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <DollarSign className="mr-2 h-5 w-5" />
                            Pay with M-Pesa
                          </span>
                        )}
                      </Button>
                      
                      <p className="text-sm text-gray-500 text-center">
                        You will receive an M-Pesa prompt on your phone to complete payment
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
