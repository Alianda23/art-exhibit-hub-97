
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OrderDetails from '@/components/admin/OrderDetails';
import AdminNotAuthorized from '@/components/admin/AdminNotAuthorized';
import useRequireAuth from '@/hooks/useRequireAuth';

const OrderDetailsPage: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const isAuthLoading = useRequireAuth('/login');

  if (isAuthLoading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return <AdminNotAuthorized />;
  }

  return (
    <div className="container mx-auto p-4">
      <OrderDetails token={token || ''} />
    </div>
  );
};

export default OrderDetailsPage;
