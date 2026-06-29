import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdDetail from './pages/AdDetail';
import Profile from './pages/Profile';
import Collection from './pages/Collection';
import PrivacyPolicy from './pages/PrivacyPolicy';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  // Token exist karta hai but expired ho sakta hai — sirf valid JWT check karo
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) return <Navigate to="/dashboard" />;
    } catch (e) {}
    // Expired/invalid token — clear karo
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  return children;
}

function App() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const preventZoom = (e) => { if (e.ctrlKey) e.preventDefault(); };
    const preventKeyZoom = (e) => {
      if (e.ctrlKey && ['+', '-', '=', '_', '0'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', preventZoom, { passive: false });
    window.addEventListener('keydown', preventKeyZoom);
    return () => {
      window.removeEventListener('wheel', preventZoom);
      window.removeEventListener('keydown', preventKeyZoom);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token && refreshToken) {
      fetch('https://api.advault.in/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
        .then(res => res.json())
        .then(data => { if (data.accessToken) localStorage.setItem('accessToken', data.accessToken); })
        .catch(() => {})
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#161625', color: '#f0f0f8', border: '1px solid rgba(255,255,255,.08)' }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/ad/:adId" element={<PrivateRoute><AdDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/upgrade" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/collection" element={<PrivateRoute><Collection /></PrivateRoute>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
