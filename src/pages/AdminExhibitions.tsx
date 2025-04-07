
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllExhibitions } from '@/services/api';
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
import { format } from 'date-fns';

const AdminExhibitions = () => {
  const { toast } = useToast();
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  
  // Fetch all exhibitions
  const { data, isLoading, error } = useQuery({
    queryKey: ['exhibitions'],
    queryFn: getAllExhibitions,
  });
  
  const handleAddExhibition = () => {
    toast({
      title: "Not implemented",
      description: "Add exhibition functionality will be implemented soon.",
    });
  };
  
  const handleEditExhibition = (exhibition) => {
    setSelectedExhibition(exhibition);
    toast({
      title: "Not implemented",
      description: "Edit exhibition functionality will be implemented soon.",
    });
  };
  
  const handleDeleteExhibition = (exhibition) => {
    toast({
      title: "Not implemented",
      description: "Delete exhibition functionality will be implemented soon.",
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'past':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Exhibitions Management</h1>
        <p>Loading exhibitions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Exhibitions Management</h1>
        <p className="text-red-500">Error loading exhibitions</p>
      </div>
    );
  }

  const exhibitions = data || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exhibitions Management</h1>
        <Button onClick={handleAddExhibition} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Exhibition
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exhibitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No exhibitions found
                  </TableCell>
                </TableRow>
              ) : (
                exhibitions.map((exhibition) => (
                  <TableRow key={exhibition.id}>
                    <TableCell>
                      <img 
                        src={exhibition.imageUrl} 
                        alt={exhibition.title} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{exhibition.title}</TableCell>
                    <TableCell>
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </TableCell>
                    <TableCell>{exhibition.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(exhibition.status)}>
                        {exhibition.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditExhibition(exhibition)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteExhibition(exhibition)}
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

export default AdminExhibitions;
