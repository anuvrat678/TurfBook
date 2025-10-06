import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { checkAuth() }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      let response;
      if (credentials.googleToken) {
        response = await api.post('/auth/google', { token: credentials.googleToken });
      } else {
        response = await api.post('/auth/login', credentials);
      }
      
     
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        
        // Navigate after successful login
        navigate(response.data.role === 'admin' ? '/admin/dashboard' : '/');
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error in context:', error);
      
      // Pass the actual error message from the server
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);