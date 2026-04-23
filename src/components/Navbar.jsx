import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>🔍</div>
          Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>

        <div style={styles.right}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button style={styles.profileBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={styles.avatarCircle}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {menuOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropUser}>
                    <div style={styles.dropAvatar}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.dropName}>{user.name}</div>
                      <div style={styles.dropEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div style={styles.divider}></div>
                  <span style={styles.planBadge}>{(user.plan || 'free').toUpperCase()} PLAN</span>
                  <div style={styles.divider}></div>
                  {/* Links removed from here */}
                  <div style={styles.divider}></div>
                  <button style={styles.dropLogout} onClick={logout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen && (
        <div style={styles.backdrop} onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '64px', background: '#0a0a12', borderBottom: '1px solid rgba(255,255,255,.05)' },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  right: { display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 },
  profileBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  avatarCircle: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, border: '2px solid rgba(255,255,255,.1)' },
  dropdown: { position: 'absolute', top: '48px', right: 0, width: '220px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '.8rem', boxShadow: '0 10px 30px rgba(0,0,0,.5)', zIndex: 101 },
  dropUser: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.5rem 0' },
  dropAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '.9rem' },
  dropName: { fontSize: '.85rem', fontWeight: 700, color: '#f0f0f8' },
  dropEmail: { fontSize: '.72rem', color: '#8888aa', marginTop: '.1rem' },
  divider: { height: '1px', background: 'rgba(255,255,255,.06)', margin: '.5rem 0' },
  planBadge: { display: 'inline-block', padding: '.2rem .6rem', borderRadius: '999px', background: 'rgba(108,71,255,.15)', color: '#8b6bff', fontSize: '.65rem', fontWeight: 700, letterSpacing: '0.5px' },
  dropItem: { display: 'block', padding: '.5rem .4rem', fontSize: '.85rem', color: '#8888aa', textDecoration: 'none', borderRadius: '6px', transition: 'all .2s' },
  dropLogout: { width: '100%', padding: '.5rem .4rem', background: 'rgba(255,79,135,.08)', border: '1px solid rgba(255,79,135,.15)', color: '#ff4f87', borderRadius: '6px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: '.2rem' },
  authBtns: { display: 'flex', gap: '.6rem', alignItems: 'center' },
  loginBtn: { padding: '.45rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', color: '#fff', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' },
  registerBtn: { padding: '.45rem 1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius: '8px', color: '#fff', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' },
  backdrop: { position: 'fixed', inset: 0, zIndex: 99 }
};
