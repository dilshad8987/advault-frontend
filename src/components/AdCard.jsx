import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'https://advault-backend.vercel.app';

function makeProxyUrl(rawUrl) {
  if (!rawUrl) return '';
  const token = localStorage.getItem('accessToken') || '';
  return `${API_BASE}/api/ads/video/stream?url=${encodeURIComponent(rawUrl)}&token=${encodeURIComponent(token)}`;
}

// ── Inline Mobile Video Player ─────────────────────────────────────────────────
function MobileVideoPlayer({ videoUrl, cover, title, adId }) {
  const videoRef    = useRef(null);
  const progressRef = useRef(null);
  const hideTimer   = useRef(null);
  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [muted,        setMuted]        = useState(false);
  const [volume,       setVolume]       = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [videoError,   setVideoError]   = useState(false);
  const [urlLoading,   setUrlLoading]   = useState(true);
  const [realVideoUrl, setRealVideoUrl] = useState('');

  useEffect(() => {
    if (!adId) { setUrlLoading(false); return; }
    setUrlLoading(true); setVideoError(false);
    api.get('/ads/video/url', { params: { video_id: adId, tiktok_url: '' } })
      .then(res => {
        setRealVideoUrl(res.data?.play_url || makeProxyUrl(videoUrl));
      })
      .catch(() => {
        setRealVideoUrl(makeProxyUrl(videoUrl));
      })
      .finally(() => setUrlLoading(false));
  }, [adId]); // eslint-disable-line

  const proxyUrl = realVideoUrl || makeProxyUrl(videoUrl);
  const fmtTime = (s) => !s || isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const showCtrl = () => {
    setShowControls(true); clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPlaying(p => { if (p) setShowControls(false); return p; }), 3000);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
    showCtrl();
  };

  const onTimeUpdate = () => {
    const v = videoRef.current; if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const seek = (e) => {
    e.stopPropagation();
    const v = videoRef.current; const bar = progressRef.current; if (!v || !bar) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
    v.currentTime = pct * v.duration; showCtrl();
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current; if (!v) return;
    v.muted = !muted; setMuted(!muted); showCtrl();
  };

  if (urlLoading) return (
    <div style={VP.wrap}>
      {cover && <img src={cover} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(3px)', opacity: 0.4 }} />}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '.76rem', fontWeight: 600 }}>Loading...</span>
      </div>
    </div>
  );

  if (!videoUrl || videoError) return (
    <div style={VP.wrap}>
      {cover
        ? <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={VP.noVideo}>🎵</div>}
    </div>
  );

  return (
    <div style={VP.wrap} onMouseMove={showCtrl} onClick={togglePlay}>
      <video ref={videoRef} src={proxyUrl} poster={cover} style={VP.video}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onError={() => setVideoError(true)}
        playsInline preload="none" crossOrigin="anonymous" />
      {!playing && (
        <div style={VP.playOverlay}>
          <div style={VP.playCircle}>▶</div>
        </div>
      )}
      <div style={{ ...VP.controls, opacity: showControls ? 1 : 0, transition: 'opacity .3s' }} onClick={e => e.stopPropagation()}>
        <div ref={progressRef} style={VP.progressTrack} onClick={seek}>
          <div style={{ ...VP.progressFill, width: progress + '%' }} />
          <div style={{ ...VP.progressThumb, left: progress + '%' }} />
        </div>
        <div style={VP.ctrlRow}>
          <button style={VP.ctrlBtn} onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
          <span style={VP.timeText}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          <div style={{ flex: 1 }} />
          <button style={VP.ctrlBtn} onClick={toggleMute}>{muted || volume === 0 ? '🔇' : '🔊'}</button>
        </div>
      </div>
    </div>
  );
}

const VP = {
  wrap:        { borderRadius: '12px', overflow: 'hidden', background: '#0f0f1a', position: 'relative', aspectRatio: '9/16', width: '100%', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video:       { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noVideo:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', background: '#161625' },
  playOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.3)' },
  playCircle:  { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(108,71,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#fff', boxShadow: '0 0 24px rgba(108,71,255,.5)' },
  controls:    { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.85))', padding: '.5rem .75rem .7rem' },
  progressTrack: { height: '4px', background: 'rgba(255,255,255,.2)', borderRadius: '2px', cursor: 'pointer', position: 'relative', marginBottom: '.5rem' },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg,#6c47ff,#8b6bff)', borderRadius: '2px', pointerEvents: 'none' },
  progressThumb: { position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', width: '11px', height: '11px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px rgba(108,71,255,.8)', pointerEvents: 'none' },
  ctrlRow:     { display: 'flex', alignItems: 'center', gap: '.4rem' },
  ctrlBtn:     { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', padding: '.1rem .2rem', lineHeight: 1 },
  timeText:    { fontSize: '.68rem', color: 'rgba(255,255,255,.8)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
};

// ── Mobile Detail Drawer ───────────────────────────────────────────────────────
function MobileDetailDrawer({ ad, onClose, onSave, saved }) {
  const title     = ad.ad_title || ad.title || 'No Title';
  const brand     = ad.brand_name || 'Unknown Brand';
  const likes     = Number(ad.like || 0);
  const comments  = Number(ad.comment || 0);
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const cost      = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const cover     = ad.video_info?.cover || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const adId      = ad.id || '';
  const videoUrl  = ad.video_info?.vid_url || ad.video_info?.download_addr || '';
  const tiktokUrl = ad.tiktok_url || `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`;
  const isActive  = !ad.last_shown_date || new Date(ad.last_shown_date * 1000) > new Date();

  const fmtNum = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toLocaleString();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes drawerUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
          zIndex: 9998, animation: 'fadeInBg .25s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0f0f1a',
        borderRadius: '20px 20px 0 0',
        zIndex: 9999,
        animation: 'drawerUp .32s cubic-bezier(.4,0,.2,1)',
        maxHeight: '92vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,.18)' }} />
        </div>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 12px' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: '#f0f0f8', borderRadius: '8px', padding: '.3rem .8rem', fontSize: '.8rem', cursor: 'pointer', fontWeight: 600 }}>
            ← Wapas
          </button>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button
              onClick={onSave}
              disabled={saved}
              style={{
                background: saved ? 'rgba(108,71,255,.25)' : 'linear-gradient(135deg,#6c47ff,#8b6bff)',
                border: 'none', color: '#fff', borderRadius: '8px',
                padding: '.32rem .9rem', fontSize: '.78rem', cursor: saved ? 'not-allowed' : 'pointer', fontWeight: 700,
              }}>
              {saved ? '✅ Saved' : '💾 Save Ad'}
            </button>
            <a href={tiktokUrl} target="_blank" rel="noreferrer"
              style={{ background: 'rgba(255,255,255,.07)', color: '#f0f0f8', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', padding: '.32rem .9rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}>
              🔗 TikTok
            </a>
          </div>
        </div>

        <div style={{ padding: '0 16px 32px' }}>
          {/* Video player */}
          <MobileVideoPlayer videoUrl={videoUrl} cover={cover} title={title} adId={adId} />

          {/* Active badge */}
          {isActive && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ background: 'rgba(74,222,128,.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)', borderRadius: '20px', padding: '.25rem .8rem', fontSize: '.72rem', fontWeight: 700 }}>
                ● STILL ACTIVE
              </span>
            </div>
          )}

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#f0f0f8' }}>{brand}</div>
              <div style={{ fontSize: '.7rem', color: '#8888aa' }}>🎵 TikTok Advertiser</div>
            </div>
          </div>

          {/* Title */}
          <p style={{ fontSize: '.9rem', fontWeight: 600, lineHeight: 1.45, color: '#f0f0f8', margin: '12px 0 10px' }}>{title}</p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '14px' }}>
            {objective && <span style={{ background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)', borderRadius: '20px', padding: '.2rem .7rem', fontSize: '.7rem', fontWeight: 700 }}>{objective}</span>}
            {ad.id && <span style={{ background: 'rgba(255,255,255,.06)', color: '#8888aa', borderRadius: '20px', padding: '.2rem .7rem', fontSize: '.7rem' }}>{String(ad.id).slice(-10)}</span>}
            {isActive && <span style={{ background: 'rgba(74,222,128,.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,.25)', borderRadius: '20px', padding: '.2rem .7rem', fontSize: '.7rem', fontWeight: 700 }}>● Active</span>}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.4rem', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
            {[
              { icon: '❤️', val: fmtNum(likes), key: 'Likes' },
              { icon: '💬', val: fmtNum(comments), key: 'Comments' },
              { icon: '📊', val: ctr, key: 'CTR' },
              { icon: '💰', val: cost, key: 'Spend' },
            ].map(({ icon, val, key }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.1rem', background: '#161625', borderRadius: '8px', padding: '.45rem .2rem' }}>
                <span style={{ fontSize: '.75rem' }}>{icon}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#f0f0f8' }}>{val}</span>
                <span style={{ fontSize: '.58rem', color: '#8888aa' }}>{key}</span>
              </div>
            ))}
          </div>

          {/* Running time */}
          {(ad.first_shown_date || ad.last_shown_date) && (
            <div style={{ marginTop: '14px', background: '#161625', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '.72rem', color: '#8888aa' }}>📅 Running Time</span>
                <span style={{ fontSize: '.72rem', color: '#f0f0f8', fontWeight: 600 }}>
                  {ad.last_shown_date ? '→ ' + new Date(ad.last_shown_date * 1000).toLocaleDateString() : '→ Today'}
                </span>
              </div>
              {ad.country_code && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.72rem', color: '#8888aa' }}>🌍 Countries</span>
                  <span style={{ fontSize: '.72rem', color: '#f0f0f8' }}>
                    {Array.isArray(ad.country_code) ? ad.country_code.slice(0, 4).join(', ') : ad.country_code}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main AdCard ────────────────────────────────────────────────────────────────
export default function AdCard({ ad }) {
  const [saved, setSaved]           = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const title     = ad.ad_title || ad.title || 'No Title';
  const brand     = ad.brand_name || 'Unknown Brand';
  const likes     = Number(ad.like || 0);
  const comments  = Number(ad.comment || 0);
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const cost      = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const cover     = ad.video_info?.cover || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const adId      = ad.id || String(Math.random());

  const fmtNum = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toLocaleString();

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

  const isMobile = () => window.innerWidth < 768;

  const handleCardClick = () => {
    if (isMobile()) {
      setDrawerOpen(true);
    } else {
      navigate(`/ad/${adId}`, { state: { ad } });
    }
  };

  const handleDetailBtn = (e) => {
    e.stopPropagation();
    if (isMobile()) {
      setDrawerOpen(true);
    } else {
      navigate(`/ad/${adId}`, { state: { ad } });
    }
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        style={s.card}
        onClick={handleCardClick}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(108,71,255,.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}
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
            <button
              style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }}
              onClick={e => { e.stopPropagation(); saveAd(e); }}
              disabled={saved}>
              {saved ? '✅ Saved' : '💾 Save Ad'}
            </button>
            <button style={s.detailBtn} onClick={handleDetailBtn}>
              🔍 Detail
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer — only renders when open */}
      {drawerOpen && (
        <MobileDetailDrawer
          ad={ad}
          onClose={() => setDrawerOpen(false)}
          onSave={saveAd}
          saved={saved}
        />
      )}
    </>
  );
}

const s = {
  card: {
    background: '#0f0f1a',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform .22s, border-color .22s',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  media: {
    width: '100%', height: '220px',
    background: '#161625', position: 'relative',
    overflow: 'hidden', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  blurBg: {
    position: 'absolute', inset: 0,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(18px) brightness(0.45) saturate(1.3)',
    transform: 'scale(1.12)', zIndex: 0,
  },
  img: {
    position: 'relative', zIndex: 1,
    height: '100%', width: 'auto',
    maxWidth: '100%', objectFit: 'contain', display: 'block',
  },
  noImg: { fontSize: '2.5rem', color: '#8888aa' },
  objBadge: {
    position: 'absolute', top: '8px', left: '8px', zIndex: 3,
    background: 'rgba(108,71,255,.92)', color: '#fff',
    borderRadius: '6px', padding: '.22rem .6rem',
    fontSize: '.65rem', fontWeight: 700, textTransform: 'capitalize',
  },
  vidBadge: {
    position: 'absolute', bottom: '8px', right: '8px', zIndex: 3,
    background: 'rgba(0,0,0,.75)', color: '#fff',
    borderRadius: '6px', padding: '.22rem .6rem', fontSize: '.68rem', fontWeight: 600,
  },
  body: { padding: '0.9rem' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem' },
  platform: {
    background: 'rgba(255,255,255,.06)', color: '#8888aa',
    borderRadius: '4px', padding: '.18rem .5rem',
    fontSize: '.68rem', fontWeight: 700,
  },
  adId: { fontSize: '.62rem', color: '#555577' },
  title: {
    fontSize: '.86rem', fontWeight: 600, lineHeight: 1.4,
    color: '#f0f0f8', margin: '0 0 .55rem',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.75rem' },
  avatar: { width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0 },
  brandName: { fontSize: '.75rem', color: '#8888aa' },
  stats: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem', marginBottom: '.75rem',
    paddingTop: '.65rem', borderTop: '1px solid rgba(255,255,255,.07)',
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.1rem', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem' },
  statIcon: { fontSize: '.75rem' },
  statVal:  { fontSize: '.72rem', fontWeight: 700, color: '#f0f0f8' },
  statKey:  { fontSize: '.58rem', color: '#8888aa' },
  actions:  { display: 'flex', gap: '.5rem' },
  saveBtn: {
    flex: 1, padding: '.42rem', borderRadius: '7px',
    border: '1px solid rgba(255,255,255,.08)',
    background: 'transparent', color: '#8888aa',
    fontSize: '.76rem', cursor: 'pointer',
  },
  savedBtn: { background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  detailBtn: {
    flex: 1, padding: '.42rem', borderRadius: '7px',
    border: '1px solid rgba(108,71,255,.3)',
    background: 'rgba(108,71,255,.15)', color: '#8b6bff',
    fontSize: '.76rem', cursor: 'pointer', fontWeight: 700,
  },
};
