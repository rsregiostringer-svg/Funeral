import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('alaala_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('alaala_access_token'));
  const [loading, setLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const idleThresholdMs = 3 * 60 * 1000; // 3 minutes idle threshold

  // Sync user state with localStorage
  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('alaala_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('alaala_user');
    }
  };

  const handleSetToken = (token, refresh) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem('alaala_access_token', token);
    } else {
      localStorage.removeItem('alaala_access_token');
    }
    if (refresh) {
      localStorage.setItem('alaala_refresh_token', refresh);
    }
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    handleSetToken(data.access, data.refresh);
    handleSetUser(data.user);
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('alaala_refresh_token');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      handleSetToken(null, null);
      handleSetUser(null);
      localStorage.removeItem('alaala_refresh_token');
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('alaala_access_token')) {
      setLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      handleSetUser(me);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for auth expired event
  useEffect(() => {
    const onAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth_expired', onAuthExpired);
    return () => window.removeEventListener('auth_expired', onAuthExpired);
  }, []);

  // Initial load
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Active / Idle tracking & Heartbeat
  useEffect(() => {
    if (!user) return;

    const handleUserInteraction = () => {
      lastActivityRef.current = Date.now();
      if (isIdle) {
        setIsIdle(false);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, handleUserInteraction, { passive: true }));

    // Periodic heartbeat check (every 25 seconds)
    const interval = setInterval(() => {
      const timeSinceLast = Date.now() - lastActivityRef.current;
      const currentlyIdle = timeSinceLast >= idleThresholdMs;
      setIsIdle(currentlyIdle);

      // Ping backend heartbeat
      authService.sendHeartbeat(currentlyIdle).catch(() => {});
    }, 25000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserInteraction));
      clearInterval(interval);
    };
  }, [user, isIdle]);

  const value = {
    user,
    role: user?.role,
    isMasterAdmin: user?.role === 'MASTER_ADMIN',
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    canManageUsers: user?.role === 'MASTER_ADMIN',
    canDeleteRecords: user?.role === 'MASTER_ADMIN',
    canEditRecords: user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN',
    canAccessReports: user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN',
    canExportReports: user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN',
    canCreateRecords: true,
    canViewRecords: true,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    loading,
    isIdle,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
