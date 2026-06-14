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
    features: ['200 credits / month','TikTok Ads — limited','3 saved collections','Basic search filters','Standard support','Web access'],
  },
  {
    id: 'pro', name: 'Pro', price: '$29', period: '/ month',
    color: '#7c5cff', border: 'rgba(124,92,255,.4)', glow: '0 0 40px rgba(108,71,255,.12)',
    badge: 'Most Popular',
    features: ['Unlimited credits','TikTok + Facebook + Instagram','Unlimited collections','Advanced filters','Priority support'],
    cta: 'Upgrade to Pro', ctaBg: 'linear-gradient(135deg,#5535e0,#7c5cff)', ctaShadow: '0 6px 20px rgba(108,71,255,.35)',
  },
  {
    id: 'elite', name: 'Elite', price: '$79', period: '/ month',
    color: '#f5a623', border: 'rgba(245,166,35,.35)', glow: '0 0 40px rgba(245,166,35,.1)',
    badge: 'Best Value',
    features: ['Everything in Pro','Team access — 5 seats','API access','Custom exports','Dedicated manager','White-label reports'],
    cta: 'Get Elite', ctaBg: 'linear-gradient(135deg,#c47d0a,#f5a623)', ctaShadow: '0 6px 20px rgba(245,166,35,.28)',
  },
];

const PLAN_META = {
  free:  { label: 'Free',  color: '#6e6e8a' },
  pro:   { label: 'Pro',   color: '#7c5cff' },
  elite: { label: 'Elite', color: '#f5a623' },
};

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

  /* ── Credits calc ── */
  const fLimit     = usage?.creditsLimit     || 200;
  const fRemaining = usage?.creditsRemaining ?? fLimit;
  const fUsed      = fLimit - fRemaining;
  const fPct       = Math.min(100, Math.round((fUsed / fLimit) * 100));
  const fClr       = fPct >= 80 ? '#ff4f87' : fPct >= 50 ? '#ffb700' : '#4caf7d';

  return (
    <div style={{ minHeight:'100vh', background:'#08080f' }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes rise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .pf-back:hover  { background:rgba(255,255,255,.07) !important; border-color:rgba(255,255,255,.15) !important; }
        .pf-tab:hover   { color:#c0c0e0 !important; }
        .pf-card:hover  { transform:translateY(-2px) !important; box-shadow:0 8px 32px rgba(0,0,0,.4) !important; }
        .pf-cta:hover   { filter:brightness(1.1); transform:translateY(-1px); }
        .pf-save:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .pf-sidenav-item:hover { background:rgba(255,255,255,.05) !important; color:#c0c0e0 !important; }

        /* ── Mobile (default) ── */
        .pf-outer    { padding:68px 1rem 5rem; max-width:520px; margin:0 auto; }
        .pf-layout   { display:block; }
        .pf-sidebar  { display:none; }
        .pf-main     { width:100%; }
        .pf-idcard   { padding:.9rem 1.1rem; }
        .pf-tabs     { display:flex; gap:.5rem; margin-bottom:1.5rem; }
        .pf-tab      { flex:1; text-align:center; }
        .pf-plancard { padding:1.15rem; }
        .pf-feats    { grid-template-columns:1fr 1fr; }
        .pf-back     { display:inline-flex; }

        /* ── Tablet 640px+ ── */
        @media(min-width:640px) {
          .pf-outer  { max-width:680px; padding:72px 1.5rem 5rem; }
          .pf-feats  { grid-template-columns:1fr 1fr; }
        }

        /* ── Desktop 900px+ ── */
        @media(min-width:900px) {
          .pf-outer   { max-width:1080px; padding:80px 2rem 5rem; }
          .pf-layout  { display:grid; grid-template-columns:240px 1fr; gap:2rem; align-items:start; }
          .pf-sidebar { display:flex; flex-direction:column; gap:.5rem; position:sticky; top:88px; }
          .pf-tabs    { display:none; }
          .pf-back    { margin-bottom:1.5rem; }
          .pf-idcard  { padding:1.1rem 1.25rem; }
          .pf-feats   { grid-template-columns:1fr 1fr 1fr; }
          .pf-plancard { padding:1.4rem; }
          .pf-plan-grid { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:1rem !important; }
        }

        /* ── Large desktop 1200px+ ── */
        @media(min-width:1200px) {
          .pf-outer { max-width:1200px; }
        }

        /* ── Small mobile ── */
        @media(max-width:400px) {
          .pf-feats  { grid-template-columns:1fr !important; }
          .pf-savebtn { width:100% !important; justify-content:center !important; }
        }
      `}</style>
      <Navbar />

      <div className="pf-outer">

        {/* Back */}
        <button className="pf-back" onClick={() => navigate(-1)} style={c.back}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 11.5L4 7l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        {/* Desktop: sidebar + main | Mobile: stacked */}
        <div className="pf-layout">

          {/* ── SIDEBAR (desktop only) ── */}
          <aside className="pf-sidebar">

            {/* Identity card */}
            <div className="pf-idcard" style={c.idCard}>
              <div style={{ ...c.idAvatar, boxShadow:`0 0 0 2px #08080f, 0 0 0 3px ${pm.color}55` }}>
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

            {/* Credits mini card — desktop sidebar */}
            <div style={c.sideCredits}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                <span style={c.sideCreditsLabel}>Credits</span>
                <span style={{ fontSize:'.82rem', fontWeight:800, color:fClr, fontVariantNumeric:'tabular-nums' }}>
                  {fRemaining}<span style={{ color:'#3a3a52', fontWeight:500 }}>/{fLimit}</span>
                </span>
              </div>
              <div style={c.sideBar}>
                <div style={{ height:'100%', width:`${fPct}%`, background:`linear-gradient(90deg,${fClr}70,${fClr})`, borderRadius:'3px', transition:'width .6s ease' }} />
              </div>
              <div style={{ fontSize:'.65rem', color:'#3a3a52', marginTop:'.35rem' }}>{fUsed} used this month</div>
            </div>

            {/* Sidebar nav */}
            <nav style={{ display:'flex', flexDirection:'column', gap:'.25rem', marginTop:'.25rem' }}>
              {[
                { id:'plans', label:'Plans & Billing', icon:(
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5h12" stroke="currentColor" strokeWidth="1.3"/><path d="M4 8.5h3M4 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                )},
                { id:'profile', label:'My Profile', icon:(
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                )},
              ].map(item => {
                const on = tab === item.id;
                return (
                  <button key={item.id} className="pf-sidenav-item" onClick={() => setTab(item.id)} style={{
                    display:'flex', alignItems:'center', gap:'.6rem',
                    padding:'.6rem .75rem', borderRadius:'10px', border:'none',
                    background: on ? `${pm.color}14` : 'transparent',
                    color: on ? pm.color : '#4a4a66',
                    fontWeight: on ? 700 : 500,
                    fontSize:'.84rem', cursor:'pointer', fontFamily:'inherit',
                    textAlign:'left', transition:'background .15s, color .15s',
                    boxShadow: on ? `inset 2px 0 0 ${pm.color}` : 'none',
                  }}>
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="pf-main">

            {/* Identity card — mobile only (hidden on desktop via sidebar) */}
            <div className="pf-idcard pf-mobile-id" style={{ ...c.idCard, marginBottom:'1rem' }}>
              <div style={{ ...c.idAvatar, boxShadow:`0 0 0 2px #08080f, 0 0 0 3px ${pm.color}55` }}>
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

            {/* Tabs — mobile only */}
            <div className="pf-tabs" style={c.tabs}>
              {[{ id:'plans', label:'Plans & Billing' }, { id:'profile', label:'My Profile' }].map(t => {
                const on = tab === t.id;
                return (
                  <button key={t.id} className="pf-tab" onClick={() => setTab(t.id)} style={{
                    ...c.tab,
                    background:  on ? '#14142a' : 'transparent',
                    color:       on ? '#e0e0f8' : '#3e3e5a',
                    fontWeight:  on ? 700 : 500,
                    borderColor: on ? 'rgba(124,92,255,.4)' : 'rgba(255,255,255,.06)',
                    boxShadow:   on ? '0 0 20px rgba(108,71,255,.1)' : 'none',
                  }}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* ── PLANS ── */}
            {tab === 'plans' && (
              <div style={{ animation:'rise .2s ease' }}>
                <div style={c.eyebrow}>Choose a plan</div>

                <div className="pf-plan-grid" style={c.planStack}>
                  {PLANS.map(plan => {
                    const active = currentPlan === plan.id;
                    const pLimit     = plan.id === 'free' ? fLimit : null;
                    const pRemaining = plan.id === 'free' ? fRemaining : null;
                    const pPct       = plan.id === 'free' ? fPct : null;
                    const pClr       = plan.id === 'free' ? fClr : null;

                    return (
                      <div key={plan.id} className="pf-card pf-plancard" style={{
                        ...c.planCard,
                        borderColor: active ? plan.border : 'rgba(255,255,255,.06)',
                        boxShadow:   active ? plan.glow   : 'none',
                        background:  active
                          ? `linear-gradient(155deg,${plan.color}0d 0%,#0d0d1e 60%)`
                          : '#0d0d1e',
                      }}>
                        {active && <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:'1px', background:`linear-gradient(90deg,transparent,${plan.color}70,transparent)` }} />}
                        {active && <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:'2.5px', background:`linear-gradient(180deg,transparent,${plan.color}bb,transparent)`, borderRadius:'0 3px 3px 0' }} />}

                        {/* Header */}
                        <div style={c.planHeader}>
                          <div style={{ display:'flex', alignItems:'center', gap:'.45rem', flexWrap:'wrap' }}>
                            <span style={{ ...c.planName, color: active ? plan.color : '#c8c8e0' }}>{plan.name}</span>
                            {plan.badge && (
                              <span style={{ fontSize:'.57rem', fontWeight:700, padding:'.15rem .48rem', borderRadius:'99px', border:`1px solid ${plan.color}45`, color:plan.color, background:plan.color+'12', textTransform:'uppercase', letterSpacing:'.04em' }}>
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ display:'flex', alignItems:'baseline', gap:'.18rem', flexShrink:0 }}>
                            <span style={{ fontSize:'1.5rem', fontWeight:900, letterSpacing:'-.04em', color: active ? plan.color : '#e0e0f0' }}>{plan.price}</span>
                            <span style={{ fontSize:'.67rem', color:'#3e3e5a' }}>{plan.period}</span>
                          </div>
                        </div>

                        <div style={c.divLine} />

                        {/* Features */}
                        <div className="pf-feats" style={c.feats}>
                          {plan.features.map(f => (
                            <div key={f} style={c.featItem}>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink:0 }}>
                                <circle cx="6.5" cy="6.5" r="6" fill={plan.color+'18'} stroke={plan.color+'35'} strokeWidth=".5"/>
                                <path d="M4 6.5l2 2L9 4.5" stroke={plan.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Credits bar — free only */}
                        {plan.id === 'free' && (
                          <div style={c.usageBox}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.4rem' }}>
                              <span style={c.usageLabel}>Credits used</span>
                              <span style={{ fontSize:'.76rem', fontWeight:800, color:pClr, fontVariantNumeric:'tabular-nums' }}>
                                {pRemaining}<span style={{ color:'#3a3a52', fontWeight:500 }}> / {pLimit}</span>
                              </span>
                            </div>
                            <div style={c.usageTrack}>
                              <div style={{ height:'100%', width:`${pPct}%`, background:`linear-gradient(90deg,${pClr}80,${pClr})`, borderRadius:'4px', transition:'width .6s ease' }} />
                            </div>
                            {fRemaining <= 20 && (
                              <div style={{ fontSize:'.64rem', color:'#ff4f87', fontWeight:600, marginTop:'.3rem', display:'flex', alignItems:'center', gap:'.25rem' }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9.5 9H.5L5 1z" stroke="#ff4f87" strokeWidth="1.1" strokeLinejoin="round"/><path d="M5 4v2" stroke="#ff4f87" strokeWidth="1.1" strokeLinecap="round"/></svg>
                                {fRemaining <= 0 ? 'Credits khatam ho gaye!' : 'Credits khatam hone wale hain!'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        {active ? (
                          <div style={{ ...c.activeCta, color:plan.color, borderColor:plan.color+'28', background:plan.color+'0d' }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Current plan
                          </div>
                        ) : (
                          <button className="pf-cta" style={{ ...c.cta, background:plan.ctaBg, boxShadow:plan.ctaShadow }}>
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

            {/* ── PROFILE ── */}
            {tab === 'profile' && (
              <div style={{ animation:'rise .2s ease' }}>
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
                        <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><rect x="1" y="4.5" width="7" height="5" rx="1.2" stroke="#3e3e5a" strokeWidth="1"/><path d="M2.5 4.5V3a2 2 0 014 0v1.5" stroke="#3e3e5a" strokeWidth="1"/></svg>
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

      {/* Hide mobile id card on desktop */}
      <style>{`
        @media(min-width:900px) {
          .pf-mobile-id { display:none !important; }
        }
      `}</style>
    </div>
  );
}

const c = {
  back: { display:'inline-flex', alignItems:'center', gap:'.38rem', padding:'.4rem .8rem .4rem .6rem', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'9px', cursor:'pointer', color:'#4e4e6a', fontSize:'.78rem', fontWeight:600, fontFamily:'inherit', marginBottom:'1.2rem', transition:'background .15s, border-color .15s' },

  idCard:  { display:'flex', alignItems:'center', gap:'.9rem', padding:'.9rem 1.1rem', background:'#0d0d1e', border:'1px solid rgba(255,255,255,.07)', borderRadius:'16px', overflow:'hidden', position:'relative' },
  idAvatar:{ width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#3a20b8,#7c5cff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.1rem', flexShrink:0 },
  idBody:  { flex:1, minWidth:0 },
  idName:  { fontSize:'.9rem', fontWeight:700, color:'#ededf8', letterSpacing:'-.015em' },
  idEmail: { fontSize:'.72rem', color:'#3e3e5a', marginTop:'.1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  idBadge: { flexShrink:0, fontSize:'.65rem', fontWeight:700, padding:'.22rem .65rem', borderRadius:'99px', border:'1px solid', letterSpacing:'.025em' },

  /* Sidebar credits */
  sideCredits:      { background:'#0d0d1e', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px', padding:'.85rem 1rem' },
  sideCreditsLabel: { fontSize:'.6rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  sideBar:          { height:'4px', background:'rgba(255,255,255,.06)', borderRadius:'3px', overflow:'hidden' },

  tabs: { marginBottom:'1.5rem' },
  tab:  { padding:'.5rem 1rem', borderRadius:'10px', border:'1px solid', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit', letterSpacing:'-.01em', transition:'background .15s, color .15s, border-color .15s, box-shadow .15s' },

  eyebrow: { fontSize:'.62rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.85rem' },

  planStack:  { display:'flex', flexDirection:'column', gap:'.6rem' },
  planCard:   { padding:'1.15rem', border:'1px solid', borderRadius:'18px', display:'flex', flexDirection:'column', gap:'.8rem', position:'relative', overflow:'hidden', transition:'transform .2s, box-shadow .2s' },
  planHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  planName:   { fontSize:'.98rem', fontWeight:800, letterSpacing:'-.02em', transition:'color .2s' },
  divLine:    { height:'1px', background:'rgba(255,255,255,.05)' },

  feats:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.35rem .6rem' },
  featItem: { display:'flex', alignItems:'center', gap:'.35rem', fontSize:'.73rem', color:'#6a6a8a', lineHeight:1.35 },

  usageBox:   { background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'10px', padding:'.6rem .65rem' },
  usageLabel: { fontSize:'.6rem', fontWeight:700, color:'#3e3e5a', textTransform:'uppercase', letterSpacing:'.07em' },
  usageTrack: { height:'4px', background:'rgba(255,255,255,.06)', borderRadius:'4px', overflow:'hidden' },

  activeCta: { display:'flex', alignItems:'center', justifyContent:'center', gap:'.38rem', padding:'.68rem', borderRadius:'11px', border:'1px solid', fontSize:'.81rem', fontWeight:600, letterSpacing:'-.01em' },
  cta:       { width:'100%', padding:'.72rem', border:'none', borderRadius:'11px', color:'#fff', fontWeight:700, fontSize:'.86rem', cursor:'pointer', fontFamily:'inherit', letterSpacing:'-.01em', transition:'filter .15s, transform .12s' },

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
