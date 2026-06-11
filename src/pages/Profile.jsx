import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

/* ─── Plan config ─────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#6e6e8a',
    border: 'rgba(255,255,255,.08)',
    glow: 'none',
    features: [
      '200 credits / month',
      'TikTok Ads — limited',
      '3 saved collections',
      'Basic search filters',
      'Standard support',
      'Web access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/ month',
    color: '#7c5cff',
    border: 'rgba(124,92,255,.5)',
    glow: '0 0 40px rgba(108,71,255,.18)',
    badge: 'Most Popular',
    features: [
      'Unlimited credits',
      'TikTok + Facebook + Instagram',
      'Unlimited collections',
      'AliExpress products',
      'Advanced filters',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    ctaBg: 'linear-gradient(135deg, #5535e0, #7c5cff)',
    ctaShadow: '0 6px 24px rgba(108,71,255,.4)',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: '/ month',
    color: '#c8920a',
    border: 'rgba(200,146,10,.45)',
    glow: '0 0 40px rgba(200,146,10,.15)',
    badge: 'Best Value',
    features: [
      'Everything in Pro',
      'Team access — 5 seats',
      'API access',
      'Custom exports',
      'Dedicated manager',
      'White-label reports',
    ],
    cta: 'Get Elite',
    ctaBg: 'linear-gradient(135deg, #a87208, #c8920a)',
    ctaShadow: '0 6px 24px rgba(200,146,10,.35)',
  },
];

const PLAN_MAP = {
  free:  { label: 'Free',  color: '#6e6e8a' },
  pro:   { label: 'Pro',   color: '#7c5cff' },
  elite: { label: 'Elite', color: '#c8920a' },
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPlan = user.plan || 'free';
  const pm          = PLAN_MAP[currentPlan] || PLAN_MAP.free;

  const [tab,    setTab]    = useState('plans');
  const [name,   setName]   = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [nameFocus, setNF]  = useState(false);

  const saveName = async () => {
    if (!name.trim()) return toast.error('Name daalo');
    setSaving(true);
    try {
      const res = await api.patch('/auth/update-profile', { name });
      localStorage.setItem('user', JSON.stringify({ ...user, name: res.data?.user?.name || name }));
      toast.success('Saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes rise  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .p-tab  { transition: background .15s, color .15s, border-color .15s; }
        .p-tab:hover  { color: #f0f0f8 !important; }
        .p-card { transition: border-color .2s, box-shadow .2s, transform .2s; }
        .p-card:hover { transform: translateY(-2px); }
        .p-cta  { transition: filter .15s, transform .15s; }
        .p-cta:hover  { filter: brightness(1.1); transform: translateY(-1px); }
        .p-back { transition: background .15s, border-color .15s; }
        .p-back:hover { background: rgba(255,255,255,.08) !important; }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .pf-page     { padding: 64px .85rem 4rem !important; }
          .pf-idcard   { padding: .85rem 1rem !important; gap: .75rem !important; }
          .pf-idavatar { width: 38px !important; height: 38px !important; font-size: .95rem !important; }
          .pf-tabrow   { gap: .3rem !important; }
          .pf-tab      { padding: .48rem .75rem !important; font-size: .8rem !important; }
          .pf-plancard { padding: 1rem !important; }
          .pf-cardtop  { flex-direction: column !important; gap: .6rem !important; }
          .pf-pricetopleft { flex-direction: row !important; justify-content: space-between; align-items: center; width: 100%; }
          .pf-priceblock   { margin-top: 0 !important; }
          .pf-priceamt { font-size: 1.3rem !important; }
          .pf-featgrid { grid-template-columns: 1fr !important; }
          .pf-tiles    { grid-template-columns: 1fr 1fr !important; }
          .pf-formbox  { padding: 1rem !important; }
          .pf-savebtn  { width: 100% !important; justify-content: center !important; }
          .pf-eyebrow  { display: none !important; }
        }
      `}</style>

      <Navbar />

      <div className="pf-page" style={c.page}>

        {/* Back */}
        <button className="p-back" style={c.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9.5 13L4 8l5.5-5" stroke="#9090aa" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Identity card ── */}
        <div className="pf-idcard" style={c.idCard}>
          <div className="pf-idavatar" style={c.idAvatar}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={c.idBody}>
            <div style={c.idName}>{user.name || 'User'}</div>
            <div style={c.idEmail}>{user.email}</div>
          </div>
          <div style={{ ...c.idBadge, color: pm.color, borderColor: pm.color + '60', background: pm.color + '18' }}>
            {pm.label}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pf-tabrow" style={c.tabRow}>
          {[
            { id: 'plans',   label: 'Plans & Billing' },
            { id: 'profile', label: 'My Profile' },
          ].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} className="p-tab pf-tab" onClick={() => setTab(t.id)} style={{
                ...c.tab,
                background:  on ? '#ffffff' : 'transparent',
                color:       on ? '#0a0a12' : '#6e6e8a',
                fontWeight:  on ? 700 : 500,
                borderColor: on ? 'transparent' : 'rgba(255,255,255,.1)',
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ════ PLANS ════ */}
        {tab === 'plans' && (
          <div style={{ animation: 'rise .22s ease' }}>

            <div className="pf-eyebrow" style={c.eyebrow}>Choose a plan</div>

            <div style={c.planStack}>
              {PLANS.map(plan => {
                const active = currentPlan === plan.id;
                return (
                  <div key={plan.id} className="p-card pf-plancard" style={{
                    ...c.planCard,
                    borderColor: active ? plan.border : 'rgba(255,255,255,.07)',
                    boxShadow:   active ? plan.glow : 'none',
                  }}>

                    {/* ── Card top: name / badge / price ── */}
                    <div className="pf-cardtop" style={c.cardTop}>
                      <div className="pf-pricetopleft" style={c.cardTopLeft}>
                        <span style={{ ...c.planName, color: plan.color }}>{plan.name}</span>
                        {plan.badge && (
                          <span style={{ ...c.chip, color: plan.color, borderColor: plan.color + '50', background: plan.color + '16' }}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="pf-priceblock" style={c.priceBlock}>
                        <span className="pf-priceamt" style={{ ...c.priceAmt, color: active ? plan.color : '#e0e0f0' }}>
                          {plan.price}
                        </span>
                        <span style={c.pricePer}>{plan.period}</span>
                      </div>
                    </div>

                    {/* ── Divider ── */}
                    <div style={c.hr} />

                    {/* ── Features 2-col ── */}
                    <div className="pf-featgrid" style={c.featGrid}>
                      {plan.features.map(f => (
                        <div key={f} style={c.featItem}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="7" cy="7" r="6.5" fill={plan.color + '20'} stroke={plan.color + '35'} strokeWidth=".5"/>
                            <path d="M4.5 7l2 2L9.5 5" stroke={plan.color} strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* ── CTA ── */}
                    {active ? (
                      <div style={c.activeCta}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M3 6.5l2.5 2.5 4.5-5" stroke={plan.color} strokeWidth="1.6"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Current plan
                      </div>
                    ) : (
                      <button className="p-cta" style={{ ...c.cta, background: plan.ctaBg, boxShadow: plan.ctaShadow }}>
                        {plan.cta}
                      </button>
                    )}

                  </div>
                );
              })}
            </div>

            <p style={c.billingNote}>Billed monthly · Secure checkout via Stripe</p>
          </div>
        )}

        {/* ════ PROFILE ════ */}
        {tab === 'profile' && (
          <div style={{ animation: 'rise .22s ease' }}>

            <div className="pf-eyebrow" style={c.eyebrow}>Account Details</div>

            {/* Stat tiles */}
            <div className="pf-tiles" style={c.tiles}>
              <div style={c.tile}>
                <div style={c.tileLabel}>Member since</div>
                <div style={c.tileVal}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                    : '—'}
                </div>
              </div>
              <div style={c.tile}>
                <div style={c.tileLabel}>Plan</div>
                <div style={{ ...c.tileVal, color: pm.color }}>
                  {pm.label}
                  {currentPlan === 'free' && (
                    <button style={c.tileLink} onClick={() => setTab('plans')}>
                      Upgrade →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="pf-formbox" style={c.formBox}>

              <div style={c.formTitle}>Edit Profile</div>

              {/* Name */}
              <div style={c.field}>
                <label style={c.label}>Full name</label>
                <input
                  style={{
                    ...c.input,
                    borderColor: nameFocus ? 'rgba(108,71,255,.65)' : 'rgba(255,255,255,.1)',
                    boxShadow:   nameFocus ? '0 0 0 3px rgba(108,71,255,.12)' : 'none',
                  }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  onFocus={() => setNF(true)}
                  onBlur={() => setNF(false)}
                />
              </div>

              {/* Email */}
              <div style={c.field}>
                <div style={c.labelRow}>
                  <label style={c.label}>Email address</label>
                  <span style={c.locked}>
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                      <rect x="1" y="4.5" width="7" height="5" rx="1.2" stroke="#555577" strokeWidth="1"/>
                      <path d="M2.5 4.5V3a2 2 0 014 0v1.5" stroke="#555577" strokeWidth="1"/>
                    </svg>
                    Locked
                  </span>
                </div>
                <input
                  style={{ ...c.input, opacity: .35, cursor: 'not-allowed', borderColor: 'rgba(255,255,255,.07)' }}
                  value={user.email || ''}
                  disabled
                />
              </div>

              <button
                className="pf-savebtn"
                style={{ ...c.saveBtn, opacity: saving ? .55 : 1 }}
                onClick={saveName}
                disabled={saving}
              >
                {saving
                  ? <><span style={c.spinner} /> Saving...</>
                  : 'Save changes'
                }
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const c = {
  page: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '72px 1rem 5rem',
  },

  back: {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '36px',
    height:         '36px',
    background:     'rgba(255,255,255,.04)',
    border:         '1px solid rgba(255,255,255,.09)',
    borderRadius:   '10px',
    cursor:         'pointer',
    marginBottom:   '1.25rem',
  },

  /* Identity */
  idCard: {
    display:      'flex',
    alignItems:   'center',
    gap:          '1rem',
    padding:      '1rem 1.25rem',
    background:   '#0f0f1a',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '14px',
    marginBottom: '1.25rem',
  },
  idAvatar: {
    width:          '44px',
    height:         '44px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg,#4a30c8,#7c5cff)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#fff',
    fontWeight:     800,
    fontSize:       '1.1rem',
    flexShrink:     0,
  },
  idBody:  { flex: 1, minWidth: 0 },
  idName:  { fontSize: '.92rem', fontWeight: 700, color: '#f0f0f8', letterSpacing: '-.01em' },
  idEmail: { fontSize: '.77rem', color: '#555577', marginTop: '.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  idBadge: {
    flexShrink:   0,
    fontSize:     '.7rem',
    fontWeight:   700,
    padding:      '.28rem .75rem',
    borderRadius: '999px',
    border:       '1px solid',
    letterSpacing:'.02em',
  },

  /* Tabs */
  tabRow: {
    display:      'flex',
    gap:          '.45rem',
    marginBottom: '1.75rem',
  },
  tab: {
    padding:      '.52rem 1.1rem',
    borderRadius: '999px',
    border:       '1px solid',
    fontSize:     '.84rem',
    cursor:       'pointer',
    fontFamily:   'inherit',
    letterSpacing:'-.01em',
  },

  eyebrow: {
    fontSize:     '.67rem',
    fontWeight:   700,
    color:        '#555577',
    textTransform:'uppercase',
    letterSpacing:'.09em',
    marginBottom: '.9rem',
  },

  /* Plans */
  planStack: { display: 'flex', flexDirection: 'column', gap: '.7rem' },
  planCard: {
    padding:      '1.2rem',
    background:   '#0f0f1a',
    border:       '1px solid',
    borderRadius: '16px',
    display:      'flex',
    flexDirection:'column',
    gap:          '.85rem',
  },

  cardTop: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  cardTopLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        '.45rem',
    flexWrap:   'wrap',
  },
  planName: { fontSize: '.98rem', fontWeight: 800, letterSpacing: '-.01em' },
  chip: {
    fontSize:     '.6rem',
    fontWeight:   700,
    padding:      '.18rem .5rem',
    borderRadius: '999px',
    border:       '1px solid',
    letterSpacing:'.03em',
  },
  priceBlock: {
    display:    'flex',
    alignItems: 'baseline',
    gap:        '.25rem',
    flexShrink: 0,
  },
  priceAmt: { fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-.04em', transition: 'color .2s' },
  pricePer: { fontSize: '.72rem', color: '#555577' },

  hr: { height: '1px', background: 'rgba(255,255,255,.06)' },

  featGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '.38rem .7rem',
  },
  featItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '.4rem',
    fontSize:   '.76rem',
    color:      '#8888aa',
    lineHeight: 1.3,
  },

  activeCta: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '.4rem',
    padding:        '.75rem',
    borderRadius:   '11px',
    background:     'rgba(255,255,255,.04)',
    border:         '1px solid rgba(255,255,255,.09)',
    color:          '#666688',
    fontSize:       '.84rem',
    fontWeight:     600,
    letterSpacing:  '-.01em',
  },
  cta: {
    width:        '100%',
    padding:      '.75rem',
    border:       'none',
    borderRadius: '11px',
    color:        '#fff',
    fontWeight:   700,
    fontSize:     '.88rem',
    cursor:       'pointer',
    fontFamily:   'inherit',
    letterSpacing:'-.01em',
  },

  billingNote: {
    textAlign:  'center',
    color:      '#2e2e48',
    fontSize:   '.72rem',
    marginTop:  '1rem',
    letterSpacing: '.01em',
  },

  /* Profile */
  tiles: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '.65rem',
    marginBottom:        '1.2rem',
  },
  tile: {
    padding:      '.9rem 1rem',
    background:   '#0f0f1a',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '13px',
  },
  tileLabel: { fontSize: '.65rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.32rem' },
  tileVal:   { fontSize: '.9rem', fontWeight: 700, color: '#d0d0e8', display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' },
  tileLink:  { background: 'none', border: 'none', color: '#7c5cff', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' },

  formBox: {
    padding:      '1.25rem',
    background:   '#0f0f1a',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '16px',
    display:      'flex',
    flexDirection:'column',
    gap:          '1rem',
  },
  formTitle: { fontSize: '.67rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.09em' },

  field:    { display: 'flex', flexDirection: 'column', gap: '.38rem' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: '.68rem', fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: '.07em' },
  locked: {
    display:      'inline-flex',
    alignItems:   'center',
    gap:          '.3rem',
    fontSize:     '.65rem',
    fontWeight:   600,
    color:        '#444466',
    background:   'rgba(255,255,255,.04)',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '5px',
    padding:      '.15rem .45rem',
  },
  input: {
    padding:      '.72rem .95rem',
    background:   '#08080f',
    border:       '1px solid',
    borderRadius: '10px',
    color:        '#f0f0f8',
    fontSize:     '.9rem',
    outline:      'none',
    width:        '100%',
    fontFamily:   'inherit',
    transition:   'border-color .15s, box-shadow .15s',
    boxSizing:    'border-box',
  },

  saveBtn: {
    alignSelf:      'flex-start',
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '.45rem',
    padding:        '.72rem 1.5rem',
    background:     'linear-gradient(135deg,#5535e0,#7c5cff)',
    color:          '#fff',
    border:         'none',
    borderRadius:   '10px',
    fontWeight:     700,
    fontSize:       '.88rem',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '-.01em',
    boxShadow:      '0 4px 18px rgba(108,71,255,.3)',
    transition:     'opacity .15s',
  },
  spinner: {
    width:         '13px',
    height:        '13px',
    border:        '2px solid rgba(255,255,255,.3)',
    borderTopColor:'#fff',
    borderRadius:  '50%',
    display:       'inline-block',
    animation:     'spin .6s linear infinite',
    flexShrink:    0,
  },
};
