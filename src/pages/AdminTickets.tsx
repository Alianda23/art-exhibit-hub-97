import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAdmin, getAllTickets, generateExhibitionTicket } from '@/services/api';
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { createImageSrc } from '@/utils/imageUtils';

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  exhibitionId: string;
  exhibitionTitle: string;
  exhibitionImageUrl?: string;
  bookingDate: string;
  ticketCode: string;
  slots: number;
  status: 'active' | 'used' | 'cancelled';
}

const AdminTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login');
      return;
    }
    
    console.log("Admin tickets page loaded, user is admin");
  }, [navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
  });

  useEffect(() => {
    console.log("Tickets data:", data);
    if (error) {
      console.error("Error fetching tickets:", error);
    }
  }, [data, error]);

  const handlePrintTicket = async (bookingId: string) => {
    try {
      console.log(`Generating ticket for booking: ${bookingId}`);
      const response = await generateExhibitionTicket(bookingId);
      console.log("Ticket generation response:", response);
      
      const pdfBlob = new Blob([response.pdfData], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Success",
        description: "Ticket generated successfully",
      });
    } catch (error) {
      console.error("Error generating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to generate ticket",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'used':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Exhibition Tickets</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Exhibition Tickets</h1>
        <div className="flex justify-center items-center h-64">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading tickets</p>
            <p>{(error as Error).message || "Unknown error occurred"}</p>
          </div>
        </div>
      </div>
    );
  }

  const tickets = data?.tickets || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Exhibition Tickets</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">All Tickets ({tickets.length})</h2>
          
          {tickets.length === 0 ? (
            <p className="text-gray-500 p-4 text-center">No tickets to display</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Exhibition</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket: Ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.userName}</TableCell>
                      <TableCell>{ticket.exhibitionTitle}</TableCell>
                      <TableCell>{formatDate(ticket.bookingDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                            onClick={() => handlePrintTicket(ticket.id)}
                          >
                            Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          {selectedTicket ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ticket Details</h2>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                  onClick={() => handlePrintTicket(selectedTicket.id)}
                >
                  Print Ticket
                </Button>
              </div>
              
              <div className="space-y-4">
                {selectedTicket.exhibitionImageUrl && (
                  <div className="mb-4">
                    <img 
                      src={createImageSrc(selectedTicket.exhibitionImageUrl)} 
                      alt={selectedTicket.exhibitionTitle} 
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        console.error(`Failed to load image: ${selectedTicket.exhibitionImageUrl}`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">User:</p>
                    <p className="font-medium">{selectedTicket.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Exhibition:</p>
                    <p className="font-medium">{selectedTicket.exhibitionTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Date:</p>
                    <p>{formatDate(selectedTicket.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Slots:</p>
                    <p>{selectedTicket.slots}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ticket Code:</p>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedTicket.ticketCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status:</p>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">Select a ticket to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminTickets;
