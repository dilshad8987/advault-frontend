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
  const barColor  = isLow ? '#ff4f87' : creditPct < 50 ? '#ffb700' : planColor;

  const planLabel = user?.plan === 'elite' ? 'Elite' : user?.plan === 'pro' ? 'Pro' : 'Free';

  const toggleMenu = () => { menuOpen.current = !menuOpen.current; forceRender(n => n + 1); };
  const closeMenu  = () => { menuOpen.current = false; forceRender(n => n + 1); };
  const confirmLogout = () => { closeMenu(); setShowLogoutConfirm(true); };

  const logout = async () => {
    setShowLogoutConfirm(false);
    try { await api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }); } catch {}
    finally { localStorage.clear(); navigate('/login'); }
  };

  return (
    <>
      <style>{`
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .nav-profile-row:hover { background: rgba(255,255,255,.05) !important; }
        .nav-upgrade-btn:hover { background: rgba(139,107,255,.18) !important; filter: brightness(1.1); }
        .nav-logout-btn:hover  { background: rgba(255,79,135,.14) !important; }
        .nav-modal-cancel:hover { background: rgba(255,255,255,.09) !important; }
        .nav-modal-confirm:hover { background: rgba(255,79,135,.2) !important; }
      `}</style>

      <nav style={s.nav}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="#fff" strokeWidth="1.8"/>
              <path d="M10 10l3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Ad<span style={{ color: '#8b6bff' }}>Vault</span></span>
        </Link>

        {/* Right */}
        <div style={s.right}>
          {user ? (
            <div style={{ position: 'relative' }}>
              {/* Trigger */}
              <div className="nav-profile-row" style={s.profileRow} onClick={toggleMenu}>
                <div style={{ ...s.avatar, boxShadow: `0 0 0 2px #0a0a12, 0 0 0 3.5px ${isLow ? '#ff4f87' : planColor}60` }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={s.profileName}>{user.name}</span>
              </div>

              {/* Dropdown */}
              {menuOpen.current && (
                <div style={s.dropdown}>

                  {/* User row */}
                  <div style={s.dropUser}>
                    <div style={{ ...s.dropAvatar, boxShadow: `0 0 0 2px ${planColor}40` }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={s.dropName}>{user.name}</div>
                      <div style={s.dropEmail}>{user.email}</div>
                    </div>
                    <div style={{ ...s.planPill, color: planColor, borderColor: planColor + '40', background: planColor + '12' }}>
                      {planLabel}
                    </div>
                  </div>

                  {/* Credits block — redesigned */}
                  <div style={{ ...s.creditsBlock, borderColor: isLow ? 'rgba(255,79,135,.22)' : `${planColor}28` }}>
                    {/* Top: icon + label + count */}
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.55rem' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'8px', background: isLow ? 'rgba(255,79,135,.12)' : `${planColor}18`, border:`1px solid ${isLow ? 'rgba(255,79,135,.2)' : planColor+'30'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <circle cx="6.5" cy="6.5" r="5.5" stroke={isLow ? '#ff4f87' : barColor} strokeWidth="1.2" strokeDasharray="2 1.5" opacity=".5"/>
                          <text x="6.5" y="9.5" textAnchor="middle" fontSize="6" fontWeight="700" fill={isLow ? '#ff4f87' : barColor}>C</text>
                        </svg>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'.6rem', fontWeight:700, color:'#3a3a52', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.06rem' }}>Credits Remaining</div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:'.2rem' }}>
                          <span style={{ fontSize:'1.1rem', fontWeight:900, color: barColor, fontVariantNumeric:'tabular-nums', letterSpacing:'-.03em', lineHeight:1 }}>
                            {credits ? credits.remaining.toLocaleString() : '—'}
                          </span>
                          <span style={{ fontSize:'.68rem', color:'#3a3a52', fontWeight:500 }}>
                            / {credits ? credits.limit.toLocaleString() : '—'}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize:'.65rem', fontWeight:700, color: barColor, background: `${barColor}14`, border:`1px solid ${barColor}28`, borderRadius:'99px', padding:'.15rem .45rem', flexShrink:0 }}>
                        {creditPct}%
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${Math.min(creditPct, 100)}%`, background: `linear-gradient(90deg, ${barColor}70, ${barColor})` }} />
                    </div>
                    {isLow && (
                      <div style={s.lowWarn}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9.5 9H.5L5 1z" stroke="#ff4f87" strokeWidth="1.1" strokeLinejoin="round"/><path d="M5 4v2" stroke="#ff4f87" strokeWidth="1.1" strokeLinecap="round"/></svg>
                        Credits khatam hone wale hain!
                      </div>
                    )}
                  </div>

                  {/* Upgrade */}
                  <Link to="/upgrade" className="nav-upgrade-btn" style={s.upgradeBtn} onClick={closeMenu}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 1.5l1.5 3.5h3.5l-2.8 2 1.1 3.5L6.5 8.5l-3.3 2 1.1-3.5L1.5 5H5L6.5 1.5z" fill="url(#ug)" stroke="none"/>
                      <defs><linearGradient id="ug" x1="1.5" y1="1.5" x2="10.5" y2="10.5"><stop stopColor="#8b6bff"/><stop offset="1" stopColor="#5aabff"/></linearGradient></defs>
                    </svg>
                    <span style={{ flex: 1 }}>Upgrade Plan</span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: .4 }}><path d="M3 1.5L6.5 5 3 8.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>

                  <div style={s.sep} />

                  {/* Logout */}
                  <button className="nav-logout-btn" style={s.logoutBtn} onClick={confirmLogout}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M5 2H2.5A1 1 0 001.5 3v7a1 1 0 001 1H5" stroke="#ff4f87" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M8.5 9L11.5 6.5 8.5 4" stroke="#ff4f87" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 6.5H5" stroke="#ff4f87" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Logout
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

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M9 3H4.5A1.5 1.5 0 003 4.5v13A1.5 1.5 0 004.5 19H9" stroke="#ff4f87" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M15 15l4-4-4-4" stroke="#ff4f87" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 11H9" stroke="#ff4f87" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={s.modalTitle}>Sign out?</div>
            <div style={s.modalSub}>Tumhara session end ho jayega</div>
            <div style={s.modalRow}>
              <button className="nav-modal-cancel" style={s.modalCancel} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="nav-modal-confirm" style={s.modalConfirm} onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  /* Nav bar */
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:100, height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1rem', background:'rgba(8,8,15,.92)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,.05)' },

  logo: { display:'flex', alignItems:'center', gap:'.55rem', fontWeight:800, fontSize:'1.15rem', color:'#f0f0f8', textDecoration:'none', letterSpacing:'-.02em' },
  logoIcon: { width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#5535e0,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },

  right: { display:'flex', alignItems:'center' },

  /* Profile trigger */
  profileRow: { display:'flex', alignItems:'center', gap:'.55rem', cursor:'pointer', padding:'.3rem .45rem .3rem .3rem', borderRadius:'12px', transition:'background .15s', userSelect:'none' },
  avatar: { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#5535e0,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'.85rem', flexShrink:0 },
  profileMeta: { display:'flex', flexDirection:'column', lineHeight:1.25, minWidth:0 },
  profileName: { fontSize:'.82rem', fontWeight:700, color:'#ededf8', letterSpacing:'-.01em' },

  /* Dropdown */
  dropdown: { position:'absolute', top:'calc(100% + 8px)', right:0, width:'252px', background:'#0c0c18', border:'1px solid rgba(255,255,255,.08)', borderRadius:'16px', padding:'.65rem', zIndex:200, boxShadow:'0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(139,107,255,.06)', animation:'dropIn .18s ease' },

  dropUser: { display:'flex', alignItems:'center', gap:'.6rem', padding:'.25rem .15rem .45rem' },
  dropAvatar: { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#5535e0,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'.84rem', flexShrink:0 },
  dropName:  { fontSize:'.83rem', fontWeight:700, color:'#ededf8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-.01em' },
  dropEmail: { fontSize:'.68rem', color:'#3e3e5a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'.08rem' },
  planPill:  { fontSize:'.62rem', fontWeight:700, padding:'.18rem .55rem', borderRadius:'99px', border:'1px solid', letterSpacing:'.03em', whiteSpace:'nowrap', flexShrink:0 },

  /* Credits */
  creditsBlock: { background:'rgba(255,255,255,.025)', border:'1px solid', borderRadius:'11px', padding:'.6rem .7rem', margin:'.05rem 0 .55rem' },
  creditsLabelRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.45rem' },
  creditsLabel: { fontSize:'.65rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  creditsVal:   { fontSize:'.82rem', fontWeight:800, fontVariantNumeric:'tabular-nums', letterSpacing:'-.02em' },
  barTrack: { height:'3px', background:'rgba(255,255,255,.07)', borderRadius:'2px', overflow:'hidden' },
  barFill:  { height:'100%', borderRadius:'2px', transition:'width .5s ease' },
  lowWarn:  { display:'flex', alignItems:'center', gap:'.3rem', fontSize:'.63rem', color:'#ff4f87', fontWeight:600, marginTop:'.38rem' },

  /* Upgrade btn */
  upgradeBtn: { display:'flex', alignItems:'center', gap:'.5rem', padding:'.55rem .6rem', background:'rgba(139,107,255,.1)', border:'1px solid rgba(139,107,255,.2)', borderRadius:'10px', color:'#a08bff', fontSize:'.82rem', fontWeight:600, textDecoration:'none', transition:'background .15s, filter .15s', marginBottom:'.45rem' },

  sep: { height:'1px', background:'rgba(255,255,255,.055)', margin:'.1rem 0 .45rem' },

  /* Logout */
  logoutBtn: { width:'100%', display:'flex', alignItems:'center', gap:'.5rem', padding:'.52rem .6rem', background:'rgba(255,79,135,.07)', border:'1px solid rgba(255,79,135,.14)', borderRadius:'10px', color:'#ff4f87', fontSize:'.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' },

  /* Auth */
  authBtns:    { display:'flex', gap:'.5rem' },
  loginBtn:    { padding:'.42rem .9rem', background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', color:'#c0c0d8', textDecoration:'none', fontSize:'.83rem', fontWeight:600 },
  registerBtn: { padding:'.42rem .9rem', background:'linear-gradient(135deg,#5535e0,#8b6bff)', borderRadius:'8px', color:'#fff', textDecoration:'none', fontSize:'.83rem', fontWeight:700 },

  backdrop: { position:'fixed', inset:0, zIndex:99 },

  /* Modal */
  overlay: { position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', animation:'fadeIn .15s ease' },
  modal:   { background:'#0c0c18', border:'1px solid rgba(255,255,255,.09)', borderRadius:'20px', padding:'1.75rem 1.5rem 1.5rem', width:'100%', maxWidth:'300px', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,.7)' },
  modalIcon:    { width:'48px', height:'48px', borderRadius:'14px', background:'rgba(255,79,135,.1)', border:'1px solid rgba(255,79,135,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' },
  modalTitle:   { fontSize:'1rem', fontWeight:800, color:'#ededf8', marginBottom:'.3rem', letterSpacing:'-.02em' },
  modalSub:     { color:'#3e3e5a', fontSize:'.8rem', marginBottom:'1.4rem' },
  modalRow:     { display:'flex', gap:'.6rem' },
  modalCancel:  { flex:1, padding:'.65rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'10px', color:'#8888aa', fontSize:'.85rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' },
  modalConfirm: { flex:1, padding:'.65rem', background:'rgba(255,79,135,.1)', border:'1px solid rgba(255,79,135,.22)', borderRadius:'10px', color:'#ff4f87', fontSize:'.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' },
};
