import React, { createContext, useState, useEffect } from 'react';
import api from '../api/config';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return React.useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // Ideally, we would fetch the user from the backend here to ensure validity
                    // For now, we'll optimistically set the user based on the token or stored user data
                    // Accessing /auth/me to get fresh user data
                    checkUserLoggedIn(token);
                }
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const checkUserLoggedIn = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await api.get('/auth/me', config);
            setUser({ ...data, token });
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password, role) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('token', data.token);
            setUser(data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
