import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AdCard from '../components/AdCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Search() {
  const [keyword,   setKeyword]   = useState('');
  const [platform,  setPlatform]  = useState('tiktok');
  const [country,   setCountry]   = useState('US');
  const [sortBy,    setSortBy]    = useState('impression');
  const [period,    setPeriod]    = useState('30');
  const [ads,       setAds]       = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [total,     setTotal]     = useState(0);
  const [remaining, setRemaining] = useState(null);

  const countries = ['US','DE','GB','FR','IT','ES','NL','PL','AT','BE','SE','NO','DK','FI','JP','KR','BR','MX','IN'];
  const sorts     = [{ v:'impression', l:'👁 Impressions' }, { v:'like', l:'❤️ Likes' }, { v:'ctr', l:'📊 CTR' }];
  const periods   = [{ v:'7', l:'7 Days' }, { v:'30', l:'30 Days' }, { v:'90', l:'90 Days' }];

  const search = async () => {
    if (!keyword.trim()) return toast.error('Keyword daalo pehle');
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/ads/search', { params: { keyword, platform, country, order: sortBy, period } });

      // Parse response — same chain as dashboard
      const d   = res.data;
      const raw = d?.data?.data?.data?.materials
               || d?.data?.data?.materials
               || d?.data?.materials
               || d?.data?.data
               || d?.data
               || [];

      const result = Array.isArray(raw) ? raw : [];
      setAds(result);
      setTotal(result.length);
      if (d?.remaining !== undefined) setRemaining(d.remaining);
      if (result.length === 0) toast('Koi ads nahi mili — keyword badlo', { icon: '📭' });
      else toast.success(`${result.length} ads mili!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Search fail';
      toast.error(msg);
      if (err.response?.status === 429) {
        toast.error('Daily search limit khatam! Kal try karo.');
      }
    }
    setLoading(false);
  };

  const suggestions = ['skincare', 'fitness', 'gadgets', 'shoes', 'coffee', 'pet', 'kitchen', 'fashion'];

  return (
    <div style={{ minHeight:'100vh', background:'#08080f', color:'#f0f0f8', fontFamily:'system-ui,sans-serif' }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      <Navbar />

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.h1}>🔍 Search Ads</h1>
          <p style={S.sub}>Keyword se winning ads dhundo</p>
          {remaining !== null && (
            <span style={S.limitBadge}>🔎 {remaining} searches baaki aaj</span>
          )}
        </div>

        {/* Search bar */}
        <div style={S.searchBox}>
          <input
            style={S.input}
            placeholder="Keyword likho — shoes, skincare, gadgets..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button style={S.btn} onClick={search} disabled={loading}>
            {loading ? '⏳' : '🔍 Search'}
          </button>
        </div>

        {/* Quick suggestions */}
        {!searched && (
          <div style={S.suggestRow}>
            <span style={S.suggestLabel}>Trending:</span>
            {suggestions.map(s => (
              <button key={s} style={S.suggestChip} onClick={() => { setKeyword(s); }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={S.filterBar}>
          {/* Platform */}
          <div style={S.filterGroup}>
            <label style={S.label}>Platform</label>
            <div style={S.chips}>
              {[{v:'tiktok',l:'🎵 TikTok'},{v:'all',l:'🎯 All'}].map(p => (
                <button key={p.v} style={{ ...S.chip, ...(platform===p.v?S.chipActive:{}) }} onClick={() => setPlatform(p.v)}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div style={S.filterGroup}>
            <label style={S.label}>🌍 Country</label>
            <select style={S.select} value={country} onChange={e => setCountry(e.target.value)}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div style={S.filterGroup}>
            <label style={S.label}>📊 Sort By</label>
            <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {sorts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          {/* Period */}
          <div style={S.filterGroup}>
            <label style={S.label}>📅 Period</label>
            <select style={S.select} value={period} onChange={e => setPeriod(e.target.value)}>
              {periods.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={S.center}>
            <div style={S.spinner}></div>
            <p style={{ color:'#8888aa', marginTop:'1rem' }}>"{keyword}" dhundh raha hai...</p>
          </div>
        ) : !loading && searched && ads.length === 0 ? (
          <div style={S.center}>
            <p style={{ fontSize:'2.5rem', margin:0 }}>📭</p>
            <p style={{ color:'#8888aa', marginTop:'.5rem' }}>Koi ads nahi mili — dusra keyword try karo</p>
            <div style={S.suggestRow}>
              {suggestions.map(s => (
                <button key={s} style={S.suggestChip} onClick={() => { setKeyword(s); search(); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : ads.length > 0 ? (
          <>
            <div style={S.resultHeader}>
              <p style={S.count}>✅ {total} ads mili — <span style={{ color:'#8b6bff' }}>"{keyword}"</span></p>
            </div>
            <div style={S.grid}>
              {ads.map((ad, i) => <AdCard key={ad.id || i} ad={ad} />)}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const S = {
  page:        { padding:'80px clamp(1rem,4vw,2rem) 3rem', maxWidth:'1100px', margin:'0 auto' },
  header:      { marginBottom:'1.25rem' },
  h1:          { fontSize:'clamp(1.5rem,4vw,2rem)', fontWeight:900, margin:0 },
  sub:         { color:'#8888aa', margin:'.4rem 0 0', fontSize:'.9rem' },
  limitBadge:  { display:'inline-block', marginTop:'.6rem', padding:'.2rem .75rem', background:'rgba(108,71,255,.12)', border:'1px solid rgba(108,71,255,.25)', borderRadius:'20px', color:'#8b6bff', fontSize:'.75rem', fontWeight:600 },
  searchBox:   { display:'flex', gap:'.75rem', marginBottom:'1rem', flexWrap:'wrap' },
  input:       { flex:1, minWidth:'200px', padding:'.75rem 1.1rem', background:'#161625', border:'1px solid rgba(255,255,255,.08)', borderRadius:'10px', color:'#f0f0f8', fontSize:'.9rem', outline:'none' },
  btn:         { padding:'.75rem 1.75rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'.9rem', cursor:'pointer', whiteSpace:'nowrap' },
  suggestRow:  { display:'flex', flexWrap:'wrap', gap:'.4rem', alignItems:'center', marginBottom:'1rem' },
  suggestLabel:{ fontSize:'.75rem', color:'#8888aa', fontWeight:600 },
  suggestChip: { padding:'.3rem .8rem', background:'#161625', border:'1px solid rgba(255,255,255,.08)', borderRadius:'20px', color:'#d0d0e8', fontSize:'.78rem', cursor:'pointer' },
  filterBar:   { display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end', padding:'1.1rem', background:'#0f0f1a', borderRadius:'12px', border:'1px solid rgba(255,255,255,.07)', marginBottom:'1.5rem' },
  filterGroup: { display:'flex', flexDirection:'column', gap:'.4rem' },
  label:       { fontSize:'.72rem', color:'#8888aa', fontWeight:700, textTransform:'uppercase' },
  chips:       { display:'flex', gap:'.4rem', flexWrap:'wrap' },
  chip:        { padding:'.35rem .85rem', borderRadius:'6px', border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'#8888aa', fontSize:'.82rem', fontWeight:600, cursor:'pointer' },
  chipActive:  { background:'#6c47ff', color:'#fff', border:'1px solid #6c47ff' },
  select:      { padding:'.5rem .9rem', background:'#161625', border:'1px solid rgba(255,255,255,.08)', borderRadius:'8px', color:'#f0f0f8', fontSize:'.85rem', outline:'none', cursor:'pointer' },
  resultHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.5rem' },
  count:       { color:'#8888aa', fontSize:'.85rem', marginBottom:'1rem' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(280px,100%),1fr))', gap:'1.25rem' },
  center:      { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'250px', gap:'.5rem' },
  spinner:     { width:'36px', height:'36px', border:'3px solid rgba(108,71,255,.2)', borderTop:'3px solid #6c47ff', borderRadius:'50%', animation:'spin 1s linear infinite' },
};
