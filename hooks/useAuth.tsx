'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { ID } from 'appwrite';
import { account } from '@/lib/appwrite';
import { UserSession } from '@/lib/types';

// Create context
interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser({
          userId: session.$id,
          name: session.name,
          email: session.email,
          isLoggedIn: true
        });
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await account.createEmailSession(email, password);
      const session = await account.get();
      
      setUser({
        userId: session.$id,
        name: session.name,
        email: session.email,
        isLoggedIn: true
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailSession(email, password);
      
      const session = await account.get();
      setUser({
        userId: session.$id,
        name: session.name,
        email: session.email,
        isLoggedIn: true
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await account.deleteSession('current');
      setUser(null);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}