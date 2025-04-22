
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const useRequireAuth = (redirectPath: string = '/login'): boolean => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate(redirectPath);
      }
      setIsAuthLoading(false);
    }
  }, [isAuthenticated, loading, navigate, redirectPath]);

  return isAuthLoading;
};

export default useRequireAuth;
