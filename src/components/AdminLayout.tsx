
import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin-login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };
  
  const userInitials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'A';
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin header - simplified with just profile */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 mr-2">
              {currentUser?.name || 'Admin User'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={currentUser?.image} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
