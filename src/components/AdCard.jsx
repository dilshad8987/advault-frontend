import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'https://advault-backend-production-fb35.up.railway.app/api';

function proxyImageUrl(imageUrl, libraryId) {
  if (!imageUrl && !libraryId) return '';
  const params = new URLSearchParams();
  if (libraryId) params.set('id', libraryId);
  if (imageUrl)  params.set('url', encodeURIComponent(imageUrl));
  return API_BASE.replace('/api', '') + '/api/ads/image-proxy?' + params.toString();
}

function fixImageUrl(url) {
  if (!url) return '';
  return url
    .replace('s60x60', 's600x600')
    .replace('dst-jpg_s60x60', 'dst-jpg_s600x600')
    .replace('_s60x60', '_s600x600')
    .replace('p60x60', 'p600x600');
}

function TikTokBadge() {
  return (
    <span style={s.platformBadge}>
      <svg width="10" height="11" viewBox="0 0 24 24" fill="#ccc" style={{ flexShrink: 0 }}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/>
      </svg>
      TIKTOK
    </span>
  );
}

function MetaBadge() {
  return (
    <span style={{ ...s.platformBadge, background: 'rgba(255,255,255,.06)', color: '#8888aa' }}>
      <svg width="20" height="9" viewBox="0 0 66 30" fill="none" style={{ flexShrink: 0 }}>
        <path d="M4 18C4 13 6.5 8 10 8C12.5 8 14.5 10 17 14L20 19C22 22.5 24 25 26.5 25C29.5 25 31.5 21.5 31.5 16.5C31.5 12 29.5 9 27 8" stroke="#8888aa" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M4 16C4 10 6.5 5 11 5C13.5 5 16 7 18.5 11L21.5 16C23.5 19.5 26 22.5 28.5 22.5" stroke="#8888aa" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M36 18C36 13 38.5 8 42 8C44.5 8 46.5 10 49 14L52 19C54 22.5 56 25 58.5 25C61.5 25 63.5 21.5 63.5 16.5C63.5 12 61.5 9 59 8" stroke="#8888aa" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M36 16C36 10 38.5 5 43 5C45.5 5 48 7 50.5 11L53.5 16C55.5 19.5 58 22.5 60.5 22.5" stroke="#8888aa" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      </svg>
      META
    </span>
  );
}

// ✅ R2 video seedha play karo — proxy ki zaroorat nahi
function getVideoStreamUrl(videoUrl, authToken) {
  if (!videoUrl) return null;
  // R2 URL — seedha play karo (pub- se shuru hoti hai ya r2.dev hai)
  if (videoUrl.includes('r2.dev') || videoUrl.includes('pub-')) {
    return videoUrl;
  }
  // Facebook ya aur CDN — backend proxy se
  return API_BASE.replace('/api', '') + '/api/ads/video/stream?token=' + encodeURIComponent(authToken) + '&url=' + encodeURIComponent(videoUrl);
}



export default function AdCard({ ad, platform = 'tiktok' }) {
  const [saved, setSaved] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const navigate = useNavigate();
  const isMeta = platform === 'meta';

  function fmtNum(n) {
    n = Number(n);
    return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();
  }

  // TikTok fields
  const ttTitle    = ad.ad_title || ad.title || 'No Title';
  const ttBrand    = ad.brand_name || 'Unknown Brand';
  const ttLikes    = Number(ad.like || 0);
  const ttComments = Number(ad.comment || 0);
  const ttCtr      = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const ttCost     = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const ttCover    = ad.video_info?.cover || '';
  const ttObjective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const ttAdId     = ad.id || ad.material_id || String(Math.random());

  // Meta fields
  const mtTitle = (
    ad.ad_creative_bodies?.[0] ||
    ad.ad_creative_link_titles?.[0] ||
    ad._raw?.body ||
    ad._raw?.page_name ||
    ad.page_name ||
    ad.title ||
    'No Title'
  ).slice(0, 120);

  const mtBrand   = ad.page_name || ad._raw?.page_name || ad._raw?.brand || ad.bylines || 'Unknown Page';
  const mtStatus  = ad.active === false ? 'Inactive' : 'Active';
  const mtSpend   = (() => {
    const sp = ad.spend;
    if (!sp) return '—';
    if (typeof sp === 'object') {
      const lo = sp.lower_bound, hi = sp.upper_bound;
      if (lo && hi) return '$' + Number(lo).toLocaleString() + '–$' + Number(hi).toLocaleString();
      if (lo) return '$' + Number(lo).toLocaleString() + '+';
    }
    if (sp) return '$' + Number(sp).toLocaleString();
    return '—';
  })();
  const mtImpressions = (() => {
    const imp = ad.impressions;
    if (!imp) return '—';
    if (typeof imp === 'object') {
      const lo = imp.lower_bound, hi = imp.upper_bound;
      if (lo && hi) return fmtNum((Number(lo)+Number(hi))/2);
      if (lo) return fmtNum(Number(lo)) + '+';
    }
    return fmtNum(Number(imp));
  })();
  const mtStartDate = ad.ad_delivery_start_time
    ? new Date(ad.ad_delivery_start_time).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' })
    : ad._raw?.start_date || '—';
  const mtCurrency = ad.currency || 'USD';
  const mtAdId     = ad.id || ad.ad_archive_id || ad._raw?.library_id || String(Math.random());

  const title     = isMeta ? mtTitle  : ttTitle;
  const brand     = isMeta ? mtBrand  : ttBrand;
  const adId      = isMeta ? mtAdId   : ttAdId;
  const objective = isMeta ? mtStatus : ttObjective;

  // ✅ R2 image — pehle R2, phir proxy
  const r2ImageUrl  = isMeta ? (ad.r2_image_url || ad._raw?.r2_image_url || '') : '';
  const rawImageUrl = isMeta
    ? (r2ImageUrl || ad.image || ad._raw?.image || ad.ad_snapshot_url || ad.snapshot_url || '')
    : ttCover;

  // ✅ R2 video — pehle r2_video_url, phir video field
  const rawVideoUrl = isMeta
    ? (ad.r2_video_url || ad._raw?.r2_video_url || ad.video_url || ad._raw?.video || ad.video || '')
    : (ad.video_info?.play_url || '');

  const libraryId = isMeta ? (ad._raw?.library_id || mtAdId) : null;

  // ✅ Thumbnail — R2 seedha, warna proxy
  const thumbUrl = isMeta
    ? (r2ImageUrl || proxyImageUrl(rawImageUrl, libraryId))
    : fixImageUrl(rawImageUrl);

  // ✅ Video badge — video hai toh dikhao
  const hasVideo = isMeta ? !!rawVideoUrl : !!(ad.video_info || ad.isVideo);


  const saveAd = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/ads/save', { adId, adData: { title, brand, cover: thumbUrl, platform } });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  const openDetail = (e) => {
    e.stopPropagation();
    navigate('/ad/' + adId, { state: { ad } });
  };

  return (
    <>
      <div
        style={s.card}
        onClick={openDetail}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = isMeta ? 'rgba(24,119,242,.35)' : 'rgba(108,71,255,.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
        }}
      >
        {/* THUMBNAIL */}
        <div style={s.media}>
          {thumbUrl && !thumbError ? (
            <>
              <div style={{ ...s.blurBg, backgroundImage: 'url(' + thumbUrl + ')' }} />
              <img
                src={thumbUrl}
                alt={title}
                style={s.img}
                loading="lazy"
                onError={() => setThumbError(true)}
              />
            </>
          ) : isMeta ? (
            <div style={s.metaPlaceholder}>
              <div style={s.placeholderInnerIcon}>📣</div>
              <p style={s.placeholderInnerText}>{brand}</p>
            </div>
          ) : (
            <div style={s.noImg}>🎵</div>
          )}

          {/* ✅ Video badge */}
          {hasVideo && (
            <span style={s.vidBadge}>▶ Video</span>
          )}

          {/* ✅ Play button — sirf video wale ads pe (image ads pe nahi) */}
          {hasVideo && (
            <div style={s.playOverlay}>
              <div style={s.playBtn}>▶</div>
            </div>
          )}
        </div>

        {/* BODY */}
        <div style={s.body}>
          <div style={s.topRow}>
            {isMeta ? <MetaBadge /> : <TikTokBadge />}
            <span style={s.adId}>{adId?.toString().slice(-10)}</span>
          </div>

          <p style={s.title}>{title}</p>

          <div style={s.brandRow}>
            <div style={{
              ...s.avatar,
              background: isMeta
                ? 'linear-gradient(135deg,#1877F2,#E1306C)'
                : 'linear-gradient(135deg,#6c47ff,#ff4f87)',
            }} />
            <span style={s.brandName}>{brand}</span>
          </div>

          <div style={s.stats}>
            {isMeta ? (
              <>
                <div style={s.stat}><span style={s.statIcon}>👁</span><span style={s.statVal}>{mtImpressions}</span><span style={s.statKey}>Impressions</span></div>
                <div style={s.stat}><span style={s.statIcon}>💰</span><span style={s.statVal}>{mtSpend}</span><span style={s.statKey}>Spend</span></div>
                <div style={s.stat}><span style={s.statIcon}>📅</span><span style={s.statVal}>{mtStartDate}</span><span style={s.statKey}>Started</span></div>
                <div style={s.stat}><span style={s.statIcon}>🌐</span><span style={s.statVal}>{mtCurrency}</span><span style={s.statKey}>Currency</span></div>
              </>
            ) : (
              <>
                <div style={s.stat}><span style={s.statIcon}>❤️</span><span style={s.statVal}>{fmtNum(ttLikes)}</span><span style={s.statKey}>Likes</span></div>
                <div style={s.stat}><span style={s.statIcon}>💬</span><span style={s.statVal}>{fmtNum(ttComments)}</span><span style={s.statKey}>Comments</span></div>
                <div style={s.stat}><span style={s.statIcon}>📊</span><span style={s.statVal}>{ttCtr}</span><span style={s.statKey}>CTR</span></div>
                <div style={s.stat}><span style={s.statIcon}>💰</span><span style={s.statVal}>{ttCost}</span><span style={s.statKey}>Spend</span></div>
              </>
            )}
          </div>

          <div style={s.actions}>
            <button style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }} onClick={saveAd} disabled={saved}>
              {saved ? '✅ Saved' : '💾 Save'}
            </button>
            <button style={s.detailBtn} onClick={openDetail}>
              🔍 Detail
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform .22s, border-color .22s', userSelect: 'none', WebkitTapHighlightColor: 'transparent' },
  media: { width: '100%', height: '240px', background: '#161625', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  blurBg: { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(0.5) saturate(1.4)', transform: 'scale(1.15)', zIndex: 0 },
  img: { position: 'relative', zIndex: 1, height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' },
  noImg: { fontSize: '2.5rem', color: '#8888aa' },
  metaPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg,rgba(24,119,242,.1),rgba(225,48,108,.07))', gap: '0.5rem' },
  placeholderInnerIcon: { fontSize: '2.2rem' },
  placeholderInnerText: { color: '#5aabff', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', padding: '0 1rem', margin: 0 },
  playOverlay: { position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' },
  playBtn: { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', border: '2px solid rgba(255,255,255,.4)', backdropFilter: 'blur(4px)' },
  vidBadge: { position: 'absolute', bottom: '8px', right: '8px', zIndex: 3, background: 'rgba(0,0,0,.75)', color: '#fff', borderRadius: '6px', padding: '.22rem .6rem', fontSize: '.68rem', fontWeight: 600 },
  body: { padding: '0.9rem' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.55rem' },
  platformBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,.06)', color: '#8888aa', borderRadius: '4px', padding: '.18rem .5rem', fontSize: '.68rem', fontWeight: 700 },
  adId: { fontSize: '.62rem', color: '#555577' },
  title: { fontSize: '.86rem', fontWeight: 600, lineHeight: 1.4, color: '#f0f0f8', margin: '0 0 .55rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.75rem' },
  avatar: { width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 },
  brandName: { fontSize: '.75rem', color: '#8888aa' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.35rem', marginBottom: '.75rem', paddingTop: '.65rem', borderTop: '1px solid rgba(255,255,255,.07)' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.1rem', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem' },
  statIcon: { fontSize: '.75rem' },
  statVal: { fontSize: '.72rem', fontWeight: 700, color: '#f0f0f8' },
  statKey: { fontSize: '.58rem', color: '#8888aa' },
  actions: { display: 'flex', gap: '.5rem' },
  saveBtn: { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.76rem', cursor: 'pointer' },
  savedBtn: { background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  detailBtn: { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(108,71,255,.3)', background: 'rgba(108,71,255,.15)', color: '#8b6bff', fontSize: '.76rem', cursor: 'pointer', fontWeight: 700 },
  modalOverlay: {},
  modalBox: {},
  modalHeader: {},
  modalHeaderLeft: {},
  modalTitle: {},
  modalClose: {},
  modalBody: {},
  modalVideo: {},
  modalImgWrap: {},
  modalImg: {},
  modalPlaceholder: {},
  modalFooter: {},
  modalAdTitle: {},
  modalMeta: {},
  modalMetaItem: {},
  placeholderIcon: {},
  placeholderTitle: {},
  placeholderBody: {},
  placeholderDate: {},
  placeholderMeta: {},
  placeholderBadge: {},
  placeholderId: {},
};
