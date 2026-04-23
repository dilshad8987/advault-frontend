import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth, sendPasswordResetEmail } from '../firebase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReset = async () => {
    if (!email) return toast.error('Email daalo');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success('Reset link bhej diya!');
    } catch (err) {
      if (err.code === 'auth/user-not-found') toast.error('Email registered nahi hai');
      else if (err.code === 'auth/invalid-email') toast.error('Valid email daalo');
      else toast.error('Error aaya — dobara try karo');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          🔍 Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        {!sent ? (
          <>
            <h2 style={s.title}>Forgot Password?</h2>
            <p style={s.sub}>Email daalo — password reset link bhej denge</p>
            <input
              style={s.input}
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendReset()}
            />
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={sendReset} disabled={loading}>
              {loading ? 'Bhej rahe hain...' : '📧 Reset Link Bhejo'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>✅</div>
            <h2 style={s.title}>Email Bhej Diya!</h2>
            <p style={s.sub}>
              <b style={{ color: '#8b6bff' }}>{email}</b> pe reset link bheja gaya.
              Email check karo aur link pe click karo.
            </p>
            <p style={{ color: '#8888aa', fontSize: '.8rem', marginBottom: '1.5rem' }}>
              Spam folder bhi check karo agar nahi mila.
            </p>
            <button style={s.btn} onClick={() => navigate('/login')}>
              Login Pe Jaao
            </button>
            <p style={s.link}>
              <span style={{ color: '#8b6bff', cursor: 'pointer' }} onClick={() => { setSent(false); setEmail(''); }}>
                Dobara bhejo
              </span>
            </p>
          </>
        )}

        <p style={{ ...s.link, marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#8888aa', fontSize: '.8rem' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f', padding: '1rem' },
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  logo: { display: 'block', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', textDecoration: 'none', color: '#f0f0f8' },
  title: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' },
  sub: { color: '#8888aa', fontSize: '.9rem', marginBottom: '1.75rem', lineHeight: 1.6 },
  input: { width: '100%', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.9rem', marginBottom: '.75rem', outline: 'none', display: 'block' },
  btn: { width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, marginTop: '.5rem', cursor: 'pointer' },
  link: { textAlign: 'center', marginTop: '1rem', color: '#8888aa', fontSize: '.875rem' }
};
