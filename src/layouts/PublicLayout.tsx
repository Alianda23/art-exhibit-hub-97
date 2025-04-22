
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar would go here */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer would go here */}
    </div>
  );
};

export default PublicLayout;
