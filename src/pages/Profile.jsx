import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    badge: null,
    accent: '#555577',
    glowColor: 'transparent',
    bgGradient: 'linear-gradient(160deg, rgba(255,255,255,.025) 0%, rgba(255,255,255,.01) 100%)',
    borderColor: 'rgba(255,255,255,.08)',
    features: ['200 Credits / month', 'TikTok Ads — limited', '3 Saved collections', 'Basic search filters'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    badge: 'Most Popular',
    accent: '#7c5cff',
    glowColor: 'rgba(108,71,255,.18)',
    bgGradient: 'linear-gradient(160deg, rgba(108,71,255,.09) 0%, rgba(108,71,255,.03) 100%)',
    borderColor: 'rgba(108,71,255,.4)',
    features: ['Unlimited Credits', 'TikTok + Facebook + Instagram', 'Unlimited collections', 'AliExpress products', 'Advanced filters', 'Priority support'],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: '/mo',
    badge: 'Best Value',
    accent: '#e8a000',
    glowColor: 'rgba(232,160,0,.15)',
    bgGradient: 'linear-gradient(160deg, rgba(232,160,0,.07) 0%, rgba(232,160,0,.02) 100%)',
    borderColor: 'rgba(232,160,0,.35)',
    features: ['Everything in Pro', 'Team access — 5 seats', 'API access', 'Custom exports', 'Dedicated manager', 'White-label reports'],
    cta: 'Get Elite',
    disabled: false,
  },
];

const PLAN_LABEL_MAP = { free: 'Free', pro: 'Pro', elite: 'Elite' };
const PLAN_COLOR_MAP  = { free: '#555577', pro: '#7c5cff', elite: '#e8a000' };

export default function Profile() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const [tab, setTab]           = useState('plans');
  const [name, setName]         = useState(user.name || '');
  const [savingName, setSaving] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const currentPlan = user.plan || 'free';
  const planLabel   = PLAN_LABEL_MAP[currentPlan] || 'Free';
  const planColor   = PLAN_COLOR_MAP[currentPlan]  || '#555577';

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name daalo');
    setSaving(true);
    try {
      const res = await api.patch('/auth/update-profile', { name });
      const updated = { ...user, name: res.data?.user?.name || name };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Name update ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update fail hua');
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070e', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      <div style={s.page}>

        {/* ── USER IDENTITY HEADER ── */}
        <div style={s.identityBar}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div style={s.identityContent}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>{(user.name || 'U').charAt(0).toUpperCase()}</div>
              <div style={{ ...s.planDot, background: planColor }} />
            </div>
            <div style={s.identityText}>
              <div style={s.identityName}>{user.name || 'User'}</div>
              <div style={s.identityMeta}>
                <span style={s.identityEmail}>{user.email}</span>
                <span style={s.identitySep}>·</span>
                <span style={{ ...s.planPill, color: planColor, borderColor: planColor + '55', background: planColor + '15' }}>
                  {planLabel} plan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB STRIP ── */}
        <div style={s.tabStrip}>
          {[
            { id: 'plans',   label: 'Plans & Billing' },
            { id: 'profile', label: 'Profile' },
          ].map(t => (
            <button
              key={t.id}
              style={{ ...s.tabItem, ...(tab === t.id ? s.tabItemActive : s.tabItemInactive) }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {tab === t.id && <div style={s.tabUnderline} />}
            </button>
          ))}
        </div>

        {/* ── PLANS TAB ── */}
        {tab === 'plans' && (
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div style={s.sectionTitle}>Choose a plan</div>
              <div style={s.sectionSub}>Upgrade anytime. Cancel anytime.</div>
            </div>

            <div style={s.plansStack}>
              {PLANS.map(plan => {
                const isCurrent = currentPlan === plan.id;
                const isHovered = hoveredPlan === plan.id && !plan.disabled;
                return (
                  <div
                    key={plan.id}
                    onMouseEnter={() => setHoveredPlan(plan.id)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    style={{
                      ...s.planCard,
                      background: plan.bgGradient,
                      borderColor: isHovered || isCurrent ? plan.borderColor : 'rgba(255,255,255,.07)',
                      boxShadow: isHovered ? `0 8px 40px ${plan.glowColor}` : isCurrent ? `0 4px 24px ${plan.glowColor}` : 'none',
                      transform: isHovered && !plan.disabled ? 'translateY(-2px)' : 'none',
                      transition: 'all .2s ease',
                    }}
                  >
                    {/* Left: name + price */}
                    <div style={s.planLeft}>
                      {plan.badge && (
                        <div style={{ ...s.planBadge, color: plan.accent, background: plan.accent + '18', borderColor: plan.accent + '40' }}>
                          {plan.badge}
                        </div>
                      )}
                      <div style={{ ...s.planName, color: plan.accent }}>{plan.name}</div>
                      <div style={s.priceRow}>
                        <span style={{ ...s.priceNum, color: isCurrent || isHovered ? plan.accent : '#d0d0e8' }}>{plan.price}</span>
                        <span style={s.pricePer}>{plan.period}</span>
                      </div>
                    </div>

                    {/* Middle: features */}
                    <div style={s.planFeatures}>
                      {plan.features.map(f => (
                        <div key={f} style={s.featureRow}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                            <circle cx="6.5" cy="6.5" r="6" fill={plan.accent + '22'} />
                            <path d="M4 6.5l2 2 3-3" stroke={plan.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right: CTA */}
                    <div style={s.planCta}>
                      {isCurrent ? (
                        <div style={{ ...s.currentBadge, color: plan.accent, borderColor: plan.accent + '50' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5 4.5-5" stroke={plan.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Active
                        </div>
                      ) : (
                        <button
                          disabled={plan.disabled}
                          style={{
                            ...s.upgradeBtn,
                            background: plan.id === 'elite'
                              ? (isHovered ? 'linear-gradient(135deg,#e8a000,#ff9d00)' : 'linear-gradient(135deg,#c88800,#e8a000)')
                              : (isHovered ? 'linear-gradient(135deg,#7c5cff,#9b7fff)' : 'linear-gradient(135deg,#6c47ff,#7c5cff)'),
                            boxShadow: isHovered
                              ? plan.id === 'elite' ? '0 4px 20px rgba(232,160,0,.4)' : '0 4px 20px rgba(108,71,255,.45)'
                              : 'none',
                          }}
                        >
                          {plan.cta}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={s.billingNote}>All plans billed monthly. Secure checkout via Stripe.</p>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div style={s.sectionTitle}>Personal Information</div>
              <div style={s.sectionSub}>Apni profile details update karo</div>
            </div>

            <div style={s.formCard}>
              <div style={s.formField}>
                <label style={s.formLabel}>Full Name</label>
                <input
                  style={s.formInput}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  onFocus={e => { e.target.style.borderColor = 'rgba(108,71,255,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,71,255,.1)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Email Address</label>
                <div style={s.emailRow}>
                  <input
                    style={{ ...s.formInput, flex: 1, opacity: .45, cursor: 'not-allowed' }}
                    value={user.email || ''}
                    disabled
                  />
                  <div style={s.lockedTag}>Locked</div>
                </div>
                <span style={s.formHint}>Email address change nahi ho sakta</span>
              </div>

              <div style={s.formDivider} />

              <div style={s.formField}>
                <label style={s.formLabel}>Member Since</label>
                <div style={s.metaValue}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </div>
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Current Plan</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <div style={{ ...s.metaValue, color: planColor }}>{planLabel}</div>
                  {currentPlan === 'free' && (
                    <button
                      style={s.inlineUpgrade}
                      onClick={() => setTab('plans')}
                    >
                      Upgrade →
                    </button>
                  )}
                </div>
              </div>

              <button
                style={{ ...s.saveBtn, opacity: savingName ? .65 : 1 }}
                onClick={saveName}
                disabled={savingName}
              >
                {savingName
                  ? <><span style={s.spinner} /> Saving...</>
                  : 'Save Changes'
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: {
    padding: '80px 1rem 4rem',
    maxWidth: '560px',
    margin: '0 auto',
  },

  /* Identity header */
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
    background: 'none',
    border: 'none',
    color: '#666688',
    cursor: 'pointer',
    fontSize: '.82rem',
    fontWeight: 500,
    padding: '0',
    marginBottom: '1.5rem',
    fontFamily: 'inherit',
    transition: 'color .15s',
  },
  identityBar: { marginBottom: '2rem' },
  identityContent: { display: 'flex', alignItems: 'center', gap: '1rem' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#4a30c8,#7c5cff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.15rem',
    letterSpacing: '-.01em',
  },
  planDot: {
    position: 'absolute',
    bottom: '1px',
    right: '1px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #07070e',
  },
  identityText: { flex: 1, minWidth: 0 },
  identityName: { fontSize: '1.1rem', fontWeight: 700, color: '#eeeef8', letterSpacing: '-.01em' },
  identityMeta: { display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.2rem', flexWrap: 'wrap' },
  identityEmail: { color: '#666688', fontSize: '.8rem' },
  identitySep: { color: '#333355', fontSize: '.8rem' },
  planPill: {
    fontSize: '.72rem',
    fontWeight: 700,
    padding: '.15rem .55rem',
    borderRadius: '999px',
    border: '1px solid',
    letterSpacing: '.01em',
  },

  /* Tab strip */
  tabStrip: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid rgba(255,255,255,.07)',
    marginBottom: '2rem',
  },
  tabItem: {
    position: 'relative',
    background: 'none',
    border: 'none',
    padding: '.7rem 1.1rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '.88rem',
    fontWeight: 600,
    letterSpacing: '-.01em',
    transition: 'color .15s',
  },
  tabItemActive: { color: '#eeeef8' },
  tabItemInactive: { color: '#555577' },
  tabUnderline: {
    position: 'absolute',
    bottom: '-1px',
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg,#6c47ff,#9b7fff)',
    borderRadius: '2px 2px 0 0',
  },

  section: {},
  sectionHead: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#eeeef8', letterSpacing: '-.01em' },
  sectionSub: { color: '#555577', fontSize: '.8rem', marginTop: '.2rem' },

  /* Plan cards */
  plansStack: { display: 'flex', flexDirection: 'column', gap: '.75rem' },
  planCard: {
    borderRadius: '14px',
    border: '1px solid',
    padding: '1.1rem 1.25rem',
    display: 'grid',
    gridTemplateColumns: '90px 1fr auto',
    gap: '1rem',
    alignItems: 'center',
    cursor: 'default',
  },
  planLeft: { display: 'flex', flexDirection: 'column', gap: '.3rem' },
  planBadge: {
    display: 'inline-block',
    fontSize: '.6rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    padding: '.18rem .5rem',
    borderRadius: '999px',
    border: '1px solid',
    width: 'fit-content',
    marginBottom: '.1rem',
  },
  planName: { fontSize: '.95rem', fontWeight: 800, letterSpacing: '-.01em' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '.15rem' },
  priceNum: { fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-.03em', transition: 'color .2s' },
  pricePer: { fontSize: '.75rem', color: '#555577' },

  planFeatures: { display: 'flex', flexDirection: 'column', gap: '.3rem' },
  featureRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.45rem',
    fontSize: '.76rem',
    color: '#9999bb',
    lineHeight: 1.4,
  },

  planCta: { display: 'flex', justifyContent: 'flex-end' },
  currentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    fontSize: '.72rem',
    fontWeight: 700,
    padding: '.4rem .75rem',
    borderRadius: '8px',
    border: '1px solid',
    whiteSpace: 'nowrap',
    background: 'rgba(255,255,255,.03)',
  },
  upgradeBtn: {
    padding: '.55rem 1rem',
    border: 'none',
    borderRadius: '9px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.78rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    letterSpacing: '-.01em',
    transition: 'all .2s ease',
  },

  billingNote: {
    textAlign: 'center',
    color: '#3a3a55',
    fontSize: '.74rem',
    marginTop: '1.25rem',
  },

  /* Profile form */
  formCard: {
    background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '.4rem' },
  formLabel: {
    fontSize: '.7rem',
    fontWeight: 700,
    color: '#555577',
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  },
  formInput: {
    padding: '.75rem 1rem',
    background: '#0d0d1a',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '10px',
    color: '#eeeef8',
    fontSize: '.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color .15s, box-shadow .15s',
  },
  emailRow: { display: 'flex', alignItems: 'center', gap: '.6rem' },
  lockedTag: {
    fontSize: '.68rem',
    fontWeight: 700,
    color: '#444466',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '6px',
    padding: '.3rem .6rem',
    whiteSpace: 'nowrap',
    letterSpacing: '.03em',
  },
  formHint: { fontSize: '.73rem', color: '#444466' },
  formDivider: { height: '1px', background: 'rgba(255,255,255,.05)' },
  metaValue: { fontSize: '.88rem', color: '#9999bb', fontWeight: 500 },
  inlineUpgrade: {
    background: 'none',
    border: 'none',
    color: '#7c5cff',
    fontSize: '.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '.82rem 1.5rem',
    background: 'linear-gradient(135deg,#6c47ff,#7c5cff)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '.88rem',
    cursor: 'pointer',
    letterSpacing: '-.01em',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.5rem',
    boxShadow: '0 4px 20px rgba(108,71,255,.3)',
    alignSelf: 'flex-start',
    minWidth: '140px',
    transition: 'opacity .15s',
  },
  spinner: {
    width: '13px',
    height: '13px',
    border: '2px solid rgba(255,255,255,.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin .6s linear infinite',
  },
};
