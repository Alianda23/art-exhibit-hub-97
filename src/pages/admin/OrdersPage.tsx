
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OrdersManagement from '@/components/admin/OrdersManagement';

const OrdersPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div>
      <OrdersManagement token={token || ''} />
    </div>
  );
};

export default OrdersPage;
