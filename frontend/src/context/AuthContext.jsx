import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get(API_ENDPOINTS.AUTH.USER_PROFILE);
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error loading user:', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const register = async (username, email, password, role) => {
        try {
            const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, { username, email, password, role });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user); // Optimistically set user
            setIsAuthenticated(true); // Optimistically set authenticated
            return { success: true, role: res.data.user.role };
        } catch (err) {
            console.error('Registration error:', err.response?.data);
            return {
                success: false,
                error: err.response?.data?.msg || 'Registration failed'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user); // Optimistically set user
            setIsAuthenticated(true); // Optimistically set authenticated
            return { success: true, role: res.data.user.role };
        } catch (err) {
            console.error('Login error:', err.response?.data);
            return {
                success: false,
                error: err.response?.data?.msg || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            register,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
