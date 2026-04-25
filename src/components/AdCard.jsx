import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdCard({ ad }) {
  const [saved,     setSaved]     = useState(false);
  const [hovering,  setHovering]  = useState(false);
  const [vidError,  setVidError]  = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const title     = ad.ad_title || ad.title || 'No Title';
  const brand     = ad.brand_name || ad.brand?.name || 'Unknown Brand';
  const likes     = ad.like || ad.metrics?.likes || 0;
  const comments  = ad.comment || ad.metrics?.comments || 0;
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(2) + '%' : '0%';
  const cover     = ad.video_info?.cover || ad.imageUrl || '';
  const videoUrl  = ad.video_info?.vid || ad.video_url || '';
  const isVideo   = !!ad.video_info || !!videoUrl;
  const adId      = ad.id || ad.ad_id || String(Math.random());
  const industry  = ad.industry_key?.replace('label_', '') || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const cost      = ad.cost || ad.spend || 0;

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getProxyUrl = (url) => {
    if (!url) return '';
    const token = localStorage.getItem('accessToken') || '';
    return `${API_BASE}/api/ads/video/stream?url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
  };

  const handleMouseEnter = () => {
    setHovering(true);
    if (videoRef.current && videoUrl && !vidError) {
      videoRef.current.play().catch(() => setVidError(true));
    }
  };

  const handleMouseLeave = () => {
    setHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

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

  const openDetail = () => navigate(`/ad/${adId}`, { state: { ad } });

  return (
    <div
      style={S.card}
      onClick={openDetail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="ad-card"
    >
      {/* Media */}
      <div style={S.media}>
        {/* Cover image — always shown */}
        {cover
          ? <img src={cover} alt={title} style={{ ...S.coverImg, opacity: hovering && isVideo && !vidError ? 0 : 1 }} />
          : <span style={{ fontSize: '2.8rem' }}>🎵</span>
        }

        {/* Video — plays on hover */}
        {isVideo && videoUrl && !vidError && (
          <video
            ref={videoRef}
            src={getProxyUrl(videoUrl)}
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVidError(true)}
            style={{ ...S.hoverVideo, opacity: hovering ? 1 : 0 }}
          />
        )}

        {/* Badges */}
        {isVideo && <span style={S.videoBadge}>{hovering ? '▶ Playing' : '▶ Video'}</span>}
        {objective && <span style={S.objectiveBadge}>{objective}</span>}

        {/* Hover overlay — only when no video */}
        {(!isVideo || vidError) && (
          <div style={{ ...S.hoverOverlay, opacity: hovering ? 1 : 0 }}>
            <span style={S.viewText}>🔍 Detail Dekho</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={S.body}>
        <div style={S.topRow}>
          <span style={S.platform}>🎵 TIKTOK</span>
          {industry && <span style={S.industry}>{industry}</span>}
        </div>

        <p style={S.title}>{title}</p>

        <div style={S.brand}>
          <div style={S.avatar}></div>
          <span style={S.brandName}>{brand}</span>
        </div>

        <div style={S.metrics}>
          {[
            ['❤️', likes.toLocaleString(), 'Likes'],
            ['💬', comments.toLocaleString(), 'Comments'],
            ['📊', ctr, 'CTR'],
            ['💰', cost || '—', 'Cost'],
          ].map(([icon, val, key]) => (
            <div key={key} style={S.metric}>
              <div style={S.metricVal}>{icon} {val}</div>
              <div style={S.metricKey}>{key}</div>
            </div>
          ))}
        </div>

        <div style={S.actions}>
          <button style={{ ...S.actionBtn, ...(saved ? S.savedBtn : {}) }} onClick={saveAd} disabled={saved}>
            {saved ? '✅ Saved' : '💾 Save Ad'}
          </button>
          <button style={S.detailBtn} onClick={openDetail}>🔍 Detail</button>
        </div>
      </div>
    </div>
  );
}

const S = {
  card:        { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.08)', borderRadius:'14px', overflow:'hidden', transition:'transform .25s, border-color .25s, box-shadow .25s', cursor:'pointer', position:'relative' },
  media:       { width:'100%', height:'200px', background:'linear-gradient(135deg,#0f0f1a,#161625)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' },
  coverImg:    { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'opacity .3s' },
  hoverVideo:  { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'opacity .3s' },
  hoverOverlay:{ position:'absolute', inset:0, background:'rgba(108,71,255,0.55)', display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity .2s', backdropFilter:'blur(2px)' },
  viewText:    { color:'#fff', fontWeight:700, fontSize:'.95rem' },
  videoBadge:  { position:'absolute', bottom:'8px', right:'8px', background:'rgba(0,0,0,.75)', borderRadius:'5px', padding:'.25rem .6rem', fontSize:'.7rem', color:'#fff', transition:'all .2s' },
  objectiveBadge:{ position:'absolute', top:'8px', left:'8px', background:'rgba(108,71,255,.8)', borderRadius:'5px', padding:'.2rem .55rem', fontSize:'.65rem', color:'#fff', fontWeight:700 },
  body:        { padding:'1rem' },
  topRow:      { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.6rem' },
  platform:    { display:'inline-block', padding:'.2rem .55rem', borderRadius:'4px', fontSize:'.72rem', fontWeight:700, background:'rgba(255,255,255,.06)', color:'#8888aa' },
  industry:    { fontSize:'.65rem', color:'#8888aa', background:'#161625', padding:'.2rem .5rem', borderRadius:'4px' },
  title:       { fontSize:'.88rem', fontWeight:600, lineHeight:1.4, marginBottom:'.5rem', color:'#f0f0f8', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  brand:       { display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'.75rem' },
  avatar:      { width:'22px', height:'22px', borderRadius:'50%', background:'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink:0 },
  brandName:   { fontSize:'.78rem', color:'#8888aa' },
  metrics:     { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'.4rem', paddingTop:'.75rem', borderTop:'1px solid rgba(255,255,255,.08)', marginBottom:'.75rem' },
  metric:      { textAlign:'center', background:'#161625', borderRadius:'8px', padding:'.4rem .2rem' },
  metricVal:   { fontSize:'.75rem', fontWeight:700 },
  metricKey:   { fontSize:'.6rem', color:'#8888aa', marginTop:'.1rem' },
  actions:     { display:'flex', gap:'.5rem' },
  actionBtn:   { flex:1, padding:'.45rem', borderRadius:'7px', border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'#8888aa', fontSize:'.78rem', cursor:'pointer' },
  savedBtn:    { background:'rgba(108,71,255,.25)', color:'#8b6bff', border:'1px solid rgba(108,71,255,.3)' },
  detailBtn:   { flex:1, padding:'.45rem', borderRadius:'7px', border:'1px solid rgba(108,71,255,.3)', background:'rgba(108,71,255,.15)', color:'#8b6bff', fontSize:'.78rem', cursor:'pointer', fontWeight:600 },
};
