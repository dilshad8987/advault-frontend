import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CREDITS_CACHE_KEY = 'advault_credits_cache';

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: 'forever',
    color: '#6e6e8a', border: 'rgba(255,255,255,.08)', glow: 'none',
    accentGrad: 'linear-gradient(135deg,#3a3a5c,#6e6e8a)',
    features: ['200 credits / month','TikTok Ads — limited','3 saved collections','Basic search filters','Standard support','Web access'],
  },
  {
    id: 'pro', name: 'Pro', price: '$29', period: '/ month',
    color: '#7c5cff', border: 'rgba(124,92,255,.4)', glow: '0 0 40px rgba(108,71,255,.18)',
    badge: 'Most Popular', badgeBg: 'linear-gradient(135deg,#5535e0,#7c5cff)',
    accentGrad: 'linear-gradient(135deg,#5535e0,#7c5cff)',
    features: ['Unlimited credits','TikTok + Facebook + Instagram','Unlimited collections','Advanced filters','Priority support'],
    cta: 'Upgrade', ctaBg: 'linear-gradient(135deg,#5535e0,#7c5cff)', ctaShadow: '0 6px 24px rgba(108,71,255,.4)',
  },
  {
    id: 'elite', name: 'Elite', price: '$79', period: '/ month',
    color: '#f5a623', border: 'rgba(245,166,35,.4)', glow: '0 0 40px rgba(245,166,35,.15)',
    badge: 'Best Value', badgeBg: 'linear-gradient(135deg,#c47d0a,#f5a623)',
    accentGrad: 'linear-gradient(135deg,#c47d0a,#f5a623)',
    features: ['Everything in Pro','Team access — 5 seats','API access','Custom exports','Dedicated manager','White-label reports'],
    cta: 'Upgrade', ctaBg: 'linear-gradient(135deg,#c47d0a,#f5a623)', ctaShadow: '0 6px 24px rgba(245,166,35,.35)',
  },
];

const PLAN_META = {
  free:  { label: 'Free',  color: '#6e6e8a' },
  pro:   { label: 'Pro',   color: '#7c5cff' },
  elite: { label: 'Elite', color: '#f5a623' },
};

/* ── Icons ── */
const IconPlans = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2" width="12" height="10" rx="2" stroke={color} strokeWidth="1.3"/>
    <path d="M1 5h12" stroke={color} strokeWidth="1.3"/>
    <path d="M4 8.5h3M4 10.5h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconProfile = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="5" r="2.5" stroke={color} strokeWidth="1.3"/>
    <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconCheck = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink:0 }}>
    <circle cx="6.5" cy="6.5" r="6" fill={color+'18'} stroke={color+'35'} strokeWidth=".5"/>
    <path d="M4 6.5l2 2L9 4.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconStar = ({ color }) => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M5.5 1l1.2 2.6H9.5L7.2 5.4l.9 2.8L5.5 6.7l-2.6 1.5.9-2.8L1.5 3.6h2.8L5.5 1z" fill={color} opacity=".85"/>
  </svg>
);

/* Plan-specific icons — desktop plan cards */
const IconFreePlan = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4"/>
    <rect x="9.5" y="2.5" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4" opacity=".45"/>
    <rect x="2.5" y="9.5" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4" opacity=".45"/>
    <rect x="9.5" y="9.5" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.4" opacity=".25"/>
  </svg>
);
const IconProPlan = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M10.2 1.5L3.8 9.8h3.6L7 16.5l6.4-8.3H9.8L10.2 1.5z" fill={color} opacity=".9" stroke={color} strokeWidth=".4" strokeLinejoin="round"/>
  </svg>
);
const IconElitePlan = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 6.2l2.6 1.8L9 3l4.4 5 2.6-1.8-1.1 7.3H3.1L2 6.2z" fill={color} opacity=".9" stroke={color} strokeWidth=".5" strokeLinejoin="round"/>
    <circle cx="9" cy="3" r="1.1" fill={color}/>
    <circle cx="2.4" cy="6.2" r="1" fill={color} opacity=".8"/>
    <circle cx="15.6" cy="6.2" r="1" fill={color} opacity=".8"/>
    <path d="M3.6 13.8h10.8" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity=".7"/>
  </svg>
);
const PLAN_ICONS = { free: IconFreePlan, pro: IconProPlan, elite: IconElitePlan };

export default function Profile() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPlan = user.plan || 'free';
  const pm          = PLAN_META[currentPlan] || PLAN_META.free;

  const [tab,      setTab]  = useState('plans');
  const [name,     setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [nameFocus,  setNF] = useState(false);

  const [usage, setUsage] = useState(() => {
    try {
      const cached = localStorage.getItem(CREDITS_CACHE_KEY);
      if (cached) {
        const { remaining, limit } = JSON.parse(cached);
        return { creditsRemaining: remaining, creditsLimit: limit };
      }
    } catch {}
    return null;
  });

  const fetchUsage = () => {
    api.get('/user/profile')
      .then(res => {
        if (res.data?.usage) {
          const u = res.data.usage;
          setUsage(u);
          try { localStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify({ remaining: u.creditsRemaining, limit: u.creditsLimit })); } catch {}
        }
      }).catch(() => {});
  };

  useEffect(() => {
    fetchUsage();
    window.addEventListener('credits-updated', fetchUsage);
    return () => window.removeEventListener('credits-updated', fetchUsage);
  }, []);

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

  const fLimit     = usage?.creditsLimit     || 200;
  const fRemaining = usage?.creditsRemaining ?? fLimit;
  const fUsed      = fLimit - fRemaining;
  const fPct       = Math.min(100, Math.round((fUsed / fLimit) * 100));
  const fClr       = fPct >= 80 ? '#ff4f87' : fPct >= 50 ? '#ffb700' : '#4caf7d';

  const NAV_ITEMS = [
    { id: 'plans',   label: 'Plans',   Icon: IconPlans },
    { id: 'profile', label: 'Profile', Icon: IconProfile },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#08080f' }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }

        .pf-back:hover  { background:rgba(255,255,255,.07) !important; border-color:rgba(255,255,255,.15) !important; color:#a0a0c0 !important; }
        .pf-cta:hover   { filter:brightness(1.12); transform:translateY(-1px); box-shadow:0 10px 32px rgba(0,0,0,.4) !important; }
        .pf-save:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }

        /* plan card hover */
        @media(min-width:900px) {
          .pf-plancard.pf-card:hover { transform:translateY(-5px) !important; }
          .pf-plancard.pf-plan-featured.pf-card:hover { transform:scale(1.025) translateY(-5px) !important; }
        }

        /* ── Mobile (default) ── */
        .pf-outer    { padding:68px 1rem 5rem; max-width:520px; margin:0 auto; }
        .pf-layout   { display:block; }
        .pf-sidebar  { display:none; }
        .pf-main     { width:100%; }
        .pf-idcard   { padding:.9rem 1.1rem; }

        /* Tabs — always visible, mobile & desktop */
        .pf-tabs     { display:flex; gap:.5rem; margin-bottom:1.5rem; }
        .pf-tab      { flex:1; text-align:center; }
        .pf-plan-heading-desktop, .pf-plan-subheading-desktop { display:none; margin:0; padding:0; font-family:inherit; }
        .pf-cta-spacer-desktop { display:none; }

        .pf-plancard { padding:1.2rem; }
        .pf-feats    { grid-template-columns:1fr 1fr; }

        /* ── Tablet 640px+ ── */
        @media(min-width:640px) {
          .pf-outer  { max-width:680px; padding:72px 1.5rem 5rem; }
          .pf-feats  { grid-template-columns:1fr 1fr; }
        }

        /* ── Desktop 900px+ ── */
        @media(min-width:900px) {
          .pf-outer   { max-width:1180px; padding:84px 2rem 5rem; }
          /* No sidebar — layout is single column */
          .pf-layout  { display:block; }
          .pf-sidebar { display:none !important; }

          /* Tabs same as mobile but wider */
          .pf-tabs { max-width:320px; margin-bottom:2rem; }

          .pf-back    { margin-bottom:1.5rem; }
          .pf-feats   { grid-template-columns:1fr !important; gap:.65rem !important; }

          /* Plan cards grid */
          .pf-plancard {
            padding:2.9rem 1.85rem 2rem; border-radius:24px; gap:1.3rem;
            backdrop-filter:blur(6px);
            transition:transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease, border-color .28s ease;
          }
          .pf-plan-grid {
            display:grid !important;
            grid-template-columns:1fr 1.08fr 1fr !important;
            gap:1.75rem !important;
            align-items:stretch !important;
          }
          .pf-plancard.pf-plan-featured { z-index:1; }
          .pf-plancard.pf-card:hover {
            box-shadow:0 18px 46px rgba(0,0,0,.45) !important;
            border-color:rgba(255,255,255,.16) !important;
          }
          .pf-plancard.pf-plan-featured.pf-card:hover {
            box-shadow:0 22px 56px rgba(108,71,255,.28) !important;
          }

          /* Headings */
          .pf-plan-eyebrow-desktop { font-size:.78rem !important; letter-spacing:.28em !important; margin-bottom:.75rem !important; color:#7c5cff !important; text-transform:uppercase; font-weight:700 !important; }
          .pf-plan-heading-desktop { display:block !important; font-size:2.2rem !important; font-weight:900 !important; color:#f4f4fc !important; letter-spacing:-.04em; margin-bottom:.6rem !important; line-height:1.15 !important; }
          .pf-plan-subheading-desktop { display:block !important; font-size:.97rem !important; color:#8888aa !important; margin-bottom:2.8rem !important; line-height:1.6 !important; }

          /* Card internals — SAME font for all plan names */
          .pf-plan-name-desktop  { font-size:1.3rem !important; font-weight:800 !important; letter-spacing:-.02em !important; }
          .pf-plan-price-desktop { font-size:2.6rem !important; font-weight:900 !important; letter-spacing:-.04em !important; }
          .pf-feat-item-desktop  { font-size:.86rem !important; gap:.5rem !important; }
          .pf-cta-desktop        { padding:1rem !important; font-size:.96rem !important; border-radius:14px !important; letter-spacing:.01em !important; }
          .pf-activecta-desktop  { padding:.92rem !important; font-size:.92rem !important; border-radius:14px !important; }
          .pf-period-desktop     { font-size:.78rem !important; }

          /* Price row — same min-height across all cards */
          .pf-planheader-desktop {
            min-height:3.4rem !important;
            align-items:center !important;
          }

          /* Spacer for non-free cards to align CTA with free card's usage box */
          .pf-cta-spacer-desktop { display:block !important; height:2.9rem !important; }

          /* Ribbon badge */
          .pf-ribbon-desktop {
            display:inline-flex !important;
            position:absolute; top:1.15rem; right:1.75rem;
            font-size:.64rem !important; font-weight:800 !important; letter-spacing:.12em !important;
            padding:.4rem 1rem !important; border-radius:999px !important; border:none !important;
            box-shadow:0 6px 18px rgba(0,0,0,.45); text-transform:uppercase;
          }
          .pf-badge-mobile { display:none !important; }
          .pf-billing-note-desktop { font-size:.8rem !important; margin-top:2.25rem !important; letter-spacing:.02em !important; }
          .pf-plan-icon-desktop { display:flex !important; width:46px !important; height:46px !important; border-radius:14px !important; }
        }

        /* ── Large desktop 1200px+ ── */
        @media(min-width:1200px) {
          .pf-outer { max-width:1200px; }
        }

        /* ── Small mobile ── */
        @media(max-width:400px) {
          .pf-feats   { grid-template-columns:1fr !important; }
          .pf-savebtn { width:100% !important; justify-content:center !important; }
        }
      `}</style>
      <Navbar />

      <div className="pf-outer">

        {/* Back */}
        <button className="pf-back" onClick={() => navigate(-1)} style={c.back}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 11.5L4 7l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="pf-layout">

          {/* Sidebar desktop only — hidden via CSS, kept for structure */}
          <aside className="pf-sidebar" style={{ display:'none' }} />

          {/* ── MAIN CONTENT ── */}
          <div className="pf-main">

            {/* Identity card — mobile + desktop */}
            <div className="pf-idcard" style={{ ...c.idCard, marginBottom:'1rem' }}>
              <div style={{ ...c.idAvatar, boxShadow:`0 0 0 2px #08080f, 0 0 0 3.5px ${pm.color}66` }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={c.idBody}>
                <div style={c.idName}>{user.name || 'User'}</div>
                <div style={c.idEmail}>{user.email}</div>
              </div>
              <div style={{ ...c.idBadge, color:pm.color, borderColor:pm.color+'40', background:pm.color+'12' }}>
                ✦ {pm.label}
              </div>
            </div>

            {/* Mobile Tabs — icon + label */}
            <div className="pf-tabs" style={c.tabs}>
              {NAV_ITEMS.map(({ id, label, Icon }) => {
                const on = tab === id;
                return (
                  <button key={id} className="pf-tab" onClick={() => setTab(id)} style={{
                    ...c.tab,
                    background:  on ? '#14142a' : 'transparent',
                    color:       on ? '#e0e0f8' : '#3e3e5a',
                    fontWeight:  on ? 700 : 500,
                    borderColor: on ? 'rgba(124,92,255,.4)' : 'rgba(255,255,255,.06)',
                    boxShadow:   on ? '0 0 20px rgba(108,71,255,.1)' : 'none',
                  }}>
                    {/* Icon in tab */}
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
                      <Icon size={14} color={on ? '#e0e0f8' : '#3e3e5a'} />
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── PLANS ── */}
            {tab === 'plans' && (
              <div style={{ animation:'rise .22s ease' }}>
                <div className="pf-plan-eyebrow-desktop" style={c.eyebrow}>Plans &amp; Pricing</div>
                <h2 className="pf-plan-heading-desktop" style={{ position:'relative', display:'inline-block' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #f4f4fc 30%, #a78bfa 70%, #7c5cff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    Spy Smarter. Scale Faster.
                  </span>
                </h2>
                <p className="pf-plan-subheading-desktop" style={{ color:'#8888aa', lineHeight:'1.6' }}>
                  Find winning ads before your competitors even know they exist.
                </p>

                <div className="pf-plan-grid" style={c.planStack}>
                  {PLANS.map(plan => {
                    const active     = currentPlan === plan.id;
                    const pRemaining = plan.id === 'free' ? fRemaining : null;
                    const pPct       = plan.id === 'free' ? fPct : null;
                    const pClr       = plan.id === 'free' ? fClr : null;

                    return (
                      <div
                        key={plan.id}
                        className={`pf-card pf-plancard${plan.id === 'pro' ? ' pf-plan-featured' : ''}`}
                        style={{
                          ...c.planCard,
                          borderColor: active
                            ? plan.border
                            : plan.id === 'pro'
                              ? 'rgba(124,92,255,.22)'
                              : 'rgba(255,255,255,.06)',
                          boxShadow: active ? plan.glow : 'none',
                          background: active
                            ? `linear-gradient(160deg,${plan.color}10 0%,#0d0d1e 55%)`
                            : plan.id === 'pro'
                              ? 'linear-gradient(160deg,rgba(124,92,255,.06) 0%,#0d0d1e 60%)'
                              : '#0d0d1e',
                          transition: 'transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease',
                        }}
                      >
                        {/* Active top glow line */}
                        {active && (
                          <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:'1px', background:`linear-gradient(90deg,transparent,${plan.color}80,transparent)` }} />
                        )}
                        {/* Active left accent */}
                        {active && (
                          <div style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:'2.5px', background:`linear-gradient(180deg,transparent,${plan.color}cc,transparent)`, borderRadius:'0 3px 3px 0' }} />
                        )}

                        {/* Desktop ribbon badge */}
                        {plan.badge && (
                          <span className="pf-ribbon-desktop" style={{ display:'none', color:'#fff', background: plan.badgeBg }}>
                            {plan.badge}
                          </span>
                        )}

                        {/* Plan icon — desktop only */}
                        <div className="pf-plan-icon-desktop" style={{ display:'none', width:'38px', height:'38px', borderRadius:'12px', background:`${plan.color}16`, border:`1px solid ${plan.color}28`, alignItems:'center', justifyContent:'center', marginBottom:'.1rem' }}>
                          {React.createElement(PLAN_ICONS[plan.id] || IconStar, { color: plan.color })}
                        </div>

                        {/* Header */}
                        <div className="pf-planheader-desktop" style={c.planHeader}>
                          <div style={{ display:'flex', alignItems:'center', gap:'.45rem', flexWrap:'wrap' }}>
                            <span
                              className="pf-plan-name-desktop"
                              style={{ ...c.planName, color: active ? plan.color : plan.id === 'pro' ? '#c8c8e0' : '#9090b0' }}
                            >
                              {plan.name}
                            </span>
                            {plan.badge && (
                              <span className="pf-badge-mobile" style={{
                                fontSize:'.57rem', fontWeight:700, padding:'.15rem .48rem',
                                borderRadius:'99px', border:`1px solid ${plan.color}45`,
                                color:plan.color, background:plan.color+'12',
                                textTransform:'uppercase', letterSpacing:'.04em',
                              }}>
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ display:'flex', alignItems:'baseline', gap:'.18rem', flexShrink:0 }}>
                            <span
                              className="pf-plan-price-desktop"
                              style={{ fontSize:'1.6rem', fontWeight:900, letterSpacing:'-.04em', color: active ? plan.color : '#e0e0f0' }}
                            >
                              {plan.price}
                            </span>
                            <span className="pf-period-desktop" style={{ fontSize:'.67rem', color:'#3e3e5a' }}>{plan.period}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height:'1px', background: active ? `linear-gradient(90deg,${plan.color}30,transparent)` : 'rgba(255,255,255,.05)' }} />

                        {/* Features */}
                        <div className="pf-feats" style={c.feats}>
                          {plan.features.map(f => (
                            <div key={f} className="pf-feat-item-desktop" style={c.featItem}>
                              <IconCheck color={plan.color} />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Credits bar — free only */}
                        {plan.id === 'free' && (
                          <div style={c.usageBox}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.45rem' }}>
                              <span style={c.usageLabel}>Credits used</span>
                              <span style={{ fontSize:'.76rem', fontWeight:800, color:pClr, fontVariantNumeric:'tabular-nums' }}>
                                {pRemaining}<span style={{ color:'#3a3a52', fontWeight:500 }}> / {fLimit}</span>
                              </span>
                            </div>
                            <div style={c.usageTrack}>
                              <div style={{ height:'100%', width:`${pPct}%`, background:`linear-gradient(90deg,${pClr}80,${pClr})`, borderRadius:'4px', transition:'width .6s ease' }} />
                            </div>
                            {fRemaining <= 20 && (
                              <div style={{ fontSize:'.64rem', color:'#ff4f87', fontWeight:600, marginTop:'.35rem', display:'flex', alignItems:'center', gap:'.25rem' }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M5 1L9.5 9H.5L5 1z" stroke="#ff4f87" strokeWidth="1.1" strokeLinejoin="round"/>
                                  <path d="M5 4v2" stroke="#ff4f87" strokeWidth="1.1" strokeLinecap="round"/>
                                </svg>
                                {fRemaining <= 0 ? 'Credits khatam ho gaye!' : 'Credits khatam hone wale hain!'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Desktop-only spacer to align CTA row with Free card's usage box */}
                        {plan.id !== 'free' && (
                          <div className="pf-cta-spacer-desktop" aria-hidden="true" />
                        )}


                        {/* CTA */}
                        {active ? (
                          <div className="pf-activecta-desktop" style={{ ...c.activeCta, color:plan.color, borderColor:plan.color+'28', background:plan.color+'0d', marginTop:'auto' }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6l2.5 2.5 4.5-5" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Current plan
                          </div>
                        ) : (
                          <button className="pf-cta pf-cta-desktop" style={{ ...c.cta, background:plan.ctaBg, boxShadow:plan.ctaShadow, marginTop:'auto' }}>
                            {plan.cta}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="pf-billing-note-desktop" style={c.billingNote}>Billed monthly · Secure checkout via Stripe</p>
              </div>
            )}

            {/* ── PROFILE ── */}
            {tab === 'profile' && (
              <div style={{ animation:'rise .22s ease' }}>
                <div style={c.eyebrow}>Account Details</div>

                <div style={c.formCard}>
                  <div style={c.formTitle}>Edit Profile</div>

                  <div style={c.field}>
                    <label style={c.label}>Name</label>
                    <input
                      style={{ ...c.input, borderColor: nameFocus ? 'rgba(124,92,255,.55)' : 'rgba(255,255,255,.08)', boxShadow: nameFocus ? '0 0 0 3px rgba(108,71,255,.1)' : 'none' }}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      onFocus={() => setNF(true)}
                      onBlur={() => setNF(false)}
                    />
                  </div>

                  <div style={c.field}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <label style={c.label}>Email</label>
                      <span style={c.lockedTag}>
                        <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                          <rect x="1" y="4.5" width="7" height="5" rx="1.2" stroke="#3e3e5a" strokeWidth="1"/>
                          <path d="M2.5 4.5V3a2 2 0 014 0v1.5" stroke="#3e3e5a" strokeWidth="1"/>
                        </svg>
                        Locked
                      </span>
                    </div>
                    <input style={{ ...c.input, opacity:.3, cursor:'not-allowed', borderColor:'rgba(255,255,255,.05)' }} value={user.email || ''} disabled />
                  </div>

                  <button className="pf-save pf-savebtn" style={{ ...c.saveBtn, opacity: saving ? .5 : 1 }} onClick={saveName} disabled={saving}>
                    {saving
                      ? <><span style={c.spinner} />Saving...</>
                      : <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Save changes</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>{/* /pf-main */}
        </div>{/* /pf-layout */}
      </div>{/* /pf-outer */}

    </div>
  );
}

const c = {
  back: {
    display:'inline-flex', alignItems:'center', gap:'.38rem',
    padding:'.42rem .85rem .42rem .65rem',
    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
    borderRadius:'10px', cursor:'pointer', color:'#4e4e6a',
    fontSize:'.78rem', fontWeight:600, fontFamily:'inherit',
    marginBottom:'1.2rem', transition:'background .15s, border-color .15s, color .15s',
  },

  idCard:  { display:'flex', alignItems:'center', gap:'.9rem', padding:'.9rem 1.1rem', background:'#0d0d1e', border:'1px solid rgba(255,255,255,.07)', borderRadius:'16px', overflow:'hidden', position:'relative' },
  idAvatar:{ width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#3a20b8,#7c5cff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.1rem', flexShrink:0 },
  idBody:  { flex:1, minWidth:0 },
  idName:  { fontSize:'.9rem', fontWeight:700, color:'#ededf8', letterSpacing:'-.015em' },
  idEmail: { fontSize:'.72rem', color:'#3e3e5a', marginTop:'.1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  idBadge: { flexShrink:0, fontSize:'.65rem', fontWeight:700, padding:'.22rem .65rem', borderRadius:'99px', border:'1px solid', letterSpacing:'.025em' },

  sideCredits:      { background:'#0d0d1e', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px', padding:'.9rem 1rem' },
  sideCreditsLabel: { fontSize:'.6rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  sideBar:          { height:'4px', background:'rgba(255,255,255,.06)', borderRadius:'3px', overflow:'hidden' },

  tabs: { marginBottom:'1.5rem' },
  tab:  { padding:'.52rem 1rem', borderRadius:'10px', border:'1px solid', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit', letterSpacing:'-.01em', transition:'background .15s, color .15s, border-color .15s, box-shadow .15s' },

  eyebrow: { fontSize:'.62rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.85rem' },

  planStack: { display:'flex', flexDirection:'column', gap:'.65rem' },
  planCard:  { padding:'1.2rem', border:'1px solid', borderRadius:'20px', display:'flex', flexDirection:'column', gap:'.85rem', position:'relative', overflow:'hidden' },
  planHeader:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  planName:  { fontSize:'.98rem', fontWeight:800, letterSpacing:'-.02em', fontFamily:'inherit', transition:'color .2s' },

  feats:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.4rem .65rem' },
  featItem: { display:'flex', alignItems:'center', gap:'.38rem', fontSize:'.74rem', color:'#6a6a8a', lineHeight:1.35 },

  usageBox:   { background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'11px', padding:'.65rem .7rem' },
  usageLabel: { fontSize:'.6rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  usageTrack: { height:'5px', background:'rgba(255,255,255,.06)', borderRadius:'4px', overflow:'hidden' },

  activeCta: { display:'flex', alignItems:'center', justifyContent:'center', gap:'.38rem', padding:'.72rem', borderRadius:'12px', border:'1px solid', fontSize:'.82rem', fontWeight:600, letterSpacing:'-.01em' },
  cta:       { width:'100%', padding:'.78rem', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'.88rem', cursor:'pointer', fontFamily:'inherit', letterSpacing:'-.01em', transition:'filter .15s, transform .12s, box-shadow .15s' },

  billingNote: { textAlign:'center', color:'#252538', fontSize:'.68rem', marginTop:'.9rem' },

  formCard:  { padding:'1.5rem', background:'#0d0d1e', border:'1px solid rgba(255,255,255,.07)', borderRadius:'18px', display:'flex', flexDirection:'column', gap:'1.1rem', maxWidth:'560px' },
  formTitle: { fontSize:'.62rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.1em' },
  field:     { display:'flex', flexDirection:'column', gap:'.3rem' },
  label:     { fontSize:'.65rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  lockedTag: { display:'inline-flex', alignItems:'center', gap:'.25rem', fontSize:'.62rem', fontWeight:600, color:'#2e2e48', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'5px', padding:'.1rem .38rem' },
  input:     { padding:'.7rem .95rem', background:'#08080f', border:'1px solid', borderRadius:'10px', color:'#f0f0f8', fontSize:'.88rem', outline:'none', width:'100%', fontFamily:'inherit', transition:'border-color .15s, box-shadow .15s', boxSizing:'border-box' },
  saveBtn:   { alignSelf:'flex-start', display:'inline-flex', alignItems:'center', gap:'.4rem', padding:'.68rem 1.45rem', background:'linear-gradient(135deg,#5535e0,#7c5cff)', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'.85rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 18px rgba(108,71,255,.3)', transition:'filter .15s, transform .12s, opacity .15s' },
  spinner:   { width:'11px', height:'11px', border:'2px solid rgba(255,255,255,.2)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin .6s linear infinite', flexShrink:0 },
};
