
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from 'date-fns';

interface OrdersManagementProps {
  token: string;
}

interface Order {
  id: string;
  user_name: string;
  item_title?: string;
  date: string;
  amount: number;
  status: string;
  type: string;
  reference_id: string;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({ token }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log("Orders data:", data);
        
        if (response.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const renderStatus = (status: string) => {
    const variant = status.toLowerCase() === 'completed' ? 'default' : 
                   status.toLowerCase() === 'pending' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="uppercase">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading orders...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500 font-medium mb-2">Error</div>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-center my-6">Orders Management</h1>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-1 mb-6">
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            {orders.length === 0 ? (
              <CardContent className="p-6 text-center">
                <p>No orders found.</p>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.item_title || order.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatus(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link to={`/admin/orders/${order.id}/${order.type}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersManagement;
