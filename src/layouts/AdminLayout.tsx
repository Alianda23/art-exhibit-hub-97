
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { isAdmin } = useAuth();
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header/Navbar would go here */}
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      {/* Admin Footer would go here */}
    </div>
  );
};

export default AdminLayout;
