// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ── Alag component — sirf yeh re-render ho credits update pe, Navbar nahi ──
function CreditsDisplay({ user }) {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    const load = () => {
      api.get('/user/profile')
        .then(res => {
          const u = res.data?.usage;
          if (u) setCredits({ remaining: u.creditsRemaining, limit: u.creditsLimit });
        }).catch(() => {});
    };
    load();
    window.addEventListener('credits-updated', load);
    return () => window.removeEventListener('credits-updated', load);
  }, []);

  const creditColor = user?.plan === 'elite' ? '#ffb700' : user?.plan === 'pro' ? '#5aabff' : '#8b6bff';
  const creditPct   = credits ? Math.round((credits.remaining / credits.limit) * 100) : null;
  const isLow       = creditPct !== null && creditPct < 20;
  const clr         = isLow ? '#ff4f87' : creditColor;

  return { credits, creditPct, isLow, clr };
}

// Cache key for localStorage
const CREDITS_CACHE_KEY = 'advault_credits_cache';

// Hook version — sirf credits state, koi JSX nahi
function useCredits(user) {
  // Pehle localStorage se cached value lo — null nahi dikhega kabhi
  const [credits, setCredits] = useState(() => {
    try {
      const cached = localStorage.getItem(CREDITS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  useEffect(() => {
    const load = () => {
      if (!user) return;
      api.get('/user/profile')
        .then(res => {
          const u = res.data?.usage;
          if (u) {
            const newVal = { remaining: u.creditsRemaining, limit: u.creditsLimit };
            // localStorage cache update karo silently
            try { localStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify(newVal)); } catch {}
            setCredits(c => {
              if (c && c.remaining === u.creditsRemaining && c.limit === u.creditsLimit) return c;
              return newVal;
            });
          }
        }).catch(() => {}); // Error pe cached value dikhti rahegi
    };
    load();
    window.addEventListener('credits-updated', load);
    return () => window.removeEventListener('credits-updated', load);
  }, []); // eslint-disable-line

  return credits;
}

export default function Navbar() {
  const navigate  = useNavigate();
  const menuOpen  = useRef(false);
  const [, forceRender] = useState(0); // sirf toggle ke liye
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user        = JSON.parse(localStorage.getItem('user') || 'null');
  const credits     = useCredits(user);
  const creditColor = user?.plan === 'elite' ? '#ffb700' : user?.plan === 'pro' ? '#5aabff' : '#8b6bff';
  const creditPct   = credits ? Math.round((credits.remaining / credits.limit) * 100) : null;
  const isLow       = creditPct !== null && creditPct < 20;
  const clr         = isLow ? '#ff4f87' : creditColor;

  const toggleMenu = () => {
    menuOpen.current = !menuOpen.current;
    forceRender(n => n + 1); // sirf toggle ke liye re-render
  };

  const closeMenu = () => {
    menuOpen.current = false;
    forceRender(n => n + 1);
  };

  const confirmLogout = () => { closeMenu(); setShowLogoutConfirm(true); };

  const logout = async () => {
    setShowLogoutConfirm(false);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    finally {
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
            <div style={{ position: 'relative' }}>
              <div style={s.profileRow} onClick={toggleMenu}>
                <div style={{ ...s.avatarCircle, boxShadow: isLow ? '0 0 0 2px #ff4f87' : '0 0 0 2px rgba(139,107,255,0.4)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={s.profileInfo}>
                  <span style={s.profileName}>{user.name}</span>
                  {credits !== null && (
                    <span style={{ fontSize: '.68rem', color: clr, fontWeight: 700 }}>
                      {isLow ? '⚠ ' : ''}{credits.remaining} credits
                    </span>
                  )}
                </div>
              </div>

              {menuOpen.current && (
                <div style={s.dropdown}>
                  {/* Header */}
                  <div style={s.dropHeader}>
                    <div style={s.dropAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={s.dropName}>{user.name}</div>
                      <div style={s.dropEmail}>{user.email}</div>
                    </div>
                  </div>

                  <div style={s.divider} />

                  {/* Credits Card */}
                  {credits !== null && (
                    <div style={{ ...s.creditsCard, borderColor: isLow ? 'rgba(255,79,135,.25)' : 'rgba(139,107,255,.2)' }}>
                      <div style={s.creditsTop}>
                        <div>
                          <div style={s.creditsTitle}>Credits</div>
                          <div style={{ ...s.creditsBig, color: clr }}>
                            {credits.remaining.toLocaleString()}
                            <span style={s.creditsOf}> / {credits.limit.toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ ...s.planBadge,
                          background:   user?.plan === 'elite' ? 'rgba(255,183,0,.12)' : user?.plan === 'pro' ? 'rgba(90,171,255,.12)' : 'rgba(139,107,255,.12)',
                          color:        user?.plan === 'elite' ? '#ffb700' : user?.plan === 'pro' ? '#5aabff' : '#8b6bff',
                          borderColor:  user?.plan === 'elite' ? 'rgba(255,183,0,.25)' : user?.plan === 'pro' ? 'rgba(90,171,255,.25)' : 'rgba(139,107,255,.25)'
                        }}>
                          {user?.plan === 'elite' ? '⭐ Elite' : user?.plan === 'pro' ? '💎 Pro' : '◇ Free'}
                        </div>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.barFill, width: `${Math.min(creditPct, 100)}%`, background: clr }} />
                      </div>
                      {isLow && <div style={s.lowWarn}>⚠ Credits khatam hone wale hain!</div>}
                    </div>
                  )}

                  <div style={s.divider} />

                  {/* Upgrade */}
                  <Link to="/upgrade" style={s.upgradeBtn} onClick={closeMenu}>
                    <span>⚡</span>
                    <span>Upgrade Plan</span>
                    <span style={{ marginLeft: 'auto', opacity: .5, fontSize: '.8rem' }}>→</span>
                  </Link>

                  <div style={s.divider} />

                  {/* Logout */}
                  <button style={s.dropLogout} onClick={confirmLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.loginBtn}>Login</Link>
              <Link to="/register" style={s.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen.current && <div style={s.backdrop} onClick={closeMenu} />}

      {/* Logout Confirm Modal */}
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
  profileRow: { display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', padding: '.3rem .4rem', borderRadius: '10px' },
  avatarCircle: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.9rem', flexShrink: 0, transition: 'box-shadow .2s' },
  profileInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.3 },
  profileName: { fontSize: '.82rem', fontWeight: 700, color: '#f0f0f8' },
  dropdown: { position: 'absolute', top: '50px', right: 0, width: '240px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '.75rem', zIndex: 200, boxShadow: '0 16px 48px rgba(0,0,0,.6)' },
  dropHeader: { display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.1rem 0 .35rem' },
  dropAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  dropName: { fontSize: '.84rem', fontWeight: 700, color: '#f0f0f8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dropEmail: { fontSize: '.7rem', color: '#666688', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  divider: { height: '1px', background: 'rgba(255,255,255,.06)', margin: '.45rem 0' },
  creditsCard: { background: 'rgba(255,255,255,.03)', border: '1px solid', borderRadius: '10px', padding: '.6rem .7rem', margin: '.1rem 0' },
  creditsTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.5rem' },
  creditsTitle: { fontSize: '.7rem', color: '#666688', fontWeight: 500, marginBottom: '.1rem', textTransform: 'uppercase', letterSpacing: '.04em' },
  creditsBig: { fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 },
  creditsOf: { fontSize: '.75rem', fontWeight: 500, color: '#555577' },
  planBadge: { fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem', borderRadius: '20px', border: '1px solid', whiteSpace: 'nowrap' },
  barBg: { height: '4px', background: 'rgba(255,255,255,.07)', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width .4s ease' },
  lowWarn: { fontSize: '.68rem', color: '#ff4f87', marginTop: '.35rem', fontWeight: 600 },
  upgradeBtn: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.55rem .5rem', background: 'linear-gradient(135deg,rgba(108,71,255,.15),rgba(139,107,255,.08))', border: '1px solid rgba(139,107,255,.2)', borderRadius: '8px', color: '#a08bff', fontSize: '.83rem', fontWeight: 600, textDecoration: 'none' },
  dropLogout: { width: '100%', padding: '.5rem', background: 'rgba(255,79,135,.08)', border: '1px solid rgba(255,79,135,.15)', color: '#ff4f87', borderRadius: '8px', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 },
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
