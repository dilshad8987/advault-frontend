// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CREDITS_CACHE_KEY = 'advault_credits_cache';

function useCredits(user) {
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
            try { localStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify(newVal)); } catch {}
            setCredits(c => {
              if (c && c.remaining === u.creditsRemaining && c.limit === u.creditsLimit) return c;
              return newVal;
            });
          }
        }).catch(() => {});
    };
    load();
    window.addEventListener('credits-updated', load);
    return () => window.removeEventListener('credits-updated', load);
  }, []); // eslint-disable-line

  return credits;
}

export default function Navbar() {
  const navigate = useNavigate();
  const menuOpen = useRef(false);
  const [, forceRender] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user    = JSON.parse(localStorage.getItem('user') || 'null');
  const credits = useCredits(user);

  const planColor = user?.plan === 'elite' ? '#f5a623' : user?.plan === 'pro' ? '#5aabff' : '#8b6bff';
  const creditPct = credits ? Math.round((credits.remaining / credits.limit) * 100) : 100;
  const isLow     = credits && creditPct < 20;
  const barColor  = isLow ? '#ff4f87' : planColor;

  const toggleMenu    = () => { menuOpen.current = !menuOpen.current; forceRender(n => n + 1); };
  const closeMenu     = () => { menuOpen.current = false; forceRender(n => n + 1); };
  const confirmLogout = () => { closeMenu(); setShowLogoutConfirm(true); };

  const logout = async () => {
    setShowLogoutConfirm(false);
    try { await api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }); } catch {}
    finally { localStorage.clear(); navigate('/login'); }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .nav-upgrade:hover { background:rgba(108,71,255,.18) !important; border-color:rgba(108,71,255,.38) !important; }
        .nav-logout:hover  { background:rgba(255,79,135,.1) !important; border-color:rgba(255,79,135,.3) !important; }
        .nav-modal-cancel:hover  { background: rgba(255,255,255,.08) !important; }
        .nav-modal-confirm:hover { background: rgba(255,79,135,.2) !important; }
      `}</style>

      <nav style={s.nav}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={s.logo}>
          <div style={s.logoIcon}>🔍</div>
          <span>Ad<span style={{ color: '#8b6bff' }}>Vault</span></span>
        </Link>

        {/* Right */}
        <div style={s.right}>
          {user ? (
            <div style={{ position: 'relative' }}>
              {/* Trigger — avatar + name only */}
              <div style={s.trigger} onClick={toggleMenu}>
                <div style={s.avatar}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={s.triggerName}>{user.name}</span>
              </div>

              {/* Dropdown */}
              {menuOpen.current && (
                <div style={s.dropdown}>

                  {/* User info */}
                  <div style={s.userRow}>
                    <div style={s.dropAvatar}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={s.userInfo}>
                      <div style={s.userName}>{user.name}</div>
                      <div style={s.userEmail}>{user.email}</div>
                    </div>
                  </div>

                  {/* ── Credits ── */}
                  <div style={s.creditsCard}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'.5rem' }}>
                      <span style={s.creditsLabel}>Credits</span>
                      <div>
                        <span style={{ fontSize:'1.05rem', fontWeight:900, color: barColor, fontVariantNumeric:'tabular-nums', letterSpacing:'-.02em' }}>
                          {credits ? credits.remaining : '—'}
                        </span>
                        <span style={{ fontSize:'.7rem', color:'#33334a', fontWeight:500 }}>
                          {' / '}{credits ? credits.limit : '—'}
                        </span>
                      </div>
                    </div>
                    {/* Segmented bar */}
                    <div style={{ display:'flex', gap:'2px' }}>
                      {Array.from({ length: 10 }).map((_, i) => {
                        const filled = i < Math.round(creditPct / 10);
                        return (
                          <div key={i} style={{ flex:1, height:'4px', borderRadius:'2px', background: filled ? barColor : 'rgba(255,255,255,.07)', transition:'background .4s ease' }} />
                        );
                      })}
                    </div>
                    {isLow && (
                      <div style={{ fontSize:'.63rem', color:'#ff4f87', fontWeight:600, marginTop:'.38rem', display:'flex', alignItems:'center', gap:'.25rem' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1L7.5 7H.5L4 1z" stroke="#ff4f87" strokeWidth="1" strokeLinejoin="round"/><path d="M4 3.2v1.6" stroke="#ff4f87" strokeWidth="1" strokeLinecap="round"/></svg>
                        Low on credits
                      </div>
                    )}
                  </div>

                  {/* ── Upgrade ── */}
                  <Link to="/upgrade" className="nav-upgrade" style={s.upgradeBtn} onClick={closeMenu}>
                    <span style={s.upgradeIcon}>⚡</span>
                    <span style={s.upgradeText}>Upgrade Plan</span>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ opacity:.4, marginLeft:'auto' }}><path d="M3 1.5L6.5 4.5 3 7.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>

                  {/* ── Logout ── */}
                  <button className="nav-logout" style={s.logoutBtn} onClick={confirmLogout}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M5 2.5H3a1 1 0 00-1 1v6a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M8.5 8.5L11 6.5 8.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 6.5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login"    style={s.loginBtn}>Login</Link>
              <Link to="/register" style={s.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen.current && <div style={s.backdrop} onClick={closeMenu} />}

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🚪</div>
            <h3 style={s.modalTitle}>Logout karo?</h3>
            <p style={s.modalSub}>Are you sure you want to sign out?</p>
            <div style={s.modalBtns}>
              <button className="nav-modal-cancel"  style={s.modalCancel}  onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="nav-modal-confirm" style={s.modalConfirm} onClick={logout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  nav:         { position:'fixed', top:0, left:0, right:0, zIndex:100, height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.1rem', background:'#0a0a12', borderBottom:'1px solid rgba(255,255,255,.05)' },
  logo:        { display:'flex', alignItems:'center', gap:'.5rem', fontWeight:800, fontSize:'1.2rem', color:'#fff', textDecoration:'none' },
  logoIcon:    { width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' },
  right:       { display:'flex', alignItems:'center' },

  trigger:     { display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer', padding:'.3rem .4rem', borderRadius:'10px' },
  avatar:      { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'.9rem', flexShrink:0 },
  triggerName: { fontSize:'.85rem', fontWeight:700, color:'#f0f0f8' },

  dropdown:  { position:'absolute', top:'52px', right:0, width:'260px', background:'#13131f', border:'1px solid rgba(255,255,255,.09)', borderRadius:'14px', padding:'.8rem', zIndex:200, boxShadow:'0 16px 48px rgba(0,0,0,.65)', animation:'fadeIn .15s ease' },

  userRow:   { display:'flex', alignItems:'center', gap:'.65rem', paddingBottom:'.1rem' },
  dropAvatar:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'.9rem', flexShrink:0 },
  userInfo:  { minWidth:0, flex:1 },
  userName:  { fontSize:'.88rem', fontWeight:700, color:'#f0f0f8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  userEmail: { fontSize:'.71rem', color:'#55556a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'.05rem' },

  creditsCard:  { background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', padding:'.7rem .8rem', margin:'.05rem 0' },
  creditsLabel: { fontSize:'.65rem', fontWeight:700, color:'#44445e', textTransform:'uppercase', letterSpacing:'.07em' },

  upgradeBtn:   { display:'flex', alignItems:'center', gap:'.5rem', padding:'.65rem .8rem', background:'linear-gradient(135deg,rgba(108,71,255,.18),rgba(90,171,255,.1))', border:'1px solid rgba(108,71,255,.3)', borderRadius:'12px', color:'#c4b5fd', textDecoration:'none', transition:'all .15s', margin:'.05rem 0' },
  upgradeIcon:  { fontSize:'.9rem', lineHeight:1 },
  upgradeText:  { fontSize:'.83rem', fontWeight:700, letterSpacing:'-.01em' },

  logoutBtn:    { width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'.45rem', padding:'.62rem', background:'rgba(255,79,135,.06)', border:'1px solid rgba(255,79,135,.14)', borderRadius:'12px', color:'#ff4f87', fontSize:'.83rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', marginTop:'.05rem' },

  authBtns:    { display:'flex', gap:'.5rem' },
  loginBtn:    { padding:'.42rem .9rem', background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', color:'#c0c0d8', textDecoration:'none', fontSize:'.83rem' },
  registerBtn: { padding:'.42rem .9rem', background:'linear-gradient(135deg,#5535e0,#8b6bff)', borderRadius:'8px', color:'#fff', textDecoration:'none', fontSize:'.83rem', fontWeight:700 },

  backdrop: { position:'fixed', inset:0, zIndex:99 },

  overlay:      { position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  modal:        { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:'16px', padding:'2rem 1.75rem', width:'100%', maxWidth:'300px', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,.6)' },
  modalTitle:   { fontSize:'1.05rem', fontWeight:800, color:'#f0f0f8', marginBottom:'.35rem' },
  modalSub:     { color:'#6666aa', fontSize:'.84rem', marginBottom:'1.4rem' },
  modalBtns:    { display:'flex', gap:'.65rem' },
  modalCancel:  { flex:1, padding:'.68rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'8px', color:'#8888aa', fontSize:'.88rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' },
  modalConfirm: { flex:1, padding:'.68rem', background:'rgba(255,79,135,.1)', border:'1px solid rgba(255,79,135,.22)', borderRadius:'8px', color:'#ff4f87', fontSize:'.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' },
};
