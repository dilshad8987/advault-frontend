import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import api from '../api/axios';

const cacheKey = (tab, country, period, orderBy) =>
  `dashboard_cache_${tab}_${country}_${period}_${orderBy}`;

function TikTokSVG({ active }) {
  return (
    <svg width="14" height="16" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/>
    </svg>
  );
}

function MetaSVG({ active }) {
  return (
    <svg width="26" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mg" x1="0" y1="8" x2="16" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={active ? "#0082FB" : "#555"} />
          <stop offset="100%" stopColor={active ? "#0040C4" : "#444"} />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" fill="url(#mg)" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3C13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973C0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407c.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954c1.723 0 3.102 2.537 3.102 5.653c0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9c0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018"/>
    </svg>
  );
}

const MAIN_TABS = [
  {
    id: 'tiktok',
    label: 'TikTok',
    logo: (on) => <TikTokSVG active={on} />,
    activeBg:     'rgba(255,255,255,.05)',
    activeBorder: 'rgba(255,255,255,.25)',
    activeColor:  '#fff',
    activeShadow: 'none',
  },
  {
    id: 'meta',
    label: 'Meta',
    logo: (on) => <MetaSVG active={on} />,
    activeBg:     'rgba(24,119,242,.08)',
    activeBorder: '#1877F2',
    activeColor:  '#5aabff',
    activeShadow: '0 0 12px rgba(24,119,242,.18)',
  },
];

export default function Dashboard() {
  const [ads, setAds]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState(() => sessionStorage.getItem('dash_tab') || 'tiktok');
  const [country, setCountry]   = useState(() => sessionStorage.getItem('dash_country') || 'US');
  const [period, setPeriod]     = useState(() => sessionStorage.getItem('dash_period') || '7');
  const [orderBy, setOrderBy]   = useState(() => sessionStorage.getItem('dash_orderBy') || 'like');
  const [metaKeyword, setMetaKeyword] = useState('product');
  const [metaStatus, setMetaStatus]   = useState('ACTIVE');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [userCredits, setUserCredits] = useState(null);
  useEffect(() => {
    api.get('/user/profile').then(res => {
      const u = res.data?.usage;
      if (u) setUserCredits({ remaining: u.creditsRemaining });
    }).catch(() => {});
  }, []);
  const LOCK_THRESHOLD = 20;
  const noCredits   = userCredits !== null && userCredits.remaining <= 0;
  const lockActive  = userCredits !== null && userCredits.remaining <= LOCK_THRESHOLD;

  const countries = ['US','DE','GB','FR','IT','ES','NL','PL','AT','BE','SE','NO','DK','FI'];
  const periods   = [{ v: '7', l: '7 Days' },{ v: '30', l: '30 Days' },{ v: '90', l: '90 Days' },{ v: '180', l: '180 Days' }];
  const orders    = [{ v: 'impression', l: '👁 Impressions' },{ v: 'like', l: '❤️ Likes' },{ v: 'ctr', l: '📊 CTR' }];

  useEffect(() => { sessionStorage.setItem('dash_tab', tab); }, [tab]);
  useEffect(() => { sessionStorage.setItem('dash_country', country); }, [country]);
  useEffect(() => { sessionStorage.setItem('dash_period', period); }, [period]);
  useEffect(() => { sessionStorage.setItem('dash_orderBy', orderBy); }, [orderBy]);

  const fetchAds = useCallback(async () => {
    const key = cacheKey(tab, country, period, orderBy);
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try { setAds(JSON.parse(cached)); setLoading(false); return; } catch {}
    }

    setLoading(true); setAds([]);
    try {
      if (tab === 'tiktok') {
        const res = await api.get('/ads/tiktok', { params: { country, period, order: orderBy } });
        const d = res.data;
        // Backend returns: { success, data: { materials: [...] } }
        const raw = d?.data?.materials || d?.data?.list || d?.data?.ad_list ||
          (Array.isArray(d?.data) ? d.data : null) ||
          d?.materials || d?.list || [];
        const allAds = Array.isArray(raw) ? raw : [];

        const NON_OBJ = ['app_install','app_promotion','reach','brand_awareness','lead_generation','video_views','traffic','messages'];
        const NON_IND = ['music','concert','event','gaming','game','entertainment','news','media','political','religion','education','software','finance','insurance','real_estate','recruitment','ngo'];
        const NON_KW  = ['concert','tour','ticket','event','festival','live show','album','stream now','download app','install','sign up','apply now','vote','donate','webinar','seminar','course','slots','casino','betting','loan','insurance','mortgage'];

        const result = allAds.filter(ad => {
          const obj = (ad.objective_key||'').toLowerCase();
          const ind = (ad.industry_key||'').toLowerCase();
          const ttl = (ad.ad_title||ad.title||'').toLowerCase();
          if (NON_OBJ.some(o => obj.includes(o))) return false;
          if (NON_IND.some(i => ind.includes(i))) return false;
          if (NON_KW.some(k => ttl.includes(k))) return false;
          return true;
        });
        setAds(result);
        sessionStorage.setItem(key, JSON.stringify(result));

      } else if (tab === 'meta') {
        const res = await api.get('/ads/meta', { params: { keyword: metaKeyword, country: 'ALL', activeStatus: metaStatus } });
        const raw = res.data?.data;
        const normalized = Array.isArray(raw) ? raw : [];
        // ✅ Duplicate remove — library_id se dedup
        const deduped = [...new Map(normalized.map(ad => [
          ad._raw?.library_id || ad.id || Math.random(), ad
        ])).values()];
        setAds(deduped);
        sessionStorage.setItem(key, JSON.stringify(deduped));
        // ✅ Credits update karo (backend ne deduct kiya)
        if (res.data?.creditsRemaining !== undefined) {
          setUserCredits(prev => ({ ...prev, remaining: res.data.creditsRemaining }));
          window.dispatchEvent(new Event('credits-updated'));
        }      }
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.upgrade) {
        setUserCredits(prev => ({ ...prev, remaining: 0 }));
      }
      console.error(err); setAds([]);
    }
    setLoading(false);
  }, [tab, country, period, orderBy, metaKeyword, metaStatus]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar />
      <div style={s.page}>

        <div style={s.hero}>
          <h1 style={s.h1}>Welcome back, <span style={{ color: '#8b6bff' }}>{user.name}</span> 👋</h1>
          <p style={s.sub}>🔥 Last 7 days ke sabse trending product ads</p>
        </div>

        {/* Lock Threshold Banner */}
        {lockActive && !noCredits && (
          <div style={{ ...s.noCreditBanner, background: 'rgba(251,191,36,.07)', borderColor: 'rgba(251,191,36,.25)', color: '#fbbf24' }}>
            <span>⚠️ Sirf {userCredits.remaining} credits bache — ab sirf pahle dekhe hue ads open honge</span>
            <a href="/profile" style={{ ...s.upgradeLink, color: '#fbbf24' }}>Upgrade karo →</a>
          </div>
        )}

        {/* No Credits Banner */}
        {noCredits && (
          <div style={s.noCreditBanner}>
            <span>🔒 Credits khatam ho gaye — sirf pahle dekhe hue ads accessible hain.</span>
            <a href="/profile" style={s.upgradeLink}>Upgrade karo →</a>
          </div>
        )}

        {/* TABS */}
        <div style={s.tabRow}>
          {MAIN_TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  ...s.tab,
                  ...(on ? {
                    background:  t.activeBg,
                    border:      `1.5px solid ${t.activeBorder}`,
                    color:       t.activeColor,
                    boxShadow:   t.activeShadow,
                  } : {})
                }}>
                {t.logo(on)}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TIKTOK FILTERS */}
        {tab === 'tiktok' && (
          <div style={s.filterBar}>
            <div style={s.fg}><label style={s.lbl}>🌍 COUNTRY</label>
              <select style={s.sel} value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.fg}><label style={s.lbl}>📅 PERIOD</label>
              <select style={s.sel} value={period} onChange={e => setPeriod(e.target.value)}>
                {periods.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
            <div style={s.fg}><label style={s.lbl}>📊 SORT BY</label>
              <select style={s.sel} value={orderBy} onChange={e => setOrderBy(e.target.value)}>
                {orders.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* META FILTERS */}
        {tab === 'meta' && (
          <div style={s.filterBar}>
            <div style={s.fg}><label style={s.lbl}>🔍 KEYWORD</label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input style={{ ...s.sel, minWidth: '160px' }}
                  value={metaKeyword} onChange={e => setMetaKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchAds()}
                  placeholder="e.g. product, fashion..."/>
                <button
                  style={{...s.searchBtn,...(noCredits?{opacity:.5,cursor:'not-allowed'}:{})}}
                  onClick={noCredits ? undefined : fetchAds}
                  title={noCredits?'Credits khatam':''}
                >
                  {noCredits ? '🔒' : 'Search'}
                </button>
              </div>
            </div>
            <div style={s.fg}><label style={s.lbl}>📡 STATUS</label>
              <select style={s.sel} value={metaStatus} onChange={e => setMetaStatus(e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="ALL">All</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div style={s.center}>
            <div style={s.spin}/><p style={{ color: '#8888aa', marginTop: '1rem' }}>Load ho raha hai...</p>
          </div>
        ) : ads.length === 0 ? (
          <div style={s.center}>
            <p style={{ fontSize: '2.5rem' }}>📭</p>
            <p style={{ color: '#8888aa' }}>Kuch nahi mila</p>
            <button style={s.retryBtn} onClick={fetchAds}>Dobara try karo</button>
          </div>
        ) : (
          <>
            <div style={s.grid}>
              {/* ✅ Dedup by library_id for meta, id for tiktok */}
              {[...new Map(ads.map((ad,i) => [ad._raw?.library_id || ad.id || i, ad])).values()]
                .map((ad,i) => <AdCard key={ad._raw?.library_id || ad.id || i} ad={ad} platform={tab} />)
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:    { padding: '80px clamp(1rem,4vw,2rem) 3rem' },
  hero:    { marginBottom: '1.75rem' },
  h1:      { fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-.02em' },
  sub:     { color: '#8888aa', marginTop: '.4rem', fontSize: '.9rem' },

  tabRow:  { display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '.55rem 1.2rem',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,.07)',
    background: 'transparent',
    color: '#555',
    fontSize: '.85rem', fontWeight: 700, cursor: 'pointer',
    transition: 'all .18s',
  },

  filterBar: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '1.25rem', background: '#0f0f1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,.07)', marginBottom: '1.5rem' },
  fg:      { display: 'flex', flexDirection: 'column', gap: '.4rem' },
  lbl:     { fontSize: '.72rem', color: '#8888aa', fontWeight: 700, letterSpacing: '.05em' },
  sel:     { padding: '.5rem .9rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.85rem', cursor: 'pointer', outline: 'none' },
  searchBtn: { padding: '.5rem 1.1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem', whiteSpace: 'nowrap' },
  retryBtn:  { padding: '.55rem 1.2rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem', marginTop: '.5rem' },

  count: { color: '#8888aa', fontSize: '.83rem', marginBottom: '1rem' },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))', gap: '1.25rem' },
  center:{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '.5rem' },
  spin:        { width: '40px', height: '40px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  noCreditBanner: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem 1.25rem', background: 'rgba(255,79,135,.06)', border: '1px solid rgba(255,79,135,.2)', borderRadius: '10px', marginBottom: '1rem', color: '#ff4f87', fontSize: '.85rem', fontWeight: 600 },
  upgradeLink: { marginLeft: 'auto', padding: '.35rem .9rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', borderRadius: '7px', textDecoration: 'none', fontSize: '.8rem', fontWeight: 700 },
};
