
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { adminUser, users } from "@/data/mockData";
import { 
  loginUser, 
  loginAdmin, 
  registerUser, 
  logout as apiLogout, 
  isAuthenticated,
  isAdmin as checkIsAdmin
} from "@/services/api";

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
  adminLogin: async () => false,
  signup: async () => false,
  logout: () => {},
  isAdmin: false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isUserAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const userName = localStorage.getItem('userName') || '';
      const userId = localStorage.getItem('userId') || localStorage.getItem('adminId') || '';
      
      // Create a basic user object from localStorage
      setCurrentUser({
        id: userId,
        name: userName,
        email: '',  // We don't store sensitive info in localStorage
        isAdmin: checkIsAdmin(),
      });
      
      setIsAdmin(checkIsAdmin());
      setIsAuthenticated(true);
    }
  }, []);

  // Regular user login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser({ email, password });
      
      if (response.error) {
        return false;
      }
      
      // Set user state from response
      setCurrentUser({
        id: response.user_id?.toString() || '',
        name: response.name || '',
        email: email,
        isAdmin: false,
      });
      
      setIsAdmin(false);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Admin login
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginAdmin({ email, password });
      
      if (response.error) {
        return false;
      }
      
      // Set admin user state
      setCurrentUser({
        id: response.admin_id?.toString() || '',
        name: response.name || '',
        email: email,
        isAdmin: true,
      });
      
      setIsAdmin(true);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };
  
  // User signup
  const signup = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const response = await registerUser({ name, email, password, phone });
      
      if (response.error) {
        return false;
      }
      
      // Set user state after successful registration
      setCurrentUser({
        id: response.user_id?.toString() || '',
        name: name,
        email: email,
        isAdmin: false,
      });
      
      setIsAdmin(false);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    apiLogout();
    setCurrentUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    login,
    adminLogin,
    signup,
    logout,
    isAdmin,
    isAuthenticated: isUserAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
