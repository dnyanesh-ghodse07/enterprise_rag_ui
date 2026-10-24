/**
 * Authentication context and provider.
 * 
 * Provides:
 * - Current user state (null if not logged in)
 * - Login/logout/register functions
 * - Loading state for initial auth check
 * 
 * Usage:
 *   const { user, login, logout } = useAuth();
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { apiPost, saveTokens, clearTokens, apiGet } from '../api/client';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            apiGet<User>('/auth/me')
                .then(setUser)
                .catch(() => clearTokens())
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        // FastAPI OAuth2 expects form data
        const formData = new URLSearchParams();
        formData.append('username', data.email);
        formData.append('password', data.password);

        const tokens = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            },
        ).then(async (res) => {
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Login failed');
            }
            return res.json() as Promise<AuthTokens>;
        });

        saveTokens(tokens.access_token, tokens.refresh_token);
        const me = await apiGet<User>('/auth/me');
        setUser(me);
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        await apiPost('/auth/register', data);
        // After registration, log in automatically
        await login({ email: data.email, password: data.password });
    }, [login]);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be inside AuthProvider');
    return context;
}
