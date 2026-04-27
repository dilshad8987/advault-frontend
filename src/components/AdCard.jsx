import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function makeProxyUrl(rawUrl) {
  if (!rawUrl) return '';
  const token = localStorage.getItem('accessToken') || '';
  return `${API_BASE}/api/ads/video/stream?url=${encodeURIComponent(rawUrl)}&token=${encodeURIComponent(token)}`;
}

// ── Inline Video Player ────────────────────────────────────────────────────────
function InlineVideoPlayer({ videoUrl, tiktokItemUrl, cover, title, adId }) {
  const videoRef    = useRef(null);
  const progressRef = useRef(null);
  const hideTimer   = useRef(null);
  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError,   setVideoError]   = useState(false);
  const [realVideoUrl, setRealVideoUrl] = useState('');
  const [urlLoading,   setUrlLoading]   = useState(true);

  useEffect(() => {
    if (!adId) return;
    setUrlLoading(true); setVideoError(false);
    api.get('/ads/video/url', { params: { video_id: adId, tiktok_url: tiktokItemUrl || '' } })
      .then(res => {
        if (res.data?.play_url) setRealVideoUrl(res.data.play_url);
        else setRealVideoUrl(makeProxyUrl(videoUrl));
      })
      .catch(() => setRealVideoUrl(makeProxyUrl(videoUrl)))
      .finally(() => setUrlLoading(false));
  }, [adId, tiktokItemUrl]); // eslint-disable-line

  const proxyUrl = realVideoUrl || makeProxyUrl(videoUrl);
  const fmtTime  = (s) => !s||isNaN(s)?'0:00':`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  const showCtrl = () => {
    setShowControls(true); clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPlaying(p => { if(p) setShowControls(false); return p; }), 3000);
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
    setProgress(v.duration ? (v.currentTime/v.duration)*100 : 0);
  };
  const seek = (e) => {
    e.stopPropagation();
    const v = videoRef.current; const bar = progressRef.current; if (!v||!bar) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
    v.currentTime = pct * v.duration; showCtrl();
  };
  const changeVolume = (e) => {
    e.stopPropagation();
    const vol = parseFloat(e.target.value); setVolume(vol); setMuted(vol===0);
    if (videoRef.current) videoRef.current.volume = vol;
  };
  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current; if (!v) return;
    v.muted = !muted; setMuted(!muted); showCtrl();
  };

  if (urlLoading) return (
    <div style={VP.wrap}>
      {cover && <img src={cover} alt={title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(3px)',opacity:.4}} />}
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',gap:'.5rem'}}>
        <div style={{width:'34px',height:'34px',border:'3px solid rgba(108,71,255,.2)',borderTop:'3px solid #6c47ff',borderRadius:'50%',animation:'adcard-spin 1s linear infinite'}}></div>
        <span style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem'}}>Loading...</span>
      </div>
    </div>
  );

  if (!videoUrl || videoError) return (
    <div style={VP.wrap}>
      {cover
        ? <img src={cover} alt={title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
        : <div style={VP.noVideo}>🎵</div>
      }
    </div>
  );

  return (
    <div style={VP.wrap} onMouseMove={showCtrl} onClick={togglePlay}>
      <video ref={videoRef} src={proxyUrl} poster={cover} style={VP.video}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onError={() => setVideoError(true)}
        playsInline preload="none" crossOrigin="anonymous"
      />
      {!playing && (
        <div style={VP.playOverlay}>
          <div style={VP.playCircle}>▶</div>
        </div>
      )}
      <div style={{...VP.controls, opacity:showControls?1:0, transition:'opacity .3s'}} onClick={e=>e.stopPropagation()}>
        <div ref={progressRef} style={VP.progressTrack} onClick={seek}>
          <div style={{...VP.progressFill, width:progress+'%'}} />
          <div style={{...VP.progressThumb, left:progress+'%'}} />
        </div>
        <div style={VP.ctrlRow}>
          <button style={VP.ctrlBtn} onClick={togglePlay}>{playing?'⏸':'▶'}</button>
          <span style={VP.timeText}>{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          <div style={{flex:1}} />
          <button style={VP.ctrlBtn} onClick={toggleMute}>{muted||volume===0?'🔇':volume<0.5?'🔉':'🔊'}</button>
          <input type="range" min="0" max="1" step="0.05" value={muted?0:volume}
            onChange={changeVolume} onClick={e=>e.stopPropagation()} style={VP.volSlider} />
        </div>
      </div>
    </div>
  );
}

const VP = {
  wrap:          {borderRadius:'12px',overflow:'hidden',background:'#0f0f1a',position:'relative',aspectRatio:'9/16',width:'100%',cursor:'pointer',userSelect:'none',display:'flex',alignItems:'center',justifyContent:'center'},
  video:         {width:'100%',height:'100%',objectFit:'cover',display:'block'},
  noVideo:       {display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'2.5rem',background:'#161625'},
  playOverlay:   {position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.3)',backdropFilter:'blur(1px)'},
  playCircle:    {width:'56px',height:'56px',borderRadius:'50%',background:'rgba(108,71,255,.9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',color:'#fff',boxShadow:'0 0 28px rgba(108,71,255,.5)'},
  controls:      {position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.85))',padding:'.4rem .6rem .6rem'},
  progressTrack: {height:'4px',background:'rgba(255,255,255,.2)',borderRadius:'2px',cursor:'pointer',position:'relative',marginBottom:'.5rem'},
  progressFill:  {height:'100%',background:'linear-gradient(90deg,#6c47ff,#8b6bff)',borderRadius:'2px',pointerEvents:'none'},
  progressThumb: {position:'absolute',top:'50%',transform:'translate(-50%,-50%)',width:'11px',height:'11px',borderRadius:'50%',background:'#fff',boxShadow:'0 0 5px rgba(108,71,255,.8)',pointerEvents:'none'},
  ctrlRow:       {display:'flex',alignItems:'center',gap:'.3rem'},
  ctrlBtn:       {background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:'.9rem',padding:'.1rem .15rem',lineHeight:1},
  timeText:      {fontSize:'.65rem',color:'rgba(255,255,255,.8)',fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'},
  volSlider:     {width:'50px',cursor:'pointer',accentColor:'#6c47ff',background:'transparent'},
};

// ── Main AdCard ────────────────────────────────────────────────────────────────
export default function AdCard({ ad }) {
  const [saved,    setSaved]    = useState(false);
  const [expanded, setExpanded] = useState(false);
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
  const isActive  = !ad.last_shown_date || new Date(ad.last_shown_date*1000) > new Date();

  const videoUrlObj   = ad.video_info?.video_url;
  const videoUrl      = (videoUrlObj && typeof videoUrlObj === 'object')
    ? (videoUrlObj['720p'] || videoUrlObj['1080p'] || videoUrlObj['540p'] || videoUrlObj['480p'] || videoUrlObj['360p'] || Object.values(videoUrlObj)[0] || '')
    : (typeof videoUrlObj === 'string' ? videoUrlObj : ad.video_url || '');
  const tiktokItemUrl = ad.tiktok_item_url || ad.share_url || ad.item_url || '';

  const fmtNum = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();

  const saveAd = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/ads/save', { adId, adData: { title, brand, cover, platform: 'tiktok' } });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  const openFullDetail = (e) => {
    e.stopPropagation();
    navigate(`/ad/${adId}`, { state: { ad } });
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  return (
    <>
      <style>{`
        @keyframes adcard-spin { to { transform:rotate(360deg); } }
        @keyframes adcard-expand {
          from { opacity:0; max-height:0; }
          to   { opacity:1; max-height:9999px; }
        }
        .adcard-media:hover .adcard-play-circle { opacity:1 !important; }
        .adcard-media:hover { background:rgba(0,0,0,.15); }
      `}</style>

      <div style={{ ...s.card, ...(expanded ? s.cardExpanded : {}) }}
        onMouseEnter={e => { if(!expanded){ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(108,71,255,.35)'; }}}
        onMouseLeave={e => { if(!expanded){ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; }}}
      >

        {/* ── EXPANDED VIDEO VIEW ── */}
        {expanded && (
          <div style={s.expandedWrap} onClick={e => e.stopPropagation()}>
            {/* Top bar */}
            <div style={s.expandTopBar}>
              <button style={s.collapseBtn} onClick={toggleExpand}>← Wapas</button>
              <div style={{display:'flex',gap:'.45rem',alignItems:'center'}}>
                <button style={{...s.expandActionBtn,...(saved?s.expandActionSaved:{})}} onClick={saveAd} disabled={saved}>
                  {saved ? '✅ Saved' : '💾 Save Ad'}
                </button>
                <a href={ad.tiktok_url||`https://www.tiktok.com/search?q=${encodeURIComponent(title)}`}
                  target="_blank" rel="noreferrer" style={s.expandTikTokBtn}>🔗 TikTok</a>
              </div>
            </div>

            {/* Video Player — same as Image 1 card size */}
            <div style={s.videoWrap}>
              {isActive && <div style={s.activeBadge}>● STILL ACTIVE</div>}
              <InlineVideoPlayer
                videoUrl={videoUrl}
                tiktokItemUrl={tiktokItemUrl}
                cover={cover}
                title={title}
                adId={adId}
              />
            </div>

            {/* Brand + Info */}
            <div style={s.expandInfo}>
              <div style={s.expandBrandRow}>
                <div style={s.expandAvatar}>{brand.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={s.expandBrandName}>{brand}</div>
                  <div style={s.expandBrandSub}>🎵 TikTok Advertiser</div>
                </div>
              </div>
              <p style={s.expandTitle}>{title}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'.65rem'}}>
                {objective && <span style={s.tagPurple}>{objective}</span>}
                <span style={s.tagGray}>{adId?.toString().slice(-10)}</span>
                {isActive && <span style={s.tagGreen}>● Active</span>}
              </div>
              {/* Stats */}
              <div style={s.expandStats}>
                {[['❤️','Likes',fmtNum(likes)],['💬','Comments',fmtNum(comments)],['📊','CTR',ctr],['💰','Spend',cost]].map(([icon,label,val])=>(
                  <div key={label} style={s.expandStat}>
                    <span style={{fontSize:'.75rem'}}>{icon}</span>
                    <span style={{fontSize:'.72rem',fontWeight:700,color:'#f0f0f8'}}>{val}</span>
                    <span style={{fontSize:'.58rem',color:'#8888aa'}}>{label}</span>
                  </div>
                ))}
              </div>
              {/* Full detail */}
              <button style={s.fullDetailBtn} onClick={openFullDetail}>
                🔍 Full Detail dekhein
              </button>
            </div>
          </div>
        )}

        {/* ── COLLAPSED CARD VIEW ── */}
        {!expanded && (
          <>
            <div className="adcard-media" style={s.media} onClick={toggleExpand}>
              {cover ? (
                <>
                  <div style={{ ...s.blurBg, backgroundImage: `url(${cover})` }} />
                  <img src={cover} alt={title} style={s.img} loading="lazy" />
                </>
              ) : (
                <div style={s.noImg}>🎵</div>
              )}
              {objective && <span style={s.objBadge}>{objective}</span>}
              {/* Play circle on hover */}
              <div style={s.playHoverWrap}>
                <div className="adcard-play-circle" style={{...s.playHoverCircle, opacity:0}}>▶</div>
              </div>
              <span style={s.vidBadge}>▶ Video</span>
            </div>

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
                <button style={s.detailBtn} onClick={toggleExpand}>
                  🔍 Detail
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const s = {
  card: {
    background: '#0f0f1a',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'default',
    transition: 'transform .22s, border-color .22s, box-shadow .22s',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  cardExpanded: {
    border: '1px solid rgba(108,71,255,.4)',
    boxShadow: '0 0 28px rgba(108,71,255,.15)',
    transform: 'none !important',
  },

  // ── Expanded ──
  expandedWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  expandTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '.55rem .75rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'rgba(8,8,15,.95)',
  },
  collapseBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,.1)',
    color: '#8888aa',
    padding: '.28rem .65rem',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '.73rem',
    fontWeight: 600,
  },
  expandActionBtn: {
    padding: '.28rem .65rem',
    borderRadius: '7px',
    border: 'none',
    background: 'linear-gradient(135deg,#6c47ff,#8b6bff)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '.73rem',
    cursor: 'pointer',
  },
  expandActionSaved: {
    background: 'rgba(108,71,255,.2)',
    color: '#8b6bff',
    border: '1px solid rgba(108,71,255,.3)',
  },
  expandTikTokBtn: {
    padding: '.28rem .65rem',
    borderRadius: '7px',
    border: '1px solid rgba(255,255,255,.12)',
    background: 'transparent',
    color: '#8888aa',
    fontWeight: 600,
    fontSize: '.73rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  videoWrap: {
    position: 'relative',
    padding: '.7rem .7rem 0',
    background: '#0a0a14',
  },
  activeBadge: {
    position: 'absolute',
    top: '18px',
    left: '18px',
    zIndex: 10,
    background: 'rgba(74,222,128,.15)',
    border: '1px solid rgba(74,222,128,.3)',
    color: '#4ade80',
    borderRadius: '20px',
    padding: '.18rem .6rem',
    fontSize: '.63rem',
    fontWeight: 700,
  },
  expandInfo: {
    padding: '.8rem .75rem .85rem',
  },
  expandBrandRow: {
    display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.55rem',
  },
  expandAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6c47ff,#ff4f87)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '.85rem', fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  expandBrandName: { fontWeight: 700, fontSize: '.85rem', color: '#f0f0f8' },
  expandBrandSub:  { fontSize: '.66rem', color: '#8888aa', marginTop: '.04rem' },
  expandTitle: {
    fontSize: '.84rem', fontWeight: 600, lineHeight: 1.4,
    color: '#f0f0f8', margin: '0 0 .55rem',
  },
  tagPurple: { background:'rgba(108,71,255,.2)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.3)', borderRadius:'20px', padding:'.16rem .6rem', fontSize:'.63rem', fontWeight:700 },
  tagGray:   { background:'rgba(255,255,255,.06)', color:'#8888aa', borderRadius:'20px', padding:'.16rem .6rem', fontSize:'.63rem' },
  tagGreen:  { background:'rgba(74,222,128,.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,.25)', borderRadius:'20px', padding:'.16rem .6rem', fontSize:'.63rem', fontWeight:700 },
  expandStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.35rem',
    marginBottom: '.65rem', paddingTop: '.55rem', borderTop: '1px solid rgba(255,255,255,.07)',
  },
  expandStat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '.08rem', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem',
  },
  fullDetailBtn: {
    width: '100%', padding: '.45rem',
    borderRadius: '8px', border: '1px solid rgba(108,71,255,.3)',
    background: 'rgba(108,71,255,.12)', color: '#8b6bff',
    fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .2s',
  },

  // ── Collapsed ──
  media: {
    width: '100%', height: '220px', background: '#161625',
    position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  blurBg: {
    position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(18px) brightness(0.45) saturate(1.3)', transform: 'scale(1.12)', zIndex: 0,
  },
  img: {
    position: 'relative', zIndex: 1,
    height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block',
  },
  noImg: { fontSize: '2.5rem', color: '#8888aa' },
  objBadge: {
    position: 'absolute', top: '8px', left: '8px', zIndex: 3,
    background: 'rgba(108,71,255,.92)', color: '#fff',
    borderRadius: '6px', padding: '.22rem .6rem', fontSize: '.65rem', fontWeight: 700, textTransform: 'capitalize',
  },
  playHoverWrap: {
    position: 'absolute', inset: 0, zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  playHoverCircle: {
    width: '50px', height: '50px', borderRadius: '50%',
    background: 'rgba(108,71,255,.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', color: '#fff',
    boxShadow: '0 0 22px rgba(108,71,255,.5)',
    transition: 'opacity .2s',
  },
  vidBadge: {
    position: 'absolute', bottom: '8px', right: '8px', zIndex: 3,
    background: 'rgba(0,0,0,.75)', color: '#fff',
    borderRadius: '6px', padding: '.22rem .6rem', fontSize: '.68rem', fontWeight: 600,
  },
  body:     { padding: '0.9rem' },
  topRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem' },
  platform: { background: 'rgba(255,255,255,.06)', color: '#8888aa', borderRadius: '4px', padding: '.18rem .5rem', fontSize: '.68rem', fontWeight: 700 },
  adId:     { fontSize: '.62rem', color: '#555577' },
  title:    { fontSize: '.86rem', fontWeight: 600, lineHeight: 1.4, color: '#f0f0f8', margin: '0 0 .55rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.75rem' },
  avatar:   { width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0 },
  brandName:{ fontSize: '.75rem', color: '#8888aa' },
  stats:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.35rem', marginBottom: '.75rem', paddingTop: '.65rem', borderTop: '1px solid rgba(255,255,255,.07)' },
  stat:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.1rem', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem' },
  statIcon: { fontSize: '.75rem' },
  statVal:  { fontSize: '.72rem', fontWeight: 700, color: '#f0f0f8' },
  statKey:  { fontSize: '.58rem', color: '#8888aa' },
  actions:  { display: 'flex', gap: '.5rem' },
  saveBtn:  { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.76rem', cursor: 'pointer' },
  savedBtn: { background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  detailBtn:{ flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(108,71,255,.3)', background: 'rgba(108,71,255,.15)', color: '#8b6bff', fontSize: '.76rem', cursor: 'pointer', fontWeight: 700 },
};
