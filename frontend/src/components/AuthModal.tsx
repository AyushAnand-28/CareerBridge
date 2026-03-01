import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
    onClose: () => void;
    defaultTab?: 'login' | 'register';
}

export default function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'login') {
                await login(email, password);
            } else {
                await register(name, email, password, role);
            }
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

                <div className="auth-logo">
                    <span className="logo-icon">✏️</span>
                    <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
                </div>

                <div className="auth-tabs">
                    <button
                        id="auth-tab-login"
                        className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
                        onClick={() => { setTab('login'); setError(''); }}
                    >
                        Log In
                    </button>
                    <button
                        id="auth-tab-register"
                        className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
                        onClick={() => { setTab('register'); setError(''); }}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {tab === 'register' && (
                        <div className="auth-field">
                            <label htmlFor="auth-name">Full Name</label>
                            <input
                                id="auth-name"
                                type="text"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            placeholder="jane@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    {tab === 'register' && (
                        <div className="auth-field">
                            <label>I am a</label>
                            <div className="auth-role-selector">
                                <button
                                    type="button"
                                    id="role-candidate"
                                    className={`role-btn ${role === 'CANDIDATE' ? 'role-btn--active' : ''}`}
                                    onClick={() => setRole('CANDIDATE')}
                                >
                                    🎯 Candidate
                                </button>
                                <button
                                    type="button"
                                    id="role-recruiter"
                                    className={`role-btn ${role === 'RECRUITER' ? 'role-btn--active' : ''}`}
                                    onClick={() => setRole('RECRUITER')}
                                >
                                    🤝 Recruiter
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        id="auth-submit"
                        type="submit"
                        className="btn btn-primary btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'Please wait…' : tab === 'login' ? 'Log In' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    {tab === 'login' ? (
                        <>Don't have an account?{' '}
                            <button className="auth-link" onClick={() => { setTab('register'); setError(''); }}>Sign Up</button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button className="auth-link" onClick={() => { setTab('login'); setError(''); }}>Log In</button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
