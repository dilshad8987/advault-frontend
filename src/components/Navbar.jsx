import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.nav}>
        <Link to={user ? '/dashboard' : '/'} style={styles.logo}>
          <div style={styles.logoIcon}>🔍</div>
          Ad<span style={{ color:'#8b6bff' }}>Vault</span>
        </Link>

        {/* Nav links — logged in users */}
        {user && (
          <div style={styles.navLinks}>
            <Link to="/dashboard" style={{ ...styles.navLink, ...(isActive('/dashboard') ? styles.navLinkActive : {}) }}>
              🏠 Dashboard
            </Link>
            <Link to="/search" style={{ ...styles.navLink, ...(isActive('/search') ? styles.navLinkActive : {}) }}>
              🔍 Search
            </Link>
            <Link to="/saved" style={{ ...styles.navLink, ...(isActive('/saved') ? styles.navLinkActive : {}) }}>
              💾 Saved
            </Link>
          </div>
        )}

        <div style={styles.right}>
          {user ? (
            <div style={{ position:'relative' }}>
              <button style={styles.profileBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={styles.avatarCircle}>{user.name?.charAt(0).toUpperCase() || 'U'}</div>
              </button>

              {menuOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropUser}>
                    <div style={styles.dropAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={styles.dropName}>{user.name}</div>
                      <div style={styles.dropEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div style={styles.divider}></div>
                  <span style={styles.planBadge}>{(user.plan||'free').toUpperCase()} PLAN</span>
                  <div style={styles.divider}></div>

                  {/* Mobile nav links in dropdown */}
                  <div style={styles.mobileLinks}>
                    <Link to="/dashboard" style={styles.dropLink} onClick={() => setMenuOpen(false)}>🏠 Dashboard</Link>
                    <Link to="/search"    style={styles.dropLink} onClick={() => setMenuOpen(false)}>🔍 Search Ads</Link>
                    <Link to="/saved"     style={styles.dropLink} onClick={() => setMenuOpen(false)}>💾 Saved Ads</Link>
                  </div>
                  <div style={styles.divider}></div>

                  <button style={styles.dropLogout} onClick={logout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login"    style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen && <div style={styles.backdrop} onClick={() => setMenuOpen(false)} />}
    </>
  );
}

const styles = {
  nav:         { position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:'60px', background:'#0a0a12', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  logo:        { display:'flex', alignItems:'center', gap:'.5rem', fontWeight:800, fontSize:'1.2rem', color:'#fff', textDecoration:'none', flexShrink:0 },
  logoIcon:    { width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center' },
  navLinks:    { display:'flex', alignItems:'center', gap:'.25rem', '@media(max-width:640px)':{display:'none'} },
  navLink:     { padding:'.4rem .85rem', borderRadius:'7px', fontSize:'.82rem', fontWeight:600, color:'#8888aa', textDecoration:'none', transition:'all .2s', whiteSpace:'nowrap' },
  navLinkActive:{ background:'rgba(108,71,255,.15)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.25)' },
  right:       { display:'flex', alignItems:'center', gap:'.75rem' },
  profileBtn:  { background:'none', border:'none', cursor:'pointer' },
  avatarCircle:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700 },
  dropdown:    { position:'absolute', top:'48px', right:0, width:'220px', background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', padding:'0.7rem', zIndex:200 },
  dropUser:    { display:'flex', alignItems:'center', gap:'.6rem' },
  dropAvatar:  { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 },
  dropName:    { fontSize:'.85rem', fontWeight:700, color:'#f0f0f8' },
  dropEmail:   { fontSize:'.72rem', color:'#8888aa' },
  divider:     { height:'1px', background:'rgba(255,255,255,.06)', margin:'.5rem 0' },
  planBadge:   { display:'inline-block', padding:'.2rem .6rem', borderRadius:'999px', background:'rgba(108,71,255,.15)', color:'#8b6bff', fontSize:'.7rem' },
  mobileLinks: { display:'flex', flexDirection:'column', gap:'.2rem' },
  dropLink:    { display:'block', padding:'.45rem .6rem', borderRadius:'6px', color:'#d0d0e8', textDecoration:'none', fontSize:'.82rem', fontWeight:600 },
  dropLogout:  { width:'100%', padding:'.5rem', background:'rgba(255,79,135,.08)', border:'1px solid rgba(255,79,135,.15)', color:'#ff4f87', borderRadius:'6px', cursor:'pointer' },
  authBtns:    { display:'flex', gap:'.6rem' },
  loginBtn:    { padding:'.45rem 1rem', background:'transparent', border:'1px solid rgba(255,255,255,.12)', borderRadius:'8px', color:'#fff', textDecoration:'none' },
  registerBtn: { padding:'.45rem 1rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius:'8px', color:'#fff', textDecoration:'none' },
  backdrop:    { position:'fixed', inset:0, zIndex:99 },
};
