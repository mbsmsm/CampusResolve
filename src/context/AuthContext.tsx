import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  loginUser,
  registerStudent,
  logoutUser,
  getUserProfile,
  getStoredDemoUser,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from '../services/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string, expectedRole?: UserRole) => Promise<void>;
  register: (
    email: string,
    pass: string,
    name: string,
    idNumber?: string,
    dept?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // In demo mode: restore stored user or default to DEMO_STUDENT
      const stored = getStoredDemoUser();
      setUserProfile(stored || DEMO_STUDENT);
      setLoading(false);
      return;
    }

    // In real Firebase mode: listen to auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, expectedRole?: UserRole) => {
    setLoading(true);
    try {
      const profile = await loginUser(email, pass, expectedRole);
      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    idNumber?: string,
    dept?: string
  ) => {
    setLoading(true);
    try {
      const profile = await registerStudent(email, pass, name, idNumber, dept);
      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    if (role === 'admin') {
      localStorage.setItem('complaint_system_mock_user', JSON.stringify(DEMO_ADMIN));
      setUserProfile(DEMO_ADMIN);
    } else {
      localStorage.setItem('complaint_system_mock_user', JSON.stringify(DEMO_STUDENT));
      setUserProfile(DEMO_STUDENT);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        loading,
        isConfigured: isFirebaseConfigured,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
