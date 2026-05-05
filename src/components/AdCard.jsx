import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── Fix blurry image — s60x60 → s600x600 ───────────────────────────────────
function fixImageUrl(url) {
  if (!url) return '';
  return url
    .replace('s60x60', 's600x600')
    .replace('dst-jpg_s60x60', 'dst-jpg_s600x600')
    .replace('_s60x60', '_s600x600')
    .replace('p60x60', 'p600x600');
}

// ─── Badges ───────────────────────────────────────────────────────────────────
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
    <span style={{ ...s.platformBadge, background: 'rgba(24,119,242,.15)', color: '#5aabff' }}>
      <svg width="20" height="9" viewBox="0 0 66 30" fill="none" style={{ flexShrink: 0 }}>
        <path d="M4 18C4 13 6.5 8 10 8C12.5 8 14.5 10 17 14L20 19C22 22.5 24 25 26.5 25C29.5 25 31.5 21.5 31.5 16.5C31.5 12 29.5 9 27 8" stroke="#1877F2" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M4 16C4 10 6.5 5 11 5C13.5 5 16 7 18.5 11L21.5 16C23.5 19.5 26 22.5 28.5 22.5" stroke="#E1306C" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M36 18C36 13 38.5 8 42 8C44.5 8 46.5 10 49 14L52 19C54 22.5 56 25 58.5 25C61.5 25 63.5 21.5 63.5 16.5C63.5 12 61.5 9 59 8" stroke="#1877F2" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M36 16C36 10 38.5 5 43 5C45.5 5 48 7 50.5 11L53.5 16C55.5 19.5 58 22.5 60.5 22.5" stroke="#E1306C" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      </svg>
      META
    </span>
  );
}

// ─── Facebook Snapshot Modal ───────────────────────────────────────────────────
function FbModal({ url, adData, videoUrl, onClose }) {
  const [iframeBlocked, setIframeBlocked] = React.useState(false);

  React.useEffect(() => {
    if (!videoUrl) {
      const timer = setTimeout(() => setIframeBlocked(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [videoUrl]);

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modalBox} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>📺 Ad Preview</span>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Ad Info */}
        <div style={s.modalAdInfo}>
          {adData.cover && (
            <img
              src={adData.cover}
              alt="ad"
              style={s.modalAdImg}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={s.modalAdText}>
            <div style={s.modalAdBrand}>{adData.brand}</div>
            <div style={s.modalAdTitle}>{adData.title}</div>
            {adData.startDate && (
              <div style={s.modalAdDate}>📅 Started: {adData.startDate}</div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={s.modalBody}>
          {videoUrl ? (
            // Direct MP4 video play karo
            <video
              src={videoUrl}
              controls
              autoPlay
              style={s.modalVideo}
              poster={adData.cover}
              onError={() => setIframeBlocked(true)}
            >
              Your browser does not support video.
            </video>
          ) : (
            // Video nahi hai — Facebook pe redirect
            <div style={s.modalFallback}>
              <div style={s.modalFbLogo}>
                <svg width="40" height="16" viewBox="0 0 66 30" fill="none">
                  <path d="M4 18C4 13 6.5 8 10 8C12.5 8 14.5 10 17 14L20 19C22 22.5 24 25 26.5 25C29.5 25 31.5 21.5 31.5 16.5C31.5 12 29.5 9 27 8" stroke="#1877F2" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <path d="M4 16C4 10 6.5 5 11 5C13.5 5 16 7 18.5 11L21.5 16C23.5 19.5 26 22.5 28.5 22.5" stroke="#E1306C" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <path d="M36 18C36 13 38.5 8 42 8C44.5 8 46.5 10 49 14L52 19C54 22.5 56 25 58.5 25C61.5 25 63.5 21.5 63.5 16.5C63.5 12 61.5 9 59 8" stroke="#1877F2" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <path d="M36 16C36 10 38.5 5 43 5C45.5 5 48 7 50.5 11L53.5 16C55.5 19.5 58 22.5 60.5 22.5" stroke="#E1306C" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <p style={s.modalFallbackText}>
                Video yahan available nahi<br/>
                Facebook pe dekho
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={s.modalOpenBtn}
                onClick={onClose}
              >
                📺 Facebook pe Video Dekho
              </a>
              <p style={s.modalFallbackSub}>
                New tab mein khulega
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.modalFooter}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={s.modalLink}>
            🔗 Ads Library ID: {url.split('id=')[1] || ''}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdCard ──────────────────────────────────────────────────────────────
export default function AdCard({ ad, platform = 'tiktok' }) {
  const [saved, setSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const isMeta = platform === 'meta';

  function fmtNum(n) {
    n = Number(n);
    return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();
  }

  // ── TikTok fields ──
  const ttTitle    = ad.ad_title || ad.title || 'No Title';
  const ttBrand    = ad.brand_name || 'Unknown Brand';
  const ttLikes    = Number(ad.like || 0);
  const ttComments = Number(ad.comment || 0);
  const ttCtr      = ad.ctr ? (ad.ctr * 100).toFixed(1) + '%' : '—';
  const ttCost     = ad.cost ? '$' + Number(ad.cost).toLocaleString() : '—';
  const ttCover    = ad.video_info?.cover || '';
  const ttObjective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const ttAdId     = ad.id || ad.material_id || String(Math.random());

  // ── Meta fields ──
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
    : '—';
  const mtCurrency = ad.currency || 'USD';
  const mtAdId     = ad.id || ad.ad_archive_id || String(Math.random());

  // ── Shared ──
  const title    = isMeta ? mtTitle  : ttTitle;
  const brand    = isMeta ? mtBrand  : ttBrand;
  const adId     = isMeta ? mtAdId   : ttAdId;
  const objective = isMeta ? mtStatus : ttObjective;

  // ── Image — fix blur ──
  const rawCover  = isMeta
    ? (
        ad.ad_snapshot_url ||
        ad.image           ||
        ad._raw?.image     ||
        ad.snapshot_url    ||
        ad._raw?.snapshot_url ||
        ''
      )
    : ttCover;
  const cover = fixImageUrl(rawCover);

  // ── Facebook snapshot URL ──
  const fbSnapUrl = isMeta
    ? (ad._raw?.snapshot_url || ad.snapshot_url || (adId ? 'https://www.facebook.com/ads/library/?id=' + adId : ''))
    : '';

  // ── Video URL ──
  const metaVideoUrl = isMeta
    ? (ad.video_url || ad._raw?.video || '')
    : '';

  const saveAd = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/ads/save', { adId, adData: { title, brand, cover, platform } });
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

  const openModal = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };
  const modalAdData = {
    cover: cover,
    brand: brand,
    title: title,
    startDate: mtStartDate || '',
  };

  return (
    <>
      {showModal && <FbModal url={fbSnapUrl} adData={modalAdData} videoUrl={metaVideoUrl} onClose={() => setShowModal(false)} />}

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
        {/* ── THUMBNAIL ── */}
        <div style={s.media}>
          {cover ? (
            <>
              <div style={{ ...s.blurBg, backgroundImage: 'url(' + cover + ')' }} />
              <img src={cover} alt={title} style={s.img} loading="lazy" />
            </>
          ) : isMeta ? (
            <div style={s.metaPlaceholder}>
              <svg width="52" height="22" viewBox="0 0 66 30" fill="none">
                <path d="M4 18C4 13 6.5 8 10 8C12.5 8 14.5 10 17 14L20 19C22 22.5 24 25 26.5 25C29.5 25 31.5 21.5 31.5 16.5C31.5 12 29.5 9 27 8" stroke="#1877F2" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M4 16C4 10 6.5 5 11 5C13.5 5 16 7 18.5 11L21.5 16C23.5 19.5 26 22.5 28.5 22.5" stroke="#E1306C" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M36 18C36 13 38.5 8 42 8C44.5 8 46.5 10 49 14L52 19C54 22.5 56 25 58.5 25C61.5 25 63.5 21.5 63.5 16.5C63.5 12 61.5 9 59 8" stroke="#1877F2" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M36 16C36 10 38.5 5 43 5C45.5 5 48 7 50.5 11L53.5 16C55.5 19.5 58 22.5 60.5 22.5" stroke="#E1306C" strokeWidth="3" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          ) : (
            <div style={s.noImg}>🎵</div>
          )}

          {objective && (
            <span style={{
              ...s.objBadge,
              ...(isMeta && mtStatus === 'Active'   ? { background: 'rgba(34,197,94,.88)' }  : {}),
              ...(isMeta && mtStatus === 'Inactive' ? { background: 'rgba(239,68,68,.78)' }  : {}),
            }}>
              {objective}
            </span>
          )}
          <span style={s.vidBadge}>{isMeta ? '📣 Meta Ad' : '▶ Video'}</span>
        </div>

        {/* ── BODY ── */}
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
            <button style={{ ...s.detailBtn }} onClick={openDetail}>
              🔍 Detail
            </button>
            {isMeta && fbSnapUrl && (
              <button style={s.viewBtn} onClick={openModal}>
                📺 View
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform .22s, border-color .22s', userSelect: 'none', WebkitTapHighlightColor: 'transparent' },
  media: { width: '100%', height: '220px', background: '#161625', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  blurBg: { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.45) saturate(1.3)', transform: 'scale(1.12)', zIndex: 0 },
  img: { position: 'relative', zIndex: 1, height: '100%', width: '100%', maxWidth: '100%', objectFit: 'cover', display: 'block' },
  noImg: { fontSize: '2.5rem', color: '#8888aa' },
  metaPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg,rgba(24,119,242,.07),rgba(225,48,108,.07))' },
  objBadge: { position: 'absolute', top: '8px', left: '8px', zIndex: 3, background: 'rgba(108,71,255,.92)', color: '#fff', borderRadius: '6px', padding: '.22rem .6rem', fontSize: '.65rem', fontWeight: 700, textTransform: 'capitalize' },
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
  viewBtn: { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(24,119,242,.35)', background: 'rgba(24,119,242,.15)', color: '#5aabff', fontSize: '.76rem', cursor: 'pointer', fontWeight: 700 },

  // Modal styles
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modalBox: { background: '#0f0f1a', border: '1px solid rgba(24,119,242,.3)', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,.07)' },
  modalTitle: { color: '#f0f0f8', fontSize: '.9rem', fontWeight: 700 },
  modalClose: { background: 'rgba(255,255,255,.08)', border: 'none', color: '#aaa', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '.9rem' },
  modalBody: { flex: 1, overflow: 'hidden', minHeight: '400px' },
  modalIframe: { width: '100%', height: '100%', minHeight: '400px', border: 'none', background: '#fff' },
  modalFooter: { padding: '.6rem 1rem', borderTop: '1px solid rgba(255,255,255,.07)', textAlign: 'center' },
  modalLink: { color: '#5aabff', fontSize: '.8rem', textDecoration: 'none' },

  // Modal ad info
  modalAdInfo: { display: 'flex', gap: '.75rem', padding: '.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,.07)', alignItems: 'center' },
  modalAdImg: { width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  modalAdText: { flex: 1, minWidth: 0 },
  modalAdBrand: { fontSize: '.75rem', color: '#5aabff', fontWeight: 700, marginBottom: '.2rem' },
  modalAdTitle: { fontSize: '.82rem', color: '#f0f0f8', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  modalAdDate: { fontSize: '.7rem', color: '#8888aa', marginTop: '.3rem' },

  // Fallback
  modalFallback: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', gap: '1rem', height: '100%' },
  modalFbLogo: { padding: '.75rem 1.5rem', background: 'rgba(24,119,242,.1)', borderRadius: '12px', border: '1px solid rgba(24,119,242,.2)' },
  modalFallbackText: { color: '#8888aa', fontSize: '.85rem', textAlign: 'center', lineHeight: 1.6, margin: 0 },
  modalFallbackSub: { color: '#555577', fontSize: '.72rem', textAlign: 'center', margin: 0 },
  modalOpenBtn: { display: 'block', padding: '.75rem 2rem', background: 'linear-gradient(135deg,#1877F2,#E1306C)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '.9rem', fontWeight: 700, textAlign: 'center' },
  modalVideo: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'block', objectFit: 'contain' },
};
