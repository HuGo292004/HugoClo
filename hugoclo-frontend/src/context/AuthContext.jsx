import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginAPI, registerAPI } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            // Nếu data cũ thiếu fullName → xóa cache stale
            if (!parsed.fullName) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return null;
            }
            return parsed;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const login = useCallback(async ({ email, password }) => {
        const data = await loginAPI({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (formData) => {
        const data = await registerAPI(formData);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
    return ctx;
};
