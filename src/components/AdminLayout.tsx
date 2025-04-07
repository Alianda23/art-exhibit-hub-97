
import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout, currentUser, isAuthenticated, isAdmin: userIsAdmin } = useAuth();
  
  useEffect(() => {
    // Check if user is admin
    const adminCheck = isAdmin();
    console.log("Admin check in AdminLayout:", { 
      isAdmin: adminCheck,
      isAuthenticated,
      currentUser,
      userIsAdmin, 
      localStorageIsAdmin: localStorage.getItem('isAdmin'),
      token: localStorage.getItem('token')
    });
    
    if (!adminCheck) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this area",
        variant: "destructive"
      });
      navigate('/admin-login');
    }
  }, [navigate, isAuthenticated, currentUser, userIsAdmin]);
  
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
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="text-lg font-semibold">Admin Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 mr-2">
              {currentUser?.name || 'Admin User'} 
              {currentUser?.isAdmin ? ' (Admin)' : ''}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
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
