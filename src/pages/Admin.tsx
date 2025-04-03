
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate, formatDateRange } from '@/utils/formatters';
import { CalendarIcon, MapPinIcon, UserIcon, Trash2Icon, EditIcon, ImageIcon, PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Artwork, Exhibition } from '@/types';
import { getAllArtworks, getAllExhibitions, createArtwork, updateArtwork, deleteArtwork, createExhibition, updateExhibition, deleteExhibition } from '@/services/api';

// Interface for artwork form
interface ArtworkForm {
  id?: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  imageUrl: string;
  dimensions: string;
  medium: string;
  year: number;
  status: 'available' | 'sold';
}

// Interface for exhibition form
interface ExhibitionForm {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  imageUrl: string;
  totalSlots: number;
  availableSlots: number;
  status: 'upcoming' | 'ongoing' | 'past';
}

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
  
  // State for artworks and exhibitions
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for adding/editing artwork
  const [isAddingArtwork, setIsAddingArtwork] = useState(false);
  const [isEditingArtwork, setIsEditingArtwork] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkForm>({
    title: '',
    artist: '',
    description: '',
    price: 0,
    imageUrl: '',
    dimensions: '',
    medium: '',
    year: new Date().getFullYear(),
    status: 'available'
  });
  
  // State for adding/editing exhibition
  const [isAddingExhibition, setIsAddingExhibition] = useState(false);
  const [isEditingExhibition, setIsEditingExhibition] = useState(false);
  const [currentExhibition, setCurrentExhibition] = useState<ExhibitionForm>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    ticketPrice: 0,
    imageUrl: '',
    totalSlots: 0,
    availableSlots: 0,
    status: 'upcoming'
  });

  // Fetch artworks and exhibitions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const artworksData = await getAllArtworks();
        const exhibitionsData = await getAllExhibitions();
        
        setArtworks(artworksData);
        setExhibitions(exhibitionsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  if (!currentUser || !isAdmin) {
    navigate('/admin-login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAction = (action: string, type: string, id: string) => {
    if (type === 'artwork') {
      if (action === 'edit') {
        const artwork = artworks.find(a => a.id === id);
        if (artwork) {
          setCurrentArtwork({
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist,
            description: artwork.description,
            price: artwork.price,
            imageUrl: artwork.imageUrl,
            dimensions: artwork.dimensions || '',
            medium: artwork.medium || '',
            year: artwork.year || new Date().getFullYear(),
            status: artwork.status
          });
          setIsEditingArtwork(true);
          setIsAddingArtwork(false);
        }
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this artwork?')) {
          deleteArtwork(id)
            .then(() => {
              toast({
                title: "Success",
                description: "Artwork deleted successfully",
              });
              // Remove the deleted artwork from state
              setArtworks(artworks.filter(a => a.id !== id));
            })
            .catch(error => {
              console.error('Error deleting artwork:', error);
              toast({
                title: "Error",
                description: "Failed to delete artwork",
                variant: "destructive",
              });
            });
        }
      }
    } else if (type === 'exhibition') {
      if (action === 'edit') {
        const exhibition = exhibitions.find(e => e.id === id);
        if (exhibition) {
          setCurrentExhibition({
            id: exhibition.id,
            title: exhibition.title,
            description: exhibition.description,
            location: exhibition.location,
            startDate: exhibition.startDate,
            endDate: exhibition.endDate,
            ticketPrice: exhibition.ticketPrice,
            imageUrl: exhibition.imageUrl,
            totalSlots: exhibition.totalSlots,
            availableSlots: exhibition.availableSlots,
            status: exhibition.status
          });
          setIsEditingExhibition(true);
          setIsAddingExhibition(false);
        }
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this exhibition?')) {
          deleteExhibition(id)
            .then(() => {
              toast({
                title: "Success",
                description: "Exhibition deleted successfully",
              });
              // Remove the deleted exhibition from state
              setExhibitions(exhibitions.filter(e => e.id !== id));
            })
            .catch(error => {
              console.error('Error deleting exhibition:', error);
              toast({
                title: "Error",
                description: "Failed to delete exhibition",
                variant: "destructive",
              });
            });
        }
      }
    } else {
      toast({
        title: "Action Triggered",
        description: `${action} ${type} with ID: ${id}`,
      });
    }
  };

  const handleAddArtwork = () => {
    setCurrentArtwork({
      title: '',
      artist: '',
      description: '',
      price: 0,
      imageUrl: '',
      dimensions: '',
      medium: '',
      year: new Date().getFullYear(),
      status: 'available'
    });
    setIsAddingArtwork(true);
    setIsEditingArtwork(false);
  };

  const handleAddExhibition = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setCurrentExhibition({
      title: '',
      description: '',
      location: '',
      startDate: today,
      endDate: nextMonth.toISOString().split('T')[0],
      ticketPrice: 0,
      imageUrl: '',
      totalSlots: 0,
      availableSlots: 0,
      status: 'upcoming'
    });
    setIsAddingExhibition(true);
    setIsEditingExhibition(false);
  };

  const handleArtworkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentArtwork(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'year' ? Number(value) : value
    }));
  };

  const handleExhibitionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentExhibition(prev => ({
      ...prev,
      [name]: ['ticketPrice', 'totalSlots', 'availableSlots'].includes(name) ? Number(value) : value
    }));
  };

  const handleStatusChange = (status: any, type: 'artwork' | 'exhibition') => {
    if (type === 'artwork') {
      setCurrentArtwork(prev => ({
        ...prev,
        status: status as 'available' | 'sold'
      }));
    } else {
      setCurrentExhibition(prev => ({
        ...prev,
        status: status as 'upcoming' | 'ongoing' | 'past'
      }));
    }
  };

  const saveArtwork = async () => {
    try {
      if (isEditingArtwork && currentArtwork.id) {
        // Update existing artwork
        const updatedArtwork = await updateArtwork(currentArtwork.id, currentArtwork);
        
        // Update artworks state
        setArtworks(prev => 
          prev.map(artwork => artwork.id === currentArtwork.id ? updatedArtwork : artwork)
        );
        
        toast({
          title: "Success",
          description: "Artwork updated successfully",
        });
      } else {
        // Create new artwork
        const newArtwork = await createArtwork(currentArtwork);
        
        // Add new artwork to state
        setArtworks(prev => [...prev, newArtwork]);
        
        toast({
          title: "Success",
          description: "Artwork created successfully",
        });
      }
      
      // Reset form
      setIsAddingArtwork(false);
      setIsEditingArtwork(false);
    } catch (error) {
      console.error('Error saving artwork:', error);
      toast({
        title: "Error",
        description: "Failed to save artwork",
        variant: "destructive",
      });
    }
  };

  const saveExhibition = async () => {
    try {
      if (isEditingExhibition && currentExhibition.id) {
        // Update existing exhibition
        const updatedExhibition = await updateExhibition(currentExhibition.id, currentExhibition);
        
        // Update exhibitions state
        setExhibitions(prev => 
          prev.map(exhibition => exhibition.id === currentExhibition.id ? updatedExhibition : exhibition)
        );
        
        toast({
          title: "Success",
          description: "Exhibition updated successfully",
        });
      } else {
        // Create new exhibition
        const newExhibition = await createExhibition(currentExhibition);
        
        // Add new exhibition to state
        setExhibitions(prev => [...prev, newExhibition]);
        
        toast({
          title: "Success",
          description: "Exhibition created successfully",
        });
      }
      
      // Reset form
      setIsAddingExhibition(false);
      setIsEditingExhibition(false);
    } catch (error) {
      console.error('Error saving exhibition:', error);
      toast({
        title: "Error",
        description: "Failed to save exhibition",
        variant: "destructive",
      });
    }
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
                  <p className="text-3xl font-bold">{loading ? '...' : artworks.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Exhibitions</CardTitle>
                  <CardDescription>Current and upcoming</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{loading ? '...' : exhibitions.length}</p>
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
            {isAddingArtwork || isEditingArtwork ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-serif font-semibold mb-6">
                  {isEditingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        value={currentArtwork.title} 
                        onChange={handleArtworkInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="artist">Artist</Label>
                      <Input 
                        id="artist" 
                        name="artist" 
                        value={currentArtwork.artist} 
                        onChange={handleArtworkInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        value={currentArtwork.price} 
                        onChange={handleArtworkInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input 
                        id="imageUrl" 
                        name="imageUrl" 
                        value={currentArtwork.imageUrl} 
                        onChange={handleArtworkInputChange} 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input 
                        id="dimensions" 
                        name="dimensions" 
                        value={currentArtwork.dimensions} 
                        onChange={handleArtworkInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="medium">Medium</Label>
                      <Input 
                        id="medium" 
                        name="medium" 
                        value={currentArtwork.medium} 
                        onChange={handleArtworkInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input 
                        id="year" 
                        name="year" 
                        type="number" 
                        value={currentArtwork.year} 
                        onChange={handleArtworkInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" 
                        name="status" 
                        value={currentArtwork.status}
                        onChange={(e) => handleStatusChange(e.target.value, 'artwork')}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={currentArtwork.description} 
                    onChange={handleArtworkInputChange} 
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingArtwork(false);
                      setIsEditingArtwork(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gold hover:bg-gold-dark text-white"
                    onClick={saveArtwork}
                  >
                    {isEditingArtwork ? 'Update Artwork' : 'Save Artwork'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold">Manage Artworks</h2>
                  <Button className="bg-gold hover:bg-gold-dark text-white" onClick={handleAddArtwork}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Artwork
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <Input placeholder="Search artworks..." className="max-w-md" />
                  </div>
                  
                  {loading ? (
                    <div className="p-8 text-center">
                      <p>Loading artworks...</p>
                    </div>
                  ) : (
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
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="exhibitions" className="space-y-6">
            {isAddingExhibition || isEditingExhibition ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-serif font-semibold mb-6">
                  {isEditingExhibition ? 'Edit Exhibition' : 'Add New Exhibition'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        value={currentExhibition.title} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={currentExhibition.location} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        name="startDate" 
                        type="date" 
                        value={currentExhibition.startDate} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" 
                        name="endDate" 
                        type="date" 
                        value={currentExhibition.endDate} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ticketPrice">Ticket Price (KES)</Label>
                      <Input 
                        id="ticketPrice" 
                        name="ticketPrice" 
                        type="number" 
                        value={currentExhibition.ticketPrice} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="totalSlots">Total Slots</Label>
                      <Input 
                        id="totalSlots" 
                        name="totalSlots" 
                        type="number" 
                        value={currentExhibition.totalSlots} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="availableSlots">Available Slots</Label>
                      <Input 
                        id="availableSlots" 
                        name="availableSlots" 
                        type="number" 
                        value={currentExhibition.availableSlots} 
                        onChange={handleExhibitionInputChange} 
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" 
                        name="status" 
                        value={currentExhibition.status}
                        onChange={(e) => handleStatusChange(e.target.value, 'exhibition')}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={currentExhibition.imageUrl} 
                    onChange={handleExhibitionInputChange} 
                    required
                  />
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={currentExhibition.description} 
                    onChange={handleExhibitionInputChange} 
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingExhibition(false);
                      setIsEditingExhibition(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gold hover:bg-gold-dark text-white"
                    onClick={saveExhibition}
                  >
                    {isEditingExhibition ? 'Update Exhibition' : 'Save Exhibition'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold">Manage Exhibitions</h2>
                  <Button className="bg-gold hover:bg-gold-dark text-white" onClick={handleAddExhibition}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Exhibition
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <Input placeholder="Search exhibitions..." className="max-w-md" />
                  </div>
                  
                  {loading ? (
                    <div className="p-8 text-center">
                      <p>Loading exhibitions...</p>
                    </div>
                  ) : (
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
                  )}
                </div>
              </>
            )}
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
