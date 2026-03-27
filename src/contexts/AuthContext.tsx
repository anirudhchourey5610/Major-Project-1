import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, UserProfile } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string, role: 'admin' | 'analyst' | 'viewer' = 'viewer') => {
    try {
      const { data } = await api.post('/auth/signup', { email, password, role });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Sign up failed';
      throw new Error(message);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};