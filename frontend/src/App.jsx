// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import {
  Upload, Download, Key, Baseline, FileText,
  Image as ImageIcon, Music, Video, Unlock, ShieldClose, ShieldCheck, ChevronDown, User, LogOut
} from 'lucide-react';
import './index.css';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  const [activeTab, setActiveTab] = useState('text');

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

  if (!session) {
    return (
      <div>
        <CustomCursor />
        <div className="pure-black-bg" />
        <div className="noise-overlay" />
        <Auth />
      </div>
    );
  }

  return (
    <div>
      <CustomCursor />

      <div className="pure-black-bg" />
      <div className="noise-overlay" />

      {/* Profile Widget */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '50px', backdropFilter: 'blur(10px)' }}>
          <User size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500', letterSpacing: '0.05em' }}>
            {session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'AGENT'}
          </span>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}
            title="Disconnect Session"
          >
            <LogOut size={16} color="#ff4444" style={{ opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.8} />
          </button>
        </div>
      </div>

      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="hero-title">StealthSpace</h1>
            <p className="hero-subtitle">
              Advanced, secure & minimal multimodal steganography suite. Hide any data seamlessly.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <span>Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      <section className="main-content container">
        <motion.div
          className="tabs-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tabBackground"
                    className="tab-bg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="panels-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="panel-grid"
            >
              <EncodeSection type={activeTab} />
              <DecodeSection type={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
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
