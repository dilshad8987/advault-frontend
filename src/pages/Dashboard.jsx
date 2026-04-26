import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import AliExpressCard from '../components/AliExpressCard';
import api from '../api/axios';

export default function Dashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tiktok');
  const [aliTab, setAliTab] = useState('trending');
  const [country, setCountry] = useState('US');
  const [period, setPeriod] = useState('30');
  const [orderBy, setOrderBy] = useState('impression');
  const [aliSearchInput, setAliSearchInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const countries = ['US','DE','GB','FR','IT','ES','NL','PL','AT','BE','SE','NO','DK','FI'];
  const periods = [{ v: '7', l: '7 Days' }, { v: '30', l: '30 Days' }, { v: '90', l: '90 Days' }, { v: '180', l: '180 Days' }];
  const orders = [{ v: 'impression', l: '👁 Impressions' }, { v: 'like', l: '❤️ Likes' }, { v: 'ctr', l: '📊 CTR' }];

  const ALI_TABS = [
    { id: 'trending', label: '🔥 Trending' },
    { id: 'highsell',  label: '📈 High Sell' },
    { id: 'search',    label: '🔍 Search' },
  ];

  const ALI_CAT_MAP = { trending: '15', highsell: '200003655' };

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setAds([]);
    try {
      if (tab === 'tiktok') {
        const res = await api.get('/ads/tiktok', {
          params: { country, period, order: orderBy }
        });

        // Response chain:
        // res.data = { success, data }
        // res.data.data = { data: apiResponse, fromCache }
        // res.data.data.data = { code, msg, processed_time, data }
        // res.data.data.data.data = { materials: [...ads] }
        const d = res.data;
        const L3 = d?.data?.data;           // { code, msg, data }
        const L4 = L3?.data;               // { materials: [...] } or array

        const raw =
          L4?.materials ||
          L4?.list ||
          L4?.ad_list ||
          (Array.isArray(L4) ? L4 : null) ||
          L3?.materials ||
          (Array.isArray(L3) ? L3 : null) ||
          [];

        setAds(Array.isArray(raw) ? raw : []);
      } else if (tab === 'aliexpress') {
        const catId = ALI_CAT_MAP[aliTab] || '15';
        const res = await api.get('/ads/aliexpress', {
          params: { catId, page: 1, currency: 'USD' }
        });
        const raw = res.data?.data?.data || res.data?.data || [];
        setAds(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error(err);
      setAds([]);
    }
    setLoading(false);
  }, [tab, country, period, orderBy, aliTab]);

  useEffect(() => {
    if (aliTab !== 'search') fetchAds();
  }, [fetchAds]);

  const searchAliExpress = async () => {
    if (!aliSearchInput.trim()) return;
    setLoading(true);
    setAds([]);
    try {
      const res = await api.get('/ads/aliexpress', {
        params: { catId: '15', page: 1, currency: 'USD', keyword: aliSearchInput }
      });
      const raw = res.data?.data?.data || res.data?.data || [];
      setAds(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
      setAds([]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={styles.page}>

        <div style={styles.hero}>
          <h1 style={styles.h1}>
            Welcome back, <span style={{ color: '#8b6bff' }}>{user.name}</span> 👋
          </h1>
          <p style={styles.sub}>Trending ads aur hot products dekho</p>
        </div>

        {/* MAIN TABS */}
        <div style={styles.mainTabs}>
          <button style={{ ...styles.mainTab, ...(tab === 'tiktok' ? styles.mainTabActive : {}) }} onClick={() => setTab('tiktok')}>
            🎵 TikTok Ads
          </button>
          <button style={{ ...styles.mainTab, ...(tab === 'aliexpress' ? styles.mainTabActive : {}) }} onClick={() => setTab('aliexpress')}>
            🛒 AliExpress
          </button>
        </div>

        {/* TIKTOK FILTERS */}
        {tab === 'tiktok' && (
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>🌍 Country</label>
              <select style={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>📅 Period</label>
              <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
                {periods.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>📊 Sort By</label>
              <select style={styles.select} value={orderBy} onChange={e => setOrderBy(e.target.value)}>
                {orders.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ALIEXPRESS SUB TABS */}
        {tab === 'aliexpress' && (
          <div style={styles.aliSection}>
            <div style={styles.aliTabs}>
              {ALI_TABS.map(t => (
                <button
                  key={t.id}
                  style={{ ...styles.aliTab, ...(aliTab === t.id ? styles.aliTabActive : {}) }}
                  onClick={() => setAliTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {aliTab === 'trending' && <p style={styles.aliDesc}>🔥 Abhi sabse zyada bikne wale products worldwide</p>}
            {aliTab === 'highsell' && <p style={styles.aliDesc}>📈 High volume sellers — proven winning products</p>}
            {aliTab === 'search' && (
              <div style={styles.aliSearchBar}>
                <input
                  style={styles.aliInput}
                  placeholder="Product dhundo — shoes, watch, bag..."
                  value={aliSearchInput}
                  onChange={e => setAliSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAliExpress()}
                />
                <button style={styles.aliSearchBtn} onClick={searchAliExpress}>🔍 Search</button>
              </div>
            )}
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div style={styles.center}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#8888aa', marginTop: '1rem' }}>Load ho raha hai...</p>
          </div>
        ) : aliTab === 'search' && tab === 'aliexpress' && ads.length === 0 ? (
          <div style={styles.center}>
            <p style={{ fontSize: '2.5rem' }}>🔍</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Upar search karo product dhundne ke liye</p>
          </div>
        ) : ads.length === 0 ? (
          <div style={styles.center}>
            <p style={{ fontSize: '2.5rem' }}>📭</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Kuch nahi mila</p>
            <button style={styles.retryBtn} onClick={fetchAds}>Dobara try karo</button>
          </div>
        ) : (
          <>
            <p style={styles.count}>✅ {ads.length} {tab === 'tiktok' ? 'ads' : 'products'} mile</p>
            <div style={styles.grid}>
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

const styles = {
  page: { padding: '80px clamp(1rem,4vw,2rem) 3rem' },
  hero: { marginBottom: '1.75rem' },
  h1: { fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-.02em' },
  sub: { color: '#8888aa', marginTop: '.4rem', fontSize: '.9rem' },
  mainTabs: { display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  mainTab: { padding: '.6rem 1.4rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' },
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
