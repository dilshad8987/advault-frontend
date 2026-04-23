import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AliExpressCard({ product }) {
  const [saved, setSaved] = useState(false);

  const title       = product.product_title || 'No Title';
  const image       = product.product_main_image_url || '';
  const price       = product.target_sale_price || product.original_price || '0';
  const origPrice   = product.original_price || '';
  const discount    = product.discount || '0%';
  const rating      = product.evaluate_rate || '';
  const orders      = product.lastest_volume || 0;
  const category    = product.second_level_category_name || '';
  const productId   = product.product_id || String(Math.random());
  const productUrl  = product.product_detail_url || '#';
  const images      = product.product_small_image_urls?.string || [];

  const saveProduct = async () => {
    try {
      await api.post('/ads/save', {
        adId: 'ali_' + productId,
        adData: { title, image, price, platform: 'aliexpress' }
      });
      setSaved(true);
      toast.success('Product save ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  return (
    <div style={s.card}>
      {/* Image */}
      <div style={s.media}>
        {image
          ? <img src={image} alt={title} style={s.img} />
          : <span style={{ fontSize: '2.5rem' }}>🛒</span>
        }
        {discount !== '0%' && (
          <span style={s.discountBadge}>{discount} OFF</span>
        )}
        <span style={s.platformBadge}>🛒 ALIEXPRESS</span>
      </div>

      {/* Body */}
      <div style={s.body}>
        <p style={s.title}>{title}</p>

        {category && (
          <span style={s.category}>{category}</span>
        )}

        {/* Price */}
        <div style={s.priceRow}>
          <span style={s.price}>${price}</span>
          {origPrice && origPrice !== price && (
            <span style={s.origPrice}>${origPrice}</span>
          )}
        </div>

        {/* Metrics */}
        <div style={s.metrics}>
          <div style={s.metric}>
            <div style={s.metricVal}>📦 {Number(orders).toLocaleString()}</div>
            <div style={s.metricKey}>Orders</div>
          </div>
          {rating && (
            <div style={s.metric}>
              <div style={s.metricVal}>⭐ {rating}</div>
              <div style={s.metricKey}>Rating</div>
            </div>
          )}
          {discount !== '0%' && (
            <div style={s.metric}>
              <div style={s.metricVal}>🔥 {discount}</div>
              <div style={s.metricKey}>Discount</div>
            </div>
          )}
        </div>

        {/* Extra Images */}
        {images.length > 1 && (
          <div style={s.thumbRow}>
            {images.slice(0,4).map((img, i) => (
              <img key={i} src={img} alt="" style={s.thumb} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={s.actions}>
          <button
            style={{ ...s.btn, ...(saved ? s.savedBtn : {}) }}
            onClick={saveProduct}
            disabled={saved}
          >
            {saved ? '✅ Saved' : '💾 Save'}
          </button>
          <a
            href={productUrl}
            target="_blank"
            rel="noreferrer"
            style={s.viewBtn}
          >
            🔗 View
          </a>
        </div>
      </div>
    </div>
  );
}

const s = {
  card: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', overflow: 'hidden', transition: 'transform .25s,border-color .25s' },
  media: { width: '100%', height: '200px', background: 'linear-gradient(135deg,#0f0f1a,#161625)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  discountBadge: { position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,79,135,.9)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.2rem .55rem', borderRadius: '5px' },
  platformBadge: { position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(255,102,0,.15)', border: '1px solid rgba(255,102,0,.3)', color: '#ff6600', fontSize: '.68rem', fontWeight: 700, padding: '.2rem .55rem', borderRadius: '5px' },
  body: { padding: '1rem' },
  title: { fontSize: '.85rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '.5rem', color: '#f0f0f8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  category: { display: 'inline-block', fontSize: '.68rem', color: '#8888aa', background: '#161625', padding: '.15rem .5rem', borderRadius: '4px', marginBottom: '.6rem' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' },
  price: { fontSize: '1.1rem', fontWeight: 800, color: '#ff4f87' },
  origPrice: { fontSize: '.82rem', color: '#8888aa', textDecoration: 'line-through' },
  metrics: { display: 'flex', gap: '.4rem', paddingTop: '.6rem', borderTop: '1px solid rgba(255,255,255,.06)', marginBottom: '.6rem' },
  metric: { flex: 1, textAlign: 'center', background: '#161625', borderRadius: '8px', padding: '.35rem .2rem' },
  metricVal: { fontSize: '.75rem', fontWeight: 700 },
  metricKey: { fontSize: '.6rem', color: '#8888aa', marginTop: '.1rem' },
  thumbRow: { display: 'flex', gap: '.3rem', marginBottom: '.75rem', overflowX: 'auto' },
  thumb: { width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,.08)' },
  actions: { display: 'flex', gap: '.5rem' },
  btn: { flex: 1, padding: '.4rem', borderRadius: '7px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#8888aa', fontSize: '.78rem', cursor: 'pointer', textAlign: 'center' },
  savedBtn: { background: 'rgba(108,71,255,.25)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  viewBtn: { flex: 1, padding: '.4rem', borderRadius: '7px', border: '1px solid rgba(255,102,0,.2)', background: 'rgba(255,102,0,.08)', color: '#ff6600', fontSize: '.78rem', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};
