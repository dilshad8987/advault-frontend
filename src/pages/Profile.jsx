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
    border: 'rgba(124,92,255,.45)',
    glow: '0 0 32px rgba(108,71,255,.15)',
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
    ctaShadow: '0 6px 20px rgba(108,71,255,.38)',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: '/ month',
    color: '#c8920a',
    border: 'rgba(200,146,10,.4)',
    glow: '0 0 32px rgba(200,146,10,.12)',
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
    ctaShadow: '0 6px 20px rgba(200,146,10,.3)',
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

  const [tab,       setTab]  = useState('plans');
  const [name,      setName] = useState(user.name || '');
  const [saving,  setSaving] = useState(false);
  const [nameFocus,  setNF]  = useState(false);

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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .p-back { transition: background .15s, border-color .15s, color .15s; }
        .p-back:hover { background: rgba(255,255,255,.07) !important; border-color: rgba(255,255,255,.18) !important; color: #c0c0d8 !important; }

        .p-tab { transition: background .18s, color .18s, border-color .18s; }
        .p-tab:hover { color: #e8e8f8 !important; }

        .p-card { transition: border-color .22s, box-shadow .22s, transform .22s; }
        .p-card:hover { transform: translateY(-3px); }

        .p-cta { transition: filter .15s, transform .12s, box-shadow .15s; }
        .p-cta:hover { filter: brightness(1.12); transform: translateY(-1px); }

        .p-save { transition: opacity .15s, transform .12s; }
        .p-save:hover:not(:disabled) { opacity: .88 !important; transform: translateY(-1px); }

        /* Mobile */
        @media (max-width: 480px) {
          .pf-page    { padding: 62px .9rem 4rem !important; }
          .pf-idcard  { padding: .85rem 1rem !important; }
          .pf-avatar  { width: 40px !important; height: 40px !important; font-size: 1rem !important; }
          .pf-tabs    { margin-bottom: 1.4rem !important; }
          .pf-tab     { padding: .44rem .7rem !important; font-size: .79rem !important; flex: 1; text-align: center; }
          .pf-cardtop { flex-direction: column !important; gap: .55rem !important; }
          .pf-cardtop-left { flex-direction: row !important; justify-content: space-between !important; align-items: center !important; width: 100% !important; }
          .pf-featgrid { grid-template-columns: 1fr !important; gap: .35rem !important; }
          .pf-tiles   { grid-template-columns: 1fr 1fr !important; }
          .pf-savebtn { width: 100% !important; justify-content: center !important; }
          .pf-priceamt { font-size: 1.35rem !important; }
        }
      `}</style>

      <Navbar />

      <div className="pf-page" style={c.page}>

        {/* ── Back ── */}
        <button className="p-back" onClick={() => navigate(-1)} style={c.back}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9 12.5L4 7.5 9 2.5" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* ── Identity card ── */}
        <div className="pf-idcard" style={c.idCard}>
          {/* Avatar with subtle glow ring matching plan */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="pf-avatar" style={{
              ...c.idAvatar,
              boxShadow: `0 0 0 2px #08080f, 0 0 0 3.5px ${pm.color}55`,
            }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={c.idBody}>
            <div style={c.idName}>{user.name || 'User'}</div>
            <div style={c.idEmail}>{user.email}</div>
          </div>
          <div style={{ ...c.idBadge, color: pm.color, borderColor: pm.color + '55', background: pm.color + '14' }}>
            ✦ {pm.label}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pf-tabs" style={c.tabRow}>
          <div style={c.tabBox}>
            {[
              { id: 'plans',   label: 'Plans & Billing' },
              { id: 'profile', label: 'My Profile' },
            ].map(t => {
              const on = tab === t.id;
              return (
                <button key={t.id} className="p-tab pf-tab" onClick={() => setTab(t.id)} style={{
                  ...c.tab,
                  background: on ? '#ffffff' : 'transparent',
                  color:      on ? '#0a0a14' : '#5e5e7a',
                  fontWeight: on ? 700 : 500,
                  boxShadow:  on ? '0 2px 10px rgba(0,0,0,.4)' : 'none',
                }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════ PLANS ════ */}
        {tab === 'plans' && (
          <div style={{ animation: 'rise .22s ease' }}>

            <div style={c.eyebrow}>Choose a plan</div>

            <div style={c.planStack}>
              {PLANS.map(plan => {
                const active = currentPlan === plan.id;
                return (
                  <div key={plan.id} className="p-card" style={{
                    ...c.planCard,
                    borderColor: active ? plan.border : 'rgba(255,255,255,.07)',
                    boxShadow:   active ? plan.glow : 'none',
                    background:  active
                      ? `linear-gradient(160deg, ${plan.color}0a 0%, #0f0f1a 55%)`
                      : '#0f0f1a',
                  }}>

                    {/* Active top accent line */}
                    {active && (
                      <div style={{
                        position:  'absolute',
                        top: 0, left: '12%', right: '12%',
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${plan.color}88, transparent)`,
                        borderRadius: '1px',
                      }}/>
                    )}

                    {/* ── Card top ── */}
                    <div className="pf-cardtop" style={c.cardTop}>
                      <div className="pf-cardtop-left" style={c.cardTopLeft}>
                        <span style={{ ...c.planName, color: active ? plan.color : '#c8c8e0' }}>
                          {plan.name}
                        </span>
                        {plan.badge && (
                          <span style={{ ...c.chip, color: plan.color, borderColor: plan.color + '45', background: plan.color + '12' }}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div style={c.priceBlock}>
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
                            <circle cx="7" cy="7" r="6.5" fill={plan.color + '1a'} stroke={plan.color + '30'} strokeWidth=".5"/>
                            <path d="M4.5 7l2 2L9.5 5" stroke={plan.color} strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* ── CTA ── */}
                    {active ? (
                      <div style={{ ...c.activeCta, color: plan.color, borderColor: plan.color + '28', background: plan.color + '0e' }}>
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

            <div style={c.eyebrow}>Account Details</div>

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
            <div style={c.formBox}>
              <div style={c.formTitle}>Edit Profile</div>

              {/* Name */}
              <div style={c.field}>
                <label style={c.label}>Full name</label>
                <input
                  style={{
                    ...c.input,
                    borderColor: nameFocus ? 'rgba(124,92,255,.6)' : 'rgba(255,255,255,.1)',
                    boxShadow:   nameFocus ? '0 0 0 3px rgba(108,71,255,.1)' : 'none',
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
                      <rect x="1" y="4.5" width="7" height="5" rx="1.2" stroke="#44445a" strokeWidth="1"/>
                      <path d="M2.5 4.5V3a2 2 0 014 0v1.5" stroke="#44445a" strokeWidth="1"/>
                    </svg>
                    Locked
                  </span>
                </div>
                <input
                  style={{ ...c.input, opacity: .3, cursor: 'not-allowed', borderColor: 'rgba(255,255,255,.06)' }}
                  value={user.email || ''}
                  disabled
                />
              </div>

              <button
                className="p-save pf-savebtn"
                style={{ ...c.saveBtn, opacity: saving ? .5 : 1 }}
                onClick={saveName}
                disabled={saving}
              >
                {saving ? (
                  <><span style={c.spinner} /> Saving...</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 7l3.5 3.5L11 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save changes
                  </>
                )}
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
    maxWidth:  '520px',
    margin:    '0 auto',
    padding:   '72px 1.1rem 5rem',
  },

  back: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '.38rem',
    padding:        '.42rem .85rem .42rem .65rem',
    background:     'rgba(255,255,255,.04)',
    border:         '1px solid rgba(255,255,255,.08)',
    borderRadius:   '10px',
    cursor:         'pointer',
    marginBottom:   '1.25rem',
    color:          '#6e6e8a',
    fontSize:       '.8rem',
    fontWeight:     600,
    fontFamily:     'inherit',
    letterSpacing:  '-.01em',
  },

  /* Identity */
  idCard: {
    display:      'flex',
    alignItems:   'center',
    gap:          '1rem',
    padding:      '1rem 1.25rem',
    background:   '#0f0f1a',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '16px',
    marginBottom: '1.1rem',
    position:     'relative',
    overflow:     'hidden',
  },
  idAvatar: {
    width:          '46px',
    height:         '46px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #3a20b8, #7c5cff)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#fff',
    fontWeight:     800,
    fontSize:       '1.15rem',
    flexShrink:     0,
    letterSpacing:  '-.01em',
  },
  idBody:  { flex: 1, minWidth: 0 },
  idName:  { fontSize: '.93rem', fontWeight: 700, color: '#ededfa', letterSpacing: '-.015em' },
  idEmail: { fontSize: '.76rem', color: '#44445a', marginTop: '.18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  idBadge: {
    flexShrink:    0,
    fontSize:      '.68rem',
    fontWeight:    700,
    padding:       '.26rem .7rem',
    borderRadius:  '999px',
    border:        '1px solid',
    letterSpacing: '.03em',
  },

  /* Tabs */
  tabRow: {
    marginBottom: '1.6rem',
  },
  tabBox: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '.25rem',
    padding:       '.28rem',
    background:    '#1a1a28',
    border:        '1px solid rgba(255,255,255,.08)',
    borderRadius:  '12px',
  },
  tab: {
    padding:       '.48rem 1.1rem',
    borderRadius:  '8px',
    border:        'none',
    fontSize:      '.83rem',
    cursor:        'pointer',
    fontFamily:    'inherit',
    letterSpacing: '-.01em',
    transition:    'background .15s, color .15s, box-shadow .15s',
  },

  eyebrow: {
    fontSize:      '.65rem',
    fontWeight:    700,
    color:         '#44445a',
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    marginBottom:  '.85rem',
  },

  /* Plans */
  planStack: { display: 'flex', flexDirection: 'column', gap: '.65rem' },
  planCard: {
    padding:       '1.2rem',
    border:        '1px solid',
    borderRadius:  '18px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '.85rem',
    position:      'relative',
    overflow:      'hidden',
  },

  cardTop: {
    display:         'flex',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
  },
  cardTopLeft: {
    display:     'flex',
    alignItems:  'center',
    gap:         '.45rem',
    flexWrap:    'wrap',
  },
  planName:  { fontSize: '1rem', fontWeight: 800, letterSpacing: '-.015em' },
  chip: {
    fontSize:      '.59rem',
    fontWeight:    700,
    padding:       '.17rem .5rem',
    borderRadius:  '999px',
    border:        '1px solid',
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
  priceBlock: {
    display:    'flex',
    alignItems: 'baseline',
    gap:        '.22rem',
    flexShrink: 0,
  },
  priceAmt: { fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.04em', transition: 'color .2s' },
  pricePer: { fontSize: '.71rem', color: '#44445a' },

  hr: { height: '1px', background: 'rgba(255,255,255,.055)' },

  featGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '.4rem .7rem',
  },
  featItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '.38rem',
    fontSize:   '.75rem',
    color:      '#7878a0',
    lineHeight: 1.35,
  },

  activeCta: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             '.4rem',
    padding:         '.72rem',
    borderRadius:    '12px',
    border:          '1px solid',
    fontSize:        '.83rem',
    fontWeight:      600,
    letterSpacing:   '-.01em',
  },
  cta: {
    width:         '100%',
    padding:       '.75rem',
    border:        'none',
    borderRadius:  '12px',
    color:         '#fff',
    fontWeight:    700,
    fontSize:      '.88rem',
    cursor:        'pointer',
    fontFamily:    'inherit',
    letterSpacing: '-.01em',
  },

  billingNote: {
    textAlign:     'center',
    color:         '#28283e',
    fontSize:      '.7rem',
    marginTop:     '1rem',
    letterSpacing: '.01em',
  },

  /* Profile */
  tiles: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '.6rem',
    marginBottom:        '1.1rem',
  },
  tile: {
    padding:      '.9rem 1rem',
    background:   '#0f0f1a',
    border:       '1px solid rgba(255,255,255,.07)',
    borderRadius: '14px',
  },
  tileLabel: { fontSize: '.63rem', fontWeight: 700, color: '#44445a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.3rem' },
  tileVal:   { fontSize: '.9rem', fontWeight: 700, color: '#d0d0e8', display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' },
  tileLink:  { background: 'none', border: 'none', color: '#7c5cff', fontSize: '.74rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' },

  formBox: {
    padding:       '1.3rem',
    background:    '#0f0f1a',
    border:        '1px solid rgba(255,255,255,.07)',
    borderRadius:  '18px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '1rem',
  },
  formTitle: { fontSize: '.65rem', fontWeight: 700, color: '#44445a', textTransform: 'uppercase', letterSpacing: '.1em' },

  field:    { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  label:    { fontSize: '.67rem', fontWeight: 700, color: '#44445a', textTransform: 'uppercase', letterSpacing: '.08em' },
  locked: {
    display:      'inline-flex',
    alignItems:   'center',
    gap:          '.28rem',
    fontSize:     '.63rem',
    fontWeight:   600,
    color:        '#3a3a52',
    background:   'rgba(255,255,255,.03)',
    border:       '1px solid rgba(255,255,255,.06)',
    borderRadius: '5px',
    padding:      '.13rem .42rem',
  },
  input: {
    padding:      '.73rem 1rem',
    background:   '#08080f',
    border:       '1px solid',
    borderRadius: '11px',
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
    gap:            '.42rem',
    padding:        '.72rem 1.55rem',
    background:     'linear-gradient(135deg, #5535e0, #7c5cff)',
    color:          '#fff',
    border:         'none',
    borderRadius:   '11px',
    fontWeight:     700,
    fontSize:       '.87rem',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '-.01em',
    boxShadow:      '0 4px 16px rgba(108,71,255,.28)',
    transition:     'opacity .15s, transform .12s',
  },
  spinner: {
    width:          '12px',
    height:         '12px',
    border:         '2px solid rgba(255,255,255,.25)',
    borderTopColor: '#fff',
    borderRadius:   '50%',
    display:        'inline-block',
    animation:      'spin .6s linear infinite',
    flexShrink:     0,
  },
};
