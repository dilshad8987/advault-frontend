import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const countryFlag = (code) => {
  if (!code) return '';
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
};

function StatBox({ icon, label, value }) {
  return (
    <div style={sb.box}>
      <div style={sb.icon}>{icon}</div>
      <div style={sb.val}>{value ?? '—'}</div>
      <div style={sb.label}>{label}</div>
    </div>
  );
}
const sb = {
  box:   { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', padding:'1rem', textAlign:'center', flex:'1 1 100px', minWidth:'90px' },
  icon:  { fontSize:'1.3rem', marginBottom:'.3rem' },
  val:   { fontSize:'1rem', fontWeight:800, color:'#f0f0f8', marginBottom:'.15rem' },
  label: { fontSize:'.65rem', color:'#8888aa', textTransform:'uppercase', letterSpacing:'.05em' },
};

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'.5rem 1.2rem', borderRadius:'8px', border:'none', cursor:'pointer',
      fontWeight:700, fontSize:'.82rem', transition:'all .2s',
      background: active ? 'linear-gradient(135deg,#6c47ff,#8b6bff)' : 'transparent',
      color: active ? '#fff' : '#8888aa',
      boxShadow: active ? '0 0 16px rgba(108,71,255,.35)' : 'none',
    }}>{children}</button>
  );
}

function ScoreRing({ score }) {
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171';
  const label = score >= 75 ? 'WINNING' : score >= 50 ? 'AVERAGE' : 'WEAK';
  const labelColor = score >= 75 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.5rem' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition:'stroke-dasharray 1.5s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 8px ${color}66)` }}
        />
        <text x="65" y="60" textAnchor="middle" fill="#f0f0f8" fontSize="28" fontWeight="900">{score}</text>
        <text x="65" y="76" textAnchor="middle" fill="#8888aa" fontSize="11">/100</text>
      </svg>
      <span style={{ fontSize:'.78rem', fontWeight:800, color:labelColor, letterSpacing:'.1em',
        background:`${labelColor}18`, border:`1px solid ${labelColor}44`, borderRadius:'20px',
        padding:'.25rem .9rem' }}>
        {label}
      </span>
    </div>
  );
}

function ScoreBar({ label, value, max = 100, color = '#6c47ff' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.3rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'.75rem', color:'#d0d0e8', fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:'.75rem', color, fontWeight:800 }}>{value}/{max}</span>
      </div>
      <div style={{ height:'6px', background:'rgba(255,255,255,.06)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ width: pct+'%', height:'100%', background:`linear-gradient(90deg,${color}99,${color})`,
          borderRadius:'3px', transition:'width 1s ease', boxShadow:`0 0 8px ${color}66` }} />
      </div>
    </div>
  );
}

function AIAnalysisTab({ ad, adId }) {
  const [analysis,   setAnalysis]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const runAnalysis = async () => {
    setLoading(true); setError(''); setAnalysis(null);

    const likes      = ad.like || ad.metrics?.likes || 0;
    const comments   = ad.comment || ad.metrics?.comments || 0;
    const ctr        = ad.ctr ? (ad.ctr * 100).toFixed(2) : 0;
    const impression = ad.impression || ad.reach || 0;
    const cost       = ad.cost || ad.spend || 0;
    const title      = ad.ad_title || ad.title || '';
    const objective  = ad.objective_key?.replace('campaign_objective_','') || ad.objective || '';
    const industry   = ad.industry_key?.replace('label_','') || '';
    const startDate  = ad.first_shown_date || ad.start_date;
    const endDate    = ad.last_shown_date || ad.end_date;
    const runDays    = startDate ? Math.floor((Date.now()/1000 - startDate)/86400) : 0;
    const isActive   = !endDate || new Date(endDate*1000) > new Date();
    const countries  = ad.country_code ? (Array.isArray(ad.country_code) ? ad.country_code : [ad.country_code]) : [];

    try {
      const res = await api.post('/ads/ai/analyze', {
        adData: { title, objective, industry, likes, comments,
          ctr: parseFloat(ctr) || 0, impression, cost, runDays, isActive, countries }
      });
      if (res.data?.success && res.data?.analysis) {
        setAnalysis(res.data.analysis);
      } else {
        setError('Analysis fail hua. Dobara try karo.');
      }
    } catch(err) {
      const msg = err.response?.data?.message || err.message || 'Analysis fail hua';
      setError(msg);
    }
    setLoading(false);
  };

  if (!analysis && !loading) {
    return (
      <div style={AI.emptyWrap}>
        <div style={AI.emptyIcon}>🤖</div>
        <h3 style={AI.emptyTitle}>AI Ad Score & Analysis</h3>
        <p style={AI.emptyDesc}>
          Claude AI is ad ko analyze karega aur score dega — hook strength,
          engagement quality, spend efficiency, aur improvement tips.
        </p>
        {error && <div style={AI.errorBox}>⚠️ {error}</div>}
        <button onClick={runAnalysis} style={AI.analyzeBtn}>
          ✨ AI Analysis Shuru Karo
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={AI.loadingWrap}>
        <div style={AI.loadingOrb}></div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#f0f0f8', fontWeight:700, fontSize:'1rem', marginBottom:'.4rem' }}>
            AI Analysis chal rahi hai...
          </div>
          <div style={{ color:'#8888aa', fontSize:'.82rem' }}>Ad data process ho raha hai</div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const threatColor = { LOW:'#4ade80', MEDIUM:'#facc15', HIGH:'#f87171' };
  const scaleColor  = { LOW:'#f87171', MEDIUM:'#facc15', HIGH:'#4ade80' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', animation:'fadeIn .4s ease' }}>
      <div style={AI.card}>
        <div style={AI.cardHeader}>
          <span style={AI.cardIcon}>🎯</span>
          <h3 style={AI.cardTitle}>Ad Score</h3>
          <button onClick={runAnalysis} style={AI.rerunBtn}>🔄 Rerun</button>
        </div>
        <div style={AI.scoreLayout}>
          <ScoreRing score={analysis.overall_score} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'.85rem', minWidth:'180px' }}>
            <ScoreBar label="🪝 Hook Strength"      value={analysis.scores?.hook_strength}      max={25} color="#6c47ff" />
            <ScoreBar label="💬 Engagement Rate"    value={analysis.scores?.engagement_rate}    max={25} color="#8b6bff" />
            <ScoreBar label="💰 Spend Efficiency"   value={analysis.scores?.spend_efficiency}   max={25} color="#a78bfa" />
            <ScoreBar label="⏱ Longevity Score"    value={analysis.scores?.longevity}          max={25} color="#c4b5fd" />
          </div>
        </div>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', marginTop:'1rem' }}>
          <div style={AI.metaBadge}>
            <span style={{ color:'#8888aa', fontSize:'.7rem', fontWeight:600 }}>⚔️ COMPETITOR THREAT</span>
            <span style={{ color: threatColor[analysis.competitor_threat]||'#8888aa', fontWeight:800, fontSize:'.85rem' }}>
              {analysis.competitor_threat || '—'}
            </span>
          </div>
          <div style={AI.metaBadge}>
            <span style={{ color:'#8888aa', fontSize:'.7rem', fontWeight:600 }}>🚀 SCALING POTENTIAL</span>
            <span style={{ color: scaleColor[analysis.scaling_potential]||'#8888aa', fontWeight:800, fontSize:'.85rem' }}>
              {analysis.scaling_potential || '—'}
            </span>
          </div>
        </div>
      </div>

      <div style={AI.card}>
        <div style={AI.cardHeader}>
          <span style={AI.cardIcon}>🎬</span>
          <h3 style={AI.cardTitle}>Creative Analysis</h3>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {[
            ['🪝 Hook Analysis',    analysis.hook_analysis],
            ['🎯 Target Audience',  analysis.target_audience],
            ['📢 CTA Strength',     analysis.cta_analysis],
            ['🏆 Best For',         analysis.best_for],
          ].map(([label, text]) => text && (
            <div key={label} style={AI.analysisItem}>
              <div style={AI.analysisLabel}>{label}</div>
              <div style={AI.analysisText}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap:'1rem' }}>
        <div style={AI.card}>
          <div style={AI.cardHeader}>
            <span style={AI.cardIcon}>✅</span>
            <h3 style={AI.cardTitle}>Winning Elements</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {(analysis.winning_elements||[]).map((item, i) => (
              <div key={i} style={AI.winItem}>
                <span style={{ color:'#4ade80', fontSize:'.85rem' }}>✓</span>
                <span style={{ fontSize:'.82rem', color:'#d0d0e8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={AI.card}>
          <div style={AI.cardHeader}>
            <span style={AI.cardIcon}>⚠️</span>
            <h3 style={AI.cardTitle}>Weak Points</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {(analysis.weak_points||[]).map((item, i) => (
              <div key={i} style={AI.winItem}>
                <span style={{ color:'#f87171', fontSize:'.85rem' }}>✗</span>
                <span style={{ fontSize:'.82rem', color:'#d0d0e8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={AI.card}>
        <div style={AI.cardHeader}>
          <span style={AI.cardIcon}>💡</span>
          <h3 style={AI.cardTitle}>AI Recommendations</h3>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
          {(analysis.recommendations||[]).map((rec, i) => (
            <div key={i} style={AI.recItem}>
              <div style={AI.recNum}>{i + 1}</div>
              <span style={{ fontSize:'.83rem', color:'#d0d0e8', lineHeight:1.5 }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const AI = {
  emptyWrap:    { display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'3rem 1rem', textAlign:'center' },
  emptyIcon:    { fontSize:'3.5rem', filter:'drop-shadow(0 0 20px rgba(108,71,255,.4))' },
  emptyTitle:   { fontSize:'1.2rem', fontWeight:800, color:'#f0f0f8', margin:0 },
  emptyDesc:    { fontSize:'.85rem', color:'#8888aa', maxWidth:'380px', lineHeight:1.6, margin:0 },
  errorBox:     { background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.3)', borderRadius:'8px', padding:'.6rem 1rem', fontSize:'.8rem', color:'#f87171' },
  analyzeBtn:   { padding:'.75rem 2rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'.9rem', cursor:'pointer', boxShadow:'0 0 24px rgba(108,71,255,.4)' },
  loadingWrap:  { display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', padding:'3rem 1rem' },
  loadingOrb:   { width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', animation:'pulse 1.5s ease-in-out infinite', boxShadow:'0 0 30px rgba(108,71,255,.5)' },
  card:         { background:'#0d0d1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px', padding:'1.25rem' },
  cardHeader:   { display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1rem' },
  cardIcon:     { fontSize:'1.1rem' },
  cardTitle:    { fontSize:'.95rem', fontWeight:700, color:'#f0f0f8', flex:1, margin:0 },
  rerunBtn:     { padding:'.25rem .7rem', background:'rgba(108,71,255,.15)', border:'1px solid rgba(108,71,255,.3)', borderRadius:'6px', color:'#8b6bff', fontSize:'.72rem', fontWeight:700, cursor:'pointer' },
  scoreLayout:  { display:'flex', gap:'1.5rem', alignItems:'center', flexWrap:'wrap' },
  metaBadge:    { flex:1, minWidth:'150px', background:'#161625', borderRadius:'10px', padding:'.75rem 1rem', display:'flex', flexDirection:'column', gap:'.25rem' },
  analysisItem: { background:'#161625', borderRadius:'10px', padding:'.85rem' },
  analysisLabel:{ fontSize:'.72rem', color:'#8888aa', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.4rem' },
  analysisText: { fontSize:'.83rem', color:'#d0d0e8', lineHeight:1.6 },
  winItem:      { display:'flex', gap:'.6rem', alignItems:'flex-start', padding:'.4rem 0', borderBottom:'1px solid rgba(255,255,255,.04)' },
  recItem:      { display:'flex', gap:'.75rem', alignItems:'flex-start', padding:'.5rem 0', borderBottom:'1px solid rgba(255,255,255,.04)' },
  recNum:       { width:'22px', height:'22px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:800, color:'#fff', flexShrink:0, marginTop:'.1rem' },
};

function ShopAdCard({ ad, onClick }) {
  const cover     = ad.video_info?.cover || ad.imageUrl || '';
  const title     = ad.ad_title || ad.title || 'No Title';
  const startDate = ad.first_shown_date || ad.start_date;
  const endDate   = ad.last_shown_date  || ad.end_date;
  const isActive  = !endDate || new Date(endDate * 1000) > new Date();
  const runDays   = startDate ? Math.floor((Date.now()/1000 - startDate)/86400) : null;
  const likes     = ad.like || ad.metrics?.likes || 0;
  const countries = ad.country_code ? (Array.isArray(ad.country_code) ? ad.country_code : [ad.country_code]) : [];
  const lowImp    = (ad.impression||ad.reach||0) > 0 && (ad.impression||ad.reach||0) < 1000;
  const fmt = (ts) => ts ? new Date(ts*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}) : '—';

  return (
    <div onClick={onClick} className="shop-ad-card" style={SC.card}>
      <div style={SC.thumb}>
        {cover
          ? <img src={cover} alt={title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
          : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'2rem',background:'#161625'}}>🎵</div>
        }
        <span style={{...SC.badge,...(isActive?SC.badgeGreen:SC.badgeGray)}}>{isActive?'● Active':'● Ended'}</span>
        {lowImp && <span style={SC.badgeLow}>⚠️ Low</span>}
      </div>
      <div style={SC.body}>
        <div style={SC.dateRow}>
          <span style={SC.dateChip}>{fmt(startDate)}</span>
          <span style={{color:'#555',fontSize:'.6rem'}}>→</span>
          <span style={SC.dateChip}>{endDate ? fmt(endDate) : 'Today'}</span>
          {runDays!==null && <span style={SC.daysBadge}>{runDays}d</span>}
        </div>
        <p style={SC.title}>{title}</p>
        {countries.length > 0 && (
          <div style={SC.countriesRow}>
            {countries.slice(0,4).map(c => (
              <span key={c} style={SC.flag}>{c.toUpperCase().replace(/./g,ch=>String.fromCodePoint(127397+ch.charCodeAt(0)))}</span>
            ))}
            {countries.length > 4 && <span style={{color:'#8888aa',fontSize:'.65rem'}}>+{countries.length-4}</span>}
          </div>
        )}
        <div style={SC.footer}>
          <span style={SC.likes}>❤️ {likes>999?(likes/1000).toFixed(1)+'k':likes}</span>
          <button onClick={onClick} style={SC.analysisBtn}>🔍 Ad Analysis</button>
        </div>
      </div>
    </div>
  );
}

const SC = {
  card:        {background:'#0f0f1a',border:'1px solid rgba(255,255,255,.07)',borderRadius:'12px',overflow:'hidden',cursor:'pointer',transition:'all .2s',display:'flex',flexDirection:'column'},
  thumb:       {height:'140px',background:'#161625',overflow:'hidden',position:'relative',flexShrink:0},
  badge:       {position:'absolute',top:'7px',left:'7px',borderRadius:'20px',padding:'.2rem .6rem',fontSize:'.63rem',fontWeight:700,border:'1px solid'},
  badgeGreen:  {background:'rgba(74,222,128,.12)',color:'#4ade80',borderColor:'rgba(74,222,128,.3)'},
  badgeGray:   {background:'rgba(255,255,255,.06)',color:'#8888aa',borderColor:'rgba(255,255,255,.1)'},
  badgeLow:    {position:'absolute',top:'7px',right:'7px',background:'rgba(251,146,60,.12)',border:'1px solid rgba(251,146,60,.3)',color:'#fb923c',borderRadius:'20px',padding:'.2rem .5rem',fontSize:'.6rem',fontWeight:700},
  body:        {padding:'.75rem',display:'flex',flexDirection:'column',gap:'.5rem',flex:1},
  dateRow:     {display:'flex',alignItems:'center',gap:'.3rem',flexWrap:'wrap'},
  dateChip:    {background:'#161625',borderRadius:'5px',padding:'.15rem .45rem',fontSize:'.62rem',color:'#8888aa',fontWeight:600},
  daysBadge:   {marginLeft:'auto',background:'rgba(108,71,255,.15)',color:'#8b6bff',borderRadius:'5px',padding:'.15rem .45rem',fontSize:'.62rem',fontWeight:700},
  title:       {fontSize:'.75rem',fontWeight:600,color:'#d0d0e8',margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',lineHeight:1.4},
  countriesRow:{display:'flex',gap:'.25rem',flexWrap:'wrap',alignItems:'center'},
  flag:        {fontSize:'1rem'},
  footer:      {display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto',paddingTop:'.4rem',borderTop:'1px solid rgba(255,255,255,.05)'},
  likes:       {fontSize:'.72rem',color:'#8888aa',fontWeight:600},
  analysisBtn: {padding:'.3rem .7rem',background:'rgba(108,71,255,.15)',border:'1px solid rgba(108,71,255,.3)',borderRadius:'6px',color:'#8b6bff',fontSize:'.68rem',fontWeight:700,cursor:'pointer'},
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// API_BASE mein /api already ho sakta hai (Railway env) — double /api avoid karo
const STREAM_BASE = API_BASE.endsWith('/api') ? API_BASE : API_BASE + '/api';

function makeProxyUrl(rawUrl) {
  if (!rawUrl) return '';
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  return `${STREAM_BASE}/ads/video/stream?url=${encodeURIComponent(rawUrl)}&token=${encodeURIComponent(token)}`;
}

// ✅ VideoPlayer — FB button BILKUL NAHI, sirf image/video dikhao
function VideoPlayer({ videoUrl, tiktokItemUrl, cover, title, adId, isMeta }) {
  const videoRef    = useRef(null);
  const progressRef = useRef(null);
  const hideTimer   = useRef(null);
  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [dlProgress,   setDlProgress]   = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError,   setVideoError]   = useState(false);
  const [realVideoUrl, setRealVideoUrl] = useState('');
  const [urlLoading,   setUrlLoading]   = useState(false);
  const [useFallback,  setUseFallback]  = useState(false);

  useEffect(() => {
    if (isMeta) {
      // Pehle proxy try karo, error pe seedha R2 URL use hoga
      if (videoUrl) setRealVideoUrl(makeProxyUrl(videoUrl));
      setUrlLoading(false);
      return;
    }
    if (!adId) return;
    setUrlLoading(true); setVideoError(false);
    api.get('/ads/video/url', { params: { video_id: adId, tiktok_url: tiktokItemUrl || '' } })
      .then(res => {
        if (res.data?.play_url) setRealVideoUrl(res.data.play_url);
        else setRealVideoUrl(makeProxyUrl(videoUrl));
      })
      .catch(() => setRealVideoUrl(makeProxyUrl(videoUrl)))
      .finally(() => setUrlLoading(false));
  }, [adId, tiktokItemUrl, isMeta, videoUrl]); // eslint-disable-line

  // Proxy error aaye toh seedha R2 URL use karo
  const proxyUrl = useFallback
    ? videoUrl
    : (realVideoUrl || makeProxyUrl(videoUrl));
  const fmtTime  = (s) => !s||isNaN(s)?'0:00':`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  const showCtrl = () => {
    setShowControls(true); clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPlaying(p => { if(p) setShowControls(false); return p; }), 3000);
  };
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
    showCtrl();
  };
  const onTimeUpdate = () => {
    const v = videoRef.current; if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime/v.duration)*100 : 0);
  };
  const onLoaded = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const seek = (e) => {
    const v = videoRef.current; const bar = progressRef.current; if (!v||!bar) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
    v.currentTime = pct * v.duration; showCtrl();
  };
  const changeVolume = (e) => {
    const vol = parseFloat(e.target.value); setVolume(vol); setMuted(vol===0);
    if (videoRef.current) videoRef.current.volume = vol;
  };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !muted; setMuted(!muted); showCtrl();
  };
  const downloadVideo = async () => {
    if (!videoUrl) return toast.error('Video URL nahi mili');
    setDownloading(true); setDlProgress(0);
    try {
      const token = localStorage.getItem('accessToken');
      const filename = `advault-ad-${adId||Date.now()}.mp4`;
      const url = `${STREAM_BASE}/ads/video/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`;
      const response = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
      if (!response.ok) throw new Error('fail');
      const total = parseInt(response.headers.get('content-length')||'0');
      const reader = response.body.getReader(); const chunks = []; let received = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        chunks.push(value); received += value.length;
        if (total) setDlProgress(Math.round((received/total)*100));
      }
      const blob = new Blob(chunks,{type:'video/mp4'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = filename; a.click(); URL.revokeObjectURL(a.href);
      toast.success('Video download ho gayi! 🎉');
    } catch {
      const a = document.createElement('a'); a.href = videoUrl; a.target = '_blank';
      a.download = `advault-ad-${adId||Date.now()}.mp4`; a.click();
      toast.success('Download shuru ho gaya!');
    }
    setDownloading(false); setDlProgress(0);
  };

  if (urlLoading) return (
    <div style={{...VP.wrap,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}>
      {cover && <img src={cover} alt={title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(3px)',opacity:.4}} />}
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',gap:'.75rem'}}>
        <div style={{width:'40px',height:'40px',border:'3px solid rgba(108,71,255,.2)',borderTop:'3px solid #6c47ff',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <span style={{color:'rgba(255,255,255,.8)',fontSize:'.78rem',fontWeight:600}}>Video load ho rahi hai...</span>
      </div>
    </div>
  );

  // ✅ Video nahi hai — sirf image dikhao, koi FB button nahi
  if (!videoUrl || videoError) return (
    <div style={VP.wrap}>
      {cover
        ? <img src={cover} alt={title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
        : <div style={VP.noVideo}>📣<p style={{color:'#8888aa',fontSize:'.8rem',marginTop:'.5rem'}}>Media nahi mili</p></div>
      }
      {/* TikTok fallback only — Meta ke liye kuch nahi */}
      {videoError && videoUrl && !isMeta && (
        <div style={{position:'absolute',bottom:'12px',left:0,right:0,display:'flex',justifyContent:'center'}}>
          <a href={videoUrl} target="_blank" rel="noreferrer"
            style={{background:'rgba(108,71,255,.92)',color:'#fff',padding:'.45rem 1.2rem',borderRadius:'8px',fontSize:'.78rem',fontWeight:700,textDecoration:'none'}}>
            ▶ TikTok pe dekho
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div style={VP.wrap} onMouseMove={showCtrl} onClick={togglePlay}>
      <video ref={videoRef} src={proxyUrl} poster={cover} style={VP.video}
        onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoaded}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onError={() => {
          if (isMeta && !useFallback) {
            // Proxy fail — seedha R2 URL try karo
            setUseFallback(true);
          } else {
            setVideoError(true);
          }
        }} playsInline preload="metadata" />
      {!playing && <div style={VP.playOverlay}><div style={VP.playCircle}>▶</div></div>}
      <div style={{...VP.controls,opacity:showControls?1:0,transition:'opacity .3s'}} onClick={e=>e.stopPropagation()}>
        <div ref={progressRef} style={VP.progressTrack} onClick={seek}>
          <div style={{...VP.progressFill,width:progress+'%'}} />
          <div style={{...VP.progressThumb,left:progress+'%'}} />
        </div>
        <div style={VP.ctrlRow}>
          <button style={VP.ctrlBtn} onClick={togglePlay}>{playing?'⏸':'▶'}</button>
          <span style={VP.timeText}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          <div style={{flex:1}} />
          <button style={VP.ctrlBtn} onClick={toggleMute}>{muted||volume===0?'🔇':volume<0.5?'🔉':'🔊'}</button>
          <input type="range" min="0" max="1" step="0.05" value={muted?0:volume}
            onChange={changeVolume} onClick={e=>e.stopPropagation()} style={VP.volSlider} />
          <button style={{...VP.dlBtn,...(downloading?VP.dlBtnActive:{})}}
            onClick={e=>{e.stopPropagation();downloadVideo();}} disabled={downloading}>
            {downloading?(dlProgress>0?`${dlProgress}%`:'⏳'):'⬇ Download'}
          </button>
        </div>
      </div>
      {downloading && dlProgress > 0 && (
        <div style={VP.dlProgressWrap}><div style={{...VP.dlProgressBar,width:dlProgress+'%'}} /></div>
      )}
    </div>
  );
}

const VP = {
  wrap:          {borderRadius:'16px',overflow:'hidden',background:'#0f0f1a',position:'relative',aspectRatio:'9/16',width:'100%',maxWidth:'400px',margin:'0 auto',cursor:'pointer',userSelect:'none'},
  video:         {width:'100%',height:'100%',objectFit:'cover',display:'block'},
  noVideo:       {display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'3rem',background:'#161625'},
  playOverlay:   {position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.3)',backdropFilter:'blur(1px)'},
  playCircle:    {width:'60px',height:'60px',borderRadius:'50%',background:'rgba(108,71,255,.85)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',color:'#fff',boxShadow:'0 0 30px rgba(108,71,255,.5)'},
  controls:      {position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.85))',padding:'.5rem .75rem .75rem'},
  progressTrack: {height:'4px',background:'rgba(255,255,255,.2)',borderRadius:'2px',cursor:'pointer',position:'relative',marginBottom:'.6rem'},
  progressFill:  {height:'100%',background:'linear-gradient(90deg,#6c47ff,#8b6bff)',borderRadius:'2px',pointerEvents:'none'},
  progressThumb: {position:'absolute',top:'50%',transform:'translate(-50%,-50%)',width:'12px',height:'12px',borderRadius:'50%',background:'#fff',boxShadow:'0 0 6px rgba(108,71,255,.8)',pointerEvents:'none'},
  ctrlRow:       {display:'flex',alignItems:'center',gap:'.4rem'},
  ctrlBtn:       {background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:'1rem',padding:'.1rem .2rem',lineHeight:1},
  timeText:      {fontSize:'.7rem',color:'rgba(255,255,255,.8)',fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'},
  volSlider:     {width:'60px',cursor:'pointer',accentColor:'#6c47ff',background:'transparent'},
  dlBtn:         {padding:'.3rem .7rem',background:'linear-gradient(135deg,#6c47ff,#8b6bff)',border:'none',borderRadius:'6px',color:'#fff',fontSize:'.72rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s'},
  dlBtnActive:   {background:'rgba(108,71,255,.4)',cursor:'not-allowed'},
  dlProgressWrap:{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:'rgba(255,255,255,.1)'},
  dlProgressBar: {height:'100%',background:'#4ade80',transition:'width .3s',borderRadius:'2px'},
};

function CircleRing({ active, total }) {
  const pct = total > 0 ? Math.min((active/total)*100,100) : 0;
  const r = 42; const circ = 2*Math.PI*r; const dash = (pct/100)*circ;
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8"/>
      <circle cx="54" cy="54" r={r} fill="none" stroke="#6c47ff" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ*0.25}
        style={{transition:'stroke-dasharray 1s ease'}}/>
      <text x="54" y="48" textAnchor="middle" fill="#f0f0f8" fontSize="18" fontWeight="800">{active}</text>
      <text x="54" y="64" textAnchor="middle" fill="#8888aa" fontSize="10">/ {total}</text>
      <text x="54" y="76" textAnchor="middle" fill="#8888aa" fontSize="9">Active Ads</text>
    </svg>
  );
}

function PageDetailsCard({ pageDetails, pageLoading, brand, impression }) {
  const fmtNum  = (n) => !n?'—':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':n.toLocaleString();
  const fmtDate = (ts) => ts?new Date(ts*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
  const lowImp  = impression != null && impression < 1000;
  return (
    <div style={PD.wrap}>
      <div style={PD.header}>
        <span>🏢</span>
        <span style={PD.headerTitle}>Page Details</span>
        <a href={`https://www.tiktok.com/search?q=${encodeURIComponent(brand)}`} target="_blank" rel="noreferrer" style={PD.pageLink}>↗ Page</a>
      </div>
      {pageLoading ? (
        <div style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'1rem 0'}}>
          <div style={{width:'20px',height:'20px',border:'2px solid rgba(108,71,255,.2)',borderTop:'2px solid #6c47ff',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
          <span style={{color:'#8888aa',fontSize:'.8rem'}}>Loading page info...</span>
        </div>
      ) : pageDetails ? (
        <>
          <div style={PD.ringRow}>
            <CircleRing active={pageDetails.activeAds} total={pageDetails.totalAds} />
            <div style={PD.statsCol}>
              {[
                ['📅 Created On', fmtDate(pageDetails.createdOn)],
                ['📢 Active Ads', pageDetails.activeAds],
                ['📦 Total Ads',  pageDetails.totalAds>=1000?(pageDetails.totalAds/1000).toFixed(1)+'k':pageDetails.totalAds],
                ['👁 Reach',      fmtNum(pageDetails.totalReach)],
                ['💰 Total Spend',pageDetails.totalSpend?`$${pageDetails.totalSpend.toLocaleString()}`:'—'],
              ].map(([k,v])=>(
                <div key={k} style={PD.statRow}>
                  <span style={PD.statKey}>{k}</span>
                  <span style={PD.statVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {lowImp && (
            <div style={PD.lowWarn}>
              <span>⚠️</span>
              <div>
                <div style={{fontWeight:700,fontSize:'.78rem',color:'#fb923c'}}>Low Impression Count</div>
                <div style={{fontSize:'.7rem',color:'#8888aa',marginTop:'.15rem'}}>Is ad ke impressions abhi kam hain ({impression.toLocaleString()}).</div>
              </div>
            </div>
          )}
          <div style={PD.dupRow}>
            <span style={PD.statKey}>🔁 Duplicates</span>
            <span style={{...PD.statVal,color:'#8888aa'}}>—</span>
          </div>
        </>
      ) : (
        <div style={{padding:'1rem 0',color:'#8888aa',fontSize:'.8rem'}}>Page data available nahi hai</div>
      )}
    </div>
  );
}

const PD = {
  wrap:       {background:'#0d0d1a',border:'1px solid rgba(255,255,255,.07)',borderRadius:'14px',padding:'1.2rem',display:'flex',flexDirection:'column',gap:'.85rem'},
  header:     {display:'flex',alignItems:'center',gap:'.5rem'},
  headerTitle:{fontWeight:700,fontSize:'.9rem',color:'#f0f0f8',flex:1},
  pageLink:   {fontSize:'.75rem',color:'#6c47ff',textDecoration:'none',fontWeight:600,border:'1px solid rgba(108,71,255,.3)',padding:'.2rem .6rem',borderRadius:'6px'},
  ringRow:    {display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'},
  statsCol:   {flex:1,minWidth:'140px',display:'flex',flexDirection:'column',gap:'.5rem'},
  statRow:    {display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.5rem'},
  statKey:    {fontSize:'.73rem',color:'#8888aa',fontWeight:600,flexShrink:0},
  statVal:    {fontSize:'.78rem',color:'#f0f0f8',fontWeight:700,textAlign:'right'},
  lowWarn:    {display:'flex',gap:'.6rem',alignItems:'flex-start',background:'rgba(251,146,60,.07)',border:'1px solid rgba(251,146,60,.2)',borderRadius:'10px',padding:'.75rem'},
  dupRow:     {display:'flex',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:'.7rem'},
};

export default function AdDetail() {
  const { adId }   = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const [detail,       setDetail]       = useState(null);
  const [brandAds,     setBrandAds]     = useState([]);
  const [pageDetails,  setPageDetails]  = useState(null);
  const [pageLoading,  setPageLoading]  = useState(false);
  const [loading,      setLoading]      = useState(!location.state?.ad);
  const [brandLoading, setBrandLoading] = useState(false);
  const [relatedAds,   setRelatedAds]   = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [activeTab,    setActiveTab]    = useState('overview');
  const [copied,       setCopied]       = useState(false);

  const passedAd = location.state?.ad || null;

  useEffect(() => {
    if (passedAd) {
      setDetail(passedAd);
      const advId = passedAd?.advertiser_id || passedAd?.brand_id;
      if (advId) { fetchBrandAds(advId); fetchPageDetails(advId); }
      fetchRelatedAds(passedAd);
      setLoading(false);
    } else {
      fetchDetail();
    }
  }, [adId]); // eslint-disable-line

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res  = await api.get(`/ads/tiktok/${adId}`);
      const data = res.data?.data?.data || res.data?.data || res.data || {};
      setDetail(data);
      const advId = data.advertiser_id || data.brand_id || passedAd?.advertiser_id;
      if (advId) { fetchBrandAds(advId); fetchPageDetails(advId); }
      fetchRelatedAds(data);
    } catch {
      if (passedAd) {
        setDetail(passedAd);
        const advId = passedAd?.advertiser_id || passedAd?.brand_id;
        if (advId) fetchPageDetails(advId);
        fetchRelatedAds(passedAd);
      }
    }
    setLoading(false);
  };

  const fetchPageDetails = async (advId) => {
    setPageLoading(true);
    try {
      const res    = await api.get(`/ads/advertiser/${advId}`);
      const allAds = res.data?.data || [];
      const active = allAds.filter(a => { const e=a.last_shown_date||a.end_date; return !e||new Date(e*1000)>new Date(); });
      const first  = allAds.reduce((m,a)=>{ const d=a.first_shown_date||a.start_date||Infinity; return d<m?d:m; }, Infinity);
      setPageDetails({
        totalAds:  allAds.length, activeAds: active.length,
        totalReach:allAds.reduce((s,a)=>s+(a.impression||a.reach||0),0),
        totalSpend:allAds.reduce((s,a)=>s+(a.cost||a.spend||0),0),
        createdOn: first!==Infinity?first:null,
      });
    } catch(e) { console.error(e); }
    setPageLoading(false);
  };

  const fetchBrandAds = async (advId) => {
    setBrandLoading(true);
    try {
      const res = await api.get(`/ads/advertiser/${advId}`);
      const ads = res.data?.data || [];
      setBrandAds(ads.filter(a=>(a.id||a.ad_id)!==adId).slice(0,8));
    } catch(e) { console.error(e); }
    setBrandLoading(false);
  };

  const fetchRelatedAds = async (adData) => {
    setRelatedLoading(true);
    try {
      const industry = adData?.industry_key?.replace('label_','') || adData?.industry || '';
      const keyword  = adData?.ad_title || adData?.title || '';
      const country  = Array.isArray(adData?.country_code) ? (adData.country_code[0]||'US') : (adData?.country_code||'US');
      const currentId = adData?.id || adData?.ad_id || adData?.material_id || adId;
      const params = new URLSearchParams({ country, limit: 12, exclude: currentId });
      if (industry) params.append('industry', industry);
      if (keyword)  params.append('keyword',  keyword.split(' ').slice(0,3).join(' '));
      const res  = await api.get(`/ads/related/${currentId}?${params}`);
      setRelatedAds(res.data?.data || []);
    } catch(e) { console.error('Related ads fetch error:', e); }
    setRelatedLoading(false);
  };

  const saveAd = async () => {
    const ad = detail||passedAd; if(!ad) return;
    try {
      await api.post('/ads/save', { adId, adData:{ title:ad.ad_title||ad.title, brand:ad.brand_name||'Unknown', cover:ad.video_info?.cover||'', platform:'tiktok' } });
      setSaved(true); toast.success('Ad save ho gayi!');
    } catch(err) { toast.error(err.response?.data?.message||'Save fail'); }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true); toast.success('Copy ho gaya!');
    setTimeout(()=>setCopied(false),2000);
  };

  const ad = detail||passedAd||{};
  const isMeta = !!(ad.page_name || ad.library_id || ad.snapshot_url || ad._source === 'mongodb_scraped');

  useEffect(() => {
    if (isMeta && ad.library_id) {
      api.post('/ads/meta/' + ad.library_id + '/view').catch(() => {});
    }
  }, [ad.library_id]); // eslint-disable-line

  const title = isMeta
    ? (ad.page_name || ad.ad_creative_bodies?.[0]?.slice(0,60) || ad.body || 'Ad Detail')
    : (ad.ad_title || ad.title || 'Ad Detail');
  const brand = isMeta
    ? (ad.page_name || ad.brand || 'Unknown Brand')
    : (ad.brand_name || ad.advertiser_name || 'Unknown Brand');

  // ✅ Cover — R2 pehle
  const cover = isMeta
    ? (ad.r2_image_url || ad.image || ad.ad_snapshot_url || ad.imageUrl || '')
    : (ad.video_info?.cover || ad.imageUrl || '');

  // ✅ Video — R2 pehle
  const videoUrlObj = ad.video_info?.video_url;
  const tiktokVideoUrl = (videoUrlObj && typeof videoUrlObj === 'object')
    ? (videoUrlObj['1080p'] || videoUrlObj['720p'] || videoUrlObj['540p'] || videoUrlObj['480p'] || videoUrlObj['360p'] || Object.values(videoUrlObj)[0] || '')
    : (typeof videoUrlObj === 'string' ? videoUrlObj : ad.video_url || '');

  const metaVideoUrl = ad.r2_video_url || ad.video_url || ad.video || '';
  const videoUrl = isMeta ? metaVideoUrl : tiktokVideoUrl;
  const tiktokItemUrl = ad.tiktok_item_url || ad.share_url || ad.item_url || '';
  const isVideo = isMeta ? !!(metaVideoUrl) : !!(ad.video_info || ad.isVideo);

  const likes       = Number(ad.like || 0);
  const comments    = Number(ad.comment || 0);
  const favorite    = Number(ad.favorite || 0);
  const share       = Number(ad.share || 0);
  const ctr         = ad.ctr ? (Number(ad.ctr) * 100).toFixed(2) + '%' : '—';
  const cost        = Number(ad.cost || 0);
  const costFmt     = cost ? '$' + cost.toLocaleString() : '—';
  const impression  = Number(ad.impression || ad.reach || 0);
  const rawCountries = ad.country_code || ad.country_codes || ad.countries || [];
  const countries    = Array.isArray(rawCountries) ? rawCountries : (rawCountries ? [rawCountries] : []);
  const rawStart    = ad.first_shown_date || ad.start_date || ad.create_time || null;
  const rawEnd      = ad.last_shown_date  || ad.end_date   || null;
  const startDate   = rawStart && rawStart > 1e10 ? Math.floor(rawStart/1000) : rawStart;
  const endDate     = rawEnd   && rawEnd   > 1e10 ? Math.floor(rawEnd/1000)   : rawEnd;
  const isActive    = ad.is_search !== undefined ? true : (!endDate || new Date(endDate*1000) > new Date());
  const runningDays = startDate ? Math.floor((Date.now()/1000 - startDate) / 86400) : null;
  const transcript  = ad.ad_text || ad.description || ad.caption || ad.ad_title || '';
  const objective   = ad.objective_key?.replace('campaign_objective_','') || ad.objective || '';
  const industry    = ad.industry_key?.replace('label_','') || '';
  const fmtDate     = (ts)=>ts?new Date(ts*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';

  if (loading && !passedAd) return (
    <div style={{minHeight:'100vh',background:'#08080f',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}>
      <div style={S.spinner}></div>
      <p style={{color:'#8888aa'}}>Ad detail load ho raha hai...</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#08080f',color:'#f0f0f8',fontFamily:'system-ui,sans-serif'}}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:.8} }
        .shop-ad-card:hover { border-color:rgba(108,71,255,.4)!important; transform:translateY(-3px); box-shadow:0 8px 24px rgba(108,71,255,.12); }
        .action-btn:hover { opacity:.85; transform:translateY(-1px); }
        @media(max-width:640px){ .hero-grid { grid-template-columns:1fr!important; } }
      `}</style>

      {/* TOP BAR */}
      <div style={S.topBar}>
        <button onClick={()=>navigate(-1)} style={S.backBtn}>← Wapas</button>
        <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap'}}>
          <button className="action-btn" style={{...S.pill,...(saved?S.pillSaved:{})}} onClick={saveAd} disabled={saved}>
            {saved?'✅ Saved':'💾 Save Ad'}
          </button>
          {/* ✅ Meta ke liye TikTok button nahi — sirf TikTok ads ke liye */}
          {!isMeta && (
            <a href={ad.tiktok_url||`https://www.tiktok.com/search?q=${encodeURIComponent(title)}`}
              target="_blank" rel="noreferrer" className="action-btn" style={S.pillOutline}>🔗 TikTok</a>
          )}
        </div>
      </div>

      <div style={S.page}>
        {/* HERO */}
        <div className="hero-grid" style={S.hero}>
          <div className="media-wrap" style={S.mediaWrap}>
            {/* ✅ fbSnapUrl prop hata diya — VideoPlayer mein FB button nahi */}
            <VideoPlayer
              videoUrl={videoUrl}
              tiktokItemUrl={tiktokItemUrl}
              cover={cover}
              title={title}
              adId={adId}
              isMeta={isMeta}
            />
            {isActive && <span style={S.activeBadge}>● STILL ACTIVE</span>}
            {impression>0 && impression<1000 && <span style={S.lowImpBadge}>⚠️ Low Impression</span>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem',animation:'fadeIn .4s ease'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,#6c47ff,#ff4f87)',flexShrink:0}}></div>
              <div>
                <div style={{fontWeight:700,fontSize:'.95rem'}}>{brand}</div>
                <div style={{fontSize:'.72rem',color:'#8888aa'}}>{isMeta ? '📣 Meta Advertiser' : '🎵 TikTok Advertiser'}</div>
              </div>
            </div>
            <h1 style={{fontSize:'clamp(1rem,2.5vw,1.4rem)',fontWeight:800,lineHeight:1.35,margin:0}}>{title}</h1>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
              {objective && <span style={S.tagPurple}>{objective}</span>}
              {industry  && <span style={S.tagGray}>{industry}</span>}
              {isActive  && <span style={S.tagGreen}>● Active</span>}
            </div>
            <div style={S.runBox}>
              <div style={S.runRow}><span style={S.runKey}>📅 Running Time</span><span style={S.runVal}>{fmtDate(startDate)} → {endDate?fmtDate(endDate):'Today'}</span></div>
              {runningDays!==null && <div style={S.runRow}><span style={S.runKey}>⏱ Days Running</span><span style={S.runVal}>{runningDays} days</span></div>}
              <div style={S.runRow}><span style={S.runKey}>🌍 Countries</span><span style={S.runVal}>{countries.length>0?countries.slice(0,6).map(c=>`${countryFlag(c)} ${c}`).join('  '):'—'}</span></div>
              <div style={S.runRow}><span style={S.runKey}>💰 Spend</span><span style={S.runVal}>{costFmt}</span></div>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.6rem'}}>
              <StatBox icon="❤️" label="Likes"    value={likes>=1000?(likes/1000).toFixed(1)+'K':likes.toLocaleString()} />
              <StatBox icon="💬" label="Comments" value={comments.toLocaleString()} />
              <StatBox icon="📊" label="CTR"      value={ctr} />
              <StatBox icon="💰" label="Spend"    value={costFmt} />
              {favorite>0 && <StatBox icon="⭐" label="Saves" value={favorite>=1000?(favorite/1000).toFixed(1)+'K':favorite.toLocaleString()} />}
              {share>0    && <StatBox icon="↗️" label="Share" value={share>=1000?(share/1000).toFixed(1)+'K':share.toLocaleString()} />}
            </div>
          </div>
        </div>

        {/* PAGE DETAILS */}
        <div style={{marginBottom:'1.75rem'}}>
          <PageDetailsCard pageDetails={pageDetails} pageLoading={pageLoading} brand={brand} impression={impression} />
        </div>

        {/* TABS */}
        <div style={S.tabBar}>
          <TabBtn active={activeTab==='overview'}   onClick={()=>setActiveTab('overview')}>📋 Overview</TabBtn>
          <TabBtn active={activeTab==='related'}    onClick={()=>setActiveTab('related')}>🔗 Related Products</TabBtn>
          <TabBtn active={activeTab==='ai'}         onClick={()=>setActiveTab('ai')}>🤖 AI Analysis</TabBtn>
          <TabBtn active={activeTab==='transcript'} onClick={()=>setActiveTab('transcript')}>📝 Transcript</TabBtn>
        </div>

        {activeTab==='overview' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeIn .3s ease'}}>
            <div style={S.card}>
              <h3 style={S.cardTitle}>📋 Ad Details</h3>
              <div style={S.grid}>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Status</span>
                  <span style={{...S.detailVal,color:isActive?'#4ade80':'#f87171'}}>{isActive?'● Active':'● Ended'}</span>
                </div>
                {[
                  ['Start Date',   fmtDate(startDate)],
                  ['End Date',     endDate?fmtDate(endDate):'Still Running'],
                  ['Days Running', runningDays!==null?`${runningDays} days`:'—'],
                  ['Objective',    objective||'—'],
                  ['Industry',     industry||'—'],
                  ['Spend',        costFmt],
                  ['CTR',          ctr],
                  ['Likes',        likes>=1000?(likes/1000).toFixed(1)+'K':likes.toLocaleString()],
                  ['Comments',     comments.toLocaleString()],
                  ['Saves',        favorite>0?favorite.toLocaleString():'—'],
                  ['Shares',       share>0?share.toLocaleString():'—'],
                  ['Format',       isVideo?'Video':'Image'],
                ].map(([k,v])=>(
                  <div key={k} style={S.detailItem}>
                    <span style={S.detailKey}>{k}</span>
                    <span style={S.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
              {countries.length>0 && (
                <div style={{marginTop:'1.25rem'}}>
                  <div style={{...S.detailKey,marginBottom:'.5rem'}}>🌍 Targeted Countries</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                    {countries.map(c=><span key={c} style={S.chip}>{countryFlag(c)} {c}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div style={S.card}>
              <h3 style={S.cardTitle}>📈 Performance</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:'.75rem'}}>
                <StatBox icon="❤️" label="Likes"     value={likes>=1000?(likes/1000).toFixed(1)+'K':likes.toLocaleString()} />
                <StatBox icon="💬" label="Comments"  value={comments.toLocaleString()} />
                <StatBox icon="📊" label="CTR"       value={ctr} />
                <StatBox icon="💰" label="Spend"     value={costFmt} />
                {favorite>0 && <StatBox icon="⭐" label="Saves"   value={favorite>=1000?(favorite/1000).toFixed(1)+'K':favorite.toLocaleString()} />}
                {share>0    && <StatBox icon="↗️" label="Shares"  value={share>=1000?(share/1000).toFixed(1)+'K':share.toLocaleString()} />}
                <StatBox icon="⏱" label="Days Run" value={runningDays??'—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab==='related' && (
          <div style={{animation:'fadeIn .3s ease'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.65rem',marginBottom:'.4rem',flexWrap:'wrap'}}>
              <span style={{fontSize:'1.3rem'}}>✨</span>
              <h3 style={{fontSize:'1rem',fontWeight:800,color:'#f0f0f8',margin:0,flex:1}}>Related Products</h3>
              {!relatedLoading && relatedAds.length > 0 && (
                <span style={{background:'linear-gradient(135deg,rgba(108,71,255,.2),rgba(139,107,255,.15))',border:'1px solid rgba(108,71,255,.35)',color:'#8b6bff',borderRadius:'20px',padding:'.2rem .8rem',fontSize:'.75rem',fontWeight:700}}>{relatedAds.length} similar ads</span>
              )}
            </div>
            <p style={{color:'#8888aa',fontSize:'.83rem',margin:'0 0 1.5rem',lineHeight:1.5}}>Same industry ke trending ads</p>
            {relatedLoading ? (
              <div style={{display:'flex',alignItems:'center',gap:'1rem',padding:'2rem 0'}}>
                <div style={S.spinner}></div>
                <span style={{color:'#8888aa',fontSize:'.85rem'}}>Similar ads dhundh raha hai...</span>
              </div>
            ) : relatedAds.length > 0 ? (
              <div style={RP.grid}>
                {relatedAds.map((a, i) => (
                  <div key={a.id||a.ad_id||a.material_id||i} className="shop-ad-card" style={RP.card}
                    onClick={() => navigate(`/ad/${a.id||a.ad_id||a.material_id}`, { state: { ad: a } })}>
                    <div style={RP.cardMedia}>
                      {a.video_info?.cover || a.imageUrl ? (
                        <img src={a.video_info?.cover || a.imageUrl} alt={a.ad_title||a.title||'Ad'} style={RP.cardImg} onError={e=>{e.target.style.display='none';}} />
                      ) : (
                        <div style={RP.cardNoImg}>🎬</div>
                      )}
                      {(a.video_info||a.isVideo) && <span style={RP.videoBadge}>▶ Video</span>}
                      {(!a.last_shown_date||new Date(a.last_shown_date*1000)>new Date()) && <span style={RP.activeBadge}>● Live</span>}
                    </div>
                    <div style={RP.cardInfo}>
                      <div style={RP.cardBrand}>{a.brand_name||a.advertiser_name||'Unknown Brand'}</div>
                      <div style={RP.cardTitle2}>{(a.ad_title||a.title||'Untitled').substring(0,60)}{(a.ad_title||a.title||'').length>60?'…':''}</div>
                      <div style={RP.cardMeta}>
                        <span style={RP.metaItem}>❤️ {a.like>=1000?(a.like/1000).toFixed(1)+'K':(a.like||0).toLocaleString()}</span>
                        {a.ctr>0 && <span style={RP.metaItem}>📊 {(a.ctr*100).toFixed(1)}%</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.empty}>
                <p style={{fontSize:'2.5rem',margin:0}}>🔍</p>
                <p style={{color:'#8888aa',margin:0,fontSize:'.88rem'}}>Koi related ads nahi mile</p>
              </div>
            )}
          </div>
        )}

        {activeTab==='ai' && (
          <div style={{animation:'fadeIn .3s ease'}}>
            <AIAnalysisTab ad={ad} adId={adId} />
          </div>
        )}

        {activeTab==='transcript' && (
          <div style={{animation:'fadeIn .3s ease'}}>
            <div style={S.card}>
              <h3 style={S.cardTitle}>📝 Ad Transcript / Caption</h3>
              {transcript ? (
                <>
                  <div style={S.transcriptBox}>{transcript}</div>
                  <button style={{...S.copyBtn,background:copied?'rgba(74,222,128,.15)':'rgba(108,71,255,.2)',color:copied?'#4ade80':'#8b6bff',borderColor:copied?'rgba(74,222,128,.3)':'rgba(108,71,255,.3)'}} onClick={copyTranscript}>
                    {copied?'✅ Copied!':'📋 Copy Text'}
                  </button>
                </>
              ) : (
                <div style={S.empty}>
                  <p style={{fontSize:'2rem',margin:0}}>📭</p>
                  <p style={{color:'#8888aa',margin:0}}>Is ad ka transcript available nahi hai</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADS FROM THIS SHOP */}
      <div style={SS.shopSection}>
        <div style={SS.shopHeader}>
          <div style={SS.brandRow}>
            <div style={SS.brandAvatar}>{brand.charAt(0).toUpperCase()}</div>
            <div><div style={SS.brandName}>{brand}</div><div style={SS.brandSub}>{isMeta ? '📣 Meta Advertiser' : '🎵 TikTok Advertiser'}</div></div>
          </div>
          <div style={SS.titleCol}>
            <h2 style={SS.shopTitle}>Ads from this shop</h2>
            {!brandLoading && brandAds.length>0 && <span style={SS.countBadge}>{brandAds.length} ads</span>}
          </div>
        </div>
        {brandLoading ? (
          <div style={SS.loadingRow}><div style={S.spinner}></div><span style={{color:'#8888aa',fontSize:'.85rem'}}>Shop ke ads load ho rahe hain...</span></div>
        ) : brandAds.length>0 ? (
          <div style={SS.grid}>
            {brandAds.map((a,i)=>(
              <ShopAdCard key={a.id||a.ad_id||i} ad={a} onClick={()=>navigate(`/ad/${a.id||a.ad_id}`,{state:{ad:a}})} />
            ))}
          </div>
        ) : (
          <div style={S.empty}>
            <p style={{fontSize:'2.5rem',margin:0}}>🏪</p>
            <p style={{color:'#8888aa',margin:0,fontSize:'.88rem'}}>Is brand ke aur ads nahi mile</p>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  spinner:    {width:'36px',height:'36px',border:'3px solid rgba(108,71,255,.2)',borderTop:'3px solid #6c47ff',borderRadius:'50%',animation:'spin 1s linear infinite'},
  topBar:     {position:'sticky',top:0,zIndex:100,background:'rgba(8,8,15,.92)',backdropFilter:'blur(14px)',padding:'.75rem clamp(1rem,4vw,2rem)',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,.06)'},
  backBtn:    {background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'#8888aa',padding:'.4rem 1rem',borderRadius:'8px',cursor:'pointer',fontSize:'.82rem',fontWeight:600},
  pill:       {padding:'.45rem 1.1rem',borderRadius:'20px',border:'none',background:'linear-gradient(135deg,#6c47ff,#8b6bff)',color:'#fff',fontWeight:700,fontSize:'.8rem',cursor:'pointer',transition:'all .2s'},
  pillSaved:  {background:'rgba(108,71,255,.2)',color:'#8b6bff',border:'1px solid rgba(108,71,255,.3)'},
  pillOutline:{padding:'.45rem 1.1rem',borderRadius:'20px',border:'1px solid rgba(255,255,255,.12)',background:'transparent',color:'#8888aa',fontWeight:600,fontSize:'.8rem',cursor:'pointer',textDecoration:'none',transition:'all .2s',display:'inline-block'},
  page:       {padding:'1.5rem clamp(1rem,4vw,2rem) 3rem',maxWidth:'1100px',margin:'0 auto'},
  hero:       {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(300px,100%),1fr))',gap:'2rem',marginBottom:'2rem',alignItems:'start'},
  mediaWrap:  {borderRadius:'16px',overflow:'hidden',background:'#0f0f1a',position:'relative'},
  activeBadge:{position:'absolute',top:'10px',left:'10px',background:'rgba(74,222,128,.15)',border:'1px solid rgba(74,222,128,.3)',color:'#4ade80',borderRadius:'20px',padding:'.25rem .75rem',fontSize:'.7rem',fontWeight:700,zIndex:10},
  lowImpBadge:{position:'absolute',top:'10px',right:'10px',background:'rgba(251,146,60,.15)',border:'1px solid rgba(251,146,60,.3)',color:'#fb923c',borderRadius:'20px',padding:'.25rem .65rem',fontSize:'.65rem',fontWeight:700,zIndex:10},
  tagPurple:  {background:'rgba(108,71,255,.2)',color:'#8b6bff',border:'1px solid rgba(108,71,255,.3)',borderRadius:'20px',padding:'.2rem .75rem',fontSize:'.72rem',fontWeight:700},
  tagGray:    {background:'rgba(255,255,255,.06)',color:'#8888aa',borderRadius:'20px',padding:'.2rem .75rem',fontSize:'.72rem'},
  tagGreen:   {background:'rgba(74,222,128,.1)',color:'#4ade80',border:'1px solid rgba(74,222,128,.25)',borderRadius:'20px',padding:'.2rem .75rem',fontSize:'.72rem',fontWeight:700},
  runBox:     {background:'#0f0f1a',border:'1px solid rgba(255,255,255,.07)',borderRadius:'12px',padding:'1rem',display:'flex',flexDirection:'column',gap:'.65rem'},
  runRow:     {display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'.5rem',flexWrap:'wrap'},
  runKey:     {fontSize:'.75rem',color:'#8888aa',fontWeight:600,flexShrink:0},
  runVal:     {fontSize:'.82rem',color:'#f0f0f8',fontWeight:600,textAlign:'right'},
  tabBar:     {display:'flex',gap:'.4rem',marginBottom:'1.5rem',padding:'.5rem',background:'#0f0f1a',borderRadius:'12px',border:'1px solid rgba(255,255,255,.06)',flexWrap:'wrap'},
  card:       {background:'#0d0d1a',border:'1px solid rgba(255,255,255,.07)',borderRadius:'14px',padding:'1.4rem'},
  cardTitle:  {fontSize:'.95rem',fontWeight:700,marginBottom:'1rem',color:'#f0f0f8'},
  grid:       {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'.7rem'},
  detailItem: {background:'#161625',borderRadius:'10px',padding:'.75rem',display:'flex',flexDirection:'column',gap:'.3rem'},
  detailKey:  {fontSize:'.65rem',color:'#8888aa',textTransform:'uppercase',letterSpacing:'.05em',fontWeight:600},
  detailVal:  {fontSize:'.85rem',color:'#f0f0f8',fontWeight:600},
  chip:       {background:'#161625',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'.25rem .6rem',fontSize:'.75rem',color:'#d0d0e8'},
  transcriptBox:{background:'#161625',borderRadius:'10px',padding:'1.25rem',fontSize:'.88rem',lineHeight:1.7,color:'#d0d0e8',whiteSpace:'pre-wrap',marginBottom:'1rem'},
  copyBtn:    {padding:'.5rem 1.2rem',border:'1px solid',borderRadius:'8px',cursor:'pointer',fontWeight:600,fontSize:'.82rem',transition:'all .2s'},
  empty:      {display:'flex',flexDirection:'column',alignItems:'center',padding:'2rem',gap:'.5rem'},
};

const SS = {
  shopSection: {background:'#06060e',borderTop:'1px solid rgba(255,255,255,.06)',padding:'2.5rem clamp(1rem,4vw,2rem) 4rem'},
  shopHeader:  {maxWidth:'1100px',margin:'0 auto 1.75rem',display:'flex',flexDirection:'column',gap:'1rem'},
  brandRow:    {display:'flex',alignItems:'center',gap:'.75rem'},
  brandAvatar: {width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,#6c47ff,#ff4f87)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:800,color:'#fff',flexShrink:0},
  brandName:   {fontWeight:700,fontSize:'.95rem',color:'#f0f0f8'},
  brandSub:    {fontSize:'.72rem',color:'#8888aa',marginTop:'.1rem'},
  titleCol:    {display:'flex',alignItems:'center',gap:'.75rem',flexWrap:'wrap'},
  shopTitle:   {fontSize:'clamp(1.1rem,3vw,1.4rem)',fontWeight:900,color:'#f0f0f8',margin:0,letterSpacing:'-.01em'},
  countBadge:  {background:'rgba(108,71,255,.15)',border:'1px solid rgba(108,71,255,.3)',color:'#8b6bff',borderRadius:'20px',padding:'.2rem .75rem',fontSize:'.75rem',fontWeight:700},
  loadingRow:  {display:'flex',alignItems:'center',gap:'1rem',padding:'2rem 0',maxWidth:'1100px',margin:'0 auto'},
  grid:        {maxWidth:'1100px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(200px,100%),1fr))',gap:'1.1rem'},
};

const RP = {
  grid:        {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(180px,100%),1fr))',gap:'1rem'},
  card:        {background:'#0d0d1a',border:'1px solid rgba(255,255,255,.07)',borderRadius:'14px',overflow:'hidden',cursor:'pointer',transition:'all .25s',position:'relative'},
  cardMedia:   {position:'relative',aspectRatio:'9/14',background:'#161625',overflow:'hidden'},
  cardImg:     {width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .3s'},
  cardNoImg:   {width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',background:'#161625'},
  videoBadge:  {position:'absolute',bottom:'8px',right:'8px',background:'rgba(0,0,0,.78)',color:'#fff',borderRadius:'5px',padding:'.2rem .5rem',fontSize:'.65rem',fontWeight:700},
  activeBadge: {position:'absolute',top:'8px',left:'8px',background:'rgba(74,222,128,.15)',border:'1px solid rgba(74,222,128,.3)',color:'#4ade80',borderRadius:'12px',padding:'.15rem .55rem',fontSize:'.62rem',fontWeight:700},
  cardInfo:    {padding:'.75rem'},
  cardBrand:   {fontSize:'.68rem',color:'#6c47ff',fontWeight:700,marginBottom:'.25rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'},
  cardTitle2:  {fontSize:'.78rem',color:'#e0e0f0',fontWeight:600,lineHeight:1.35,marginBottom:'.5rem',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'},
  cardMeta:    {display:'flex',gap:'.5rem',flexWrap:'wrap'},
  metaItem:    {fontSize:'.68rem',color:'#8888aa',background:'rgba(255,255,255,.05)',borderRadius:'5px',padding:'.15rem .45rem'},
};
