import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import { Lock, Mail, KeyRound, ShieldClose, User } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                alert("Check your email for the login link!");
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
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
                width: '100%',
                maxWidth: '420px',
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                    <Lock size={20} color="#fff" />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '500', color: '#fff', margin: 0 }}>
                        {isSignUp ? "Create Access" : "Secure Login"}
                    </h2>
                </div>

                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        <ShieldClose size={16} />
                        {errorMsg}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {isSignUp && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                                Agent Handle
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', color: '#888' }} />
                                <input
                                    type="text"
                                    placeholder="Cipher"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        background: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '12px 12px 12px 38px',
                                        fontSize: '0.95rem',
                                        color: '#000',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                            Agent Email
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#888' }} />
                            <input
                                type="email"
                                placeholder="agent@stealth.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    background: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 12px 12px 38px',
                                    fontSize: '0.95rem',
                                    color: '#000',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                            Master Password
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <KeyRound size={16} style={{ position: 'absolute', left: '12px', color: '#888' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    background: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 12px 12px 38px',
                                    fontSize: '0.95rem',
                                    color: '#000',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.8 : 1,
                            fontFamily: 'inherit',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? "Authenticating..." : (isSignUp ? "Sign Up" : "Log In")}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
                    {isSignUp ? "Already have clearance? " : "Need stealth access? "}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: '500',
                            padding: 0,
                            fontSize: '0.9rem'
                        }}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </p>

            </motion.div>
        </div>
    );
}
