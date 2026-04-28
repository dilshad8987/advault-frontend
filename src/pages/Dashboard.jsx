import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import AliExpressCard from '../components/AliExpressCard';
import api from '../api/axios';

const cacheKey = (tab, country, period, orderBy, aliTab) =>
  `dashboard_cache_${tab}_${country}_${period}_${orderBy}_${aliTab}`;

const FEATURE_CARDS = [
  { icon: '🔍', label: 'Search Ads',      desc: 'Keyword search',         path: '/search',      color: '#6c47ff' },
  { icon: '📁', label: 'Collections',     desc: 'Pinterest style boards', path: '/collections', color: '#00d4aa' },
  { icon: '🔔', label: 'Alerts',          desc: 'Competitor tracking',    path: '/alerts',      color: '#ffb700' },
  { icon: '🤖', label: 'AI Tools',        desc: 'Copy, hooks, audience',  path: '/ai',          color: '#ff4f87' },
];

export default function Dashboard() {
  const navigate = useNavigate();
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
  const periods = [{ v: '7', l: '7 Days' }, { v: '30', l: '30 Days' }, { v: '90', l: '90 Days' }, { v: '180', l: '180 Days' }];
  const orders = [{ v: 'impression', l: '👁 Impressions' }, { v: 'like', l: '❤️ Likes' }, { v: 'ctr', l: '📊 CTR' }];
  const ALI_TABS = [{ id: 'trending', label: '🔥 Trending' }, { id: 'highsell', label: '📈 High Sell' }, { id: 'search', label: '🔍 Search' }];
  const ALI_CAT_MAP = { trending: '15', highsell: '200003655' };

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
        const d = res.data;
        const L3 = d?.data?.data;
        const L4 = L3?.data;
        const raw = L4?.materials || L4?.list || L4?.ad_list || (Array.isArray(L4) ? L4 : null) || L3?.materials || (Array.isArray(L3) ? L3 : null) || [];
        const result = Array.isArray(raw) ? raw : [];
        setAds(result);
        sessionStorage.setItem(key, JSON.stringify(result));
      } else if (tab === 'aliexpress') {
        const catId = ALI_CAT_MAP[aliTab] || '15';
        const res = await api.get('/ads/aliexpress', { params: { catId, page: 1, currency: 'USD' } });
        const raw = res.data?.data?.data || res.data?.data || [];
        const result = Array.isArray(raw) ? raw : [];
        setAds(result);
        sessionStorage.setItem(key, JSON.stringify(result));
      }
    } catch (err) {
      console.error(err); setAds([]);
    }
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
      const res = await api.get('/ads/aliexpress', { params: { catId: '15', page: 1, currency: 'USD', keyword: aliSearchInput } });
      const raw = res.data?.data?.data || res.data?.data || [];
      setAds(Array.isArray(raw) ? raw : []);
    } catch (err) { console.error(err); setAds([]); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={st.page}>

        {/* Hero */}
        <div style={st.hero}>
          <h1 style={st.h1}>Welcome back, <span style={{ color: '#8b6bff' }}>{user.name}</span> 👋</h1>
          <p style={st.sub}>Trending ads aur hot products dekho</p>
        </div>

        {/* ── Feature Quick Access ── */}
        <div style={st.featureGrid}>
          {FEATURE_CARDS.map(f => (
            <button key={f.path} style={st.featureCard} onClick={() => navigate(f.path)}>
              <div style={{ ...st.featureIcon, background: f.color + '22', color: f.color }}>{f.icon}</div>
              <div style={st.featureLabel}>{f.label}</div>
              <div style={st.featureDesc}>{f.desc}</div>
            </button>
          ))}
        </div>

        {/* Main Tabs */}
        <div style={st.mainTabs}>
          <button style={{ ...st.mainTab, ...(tab === 'tiktok' ? st.mainTabActive : {}) }} onClick={() => setTab('tiktok')}>
            🎵 TikTok Ads
          </button>
          <button style={{ ...st.mainTab, ...(tab === 'aliexpress' ? st.mainTabActive : {}) }} onClick={() => setTab('aliexpress')}>
            🛒 AliExpress
          </button>
        </div>

        {/* TikTok Filters */}
        {tab === 'tiktok' && (
          <div style={st.filterBar}>
            <div style={st.filterGroup}>
              <label style={st.label}>🌍 Country</label>
              <select style={st.select} value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={st.filterGroup}>
              <label style={st.label}>📅 Period</label>
              <select style={st.select} value={period} onChange={e => setPeriod(e.target.value)}>
                {periods.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
            <div style={st.filterGroup}>
              <label style={st.label}>📊 Sort By</label>
              <select style={st.select} value={orderBy} onChange={e => setOrderBy(e.target.value)}>
                {orders.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* AliExpress Sub Tabs */}
        {tab === 'aliexpress' && (
          <div style={st.aliSection}>
            <div style={st.aliTabs}>
              {ALI_TABS.map(t => (
                <button key={t.id} style={{ ...st.aliTab, ...(aliTab === t.id ? st.aliTabActive : {}) }} onClick={() => setAliTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            {aliTab === 'trending' && <p style={st.aliDesc}>🔥 Abhi sabse zyada bikne wale products worldwide</p>}
            {aliTab === 'highsell' && <p style={st.aliDesc}>📈 High volume sellers — proven winning products</p>}
            {aliTab === 'search' && (
              <div style={st.aliSearchBar}>
                <input style={st.aliInput} placeholder="Product dhundo — shoes, watch, bag..."
                  value={aliSearchInput} onChange={e => setAliSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAliExpress()} />
                <button style={st.aliSearchBtn} onClick={searchAliExpress}>🔍 Search</button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={st.center}>
            <div style={st.spinner} />
            <p style={{ color: '#8888aa', marginTop: '1rem' }}>Load ho raha hai...</p>
          </div>
        ) : aliTab === 'search' && tab === 'aliexpress' && ads.length === 0 ? (
          <div style={st.center}>
            <p style={{ fontSize: '2.5rem' }}>🔍</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Upar search karo product dhundne ke liye</p>
          </div>
        ) : ads.length === 0 ? (
          <div style={st.center}>
            <p style={{ fontSize: '2.5rem' }}>📭</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Kuch nahi mila</p>
            <button style={st.retryBtn} onClick={fetchAds}>Dobara try karo</button>
          </div>
        ) : (
          <>
            <p style={st.count}>✅ {ads.length} {tab === 'tiktok' ? 'ads' : 'products'} mile</p>
            <div style={st.grid}>
              {tab === 'tiktok'
                ? ads.map((ad, i) => <AdCard key={ad.id || i} ad={ad} />)
                : ads.map((p, i) => <AliExpressCard key={p.product_id || i} product={p} />)
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const st = {
  page: { padding: '72px clamp(.75rem,4vw,2rem) 3rem' },
  hero: { marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(1.3rem,4vw,1.9rem)', fontWeight: 900, letterSpacing: '-.02em', color: '#f0f0f8' },
  sub: { color: '#8888aa', marginTop: '.35rem', fontSize: '.88rem' },

  // Feature cards
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.6rem', marginBottom: '1.5rem' },
  featureCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem', padding: '.9rem .5rem', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', cursor: 'pointer', textAlign: 'center', transition: 'transform .15s, border-color .15s' },
  featureIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '.1rem' },
  featureLabel: { color: '#f0f0f8', fontSize: '.78rem', fontWeight: 700 },
  featureDesc: { color: '#8888aa', fontSize: '.68rem' },

  mainTabs: { display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  mainTab: { padding: '.6rem 1.4rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' },
  mainTabActive: { background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: '1px solid #6c47ff', boxShadow: '0 0 16px rgba(108,71,255,.35)' },
  filterBar: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '1.25rem', background: '#0f0f1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,.07)', marginBottom: '1.5rem' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '.4rem' },
  label: { fontSize: '.72rem', color: '#8888aa', fontWeight: 700, textTransform: 'uppercase' },
  select: { padding: '.5rem .9rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.85rem', cursor: 'pointer', outline: 'none' },
  retryBtn: { padding: '.55rem 1.2rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' },
  aliSection: { marginBottom: '1.5rem' },
  aliTabs: { display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' },
  aliTab: { padding: '.5rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' },
  aliTabActive: { background: '#161625', color: '#fff', border: '1px solid rgba(108,71,255,.5)', boxShadow: '0 0 12px rgba(108,71,255,.2)' },
  aliDesc: { color: '#8888aa', fontSize: '.85rem', marginBottom: '.5rem' },
  aliSearchBar: { display: 'flex', gap: '.75rem', flexWrap: 'wrap' },
  aliInput: { flex: 1, minWidth: '200px', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.88rem', outline: 'none' },
  aliSearchBtn: { padding: '.75rem 1.5rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
  count: { color: '#8888aa', fontSize: '.83rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))', gap: '1.25rem' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '.5rem' },
  spinner: { width: '40px', height: '40px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' },
};
