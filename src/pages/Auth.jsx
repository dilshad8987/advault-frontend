import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Auth() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.email || !form.password) return toast.error('Sab fields bharo');
    if (!isLogin && !form.name) return toast.error('Name daalo');
    if (!isLogin && form.password.length < 8) return toast.error('Password 8 characters ka hona chahiye');

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await api.post(endpoint, payload);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success(isLogin ? 'Login ho gaye!' : 'Account ban gaya!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? 'Login fail' : 'Register fail'));
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          🔍 Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        <h2 style={s.title}>{isLogin ? 'Welcome Back' : 'Account Banao'}</h2>
        <p style={s.sub}>
          {isLogin ? 'Apne account mein login karo' : 'Free mein shuru karo — no credit card required'}
        </p>

        {!isLogin && (
          <input style={s.input} name="name" placeholder="Full Name" value={form.name} onChange={handle} />
        )}

        <input style={s.input} name="email" placeholder="Email" value={form.email} onChange={handle} />

        <input
          style={s.input}
          name="password"
          type="password"
          placeholder={isLogin ? 'Password' : 'Password (min 8 chars)'}
          value={form.password}
          onChange={handle}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />

        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '.75rem', marginTop: '-.25rem' }}>
            <Link to="/forgot-password" style={{ color: '#8b6bff', fontSize: '.82rem' }}>
              Forgot Password?
            </Link>
          </div>
        )}

        <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
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
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f', padding: '1rem' },
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  logo: { display: 'block', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', textDecoration: 'none', color: '#f0f0f8' },
  title: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' },
  sub: { color: '#8888aa', fontSize: '.9rem', marginBottom: '1.75rem', lineHeight: 1.5 },
  input: { width: '100%', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.9rem', marginBottom: '.75rem', outline: 'none', display: 'block' },
  btn: { width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, marginTop: '.5rem', cursor: 'pointer' },
  link: { textAlign: 'center', marginTop: '1rem', color: '#8888aa', fontSize: '.875rem' }
};
