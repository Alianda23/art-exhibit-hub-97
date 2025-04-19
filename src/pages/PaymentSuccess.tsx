
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Home } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Get order details from URL params
  const orderType = searchParams.get('type');
  const orderId = searchParams.get('id');
  const title = searchParams.get('title');
  
  useEffect(() => {
    // Clear the pending order from localStorage
    localStorage.removeItem('pendingOrder');
    
    // Show success toast and redirect after a delay
    toast({
      title: `${orderType === 'artwork' ? 'Purchase' : 'Booking'} Successful!`,
      description: `Your ${orderType === 'artwork' ? 'artwork purchase' : 'exhibition booking'} has been completed successfully.`,
      variant: "default",
    });
    
    // Redirect to profile page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [orderType, navigate, toast]);
  
  return (
    <div className="py-16 px-4 min-h-screen bg-secondary">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-serif font-bold mb-4">
                {orderType === 'artwork' ? 'Purchase Successful!' : 'Booking Confirmed!'}
              </h1>
              
              <p className="text-lg mb-6">
                {orderType === 'artwork' 
                  ? `Thank you for purchasing "${title}". You will be redirected to your profile page shortly.` 
                  : `Your booking for "${title}" has been confirmed. You will be redirected to your profile page shortly.`}
              </p>
              
              <Button 
                onClick={() => navigate('/profile')} 
                variant="outline"
                className="w-full mt-4"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Profile Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
