import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#161625', color: '#f0f0f8', border: '1px solid rgba(255,255,255,.08)' }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
