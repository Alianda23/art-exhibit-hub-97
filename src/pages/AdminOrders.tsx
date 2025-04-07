
import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

// Mock data for orders
const mockOrders = [
  {
    id: "ord-001",
    customer: "John Doe",
    email: "john@example.com",
    date: "2023-04-15T10:30:00",
    artwork: "Abstract Sunset",
    amount: 2500,
    status: "completed"
  },
  {
    id: "ord-002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    date: "2023-04-18T14:20:00",
    artwork: "Mountain View",
    amount: 1800,
    status: "processing"
  },
  {
    id: "ord-003",
    customer: "Michael Wong",
    email: "michael@example.com",
    date: "2023-04-20T09:15:00",
    artwork: "Ocean Waves",
    amount: 3200,
    status: "completed"
  }
];

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PP p');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">All Orders</h2>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>${order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        <Card className="p-4">
          {selectedOrder ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Order ID:</p>
                    <p className="font-mono">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date:</p>
                    <p>{formatDate(selectedOrder.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer:</p>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p>{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Artwork:</p>
                    <p>{selectedOrder.artwork}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount:</p>
                    <p className="font-medium">${selectedOrder.amount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Status:</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Download Invoice
                  </Button>
                  {selectedOrder.status === 'processing' && (
                    <Button size="sm">
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">Select an order to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;
