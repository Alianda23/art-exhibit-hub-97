
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate } from '@/utils/formatters';
import { artworks, exhibitions } from '@/data/mockData';
import { CalendarIcon, MapPinIcon, UserIcon, Trash2Icon, EditIcon, ImageIcon, PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for bookings and orders
const mockBookings = [
  {
    id: 'booking1',
    userId: 'user1',
    userName: 'John Kamau',
    email: 'john@example.com',
    phone: '+254723456789',
    exhibitionId: 'exh1',
    exhibitionTitle: 'Contemporary Kenyan Visions',
    date: '2023-09-20',
    slots: 2,
    totalAmount: 3000,
    status: 'confirmed'
  },
  {
    id: 'booking2',
    userId: 'user2',
    userName: 'Sarah Wanjiku',
    email: 'sarah@example.com',
    phone: '+254734567890',
    exhibitionId: 'exh3',
    exhibitionTitle: 'Coastal Textures: Art from the Kenyan Shore',
    date: '2023-10-15',
    slots: 1,
    totalAmount: 1200,
    status: 'confirmed'
  }
];

const mockOrders = [
  {
    id: 'order1',
    userId: 'user1',
    userName: 'John Kamau',
    email: 'john@example.com',
    phone: '+254723456789',
    address: '123 Moi Avenue, Nairobi',
    artworkId: 'art1',
    artworkTitle: 'Maasai Market Sunset',
    artist: 'James Mwangi',
    date: '2023-09-15',
    price: 45000,
    status: 'delivered'
  },
  {
    id: 'order2',
    userId: 'user2',
    userName: 'Sarah Wanjiku',
    email: 'sarah@example.com',
    phone: '+254734567890',
    address: '456 Kenyatta Avenue, Nairobi',
    artworkId: 'art5',
    artworkTitle: 'Lake Turkana Dreams',
    artist: 'Michael Kimani',
    date: '2023-08-28',
    price: 62000,
    status: 'processing'
  }
];

const mockMessages = [
  {
    id: 'msg1',
    name: 'Daniel Omondi',
    email: 'daniel@example.com',
    phone: '+254712345678',
    message: 'I am interested in commissioning a piece similar to "Maasai Market Sunset". Could you please provide more information about the artist and their availability for commissions?',
    date: '2023-09-22',
    status: 'new'
  },
  {
    id: 'msg2',
    name: 'Amina Hassan',
    email: 'amina@example.com',
    phone: '+254723456789',
    message: 'Hello, I would like to know if you offer private viewings for groups. We are a school art club with 15 students interested in visiting your gallery.',
    date: '2023-09-20',
    status: 'read'
  }
];

const Admin = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser || !isAdmin) {
    navigate('/admin-login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAction = (action: string, type: string, id: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} ${type} with ID: ${id}`,
    });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold">
            <span className="text-gold">Admin</span> Dashboard
          </h1>
          
          <Button 
            variant="ghost" 
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 md:w-auto bg-white rounded-lg shadow-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Artworks</CardTitle>
                  <CardDescription>Available for purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{artworks.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Exhibitions</CardTitle>
                  <CardDescription>Current and upcoming</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{exhibitions.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Artwork Orders</CardTitle>
                  <CardDescription>Total sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{mockOrders.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Exhibition Bookings</CardTitle>
                  <CardDescription>Total tickets sold</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{mockBookings.reduce((acc, booking) => acc + booking.slots, 0)}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest artwork purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockOrders.length > 0 ? (
                    <div className="space-y-4">
                      {mockOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex justify-between items-center border-b pb-3">
                          <div>
                            <p className="font-medium">{order.artworkTitle}</p>
                            <p className="text-sm text-gray-600">by {order.userName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(order.price)}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No orders yet</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Latest contact inquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockMessages.length > 0 ? (
                    <div className="space-y-4">
                      {mockMessages.slice(0, 3).map((message) => (
                        <div key={message.id} className="flex justify-between items-start border-b pb-3">
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-gray-600">{message.email}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{message.message}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{formatDate(message.date)}</p>
                            <div className={`mt-1 inline-block px-2 py-1 rounded text-xs
                              ${message.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                            `}>
                              {message.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No messages yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="artworks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-semibold">Manage Artworks</h2>
              <Button className="bg-gold hover:bg-gold-dark text-white">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Artwork
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <Input placeholder="Search artworks..." className="max-w-md" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artwork</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {artworks.map((artwork) => (
                      <tr key={artwork.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                              <div className="text-sm text-gray-500">{artwork.year}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{artwork.artist}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(artwork.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${artwork.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {artwork.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600"
                              onClick={() => handleAction('edit', 'artwork', artwork.id)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-red-600"
                              onClick={() => handleAction('delete', 'artwork', artwork.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exhibitions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-semibold">Manage Exhibitions</h2>
              <Button className="bg-gold hover:bg-gold-dark text-white">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Exhibition
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <Input placeholder="Search exhibitions..." className="max-w-md" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhibition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exhibitions.map((exhibition) => (
                      <tr key={exhibition.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={exhibition.imageUrl}
                                alt={exhibition.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{exhibition.title}</div>
                              <div className="text-sm text-gray-500">{exhibition.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{exhibition.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateRange(exhibition.startDate, exhibition.endDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(exhibition.ticketPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {exhibition.availableSlots} / {exhibition.totalSlots}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600"
                              onClick={() => handleAction('edit', 'exhibition', exhibition.id)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-red-600"
                              onClick={() => handleAction('delete', 'exhibition', exhibition.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Artwork Orders</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <Input placeholder="Search orders..." className="max-w-md" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artwork</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.artworkTitle}</div>
                          <div className="text-sm text-gray-500">by {order.artist}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(order.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-blue-600"
                            onClick={() => handleAction('view', 'order', order.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Exhibition Bookings</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <Input placeholder="Search bookings..." className="max-w-md" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhibition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.exhibitionTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.slots}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(booking.totalAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-blue-600"
                            onClick={() => handleAction('view', 'booking', booking.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Contact Messages</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <Input placeholder="Search messages..." className="max-w-md" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockMessages.map((message) => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{message.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.email}</div>
                          <div className="text-sm text-gray-500">{message.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">{message.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(message.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${message.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                          `}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600"
                              onClick={() => handleAction('view', 'message', message.id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-green-600"
                              onClick={() => handleAction('reply', 'message', message.id)}
                            >
                              Reply
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
