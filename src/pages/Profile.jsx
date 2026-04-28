import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPro = user?.plan && user.plan !== 'free';

  const [name, setName] = useState(user.name || '');
  const [savingName, setSavingName] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name daalo');
    setSavingName(true);
    try {
      const res = await api.patch('/auth/update-profile', { name });
      const updated = { ...user, name: res.data?.user?.name || name };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Name update ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update fail hua');
    }
    setSavingName(false);
  };

  const savePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) return toast.error('Sab fields bharo');
    if (newPass.length < 8) return toast.error('New password 8+ characters ka hona chahiye');
    if (newPass !== confirmPass) return toast.error('Passwords match nahi karte');
    setSavingPass(true);
    try {
      await api.patch('/auth/change-password', { oldPassword: oldPass, newPassword: newPass });
      toast.success('Password change ho gaya!');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change fail');
    }
    setSavingPass(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <h1 style={s.title}>Profile Settings</h1>
          <p style={s.sub}>Apni account details manage karo</p>
        </div>

        {/* Plan Card — Upgrade CTA (free users ke liye) */}
        {!isPro && (
          <div style={s.upgradeCard}>
            <div style={s.upgradeLeft}>
              <div style={s.upgradeBadge}>🆓 FREE PLAN</div>
              <div style={s.upgradeText}>
                <span style={s.upgradeTitle}>Pro mein upgrade karo</span>
                <span style={s.upgradeSub}>Unlimited ads, AliExpress, priority support & more</span>
              </div>
            </div>
            <button style={s.upgradeBtn} onClick={() => navigate('/upgrade')}>
              ⚡ Upgrade Now
            </button>
          </div>
        )}

        {isPro && (
          <div style={{ ...s.upgradeCard, background: 'rgba(255,183,0,.06)', borderColor: 'rgba(255,183,0,.2)' }}>
            <div style={s.upgradeLeft}>
              <div style={{ ...s.upgradeBadge, background: 'rgba(255,183,0,.15)', color: '#ffb700' }}>⭐ PRO PLAN</div>
              <div style={s.upgradeText}>
                <span style={s.upgradeTitle}>Aap Pro user hain!</span>
                <span style={s.upgradeSub}>Sabhi features unlock hain. Shukriya!</span>
              </div>
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.bigAvatar}>{user.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
              <div style={s.cardTitle}>Personal Information</div>
              <div style={s.cardSub}>{user.email}</div>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              style={s.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Apna naam likhao"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={{ ...s.input, opacity: 0.5, cursor: 'not-allowed' }} value={user.email} disabled />
            <span style={s.hint}>Email change nahi ho sakta</span>
          </div>

          <button
            style={{ ...s.saveBtn, opacity: savingName ? 0.7 : 1 }}
            onClick={saveName}
            disabled={savingName}
          >
            {savingName ? 'Saving...' : '💾 Save Name'}
          </button>
        </div>

        {/* Change Password */}
        <div style={s.card}>
          <div style={s.cardTitle}>🔐 Change Password</div>
          <div style={s.cardSub} mb="1rem">Purana password confirm karke naya set karo</div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={s.field}>
              <label style={s.label}>Old Password</label>
              <div style={s.passWrap}>
                <input
                  style={s.passInput}
                  type={showOld ? 'text' : 'password'}
                  value={oldPass}
                  onChange={e => setOldPass(e.target.value)}
                  placeholder="Purana password"
                />
                <button style={s.eyeBtn} onClick={() => setShowOld(!showOld)}>
                  {showOld ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>New Password</label>
              <div style={s.passWrap}>
                <input
                  style={s.passInput}
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Naya password (min 8 chars)"
                />
                <button style={s.eyeBtn} onClick={() => setShowNew(!showNew)}>
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Confirm New Password</label>
              <div style={s.passWrap}>
                <input
                  style={s.passInput}
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Password dobara likhao"
                  onKeyDown={e => e.key === 'Enter' && savePassword()}
                />
                <button style={s.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {newPass && confirmPass && newPass !== confirmPass && (
                <span style={{ ...s.hint, color: '#ff4f87' }}>⚠ Passwords match nahi karte</span>
              )}
              {newPass && confirmPass && newPass === confirmPass && (
                <span style={{ ...s.hint, color: '#4cff8f' }}>✓ Passwords match karte hain</span>
              )}
            </div>

            <button
              style={{ ...s.saveBtn, opacity: savingPass ? 0.7 : 1 }}
              onClick={savePassword}
              disabled={savingPass}
            >
              {savingPass ? 'Saving...' : '🔒 Change Password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { padding: '80px clamp(1rem,4vw,2rem) 3rem', maxWidth: '600px', margin: '0 auto' },
  header: { marginBottom: '1.75rem' },
  backBtn: { background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '.85rem', marginBottom: '.75rem', padding: 0 },
  title: { fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 900, color: '#f0f0f8', letterSpacing: '-.02em', marginBottom: '.25rem' },
  sub: { color: '#8888aa', fontSize: '.9rem' },

  upgradeCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
    gap: '1rem', background: 'rgba(108,71,255,.08)', border: '1px solid rgba(108,71,255,.25)',
    borderRadius: '14px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem'
  },
  upgradeLeft: { display: 'flex', alignItems: 'center', gap: '.85rem' },
  upgradeBadge: { padding: '.2rem .65rem', borderRadius: '999px', background: 'rgba(108,71,255,.18)', color: '#8b6bff', fontSize: '.72rem', fontWeight: 800, whiteSpace: 'nowrap' },
  upgradeText: { display: 'flex', flexDirection: 'column', gap: '.15rem' },
  upgradeTitle: { color: '#f0f0f8', fontWeight: 700, fontSize: '.9rem' },
  upgradeSub: { color: '#8888aa', fontSize: '.78rem' },
  upgradeBtn: { padding: '.6rem 1.4rem', background: 'linear-gradient(135deg,#ff6b2b,#ff9d00)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(255,107,43,.3)' },

  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  bigAvatar: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 },
  cardTitle: { fontSize: '1rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.15rem' },
  cardSub: { fontSize: '.8rem', color: '#8888aa' },

  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.4rem' },
  input: { width: '100%', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', display: 'block' },
  hint: { display: 'block', fontSize: '.75rem', color: '#8888aa', marginTop: '.3rem' },

  passWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  passInput: { width: '100%', padding: '.75rem 2.8rem .75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: '.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 },

  saveBtn: { width: '100%', padding: '.8rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '.92rem', cursor: 'pointer', marginTop: '.5rem', boxShadow: '0 4px 16px rgba(108,71,255,.25)' },
};
