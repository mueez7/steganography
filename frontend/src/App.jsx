// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import {
  Upload, Download, Key, Baseline, FileText,
  Image as ImageIcon, Music, Video, Unlock, ShieldClose, ShieldCheck, ChevronDown, ChevronLeft, User, LogOut, Menu, X
} from 'lucide-react';
import './index.css';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.2 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      dotX.set(e.clientX - 2);
      dotY.set(e.clientY - 2);
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <motion.div className="lofi-cursor" style={{ x: cursorXSpring, y: cursorYSpring }} />
      <motion.div className="lofi-cursor-dot" style={{ x: dotX, y: dotY }} />
    </>
  );
}

// Scrambled text effect logic
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

function ScramblingText({ text, isLoading }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isLoading) {
      setDisplayText(text);
      return;
    }

    const interval = setInterval(() => {
      setDisplayText(
        text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          return characters[Math.floor(Math.random() * characters.length)];
        }).join('')
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading, text]);

  return <span>{displayText}</span>;
}

function ProcessingOverlay({ isEncoding, text }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="processing-overlay"
    >
      <div className="hacker-grid" />
      <div className="cyber-scanline" />

      {/* Cool decrypt/encrypt cube spinning */}
      <motion.div
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.8)', zIndex: 52, position: 'relative' }}
      >
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ width: 20, height: 20, position: 'absolute', top: 9, left: 9, background: '#fff' }}
        />
      </motion.div>

      <div className="processing-text">
        <ScramblingText text={text} isLoading={true} />
      </div>
    </motion.div>
  );
}


function App() {
  const [session, setSession] = useState(null);
  const [step, setStep] = useState('landing');
  const [action, setAction] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && step === 'auth') {
      if (action) setStep('type');
      else setStep('action');
    }
  }, [session, step, action]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const tabs = [
    { id: 'text', label: 'Text', icon: <FileText size={16} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
    { id: 'audio', label: 'Audio', icon: <Music size={16} /> },
    { id: 'video', label: 'Video', icon: <Video size={16} /> },
  ];

  // Removed early return for !session to allow guests to see landing

  return (
    <div>
      <CustomCursor />

      <div className="pure-black-bg" />
      <div className="noise-overlay" />

      {/* App Navbar */}
      <div className="app-navbar">
        <div className="navbar-brand" onClick={() => { setStep('landing'); setAction(null); setIsNavOpen(false); }} style={{cursor: 'pointer'}}>
          <ShieldCheck size={20} color="var(--text-primary)" />
          <span className="navbar-title">StealthSpace</span>
        </div>
        
        {session && (
          <div className="navbar-links">
            <button className={`nav-link ${step === 'landing' ? 'active' : ''}`} onClick={() => { setStep('landing'); setAction(null); }}>Home</button>
            <button className={`nav-link ${action === 'encode' && step !== 'landing' ? 'active' : ''}`} onClick={() => { setAction('encode'); if (step !== 'tool') setStep('type'); }}>Encode</button>
            <button className={`nav-link ${action === 'decode' && step !== 'landing' ? 'active' : ''}`} onClick={() => { setAction('decode'); if (step !== 'tool') setStep('type'); }}>Decode</button>
          </div>
        )}

            {session ? (
              <div className="navbar-profile">
                <User size={16} color="var(--text-secondary)" />
                <span className="profile-name">
                  {session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'AGENT'}
                </span>
                <div className="profile-divider" />
                <button onClick={() => supabase.auth.signOut()} className="logout-btn" title="Disconnect Session">
                  <LogOut size={16} color="#ff4444" />
                </button>
              </div>
            ) : (
              <button className="btn-primary" style={{ marginTop: 0, padding: '8px 16px', width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setStep('auth')}>
                Log In
              </button>
            )}

        {session && (
          <button className="mobile-menu-btn" onClick={() => setIsNavOpen(!isNavOpen)}>
            {isNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {session && (
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mobile-nav-overlay"
            >
              <div className="mobile-nav-links">
                <button className={`mobile-nav-link ${step === 'landing' ? 'active' : ''}`} onClick={() => { setStep('landing'); setAction(null); setIsNavOpen(false); }}>Home</button>
                <button className={`mobile-nav-link ${action === 'encode' && step !== 'landing' ? 'active' : ''}`} onClick={() => { setAction('encode'); if (step !== 'tool') setStep('type'); setIsNavOpen(false); }}>Encode</button>
                <button className={`mobile-nav-link ${action === 'decode' && step !== 'landing' ? 'active' : ''}`} onClick={() => { setAction('decode'); if (step !== 'tool') setStep('type'); setIsNavOpen(false); }}>Decode</button>
              </div>
                
                <div className="mobile-nav-footer">
                  {session ? (
                    <>
                      <div className="mobile-nav-profile">
                        <User size={16} />
                        <span>{session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'AGENT'}</span>
                      </div>
                      <button onClick={() => supabase.auth.signOut()} className="btn-outline" style={{ marginTop: '0.5rem', padding: '0.5rem 2rem' }}>
                        <LogOut size={14} style={{ display: 'inline', marginRight: '6px' }} /> Disconnect
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary" onClick={() => { setStep('auth'); setIsNavOpen(false); }} style={{ padding: '0.8rem 3rem' }}>
                      Log In
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="landing-wrapper">
            <div className="landing-content">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="hero-section">
                <h1 className="hero-title">StealthSpace</h1>
                <p className="hero-subtitle" style={{ marginBottom: '2.5rem' }}>
                  Advanced, secure & minimal multimodal steganography suite. Hide any data seamlessly.
                </p>
                <button className="btn-primary" style={{ maxWidth: '250px' }} onClick={() => { if (!session) setStep('auth'); else setStep('action'); }}>
                  Get Started
                </button>
              </motion.div>

              <motion.div className="info-grid-compact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <div className="info-card-clean">
                  <h3 className="info-title-clean"><ShieldCheck size={20} color="var(--text-secondary)" /> What is Steganography?</h3>
                  <p className="info-text-clean">
                    It is a way to hide secret information inside an ordinary file so nobody knows it's there.
                    Unlike a locked safe, a steganography file just looks like a normal picture or mp3 file.
                  </p>
                </div>
                <div className="info-card-clean">
                  <h3 className="info-title-clean"><Unlock size={20} color="var(--text-secondary)" /> How it Works</h3>
                  <p className="info-text-clean">
                    Choose whether you want to Encode (hide data) or Decode (extract data). Then select your file type (like Text, Image, Audio, or Video).
                    We will seamlessly embed your secret message into the file you provide.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 'action' && (
          <motion.div key="action" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-container container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
              <button className="back-btn" onClick={() => setStep('landing')}><ChevronLeft size={16} /> Back</button>
              <h2 className="step-title">Select Operation</h2>
              <div className="action-grid">
                <button className="action-card" onClick={() => { setAction('encode'); if (!session) setStep('auth'); else setStep('type'); }}>
                  <Unlock size={36} color="var(--text-primary)" style={{ marginBottom: '1.2rem' }} />
                  <h3>Encode</h3>
                  <p>Hide secret data within a file</p>
                </button>
                <button className="action-card" onClick={() => { setAction('decode'); if (!session) setStep('auth'); else setStep('type'); }}>
                  <Baseline size={36} color="var(--text-primary)" style={{ marginBottom: '1.2rem' }} />
                  <h3>Decode</h3>
                  <p>Extract hidden data from a stego file</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'type' && (
          <motion.div key={`type-${action}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="step-container container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
              <button className="back-btn" onClick={() => setStep('action')}><ChevronLeft size={16} /> Back</button>
              <h2 className="step-title">Select Medium to {action === 'encode' ? 'Encode' : 'Decode'}</h2>
              <div className="type-grid">
                {tabs.map((tab) => (
                  <button key={tab.id} className="type-card" onClick={() => { setActiveTab(tab.id); setStep('tool'); }}>
                    <div style={{ transform: 'scale(1.5)', marginBottom: '1.2rem', color: 'var(--text-primary)' }}>{tab.icon}</div>
                    <h3>{tab.label}</h3>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'tool' && (
          <motion.div key="tool" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="step-container container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '600px', paddingTop: '6rem', paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <button className="back-btn" onClick={() => setStep('type')} style={{ marginBottom: 0 }}><ChevronLeft size={16} /> Back to Mediums</button>
              <button className="back-btn" style={{ color: 'var(--text-secondary)', marginBottom: 0 }} onClick={() => setStep('landing')}>Start Over</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={action + activeTab}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                {action === 'encode' ? <EncodeSection type={activeTab} /> : <DecodeSection type={activeTab} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="step-container container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
              <button className="back-btn" style={{ position: 'absolute', top: '-2.5rem', left: '0', zIndex: 11 }} onClick={() => setStep('landing')}><ChevronLeft size={16} /> Back</button>
              <Auth />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EncodeSection({ type }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [vidKey, setVidKey] = useState('');
  const [vidFrame, setVidFrame] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEncode = async () => {
    if (!file || !message) {
      setError("Please provide both file and message");
      return;
    }
    if (type === 'video' && !vidKey) {
      setError("Video steganography requires a key");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('cover', file);
    formData.append('message', message);
    if (type === 'video') {
      formData.append('key_str', vidKey);
      formData.append('frame_num', vidFrame.toString());
    }

    try {
      const response = await fetch(`${API_URL}/encode/${type}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to encode");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extMap = {
        text: 'txt',
        image: 'png',
        audio: 'wav',
        video: 'avi'
      };
      a.download = `stego_${type}_encoded.${extMap[type] || 'bin'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess("Successfully encoded & saved!");
      setFile(null);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <AnimatePresence>
        {loading && <ProcessingOverlay isEncoding={true} text="ENCRYPTING_DATA" />}
      </AnimatePresence>

      <h2 className="card-title">
        <Unlock size={18} color="var(--text-secondary)" />
        Encode Data
      </h2>

      <div className="form-group">
        <label>Cover {type.charAt(0).toUpperCase() + type.slice(1)} File</label>
        <div className="file-input-wrapper">
          <div className="btn-file">
            <Upload size={16} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'Choose a file...'}
            </span>
          </div>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
      </div>

      <div className="form-group">
        <label>Secret Payload</label>
        <textarea
          placeholder="Enter the secret message to hide..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {type === 'video' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="form-group">
              <label>Encryption Key</label>
              <div className="input-icon-wrapper">
                <Key size={14} />
                <input
                  type="text"
                  placeholder="Secret key"
                  value={vidKey}
                  onChange={(e) => setVidKey(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Embed at Frame</label>
              <input
                type="number"
                min="1"
                value={vidFrame}
                onChange={(e) => setVidFrame(parseInt(e.target.value) || 1)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="btn-primary" onClick={handleEncode} disabled={loading}>
        Embed & Download
      </button>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="status-msg status-error">
            <ShieldClose size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="status-msg status-success">
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DecodeSection({ type }) {
  const [file, setFile] = useState(null);
  const [vidKey, setVidKey] = useState('');
  const [vidFrame, setVidFrame] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');

  const handleDecode = async () => {
    if (!file) {
      setError("Please provide a stego file");
      return;
    }
    if (type === 'video' && !vidKey) {
      setError("Video steganography requires a key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult('');

    const formData = new FormData();
    formData.append('stego_file', file);
    if (type === 'video') {
      formData.append('key_str', vidKey);
      formData.append('frame_num', vidFrame.toString());
    }

    try {
      const response = await fetch(`${API_URL}/decode/${type}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to decode");
      }

      const data = await response.json();
      setResult(data.decoded_message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <AnimatePresence>
        {loading && <ProcessingOverlay isEncoding={false} text="DECRYPTING_DATA" />}
      </AnimatePresence>

      <h2 className="card-title">
        <Baseline size={18} color="var(--text-secondary)" />
        Extract Data
      </h2>

      <div className="form-group">
        <label>Stego {type.charAt(0).toUpperCase() + type.slice(1)} File</label>
        <div className="file-input-wrapper">
          <div className="btn-file">
            <Download size={16} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'Select stego file...'}
            </span>
          </div>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
      </div>

      <AnimatePresence>
        {type === 'video' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="form-group">
              <label>Decryption Key</label>
              <div className="input-icon-wrapper">
                <Key size={14} />
                <input
                  type="text"
                  placeholder="Secret key"
                  value={vidKey}
                  onChange={(e) => setVidKey(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Check at Frame</label>
              <input
                type="number"
                min="1"
                value={vidFrame}
                onChange={(e) => setVidFrame(parseInt(e.target.value) || 1)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="btn-outline" onClick={handleDecode} disabled={loading}>
        Extract Hidden Payload
      </button>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="status-msg status-error">
            <ShieldClose size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="status-msg"
            style={{
              flexDirection: 'column',
              color: 'var(--text-primary)'
            }}
          >
            <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              Extracted Payload:
            </strong>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
