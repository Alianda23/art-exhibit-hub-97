
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Printer, FileText, Home, Loader2, Mail } from 'lucide-react';
import { generateExhibitionTicket } from '@/utils/mpesa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  
  // Get order details from URL params
  const orderType = searchParams.get('type');
  const orderId = searchParams.get('id');
  const title = searchParams.get('title');
  
  useEffect(() => {
    // Clear the pending order from localStorage
    localStorage.removeItem('pendingOrder');
    
    // Show success toast
    toast({
      title: `${orderType === 'artwork' ? 'Order' : 'Booking'} Successful!`,
      description: `Your ${orderType === 'artwork' ? 'purchase' : 'exhibition booking'} has been processed successfully.`,
    });
    
    // For exhibition bookings, try to get the ticket URL
    if (orderType === 'exhibition' && orderId) {
      fetchTicket(orderId);
    }
  }, [orderType, orderId, toast]);
  
  const fetchTicket = async (bookingId: string) => {
    setLoading(true);
    try {
      const response = await generateExhibitionTicket(bookingId);
      if (response.ticketUrl) {
        setTicketUrl(response.ticketUrl);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast({
        title: "Error fetching ticket",
        description: "Your booking is confirmed, but we couldn't generate the ticket. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrintTicket = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank');
    }
  };
  
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
                {orderType === 'artwork' ? 'Order Confirmed!' : 'Booking Successful!'}
              </h1>
              
              <p className="text-lg mb-6">
                {orderType === 'artwork' 
                  ? `Your purchase of "${title}" has been processed successfully.` 
                  : `Your booking for "${title}" has been confirmed.`}
              </p>
              
              <p className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                {orderType === 'artwork'
                  ? "We'll email you with the delivery details shortly."
                  : "A confirmation email with your ticket has been sent to your registered email address."}
              </p>
              
              {orderType === 'exhibition' && (
                <p className="text-sm text-gray-600 mb-8">
                  Please check your email and save the ticket for your records.
                </p>
              )}
              
              <div className="space-y-4 w-full">
                {orderType === 'exhibition' && (
                  <Button 
                    onClick={handlePrintTicket}
                    className="w-full"
                    disabled={loading || !ticketUrl}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating ticket...
                      </>
                    ) : (
                      <>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Ticket
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/profile')} 
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {orderType === 'artwork' ? 'View My Orders' : 'View My Bookings'}
                </Button>
                
                <Button 
                  onClick={() => navigate('/')} 
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
