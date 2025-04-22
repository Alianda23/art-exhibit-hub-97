
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate } from '@/utils/formatters';
import { CalendarIcon, MapPinIcon, UserIcon, PhoneIcon, MailIcon, Loader2 } from 'lucide-react';
import { getUserOrders, generateExhibitionTicket } from '@/utils/mpesa';
import { useToast } from '@/hooks/use-toast';

type UserOrder = {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artist: string;
  date: string;
  price: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
};

type UserBooking = {
  id: string;
  exhibitionId: string;
  exhibitionTitle: string;
  date: string;
  location: string;
  slots: number;
  totalAmount: number;
  status: string;
};

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const fetchUserOrders = async () => {
    if (!currentUser.id) return;
    
    setLoading(true);
    try {
      const response = await getUserOrders(currentUser.id);
      console.log("User orders response:", response);
      
      if (response.orders) {
        setOrders(response.orders);
      }
      
      if (response.bookings) {
        setBookings(response.bookings);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders and bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePrintTicket = async (bookingId: string) => {
    try {
      const response = await generateExhibitionTicket(bookingId);
      if (response.ticketUrl) {
        window.open(response.ticketUrl, '_blank');
      } else {
        throw new Error('Failed to generate ticket');
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to generate ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-serif font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" onValueChange={setActiveTab} className="bg-white rounded-lg shadow-md">
          <TabsList className="grid w-full grid-cols-3 rounded-t-lg">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Exhibition Bookings</TabsTrigger>
            <TabsTrigger value="orders">Artwork Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-3 text-gold" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{currentUser.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MailIcon className="h-5 w-5 mr-3 text-gold" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{currentUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-3 text-gold" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{currentUser.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">Edit Profile</Button>
                      <Button variant="outline" className="w-full">Change Password</Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={handleLogout}
                      >
                        Log Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="p-6">
            <h2 className="text-xl font-serif font-semibold mb-4">Your Exhibition Bookings</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <span className="ml-2">Loading your bookings...</span>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{booking.exhibitionTitle}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gold" />
                            <span className="text-sm">{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gold" />
                            <span className="text-sm">{booking.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm mb-1">
                            <span className="text-gray-600">Tickets: </span>
                            <span className="font-medium">{booking.slots}</span>
                          </div>
                          <div className="text-sm mb-2">
                            <span className="text-gray-600">Total: </span>
                            <span className="font-medium">{formatPrice(booking.totalAmount)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {booking.status}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePrintTicket(booking.id)}
                            >
                              Print Ticket
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">You haven't booked any exhibitions yet.</p>
                <Button 
                  className="mt-4 bg-gold hover:bg-gold-dark text-white"
                  onClick={() => navigate('/exhibitions')}
                >
                  Explore Exhibitions
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="p-6">
            <h2 className="text-xl font-serif font-semibold mb-4">Your Artwork Orders</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <span className="ml-2">Loading your orders...</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{order.artworkTitle}</h3>
                          <p className="text-gray-600 text-sm">by {order.artist}</p>
                          <div className="flex items-center text-gray-600 mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gold" />
                            <span className="text-sm">Ordered on {formatDate(order.date)}</span>
                          </div>
                          {order.deliveryAddress && (
                            <div className="text-gray-600 mt-2 text-sm">
                              <p><strong>Delivery Address:</strong></p>
                              <p>{order.deliveryAddress}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm mb-1">
                            <span className="text-gray-600">Price: </span>
                            <span className="font-medium">{formatPrice(order.price)}</span>
                          </div>
                          {order.deliveryFee > 0 && (
                            <div className="text-sm mb-1">
                              <span className="text-gray-600">Delivery: </span>
                              <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
                            </div>
                          )}
                          <div className="text-sm mb-2">
                            <span className="text-gray-600">Total: </span>
                            <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}
                          `}>
                            {order.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">You haven't purchased any artworks yet.</p>
                <Button 
                  className="mt-4 bg-gold hover:bg-gold-dark text-white"
                  onClick={() => navigate('/artworks')}
                >
                  Explore Artworks
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
