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
  box: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '1rem', textAlign: 'center', flex: '1 1 100px', minWidth: '90px' },
  icon: { fontSize: '1.3rem', marginBottom: '.3rem' },
  val: { fontSize: '1rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.15rem' },
  label: { fontSize: '.65rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.05em' },
};

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: '.82rem', transition: 'all .2s',
      background: active ? 'linear-gradient(135deg,#6c47ff,#8b6bff)' : 'transparent',
      color: active ? '#fff' : '#8888aa',
      boxShadow: active ? '0 0 16px rgba(108,71,255,.35)' : 'none',
    }}>
      {children}
    </button>
  );
}

function ShopAdCard({ ad, onClick }) {
  const cover      = ad.video_info?.cover || ad.imageUrl || '';
  const title      = ad.ad_title || ad.title || 'No Title';
  const startDate  = ad.first_shown_date || ad.start_date;
  const endDate    = ad.last_shown_date  || ad.end_date;
  const isActive   = !endDate || new Date(endDate * 1000) > new Date();
  const runDays    = startDate ? Math.floor((Date.now() / 1000 - startDate) / 86400) : null;
  const likes      = ad.like || ad.metrics?.likes || 0;
  const countries  = ad.country_code
    ? (Array.isArray(ad.country_code) ? ad.country_code : [ad.country_code])
    : [];
  const lowImp     = (ad.impression || ad.reach || 0) > 0 && (ad.impression || ad.reach || 0) < 1000;

  const formatDateShort = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className="shop-ad-card"
      style={SC.card}
    >
      {/* Thumbnail */}
      <div style={SC.thumb}>
        {cover
          ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'2rem', background:'#161625' }}>🎵</div>
        }
        {/* Status badge */}
        <span style={{ ...SC.badge, ...(isActive ? SC.badgeGreen : SC.badgeGray) }}>
          {isActive ? '● Active' : '● Ended'}
        </span>
        {lowImp && <span style={SC.badgeLow}>⚠️ Low</span>}
      </div>

      {/* Body */}
      <div style={SC.body}>
        {/* Running dates */}
        <div style={SC.dateRow}>
          <span style={SC.dateChip}>{formatDateShort(startDate)}</span>
          <span style={{ color:'#555', fontSize:'.6rem' }}>→</span>
          <span style={SC.dateChip}>{endDate ? formatDateShort(endDate) : 'Today'}</span>
          {runDays !== null && <span style={SC.daysBadge}>{runDays}d</span>}
        </div>

        {/* Title */}
        <p style={SC.title}>{title}</p>

        {/* Countries */}
        {countries.length > 0 && (
          <div style={SC.countriesRow}>
            {countries.slice(0,4).map(c => (
              <span key={c} style={SC.flag}>
                {c.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)))}
              </span>
            ))}
            {countries.length > 4 && <span style={{ color:'#8888aa', fontSize:'.65rem' }}>+{countries.length - 4}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={SC.footer}>
          <span style={SC.likes}>❤️ {likes > 999 ? (likes/1000).toFixed(1)+'k' : likes}</span>
          <button
            onClick={onClick}
            style={SC.analysisBtn}
          >
            🔍 Ad Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

const SC = {
  card:        { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column' },
  thumb:       { height:'140px', background:'#161625', overflow:'hidden', position:'relative', flexShrink:0 },
  badge:       { position:'absolute', top:'7px', left:'7px', borderRadius:'20px', padding:'.2rem .6rem', fontSize:'.63rem', fontWeight:700, border:'1px solid' },
  badgeGreen:  { background:'rgba(74,222,128,.12)', color:'#4ade80', borderColor:'rgba(74,222,128,.3)' },
  badgeGray:   { background:'rgba(255,255,255,.06)', color:'#8888aa', borderColor:'rgba(255,255,255,.1)' },
  badgeLow:    { position:'absolute', top:'7px', right:'7px', background:'rgba(251,146,60,.12)', border:'1px solid rgba(251,146,60,.3)', color:'#fb923c', borderRadius:'20px', padding:'.2rem .5rem', fontSize:'.6rem', fontWeight:700 },
  body:        { padding:'.75rem', display:'flex', flexDirection:'column', gap:'.5rem', flex:1 },
  dateRow:     { display:'flex', alignItems:'center', gap:'.3rem', flexWrap:'wrap' },
  dateChip:    { background:'#161625', borderRadius:'5px', padding:'.15rem .45rem', fontSize:'.62rem', color:'#8888aa', fontWeight:600 },
  daysBadge:   { marginLeft:'auto', background:'rgba(108,71,255,.15)', color:'#8b6bff', borderRadius:'5px', padding:'.15rem .45rem', fontSize:'.62rem', fontWeight:700 },
  title:       { fontSize:'.75rem', fontWeight:600, color:'#d0d0e8', margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.4 },
  countriesRow:{ display:'flex', gap:'.25rem', flexWrap:'wrap', alignItems:'center' },
  flag:        { fontSize:'1rem' },
  footer:      { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:'.4rem', borderTop:'1px solid rgba(255,255,255,.05)' },
  likes:       { fontSize:'.72rem', color:'#8888aa', fontWeight:600 },
  analysisBtn: { padding:'.3rem .7rem', background:'rgba(108,71,255,.15)', border:'1px solid rgba(108,71,255,.3)', borderRadius:'6px', color:'#8b6bff', fontSize:'.68rem', fontWeight:700, cursor:'pointer' },
};

// ── Video Player Component ─────────────────────────────────────────────────────
function VideoPlayer({ videoUrl, cover, title, adId }) {
  const videoRef     = useRef(null);
  const progressRef  = useRef(null);
  const [playing,    setPlaying]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [currentTime,setCurrentTime]= useState(0);
  const [volume,     setVolume]     = useState(1);
  const [muted,      setMuted]      = useState(false);
  const [downloading,setDownloading]= useState(false);
  const [dlProgress, setDlProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
    showCtrl();
  };

  const showCtrl = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPlaying(p => { if (p) setShowControls(false); return p; }), 3000);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const onLoaded = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };

  const seek = (e) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    showCtrl();
  };

  const changeVolume = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
    showCtrl();
  };

  const downloadVideo = async () => {
    if (!videoUrl) return toast.error('Video URL nahi mili');
    setDownloading(true);
    setDlProgress(0);
    try {
      // Backend proxy se download
      const token = localStorage.getItem('token');
      const filename = `advault-ad-${adId || Date.now()}.mp4`;
      const backendUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000') +
        `/api/ads/video/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`;

      const response = await fetch(backendUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download fail hua');

      const total  = parseInt(response.headers.get('content-length') || '0');
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setDlProgress(Math.round((received / total) * 100));
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Video download ho gayi! 🎉');
    } catch (err) {
      console.error(err);
      // Fallback: direct link
      const a    = document.createElement('a');
      a.href     = videoUrl;
      a.target   = '_blank';
      a.download = `advault-ad-${adId || Date.now()}.mp4`;
      a.click();
      toast.success('Download shuru ho gaya!');
    }
    setDownloading(false);
    setDlProgress(0);
  };

  if (!videoUrl) {
    return (
      <div style={VP.wrap}>
        {cover
          ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={VP.noVideo}>🎵<p style={{ color:'#8888aa', fontSize:'.8rem', marginTop:'.5rem' }}>Video nahi mili</p></div>
        }
      </div>
    );
  }

  return (
    <div style={VP.wrap} onMouseMove={showCtrl} onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={cover}
        style={VP.video}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        playsInline
        preload="metadata"
      />

      {/* Big play button overlay */}
      {!playing && (
        <div style={VP.playOverlay}>
          <div style={VP.playCircle}>▶</div>
        </div>
      )}

      {/* Controls bar */}
      <div style={{ ...VP.controls, opacity: showControls ? 1 : 0, transition: 'opacity .3s' }}
           onClick={e => e.stopPropagation()}>

        {/* Progress bar */}
        <div ref={progressRef} style={VP.progressTrack} onClick={seek}>
          <div style={{ ...VP.progressFill, width: progress + '%' }} />
          <div style={{ ...VP.progressThumb, left: progress + '%' }} />
        </div>

        {/* Bottom row */}
        <div style={VP.ctrlRow}>
          {/* Play/Pause */}
          <button style={VP.ctrlBtn} onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>

          {/* Time */}
          <span style={VP.timeText}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>

          <div style={{ flex: 1 }} />

          {/* Volume */}
          <button style={VP.ctrlBtn} onClick={toggleMute}>
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={changeVolume}
            onClick={e => e.stopPropagation()}
            style={VP.volSlider}
          />

          {/* Download */}
          <button
            style={{ ...VP.dlBtn, ...(downloading ? VP.dlBtnActive : {}) }}
            onClick={e => { e.stopPropagation(); downloadVideo(); }}
            disabled={downloading}
            title="Video download karo"
          >
            {downloading
              ? dlProgress > 0 ? `${dlProgress}%` : '⏳'
              : '⬇ Download'
            }
          </button>
        </div>
      </div>

      {/* Download progress bar */}
      {downloading && dlProgress > 0 && (
        <div style={VP.dlProgressWrap}>
          <div style={{ ...VP.dlProgressBar, width: dlProgress + '%' }} />
        </div>
      )}
    </div>
  );
}

const VP = {
  wrap:         { borderRadius:'16px', overflow:'hidden', background:'#0f0f1a', position:'relative', aspectRatio:'9/16', maxHeight:'480px', cursor:'pointer', userSelect:'none' },
  video:        { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  noVideo:      { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'3rem', background:'#161625' },
  playOverlay:  { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.3)', backdropFilter:'blur(1px)' },
  playCircle:   { width:'60px', height:'60px', borderRadius:'50%', background:'rgba(108,71,255,.85)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', color:'#fff', boxShadow:'0 0 30px rgba(108,71,255,.5)' },
  controls:     { position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,.85))', padding:'.5rem .75rem .75rem' },
  progressTrack:{ height:'4px', background:'rgba(255,255,255,.2)', borderRadius:'2px', cursor:'pointer', position:'relative', marginBottom:'.6rem' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#6c47ff,#8b6bff)', borderRadius:'2px', pointerEvents:'none' },
  progressThumb:{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)', width:'12px', height:'12px', borderRadius:'50%', background:'#fff', boxShadow:'0 0 6px rgba(108,71,255,.8)', pointerEvents:'none' },
  ctrlRow:      { display:'flex', alignItems:'center', gap:'.4rem' },
  ctrlBtn:      { background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'1rem', padding:'.1rem .2rem', lineHeight:1 },
  timeText:     { fontSize:'.7rem', color:'rgba(255,255,255,.8)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' },
  volSlider:    { width:'60px', cursor:'pointer', accentColor:'#6c47ff', background:'transparent' },
  dlBtn:        { padding:'.3rem .7rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', border:'none', borderRadius:'6px', color:'#fff', fontSize:'.72rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' },
  dlBtnActive:  { background:'rgba(108,71,255,.4)', cursor:'not-allowed' },
  dlProgressWrap:{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'rgba(255,255,255,.1)' },
  dlProgressBar: { height:'100%', background:'#4ade80', transition:'width .3s', borderRadius:'2px' },
};
function CircleRing({ active, total }) {
  const pct    = total > 0 ? Math.min((active / total) * 100, 100) : 0;
  const r      = 42;
  const circ   = 2 * Math.PI * r;
  const dash   = (pct / 100) * circ;
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
      <circle
        cx="54" cy="54" r={r} fill="none"
        stroke="#6c47ff" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="54" y="48" textAnchor="middle" fill="#f0f0f8" fontSize="18" fontWeight="800">{active}</text>
      <text x="54" y="64" textAnchor="middle" fill="#8888aa" fontSize="10">/ {total}</text>
      <text x="54" y="76" textAnchor="middle" fill="#8888aa" fontSize="9">Active Ads</text>
    </svg>
  );
}

// ── Page Details Card ──────────────────────────────────────────────────────────
function PageDetailsCard({ pageDetails, pageLoading, brand, impression }) {
  const formatNum = (n) => {
    if (!n) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };
  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const lowImpression = impression !== null && impression !== undefined && impression < 1000;

  return (
    <div style={PD.wrap}>
      {/* Header */}
      <div style={PD.header}>
        <span style={PD.headerIcon}>🏢</span>
        <span style={PD.headerTitle}>Page Details</span>
        <a href={`https://www.tiktok.com/search?q=${encodeURIComponent(brand)}`}
          target="_blank" rel="noreferrer" style={PD.pageLink}>↗ Page</a>
      </div>

      {pageLoading ? (
        <div style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'1rem 0' }}>
          <div style={{ width:'20px', height:'20px', border:'2px solid rgba(108,71,255,.2)', borderTop:'2px solid #6c47ff', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
          <span style={{ color:'#8888aa', fontSize:'.8rem' }}>Loading page info...</span>
        </div>
      ) : pageDetails ? (
        <>
          {/* Ring + Stats */}
          <div style={PD.ringRow}>
            <CircleRing active={pageDetails.activeAds} total={pageDetails.totalAds} />
            <div style={PD.statsCol}>
              {[
                ['📅 Created On',   formatDate(pageDetails.createdOn)],
                ['📢 Active Ads',   pageDetails.activeAds],
                ['📦 Total Ads',    pageDetails.totalAds >= 1000 ? (pageDetails.totalAds / 1000).toFixed(1) + 'k' : pageDetails.totalAds],
                ['👁 Reach',        formatNum(pageDetails.totalReach)],
                ['💰 Total Spend',  pageDetails.totalSpend ? `$${pageDetails.totalSpend.toLocaleString()}` : '—'],
              ].map(([k, v]) => (
                <div key={k} style={PD.statRow}>
                  <span style={PD.statKey}>{k}</span>
                  <span style={PD.statVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Impression Warning */}
          {lowImpression && (
            <div style={PD.lowWarn}>
              <span style={{ fontSize:'.85rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'.78rem', color:'#fb923c' }}>Low Impression Count</div>
                <div style={{ fontSize:'.7rem', color:'#8888aa', marginTop:'.15rem' }}>
                  Is ad ke impressions abhi kam hain ({impression.toLocaleString()}). Performance track karte raho.
                </div>
              </div>
            </div>
          )}

          {/* Duplicates row */}
          <div style={PD.dupRow}>
            <span style={PD.statKey}>🔁 Duplicates</span>
            <span style={{ ...PD.statVal, color:'#8888aa' }}>—</span>
          </div>
        </>
      ) : (
        <div style={{ padding:'1rem 0', color:'#8888aa', fontSize:'.8rem' }}>Page data available nahi hai</div>
      )}
    </div>
  );
}

const PD = {
  wrap:       { background:'#0d0d1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'.85rem' },
  header:     { display:'flex', alignItems:'center', gap:'.5rem' },
  headerIcon: { fontSize:'1rem' },
  headerTitle:{ fontWeight:700, fontSize:'.9rem', color:'#f0f0f8', flex:1 },
  pageLink:   { fontSize:'.75rem', color:'#6c47ff', textDecoration:'none', fontWeight:600, border:'1px solid rgba(108,71,255,.3)', padding:'.2rem .6rem', borderRadius:'6px' },
  ringRow:    { display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' },
  statsCol:   { flex:1, minWidth:'140px', display:'flex', flexDirection:'column', gap:'.5rem' },
  statRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.5rem' },
  statKey:    { fontSize:'.73rem', color:'#8888aa', fontWeight:600, flexShrink:0 },
  statVal:    { fontSize:'.78rem', color:'#f0f0f8', fontWeight:700, textAlign:'right' },
  lowWarn:    { display:'flex', gap:'.6rem', alignItems:'flex-start', background:'rgba(251,146,60,.07)', border:'1px solid rgba(251,146,60,.2)', borderRadius:'10px', padding:'.75rem' },
  dupRow:     { display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,.05)', paddingTop:'.7rem' },
};

export default function AdDetail() {
  const { adId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [detail, setDetail]             = useState(null);
  const [brandAds, setBrandAds]         = useState([]);
  const [pageDetails, setPageDetails]   = useState(null);
  const [pageLoading, setPageLoading]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [brandLoading, setBrandLoading] = useState(false);
  const [saved, setSaved]               = useState(false);
  const [activeTab, setActiveTab]       = useState('overview');
  const [copied, setCopied]             = useState(false);

  const passedAd = location.state?.ad || null;

  useEffect(() => { fetchDetail(); }, [adId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ads/tiktok/${adId}`);
      const data = res.data?.data?.data || res.data?.data || res.data || {};
      setDetail(data);
      const advertiserId = data.advertiser_id || data.brand_id || passedAd?.advertiser_id;
      if (advertiserId) {
        fetchBrandAds(advertiserId);
        fetchPageDetails(advertiserId);
      }
    } catch (err) {
      console.error('Detail fetch error:', err);
      if (passedAd) {
        setDetail(passedAd);
        const advertiserId = passedAd?.advertiser_id || passedAd?.brand_id;
        if (advertiserId) fetchPageDetails(advertiserId);
      }
    }
    setLoading(false);
  };

  const fetchPageDetails = async (advertiserId) => {
    setPageLoading(true);
    try {
      const res = await api.get(`/ads/advertiser/${advertiserId}`);
      const allAds = res.data?.data || [];
      const activeAds = allAds.filter(a => {
        const end = a.last_shown_date || a.end_date;
        return !end || new Date(end * 1000) > new Date();
      });
      const totalReach  = allAds.reduce((s, a) => s + (a.impression || a.reach || 0), 0);
      const totalSpend  = allAds.reduce((s, a) => s + (a.cost || a.spend || 0), 0);
      const firstAd     = allAds.reduce((min, a) => {
        const d = a.first_shown_date || a.start_date || Infinity;
        return d < min ? d : min;
      }, Infinity);
      setPageDetails({
        totalAds:   allAds.length,
        activeAds:  activeAds.length,
        totalReach,
        totalSpend,
        createdOn:  firstAd !== Infinity ? firstAd : null,
      });
    } catch (err) {
      console.error('Page details error:', err);
    }
    setPageLoading(false);
  };

  const fetchBrandAds = async (advertiserId) => {
    setBrandLoading(true);
    try {
      const res = await api.get(`/ads/advertiser/${advertiserId}`);
      const ads = res.data?.data || [];
      setBrandAds(ads.filter(a => (a.id || a.ad_id) !== adId).slice(0, 8));
    } catch (err) { console.error('Brand ads error:', err); }
    setBrandLoading(false);
  };

  const saveAd = async () => {
    const ad = detail || passedAd;
    if (!ad) return;
    try {
      await api.post('/ads/save', {
        adId,
        adData: { title: ad.ad_title || ad.title, brand: ad.brand_name || 'Unknown', cover: ad.video_info?.cover || '', platform: 'tiktok' }
      });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success('Copy ho gaya!');
    setTimeout(() => setCopied(false), 2000);
  };

  const ad          = detail || passedAd || {};
  const title       = ad.ad_title || ad.title || 'Ad Detail';
  const brand       = ad.brand_name || ad.advertiser_name || 'Unknown Brand';
  const cover       = ad.video_info?.cover || ad.imageUrl || '';
  const videoUrl    = ad.video_info?.vid || ad.video_url || '';
  const isVideo     = !!ad.video_info || ad.isVideo;
  const likes       = ad.like || ad.metrics?.likes || 0;
  const comments    = ad.comment || ad.metrics?.comments || 0;
  const ctr         = ad.ctr ? (ad.ctr * 100).toFixed(2) + '%' : '—';
  const cost        = ad.cost || ad.spend || 0;
  const impression  = ad.impression || ad.reach || 0;
  const countries   = ad.country_code ? (Array.isArray(ad.country_code) ? ad.country_code : [ad.country_code]) : [];
  const startDate   = ad.first_shown_date || ad.start_date || null;
  const endDate     = ad.last_shown_date || ad.end_date || null;
  const isActive    = !endDate || new Date(endDate * 1000) > new Date();
  const runningDays = startDate ? Math.floor((Date.now() / 1000 - startDate) / 86400) : null;
  const transcript  = ad.ad_text || ad.description || ad.caption || '';
  const objective   = ad.objective_key?.replace('campaign_objective_', '') || ad.objective || '';
  const industry    = ad.industry_key?.replace('label_', '') || '';

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading && !passedAd) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={S.spinner}></div>
        <p style={{ color: '#8888aa' }}>Ad detail load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#f0f0f8', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .shop-ad-card:hover { border-color: rgba(108,71,255,.4) !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(108,71,255,.12); }
        .action-btn:hover { opacity: .85; transform: translateY(-1px); }
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .media-wrap { max-height: 300px !important; aspect-ratio: 16/9 !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>← Wapas</button>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <button className="action-btn" style={{ ...S.pill, ...(saved ? S.pillSaved : {}) }} onClick={saveAd} disabled={saved}>
            {saved ? '✅ Saved' : '💾 Save Ad'}
          </button>
          <a
            href={ad.tiktok_url || `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`}
            target="_blank" rel="noreferrer"
            className="action-btn"
            style={S.pillOutline}
          >
            🔗 TikTok
          </a>
        </div>
      </div>

      <div style={S.page}>

        {/* ── HERO ── */}
        <div className="hero-grid" style={S.hero}>

          {/* Media */}
          {/* Media — Video Player */}
          <div className="media-wrap" style={S.mediaWrap}>
            <VideoPlayer
              videoUrl={videoUrl}
              cover={cover}
              title={title}
              adId={adId}
            />
            {isActive && <span style={S.activeBadge}>● STILL ACTIVE</span>}
            {impression > 0 && impression < 1000 && (
              <span style={S.lowImpBadge}>⚠️ Low Impression</span>
            )}
          </div>

          {/* Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', animation:'fadeIn .4s ease' }}>

            {/* Brand */}
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink:0 }}></div>
              <div>
                <div style={{ fontWeight:700, fontSize:'.95rem' }}>{brand}</div>
                <div style={{ fontSize:'.72rem', color:'#8888aa' }}>🎵 TikTok Advertiser</div>
              </div>
            </div>

            <h1 style={{ fontSize:'clamp(1rem,2.5vw,1.4rem)', fontWeight:800, lineHeight:1.35, margin:0 }}>{title}</h1>

            {/* Tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
              {objective && <span style={S.tagPurple}>{objective}</span>}
              {industry  && <span style={S.tagGray}>{industry}</span>}
              {isActive  && <span style={S.tagGreen}>● Active</span>}
            </div>

            {/* Running Box */}
            <div style={S.runBox}>
              <div style={S.runRow}>
                <span style={S.runKey}>📅 Running Time</span>
                <span style={S.runVal}>{formatDate(startDate)} → {endDate ? formatDate(endDate) : 'Today'}</span>
              </div>
              {runningDays !== null && (
                <div style={S.runRow}>
                  <span style={S.runKey}>⏱ Days Running</span>
                  <span style={S.runVal}>{runningDays} days</span>
                </div>
              )}
              <div style={S.runRow}>
                <span style={S.runKey}>🌍 Countries</span>
                <span style={S.runVal}>
                  {countries.length > 0
                    ? countries.slice(0,6).map(c => `${countryFlag(c)} ${c}`).join('  ')
                    : '—'}
                </span>
              </div>
              <div style={S.runRow}>
                <span style={S.runKey}>💰 Spend</span>
                <span style={S.runVal}>{cost ? `$${cost}` : '—'}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem' }}>
              <StatBox icon="❤️"  label="Likes"       value={likes.toLocaleString()} />
              <StatBox icon="💬"  label="Comments"    value={comments.toLocaleString()} />
              <StatBox icon="📊"  label="CTR"         value={ctr} />
              <StatBox icon="👁"  label="Reach"       value={impression ? impression.toLocaleString() : '—'} />
            </div>
          </div>
        </div>

        {/* ── PAGE DETAILS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr)', gap:'1.25rem', marginBottom:'1.75rem' }}>
          <PageDetailsCard
            pageDetails={pageDetails}
            pageLoading={pageLoading}
            brand={brand}
            impression={impression}
          />
        </div>

        {/* ── TABS ── */}
        <div style={S.tabBar}>
          <TabBtn active={activeTab==='overview'}   onClick={() => setActiveTab('overview')}>📋 Overview</TabBtn>
          <TabBtn active={activeTab==='transcript'} onClick={() => setActiveTab('transcript')}>📝 Transcript</TabBtn>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', animation:'fadeIn .3s ease' }}>

            <div style={S.card}>
              <h3 style={S.cardTitle}>📋 Ad Details</h3>
              <div style={S.grid}>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Status</span>
                  <span style={{ ...S.detailVal, color: isActive ? '#4ade80' : '#f87171' }}>{isActive ? '● Active' : '● Ended'}</span>
                </div>
                {[
                  ['Start Date',   formatDate(startDate)],
                  ['End Date',     endDate ? formatDate(endDate) : 'Still Running'],
                  ['Days Running', runningDays !== null ? `${runningDays} days` : '—'],
                  ['Objective',    objective || '—'],
                  ['Industry',     industry  || '—'],
                  ['Spend',        cost ? `$${cost}` : '—'],
                  ['Reach',        impression ? impression.toLocaleString() : '—'],
                  ['CTR',          ctr],
                  ['Likes',        likes.toLocaleString()],
                  ['Comments',     comments.toLocaleString()],
                  ['Format',       isVideo ? 'Video' : 'Image'],
                ].map(([k, v]) => (
                  <div key={k} style={S.detailItem}>
                    <span style={S.detailKey}>{k}</span>
                    <span style={S.detailVal}>{v}</span>
                  </div>
                ))}
              </div>

              {countries.length > 0 && (
                <div style={{ marginTop:'1.25rem' }}>
                  <div style={{ ...S.detailKey, marginBottom:'.5rem' }}>🌍 Targeted Countries</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                    {countries.map(c => (
                      <span key={c} style={S.chip}>{countryFlag(c)} {c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={S.card}>
              <h3 style={S.cardTitle}>📈 Performance</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
                <StatBox icon="❤️"  label="Likes"       value={likes.toLocaleString()} />
                <StatBox icon="💬"  label="Comments"    value={comments.toLocaleString()} />
                <StatBox icon="📊"  label="CTR"         value={ctr} />
                <StatBox icon="👁"  label="Impressions" value={impression ? impression.toLocaleString() : '—'} />
                <StatBox icon="💰"  label="Spend"       value={cost ? `$${cost}` : '—'} />
                <StatBox icon="⏱"  label="Days Run"    value={runningDays ?? '—'} />
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSCRIPT TAB ── */}
        {activeTab === 'transcript' && (
          <div style={{ animation:'fadeIn .3s ease' }}>
            <div style={S.card}>
              <h3 style={S.cardTitle}>📝 Ad Transcript / Caption</h3>
              {transcript ? (
                <>
                  <div style={S.transcriptBox}>{transcript}</div>
                  <button style={{ ...S.copyBtn, background: copied ? 'rgba(74,222,128,.15)' : 'rgba(108,71,255,.2)', color: copied ? '#4ade80' : '#8b6bff', borderColor: copied ? 'rgba(74,222,128,.3)' : 'rgba(108,71,255,.3)' }} onClick={copyTranscript}>
                    {copied ? '✅ Copied!' : '📋 Copy Text'}
                  </button>
                </>
              ) : (
                <div style={S.empty}>
                  <p style={{ fontSize:'2rem', margin:0 }}>📭</p>
                  <p style={{ color:'#8888aa', margin:0 }}>Is ad ka transcript available nahi hai</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BRAND ADS TAB (removed, now shown as dedicated section below) ── */}

      </div>

      {/* ══ ADS FROM THIS SHOP ══════════════════════════════════════════════════ */}
      <div style={SS.shopSection}>
        <div style={SS.shopHeader}>
          {/* Brand avatar + name */}
          <div style={SS.brandRow}>
            <div style={SS.brandAvatar}>
              {brand.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={SS.brandName}>{brand}</div>
              <div style={SS.brandSub}>🎵 TikTok Advertiser</div>
            </div>
          </div>

          {/* Title + count */}
          <div style={SS.titleCol}>
            <h2 style={SS.shopTitle}>Ads from this shop</h2>
            {!brandLoading && brandAds.length > 0 && (
              <span style={SS.countBadge}>{brandAds.length} ads</span>
            )}
          </div>
        </div>

        {brandLoading ? (
          <div style={SS.loadingRow}>
            <div style={S.spinner}></div>
            <span style={{ color:'#8888aa', fontSize:'.85rem' }}>Shop ke ads load ho rahe hain...</span>
          </div>
        ) : brandAds.length > 0 ? (
          <div style={SS.grid}>
            {brandAds.map((a, i) => (
              <ShopAdCard
                key={a.id || a.ad_id || i}
                ad={a}
                onClick={() => navigate(`/ad/${a.id || a.ad_id}`, { state: { ad: a } })}
              />
            ))}
          </div>
        ) : (
          <div style={S.empty}>
            <p style={{ fontSize:'2.5rem', margin:0 }}>🏪</p>
            <p style={{ color:'#8888aa', margin:0, fontSize:'.88rem' }}>Is brand ke aur ads nahi mile</p>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  spinner:    { width:'36px', height:'36px', border:'3px solid rgba(108,71,255,.2)', borderTop:'3px solid #6c47ff', borderRadius:'50%', animation:'spin 1s linear infinite' },
  topBar:     { position:'sticky', top:0, zIndex:100, background:'rgba(8,8,15,.92)', backdropFilter:'blur(14px)', padding:'.75rem clamp(1rem,4vw,2rem)', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,.06)' },
  backBtn:    { background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'#8888aa', padding:'.4rem 1rem', borderRadius:'8px', cursor:'pointer', fontSize:'.82rem', fontWeight:600 },
  pill:       { padding:'.45rem 1.1rem', borderRadius:'20px', border:'none', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', color:'#fff', fontWeight:700, fontSize:'.8rem', cursor:'pointer', transition:'all .2s' },
  pillSaved:  { background:'rgba(108,71,255,.2)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.3)' },
  pillOutline:{ padding:'.45rem 1.1rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,.12)', background:'transparent', color:'#8888aa', fontWeight:600, fontSize:'.8rem', cursor:'pointer', textDecoration:'none', transition:'all .2s', display:'inline-block' },
  page:       { padding:'1.5rem clamp(1rem,4vw,2rem) 3rem', maxWidth:'1100px', margin:'0 auto' },
  hero:       { display:'grid', gridTemplateColumns:'minmax(0,320px) 1fr', gap:'2rem', marginBottom:'2rem', alignItems:'start' },
  mediaWrap:  { borderRadius:'16px', overflow:'hidden', background:'#0f0f1a', position:'relative' },
  activeBadge:{ position:'absolute', top:'10px', left:'10px', background:'rgba(74,222,128,.15)', border:'1px solid rgba(74,222,128,.3)', color:'#4ade80', borderRadius:'20px', padding:'.25rem .75rem', fontSize:'.7rem', fontWeight:700 },
  videoBadge: { position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,.75)', color:'#fff', borderRadius:'6px', padding:'.25rem .65rem', fontSize:'.7rem' },
  lowImpBadge:{ position:'absolute', top:'10px', right:'10px', background:'rgba(251,146,60,.15)', border:'1px solid rgba(251,146,60,.3)', color:'#fb923c', borderRadius:'20px', padding:'.25rem .65rem', fontSize:'.65rem', fontWeight:700 },
  tagPurple:  { background:'rgba(108,71,255,.2)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.3)', borderRadius:'20px', padding:'.2rem .75rem', fontSize:'.72rem', fontWeight:700 },
  tagGray:    { background:'rgba(255,255,255,.06)', color:'#8888aa', borderRadius:'20px', padding:'.2rem .75rem', fontSize:'.72rem' },
  tagGreen:   { background:'rgba(74,222,128,.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,.25)', borderRadius:'20px', padding:'.2rem .75rem', fontSize:'.72rem', fontWeight:700 },
  runBox:     { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', padding:'1rem', display:'flex', flexDirection:'column', gap:'.65rem' },
  runRow:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.5rem', flexWrap:'wrap' },
  runKey:     { fontSize:'.75rem', color:'#8888aa', fontWeight:600, flexShrink:0 },
  runVal:     { fontSize:'.82rem', color:'#f0f0f8', fontWeight:600, textAlign:'right' },
  tabBar:     { display:'flex', gap:'.4rem', marginBottom:'1.5rem', padding:'.5rem', background:'#0f0f1a', borderRadius:'12px', border:'1px solid rgba(255,255,255,.06)', flexWrap:'wrap' },
  card:       { background:'#0d0d1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'14px', padding:'1.4rem' },
  cardTitle:  { fontSize:'.95rem', fontWeight:700, marginBottom:'1rem', color:'#f0f0f8' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'.7rem' },
  detailItem: { background:'#161625', borderRadius:'10px', padding:'.75rem', display:'flex', flexDirection:'column', gap:'.3rem' },
  detailKey:  { fontSize:'.65rem', color:'#8888aa', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600 },
  detailVal:  { fontSize:'.85rem', color:'#f0f0f8', fontWeight:600 },
  chip:       { background:'#161625', border:'1px solid rgba(255,255,255,.08)', borderRadius:'6px', padding:'.25rem .6rem', fontSize:'.75rem', color:'#d0d0e8' },
  transcriptBox: { background:'#161625', borderRadius:'10px', padding:'1.25rem', fontSize:'.88rem', lineHeight:1.7, color:'#d0d0e8', whiteSpace:'pre-wrap', marginBottom:'1rem' },
  copyBtn:    { padding:'.5rem 1.2rem', border:'1px solid', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'.82rem', transition:'all .2s' },
  brandGrid:  { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'1rem' },
  empty:      { display:'flex', flexDirection:'column', alignItems:'center', padding:'2rem', gap:'.5rem' },
};

const SS = {
  shopSection:  { background:'#06060e', borderTop:'1px solid rgba(255,255,255,.06)', padding:'2.5rem clamp(1rem,4vw,2rem) 4rem' },
  shopHeader:   { maxWidth:'1100px', margin:'0 auto 1.75rem', display:'flex', flexDirection:'column', gap:'1rem' },
  brandRow:     { display:'flex', alignItems:'center', gap:'.75rem' },
  brandAvatar:  { width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#ff4f87)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800, color:'#fff', flexShrink:0 },
  brandName:    { fontWeight:700, fontSize:'.95rem', color:'#f0f0f8' },
  brandSub:     { fontSize:'.72rem', color:'#8888aa', marginTop:'.1rem' },
  titleCol:     { display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap' },
  shopTitle:    { fontSize:'clamp(1.1rem,3vw,1.4rem)', fontWeight:900, color:'#f0f0f8', margin:0, letterSpacing:'-.01em' },
  countBadge:   { background:'rgba(108,71,255,.15)', border:'1px solid rgba(108,71,255,.3)', color:'#8b6bff', borderRadius:'20px', padding:'.2rem .75rem', fontSize:'.75rem', fontWeight:700 },
  loadingRow:   { display:'flex', alignItems:'center', gap:'1rem', padding:'2rem 0', maxWidth:'1100px', margin:'0 auto' },
  grid:         { maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(200px,100%),1fr))', gap:'1.1rem' },
};
