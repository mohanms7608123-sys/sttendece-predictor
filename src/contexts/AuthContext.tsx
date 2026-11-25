import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppRole, Profile } from '@/types/database';
import { api } from '@/lib/api';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    usn?: string;
  };
}

export interface AuthSession {
  access_token: string;
  token_type?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string, usn: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('campusbite_auth_token');
    if (!token) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data && data.user) {
        setUser(data.user);
        setSession({ access_token: token, user: data.user });
        setProfile(data.profile);
        setRole(data.role);
      } else {
        localStorage.removeItem('campusbite_auth_token');
        setUser(null);
        setSession(null);
        setProfile(null);
        setRole(null);
      }
    } catch (err) {
      console.warn('Failed to fetch current user:', err);
      localStorage.removeItem('campusbite_auth_token');
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone: string, usn: string) => {
    try {
      const data = await api.post('/auth/signup', {
        email,
        password,
        name,
        phone,
        usn,
      });

      if (data && data.session && data.session.access_token) {
        localStorage.setItem('campusbite_auth_token', data.session.access_token);
        setUser(data.user);
        setSession(data.session);
        setProfile(data.profile);
        setRole(data.role);
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Failed to sign up') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post('/auth/signin', {
        email,
        password,
      });

      if (data && data.session && data.session.access_token) {
        localStorage.setItem('campusbite_auth_token', data.session.access_token);
        setUser(data.user);
        setSession(data.session);
        setProfile(data.profile);
        setRole(data.role);
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Invalid login credentials') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('campusbite_auth_token');
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as any,
        session: session as any,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
