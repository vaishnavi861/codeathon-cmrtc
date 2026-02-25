'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const stored = localStorage.getItem('cc_user');
            if (stored) setUser(JSON.parse(stored));
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const stored = localStorage.getItem('cc_users');
            const users: Array<{ name: string; email: string; password: string }> = stored ? JSON.parse(stored) : [];
            const found = users.find(u => u.email === email && u.password === password);
            if (!found) return { success: false, error: 'Invalid email or password.' };
            const u = { name: found.name, email: found.email };
            setUser(u);
            localStorage.setItem('cc_user', JSON.stringify(u));
            return { success: true };
        } catch {
            return { success: false, error: 'Something went wrong.' };
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const stored = localStorage.getItem('cc_users');
            const users: Array<{ name: string; email: string; password: string }> = stored ? JSON.parse(stored) : [];
            if (users.find(u => u.email === email)) return { success: false, error: 'Email already registered.' };
            users.push({ name, email, password });
            localStorage.setItem('cc_users', JSON.stringify(users));
            const u = { name, email };
            setUser(u);
            localStorage.setItem('cc_user', JSON.stringify(u));
            return { success: true };
        } catch {
            return { success: false, error: 'Something went wrong.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cc_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
