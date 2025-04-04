
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

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  exhibitionId: string;
  exhibitionTitle: string;
  bookingDate: string;
  ticketCode: string;
  slots: number;
  status: 'active' | 'used' | 'cancelled';
}

const AdminTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Check if user is an admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch all tickets
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
  });

  const handlePrintTicket = async (bookingId: string) => {
    try {
      const response = await generateExhibitionTicket(bookingId);
      
      // Create a blob from the PDF data
      const pdfBlob = new Blob([response.pdfData], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open the PDF in a new window
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Success",
        description: "Ticket generated successfully",
      });
    } catch (error) {
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
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Exhibition Tickets</h1>
        <p className="text-red-500">Error loading tickets</p>
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
            <p className="text-gray-500">No tickets to display</p>
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
