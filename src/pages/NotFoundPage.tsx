
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-5xl font-bold mb-6">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
