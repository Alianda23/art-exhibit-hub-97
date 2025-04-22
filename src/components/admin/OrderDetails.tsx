
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailsProps {
  token: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ token }) => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching order details for ${type} order #${id}`);
        const response = await fetch(`/api/orders/${id}?type=${type}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        console.log("Order details response:", data);
        
        if (response.ok) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id && type && token) {
      fetchOrderDetails();
    }
  }, [id, type, token]);

  const handleBack = () => {
    navigate('/admin/orders');
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </Button>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-red-500 font-medium mb-2">Error</div>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </Button>
        <Card>
          <CardContent className="text-center p-6">
            <p>No order details found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format the order date
  const orderDate = order.order_date 
    ? new Date(order.order_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="space-y-4 p-4">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <FiArrowLeft className="mr-2" /> Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order.id}</CardTitle>
            <Badge 
              variant={order.payment_status === 'completed' ? 'success' : 'warning'}
              className="uppercase"
            >
              {order.payment_status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Placed on {orderDate}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.type === 'artwork' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Artwork Details</h3>
                  <div className="flex gap-4 mb-4">
                    {order.artwork_image && (
                      <div className="rounded-md overflow-hidden w-24 h-24 flex-shrink-0">
                        <img 
                          src={order.artwork_image} 
                          alt={order.artwork_title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{order.artwork_title}</div>
                      <div className="text-sm text-muted-foreground">by {order.artist}</div>
                      {order.dimensions && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Dimensions: {order.dimensions}
                        </div>
                      )}
                      {order.medium && (
                        <div className="text-sm text-muted-foreground">
                          Medium: {order.medium}
                        </div>
                      )}
                      {order.year && (
                        <div className="text-sm text-muted-foreground">
                          Year: {order.year}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                  <div className="space-y-1">
                    <div><span className="font-medium">Name:</span> {order.user_name}</div>
                    <div><span className="font-medium">Email:</span> {order.user_email}</div>
                    <div><span className="font-medium">Phone:</span> {order.user_phone || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {order.delivery_address && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Delivery Address</h3>
                  <div className="p-3 bg-muted rounded-md">
                    {order.delivery_address}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="font-medium">Order Total</div>
                <div className="font-bold text-lg">
                  {formatCurrency(order.total_amount)}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
