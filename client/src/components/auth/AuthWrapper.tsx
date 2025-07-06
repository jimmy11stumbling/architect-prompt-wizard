import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  // Return mock auth for personal use - no authentication needed
  return {
    user: { id: 1, username: "user", email: "user@example.com" },
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    isLoading: false
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For personal use - no authentication needed
  const mockUser = { id: 1, username: "user", email: "user@example.com" };
  
  return (
    <AuthContext.Provider value={{ 
      user: mockUser, 
      login: async () => {}, 
      logout: async () => {}, 
      register: async () => {}, 
      isLoading: false 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Simple auth wrapper for protected routes
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature",
        variant: "destructive"
      });
    }
  }, [isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Allow access without authentication for development
  return <>{children}</>;
};