import React, { createContext, useContext, useState, useEffect } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { toast } from 'sonner';

export type UserRole = 'super_admin' | 'college_admin' | 'student' | null;

export interface AttendanceUser {
  id: string;
  adminId?: string;
  studentId?: string;
  username?: string;
  fullName: string;
  email: string;
  phone?: string;
  collegeId?: string;
  collegeName?: string;
  collegeSecretCode?: string;
  role: 'super_admin' | 'college_admin' | 'student';
  status?: string;
}

interface AttendanceAuthContextType {
  user: AttendanceUser | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  loginSuperAdmin: (credentials: { username: string; password: string }) => Promise<void>;
  registerCollegeAdmin: (data: any) => Promise<void>;
  loginCollegeAdmin: (credentials: { email: string; password: string }) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  loginStudent: (credentials: { email: string; password: string; collegeSecretCode: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AttendanceAuthContext = createContext<AttendanceAuthContextType | undefined>(undefined);

export const AttendanceAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AttendanceUser | null>(() => {
    const saved = localStorage.getItem('attendance_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('attendance_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      attendanceApi
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('attendance_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const saveAuth = (newToken: string, newUser: AttendanceUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('attendance_token', newToken);
    localStorage.setItem('attendance_user', JSON.stringify(newUser));
  };

  const loginSuperAdmin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.superAdminLogin(credentials);
      if (res.success) {
        saveAuth(res.token, res.user);
        toast.success('Super Admin login successful');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerCollegeAdmin = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.collegeAdminRegister(data);
      if (res.success) {
        saveAuth(res.token, res.user);
        toast.success('College Admin registered successfully');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginCollegeAdmin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.collegeAdminLogin(credentials);
      if (res.success) {
        saveAuth(res.token, res.user);
        toast.success('College Admin login successful');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.studentRegister(data);
      if (res.success) {
        saveAuth(res.token, res.user);
        toast.success('Student registered successfully! College subjects assigned.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (credentials: { email: string; password: string; collegeSecretCode: string }) => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.studentLogin(credentials);
      if (res.success) {
        saveAuth(res.token, res.user);
        toast.success('Student login successful');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('attendance_token');
    localStorage.removeItem('attendance_user');
    toast.info('Logged out successfully');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await attendanceApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('attendance_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AttendanceAuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        loginSuperAdmin,
        registerCollegeAdmin,
        loginCollegeAdmin,
        registerStudent,
        loginStudent,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AttendanceAuthContext.Provider>
  );
};

export const useAttendanceAuth = () => {
  const context = useContext(AttendanceAuthContext);
  if (!context) {
    throw new Error('useAttendanceAuth must be used within an AttendanceAuthProvider');
  }
  return context;
};
