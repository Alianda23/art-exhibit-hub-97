
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllArtworks } from '@/services/api';
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

const AdminArtworks = () => {
  const { toast } = useToast();
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  
  // Fetch all artworks
  const { data, isLoading, error } = useQuery({
    queryKey: ['artworks'],
    queryFn: getAllArtworks,
  });
  
  const handleAddArtwork = () => {
    toast({
      title: "Not implemented",
      description: "Add artwork functionality will be implemented soon.",
    });
  };
  
  const handleEditArtwork = (artwork) => {
    setSelectedArtwork(artwork);
    toast({
      title: "Not implemented",
      description: "Edit artwork functionality will be implemented soon.",
    });
  };
  
  const handleDeleteArtwork = (artwork) => {
    toast({
      title: "Not implemented",
      description: "Delete artwork functionality will be implemented soon.",
    });
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
                artworks.map((artwork) => (
                  <TableRow key={artwork.id}>
                    <TableCell>
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{artwork.title}</TableCell>
                    <TableCell>{artwork.artist}</TableCell>
                    <TableCell>${artwork.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={artwork.status === 'available' ? 'bg-green-500' : 'bg-red-500'}>
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
    </div>
  );
};

export default AdminArtworks;
