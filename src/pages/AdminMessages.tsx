
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAdmin, getAllContactMessages, updateMessageStatus } from '@/services/api';
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

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-500';
    case 'read':
      return 'bg-yellow-500';
    case 'replied':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const AdminMessages = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Check if user is an admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch all contact messages
  const { data, isLoading, error } = useQuery({
    queryKey: ['contactMessages'],
    queryFn: getAllContactMessages,
  });

  // Mutation for updating message status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'new' | 'read' | 'replied' }) => 
      updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      toast({
        title: "Status updated",
        description: "Message status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: 'new' | 'read' | 'replied') => {
    updateStatusMutation.mutate({ id, status });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p'); // e.g. "Apr 29, 2023, 5:30 PM"
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
        <p className="text-red-500">Error loading messages</p>
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Messages ({messages.length})</h2>
          
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages to display</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message: Message) => (
                    <TableRow key={message.id}>
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{formatDate(message.date)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          {selectedMessage ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Message Details</h2>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                  >
                    Mark as Read
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-green-50 text-green-600 hover:bg-green-100"
                    onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                  >
                    Mark as Replied
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">From:</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date:</p>
                    <p>{formatDate(selectedMessage.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone:</p>
                    <p>{selectedMessage.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Status:</p>
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {selectedMessage.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Message:</p>
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminMessages;
