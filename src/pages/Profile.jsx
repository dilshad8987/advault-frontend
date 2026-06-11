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
    accentColor: '#4a5568',
    glowColor: 'rgba(74,85,104,0)',
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
    accentColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.25)',
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
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79',
    period: '/ month',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.2)',
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
  },
];

const PLAN_MAP = {
  free:  { label: 'Free',  color: '#4a5568',  bg: 'rgba(74,85,104,0.15)'  },
  pro:   { label: 'Pro',   color: '#a855f7',  bg: 'rgba(168,85,247,0.15)' },
  elite: { label: 'Elite', color: '#f59e0b',  bg: 'rgba(245,158,11,0.15)' },
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPlan = user.plan || 'free';
  const pm          = PLAN_MAP[currentPlan] || PLAN_MAP.free;

  const [tab,      setTab]    = useState('plans');
  const [name,     setName]   = useState(user.name || '');
  const [saving,   setSaving] = useState(false);
  const [nameFocus, setNF]    = useState(false);

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

  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#050912', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes avatarRing {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }

        .pf-back:hover  { background: rgba(15,244,198,0.08) !important; border-color: rgba(15,244,198,0.3) !important; }
        .pf-tab-btn:hover { color: #e2e8f0 !important; }
        .pf-plan-card { transition: transform .25s, box-shadow .25s; }
        .pf-plan-card:hover { transform: translateY(-3px); }
        .pf-cta-btn { transition: filter .15s, transform .1s; }
        .pf-cta-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .pf-save-btn { transition: opacity .15s, transform .1s; }
        .pf-save-btn:hover { opacity: .9 !important; transform: translateY(-1px); }
        .pf-info-row:hover { background: rgba(255,255,255,.03) !important; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
      `}</style>

      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        position:   'relative',
        height:     '180px',
        overflow:   'hidden',
        marginTop:  '60px',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1730 40%, #120a24 100%)',
      }}>
        {/* Mesh grid */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.12 }} preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0ff4c6" strokeWidth=".5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-40px', left:'20%', width:'200px', height:'200px', background:'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', top:'-20px', right:'15%', width:'160px', height:'160px', background:'radial-gradient(circle, rgba(15,244,198,0.12) 0%, transparent 70%)', borderRadius:'50%' }}/>
        {/* Bottom fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to bottom, transparent, #050912)' }}/>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 1rem 4rem', marginTop: '-64px', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <button className="pf-back" onClick={() => navigate(-1)} style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '.4rem',
          padding:        '.4rem .85rem',
          background:     'rgba(255,255,255,.04)',
          border:         '1px solid rgba(255,255,255,.1)',
          borderRadius:   '8px',
          color:          '#6b7280',
          fontSize:       '.78rem',
          fontWeight:     600,
          cursor:         'pointer',
          marginBottom:   '1.25rem',
          transition:     'all .15s',
          letterSpacing:  '.01em',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* ── LEFT: Identity Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Avatar Card */}
            <div style={{
              background:   'rgba(255,255,255,.03)',
              border:       '1px solid rgba(255,255,255,.07)',
              borderRadius: '20px',
              padding:      '1.75rem 1.25rem',
              display:      'flex',
              flexDirection:'column',
              alignItems:   'center',
              textAlign:    'center',
              gap:          '.75rem',
              backdropFilter: 'blur(12px)',
            }}>
              {/* Avatar with spinning ring */}
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '.25rem' }}>
                {/* Spinning gradient ring */}
                <div style={{
                  position:     'absolute',
                  inset:        '-3px',
                  borderRadius: '50%',
                  background:   `conic-gradient(${pm.color}, transparent 60%, ${pm.color})`,
                  animation:    'avatarRing 3s linear infinite',
                  opacity:      0.7,
                }}/>
                {/* White mask ring to create gap */}
                <div style={{
                  position:     'absolute',
                  inset:        '-1px',
                  borderRadius: '50%',
                  background:   '#050912',
                }}/>
                {/* Avatar */}
                <div style={{
                  position:       'absolute',
                  inset:          '2px',
                  borderRadius:   '50%',
                  background:     `linear-gradient(135deg, ${pm.color}40, ${pm.color}80)`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '1.5rem',
                  fontWeight:     900,
                  color:          '#fff',
                  letterSpacing:  '-.02em',
                }}>
                  {initials}
                </div>
              </div>

              {/* Name */}
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.02em', lineHeight: 1.2 }}>
                {user.name || 'User'}
              </div>

              {/* Email */}
              <div style={{ fontSize: '.75rem', color: '#4b5563', wordBreak: 'break-all', lineHeight: 1.4 }}>
                {user.email}
              </div>

              {/* Plan badge */}
              <div style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '.35rem',
                padding:      '.3rem .85rem',
                borderRadius: '999px',
                background:   pm.bg,
                border:       `1px solid ${pm.color}40`,
                color:        pm.color,
                fontSize:     '.72rem',
                fontWeight:   700,
                letterSpacing:'.04em',
                textTransform:'uppercase',
              }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background: pm.color, display:'inline-block', animation: 'pulse 2s ease infinite' }}/>
                {pm.label} Plan
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              background:    'rgba(255,255,255,.025)',
              border:        '1px solid rgba(255,255,255,.06)',
              borderRadius:  '16px',
              overflow:      'hidden',
            }}>
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#0ff4c6" strokeWidth="1.5"/>
                      <path d="M12 6v6l4 2" stroke="#0ff4c6" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  label: 'Member Since',
                  value: user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                    : '—',
                  mono: true,
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  label: 'Credits Used',
                  value: '—',
                  mono: true,
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#f59e0b" strokeWidth="1.5"/>
                      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#f59e0b" strokeWidth="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#f59e0b" strokeWidth="1.5"/>
                      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#f59e0b" strokeWidth="1.5"/>
                    </svg>
                  ),
                  label: 'Saved Collections',
                  value: '—',
                  mono: true,
                },
              ].map((stat, i) => (
                <div key={i} className="pf-info-row" style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '.85rem',
                  padding:       '.85rem 1rem',
                  borderBottom:  i < 2 ? '1px solid rgba(255,255,255,.045)' : 'none',
                  transition:    'background .15s',
                }}>
                  <div style={{
                    width:          '30px',
                    height:         '30px',
                    borderRadius:   '8px',
                    background:     'rgba(255,255,255,.04)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.63rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, marginBottom: '.1rem' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#cbd5e1', fontFamily: stat.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT: Tabs + Content ── */}
          <div>

            {/* Tab Row */}
            <div style={{
              display:      'flex',
              gap:          '.25rem',
              background:   'rgba(255,255,255,.03)',
              border:       '1px solid rgba(255,255,255,.07)',
              borderRadius: '12px',
              padding:      '.3rem',
              marginBottom: '1.25rem',
            }}>
              {[
                { id: 'plans',   label: 'Plans & Billing', icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { id: 'profile', label: 'My Account', icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )},
              ].map(t => {
                const on = tab === t.id;
                return (
                  <button key={t.id} className="pf-tab-btn" onClick={() => setTab(t.id)} style={{
                    flex:          1,
                    display:       'flex',
                    alignItems:    'center',
                    justifyContent:'center',
                    gap:           '.4rem',
                    padding:       '.6rem 1rem',
                    borderRadius:  '9px',
                    border:        'none',
                    background:    on ? 'rgba(255,255,255,.07)' : 'transparent',
                    color:         on ? '#e2e8f0' : '#4b5563',
                    fontWeight:    on ? 700 : 500,
                    fontSize:      '.82rem',
                    cursor:        'pointer',
                    fontFamily:    'inherit',
                    letterSpacing: '-.01em',
                    transition:    'all .15s',
                    boxShadow:     on ? '0 1px 3px rgba(0,0,0,.4)' : 'none',
                  }}>
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* ════ PLANS TAB ════ */}
            {tab === 'plans' && (
              <div style={{ animation: 'fadeUp .25s ease' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {PLANS.map(plan => {
                    const active = currentPlan === plan.id;
                    return (
                      <div key={plan.id} className="pf-plan-card" style={{
                        background:    active
                          ? `linear-gradient(135deg, rgba(${plan.id==='pro'?'168,85,247':plan.id==='elite'?'245,158,11':'74,85,104'},.08) 0%, rgba(5,9,18,.9) 100%)`
                          : 'rgba(255,255,255,.025)',
                        border:        `1px solid ${active ? plan.accentColor + '45' : 'rgba(255,255,255,.065)'}`,
                        borderRadius:  '18px',
                        padding:       '1.2rem 1.35rem',
                        boxShadow:     active ? `0 0 30px ${plan.glowColor}, inset 0 1px 0 ${plan.accentColor}20` : 'none',
                        position:      'relative',
                        overflow:      'hidden',
                      }}>

                        {/* Active plan top stripe */}
                        {active && (
                          <div style={{
                            position:  'absolute',
                            top:       0,
                            left:      '10%',
                            right:     '10%',
                            height:    '1px',
                            background:`linear-gradient(90deg, transparent, ${plan.accentColor}, transparent)`,
                          }}/>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.9rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: active ? plan.accentColor : '#94a3b8', letterSpacing: '-.02em' }}>
                                {plan.name}
                              </span>
                              {plan.badge && (
                                <span style={{
                                  fontSize:     '.6rem',
                                  fontWeight:   700,
                                  padding:      '.18rem .55rem',
                                  borderRadius: '999px',
                                  background:   plan.accentColor + '18',
                                  border:       `1px solid ${plan.accentColor}40`,
                                  color:        plan.accentColor,
                                  letterSpacing:'.04em',
                                  textTransform:'uppercase',
                                }}>
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem .75rem' }}>
                              {plan.features.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.73rem', color: '#6b7280' }}>
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
                                    <circle cx="5" cy="5" r="4.5" fill={plan.accentColor + '15'} stroke={plan.accentColor + '30'} strokeWidth=".5"/>
                                    <path d="M3 5l1.5 1.5L7 3.5" stroke={plan.accentColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {f}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Price + CTA column */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.6rem', flexShrink: 0, marginLeft: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: active ? plan.accentColor : '#e2e8f0', letterSpacing: '-.04em', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                                {plan.price}
                              </div>
                              <div style={{ fontSize: '.65rem', color: '#4b5563', marginTop: '.15rem' }}>
                                {plan.period}
                              </div>
                            </div>

                            {active ? (
                              <div style={{
                                display:       'flex',
                                alignItems:    'center',
                                gap:           '.3rem',
                                padding:       '.45rem .85rem',
                                borderRadius:  '8px',
                                background:    'rgba(255,255,255,.04)',
                                border:        '1px solid rgba(255,255,255,.08)',
                                color:         plan.accentColor,
                                fontSize:      '.72rem',
                                fontWeight:    700,
                                whiteSpace:    'nowrap',
                              }}>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                  <path d="M2.5 5.5l2 2 4-4" stroke={plan.accentColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Current Plan
                              </div>
                            ) : (
                              <button className="pf-cta-btn" style={{
                                padding:       '.5rem 1.15rem',
                                borderRadius:  '9px',
                                border:        'none',
                                background:    `linear-gradient(135deg, ${plan.accentColor}cc, ${plan.accentColor})`,
                                color:         '#fff',
                                fontWeight:    700,
                                fontSize:      '.78rem',
                                cursor:        'pointer',
                                fontFamily:    'inherit',
                                letterSpacing: '-.01em',
                                whiteSpace:    'nowrap',
                                boxShadow:     `0 4px 16px ${plan.glowColor}`,
                              }}>
                                {plan.cta}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '.7rem', marginTop: '1.25rem', letterSpacing: '.01em' }}>
                  Billed monthly · Secure checkout via Stripe
                </p>
              </div>
            )}

            {/* ════ PROFILE TAB ════ */}
            {tab === 'profile' && (
              <div style={{ animation: 'fadeUp .25s ease', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Edit Profile Form */}
                <div style={{
                  background:    'rgba(255,255,255,.025)',
                  border:        '1px solid rgba(255,255,255,.07)',
                  borderRadius:  '18px',
                  padding:       '1.5rem',
                  display:       'flex',
                  flexDirection: 'column',
                  gap:           '1.25rem',
                }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '.92rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-.02em' }}>
                        Edit Profile
                      </div>
                      <div style={{ fontSize: '.73rem', color: '#4b5563', marginTop: '.2rem' }}>
                        Update your display name
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,.06)' }}/>

                  {/* Name Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    <label style={{ fontSize: '.67rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      Display Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position:  'absolute',
                        left:      '.9rem',
                        top:       '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke={nameFocus ? '#0ff4c6' : '#374151'} strokeWidth="1.5"/>
                          <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={nameFocus ? '#0ff4c6' : '#374151'} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <input
                        style={{
                          width:         '100%',
                          padding:       '.72rem .9rem .72rem 2.4rem',
                          background:    '#050912',
                          border:        `1px solid ${nameFocus ? '#0ff4c620' : 'rgba(255,255,255,.09)'}`,
                          borderRadius:  '11px',
                          color:         '#f1f5f9',
                          fontSize:      '.88rem',
                          outline:       'none',
                          fontFamily:    'inherit',
                          transition:    'border-color .15s, box-shadow .15s',
                          boxShadow:     nameFocus ? '0 0 0 3px rgba(15,244,198,.08)' : 'none',
                          boxSizing:     'border-box',
                        }}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your display name"
                        onFocus={() => setNF(true)}
                        onBlur={() => setNF(false)}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '.67rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        Email Address
                      </label>
                      <span style={{
                        display:      'inline-flex',
                        alignItems:   'center',
                        gap:          '.28rem',
                        fontSize:     '.62rem',
                        fontWeight:   600,
                        color:        '#374151',
                        background:   'rgba(255,255,255,.03)',
                        border:       '1px solid rgba(255,255,255,.06)',
                        borderRadius: '6px',
                        padding:      '.15rem .45rem',
                      }}>
                        <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                          <rect x="0.5" y="3.5" width="7" height="5" rx="1.2" stroke="#374151" strokeWidth="1"/>
                          <path d="M2 3.5V2.5a2 2 0 014 0v1" stroke="#374151" strokeWidth="1"/>
                        </svg>
                        Cannot be changed
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#1f2937" strokeWidth="1.5"/>
                          <path d="M22 6l-10 7L2 6" stroke="#1f2937" strokeWidth="1.5"/>
                        </svg>
                      </div>
                      <input
                        style={{
                          width:       '100%',
                          padding:     '.72rem .9rem .72rem 2.4rem',
                          background:  'rgba(255,255,255,.02)',
                          border:      '1px solid rgba(255,255,255,.05)',
                          borderRadius:'11px',
                          color:       '#374151',
                          fontSize:    '.88rem',
                          outline:     'none',
                          fontFamily:  'inherit',
                          cursor:      'not-allowed',
                          boxSizing:   'border-box',
                        }}
                        value={user.email || ''}
                        disabled
                      />
                    </div>
                  </div>

                  <button
                    className="pf-save-btn"
                    style={{
                      alignSelf:     'flex-start',
                      display:       'inline-flex',
                      alignItems:    'center',
                      gap:           '.4rem',
                      padding:       '.65rem 1.5rem',
                      background:    'linear-gradient(135deg, #0cc9a8, #0ff4c6)',
                      color:         '#050912',
                      border:        'none',
                      borderRadius:  '10px',
                      fontWeight:    800,
                      fontSize:      '.82rem',
                      cursor:        saving ? 'not-allowed' : 'pointer',
                      fontFamily:    'inherit',
                      letterSpacing: '-.01em',
                      opacity:       saving ? .6 : 1,
                      boxShadow:     '0 4px 18px rgba(15,244,198,.25)',
                    }}
                    onClick={saveName}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span style={{
                          width:          '11px',
                          height:         '11px',
                          border:         '2px solid rgba(5,9,18,.3)',
                          borderTopColor: '#050912',
                          borderRadius:   '50%',
                          animation:      'spin .6s linear infinite',
                          flexShrink:     0,
                          display:        'inline-block',
                        }}/>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {/* Danger Zone */}
                <div style={{
                  background:    'rgba(239,68,68,.04)',
                  border:        '1px solid rgba(239,68,68,.15)',
                  borderRadius:  '18px',
                  padding:       '1.25rem 1.5rem',
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'space-between',
                  gap:           '1rem',
                }}>
                  <div>
                    <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#ef4444', letterSpacing: '-.01em', marginBottom: '.2rem' }}>
                      Delete Account
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#4b5563', lineHeight: 1.5 }}>
                      Permanently remove your account and all data. This cannot be undone.
                    </div>
                  </div>
                  <button style={{
                    padding:       '.5rem 1.1rem',
                    background:    'transparent',
                    border:        '1px solid rgba(239,68,68,.35)',
                    borderRadius:  '9px',
                    color:         '#ef4444',
                    fontSize:      '.75rem',
                    fontWeight:    700,
                    cursor:        'pointer',
                    fontFamily:    'inherit',
                    whiteSpace:    'nowrap',
                    flexShrink:    0,
                  }}>
                    Delete
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
