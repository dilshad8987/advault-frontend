import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TABS = [
  { id: 'plans',    icon: '⚡', label: 'Plans' },
  { id: 'profile',  icon: '👤', label: 'Personal Info' },
  { id: 'security', icon: '🔒', label: 'Security' },
  { id: 'referral', icon: '🎁', label: 'Referral' },
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    badge: null,
    color: '#8888aa',
    glow: 'transparent',
    bg: 'rgba(255,255,255,.03)',
    border: 'rgba(255,255,255,.1)',
    features: ['200 Credits/month', 'TikTok Ads (limited)', '3 Saved collections', 'Basic search'],
    cta: '✓ Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    badge: '🔥 Most Popular',
    color: '#8b6bff',
    glow: 'rgba(108,71,255,.2)',
    bg: 'rgba(108,71,255,.07)',
    border: 'rgba(108,71,255,.45)',
    features: ['Unlimited Credits', 'TikTok + Facebook + Instagram', 'Unlimited collections', 'AliExpress products', 'Priority support', 'Advanced filters'],
    cta: '⚡ Upgrade to Pro',
    disabled: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: '/mo',
    badge: '👑 Best Value',
    color: '#ffb700',
    glow: 'rgba(255,183,0,.18)',
    bg: 'rgba(255,183,0,.05)',
    border: 'rgba(255,183,0,.4)',
    features: ['Everything in Pro', 'Team access (5 seats)', 'API access', 'Custom exports', 'Dedicated manager', 'White-label reports'],
    cta: '👑 Get Elite',
    disabled: false,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tab, setTab] = useState('plans');

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
    if (newPass.length < 8) return toast.error('Password 8+ characters ka hona chahiye');
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

  const referralCode = user.referralCode || ('AV-' + (user._id || 'USER').toString().slice(-6).toUpperCase());
  const referralLink = `https://advault.io/register?ref=${referralCode}`;

  const copyRef = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copy ho gaya!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <h1 style={s.title}>Account</h1>
          <p style={s.sub}>Manage your plan, profile and security.</p>
        </div>

        {/* Tab Bar — pill boxes like CTA buttons */}
        <div style={s.tabGrid}>
          {TABS.map(t => (
            <button
              key={t.id}
              style={{ ...s.tabBtn, ...(tab === t.id ? s.tabActive : s.tabInactive) }}
              onClick={() => setTab(t.id)}
            >
              <span style={s.tabIcon}>{t.icon}</span>
              <span style={s.tabLabel}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── PLANS TAB ── */}
        {tab === 'plans' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Choose Your Plan</div>
            <div style={s.sectionSub}>Apna plan choose karo aur features unlock karo</div>

            <div style={s.plansStack}>
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  style={{
                    ...s.planCard,
                    background: plan.bg,
                    borderColor: plan.border,
                    boxShadow: `0 6px 28px ${plan.glow}`,
                  }}
                >
                  <div style={s.planCardTop}>
                    <div>
                      {plan.badge && (
                        <div style={{ ...s.planBadge, color: plan.color, borderColor: plan.border }}>
                          {plan.badge}
                        </div>
                      )}
                      <div style={{ ...s.planName, color: plan.color }}>{plan.name}</div>
                      <div style={s.planPriceRow}>
                        <span style={{ ...s.planPriceNum, color: plan.color }}>{plan.price}</span>
                        <span style={s.planPeriod}>{plan.period}</span>
                      </div>
                    </div>
                    <div style={s.planFeaturesRight}>
                      {plan.features.map(f => (
                        <div key={f} style={s.featureItem}>
                          <span style={{ color: plan.color }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    style={{
                      ...s.planBtn,
                      background: plan.disabled
                        ? 'rgba(255,255,255,.06)'
                        : plan.id === 'elite'
                          ? 'linear-gradient(135deg,#ffb700,#ff9d00)'
                          : 'linear-gradient(135deg,#6c47ff,#8b6bff)',
                      color: plan.disabled ? '#8888aa' : '#fff',
                      cursor: plan.disabled ? 'not-allowed' : 'pointer',
                      boxShadow: plan.disabled ? 'none'
                        : plan.id === 'elite'
                          ? '0 4px 20px rgba(255,183,0,.3)'
                          : '0 4px 20px rgba(108,71,255,.35)',
                    }}
                    disabled={plan.disabled}
                  >
                    {user.plan === plan.id ? '✓ Current Plan' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PERSONAL INFO TAB ── */}
        {tab === 'profile' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Personal Information</div>
            <div style={s.sectionSub}>Apni profile details update karo</div>

            <div style={s.card}>
              <div style={s.avatarRow}>
                <div style={s.bigAvatar}>{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <div style={s.cardLabel}>{user.name}</div>
                  <div style={s.cardHint}>{user.email}</div>
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
                <label style={s.label}>Email Address</label>
                <input style={{ ...s.input, opacity: .45, cursor: 'not-allowed' }} value={user.email} disabled />
                <span style={s.hint}>Email change nahi ho sakta</span>
              </div>

              <button style={{ ...s.saveBtn, opacity: savingName ? .7 : 1 }} onClick={saveName} disabled={savingName}>
                {savingName ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Security</div>
            <div style={s.sectionSub}>Password aur account security manage karo</div>

            <div style={s.card}>
              <div style={s.cardSectionHead}>🔑 Change Password</div>

              <div style={s.field}>
                <label style={s.label}>Old Password</label>
                <div style={s.passWrap}>
                  <input style={s.passInput} type={showOld ? 'text' : 'password'} value={oldPass}
                    onChange={e => setOldPass(e.target.value)} placeholder="Purana password" />
                  <button style={s.eyeBtn} onClick={() => setShowOld(!showOld)}>{showOld ? '🙈' : '👁'}</button>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <div style={s.passWrap}>
                  <input style={s.passInput} type={showNew ? 'text' : 'password'} value={newPass}
                    onChange={e => setNewPass(e.target.value)} placeholder="Naya password (min 8)" />
                  <button style={s.eyeBtn} onClick={() => setShowNew(!showNew)}>{showNew ? '🙈' : '👁'}</button>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirm New Password</label>
                <div style={s.passWrap}>
                  <input style={s.passInput} type={showConfirm ? 'text' : 'password'} value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)} placeholder="Password dobara likhao" />
                  <button style={s.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? '🙈' : '👁'}</button>
                </div>
                {newPass && confirmPass && (
                  <span style={{ ...s.hint, color: newPass === confirmPass ? '#4cff8f' : '#ff4f87' }}>
                    {newPass === confirmPass ? '✓ Match karte hain' : '⚠ Match nahi karte'}
                  </span>
                )}
              </div>

              <button style={{ ...s.saveBtn, opacity: savingPass ? .7 : 1 }} onClick={savePassword} disabled={savingPass}>
                {savingPass ? 'Saving...' : '🔒 Update Password'}
              </button>
            </div>
          </div>
        )}

        {/* ── REFERRAL TAB ── */}
        {tab === 'referral' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Referral Program</div>
            <div style={s.sectionSub}>Dosto ko refer karo aur dono ko reward milega</div>

            <div style={s.refStats}>
              {[
                { label: 'Total Referrals', value: user.referralCount || '0', icon: '👥' },
                { label: 'Credits Earned',  value: (user.referralCredits || 0) + ' cr', icon: '💎' },
                { label: 'Active Refs',     value: user.activeReferrals || '0', icon: '✅' },
              ].map(stat => (
                <div key={stat.label} style={s.refStatCard}>
                  <div style={s.refStatIcon}>{stat.icon}</div>
                  <div style={s.refStatValue}>{stat.value}</div>
                  <div style={s.refStatLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardSectionHead}>🔗 Your Referral Link</div>
              <div style={s.refLinkRow}>
                <div style={s.refLinkBox}>{referralLink}</div>
                <button style={s.copyBtn} onClick={copyRef}>📋 Copy</button>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={s.cardSectionHead}>🎟 Your Referral Code</div>
                <div style={s.refCodeBox}>{referralCode}</div>
              </div>

              <div style={s.refHow}>
                <div style={s.refHowTitle}>How it works</div>
                {[
                  ['1️⃣', 'Apna referral link share karo dosto ke saath'],
                  ['2️⃣', 'Dost sign up kare aur plan buy kare'],
                  ['3️⃣', 'Dono ko extra credits milenge automatically'],
                ].map(([icon, text]) => (
                  <div key={text} style={s.refStep}>
                    <span style={s.refStepIcon}>{icon}</span>
                    <span style={s.refStepText}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: { padding: '72px 1rem 3rem', maxWidth: '520px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '.85rem', marginBottom: '.5rem', padding: 0 },
  title: { fontSize: '1.75rem', fontWeight: 900, color: '#f0f0f8', letterSpacing: '-.02em', margin: 0 },
  sub: { color: '#8888aa', fontSize: '.85rem', marginTop: '.25rem' },

  /* ── Tab grid: 2x2 pill boxes ── */
  tabGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.6rem',
    marginBottom: '1.75rem',
  },
  tabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    padding: '.85rem .5rem',
    border: '1.5px solid',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all .15s',
    fontFamily: 'inherit',
  },
  tabActive: {
    background: 'rgba(108,71,255,.12)',
    borderColor: 'rgba(108,71,255,.5)',
    color: '#8b6bff',
  },
  tabInactive: {
    background: 'rgba(255,255,255,.03)',
    borderColor: 'rgba(255,255,255,.08)',
    color: '#8888aa',
  },
  tabIcon: { fontSize: '1.2rem' },
  tabLabel: { fontSize: '.78rem', fontWeight: 700, letterSpacing: '.01em' },

  section: {},
  sectionTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.2rem' },
  sectionSub: { color: '#8888aa', fontSize: '.82rem', marginBottom: '1.25rem' },

  /* Plans — stacked cards on mobile */
  plansStack: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  planCard: { borderRadius: '16px', border: '1px solid', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  planCardTop: { display: 'flex', gap: '1rem', justifyContent: 'space-between' },
  planBadge: { display: 'inline-flex', fontSize: '.68rem', fontWeight: 800, padding: '.2rem .6rem', borderRadius: '999px', border: '1px solid', background: 'rgba(255,255,255,.04)', marginBottom: '.3rem', width: 'fit-content' },
  planName: { fontSize: '1rem', fontWeight: 900 },
  planPriceRow: { display: 'flex', alignItems: 'baseline', gap: '.2rem', marginTop: '.1rem' },
  planPriceNum: { fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-.03em' },
  planPeriod: { color: '#8888aa', fontSize: '.78rem' },
  planFeaturesRight: { display: 'flex', flexDirection: 'column', gap: '.35rem', flex: 1 },
  featureItem: { fontSize: '.75rem', color: '#c8c8e0', display: 'flex', gap: '.4rem', alignItems: 'flex-start', lineHeight: 1.4 },
  planBtn: { width: '100%', padding: '.8rem', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '.88rem' },

  /* Cards */
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '1.25rem' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '.9rem', marginBottom: '1.25rem' },
  bigAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 },
  cardLabel: { color: '#f0f0f8', fontWeight: 700, fontSize: '.88rem' },
  cardHint: { color: '#8888aa', fontSize: '.76rem', marginTop: '.1rem' },
  cardSectionHead: { fontSize: '.85rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.9rem' },

  field: { marginBottom: '.9rem' },
  label: { display: 'block', fontSize: '.66rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.35rem' },
  input: { width: '100%', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
  hint: { display: 'block', fontSize: '.73rem', color: '#8888aa', marginTop: '.3rem' },
  passWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  passInput: { width: '100%', padding: '.75rem 2.8rem .75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: '.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  saveBtn: { width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,71,255,.25)', marginTop: '.25rem' },

  /* Referral */
  refStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.6rem', marginBottom: '1rem' },
  refStatCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '.85rem .5rem', textAlign: 'center' },
  refStatIcon: { fontSize: '1.3rem', marginBottom: '.25rem' },
  refStatValue: { fontSize: '1.1rem', fontWeight: 900, color: '#8b6bff' },
  refStatLabel: { fontSize: '.65rem', color: '#8888aa', marginTop: '.1rem' },
  refLinkRow: { display: 'flex', gap: '.5rem', alignItems: 'stretch' },
  refLinkBox: { flex: 1, padding: '.65rem .8rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#8888aa', fontSize: '.74rem', wordBreak: 'break-all' },
  copyBtn: { padding: '.65rem .9rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  refCodeBox: { display: 'inline-block', padding: '.55rem 1.2rem', background: 'rgba(108,71,255,.1)', border: '1px dashed rgba(108,71,255,.4)', borderRadius: '9px', color: '#8b6bff', fontWeight: 800, letterSpacing: '.1em', fontSize: '1rem' },
  refHow: { marginTop: '1.25rem', padding: '.9rem', background: 'rgba(255,255,255,.02)', borderRadius: '10px' },
  refHowTitle: { fontSize: '.75rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.65rem' },
  refStep: { display: 'flex', gap: '.65rem', alignItems: 'flex-start', marginBottom: '.55rem' },
  refStepIcon: { fontSize: '.95rem', flexShrink: 0 },
  refStepText: { fontSize: '.8rem', color: '#c8c8e0', lineHeight: 1.5 },
};
                
