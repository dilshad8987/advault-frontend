import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// ─── Password Strength Checker ─────────────────────────────────────────────────
function getPasswordStrength(password) {
  const checks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    lower:    /[a-z]/.test(password),
    number:   /\d/.test(password),
    special:  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}


export default function Auth() {
  const location  = useLocation();
  const isLogin   = location.pathname === '/login';
  const navigate  = useNavigate();

  const [form,     setForm]     = useState({ name: '', email: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [pwStrength, setPwStrength] = useState({ checks: {}, score: 0 });
  const [errors,   setErrors]   = useState({});
  // screen: 'auth' | 'forgot' | 'reset'
  const isForgotInit = typeof window !== 'undefined' && window.location.pathname === '/forgot-password';
  const [screen,   setScreen]   = useState('auth');
  const [fpEmail,  setFpEmail]  = useState('');
  const [fpSent,   setFpSent]   = useState(false);
  const [rpToken,  setRpToken]  = useState('');
  const [rpPass,   setRpPass]   = useState('');


  // Real-time password strength
  useEffect(() => {
    if (!isLogin) {
      setPwStrength(getPasswordStrength(form.password));
    }
  }, [form.password, isLogin]);

  // Auto-switch screen based on route
  useEffect(() => {
    if (location.pathname === '/forgot-password') setScreen('forgot');
    else setScreen('auth');
  }, [location.pathname]);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // ─── Client-side Validation ─────────────────────────────────────────────────
  function validateForm() {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[a-zA-Z0-9]+@gmail\.com$/.test(form.email?.trim())) {
      newErrors.email = 'Invalid email.';
    }

    if (!isLogin) {
      if (!form.name || form.name.trim().length < 2) {
        newErrors.name = 'Too short.';
      }

      const { checks } = getPasswordStrength(form.password);
      if (!checks.length)   newErrors.password = 'Password must be at least 8 characters.';
      else if (!checks.upper)   newErrors.password = '';
      else if (!checks.lower)   newErrors.password = 'Include at least one lowercase letter (a-z).';
      else if (!checks.number)  newErrors.password = '';
      else if (!checks.special) newErrors.password = '';
    } else {
      if (!form.password) newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const submit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload  = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await api.post(endpoint, payload);
      const { accessToken, refreshToken, user } = res.data;
      if (!accessToken) throw new Error('Authentication failed.');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(isLogin ? `Welcome back, ${user?.name || ''}!` : 'Welcome to AdVault!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes('device')) toast.error(msg, { duration: 6000 });
      else if (msg?.toLowerCase().includes('vpn') || msg?.toLowerCase().includes('proxy')) toast.error(msg, { duration: 6000, icon: '🚫' });
      else toast.error(msg || (isLogin ? 'Login failed.' : 'Registration failed.'));
    }
    setLoading(false);
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const idToken  = await result.user.getIdToken();
      const res = await api.post('/auth/google', { idToken });
      const { accessToken, refreshToken, user } = res.data;
      if (!accessToken) throw new Error('Authentication failed.');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome, ${user?.name || ''}!`);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return;
      toast.error(err.response?.data?.message || 'Google login failed.');
    }
    setLoading(false);
  };



  // ─── Password Strength Bar ──────────────────────────────────────────────────
  const strengthColors = ['', '#ff4444', '#ff8800', '#ffcc00', '#88cc00', '#00cc66'];
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];


  // Forgot Password — send reset link
  const sendReset = async () => {
    if (!fpEmail) return toast.error('Email is required.');
    if (!/^[a-zA-Z0-9]+@gmail\.com$/.test(fpEmail.trim())) return toast.error('Invalid email.');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: fpEmail.trim() });
      setFpSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  // Reset Password — set new password
  const resetPassword = async () => {
    if (!rpPass || rpPass.length < 8) return toast.error('Min 8 characters.');
    setLoading(true);
    try {
      const params  = new URLSearchParams(window.location.search);
      const token   = params.get('token') || rpToken;
      const email   = params.get('email') || fpEmail;
      await api.post('/auth/reset-password', { email, token, newPassword: rpPass });
      toast.success('Password updated! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    }
    setLoading(false);
  };

  // Check if landing on /reset-password or /forgot-password route
  const isResetPage  = location.pathname === '/reset-password';
  const isForgotPage = location.pathname === '/forgot-password';

  return (

    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          🔍 Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        {/* ── Forgot Password Screen ─────────────────────────── */}
        {(screen === 'forgot' && !isResetPage) && (
          <>
            {!fpSent ? (
              <>
                <h2 style={s.title}>Forgot Password?</h2>
                <p style={s.sub}>Enter your email — we'll send a reset link.</p>
                <input style={s.input} type="email" placeholder="Email"
                  value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReset()} />
                <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
                  onClick={sendReset} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>✅</div>
                <h2 style={s.title}>Check your email</h2>
                <p style={s.sub}>
                  Reset link sent to <b style={{ color: '#8b6bff' }}>{fpEmail}</b>.
                  Expires in <strong>10 minutes</strong>.
                </p>
                <p style={{ color: '#8888aa', fontSize: '.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Check spam if you don't see it.
                </p>
                <button style={s.btn} onClick={() => navigate('/login')}>Back to Login</button>
                <p style={s.link}>
                  <span style={{ color: '#8b6bff', cursor: 'pointer' }}
                    onClick={() => { setFpSent(false); setFpEmail(''); }}>Resend link</span>
                </p>
              </>
            )}
            <p style={{ ...s.link, marginTop: '1rem' }}>
              <span style={{ color: '#8888aa', fontSize: '.8rem', cursor: 'pointer' }}
                onClick={() => setScreen('auth')}>← Back to Login</span>
            </p>
          </>
        )}

        {/* ── Reset Password Screen (from email link) ────────── */}
        {isResetPage && (
          <>
            <h2 style={s.title}>Set New Password</h2>
            <p style={s.sub}>Choose a strong password for your account.</p>
            <input style={s.input} type="password" placeholder="New password"
              value={rpPass} onChange={e => setRpPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && resetPassword()} />
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              onClick={resetPassword} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <p style={{ ...s.link, marginTop: '1rem' }}>
              <span style={{ color: '#8888aa', fontSize: '.8rem', cursor: 'pointer' }}
                onClick={() => navigate('/login')}>← Back to Login</span>
            </p>
          </>
        )}

        {/* ── Login / Register Screen ───────────────────────── */}
        {screen === 'auth' && !isResetPage && (
          <>
        <h2 style={s.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={s.sub}>
          {isLogin
            ? 'Sign in to your account'
            : 'Start free — no credit card required'}
        </p>

        {/* Name Field */}
        {!isLogin && (
          <div style={s.fieldGroup}>
            <input
              style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
              name="name"
              placeholder="Name"
              maxLength={8}
              value={form.name}
              onChange={handle}
            />
            {errors.name && <p style={s.errorMsg}>⚠ {errors.name}</p>}
          </div>
        )}

        {/* Email Field */}
        <div style={s.fieldGroup}>
          <input
            style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handle}
          />
          {errors.email && <p style={s.errorMsg}>⚠ {errors.email}</p>}
        </div>

        {/* Password Field */}
        <div style={s.fieldGroup}>
          <div style={s.pwWrapper}>
            <input
              style={{ ...s.input, marginBottom: 0, paddingRight: '2.8rem', ...(errors.password ? s.inputError : {}) }}
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder={isLogin ? 'Password' : 'Password'}
              value={form.password}
              onChange={handle}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button type="button" style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p style={s.errorMsg}>⚠ {errors.password}</p>}

          {/* Password Strength Indicator — only on register */}
          {!isLogin && form.password.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {/* Strength Bar */}
              <div style={s.strengthBar}>
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    style={{
                      ...s.strengthSegment,
                      background: i <= pwStrength.score ? strengthColors[pwStrength.score] : '#2a2a3a'
                    }}
                  />
                ))}
              </div>
              <p style={{ ...s.strengthLabel, color: strengthColors[pwStrength.score] || '#888' }}>
                {strengthLabels[pwStrength.score]}
              </p>

              {/* Requirement Checklist */}
              <div style={s.checkList}>
                {[
                  { key: 'length',  label: 'Min 8 characters' },
                  { key: 'upper',   label: 'Uppercase (A-Z)' },
                  { key: 'lower',   label: 'Lowercase (a-z)' },
                  { key: 'number',  label: 'Number (0-9)' },
                  { key: 'special', label: 'Special char (!@#$...)' },
                ].map(({ key, label }) => (
                  <div key={key} style={s.checkItem}>
                    <span style={{ color: pwStrength.checks[key] ? '#00cc66' : '#ff4444', marginRight: '6px' }}>
                      {pwStrength.checks[key] ? '✓' : '✗'}
                    </span>
                    <span style={{ color: pwStrength.checks[key] ? '#aaffcc' : '#888', fontSize: '.8rem' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Forgot Password */}
        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '.75rem', marginTop: '-.25rem' }}>
            <span style={{ color: '#8b6bff', fontSize: '.82rem', cursor: 'pointer' }}
              onClick={() => setScreen('forgot')}>
              Forgot Password?
            </span>
          </div>
        )}
        <button
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? isLogin ? 'Signing in...' : 'Creating account...' : isLogin ? 'Login' : '🚀 Create Account'}
        </button>

        {!isLogin && (
          <p style={{ fontSize: '.78rem', color: '#8888aa', textAlign: 'center', marginTop: '.75rem', lineHeight: 1.5 }}>
            By clicking continue, you agree to our{' '}
            <Link to="/terms" style={{ color: '#8b6bff' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: '#8b6bff' }}>Privacy Policy</Link>.
          </p>
        )}

        {/* ── Divider ── */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        {/* ── Google Login ── */}
        <button
          style={{ ...s.googleBtn, opacity: loading ? 0.7 : 1 }}
          onClick={googleLogin}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <p style={s.link}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'} style={{ color: '#8b6bff' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>

        <p style={s.link}>
          <Link to="/" style={{ color: '#8888aa', fontSize: '.8rem' }}>← Back to Home</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f', padding: '1rem' },
  card:        { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  logo:        { display: 'block', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', textDecoration: 'none', color: '#f0f0f8' },
  title:       { fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' },
  sub:         { color: '#8888aa', fontSize: '.9rem', marginBottom: '1.75rem', lineHeight: 1.5 },
  fieldGroup:  { marginBottom: '.75rem' },
  input:       { width: '100%', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.9rem', marginBottom: 0, outline: 'none', display: 'block', boxSizing: 'border-box' },
  inputError:  { border: '1px solid #ff4444' },
  errorMsg:    { color: '#ff6666', fontSize: '.78rem', marginTop: '4px', marginBottom: 0 },
  pwWrapper:   { position: 'relative' },
  eyeBtn:      { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' },
  btn:         { width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, marginTop: '.5rem', cursor: 'pointer' },
  link:        { textAlign: 'center', marginTop: '1rem', color: '#8888aa', fontSize: '.875rem' },
  strengthBar: { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSegment: { flex: 1, height: '4px', borderRadius: '2px', transition: 'background 0.3s' },
  strengthLabel:   { fontSize: '.75rem', marginBottom: '6px', fontWeight: 600 },
  checkList:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' },
  checkItem:   { display: 'flex', alignItems: 'center' },
  securityNotice: { background: 'rgba(139,107,255,0.08)', border: '1px solid rgba(139,107,255,0.2)', borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '.8rem', color: '#aaa', marginBottom: '0.75rem' },
  divider:     { display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1rem 0' },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,.08)' },
  dividerText: { color: '#555577', fontSize: '.78rem', whiteSpace: 'nowrap' },
  googleBtn:   { width: '100%', padding: '.8rem', background: '#fff', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem' },
};
