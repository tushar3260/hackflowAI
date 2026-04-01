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
            if (data.message === 'OTP_SENT') {
                return { success: true, message: 'OTP_SENT' };
            }
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return { success: false, message: err.response?.data?.message };
        }
    };

    const verifyEmail = async (email, otp) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/verify-email', { email, otp });
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            return { success: false, message: err.response?.data?.message };
        }
    };

    const resendOtp = async (email) => {
        setError(null);
        try {
            await api.post('/auth/resend-otp', { email });
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Resend failed');
            return { success: false, message: err.response?.data?.message };
        }
    };

    const googleLogin = async (token) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/google', { token });
            localStorage.setItem('token', data.token);
            setUser(data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Google Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, verifyEmail, resendOtp, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
