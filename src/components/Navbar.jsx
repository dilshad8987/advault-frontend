// components/Navbar.jsx
// Fix: Logout ab server pe bhi call karta hai (pehle sirf localStorage.clear() tha)
// Server logout se refreshToken invalidate hota hai aur device session hatata hai

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Navbar() {
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [credits, setCredits] = useState(null);
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const isPro = user?.plan && user.plan !== 'free';

  // Credits fetch on mount
  useEffect(() => {
    if (!user) return;
    api.get('/user/profile')
      .then(res => {
        const u = res.data?.usage;
        if (u) setCredits({ remaining: u.creditsRemaining, limit: u.creditsLimit });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const creditPct = credits ? Math.round((credits.remaining / credits.limit) * 100) : null;
  const creditColor = creditPct === null ? '#6c47ff'
    : creditPct > 50 ? '#4caf7d'
    : creditPct > 20 ? '#ffb700'
    : '#ff4f87';

  const confirmLogout = () => {
    setMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const logout = async () => {
    setShowLogoutConfirm(false);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Server down ho toh bhi local logout karo
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <>
      <nav style={s.nav}>
        <Link to={user ? '/dashboard' : '/'} style={s.logo}>
          <div style={s.logoIcon}>🔍</div>
          Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        <div style={s.right}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              {/* ── Credits pill ── */}
              {credits !== null && (
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={s.creditPill}>
                    <svg width="11" height="11" viewBox="0 0 20 20" fill={creditColor} style={{ flexShrink: 0 }}>
                      <circle cx="10" cy="10" r="9" stroke={creditColor} strokeWidth="2" fill="none"/>
                      <path d="M10 5v5l3 3" stroke={creditColor} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ ...s.creditText, color: creditColor }}>
                      {credits.remaining.toLocaleString()}
                    </span>
                    <div style={s.creditBar}>
                      <div style={{ ...s.creditBarFill, width: `${creditPct}%`, background: creditColor }} />
                    </div>
                  </div>
                </Link>
              )}

              <div style={{ position: 'relative' }}>
                <div style={s.profileRow} onClick={() => setMenuOpen(!menuOpen)}>
                  <div style={s.avatarCircle}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={s.profileInfo}>
                    <span style={s.profileName}>{user.name}</span>
                    {isPro && <span style={s.proBadge}>⭐ {user.plan === 'elite' ? 'Elite' : 'Pro'}</span>}
                  </div>
                </div>

                {menuOpen && (
                  <div style={s.dropdown}>
                    <div style={s.dropHeader}>
                      <div style={s.dropAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={s.dropName}>{user.name}</div>
                        <div style={s.dropEmail}>{user.email}</div>
                      </div>
                    </div>

                    <div style={s.divider} />

                    {/* Credits summary in dropdown */}
                    {credits !== null && (
                      <>
                        <div style={s.dropCredits}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                            <span style={s.dropCreditsLabel}>Credits</span>
                            <span style={{ ...s.dropCreditsVal, color: creditColor }}>
                              {credits.remaining.toLocaleString()} / {credits.limit.toLocaleString()}
                            </span>
                          </div>
                          <div style={s.dropCreditBar}>
                            <div style={{ ...s.dropCreditFill, width: `${creditPct}%`, background: creditColor }} />
                          </div>
                        </div>
                        <div style={s.divider} />
                      </>
                    )}

                    <Link to="/upgrade" style={s.dropItem} onClick={() => setMenuOpen(false)}>
                      ⚡ Upgrade
                    </Link>

                    <div style={s.divider} />

                    <button style={s.dropLogout} onClick={confirmLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.loginBtn}>Login</Link>
              <Link to="/register" style={s.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen && <div style={s.backdrop} onClick={() => setMenuOpen(false)} />}

      {/* ── Logout Confirm Modal ─────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🚪</div>
            <h3 style={s.modalTitle}>Logout karo?</h3>
            <p style={s.modalSub}>Are you sure you want to sign out?</p>
            <div style={s.modalBtns}>
              <button style={s.modalCancel} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button style={s.modalConfirm} onClick={logout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', height: '60px', background: '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { display: 'flex', alignItems: 'center' },
  // Credits pill
  creditPill: { display: 'flex', alignItems: 'center', gap: '.35rem', padding: '.3rem .65rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '20px', cursor: 'pointer' },
  creditText: { fontSize: '.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  creditBar: { width: '36px', height: '4px', background: 'rgba(255,255,255,.1)', borderRadius: '2px', overflow: 'hidden' },
  creditBarFill: { height: '100%', borderRadius: '2px', transition: 'width .3s' },
  // Profile
  profileRow: { display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', padding: '.3rem .4rem', borderRadius: '10px' },
  avatarCircle: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 },
  profileInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  profileName: { fontSize: '.82rem', fontWeight: 700, color: '#f0f0f8' },
  proBadge: { fontSize: '.7rem', color: '#ffb700', fontWeight: 700 },
  dropdown: { position: 'absolute', top: '46px', right: 0, width: '220px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '.75rem', zIndex: 200, boxShadow: '0 12px 40px rgba(0,0,0,.5)' },
  dropHeader: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.15rem 0 .3rem' },
  dropAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  dropName: { fontSize: '.83rem', fontWeight: 700, color: '#f0f0f8' },
  dropEmail: { fontSize: '.7rem', color: '#8888aa' },
  divider: { height: '1px', background: 'rgba(255,255,255,.06)', margin: '.45rem 0' },
  dropItem: { display: 'block', padding: '.5rem .4rem', color: '#c8c8e0', fontSize: '.83rem', fontWeight: 500, textDecoration: 'none', borderRadius: '6px' },
  dropLogout: { width: '100%', padding: '.5rem', background: 'rgba(255,79,135,.08)', border: '1px solid rgba(255,79,135,.15)', color: '#ff4f87', borderRadius: '6px', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 },
  // Dropdown credits
  dropCredits: { padding: '.1rem .1rem .3rem' },
  dropCreditsLabel: { fontSize: '.75rem', color: '#8888aa', fontWeight: 500 },
  dropCreditsVal: { fontSize: '.75rem', fontWeight: 700 },
  dropCreditBar: { height: '5px', background: 'rgba(255,255,255,.08)', borderRadius: '3px', overflow: 'hidden' },
  dropCreditFill: { height: '100%', borderRadius: '3px', transition: 'width .3s' },
  authBtns: { display: 'flex', gap: '.6rem' },
  loginBtn: { padding: '.45rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  registerBtn: { padding: '.45rem 1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  backdrop: { position: 'fixed', inset: 0, zIndex: 99 },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '2rem 1.75rem', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.6)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.4rem' },
  modalSub: { color: '#8888aa', fontSize: '.88rem', marginBottom: '1.5rem' },
  modalBtns: { display: 'flex', gap: '.75rem' },
  modalCancel: { flex: 1, padding: '.7rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#c8c8e0', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer' },
  modalConfirm: { flex: 1, padding: '.7rem', background: 'rgba(255,79,135,.12)', border: '1px solid rgba(255,79,135,.25)', borderRadius: '8px', color: '#ff4f87', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' },
};
