import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', sub: 'Forever free',
    accent: '#555577',
    features: ['200 credits / month', 'TikTok Ads (limited)', '3 Collections', 'Basic filters', 'Standard support', 'Web access only'],
    cta: null,
  },
  {
    id: 'pro', name: 'Pro', price: '$29', sub: 'per month',
    accent: '#6c47ff', glow: 'rgba(108,71,255,.2)', badge: 'Most Popular',
    features: ['Unlimited credits', 'TikTok + Facebook + Instagram', 'Unlimited collections', 'AliExpress products', 'Advanced filters', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'elite', name: 'Elite', price: '$79', sub: 'per month',
    accent: '#d4920a', glow: 'rgba(212,146,10,.18)', badge: 'Best Value',
    features: ['Everything in Pro', '5 team seats', 'API access', 'Custom exports', 'Dedicated manager', 'White-label reports'],
    cta: 'Get Elite',
  },
];

const PLAN_META = {
  free:  { label: 'Free',  color: '#555577' },
  pro:   { label: 'Pro',   color: '#6c47ff' },
  elite: { label: 'Elite', color: '#d4920a' },
};

export default function Profile() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const pm          = PLAN_META[user.plan] || PLAN_META.free;
  const currentPlan = user.plan || 'free';

  const [tab,    setTab]    = useState('plans');
  const [name,   setName]   = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [focus,  setFocus]  = useState(false);

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name daalo');
    setSaving(true);
    try {
      const res     = await api.patch('/auth/update-profile', { name });
      const updated = { ...user, name: res.data?.user?.name || name };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const initial = (user.name || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#f0f0f8', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pcard { transition: border-color .18s, box-shadow .18s !important; }
        .pcard:hover { border-color: var(--hc) !important; box-shadow: 0 0 32px var(--hg) !important; }
        .upbtn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .upbtn { transition: filter .15s, transform .15s; }
        .tpill:hover { background: rgba(255,255,255,.07) !important; }
      `}</style>

      <Navbar />

      <div style={S.page}>

        {/* BACK */}
        <button style={S.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* USER CARD */}
        <div style={S.userCard}>
          <div style={S.avatar}>{initial}</div>
          <div style={S.userInfo}>
            <div style={S.userName}>{user.name || 'User'}</div>
            <div style={S.userEmail}>{user.email}</div>
          </div>
          <div style={{ ...S.planChip, color: pm.color, borderColor: pm.color + '55', background: pm.color + '14' }}>
            {pm.label}
          </div>
        </div>

        {/* PILL TABS */}
        <div style={S.tabRow}>
          {[
            { id: 'plans',   label: 'Plans & Billing' },
            { id: 'profile', label: 'My Profile' },
          ].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} className="tpill" onClick={() => setTab(t.id)}
                style={{
                  ...S.tabPill,
                  background: on ? '#fff' : 'rgba(255,255,255,.05)',
                  color:      on ? '#0a0a12' : '#777',
                  fontWeight: on ? 700 : 500,
                  border:     on ? 'none' : '1px solid rgba(255,255,255,.08)',
                }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ══ PLANS TAB ══ */}
        {tab === 'plans' && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <div style={S.secLabel}>Choose a plan</div>

            <div style={S.planStack}>
              {PLANS.map(p => {
                const isCurrent = currentPlan === p.id;
                return (
                  <div key={p.id} className="pcard"
                    style={{
                      '--hc': p.accent, '--hg': p.glow || 'transparent',
                      ...S.planCard,
                      borderColor: isCurrent ? p.accent : 'rgba(255,255,255,.08)',
                      boxShadow:   isCurrent ? ('0 0 28px ' + (p.glow || 'transparent')) : 'none',
                    }}>

                    {/* Header row */}
                    <div style={S.planHead}>
                      <div style={S.planHeadLeft}>
                        <span style={{ ...S.planName, color: isCurrent ? p.accent : '#f0f0f8' }}>{p.name}</span>
                        {p.badge && (
                          <span style={{ ...S.badge, color: p.accent, background: p.accent + '18', borderColor: p.accent + '45' }}>
                            {p.badge}
                          </span>
                        )}

                      </div>
                      <div style={S.priceCol}>
                        <span style={{ ...S.priceNum, color: isCurrent ? p.accent : '#f0f0f8' }}>{p.price}</span>
                        <span style={S.priceSub}>{p.sub}</span>
                      </div>
                    </div>

                    {/* Features 2-col grid */}
                    <div style={S.featGrid}>
                      {p.features.map(f => (
                        <div key={f} style={S.feat}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="6.5" cy="6.5" r="6" fill={p.accent + '25'}/>
                            <path d="M4 6.5l2 2 3-3" stroke={p.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {f}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {isCurrent ? (
                      <div style={S.currentBtn}>✓ Your current plan</div>
                    ) : (
                      <button className="upbtn" style={{
                        ...S.upBtn,
                        background: p.id === 'elite'
                          ? 'linear-gradient(135deg,#b8790a,#d4920a)'
                          : 'linear-gradient(135deg,#5535e0,#6c47ff)',
                        boxShadow: p.id === 'elite'
                          ? '0 4px 18px rgba(212,146,10,.3)'
                          : '0 4px 18px rgba(108,71,255,.35)',
                      }}>
                        {p.cta}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={S.billing}>Billed monthly · Secure checkout via Stripe</div>
          </div>
        )}

        {/* ══ PROFILE TAB ══ */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <div style={S.secLabel}>Account Details</div>

            {/* Info tiles */}
            <div style={S.tileRow}>
              <div style={S.tile}>
                <div style={S.tileL}>Member since</div>
                <div style={S.tileV}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'short' })
                    : '—'}
                </div>
              </div>
              <div style={S.tile}>
                <div style={S.tileL}>Current plan</div>
                <div style={{ ...S.tileV, color: pm.color }}>
                  {pm.label}
                  {currentPlan === 'free' && (
                    <button style={S.tileUp} onClick={() => setTab('plans')}>Upgrade</button>
                  )}
                </div>
              </div>
            </div>

            {/* Form card */}
            <div style={S.formCard}>
              <div style={S.formHead}>Edit Profile</div>

              <div style={S.field}>
                <label style={S.lbl}>Full Name</label>
                <input
                  style={{
                    ...S.input,
                    borderColor: focus ? 'rgba(108,71,255,.6)' : 'rgba(255,255,255,.1)',
                    boxShadow:   focus ? '0 0 0 3px rgba(108,71,255,.1)' : 'none',
                  }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                />
              </div>

              <div style={S.field}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.4rem' }}>
                  <label style={S.lbl}>Email</label>
                  <span style={S.lockTag}>
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                      <rect x="1" y="4" width="7" height="5.5" rx="1.2" stroke="#555577" strokeWidth="1"/>
                      <path d="M2.5 4V3a2 2 0 014 0v1" stroke="#555577" strokeWidth="1"/>
                    </svg>
                    Locked
                  </span>
                </div>
                <input style={{ ...S.input, opacity:.38, cursor:'not-allowed' }} value={user.email || ''} disabled />
              </div>

              <button style={{ ...S.saveBtn, opacity: saving ? .6 : 1 }} onClick={saveName} disabled={saving}>
                {saving ? <><span style={S.spin}/>Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  page: { maxWidth: '540px', margin: '0 auto', padding: '76px 1.1rem 5rem' },

  back: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '10px', cursor: 'pointer', marginBottom: '1.4rem',
  },

  userCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: '#12121e', border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.4rem',
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#4a30c8,#7c5cff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '1.1rem',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName:  { fontSize: '.95rem', fontWeight: 700, color: '#f0f0f8', letterSpacing: '-.01em' },
  userEmail: { fontSize: '.78rem', color: '#555577', marginTop: '.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  planChip: {
    flexShrink: 0, fontSize: '.72rem', fontWeight: 700,
    padding: '.3rem .8rem', borderRadius: '999px', border: '1px solid',
  },

  tabRow: { display: 'flex', gap: '.5rem', marginBottom: '1.75rem' },
  tabPill: {
    padding: '.55rem 1.15rem', borderRadius: '999px',
    fontSize: '.85rem', cursor: 'pointer',
    fontFamily: 'inherit', letterSpacing: '-.01em',
    transition: 'background .15s, color .15s',
  },

  secLabel: {
    fontSize: '.68rem', fontWeight: 700, color: '#555577',
    textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: '1rem',
  },

  planStack: { display: 'flex', flexDirection: 'column', gap: '.75rem' },
  planCard: {
    background: '#12121e', border: '1px solid', borderRadius: '16px',
    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.85rem',
  },
  planHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' },
  planHeadLeft: { display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' },
  planName: { fontSize: '1rem', fontWeight: 800, letterSpacing: '-.01em' },
  badge: {
    fontSize: '.62rem', fontWeight: 700,
    padding: '.18rem .55rem', borderRadius: '999px', border: '1px solid',
  },
  priceCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 },
  priceNum: { fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 },
  priceSub: { fontSize: '.7rem', color: '#555577', marginTop: '.1rem' },

  featGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem .75rem' },
  feat: { display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.77rem', color: '#9090b0' },

  upBtn: {
    width: '100%', padding: '.78rem', border: 'none', borderRadius: '12px',
    color: '#fff', fontWeight: 700, fontSize: '.88rem',
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-.01em',
  },

  billing: { textAlign: 'center', color: '#333355', fontSize: '.73rem', marginTop: '1.25rem' },

  tileRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.25rem' },
  tile: {
    background: '#12121e', border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '14px', padding: '.9rem 1rem',
  },
  tileL: { fontSize: '.66rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.35rem' },
  tileV: { fontSize: '.92rem', fontWeight: 700, color: '#d0d0e8', display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' },
  tileUp: {
    background: 'none', border: 'none', color: '#6c47ff',
    fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  },

  formCard: {
    background: '#12121e', border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '16px', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  formHead: { fontSize: '.68rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.09em' },
  field: { display: 'flex', flexDirection: 'column' },
  lbl: { fontSize: '.7rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' },
  lockTag: {
    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
    fontSize: '.66rem', fontWeight: 600, color: '#555577',
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '5px', padding: '.15rem .45rem',
  },
  input: {
    padding: '.72rem 1rem',
    background: '#0a0a12', border: '1px solid',
    borderRadius: '10px', color: '#f0f0f8', fontSize: '.9rem',
    outline: 'none', width: '100%', fontFamily: 'inherit',
    transition: 'border-color .15s, box-shadow .15s', boxSizing: 'border-box',
  },
  saveBtn: {
    alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '.45rem',
    padding: '.72rem 1.5rem',
    background: 'linear-gradient(135deg,#5535e0,#6c47ff)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
    fontFamily: 'inherit', letterSpacing: '-.01em',
    boxShadow: '0 4px 18px rgba(108,71,255,.3)',
    transition: 'opacity .15s',
  },
  spin: {
    width: '13px', height: '13px',
    border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
    borderRadius: '50%', display: 'inline-block',
    animation: 'spin .6s linear infinite', flexShrink: 0,
  },
  currentBtn: {
    width: '100%', padding: '.78rem', borderRadius: '12px', textAlign: 'center',
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    color: '#555577', fontWeight: 600, fontSize: '.85rem',
    letterSpacing: '-.01em',
  },
};
