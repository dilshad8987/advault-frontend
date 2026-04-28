import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isPro = user?.plan && user.plan !== 'free';

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    setMenuOpen(false);
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
              <div style={s.profileRow} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={s.avatarCircle}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={s.profileInfo}>
                  <span style={s.profileName}>{user.name}</span>
                  {isPro && <span style={s.proBadge}>⭐ Pro</span>}
                </div>
                <span style={{ color: '#8888aa', fontSize: '.7rem' }}>▾</span>
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

                  <Link to="/upgrade" style={s.dropItem} onClick={() => setMenuOpen(false)}>
                    ⚡ Upgrade
                  </Link>

                  <div style={s.divider} />

                  <button style={s.dropLogout} onClick={logout}>🚪 Logout</button>
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

      {menuOpen && <div style={s.backdrop} onClick={() => setMenuOpen(false)} />}
    </>
  );
}

const s = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', background: '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { display: 'flex', alignItems: 'center' },

  profileRow: { display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', padding: '.3rem .5rem', borderRadius: '10px' },
  avatarCircle: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 },
  profileInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  profileName: { fontSize: '.82rem', fontWeight: 700, color: '#f0f0f8' },
  proBadge: { fontSize: '.7rem', color: '#ffb700', fontWeight: 700 },

  dropdown: { position: 'absolute', top: '46px', right: 0, width: '210px', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '.75rem', zIndex: 200, boxShadow: '0 12px 40px rgba(0,0,0,.5)' },
  dropHeader: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.15rem 0 .3rem' },
  dropAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  dropName: { fontSize: '.83rem', fontWeight: 700, color: '#f0f0f8' },
  dropEmail: { fontSize: '.7rem', color: '#8888aa' },
  divider: { height: '1px', background: 'rgba(255,255,255,.06)', margin: '.45rem 0' },
  dropItem: { display: 'block', padding: '.45rem .3rem', color: '#c8c8e0', fontSize: '.83rem', fontWeight: 500, textDecoration: 'none', borderRadius: '6px' },
  dropLogout: { width: '100%', padding: '.5rem', background: 'rgba(255,79,135,.08)', border: '1px solid rgba(255,79,135,.15)', color: '#ff4f87', borderRadius: '6px', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 },

  authBtns: { display: 'flex', gap: '.6rem' },
  loginBtn: { padding: '.45rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  registerBtn: { padding: '.45rem 1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius: '8px', color: '#fff', textDecoration: 'none' },
  backdrop: { position: 'fixed', inset: 0, zIndex: 99 },
};
