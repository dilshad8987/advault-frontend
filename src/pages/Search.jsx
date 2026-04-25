import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [country, setCountry] = useState('US');
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);

  const search = async () => {
    if (!keyword.trim()) return toast.error('Keyword daalo');
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/ads/search', {
        params: { keyword, platform, country }
      });
      console.log('Search response:', res.data);
      const raw = res.data?.data?.data?.materials
               || res.data?.data?.materials
               || res.data?.data
               || [];
      const result = Array.isArray(raw) ? raw : [];
      setAds(result);
      setTotal(result.length);
      if (result.length === 0) toast('Koi ads nahi mili', { icon: '📭' });
      else toast.success(result.length + ' ads mili!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Search fail');
    }
    setLoading(false);
  };

  const countries = ['US','DE','GB','FR','IT','ES','NL','PL','AT','BE','SE','NO','DK','FI'];

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={styles.page}>

        <h1 style={styles.h1}>🔍 Search Ads</h1>
        <p style={styles.sub}>Keyword se winning ads dhundo</p>

        <div style={styles.searchBox}>
          <input
            style={styles.input}
            placeholder="Keyword likho — shoes, skincare, gadgets..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button style={styles.btn} onClick={search} disabled={loading}>
            {loading ? '⏳' : '🔍 Search'}
          </button>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Platform</label>
            <div style={styles.chips}>
              {['tiktok','all'].map(p => (
                <button
                  key={p}
                  style={{ ...styles.chip, ...(platform === p ? styles.chipActive : {}) }}
                  onClick={() => setPlatform(p)}
                >
                  {p === 'all' ? '🎯 All' : '🎵 TikTok'}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Country</label>
            <select style={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#8888aa', marginTop: '1rem' }}>Searching...</p>
          </div>
        )}

        {!loading && searched && ads.length === 0 && (
          <div style={styles.center}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Koi ads nahi mili — keyword badlo</p>
          </div>
        )}

        {!loading && ads.length > 0 && (
          <>
            <p style={styles.count}>✅ {total} ads mili</p>
            <div style={styles.grid}>
              {ads.map((ad, i) => <AdCard key={ad.id || i} ad={ad} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '80px clamp(1rem,4vw,2rem) 3rem' },
  h1: { fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900 },
  sub: { color: '#8888aa', marginBottom: '1.5rem', marginTop: '.4rem' },
  searchBox: { display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '200px', padding: '.75rem 1rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none' },
  btn: { padding: '.75rem 1.75rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1.25rem', background: '#0f0f1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,.08)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '.5rem' },
  label: { fontSize: '.75rem', color: '#8888aa', fontWeight: 700, textTransform: 'uppercase' },
  chips: { display: 'flex', gap: '.4rem', flexWrap: 'wrap' },
  chip: { padding: '.35rem .85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' },
  chipActive: { background: '#6c47ff', color: '#fff', border: '1px solid #6c47ff' },
  select: { padding: '.5rem .9rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#f0f0f8', fontSize: '.85rem', outline: 'none', cursor: 'pointer' },
  count: { color: '#8888aa', fontSize: '.85rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: '1.25rem' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
