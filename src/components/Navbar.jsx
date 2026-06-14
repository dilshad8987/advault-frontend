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

                  {/* ── Credits Card ── */}
                  <div style={s.creditsCard}>
                    <div style={s.creditsCardTop}>
                      <div style={s.creditsCardIcon}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke={barColor} strokeWidth="1.3"/>
                          <path d="M6 3.5v2.5l1.5 1.5" stroke={barColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={s.creditsCardLabel}>Credits Remaining</span>
                      <span style={{ ...s.creditsCardVal, color: barColor }}>
                        {credits ? credits.remaining : '—'}<span style={s.creditsCardSub}>/{credits ? credits.limit : '—'}</span>
                      </span>
                    </div>
                    <div style={s.creditsTrack}>
                      <div style={{ height:'100%', width:`${Math.min(creditPct,100)}%`, background:`linear-gradient(90deg,${barColor}66,${barColor})`, borderRadius:'4px', transition:'width .6s ease' }} />
                    </div>
                    {isLow && (
                      <div style={s.creditsWarn}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1L8.5 8H.5L4.5 1z" stroke="#ff4f87" strokeWidth="1" strokeLinejoin="round"/><path d="M4.5 3.5v2" stroke="#ff4f87" strokeWidth="1" strokeLinecap="round"/></svg>
                        Credits khatam hone wale hain!
                      </div>
                    )}
                  </div>

                  {/* ── Upgrade ── */}
                  <Link to="/upgrade" className="nav-upgrade" style={s.upgradeBtn} onClick={closeMenu}>
                    <div style={s.upgradeBtnInner}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 2L8.5 6H12L9 8.5l1 3.5-3.5-2.5L3 12l1-3.5L1 6h3.5L6.5 2z" fill="url(#ug2)"/>
                        <defs><linearGradient id="ug2" x1="1" y1="2" x2="12" y2="12"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/></linearGradient></defs>
                      </svg>
                      <span style={s.upgradeBtnText}>Upgrade Plan</span>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity:.35 }}><path d="M3.5 2L7 5l-3.5 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>

                  {/* ── Logout ── */}
                  <button className="nav-logout" style={s.logoutBtn} onClick={confirmLogout}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M5 2.5H3a1 1 0 00-1 1v6a1 1 0 001 1h2" stroke="#ff4f87" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M8.5 8.5L11 6.5 8.5 4.5" stroke="#ff4f87" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 6.5H5.5" stroke="#ff4f87" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span>Logout</span>
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

  /* Credits card */
  creditsCard:    { background:'linear-gradient(135deg,rgba(108,71,255,.08),rgba(90,171,255,.05))', border:'1px solid rgba(108,71,255,.18)', borderRadius:'12px', padding:'.75rem .85rem', margin:'.1rem 0' },
  creditsCardTop: { display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.55rem' },
  creditsCardIcon:{ width:'22px', height:'22px', borderRadius:'6px', background:'rgba(108,71,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  creditsCardLabel:{ flex:1, fontSize:'.68rem', fontWeight:600, color:'#5a5a80', letterSpacing:'.01em' },
  creditsCardVal: { fontSize:'.9rem', fontWeight:900, fontVariantNumeric:'tabular-nums', letterSpacing:'-.02em' },
  creditsCardSub: { fontSize:'.68rem', fontWeight:500, color:'#3a3a55' },
  creditsTrack:   { height:'3.5px', background:'rgba(255,255,255,.06)', borderRadius:'4px', overflow:'hidden' },
  creditsWarn:    { display:'flex', alignItems:'center', gap:'.28rem', fontSize:'.63rem', color:'#ff4f87', fontWeight:600, marginTop:'.4rem' },

  /* Upgrade */
  upgradeBtn:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.7rem .85rem', background:'rgba(108,71,255,.1)', border:'1px solid rgba(108,71,255,.22)', borderRadius:'12px', color:'#c4b5fd', textDecoration:'none', transition:'background .15s, border-color .15s', margin:'.1rem 0' },
  upgradeBtnInner: { display:'flex', alignItems:'center', gap:'.5rem' },
  upgradeBtnText:  { fontSize:'.84rem', fontWeight:700, letterSpacing:'-.01em' },

  /* Logout */
  logoutBtn: { width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem', padding:'.65rem', background:'transparent', border:'1px solid rgba(255,79,135,.15)', borderRadius:'12px', color:'#ff4f87', fontSize:'.84rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background .15s, border-color .15s', marginTop:'.1rem' },

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
