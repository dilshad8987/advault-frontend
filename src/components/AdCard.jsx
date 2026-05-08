import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdCard({ ad, platform }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // ─── Detect whether this is a Meta ad or TikTok ad ───────────────────────
  const isMeta = !!(
    ad._raw?.library_id || ad.library_id ||
    ad.page_name || ad.snapshot_url ||
    ad._source === 'mongodb_scraped' ||
    platform === 'meta'
  );

  const raw = isMeta ? (ad._raw || ad) : ad;

  const title = isMeta
    ? (raw.page_name || raw.brand || raw.ad_creative_bodies?.[0]?.slice(0, 60) || raw.body?.slice(0, 60) || 'Meta Ad')
    : (raw.ad_title || raw.title || 'TikTok Ad');

  const body = isMeta
    ? (raw.body || raw.ad_creative_bodies?.[0] || '')
    : (raw.ad_text || raw.description || raw.caption || '');

  const coverImg = isMeta
    ? (raw.r2_image_url || raw.image || raw.ad_snapshot_url || '')
    : (raw.video_info?.cover || raw.imageUrl || raw.cover || '');

  const isVideo = isMeta
    ? !!(raw.r2_video_url || raw.video || raw.ad_type === 'video')
    : !!(raw.video_info || raw.isVideo);

  const likes    = Number(raw.like || raw.metrics?.likes || 0);
  const comments = Number(raw.comment || raw.metrics?.comments || 0);
  const ctr      = raw.ctr ? (Number(raw.ctr) * 100).toFixed(1) + '%' : null;
  const spend    = Number(raw.cost || raw.spend || 0);
  const isActive = isMeta
    ? (raw.status === 'Active' || raw.active === true)
    : (!raw.last_shown_date || new Date(raw.last_shown_date * 1000) > new Date());

  const adId = isMeta
    ? (raw.library_id || raw._id || null)
    : (raw.id || raw.ad_id || null);

  const trendingScore = raw.trending_score || null;

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saved || saving) return;
    setSaving(true);
    try {
      await api.post('/ads/save', {
        adId: String(adId || Math.random()),
        adData: {
          title,
          brand: raw.brand || raw.page_name || raw.brand_name || 'Unknown',
          cover: coverImg,
          platform: isMeta ? 'meta' : 'tiktok',
        },
      });
      setSaved(true);
      toast.success('Ad save ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail hua');
    }
    setSaving(false);
  };

  const handleClick = () => {
    if (!adId) return;
    navigate('/ad/' + adId, { state: { ad: isMeta ? raw : ad } });
  };

  const fmt = (n) => {
    n = Number(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div style={s.card} onClick={handleClick}>
      <div style={s.media}>
        {coverImg
          ? <img src={coverImg} alt={title} style={s.img} loading="lazy" />
          : <div style={s.noImg}>{isVideo ? '🎬' : '🖼️'}</div>
        }
        <span style={{ ...s.badge, ...(isMeta ? s.metaBadge : s.ttBadge) }}>
          {isMeta ? '📘 META' : '🎵 TIKTOK'}
        </span>
        {isVideo  && <span style={s.videoBadge}>▶ Video</span>}
        {isActive && <span style={s.activeBadge}>🟢 Active</span>}
        {trendingScore && <span style={s.scoreBadge}>🔥 {trendingScore}</span>}
      </div>

      <div style={s.body}>
        <p style={s.title}>{title}</p>
        {body ? <p style={s.bodyText}>{body}</p> : null}

        {(likes > 0 || comments > 0 || ctr || spend > 0) && (
          <div style={s.metrics}>
            {likes > 0 && (
              <div style={s.metric}>
                <div style={s.metricVal}>❤️ {fmt(likes)}</div>
                <div style={s.metricKey}>Likes</div>
              </div>
            )}
            {comments > 0 && (
              <div style={s.metric}>
                <div style={s.metricVal}>💬 {fmt(comments)}</div>
                <div style={s.metricKey}>Comments</div>
              </div>
            )}
            {ctr && (
              <div style={s.metric}>
                <div style={s.metricVal}>📊 {ctr}</div>
                <div style={s.metricKey}>CTR</div>
              </div>
            )}
            {spend > 0 && (
              <div style={s.metric}>
                <div style={s.metricVal}>💸 ${fmt(spend)}</div>
                <div style={s.metricKey}>Spend</div>
              </div>
            )}
          </div>
        )}

        <div style={s.actions} onClick={e => e.stopPropagation()}>
          <button
            style={{ ...s.btn, ...(saved ? s.savedBtn : {}) }}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? '⏳' : saved ? '✅ Saved' : '💾 Save'}
          </button>
          {adId && (
            <button style={s.viewBtn} onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              🔍 Detail
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s,border-color .2s', display: 'flex', flexDirection: 'column' },
  media: { width: '100%', height: '200px', background: 'linear-gradient(135deg,#0f0f1a,#161625)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { fontSize: '3rem', opacity: 0.3 },
  badge: { position: 'absolute', bottom: '8px', right: '8px', fontSize: '.65rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: '5px' },
  metaBadge: { background: 'rgba(24,119,242,.18)', border: '1px solid rgba(24,119,242,.35)', color: '#5aabff' },
  ttBadge: { background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#ccc' },
  videoBadge: { position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: '5px' },
  activeBadge: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,200,100,.12)', border: '1px solid rgba(0,200,100,.3)', color: '#4ade80', fontSize: '.63rem', fontWeight: 700, padding: '.18rem .5rem', borderRadius: '5px' },
  scoreBadge: { position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255,80,40,.15)', border: '1px solid rgba(255,80,40,.3)', color: '#ff7a5a', fontSize: '.65rem', fontWeight: 700, padding: '.18rem .5rem', borderRadius: '5px' },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 },
  title: { fontSize: '.87rem', fontWeight: 700, color: '#f0f0f8', lineHeight: 1.4, marginBottom: '.35rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  bodyText: { fontSize: '.77rem', color: '#8888aa', lineHeight: 1.5, marginBottom: '.65rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  metrics: { display: 'flex', gap: '.35rem', paddingTop: '.6rem', borderTop: '1px solid rgba(255,255,255,.06)', marginBottom: '.75rem', flexWrap: 'wrap' },
  metric: { flex: '1 1 auto', textAlign: 'center', background: '#161625', borderRadius: '8px', padding: '.3rem .25rem', minWidth: '52px' },
  metricVal: { fontSize: '.73rem', fontWeight: 700, color: '#f0f0f8' },
  metricKey: { fontSize: '.6rem', color: '#8888aa', marginTop: '.1rem' },
  actions: { display: 'flex', gap: '.5rem', marginTop: 'auto' },
  btn: { flex: 1, padding: '.42rem .5rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 },
  savedBtn: { background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  viewBtn: { flex: 1, padding: '.42rem .5rem', borderRadius: '7px', border: '1px solid rgba(108,71,255,.25)', background: 'rgba(108,71,255,.1)', color: '#8b6bff', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 },
};
