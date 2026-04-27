import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Mobile Video Player ────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function makeProxyUrl(rawUrl) {
  if (!rawUrl) return '';
  const token = localStorage.getItem('accessToken') || '';
  return `${API_BASE}/api/ads/video/stream?url=${encodeURIComponent(rawUrl)}&token=${encodeURIComponent(token)}`;
}

function MobileVideoPlayer({ videoUrl, cover, title, adId }) {
  const videoRef     = useRef(null);
  const [playing,    setPlaying]    = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [realUrl,    setRealUrl]    = useState('');
  const [error,      setError]      = useState(false);

  useEffect(() => {
    if (!adId) return;
    setUrlLoading(true); setError(false);
    api.get('/ads/video/url', { params: { video_id: adId, tiktok_url: '' } })
      .then(res => {
        if (res.data?.play_url) setRealUrl(res.data.play_url);
        else setRealUrl(makeProxyUrl(videoUrl));
      })
      .catch(() => setRealUrl(makeProxyUrl(videoUrl)))
      .finally(() => setUrlLoading(false));
  }, [adId]); // eslint-disable-line

  const proxyUrl = realUrl || makeProxyUrl(videoUrl);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  if (urlLoading) return (
    <div style={mvp.wrap}>
      {cover && <img src={cover} alt={title} style={mvp.coverBlur} />}
      <div style={mvp.spinner}></div>
    </div>
  );

  if (!videoUrl || error) return (
    <div style={mvp.wrap}>
      {cover
        ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        : <div style={mvp.noVideo}>🎵</div>}
    </div>
  );

  return (
    <div style={mvp.wrap} onClick={togglePlay}>
      <video
        ref={videoRef}
        src={proxyUrl}
        poster={cover}
        style={mvp.video}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        playsInline
        preload="none"
        crossOrigin="anonymous"
      />
      {!playing && (
        <div style={mvp.playOverlay}>
          <div style={mvp.playBtn}>▶</div>
        </div>
      )}
    </div>
  );
}

const mvp = {
  wrap:        { position:'relative', width:'100%', aspectRatio:'9/16', background:'#0f0f1a', overflow:'hidden', borderRadius:'12px', cursor:'pointer' },
  coverBlur:   { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'blur(3px)', opacity:.4 },
  video:       { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  noVideo:     { display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'3rem', background:'#161625' },
  playOverlay: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.25)' },
  playBtn:     { width:'64px', height:'64px', borderRadius:'50%', background:'rgba(108,71,255,.88)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', color:'#fff', boxShadow:'0 0 32px rgba(108,71,255,.5)' },
  spinner:     { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'36px', height:'36px', border:'3px solid rgba(108,71,255,.2)', borderTop:'3px solid #6c47ff', borderRadius:'50%', animation:'mvspin 1s linear infinite' },
};

// ── Mobile Detail Bottom Sheet ─────────────────────────────────────────────
function MobileAdModal({ ad, onClose, onSave, saved }) {
  const title       = ad.ad_title || ad.title || 'No Title';
  const brand       = ad.brand_name || 'Unknown Brand';
  const cover       = ad.video_info?.cover || '';
  const videoUrlObj = ad.video_info?.video_url;
  const videoUrl    = (videoUrlObj && typeof videoUrlObj === 'object')
    ? (videoUrlObj['720p'] || videoUrlObj['1080p'] || videoUrlObj['540p'] || Object.values(videoUrlObj)[0] || '')
    : (typeof videoUrlObj === 'string' ? videoUrlObj : ad.video_url || '');
  const adId      = ad.id || String(Math.random());
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const isActive  = !ad.last_shown_date || new Date(ad.last_shown_date * 1000) > new Date();
  const likes     = Number(ad.like || 0);
  const comments  = Number(ad.comment || 0);
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const cost      = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const fmtNum    = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();
  const tiktokUrl = ad.tiktok_url || `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={m.overlay} onClick={onClose}>
      <style>{`
        @keyframes mvspin { to { transform: rotate(360deg); } }
        @keyframes mvSlideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
      `}</style>
      <div style={m.sheet} onClick={e => e.stopPropagation()}>

        {/* Drag handle indicator */}
        <div style={m.handle}></div>

        {/* Top Action Bar */}
        <div style={m.topBar}>
          <button style={m.closeBtn} onClick={onClose}>← Wapas</button>
          <div style={{ display:'flex', gap:'.5rem' }}>
            <button style={{ ...m.pillBtn, ...(saved ? m.pillSaved : {}) }} onClick={onSave} disabled={saved}>
              {saved ? '✅ Saved' : '💾 Save Ad'}
            </button>
            <a href={tiktokUrl} target="_blank" rel="noreferrer" style={m.pillOutline}>🔗 TikTok</a>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={m.content}>

          {/* Still Active badge */}
          {isActive && <div style={m.activeBadge}>● STILL ACTIVE</div>}

          {/* Video */}
          <MobileVideoPlayer videoUrl={videoUrl} cover={cover} title={title} adId={adId} />

          {/* Brand */}
          <div style={m.brandRow}>
            <div style={m.avatar}></div>
            <div>
              <div style={m.brandName}>{brand}</div>
              <div style={m.brandSub}>🎵 TikTok Advertiser</div>
            </div>
          </div>

          {/* Title */}
          <p style={m.title}>{title}</p>

          {/* Tags */}
          <div style={m.tagsRow}>
            {objective && <span style={m.tagPurple}>{objective}</span>}
            <span style={m.tagGray}>{adId?.toString().slice(-10)}</span>
            {isActive && <span style={m.tagGreen}>● Active</span>}
          </div>

          {/* Running time */}
          <div style={m.runBox}>
            <div style={m.runRow}>
              <span style={m.runKey}>📅 Running Time</span>
              <span style={m.runVal}>— → Today</span>
            </div>
            <div style={m.runRow}>
              <span style={m.runKey}>🌍 Countries</span>
              <span style={m.runVal}>—</span>
            </div>
          </div>

          {/* Stats grid */}
          <div style={m.statsGrid}>
            {[['❤️', fmtNum(likes), 'Likes'], ['💬', fmtNum(comments), 'Comments'], ['📊', ctr, 'CTR'], ['💰', cost, 'Spend']].map(([icon, val, key]) => (
              <div key={key} style={m.statBox}>
                <span style={m.statIcon}>{icon}</span>
                <span style={m.statVal}>{val}</span>
                <span style={m.statKey}>{key}</span>
              </div>
            ))}
          </div>

          {/* Bottom spacing */}
          <div style={{ height: '1rem' }}></div>
        </div>
      </div>
    </div>
  );
}

const m = {
  overlay:    { position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.65)', backdropFilter:'blur(5px)', display:'flex', alignItems:'flex-end' },
  sheet:      { width:'100%', maxHeight:'96vh', background:'#08080f', borderRadius:'18px 18px 0 0', display:'flex', flexDirection:'column', animation:'mvSlideUp .28s cubic-bezier(.4,0,.2,1)', overflow:'hidden' },
  handle:     { width:'40px', height:'4px', borderRadius:'2px', background:'rgba(255,255,255,.18)', margin:'.75rem auto .2rem', flexShrink:0 },
  topBar:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.35rem .9rem .55rem', flexShrink:0 },
  closeBtn:   { background:'none', border:'none', color:'#8888aa', fontSize:'.85rem', cursor:'pointer', padding:'.25rem .3rem' },
  pillBtn:    { padding:'.35rem .75rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,.12)', background:'rgba(108,71,255,.18)', color:'#8b6bff', fontSize:'.76rem', fontWeight:700, cursor:'pointer' },
  pillSaved:  { background:'rgba(74,222,128,.15)', color:'#4ade80', border:'1px solid rgba(74,222,128,.3)' },
  pillOutline:{ padding:'.35rem .75rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,.15)', background:'transparent', color:'#c0c0d8', fontSize:'.76rem', fontWeight:600, textDecoration:'none' },
  content:    { overflowY:'auto', padding:'0 .9rem 1.5rem', flex:1, display:'flex', flexDirection:'column', gap:'.8rem' },
  activeBadge:{ alignSelf:'flex-start', background:'rgba(74,222,128,.12)', color:'#4ade80', border:'1px solid rgba(74,222,128,.3)', borderRadius:'20px', padding:'.28rem .85rem', fontSize:'.72rem', fontWeight:700 },
  brandRow:   { display:'flex', alignItems:'center', gap:'.6rem' },
  avatar:     { width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink:0 },
  brandName:  { fontWeight:700, fontSize:'.88rem', color:'#f0f0f8' },
  brandSub:   { fontSize:'.7rem', color:'#8888aa' },
  title:      { fontSize:'.9rem', fontWeight:700, lineHeight:1.45, color:'#f0f0f8', margin:0 },
  tagsRow:    { display:'flex', flexWrap:'wrap', gap:'.4rem' },
  tagPurple:  { background:'rgba(108,71,255,.18)', color:'#9b7aff', border:'1px solid rgba(108,71,255,.3)', borderRadius:'20px', padding:'.22rem .7rem', fontSize:'.68rem', fontWeight:700 },
  tagGray:    { background:'rgba(255,255,255,.06)', color:'#8888aa', border:'1px solid rgba(255,255,255,.1)', borderRadius:'20px', padding:'.22rem .7rem', fontSize:'.68rem', fontWeight:600 },
  tagGreen:   { background:'rgba(74,222,128,.12)', color:'#4ade80', border:'1px solid rgba(74,222,128,.25)', borderRadius:'20px', padding:'.22rem .7rem', fontSize:'.68rem', fontWeight:700 },
  runBox:     { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'.8rem', display:'flex', flexDirection:'column', gap:'.5rem' },
  runRow:     { display:'flex', justifyContent:'space-between', alignItems:'center' },
  runKey:     { fontSize:'.73rem', color:'#8888aa', fontWeight:600 },
  runVal:     { fontSize:'.75rem', color:'#f0f0f8', fontWeight:700 },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'.4rem' },
  statBox:    { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'.55rem .2rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'.1rem' },
  statIcon:   { fontSize:'.8rem' },
  statVal:    { fontSize:'.78rem', fontWeight:800, color:'#f0f0f8' },
  statKey:    { fontSize:'.6rem', color:'#8888aa' },
};

// ── Main AdCard ────────────────────────────────────────────────────────────
export default function AdCard({ ad }) {
  const [saved,       setSaved]       = useState(false);
  const [mobileModal, setMobileModal] = useState(false);
  const navigate = useNavigate();

  const isMobile = () => window.innerWidth <= 768;

  const title     = ad.ad_title || ad.title || 'No Title';
  const brand     = ad.brand_name || 'Unknown Brand';
  const likes     = Number(ad.like || 0);
  const comments  = Number(ad.comment || 0);
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const cost      = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const cover     = ad.video_info?.cover || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const adId      = ad.id || String(Math.random());

  const fmtNum = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();

  const saveAd = async (e) => {
    if (e) e.stopPropagation();
    try {
      await api.post('/ads/save', { adId, adData: { title, brand, cover, platform: 'tiktok' } });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  const openDetail = () => {
    if (isMobile()) {
      // Mobile: same screen pe bottom sheet kholo
      setMobileModal(true);
    } else {
      // Desktop: pehle jaisa navigate karo
      navigate(`/ad/${adId}`, { state: { ad } });
    }
  };

  return (
    <>
      <div
        style={s.card}
        onClick={openDetail}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(108,71,255,.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; }}
      >
        {/* THUMBNAIL */}
        <div style={s.media}>
          {cover ? (
            <>
              <div style={{ ...s.blurBg, backgroundImage: `url(${cover})` }} />
              <img src={cover} alt={title} style={s.img} loading="lazy" />
            </>
          ) : (
            <div style={s.noImg}>🎵</div>
          )}
          {objective && <span style={s.objBadge}>{objective}</span>}
          <span style={s.vidBadge}>▶ Video</span>
        </div>

        {/* BODY */}
        <div style={s.body}>
          <div style={s.topRow}>
            <span style={s.platform}>🎵 TIKTOK</span>
            <span style={s.adId}>{adId?.toString().slice(-10)}</span>
          </div>
          <p style={s.title}>{title}</p>
          <div style={s.brandRow}>
            <div style={s.avatar} />
            <span style={s.brandName}>{brand}</span>
          </div>
          <div style={s.stats}>
            <div style={s.stat}><span style={s.statIcon}>❤️</span><span style={s.statVal}>{fmtNum(likes)}</span><span style={s.statKey}>Likes</span></div>
            <div style={s.stat}><span style={s.statIcon}>💬</span><span style={s.statVal}>{fmtNum(comments)}</span><span style={s.statKey}>Comments</span></div>
            <div style={s.stat}><span style={s.statIcon}>📊</span><span style={s.statVal}>{ctr}</span><span style={s.statKey}>CTR</span></div>
            <div style={s.stat}><span style={s.statIcon}>💰</span><span style={s.statVal}>{cost}</span><span style={s.statKey}>Spend</span></div>
          </div>
          <div style={s.actions}>
            <button style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }} onClick={saveAd} disabled={saved}>
              {saved ? '✅ Saved' : '💾 Save Ad'}
            </button>
            <button style={s.detailBtn} onClick={openDetail}>
              🔍 Detail
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {mobileModal && (
        <MobileAdModal
          ad={ad}
          saved={saved}
          onClose={() => setMobileModal(false)}
          onSave={saveAd}
        />
      )}
    </>
  );
}

const s = {
  card:     { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.08)', borderRadius:'14px', overflow:'hidden', cursor:'pointer', transition:'transform .22s, border-color .22s', userSelect:'none', WebkitTapHighlightColor:'transparent' },
  media:    { width:'100%', height:'220px', background:'#161625', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  blurBg:   { position:'absolute', inset:0, backgroundSize:'cover', backgroundPosition:'center', filter:'blur(18px) brightness(0.45) saturate(1.3)', transform:'scale(1.12)', zIndex:0 },
  img:      { position:'relative', zIndex:1, height:'100%', width:'auto', maxWidth:'100%', objectFit:'contain', display:'block' },
  noImg:    { fontSize:'2.5rem', color:'#8888aa' },
  objBadge: { position:'absolute', top:'8px', left:'8px', zIndex:3, background:'rgba(108,71,255,.92)', color:'#fff', borderRadius:'6px', padding:'.22rem .6rem', fontSize:'.65rem', fontWeight:700, textTransform:'capitalize' },
  vidBadge: { position:'absolute', bottom:'8px', right:'8px', zIndex:3, background:'rgba(0,0,0,.75)', color:'#fff', borderRadius:'6px', padding:'.22rem .6rem', fontSize:'.68rem', fontWeight:600 },
  body:     { padding:'0.9rem' },
  topRow:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.55rem' },
  platform: { background:'rgba(255,255,255,.06)', color:'#8888aa', borderRadius:'4px', padding:'.18rem .5rem', fontSize:'.68rem', fontWeight:700 },
  adId:     { fontSize:'.62rem', color:'#555577' },
  title:    { fontSize:'.86rem', fontWeight:600, lineHeight:1.4, color:'#f0f0f8', margin:'0 0 .55rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  brandRow: { display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.75rem' },
  avatar:   { width:'20px', height:'20px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink:0 },
  brandName:{ fontSize:'.75rem', color:'#8888aa' },
  stats:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'.35rem', marginBottom:'.75rem', paddingTop:'.65rem', borderTop:'1px solid rgba(255,255,255,.07)' },
  stat:     { display:'flex', flexDirection:'column', alignItems:'center', gap:'.1rem', background:'#161625', borderRadius:'8px', padding:'.4rem .2rem' },
  statIcon: { fontSize:'.75rem' },
  statVal:  { fontSize:'.72rem', fontWeight:700, color:'#f0f0f8' },
  statKey:  { fontSize:'.58rem', color:'#8888aa' },
  actions:  { display:'flex', gap:'.5rem' },
  saveBtn:  { flex:1, padding:'.42rem', borderRadius:'7px', border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'#8888aa', fontSize:'.76rem', cursor:'pointer' },
  savedBtn: { background:'rgba(108,71,255,.2)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.3)' },
  detailBtn:{ flex:1, padding:'.42rem', borderRadius:'7px', border:'1px solid rgba(108,71,255,.3)', background:'rgba(108,71,255,.15)', color:'#8b6bff', fontSize:'.76rem', cursor:'pointer', fontWeight:700 },
};
