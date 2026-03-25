import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { Lock, Mail, KeyRound, ShieldClose, User, ArrowRight, Fingerprint, ChevronLeft } from 'lucide-react';
import './index.css';

export default function Auth({ onBack }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                setSuccessMsg("Clearance granted. Check your secure inbox for the verification link.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="auth-card"
            >
                <div className="auth-branding-side">
                    <button className="auth-back-btn" onClick={onBack}>
                        <ChevronLeft size={14} /> Back
                    </button>
                    <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="auth-branding-icon"
                    >
                        <Lock size={32} color="var(--text-primary)" />
                    </motion.div>
                    <h2 className="auth-branding-title">StealthSpace</h2>
                    <p className="auth-branding-subtitle">
                        {isSignUp 
                            ? "Join our secure platform to start hiding your data seamlessly." 
                            : "Welcome back. Log in to access your secure covert tools."}
                    </p>
                </div>

                <div className="auth-form-side">
                    <div className="auth-header">
                        <h2 className="auth-title">
                            {isSignUp ? "Create an Account" : "Log In"}
                        </h2>
                        <p className="auth-subtitle">
                            {isSignUp ? "Sign up to get started." : "Enter your details to proceed."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {errorMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="auth-alert error">
                                <ShieldClose size={16} style={{ flexShrink: 0 }} />
                                <span>{errorMsg}</span>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="auth-alert success">
                                <Fingerprint size={16} style={{ flexShrink: 0 }} />
                                <span>{successMsg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleAuth} className="auth-form">
                        <AnimatePresence>
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    style={{ overflow: 'hidden' }}
                                    className="auth-input-group"
                                >
                                    <label>Username</label>
                                    <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                                        <User size={16} className="auth-input-icon" style={{ position: 'absolute', left: '1rem', zIndex: 3, pointerEvents: 'none', color: '#666' }} />
                                        <input
                                            type="text"
                                            placeholder="Your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required={isSignUp}
                                            className="auth-input"
                                            style={{ paddingLeft: '3rem' }}
                                        />
                                        <div className="auth-input-focus-bg"></div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="auth-input-group" style={{ marginTop: isSignUp ? '0' : '1rem' }}>
                            <label>Email Address</label>
                            <div className="auth-input-wrapper">
                                <Mail size={18} className="auth-input-icon" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                                <div className="auth-input-focus-bg"></div>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="auth-input-wrapper">
                                <KeyRound size={18} className="auth-input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                                <div className="auth-input-focus-bg"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-submit-btn"
                        >
                            <span>{loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Log In")}</span>
                            <ArrowRight size={18} className={loading ? "spin-icon" : "slide-icon"} />
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
                                className="auth-switch-btn"
                            >
                                {isSignUp ? "Log In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
