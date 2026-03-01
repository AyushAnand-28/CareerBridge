import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const API_BASE = 'http://localhost:5000';

export interface AuthUser {
    id: string;
    name: string | null;
    email: string;
    role: 'CANDIDATE' | 'RECRUITER';
    createdAt: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    register: (name: string, email: string, password: string, role: 'CANDIDATE' | 'RECRUITER') => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('cb_token'));
    const [loading, setLoading] = useState(true);

    // On mount, verify stored token
    useEffect(() => {
        const storedToken = localStorage.getItem('cb_token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem('cb_token');
                    setToken(null);
                }
            } catch {
                localStorage.removeItem('cb_token');
                setToken(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const register = async (name: string, email: string, password: string, role: 'CANDIDATE' | 'RECRUITER') => {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        localStorage.setItem('cb_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('cb_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('cb_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
