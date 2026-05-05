import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import AliExpressCard from '../components/AliExpressCard';
import api from '../api/axios';

const cacheKey = (tab, country, period, orderBy, aliTab) =>
  `dashboard_cache_${tab}_${country}_${period}_${orderBy}_${aliTab}`;

export default function Dashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => sessionStorage.getItem('dash_tab') || 'tiktok');
  const [aliTab, setAliTab] = useState(() => sessionStorage.getItem('dash_aliTab') || 'trending');
  const [country, setCountry] = useState(() => sessionStorage.getItem('dash_country') || 'US');
  const [period, setPeriod] = useState(() => sessionStorage.getItem('dash_period') || '30');
  const [orderBy, setOrderBy] = useState(() => sessionStorage.getItem('dash_orderBy') || 'impression');
  const [aliSearchInput, setAliSearchInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const countries = ['US','DE','GB','FR','IT','ES','NL','PL','AT','BE','SE','NO','DK','FI'];
  const periods = [{ v:'7', l:'7D' },{ v:'30', l:'30D' },{ v:'90', l:'90D' },{ v:'180', l:'180D' }];
  const orders = [{ v:'impression', l:'👁 Views' },{ v:'like', l:'❤️ Likes' },{ v:'ctr', l:'📊 CTR' }];
  const ALI_TABS = [
    { id:'trending', label:'🔥 Trending' },
    { id:'highsell', label:'📈 High Sell' },
    { id:'search',   label:'🔍 Search' },
  ];
  const ALI_CAT_MAP = { trending:'15', highsell:'200003655' };

  useEffect(() => { sessionStorage.setItem('dash_tab', tab); }, [tab]);
  useEffect(() => { sessionStorage.setItem('dash_aliTab', aliTab); }, [aliTab]);
  useEffect(() => { sessionStorage.setItem('dash_country', country); }, [country]);
  useEffect(() => { sessionStorage.setItem('dash_period', period); }, [period]);
  useEffect(() => { sessionStorage.setItem('dash_orderBy', orderBy); }, [orderBy]);

  const fetchAds = useCallback(async () => {
    const key = cacheKey(tab, country, period, orderBy, aliTab);
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try { setAds(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    setLoading(true); setAds([]);
    try {
      if (tab === 'tiktok') {
        const res = await api.get('/ads/tiktok', { params: { country, period, order: orderBy } });
        const d = res.data, L3 = d?.data?.data, L4 = L3?.data;
        const raw = L4?.materials || L4?.list || L4?.ad_list || (Array.isArray(L4)?L4:null) || L3?.materials || (Array.isArray(L3)?L3:null) || [];
        const result = Array.isArray(raw) ? raw : [];
        setAds(result);
        sessionStorage.setItem(key, JSON.stringify(result));
      } else if (tab === 'aliexpress') {
        const catId = ALI_CAT_MAP[aliTab] || '15';
        const res = await api.get('/ads/aliexpress', { params: { catId, page:1, currency:'USD' } });
        const raw = res.data?.data?.data || res.data?.data || [];
        const result = Array.isArray(raw) ? raw : [];
        setAds(result);
        sessionStorage.setItem(key, JSON.stringify(result));
      }
    } catch (err) { console.error(err); setAds([]); }
    setLoading(false);
  }, [tab, country, period, orderBy, aliTab]);

  useEffect(() => {
    if (aliTab !== 'search') fetchAds();
    else setLoading(false);
  }, [fetchAds, aliTab]);

  const searchAliExpress = async () => {
    if (!aliSearchInput.trim()) return;
    setLoading(true); setAds([]);
    try {
      const res = await api.get('/ads/aliexpress', { params: { catId:'15', page:1, currency:'USD', keyword:aliSearchInput } });
      const raw = res.data?.data?.data || res.data?.data || [];
      setAds(Array.isArray(raw) ? raw : []);
    } catch (err) { console.error(err); setAds([]); }
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={s.root}>
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />
      <div style={s.bgGrid} />
      <Navbar />

      <div style={s.page}>

        {/* HERO */}
        <div style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.liveBadge}>
              <span style={s.liveDot} /> LIVE DASHBOARD
            </div>
            <h1 style={s.h1}>
              {greeting},{' '}
              <span style={s.nameGrad}>{user.name || 'Boss'}</span>
            </h1>
            <p style={s.heroSub}>Duniya ke best performing ads — real time mein</p>
          </div>
          <div style={s.heroStats}>
            {[
              { num: ads.length || '—', label: 'Ads' },
              { num: tab === 'tiktok' ? 'TikTok' : tab === 'meta' ? 'Meta' : 'Ali', label: 'Platform' },
              { num: country, label: 'Country' },
            ].map((st, i) => (
              <div key={i} style={s.statCard}>
                <span style={s.statNum}>{st.num}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PLATFORM TABS */}
        <div style={s.platformBar}>
          {[
            { id:'tiktok', icon:'🎵', label:'TikTok' },
            { id:'meta',   icon:'📣', label:'Meta' },
            { id:'aliexpress', icon:'🛒', label:'AliExpress' },
          ].map(t => (
            <button
              key={t.id}
              style={{ ...s.pTab, ...(tab===t.id ? s.pTabActive : {}) }}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
              {tab === t.id && <span style={s.pTabDot} />}
            </button>
          ))}
        </div>

        {/* TIKTOK FILTERS */}
        {tab === 'tiktok' && (
          <div style={s.filterBox}>
            <div style={s.filterHead}>⚡ Filters</div>
            <div style={s.filterRow}>
              <div style={s.fg}>
                <label style={s.fl}>🌍 Country</label>
                <select style={s.sel} value={country} onChange={e => setCountry(e.target.value)}>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.fg}>
                <label style={s.fl}>📅 Period</label>
                <div style={s.pills}>
                  {periods.map(p => (
                    <button key={p.v} style={{...s.pill, ...(period===p.v?s.pillOn:{})}} onClick={() => setPeriod(p.v)}>{p.l}</button>
                  ))}
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.fl}>📊 Sort</label>
                <div style={s.pills}>
                  {orders.map(o => (
                    <button key={o.v} style={{...s.pill, ...(orderBy===o.v?s.pillOn:{})}} onClick={() => setOrderBy(o.v)}>{o.l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* META INFO */}
        {tab === 'meta' && (
          <div style={s.filterBox}>
            <div style={s.filterHead}>📣 Meta Ad Library</div>
            <p style={{ color:'#666688', fontSize:'.83rem', margin:0 }}>Real Facebook scraped ads — daily updated</p>
          </div>
        )}

        {/* ALI TABS */}
        {tab === 'aliexpress' && (
          <div style={s.filterBox}>
            <div style={s.filterHead}>🛒 AliExpress</div>
            <div style={s.pills}>
              {ALI_TABS.map(t => (
                <button key={t.id} style={{...s.pill, ...(aliTab===t.id?s.pillOn:{})}} onClick={() => setAliTab(t.id)}>{t.label}</button>
              ))}
            </div>
            {aliTab === 'search' && (
              <div style={s.searchRow}>
                <input
                  style={s.searchIn}
                  placeholder="Product dhundo — shoes, watch, bag..."
                  value={aliSearchInput}
                  onChange={e => setAliSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAliExpress()}
                />
                <button style={s.searchBtn} onClick={searchAliExpress}>🔍 Search</button>
              </div>
            )}
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div style={s.center}>
            <div style={s.spinner}><div style={s.spinInner} /></div>
            <p style={{ color:'#555577', fontSize:'.82rem', marginTop:'1rem' }}>Ads load ho rahi hain...</p>
          </div>
        ) : aliTab === 'search' && tab === 'aliexpress' && ads.length === 0 ? (
          <div style={s.center}>
            <p style={s.emptyIcon}>🔍</p>
            <p style={s.emptyTitle}>Kya dhundna hai?</p>
            <p style={s.emptySub}>Upar search karo koi bhi product</p>
          </div>
        ) : ads.length === 0 ? (
          <div style={s.center}>
            <p style={s.emptyIcon}>📭</p>
            <p style={s.emptyTitle}>Kuch nahi mila</p>
            <p style={s.emptySub}>Filters change karo ya dobara try karo</p>
            <button style={s.retryBtn} onClick={fetchAds}>↺ Retry</button>
          </div>
        ) : (
          <>
            <div style={s.resBar}>
              <span style={s.resCount}><span style={s.resDot} />{ads.length} {tab==='tiktok'?'ads':tab==='meta'?'meta ads':'products'} mile</span>
              {tab === 'tiktok' && <span style={s.resFilter}>{country} · {period} days · {orderBy}</span>}
            </div>
            <div style={tab === 'aliexpress' ? s.gridWide : s.grid}>
              {tab === 'tiktok'
                ? ads.map((ad, i) => <AdCard key={ad.id||i} ad={ad} platform="tiktok" />)
                : tab === 'meta'
                ? ads.map((ad, i) => <AdCard key={ad.id||i} ad={ad} platform="meta" />)
                : ads.map((p, i) => <AliExpressCard key={p.product_id||i} product={p} />)
              }
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes glow1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-25px) scale(1.04)} }
        @keyframes glow2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(20px) scale(.97)} }
        * { box-sizing: border-box; }
        select option { background: #0f0f1a; color: #f0f0f8; }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track { background:#08080f } ::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:4px }
      `}</style>
    </div>
  );
}

const s = {
  root: { minHeight:'100vh', background:'#08080f', position:'relative', overflow:'hidden', fontFamily:"'DM Sans',sans-serif", color:'#f0f0f8' },
  bgGlow1: { position:'fixed', top:'-15%', left:'-8%', width:'550px', height:'550px', borderRadius:'50%', background:'radial-gradient(circle,rgba(108,71,255,.1) 0%,transparent 70%)', animation:'glow1 14s ease-in-out infinite', pointerEvents:'none', zIndex:0 },
  bgGlow2: { position:'fixed', bottom:'-15%', right:'-8%', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle,rgba(24,119,242,.07) 0%,transparent 70%)', animation:'glow2 18s ease-in-out infinite', pointerEvents:'none', zIndex:0 },
  bgGrid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize:'55px 55px', pointerEvents:'none', zIndex:0 },

  page: { position:'relative', zIndex:1, padding:'88px clamp(1rem,4vw,2.5rem) 4rem', maxWidth:'1400px', margin:'0 auto' },

  // Hero
  hero: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1.25rem', marginBottom:'2rem' },
  heroLeft: { flex:1, minWidth:'220px' },
  liveBadge: { display:'inline-flex', alignItems:'center', gap:'.45rem', background:'rgba(108,71,255,.1)', border:'1px solid rgba(108,71,255,.22)', borderRadius:'20px', padding:'.22rem .8rem', fontSize:'.65rem', fontWeight:700, letterSpacing:'.1em', color:'#8b6bff', marginBottom:'.65rem' },
  liveDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite', flexShrink:0 },
  h1: { fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:800, letterSpacing:'-.03em', color:'#f0f0f8', margin:0, lineHeight:1.15 },
  nameGrad: { background:'linear-gradient(120deg,#a78bff,#ff79b0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  heroSub: { color:'#444466', fontSize:'.85rem', marginTop:'.45rem' },
  heroStats: { display:'flex', gap:'.65rem', flexWrap:'wrap' },
  statCard: { display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'12px', padding:'.7rem 1.1rem', minWidth:'68px', backdropFilter:'blur(12px)' },
  statNum: { fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:700, color:'#f0f0f8' },
  statLabel: { fontSize:'.6rem', color:'#444466', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', marginTop:'.12rem' },

  // Platform tabs
  platformBar: { display:'flex', gap:'.45rem', marginBottom:'1.4rem', flexWrap:'wrap' },
  pTab: { display:'inline-flex', alignItems:'center', gap:'.45rem', position:'relative', padding:'.55rem 1.25rem', borderRadius:'10px', border:'1px solid rgba(255,255,255,.06)', background:'rgba(255,255,255,.02)', color:'#555577', fontSize:'.82rem', fontWeight:600, cursor:'pointer', transition:'all .18s', backdropFilter:'blur(8px)' },
  pTabActive: { background:'rgba(108,71,255,.14)', border:'1px solid rgba(108,71,255,.38)', color:'#c4b0ff', boxShadow:'0 0 18px rgba(108,71,255,.18)' },
  pTabDot: { position:'absolute', bottom:'5px', left:'50%', transform:'translateX(-50%)', width:'4px', height:'4px', borderRadius:'50%', background:'#8b6bff' },

  // Filter box
  filterBox: { background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'14px', padding:'1.1rem 1.35rem', marginBottom:'1.6rem', backdropFilter:'blur(16px)' },
  filterHead: { fontFamily:"'Syne',sans-serif", fontSize:'.7rem', fontWeight:700, letterSpacing:'.1em', color:'#8b6bff', textTransform:'uppercase', marginBottom:'.9rem' },
  filterRow: { display:'flex', gap:'1.4rem', flexWrap:'wrap', alignItems:'flex-start' },
  fg: { display:'flex', flexDirection:'column', gap:'.4rem' },
  fl: { fontSize:'.65rem', color:'#444466', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em' },
  sel: { padding:'.42rem .8rem', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'8px', color:'#f0f0f8', fontSize:'.8rem', cursor:'pointer', outline:'none' },
  pills: { display:'flex', gap:'.3rem', flexWrap:'wrap' },
  pill: { padding:'.32rem .75rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,.07)', background:'transparent', color:'#666688', fontSize:'.76rem', fontWeight:600, cursor:'pointer', transition:'all .15s' },
  pillOn: { background:'rgba(108,71,255,.18)', border:'1px solid rgba(108,71,255,.42)', color:'#c4b0ff' },

  searchRow: { display:'flex', gap:'.65rem', marginTop:'.9rem', flexWrap:'wrap' },
  searchIn: { flex:1, minWidth:'200px', padding:'.65rem 1rem', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'9px', color:'#f0f0f8', fontSize:'.83rem', outline:'none' },
  searchBtn: { padding:'.65rem 1.35rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', color:'#fff', border:'none', borderRadius:'9px', fontWeight:700, cursor:'pointer', fontSize:'.83rem' },

  // Results bar
  resBar: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem', flexWrap:'wrap', gap:'.5rem' },
  resCount: { display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.78rem', color:'#666688', fontWeight:600 },
  resDot: { width:'5px', height:'5px', borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' },
  resFilter: { fontSize:'.7rem', color:'#333355', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'5px', padding:'.18rem .55rem' },

  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap:'1.2rem' },
  gridWide: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(260px,100%),1fr))', gap:'1rem' },

  center: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'360px', gap:'.5rem' },
  spinner: { width:'48px', height:'48px', position:'relative' },
  spinInner: { position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:'#8b6bff', animation:'spin .85s linear infinite' },
  emptyIcon: { fontSize:'2.8rem', margin:0, lineHeight:1 },
  emptyTitle: { fontFamily:"'Syne',sans-serif", fontSize:'1.05rem', fontWeight:700, color:'#f0f0f8', margin:0 },
  emptySub: { color:'#444466', fontSize:'.8rem', margin:0 },
  retryBtn: { marginTop:'.5rem', padding:'.5rem 1.4rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'.8rem' },
};
