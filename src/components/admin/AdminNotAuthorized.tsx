
import React from 'react';
import { Link } from 'react-router-dom';

const AdminNotAuthorized: React.FC = () => {
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-6">
        You don't have permission to access this page. Please login with an admin account.
      </p>
      <Link 
        to="/login" 
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Login
      </Link>
    </div>
  );
};

export default AdminNotAuthorized;
