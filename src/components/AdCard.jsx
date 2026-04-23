import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdCard({ ad }) {
  const [saved, setSaved] = useState(false);

  const title    = ad.ad_title || ad.title || 'No Title';
  const brand    = ad.brand_name || ad.brand?.name || 'Unknown Brand';
  const likes    = ad.like || ad.metrics?.likes || 0;
  const comments = ad.comment || ad.metrics?.comments || 0;
  const shares   = ad.share || ad.metrics?.shares || 0;
  const ctr      = ad.ctr ? (ad.ctr * 100).toFixed(2) + '%' : '0%';
  const cover    = ad.video_info?.cover || ad.imageUrl || '';
  const isVideo  = !!ad.video_info || ad.isVideo;
  const adId     = ad.id || ad.ad_id || String(Math.random());
  const industry = ad.industry_key || '';
  const objective = ad.objective_key?.replace('campaign_objective_', '') || '';

  const saveAd = async () => {
    try {
      await api.post('/ads/save', {
        adId,
        adData: { title, brand, cover, platform: 'tiktok' }
      });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.media}>
        {cover
          ? <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '2.8rem' }}>🎵</span>
        }
        {isVideo && <span style={styles.videoBadge}>▶ Video</span>}
        {objective && <span style={styles.objectiveBadge}>{objective}</span>}
      </div>

      <div style={styles.body}>
        <div style={styles.topRow}>
          <span style={styles.platform}>🎵 TIKTOK</span>
          {industry && <span style={styles.industry}>{industry.replace('label_', '')}</span>}
        </div>

        <p style={styles.title}>{title}</p>

        <div style={styles.brand}>
          <div style={styles.avatar}></div>
          <span style={styles.brandName}>{brand}</span>
        </div>

        <div style={styles.metrics}>
          <div style={styles.metric}>
            <div style={styles.metricVal}>❤️ {likes.toLocaleString()}</div>
            <div style={styles.metricKey}>Likes</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricVal}>💬 {comments.toLocaleString()}</div>
            <div style={styles.metricKey}>Comments</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricVal}>📊 {ctr}</div>
            <div style={styles.metricKey}>CTR</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricVal}>💰 {ad.cost || 0}</div>
            <div style={styles.metricKey}>Cost</div>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.actionBtn, ...(saved ? styles.savedBtn : {}) }}
            onClick={saveAd}
            disabled={saved}
          >
            {saved ? '✅ Saved' : '💾 Save Ad'}
          </button>
          {ad.video_info?.vid && (
            <a
              href={'https://www.tiktok.com/search?q=' + encodeURIComponent(title)}
              target="_blank"
              rel="noreferrer"
              style={styles.actionBtn}
            >
              🔗 View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', transition: 'transform .25s,border-color .25s', cursor: 'pointer' },
  media: { width: '100%', height: '200px', background: 'linear-gradient(135deg,#0f0f1a,#161625)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  videoBadge: { position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,.7)', borderRadius: '5px', padding: '.25rem .6rem', fontSize: '.7rem', color: '#fff' },
  objectiveBadge: { position: 'absolute', top: '8px', left: '8px', background: 'rgba(108,71,255,.8)', borderRadius: '5px', padding: '.2rem .55rem', fontSize: '.65rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' },
  body: { padding: '1rem' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' },
  platform: { display: 'inline-block', padding: '.2rem .55rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, background: 'rgba(255,255,255,.06)', color: '#fff' },
  industry: { fontSize: '.65rem', color: '#8888aa', background: '#161625', padding: '.2rem .5rem', borderRadius: '4px' },
  title: { fontSize: '.88rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '.5rem', color: '#f0f0f8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  brand: { display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.75rem' },
  avatar: { width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0 },
  brandName: { fontSize: '.78rem', color: '#8888aa' },
  metrics: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '.4rem', paddingTop: '.75rem', borderTop: '1px solid rgba(255,255,255,.08)', marginBottom: '.75rem' },
  metric: { textAlign: 'center', background: '#161625', borderRadius: '8px', padding: '.4rem .2rem' },
  metricVal: { fontSize: '.75rem', fontWeight: 700 },
  metricKey: { fontSize: '.6rem', color: '#8888aa', marginTop: '.1rem' },
  actions: { display: 'flex', gap: '.5rem' },
  actionBtn: { flex: 1, padding: '.45rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.78rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem', textDecoration: 'none' },
  savedBtn: { background: 'rgba(108,71,255,.25)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' }
};
