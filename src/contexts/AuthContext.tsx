
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { adminUser, users } from "@/data/mockData";

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
  adminLogin: async () => false,
  logout: () => {},
  isAdmin: false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAdmin(user.isAdmin);
      setIsAuthenticated(true);
    }
  }, []);

  // Regular user login
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, you would validate against a backend
    // For demo purposes, we're using mock data and only checking the email
    const user = users.find((u) => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.isAdmin);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    return false;
  };

  // Admin login
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, we're using mock data and only checking if it's the admin email
    if (email === adminUser.email) {
      setCurrentUser(adminUser);
      setIsAdmin(true);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  const value = {
    currentUser,
    login,
    adminLogin,
    logout,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
