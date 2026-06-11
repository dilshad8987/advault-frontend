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
    period: 'forever',
    accent: '#55557a',
    features: ['200 credits / month', 'TikTok Ads (limited)', '3 Collections', 'Basic filters'],
    cta: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    accent: '#7c5cff',
    glow: '0 0 60px rgba(108,71,255,.15)',
    badge: 'Most Popular',
    features: ['Unlimited credits', 'TikTok + Facebook + Instagram', 'Unlimited collections', 'AliExpress products', 'Advanced filters', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: 'per month',
    accent: '#c8970a',
    glow: '0 0 60px rgba(200,151,10,.1)',
    badge: 'Best Value',
    features: ['Everything in Pro', '5 team seats', 'API access', 'Custom exports', 'Dedicated manager', 'White-label reports'],
    cta: 'Get Elite',
  },
];

const PLAN_META = {
  free:  { label: 'Free',  color: '#55557a' },
  pro:   { label: 'Pro',   color: '#7c5cff' },
  elite: { label: 'Elite', color: '#c8970a' },
};

export default function Profile() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const plan     = PLAN_META[user.plan] || PLAN_META.free;

  const [tab,        setTab]    = useState('plans');
  const [name,       setName]   = useState(user.name || '');
  const [saving,     setSaving] = useState(false);
  const [focusField, setFocus]  = useState(null);

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name daalo');
    setSaving(true);
    try {
      const res = await api.patch('/auth/update-profile', { name });
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .prof-tab:hover { color: var(--text) !important; }
        .plan-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .plan-card:hover { transform: translateY(-3px); }
        .upgrade-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .upgrade-btn { transition: filter .15s, transform .15s, box-shadow .15s; }
        .save-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .save-btn { transition: filter .15s, opacity .15s; }
        .back-btn:hover { color: var(--text) !important; }
        .back-btn { transition: color .15s; }
      `}</style>

      <Navbar />

      <div style={pg.wrap}>

        {/* ── BACK ── */}
        <button className="back-btn" style={pg.back} onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9.5 12.5L4.5 7.5l5-5" stroke="currentColor" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* ── PROFILE HERO ── */}
        <div style={pg.hero}>
          {/* Avatar */}
          <div style={pg.avatarShell}>
            <div style={pg.avatarRing} />
            <div style={pg.avatar}>{initial}</div>
          </div>

          {/* Info */}
          <div style={pg.heroInfo}>
            <div style={pg.heroName}>{user.name || 'User'}</div>
            <div style={pg.heroMeta}>
              <span style={pg.heroEmail}>{user.email}</span>
              <span style={pg.heroDot} />
              <span style={{ ...pg.heroPlan, color: plan.color }}>{plan.label}</span>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={pg.tabWrap}>
          {[
            { id: 'plans',   label: 'Plans & Billing' },
            { id: 'profile', label: 'My Profile' },
          ].map(t => (
            <button
              key={t.id}
              className="prof-tab"
              onClick={() => setTab(t.id)}
              style={{
                ...pg.tab,
                color: tab === t.id ? 'var(--text)' : 'var(--muted)',
                borderBottom: tab === t.id ? '2px solid #7c5cff' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PLANS TAB ── */}
        {tab === 'plans' && (
          <div style={{ animation: 'fadeUp .25s ease' }}>

            <div style={pg.planGrid}>
              {PLANS.map(p => {
                const isCurrent = (user.plan || 'free') === p.id;
                return (
                  <div
                    key={p.id}
                    className="plan-card"
                    style={{
                      ...pg.planCard,
                      borderColor: isCurrent ? p.accent : 'rgba(255,255,255,.07)',
                      boxShadow: isCurrent ? p.glow || 'none' : 'none',
                    }}
                  >
                    {/* Top */}
                    <div style={pg.planTop}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ ...pg.planName, color: p.accent }}>{p.name}</span>
                        {p.badge && (
                          <span style={{ ...pg.planBadge, color: p.accent, borderColor: p.accent + '50', background: p.accent + '18' }}>
                            {p.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span style={{ ...pg.activeBadge, color: p.accent, borderColor: p.accent + '50', background: p.accent + '18' }}>
                            ✓ Active
                          </span>
                        )}
                      </div>

                      <div style={pg.priceRow}>
                        <span style={{ ...pg.priceAmt, color: isCurrent ? p.accent : '#d0d0e8' }}>{p.price}</span>
                        <span style={pg.pricePer}>/{p.period}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '1rem 0' }} />

                    {/* Features */}
                    <div style={pg.featureList}>
                      {p.features.map(f => (
                        <div key={f} style={pg.featureItem}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                            <circle cx="7" cy="7" r="6.5" fill={p.accent + '22'} stroke={p.accent + '40'} strokeWidth=".5"/>
                            <path d="M4.5 7l2 2L9.5 5.5" stroke={p.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {p.cta && !isCurrent && (
                      <button
                        className="upgrade-btn"
                        style={{
                          ...pg.upgradeBtn,
                          background: p.id === 'elite'
                            ? 'linear-gradient(135deg,#b8870a,#d4a012)'
                            : 'linear-gradient(135deg,#6c47ff,#8b6bff)',
                          boxShadow: p.id === 'elite'
                            ? '0 4px 18px rgba(200,151,10,.3)'
                            : '0 4px 18px rgba(108,71,255,.35)',
                          marginTop: '1.25rem',
                        }}
                      >
                        {p.cta}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p style={pg.billingNote}>
              Secure payments via Stripe · Cancel anytime
            </p>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeUp .25s ease' }}>
            <div style={pg.formCard}>

              {/* Name field */}
              <div style={pg.field}>
                <label style={pg.label}>Full Name</label>
                <input
                  style={{
                    ...pg.input,
                    borderColor: focusField === 'name'
                      ? 'rgba(108,71,255,.6)'
                      : 'rgba(255,255,255,.09)',
                    boxShadow: focusField === 'name'
                      ? '0 0 0 3px rgba(108,71,255,.1)'
                      : 'none',
                  }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  onFocus={() => setFocus('name')}
                  onBlur={() => setFocus(null)}
                />
              </div>

              {/* Email field */}
              <div style={pg.field}>
                <label style={pg.label}>
                  Email Address
                  <span style={pg.lockedTag}>Locked</span>
                </label>
                <input
                  style={{ ...pg.input, opacity: .4, cursor: 'not-allowed' }}
                  value={user.email || ''}
                  disabled
                />
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,.05)', margin: '.25rem 0 .5rem' }} />

              {/* Meta info */}
              <div style={pg.metaGrid}>
                <div style={pg.metaCell}>
                  <div style={pg.metaLabel}>Member Since</div>
                  <div style={pg.metaValue}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' })
                      : '—'}
                  </div>
                </div>
                <div style={pg.metaCell}>
                  <div style={pg.metaLabel}>Current Plan</div>
                  <div style={{ ...pg.metaValue, color: plan.color, fontWeight: 700 }}>
                    {plan.label}
                    {user.plan === 'free' && (
                      <button
                        style={pg.upgradeInline}
                        onClick={() => setTab('plans')}
                      >Upgrade →</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Save */}
              <button
                className="save-btn"
                style={{ ...pg.saveBtn, opacity: saving ? .6 : 1 }}
                onClick={saveName}
                disabled={saving}
              >
                {saving
                  ? <><span style={pg.spinner} /> Saving...</>
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

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const pg = {
  wrap: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '80px 1.25rem 5rem',
  },

  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '.82rem',
    fontWeight: 500,
    padding: 0,
    marginBottom: '1.75rem',
    cursor: 'pointer',
  },

  /* Hero */
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.1rem',
    marginBottom: '2rem',
    padding: '1.25rem',
    background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '16px',
  },
  avatarShell: { position: 'relative', flexShrink: 0 },
  avatarRing: {
    position: 'absolute',
    inset: '-3px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#6c47ff,#8b6bff,#b06bff)',
    zIndex: 0,
  },
  avatar: {
    position: 'relative',
    zIndex: 1,
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#14141f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.2rem',
    letterSpacing: '-.01em',
  },
  heroInfo: { flex: 1, minWidth: 0 },
  heroName: { fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--text)' },
  heroMeta: { display: 'flex', alignItems: 'center', gap: '.45rem', marginTop: '.3rem', flexWrap: 'wrap' },
  heroEmail: { color: 'var(--muted)', fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  heroDot: { width: '3px', height: '3px', borderRadius: '50%', background: '#333355', flexShrink: 0 },
  heroPlan: { fontSize: '.76rem', fontWeight: 700 },

  /* Tabs */
  tabWrap: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid rgba(255,255,255,.07)',
    marginBottom: '1.75rem',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '.65rem 1.1rem',
    fontSize: '.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '-1px',
    letterSpacing: '-.01em',
    fontFamily: 'inherit',
    transition: 'color .15s, border-color .15s',
  },

  /* Plans */
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '.85rem',
  },
  planCard: {
    background: 'rgba(255,255,255,.025)',
    border: '1px solid',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
  },
  planTop: { display: 'flex', flexDirection: 'column', gap: '.5rem' },
  planName: { fontSize: '1rem', fontWeight: 800, letterSpacing: '-.01em' },
  planBadge: {
    fontSize: '.62rem',
    fontWeight: 800,
    padding: '.2rem .55rem',
    borderRadius: '999px',
    border: '1px solid',
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
  activeBadge: {
    fontSize: '.62rem',
    fontWeight: 800,
    padding: '.2rem .55rem',
    borderRadius: '999px',
    border: '1px solid',
    letterSpacing: '.04em',
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '.25rem', marginTop: '.15rem' },
  priceAmt: { fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-.04em', transition: 'color .2s' },
  pricePer: { fontSize: '.75rem', color: 'var(--muted)', fontWeight: 500 },

  featureList: { display: 'flex', flexDirection: 'column', gap: '.45rem', flex: 1 },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.45rem',
    fontSize: '.78rem',
    color: '#9999bb',
    lineHeight: 1.4,
  },

  upgradeBtn: {
    width: '100%',
    padding: '.75rem',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.85rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '-.01em',
  },

  billingNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,.18)',
    fontSize: '.74rem',
    marginTop: '1.25rem',
    letterSpacing: '.01em',
  },

  /* Form */
  formCard: {
    background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '.4rem' },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    fontSize: '.7rem',
    fontWeight: 700,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  },
  lockedTag: {
    fontSize: '.65rem',
    fontWeight: 700,
    padding: '.15rem .45rem',
    borderRadius: '5px',
    background: 'rgba(255,255,255,.05)',
    color: '#444466',
    border: '1px solid rgba(255,255,255,.06)',
    letterSpacing: '.03em',
  },
  input: {
    padding: '.75rem 1rem',
    background: '#0d0d1a',
    border: '1px solid',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color .15s, box-shadow .15s',
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.75rem',
  },
  metaCell: {
    background: 'rgba(255,255,255,.025)',
    border: '1px solid rgba(255,255,255,.05)',
    borderRadius: '10px',
    padding: '.8rem 1rem',
  },
  metaLabel: { fontSize: '.66rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.3rem' },
  metaValue: { fontSize: '.9rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' },

  upgradeInline: {
    background: 'none',
    border: 'none',
    color: '#7c5cff',
    fontWeight: 700,
    fontSize: '.78rem',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },

  saveBtn: {
    alignSelf: 'flex-start',
    padding: '.78rem 1.6rem',
    background: 'linear-gradient(135deg,#6c47ff,#8b6bff)',
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
    gap: '.5rem',
    boxShadow: '0 4px 20px rgba(108,71,255,.3)',
  },
  spinner: {
    width: '13px',
    height: '13px',
    border: '2px solid rgba(255,255,255,.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin .6s linear infinite',
    flexShrink: 0,
  },
};
