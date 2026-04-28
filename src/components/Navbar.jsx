import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    setMenuOpen(false);
  };

  const isPro = user?.plan && user.plan !== 'free';

  return (
    <>
      <nav style={styles.nav}>
        <Link to={user ? "/dashboard" : "/"} style={styles.logo}>
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

                  <div style={styles.planRow}>
                    <span style={{
                      ...styles.planBadge,
                      background: isPro ? 'rgba(255,183,0,.12)' : 'rgba(108,71,255,.15)',
                      color: isPro ? '#ffb700' : '#8b6bff',
                    }}>
                      {isPro ? '⭐' : '🆓'} {(user.plan || 'free').toUpperCase()} PLAN
                    </span>
                  </div>

                  {!isPro && (
                    <Link to="/upgrade" style={styles.upgradeBtn} onClick={() => setMenuOpen(false)}>
                      ⚡ Upgrade to Pro
                    </Link>
                  )}

                  <div style={styles.divider}></div>

                  <Link to="/profile" style={styles.menuItem} onClick={() => setMenuOpen(false)}>
                    👤 Profile Settings
                  </Link>

                  <div style={styles.divider}></div>

                  <button style={styles.dropLogout} onClick={logout}>
                    🚪 Logout
                  </button>
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

      {menuOpen && <div style={styles.backdrop} onClick={() => setMenuOpen(false)} />}
    </>
  );
}

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', background: '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { display: 'flex', alignItems: 'center', gap: '.75rem' },
  profileBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  avatarCircle: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 },
  dropdown: { position: 'absolute', top: '48px', right: 0, width: '230px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem', zIndex: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
  dropUser: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.25rem 0' },
  dropAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  dropName: { fontSize: '.85rem', fontWeight: 700, color: '#f0f0f8' },
  dropEmail: { fontSize: '.72rem', color: '#8888aa' },
  divider: { height: '1px', background: 'rgba(255,255,255,.06)', margin: '.5rem 0' },
  planRow: { marginBottom: '.4rem' },
  planBadge: { display: 'inline-block', padding: '.22rem .7rem', borderRadius: '999px', fontSize: '.72rem', fontWeight: 700 },
  upgradeBtn: { display: 'block', width: '100%', padding: '.6rem .75rem', background: 'linear-gradient(135deg,#ff6b2b,#ff9d00)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginTop: '.35rem', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(255,107,43,.3)' },
  menuItem: { display: 'block', padding: '.5rem .4rem', color: '#c8c8e0', fontSize: '.84rem', fontWeight: 500, cursor: 'pointer', borderRadius: '6px', textDecoration: 'none' },
  dropLogout: { width: '100%', padding: '.5rem', background: 'rgba(255,79,135,.08)', border: '1px solid rgba(255,79,135,.15)', color: '#ff4f87', borderRadius: '6px', cursor: 'pointer', fontSize: '.84rem', fontWeight: 600 },
  authBtns: { display: 'flex', gap: '.6rem' },
  loginBtn: { padding: '.45rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  registerBtn: { padding: '.45rem 1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  backdrop: { position: 'fixed', inset: 0, zIndex: 99 }
};
