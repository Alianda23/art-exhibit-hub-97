
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllArtworks, createArtwork, updateArtwork, deleteArtwork, ArtworkData } from '@/services/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArtworkForm from "@/components/ArtworkForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminArtworks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<ArtworkData | null>(null);
  
  // Fetch all artworks
  const { data, isLoading, error } = useQuery({
    queryKey: ['artworks'],
    queryFn: getAllArtworks,
  });

  // Create artwork mutation
  const createArtworkMutation = useMutation({
    mutationFn: createArtwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast({
        title: "Success",
        description: "Artwork created successfully",
      });
      setIsDialogOpen(false);
      setSelectedArtwork(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create artwork. Please try again.",
      });
      console.error("Create artwork error:", error);
    }
  });

  // Update artwork mutation
  const updateArtworkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ArtworkData }) => 
      updateArtwork(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast({
        title: "Success",
        description: "Artwork updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedArtwork(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update artwork. Please try again.",
      });
      console.error("Update artwork error:", error);
    }
  });

  // Delete artwork mutation
  const deleteArtworkMutation = useMutation({
    mutationFn: (id: string) => deleteArtwork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
      setIsAlertDialogOpen(false);
      setArtworkToDelete(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete artwork. Please try again.",
      });
      console.error("Delete artwork error:", error);
      setIsAlertDialogOpen(false);
    }
  });
  
  const handleAddArtwork = () => {
    setSelectedArtwork(null);
    setIsDialogOpen(true);
  };
  
  const handleEditArtwork = (artwork: ArtworkData) => {
    setSelectedArtwork(artwork);
    setIsDialogOpen(true);
  };
  
  const handleDeleteArtwork = (artwork: ArtworkData) => {
    setArtworkToDelete(artwork);
    setIsAlertDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (artworkToDelete?.id) {
      deleteArtworkMutation.mutate(artworkToDelete.id);
    }
  };

  const handleFormSubmit = (formData: ArtworkData) => {
    console.log("Submitting artwork form data");
    
    // Don't modify the image URL - send it as-is to the server
    // The server will handle base64 images properly
    
    if (selectedArtwork?.id) {
      updateArtworkMutation.mutate({ 
        id: selectedArtwork.id, 
        data: formData 
      });
    } else {
      createArtworkMutation.mutate(formData);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Function to handle image URL display
  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    
    // Fix protocol issue in URLs
    if (url.includes(';')) {
      return url.replace(';', ':');
    }
    
    // If it's a relative URL from the server, prefix with API base URL
    if (url.startsWith('/static/')) {
      return `http://localhost:8000${url}`;
    }
    
    // Handle other types of URLs
    if (url.startsWith('http')) {
      return url;
    }
    
    return '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Artworks Management</h1>
        <p>Loading artworks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Artworks Management</h1>
        <p className="text-red-500">Error loading artworks</p>
      </div>
    );
  }

  const artworks = data || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Artworks Management</h1>
        <Button onClick={handleAddArtwork} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Artwork
        </Button>
      </div>
      
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No artworks found
                  </TableCell>
                </TableRow>
              ) : (
                artworks.map((artwork: ArtworkData) => (
                  <TableRow key={artwork.id}>
                    <TableCell>
                      <img 
                        src={getValidImageUrl(artwork.imageUrl)} 
                        alt={artwork.title} 
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          console.error("Image failed to load:", artwork.imageUrl);
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{artwork.title}</TableCell>
                    <TableCell>{artwork.artist}</TableCell>
                    <TableCell>{formatPrice(artwork.price)}</TableCell>
                    <TableCell>
                      <Badge className={artwork.status === 'available' ? 'bg-green-500' : 'bg-gray-500'}>
                        {artwork.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditArtwork(artwork)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteArtwork(artwork)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Artwork Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </DialogTitle>
          </DialogHeader>
          <ArtworkForm
            initialData={selectedArtwork || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this artwork?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              artwork and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminArtworks;
