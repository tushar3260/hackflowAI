
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                // Prepare api header
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                // Verify token and get user data
                const res = await api.get('/auth/me', config);
                setUser({ ...res.data, token });
            }
        } catch (e) {
            console.log('Login check failed', e);
            await SecureStore.deleteItemAsync('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, ...userData } = res.data;

            await SecureStore.setItemAsync('token', token);
            setUser(res.data);
            setLoading(false);
            return true;
        } catch (e) {
            setError(e.response?.data?.message || 'Login failed');
            setLoading(false);
            return false;
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });
            const { token, ...userData } = res.data;

            await SecureStore.setItemAsync('token', token);
            setUser(res.data);
            setLoading(false);
            return true;
        } catch (e) {
            setError(e.response?.data?.message || 'Registration failed');
            setLoading(false);
            return false;
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
