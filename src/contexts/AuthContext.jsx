import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/services/authApi';
import api, { setAccessToken } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [user, setUser] = useState(null);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Silent refresh at startup
        const res = await api.post('/api/auth/refresh-token');
        if (res.data?.success && res.data.data?.accessToken) {
          const token = res.data.data.accessToken;
          setAccessToken(token);
          setIsAuthenticated(true);
          const decodedUser = parseJwt(token);
          if (decodedUser) setUser(decodedUser);

          const storedProfile = localStorage.getItem('selectedProfile');
          if (storedProfile) {
            try {
              setSelectedProfile(JSON.parse(storedProfile));
            } catch (e) {
              console.error("Failed to parse selected profile from local storage", e);
            }
          }
        }
      } catch (err) {
        // Not authenticated or refresh token expired/missing
        setIsAuthenticated(false);
        setUser(null);
        setSelectedProfile(null);
        localStorage.removeItem('selectedProfile');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (accessToken) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
    const decodedUser = parseJwt(accessToken);
    if (decodedUser) setUser(decodedUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('selectedProfile');
      setIsAuthenticated(false);
      setSelectedProfile(null);
      setUser(null);
    }
  };

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
  };

  const clearProfile = () => {
    setSelectedProfile(null);
    localStorage.removeItem('selectedProfile');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      selectedProfile,
      user,
      login,
      logout,
      selectProfile,
      clearProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
