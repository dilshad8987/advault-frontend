import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── Country Flag Helper ───────────────────────────────────────────────────────
const countryFlag = (code) => {
  if (!code) return '';
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
};

// ─── Stat Box ──────────────────────────────────────────────────────────────────
function StatBox({ icon, label, value, sub }) {
  return (
    <div style={sb.box}>
      <div style={sb.icon}>{icon}</div>
      <div style={sb.val}>{value ?? '—'}</div>
      <div style={sb.label}>{label}</div>
      {sub && <div style={sb.sub}>{sub}</div>}
    </div>
  );
}
const sb = {
  box: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '1rem', textAlign: 'center', flex: '1 1 120px' },
  icon: { fontSize: '1.4rem', marginBottom: '.35rem' },
  val: { fontSize: '1.05rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '.2rem' },
  label: { fontSize: '.7rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.05em' },
  sub: { fontSize: '.65rem', color: '#6c47ff', marginTop: '.2rem' },
};

// ─── Tab Button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '.55rem 1.3rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: '.82rem', transition: 'all .2s',
      background: active ? 'linear-gradient(135deg,#6c47ff,#8b6bff)' : 'transparent',
      color: active ? '#fff' : '#8888aa',
      boxShadow: active ? '0 0 16px rgba(108,71,255,.35)' : 'none',
    }}>
      {children}
    </button>
  );
}

// ─── Mini Ad Card (for "Ads from this brand") ──────────────────────────────────
function MiniAdCard({ ad, onClick }) {
  const cover = ad.video_info?.cover || ad.imageUrl || '';
  const title = ad.ad_title || ad.title || 'No Title';
  return (
    <div onClick={onClick} style={{
      background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)',
      borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color .2s',
    }}>
      <div style={{ height: '120px', background: '#161625', position: 'relative', overflow: 'hidden' }}>
        {cover
          ? <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem' }}>🎵</div>
        }
      </div>
      <div style={{ padding: '.6rem' }}>
        <p style={{ fontSize: '.72rem', color: '#d0d0e8', fontWeight: 600, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdDetail() {
  const { adId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [detail, setDetail]       = useState(null);
  const [brandAds, setBrandAds]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [brandLoading, setBrandLoading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Location state se instant data (card click se aaya)
  const passedAd = location.state?.ad || null;

  useEffect(() => {
    fetchDetail();
  }, [adId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ads/tiktok/${adId}`);
      const data = res.data?.data?.data || res.data?.data || res.data || {};
      setDetail(data);

      // Advertiser ID milne ke baad uske aur ads fetch karo
      const advertiserId = data.advertiser_id || data.brand_id || passedAd?.advertiser_id;
      if (advertiserId) fetchBrandAds(advertiserId);
    } catch (err) {
      console.error('Detail fetch error:', err);
      // Fallback: passed ad data use karo
      if (passedAd) setDetail(passedAd);
    }
    setLoading(false);
  };

  const fetchBrandAds = async (advertiserId) => {
    setBrandLoading(true);
    try {
      const res = await api.get(`/ads/advertiser/${advertiserId}`);
      const ads = res.data?.data || [];
      // Current ad ko filter karo
      setBrandAds(ads.filter(a => (a.id || a.ad_id) !== adId).slice(0, 8));
    } catch (err) {
      console.error('Brand ads error:', err);
    }
    setBrandLoading(false);
  };

  const saveAd = async () => {
    const ad = detail || passedAd;
    if (!ad) return;
    try {
      await api.post('/ads/save', {
        adId,
        adData: {
          title: ad.ad_title || ad.title,
          brand: ad.brand_name || 'Unknown',
          cover: ad.video_info?.cover || '',
          platform: 'tiktok'
        }
      });
      setSaved(true);
      toast.success('Ad save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save fail');
    }
  };

  // ─── Derived Data ────────────────────────────────────────────────────────────
  const ad = detail || passedAd || {};
  const title       = ad.ad_title || ad.title || 'Ad Detail';
  const brand       = ad.brand_name || ad.advertiser_name || 'Unknown Brand';
  const cover       = ad.video_info?.cover || ad.imageUrl || '';
  const videoUrl    = ad.video_info?.vid || ad.video_url || '';
  const isVideo     = !!ad.video_info || ad.isVideo;
  const likes       = ad.like || ad.metrics?.likes || 0;
  const comments    = ad.comment || ad.metrics?.comments || 0;
  const ctr         = ad.ctr ? (ad.ctr * 100).toFixed(2) + '%' : '—';
  const cost        = ad.cost || ad.spend || 0;
  const impression  = ad.impression || ad.reach || 0;
  const countries   = ad.country_code ? (Array.isArray(ad.country_code) ? ad.country_code : [ad.country_code]) : [];
  const startDate   = ad.first_shown_date || ad.start_date || null;
  const endDate     = ad.last_shown_date || ad.end_date || null;
  const isActive    = !endDate || new Date(endDate * 1000) > new Date();
  const runningDays = startDate
    ? Math.floor((Date.now() / 1000 - startDate) / 86400)
    : null;
  const transcript  = ad.ad_text || ad.description || ad.caption || '';
  const objective   = ad.objective_key?.replace('campaign_objective_', '') || ad.objective || '';
  const industry    = ad.industry_key?.replace('label_', '') || '';

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ─── Loading State ────────────────────────────────────────────────────────────
  if (loading && !passedAd) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={S.spinner}></div>
        <p style={{ color: '#8888aa' }}>Ad detail load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#f0f0f8', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-hover:hover { border-color: rgba(108,71,255,.4) !important; transform: translateY(-2px); }
        .btn-hover:hover { opacity: .85; transform: translateY(-1px); }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>← Wapas</button>
        <div style={S.topActions}>
          <button
            className="btn-hover"
            style={{ ...S.actionPill, ...(saved ? S.savedPill : {}) }}
            onClick={saveAd}
            disabled={saved}
          >
            {saved ? '✅ Saved' : '💾 Save Ad'}
          </button>
          {ad.tiktok_url || videoUrl ? (
            <a
              href={ad.tiktok_url || `https://www.tiktok.com/search?q=${encodeURIComponent(title)}`}
              target="_blank" rel="noreferrer"
              style={S.actionPillLink}
              className="btn-hover"
            >
              🔗 TikTok pe dekho
            </a>
          ) : null}
        </div>
      </div>

      <div style={S.page}>

        {/* ── HERO SECTION ── */}
        <div style={S.hero}>

          {/* Media */}
          <div style={S.mediaWrap}>
            {cover
              ? <img src={cover} alt={title} style={S.mediaImg} />
              : <div style={S.mediaPlaceholder}>🎵</div>
            }
            {isActive && <span style={S.activeBadge}>● STILL ACTIVE</span>}
            {isVideo && <span style={S.videoBadge}>▶ Video</span>}
          </div>

          {/* Info */}
          <div style={S.heroInfo}>
            {/* Brand */}
            <div style={S.brandRow}>
              <div style={S.brandAvatar}></div>
              <div>
                <div style={S.brandName}>{brand}</div>
                <div style={S.brandSub}>🎵 TikTok Advertiser</div>
              </div>
            </div>

            <h1 style={S.adTitle}>{title}</h1>

            {/* Tags */}
            <div style={S.tagRow}>
              {objective && <span style={S.tagPurple}>{objective}</span>}
              {industry  && <span style={S.tagGray}>{industry}</span>}
              {isActive  && <span style={S.tagGreen}>Active</span>}
            </div>

            {/* Running Time */}
            <div style={S.runningBox}>
              <div style={S.runRow}>
                <span style={S.runLabel}>📅 Running Time</span>
                <span style={S.runVal}>
                  {formatDate(startDate)} → {endDate ? formatDate(endDate) : 'Today'}
                </span>
              </div>
              {runningDays !== null && (
                <div style={S.runRow}>
                  <span style={S.runLabel}>⏱ Days Running</span>
                  <span style={S.runVal}>{runningDays} days</span>
                </div>
              )}
              <div style={S.runRow}>
                <span style={S.runLabel}>🌍 Countries</span>
                <span style={S.runVal}>
                  {countries.length > 0
                    ? countries.map(c => `${countryFlag(c)} ${c}`).join('  ')
                    : '—'}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={S.statsRow}>
              <StatBox icon="❤️" label="Likes"      value={likes.toLocaleString()} />
              <StatBox icon="💬" label="Comments"   value={comments.toLocaleString()} />
              <StatBox icon="📊" label="CTR"        value={ctr} />
              <StatBox icon="👁" label="Impressions" value={impression ? impression.toLocaleString() : '—'} />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={S.tabBar}>
          <TabBtn active={activeTab === 'overview'}   onClick={() => setActiveTab('overview')}>📋 Overview</TabBtn>
          <TabBtn active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')}>📝 Transcript</TabBtn>
          <TabBtn active={activeTab === 'brand'}      onClick={() => setActiveTab('brand')}>🏢 Brand Ads</TabBtn>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={S.tabContent}>
            {/* Ad Details Card */}
            <div style={S.sectionCard}>
              <h3 style={S.sectionTitle}>📋 Ad Details</h3>
              <div style={S.detailGrid}>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Status</span>
                  <span style={{ ...S.detailVal, color: isActive ? '#4ade80' : '#f87171' }}>
                    {isActive ? '● Active' : '● Ended'}
                  </span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Start Date</span>
                  <span style={S.detailVal}>{formatDate(startDate)}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>End Date</span>
                  <span style={S.detailVal}>{endDate ? formatDate(endDate) : 'Still Running'}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Days Running</span>
                  <span style={S.detailVal}>{runningDays !== null ? `${runningDays} days` : '—'}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Objective</span>
                  <span style={S.detailVal}>{objective || '—'}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Industry</span>
                  <span style={S.detailVal}>{industry || '—'}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Spend</span>
                  <span style={S.detailVal}>{cost ? `$${cost}` : '—'}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailKey}>Reach</span>
                  <span style={S.detailVal}>{impression ? impression.toLocaleString() : '—'}</span>
                </div>
              </div>

              {/* Countries */}
              {countries.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={S.detailKey}>Targeted Countries</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
                    {countries.map(c => (
                      <span key={c} style={S.countryChip}>
                        {countryFlag(c)} {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance Card */}
            <div style={S.sectionCard}>
              <h3 style={S.sectionTitle}>📈 Performance</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <StatBox icon="❤️"  label="Likes"       value={likes.toLocaleString()} />
                <StatBox icon="💬"  label="Comments"    value={comments.toLocaleString()} />
                <StatBox icon="📊"  label="CTR"         value={ctr} />
                <StatBox icon="👁"  label="Impressions" value={impression ? impression.toLocaleString() : '—'} />
                <StatBox icon="💰"  label="Spend"       value={cost ? `$${cost}` : '—'} />
                <StatBox icon="⏱"  label="Days Run"    value={runningDays !== null ? runningDays : '—'} />
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSCRIPT TAB ── */}
        {activeTab === 'transcript' && (
          <div style={S.tabContent}>
            <div style={S.sectionCard}>
              <h3 style={S.sectionTitle}>📝 Ad Transcript / Caption</h3>
              {transcript ? (
                <>
                  <div style={S.transcriptBox}>{transcript}</div>
                  <button
                    style={S.copyBtn}
                    onClick={() => { navigator.clipboard.writeText(transcript); toast.success('Copy ho gaya!'); }}
                  >
                    📋 Copy Text
                  </button>
                </>
              ) : (
                <div style={S.emptyState}>
                  <p style={{ fontSize: '2rem' }}>📭</p>
                  <p style={{ color: '#8888aa' }}>Is ad ka transcript available nahi hai</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BRAND ADS TAB ── */}
        {activeTab === 'brand' && (
          <div style={S.tabContent}>
            <div style={S.sectionCard}>
              <h3 style={S.sectionTitle}>🏢 {brand} ke aur ads</h3>
              {brandLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1.5rem 0' }}>
                  <div style={S.spinner}></div>
                  <span style={{ color: '#8888aa' }}>Brand ads load ho rahe hain...</span>
                </div>
              ) : brandAds.length > 0 ? (
                <div style={S.brandGrid}>
                  {brandAds.map((a, i) => (
                    <MiniAdCard
                      key={a.id || a.ad_id || i}
                      ad={a}
                      onClick={() => navigate(`/ad/${a.id || a.ad_id}`, { state: { ad: a } })}
                    />
                  ))}
                </div>
              ) : (
                <div style={S.emptyState}>
                  <p style={{ fontSize: '2rem' }}>🔍</p>
                  <p style={{ color: '#8888aa' }}>Is brand ke aur ads nahi mile</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(108,71,255,.2)', borderTop: '3px solid #6c47ff', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  topBar: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,15,.9)', backdropFilter: 'blur(12px)', padding: '.75rem clamp(1rem,4vw,2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.06)' },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: '#8888aa', padding: '.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 },
  topActions: { display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' },
  actionPill: { padding: '.45rem 1.1rem', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', transition: 'all .2s' },
  actionPillLink: { padding: '.45rem 1.1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: '#8888aa', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer', textDecoration: 'none', transition: 'all .2s' },
  savedPill: { background: 'rgba(108,71,255,.25)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  page: { padding: '1.5rem clamp(1rem,4vw,2rem) 3rem', maxWidth: '1100px', margin: '0 auto' },

  // Hero
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0,340px) 1fr', gap: '2rem', marginBottom: '2rem', alignItems: 'start' },
  mediaWrap: { borderRadius: '16px', overflow: 'hidden', background: '#0f0f1a', position: 'relative', aspectRatio: '9/16', maxHeight: '480px' },
  mediaImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  mediaPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#161625' },
  activeBadge: { position: 'absolute', top: '10px', left: '10px', background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', borderRadius: '20px', padding: '.25rem .75rem', fontSize: '.7rem', fontWeight: 700 },
  videoBadge: { position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,.7)', color: '#fff', borderRadius: '6px', padding: '.25rem .65rem', fontSize: '.7rem' },

  heroInfo: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '.75rem' },
  brandAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', flexShrink: 0 },
  brandName: { fontWeight: 700, fontSize: '.95rem', color: '#f0f0f8' },
  brandSub: { fontSize: '.72rem', color: '#8888aa', marginTop: '.1rem' },
  adTitle: { fontSize: 'clamp(1rem,2.5vw,1.4rem)', fontWeight: 800, lineHeight: 1.35, color: '#f0f0f8', margin: 0 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '.5rem' },
  tagPurple: { background: 'rgba(108,71,255,.2)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)', borderRadius: '20px', padding: '.2rem .75rem', fontSize: '.72rem', fontWeight: 700 },
  tagGray: { background: 'rgba(255,255,255,.06)', color: '#8888aa', borderRadius: '20px', padding: '.2rem .75rem', fontSize: '.72rem' },
  tagGreen: { background: 'rgba(74,222,128,.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,.25)', borderRadius: '20px', padding: '.2rem .75rem', fontSize: '.72rem', fontWeight: 700 },

  runningBox: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' },
  runRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.4rem' },
  runLabel: { fontSize: '.75rem', color: '#8888aa', fontWeight: 600 },
  runVal: { fontSize: '.82rem', color: '#f0f0f8', fontWeight: 600 },
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: '.75rem' },

  // Tabs
  tabBar: { display: 'flex', gap: '.5rem', marginBottom: '1.5rem', padding: '.5rem', background: '#0f0f1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,.06)', flexWrap: 'wrap' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },

  // Section Cards
  sectionCard: { background: '#0d0d1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '1.4rem' },
  sectionTitle: { fontSize: '.95rem', fontWeight: 700, marginBottom: '1rem', color: '#f0f0f8', margin: '0 0 1rem 0' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '.75rem' },
  detailItem: { background: '#161625', borderRadius: '10px', padding: '.75rem', display: 'flex', flexDirection: 'column', gap: '.3rem' },
  detailKey: { fontSize: '.68rem', color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 },
  detailVal: { fontSize: '.85rem', color: '#f0f0f8', fontWeight: 600 },
  countryChip: { background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '.25rem .6rem', fontSize: '.75rem', color: '#d0d0e8' },

  // Transcript
  transcriptBox: { background: '#161625', borderRadius: '10px', padding: '1.25rem', fontSize: '.88rem', lineHeight: 1.7, color: '#d0d0e8', whiteSpace: 'pre-wrap', marginBottom: '1rem' },
  copyBtn: { padding: '.5rem 1.2rem', background: 'rgba(108,71,255,.2)', border: '1px solid rgba(108,71,255,.3)', color: '#8b6bff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' },

  // Brand grid
  brandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '1rem' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '.5rem' },
};
