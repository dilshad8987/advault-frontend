import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 24) return Math.round(diffH) + 'H';
  const diffD = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffD < 7) return diffD + 'D';
  const diffW = Math.round(diffD / 7);
  if (diffW < 4) return diffW + 'W';
  const diffM = Math.round(diffD / 30);
  if (diffM < 12) return diffM + 'M';
  return Math.round(diffM / 12) + 'Y';
}

function CollectionCard({ item, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();
  const isMeta = item.platform === 'meta';

  const remove = async (e) => {
    e.stopPropagation();
    setRemoving(true);
    try {
      await api.delete('/ads/save/' + item.id);
      onRemove(item.id);
    } catch (err) {
      setRemoving(false);
      toast.error(err.response?.data?.message || 'Remove fail');
    }
  };

  return (
    <div style={s.card} onClick={() => navigate('/ad/' + item.id, { state: { ad: item } })}>
      <div style={s.thumbWrap}>
        {item.cover ? (
          <img src={item.cover} alt={item.title || 'ad'} style={s.thumb} loading="lazy" />
        ) : (
          <div style={s.thumbPlaceholder}>🎬</div>
        )}
        <span style={{ ...s.platformBadge, ...(isMeta ? { background: 'rgba(255,255,255,.06)', color: '#8888aa' } : {}) }}>
          {isMeta ? 'META' : 'TIKTOK'}
        </span>
      </div>

      <div style={s.body}>
        <p style={s.title}>{item.title || 'Untitled ad'}</p>
        <div style={s.metaRow}>
          <span style={s.brand}>{item.brand || 'Unknown'}</span>
          <span style={s.dot}>•</span>
          <span style={s.savedAt}>{timeAgo(item.savedAt)}</span>
        </div>
      </div>

      <button
        style={s.unsaveBtn}
        onClick={remove}
        disabled={removing}
        aria-label="Remove from collection"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
          <path d="M6 2a2 2 0 0 0-2 2v17a1 1 0 0 0 1.6.8L12 17l6.4 4.8A1 1 0 0 0 20 21V4a2 2 0 0 0-2-2H6Z" />
        </svg>
      </button>
    </div>
  );
}

export default function Collection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ads/saved')
      .then(res => setAds(res.data?.data || []))
      .catch(() => toast.error('Collection load nahi ho payi'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id) => {
    setAds(prev => prev.filter(a => a.id !== id));
    toast.success('Collection se hata diya');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={s.page}>
        <h1 style={s.h1}>🔖 Ad Collection</h1>
        <p style={s.sub}>Aapke saved ads ek jagah</p>

        {loading && (
          <div style={s.center}>
            <div style={s.spinner}></div>
          </div>
        )}

        {!loading && ads.length === 0 && (
          <div style={s.center}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p style={{ color: '#8888aa', marginTop: '.5rem' }}>Abhi tak koi ad save nahi ki</p>
          </div>
        )}

        {!loading && ads.length > 0 && (
          <>
            <p style={s.count}>{ads.length} saved ad{ads.length !== 1 ? 's' : ''}</p>
            <div style={s.grid}>
              {ads.map(item => (
                <CollectionCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: { padding: '80px clamp(1rem,4vw,2rem) 3rem' },
  h1: { fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, color: '#f0f0f8' },
  sub: { color: '#8888aa', marginBottom: '1.5rem', marginTop: '.4rem' },
  count: { color: '#8888aa', fontSize: '.85rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,100%),1fr))', gap: '1.1rem' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform .15s, border-color .15s' },
  thumbWrap: { position: 'relative', aspectRatio: '4/5', background: '#161625' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: .3 },
  platformBadge: { position: 'absolute', top: '.6rem', left: '.6rem', display: 'inline-flex', alignItems: 'center', background: 'rgba(108,71,255,.18)', color: '#a08bff', borderRadius: '4px', padding: '.18rem .5rem', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.02em' },

  body: { padding: '.7rem .8rem .55rem' },
  title: { fontSize: '.82rem', fontWeight: 700, color: '#f0f0f8', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 },
  metaRow: { display: 'flex', alignItems: 'center', gap: '.35rem', marginTop: '.4rem' },
  brand: { fontSize: '.72rem', color: '#8888aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' },
  dot: { color: '#444460', fontSize: '.7rem' },
  savedAt: { fontSize: '.72rem', color: '#666688' },

  unsaveBtn: { position: 'absolute', top: '.6rem', right: '.6rem', width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(108,71,255,.3)', background: 'rgba(13,13,22,.75)', color: '#8b6bff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' },
};
