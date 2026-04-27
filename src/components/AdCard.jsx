import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdCard({ ad }) {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  // Real API fields from tiktok-video-no-watermark2
  const title     = ad.ad_title || ad.title || 'No Title';
  const brand     = ad.brand_name || 'Unknown Brand';
  const likes     = Number(ad.like || 0);
  const comments  = Number(ad.comment || 0);
  const favorite  = Number(ad.favorite || 0);
  const share     = Number(ad.share || 0);
  const ctr       = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const cost      = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const cover     = ad.video_info?.cover || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const adId      = ad.id || String(Math.random());

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

  const openDetail = () => navigate(`/ad/${adId}`, { state: { ad } });

  return (
    <div style={s.card} onClick={openDetail}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(108,71,255,.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; }}
    >
      {/* ── THUMBNAIL — Image 1 style ── */}
      <div style={s.media}>
        {cover ? (
          <>
            <div style={{ ...s.blurBg, backgroundImage: `url(${cover})` }} />
            <img src={cover} alt={title} style={s.img} loading="lazy" />
          </>
        ) : (
          <div style={s.noImg}>🎵</div>
        )}
        {/* Objective badge top-left */}
        {objective && <span style={s.objBadge}>{objective}</span>}
        {/* Video badge bottom-right */}
        <span style={s.vidBadge}>▶ Video</span>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>
        {/* Platform + ID row */}
        <div style={s.topRow}>
          <span style={s.platform}>🎵 TIKTOK</span>
          <span style={s.adId}>{adId?.toString().slice(-10)}</span>
        </div>

        {/* Title */}
        <p style={s.title}>{title}</p>

        {/* Brand */}
        <div style={s.brandRow}>
          <div style={s.avatar} />
          <span style={s.brandName}>{brand}</span>
        </div>

        {/* Stats — 4 boxes like Image 1 */}
        <div style={s.stats}>
          <div style={s.stat}>
            <span style={s.statIcon}>❤️</span>
            <span style={s.statVal}>{fmtNum(likes)}</span>
            <span style={s.statKey}>Likes</span>
          </div>
          <div style={s.stat}>
            <span style={s.statIcon}>💬</span>
            <span style={s.statVal}>{fmtNum(comments)}</span>
            <span style={s.statKey}>Comments</span>
          </div>
          <div style={s.stat}>
            <span style={s.statIcon}>📊</span>
            <span style={s.statVal}>{ctr}</span>
            <span style={s.statKey}>CTR</span>
          </div>
          <div style={s.stat}>
            <span style={s.statIcon}>💰</span>
            <span style={s.statVal}>{cost}</span>
            <span style={s.statKey}>Spend</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={s.actions}>
          <button style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }}
            onClick={saveAd} disabled={saved}>
            {saved ? '✅ Saved' : '💾 Save Ad'}
          </button>
          <button style={s.detailBtn} onClick={openDetail}>
            🔍 Detail
          </button>
        </div>
      </div>
    </div>
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
    width: '100%',
    height: '220px',
    background: '#161625',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurBg: {
    position: 'absolute', inset: 0,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(18px) brightness(0.45) saturate(1.3)',
    transform: 'scale(1.12)',
    zIndex: 0,
  },
  img: {
    position: 'relative', zIndex: 1,
    height: '100%', width: 'auto',
    maxWidth: '100%', objectFit: 'contain', display: 'block',
  },
  noImg: {
    fontSize: '2.5rem', color: '#8888aa',
  },
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
  topRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '.55rem',
  },
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
  avatar: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0,
  },
  brandName: { fontSize: '.75rem', color: '#8888aa' },
  stats: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem', marginBottom: '.75rem',
    paddingTop: '.65rem', borderTop: '1px solid rgba(255,255,255,.07)',
  },
  stat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '.1rem', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem',
  },
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
  savedBtn: {
    background: 'rgba(108,71,255,.2)', color: '#8b6bff',
    border: '1px solid rgba(108,71,255,.3)',
  },
  detailBtn: {
    flex: 1, padding: '.42rem', borderRadius: '7px',
    border: '1px solid rgba(108,71,255,.3)',
    background: 'rgba(108,71,255,.15)', color: '#8b6bff',
    fontSize: '.76rem', cursor: 'pointer', fontWeight: 700,
  },
};
