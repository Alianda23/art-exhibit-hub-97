
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate } from '@/utils/formatters';
import { CalendarIcon, MapPinIcon, UserIcon, PhoneIcon, MailIcon } from 'lucide-react';

// Mock data for bookings and orders
const mockBookings = [
  {
    id: 'booking1',
    exhibitionId: 'exh1',
    exhibitionTitle: 'Contemporary Kenyan Visions',
    date: '2023-09-20',
    location: 'Nairobi National Museum, Nairobi',
    slots: 2,
    totalAmount: 3000,
    status: 'confirmed'
  },
  {
    id: 'booking2',
    exhibitionId: 'exh3',
    exhibitionTitle: 'Coastal Textures: Art from the Kenyan Shore',
    date: '2023-10-15',
    location: 'Fort Jesus Museum, Mombasa',
    slots: 1,
    totalAmount: 1200,
    status: 'confirmed'
  }
];

const mockOrders = [
  {
    id: 'order1',
    artworkId: 'art1',
    artworkTitle: 'Maasai Market Sunset',
    artist: 'James Mwangi',
    date: '2023-09-15',
    price: 45000,
    status: 'delivered'
  },
  {
    id: 'order2',
    artworkId: 'art5',
    artworkTitle: 'Lake Turkana Dreams',
    artist: 'Michael Kimani',
    date: '2023-08-28',
    price: 62000,
    status: 'processing'
  }
];

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {mockBookings.length > 0 ? (
              <div className="space-y-4">
                {mockBookings.map((booking) => (
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
                          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {booking.status}
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
            {mockOrders.length > 0 ? (
              <div className="space-y-4">
                {mockOrders.map((order) => (
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
                        </div>
                        <div className="text-right">
                          <div className="text-sm mb-2">
                            <span className="text-gray-600">Price: </span>
                            <span className="font-medium">{formatPrice(order.price)}</span>
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          `}>
                            {order.status}
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
