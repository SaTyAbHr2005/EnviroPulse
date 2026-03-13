import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize state from local storage token
    useEffect(() => {
        if (token) {
            try {
                // Decode payload without verification just to extract role/email on the client
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.sub, role: payload.role });
                
                // Add default auth header to future axios requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (e) {
                console.error("Invalid token format", e);
                logout();
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 expects 'username' field
            formData.append('password', password);

            const res = await axios.post('http://localhost:8000/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            const accessToken = res.data.access_token;
            localStorage.setItem('adminToken', accessToken);
            setToken(accessToken);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || "Authentication Failed. Is backend running?" 
            };
        }
    };

    const register = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:8000/auth/register', {
                email,
                password,
                role: "admin" // We force role to admin for this exercise setup
            });
            
            const accessToken = res.data.access_token;
            localStorage.setItem('adminToken', accessToken);
            setToken(accessToken);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || "Registration Failed" 
            };
        }
    }

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
