import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

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

const TEMP_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','yopmail.com',
  'trashmail.com','10minutemail.com','maildrop.cc','dispostable.com',
  'temp-mail.org','temp-mail.io','fakeinbox.com','mailnesia.com',
  'throwam.com','tempr.email','mohmal.com','emailondeck.com',
  'getairmail.com','spamgourmet.com','spamcorpse.com',
]);

function isTempEmail(email) {
  const domain = email?.split('@')[1]?.toLowerCase();
  return domain ? TEMP_DOMAINS.has(domain) : false;
}

export default function Auth() {
  const location  = useLocation();
  const isLogin   = location.pathname === '/login';
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwStrength, setPwStrength] = useState({ checks: {}, score: 0 });
  const [errors, setErrors] = useState({});

  // Real-time password strength
  useEffect(() => {
    if (!isLogin) {
      setPwStrength(getPasswordStrength(form.password));
    }
  }, [form.password, isLogin]);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // ─── Client-side Validation ─────────────────────────────────────────────────
  function validateForm() {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email daalna zaroori hai.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Valid email format daalo.';
    } else if (isTempEmail(form.email)) {
      newErrors.email = 'Temporary email allowed nahi hai. Real email use karo.';
    }

    if (!isLogin) {
      if (!form.name || form.name.trim().length < 2) {
        newErrors.name = 'Naam kam se kam 2 characters ka hona chahiye.';
      }

      const { checks } = getPasswordStrength(form.password);
      if (!checks.length)   newErrors.password = 'Password kam se kam 8 characters ka hona chahiye.';
      else if (!checks.upper)   newErrors.password = 'Ek uppercase letter zaroori hai (A-Z).';
      else if (!checks.lower)   newErrors.password = 'Ek lowercase letter zaroori hai (a-z).';
      else if (!checks.number)  newErrors.password = 'Ek number zaroori hai (0-9).';
      else if (!checks.special) newErrors.password = 'Ek special character zaroori hai (!@#$%^&* etc).';
    } else {
      if (!form.password) newErrors.password = 'Password daalna zaroori hai.';
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
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success(isLogin ? 'Login ho gaye!' : 'Account ban gaya!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes('device')) {
        toast.error(msg, { duration: 6000 });
      } else if (msg?.toLowerCase().includes('vpn') || msg?.toLowerCase().includes('proxy')) {
        toast.error(msg, { duration: 6000, icon: '🚫' });
      } else {
        toast.error(msg || (isLogin ? 'Login fail' : 'Register fail'));
      }
    }
    setLoading(false);
  };

  // ─── Password Strength Bar ──────────────────────────────────────────────────
  const strengthColors = ['', '#ff4444', '#ff8800', '#ffcc00', '#88cc00', '#00cc66'];
  const strengthLabels = ['', 'Bahut Kamzor', 'Kamzor', 'Theek Hai', 'Acha', 'Strong'];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          🔍 Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        <h2 style={s.title}>{isLogin ? 'Welcome Back' : 'Account Banao'}</h2>
        <p style={s.sub}>
          {isLogin
            ? 'Apne account mein login karo'
            : 'Free mein shuru karo — no credit card required'}
        </p>

        {/* Name Field */}
        {!isLogin && (
          <div style={s.fieldGroup}>
            <input
              style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
              name="name"
              placeholder="Full Name"
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
              placeholder={isLogin ? 'Password' : 'Password (Strong chahiye)'}
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
            <Link to="/forgot-password" style={{ color: '#8b6bff', fontSize: '.82rem' }}>
              Forgot Password?
            </Link>
          </div>
        )}

        {/* Security Notice */}
        {!isLogin && (
          <div style={s.securityNotice}>
            🔒 Ek account sirf ek device pe chalega. VPN/Proxy allowed nahi.
          </div>
        )}

        <button
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Loading...' : isLogin ? 'Login' : '🚀 Create Account'}
        </button>

        <p style={s.link}>
          {isLogin ? 'Account nahi hai? ' : 'Pehle se account hai? '}
          <Link to={isLogin ? '/register' : '/login'} style={{ color: '#8b6bff' }}>
            {isLogin ? 'Register karo' : 'Login karo'}
          </Link>
        </p>

        <p style={s.link}>
          <Link to="/" style={{ color: '#8888aa', fontSize: '.8rem' }}>← Back to Home</Link>
        </p>
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
};
