import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/services/authApi';
import { profileApi } from '@/services/profileApi';

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
    // Check initial state from localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
      const decodedUser = parseJwt(accessToken);
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
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticated(true);
    const decodedUser = parseJwt(accessToken);
    if (decodedUser) setUser(decodedUser);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('profileToken');
      setIsAuthenticated(false);
      setSelectedProfile(null);
      setUser(null);
    }
  };

  const selectProfile = (profile, profileToken) => {
    setSelectedProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    if (profileToken) {
      localStorage.setItem('profileToken', profileToken);
    }
  };

  const clearProfile = () => {
    setSelectedProfile(null);
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('profileToken');
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
