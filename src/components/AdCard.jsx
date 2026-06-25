import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'https://advault-backend-production-c824.up.railway.app/api';

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
    .replace(/stp=dst-jpg_s\d+x\d+/g,  'stp=dst-jpg_s1080x1080')
    .replace(/_s60x60/g,  '_s1080x1080')
    .replace(/_s160x160/g,'_s1080x1080')
    .replace(/_s320x320/g,'_s1080x1080')
    .replace(/_s600x600/g,'_s1080x1080')
    .replace(/s60x60/g,   's1080x1080')
    .replace(/p60x60/g,   'p1080x1080');
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
    <span style={s.platformBadge}>
      <svg width="16" height="9" viewBox="0 0 16 16" fill="#ccc" style={{ flexShrink: 0 }}>
        <path fillRule="evenodd" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3C13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973C0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407c.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954c1.723 0 3.102 2.537 3.102 5.653c0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9c0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018"/>
      </svg>
      META
    </span>
  );
}

function getVideoStreamUrl(videoUrl, authToken) {
  if (!videoUrl) return null;
  if (videoUrl.includes('r2.dev') || videoUrl.includes('pub-') || videoUrl.includes('cloudflare')) {
    return videoUrl; // R2 — seedha play karo
  }
  return API_BASE.replace('/api', '') + '/api/ads/video/stream?token=' + encodeURIComponent(authToken) + '&url=' + encodeURIComponent(videoUrl);
}

export default function AdCard({ ad, platform = 'tiktok', initialSaved = false }) {
  const [saved, setSaved]           = useState(initialSaved);
  const [thumbError, setThumbError] = useState(false);
  const navigate = useNavigate();
  const isMeta   = platform === 'meta';

  // Inject burst-particle keyframes once globally (shared across all AdCard instances)
  useEffect(() => {
    if (document.getElementById('advault-save-burst-style')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'advault-save-burst-style';
    styleEl.textContent = `
      @keyframes advaultSaveBurst {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))) scale(0); }
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  const [userCredits, setUserCredits] = useState(null);
  useEffect(() => {
    api.get('/user/profile').then(res => {
      const u = res.data?.usage;
      if (u) setUserCredits({ remaining: u.creditsRemaining, costs: u.creditCosts || {} });
    }).catch(() => {});
  }, []);

  const noCredits = userCredits !== null && userCredits.remaining <= 0;
  const saveCost  = userCredits?.costs?.save_ad ?? 10;
  const canSave   = !noCredits && (userCredits === null || userCredits.remaining >= saveCost);

  function fmtNum(n) {
    n = Number(n);
    return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();
  }

  // ── TikTok fields ──────────────────────────────────────────────────────────
  const ttTitle    = ad.ad_title || ad.title || 'No Title';
  const ttBrand    = ad.brand_name || 'Unknown Brand';
  const ttLikes    = Number(ad.like || ad.likes || ad.like_count || 0);
  const ttComments = Number(ad.comment || ad.comment_count || 0);
  const ttShares   = Number(ad.share || ad.share_count || 0);
  const ttPlays    = Number(ad.play_count || ad.view_count || 0);
  const ttCtr      = Number(ad.ctr || 0);
  const ttCover    = ad.video_info?.cover || '';
  const ttObjective = ad.objective_key?.replace('campaign_objective_', '') || '';
  const ttAdId     = ad.id || ad.material_id || String(Math.random());
  const ttIndustry = ad.industry_key || ad.industry || '';
  const ttTrending = Number(ad.trending_score || 0);
  const ttIsActive = ad.is_active !== false;
  const ttPeriodDays = Number(ad.period_days || 7);
  const ttCountryCode = (ad.country || 'US').toUpperCase();

  // ── TikTok: Days Running ───────────────────────────────────────────────────
  // first_seen → scraped_at = actual days the ad has been tracked
  const ttDaysRunning = (() => {
    const firstSeen = ad.first_seen || ad._raw?.first_seen;
    const scrapedAt = ad.scraped_at || ad._raw?.scraped_at;
    if (firstSeen) {
      const diffMs = Date.now() - new Date(firstSeen).getTime();
      const d = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (d > 0 && d < 3650) return d;
    }
    // fallback: period_days field
    return ttPeriodDays || 7;
  })();

  // ── TikTok: Smart Estimated Spend ─────────────────────────────────────────
  // Method: Impressions (play_count) × Country CPM × Industry adj × Engagement adj
  // Same core logic as Minea/PipiAds — CPMs based on 2026 real market data
  const ttEstSpend = (() => {
    const rawCost = Number(ad.cost || 0);

    // ── 2026 Country CPM (USD per 1000 impressions) — Tier-based ─────────
    // Source: TikAdSuite, MegaDigital, insense.pro Q1 2026 benchmarks
    const COUNTRY_CPM = {
      // Tier 1 — highest purchasing power
      'US': 12.0, 'GB': 7.5,  'AU': 8.0,  'CA': 7.0,  'NZ': 6.5,
      // Tier 2 — mid markets
      'DE': 7.0,  'FR': 6.0,  'NL': 6.5,  'SE': 6.0,  'NO': 6.5,
      'DK': 6.0,  'FI': 5.5,  'CH': 7.5,  'AT': 6.0,  'BE': 5.5,
      'IE': 6.5,  'JP': 6.0,  'KR': 5.0,  'SG': 5.5,  'AE': 5.5,
      'SA': 4.5,  'QA': 5.0,  'KW': 4.5,  'IL': 5.0,
      // Tier 3 — emerging/volume markets
      'BR': 2.5,  'MX': 3.0,  'AR': 2.0,  'CL': 2.5,  'CO': 2.0,
      'ZA': 2.0,  'EG': 1.5,  'NG': 1.0,  'KE': 1.2,
      'TH': 2.0,  'MY': 2.5,  'PH': 1.2,  'VN': 1.5,  'ID': 1.5,
      'TR': 2.0,  'PL': 3.0,  'RO': 2.5,  'HU': 2.5,  'CZ': 3.0,
      // Tier 4 — lowest CPM
      'IN': 0.8,  'PK': 0.5,  'BD': 0.6,  'LK': 0.7,  'NP': 0.5,
    };
    const baseCpm = COUNTRY_CPM[ttCountryCode] || 4.5; // global avg fallback

    // ── Industry CPM adjustment factor (relative to base) ─────────────────
    // Finance/Legal highest, Entertainment/Music lowest
    const INDUSTRY_ADJ = {
      'finance':       1.8,  'insurance':     1.9,  'legal':         2.0,
      'real_estate':   1.7,  'software':      1.6,  'saas':          1.6,
      'tech':          1.5,  'auto':          1.5,  'automotive':    1.5,
      'health':        1.3,  'pharma':        1.4,  'medical':       1.4,
      'travel':        1.3,  'luxury':        1.4,  'b2b':           1.5,
      'education':     1.1,  'fitness':       1.1,  'beauty':        1.0,
      'fashion':       1.0,  'ecommerce':     1.0,  'retail':        0.95,
      'food':          0.9,  'beverage':      0.9,  'lifestyle':     0.9,
      'sports':        1.0,  'gaming':        0.85, 'app':           0.9,
      'entertainment': 0.75, 'music':         0.75,
    };
    const industryLower = ttIndustry.toLowerCase();
    let industryAdj = 1.0;
    for (const [key, val] of Object.entries(INDUSTRY_ADJ)) {
      if (industryLower.includes(key)) { industryAdj = val; break; }
    }

    // ── Effective CPM after industry adjustment ───────────────────────────
    const effectiveCpm = baseCpm * industryAdj;

    // ── Engagement quality multiplier ─────────────────────────────────────
    // High engagement = TikTok charges more (better delivery = higher auction price)
    // play_count is our impressions proxy on TikTok
    const engRate = ttPlays > 0
      ? (ttLikes + ttComments * 2 + ttShares * 3) / ttPlays  // weighted — shares/comments worth more
      : (ttLikes > 0 ? 0.04 : 0);
    const engMult = engRate > 0.15 ? 1.5
                  : engRate > 0.08 ? 1.3
                  : engRate > 0.04 ? 1.1
                  : 1.0;

    // ── Longevity multiplier — longer running = passed TikTok's kill switch ─
    // TikTok auto-kills bad ads in 3-5 days; surviving ads get more budget
    const longevityMult = ttDaysRunning > 60 ? 1.8
                        : ttDaysRunning > 30 ? 1.5
                        : ttDaysRunning > 14 ? 1.2
                        : ttDaysRunning > 7  ? 1.05
                        : 1.0;

    // ── Trending score multiplier — viral = more impressions per $ ─────────
    // Counter-intuitively viral ads have LOWER effective CPM (algo rewards them)
    const trendCpmDiscount = ttTrending > 80 ? 0.75
                           : ttTrending > 50 ? 0.85
                           : 1.0;
    const finalCpm = effectiveCpm * trendCpmDiscount;

    // ── Core calculation ──────────────────────────────────────────────────
    let estimated;

    if (rawCost > 0) {
      // Best signal: cost field directly from TikTok Creative Center
      // cost = spend in the tracked period; scale by actual days
      const scaleFactor = ttDaysRunning / Math.max(ttPeriodDays, 1);
      estimated = rawCost * scaleFactor * longevityMult;

    } else if (ttPlays > 0) {
      // Primary method (same as Minea/PipiAds):
      // Est Spend = (Impressions / 1000) × CPM × engagement_adj × longevity_adj
      estimated = (ttPlays / 1000) * finalCpm * engMult * longevityMult;

    } else if (ttLikes > 0) {
      // Fallback: likes → estimate impressions (avg TikTok like rate ~4%)
      const estimatedImpressions = ttLikes / 0.04;
      estimated = (estimatedImpressions / 1000) * finalCpm * longevityMult;

    } else {
      return '—';
    }

    // ── Format output ─────────────────────────────────────────────────────
    if (estimated < 50)    return '~$' + Math.round(estimated);
    if (estimated < 500)   return '~$' + (Math.round(estimated / 5) * 5).toLocaleString();
    if (estimated < 5000)  return '~$' + (Math.round(estimated / 50) * 50).toLocaleString();
    if (estimated < 50000) return '~$' + (Math.round(estimated / 500) * 500).toLocaleString();
    return '~$' + (Math.round(estimated / 1000) * 1000).toLocaleString();
  })();

  // ── TikTok: Days Running display ──────────────────────────────────────────
  const ttDaysDisplay = ttDaysRunning + 'd';

  // ── TikTok: Reach estimate (plays + likes multiplier) ─────────────────────
  const ttReach = (() => {
    if (ttPlays > 0) return fmtNum(ttPlays);
    if (ttLikes > 0) return '~' + fmtNum(ttLikes * 20); // avg 5% like rate
    return '—';
  })();

  // ── Meta fields ────────────────────────────────────────────────────────────
  const mtBody     = ad.ad_body || ad._raw?.body || ad.ad_creative_bodies?.[0] || '';
  const mtHeadline = ad.ad_title || ad._raw?.title || ad.ad_creative_link_titles?.[0] || '';
  const mtPageName = ad.page_name || ad._raw?.page_name || ad._raw?.brand || ad.bylines || '';

  // Title priority: headline > page name + body snippet > body alone
  const mtTitle = (() => {
    if (mtHeadline && mtHeadline.trim()) return mtHeadline.slice(0, 120);
    if (mtBody && mtBody.trim()) return mtBody.slice(0, 120);
    if (mtPageName) return mtPageName;
    return 'No Title';
  })();

  const mtBrand  = mtPageName || 'Unknown Page';
  const mtStatus = ad.active === false ? 'Inactive' : 'Active';

  // ── Estimated Spend ────────────────────────────────────────────────────────
  const mtSpend = (() => {
    const sp = ad.spend;
    if (sp && typeof sp === 'object') {
      const lo = sp.lower_bound, hi = sp.upper_bound;
      if (lo && hi) return '~$' + Math.round((Number(lo)+Number(hi))/2).toLocaleString();
      if (lo) return '$' + Number(lo).toLocaleString() + '+';
    }
    if (sp && Number(sp) > 0) return '$' + Number(sp).toLocaleString();
    const est = ad.estimated_spend || ad._raw?.estimated_spend;
    if (est && Number(est) > 0) return '~$' + Number(est).toLocaleString();
    return '—';
  })();

  // ── Impressions ────────────────────────────────────────────────────────────
  const mtImpressions = (() => {
    const imp = ad.impressions || ad.impression || ad.impression_count || ad._raw?.impression_count;
    const estImp = ad.estimated_impressions || ad._raw?.estimated_impressions;
    if (imp && Number(imp) > 0) return fmtNum(Number(imp));
    if (estImp && Number(estImp) > 0) return '~' + fmtNum(Number(estImp));
    return '—';
  })();

  // ── Relative Time (16H / 6D / 3W / 9M / 1Y) ────────────────────────────────
  function getRelativeTime(dateStr) {
    if (!dateStr) return '—';
    let date;
    // "Feb 14 2025" ya ISO ya timestamp format handle karo
    try { date = new Date(dateStr); } catch(e) { return '—'; }
    if (isNaN(date.getTime())) return '—';
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return '—';

    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < 24) return Math.round(diffH) + 'H';

    let diffD = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffD < 7) return diffD + 'D';

    let diffW = Math.round(diffD / 7);
    if (diffW < 4) return diffW + 'W';

    let diffM = Math.round(diffD / 30);
    if (diffM < 12) return diffM + 'M';

    let diffY = Math.round(diffM / 12);
    return diffY + 'Y';
  }

  const mtStartDate = getRelativeTime(
    ad.ad_delivery_start_time || ad._raw?.start_date || ad.start_date
  );

  // ── Country Flag ──────────────────────────────────────────────────────────
  const COUNTRY_FLAGS = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'AU': '🇦🇺', 'CA': '🇨🇦', 'IN': '🇮🇳',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'NL': '🇳🇱', 'AE': '🇦🇪', 'SA': '🇸🇦',
    'PK': '🇵🇰', 'BR': '🇧🇷', 'MX': '🇲🇽', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'SG': '🇸🇬', 'ZA': '🇿🇦', 'NG': '🇳🇬',
    'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Australia': '🇦🇺',
    'Canada': '🇨🇦', 'India': '🇮🇳', 'Germany': '🇩🇪', 'France': '🇫🇷',
  };
  const countryCode = ad.country || ad._raw?.country || 'US';
  const countryFlag = COUNTRY_FLAGS[countryCode] || '🌐';
  const rawCountryLabel = countryCode.length === 2 ? countryCode : countryCode.slice(0, 2).toUpperCase();
  const SHOWN_COUNTRIES = ['US', 'GB', 'UK', 'CA'];
  const countryLabel = SHOWN_COUNTRIES.includes(rawCountryLabel) ? (rawCountryLabel === 'GB' ? 'UK' : rawCountryLabel) : '';
  const mtAdId = ad.id || ad.ad_archive_id || ad._raw?.library_id || String(Math.random());

  const title     = isMeta ? mtTitle  : ttTitle;
  const brand     = isMeta ? mtBrand  : ttBrand;
  const adId      = isMeta ? mtAdId   : ttAdId;
  const objective = isMeta ? mtStatus : ttObjective;
  const libraryId = isMeta ? (ad._raw?.library_id || mtAdId) : null;

  // ── Media URLs ─────────────────────────────────────────────────────────────
  // Image: R2 seedha use karo, warna proxy
  const r2ImageUrl  = isMeta ? (ad.r2_image_url || ad._raw?.r2_image_url || '') : '';
  const rawImageUrl = isMeta
    ? (r2ImageUrl || ad.image || ad._raw?.image || ad.ad_snapshot_url || ad.snapshot_url || '')
    : ttCover;

  // Video: R2 URL sirf tab use karo jab actual R2 URL ho (r2.dev ya pub-)
  const r2VideoUrl   = isMeta
    ? (ad.r2_video_url || ad._raw?.r2_video_url || '')
    : (ad.r2_video_url || '');  // ✅ TikTok R2 URL bhi lo
  const origVideoUrl = isMeta
    ? (ad.video_url || ad._raw?.video || ad.video || '')
    : (ad.video_info?.play_url || ad.video_info?.video_url || ad.video_url || '');  // ✅ all TikTok fallbacks
  const rawVideoUrl  = r2VideoUrl || origVideoUrl;

  // ── is_video: backend se aaye to use karo, warna detect karo ──────────────
  // IMPORTANT: sirf tab video manno jab actual video URL ho
  const hasVideo = isMeta
    ? !!(ad.is_video || ad.format === 'video' || (rawVideoUrl && rawVideoUrl.trim() !== ''))
    : !!(rawVideoUrl && rawVideoUrl.trim() !== '') || !!(ad.video_info?.play_url || ad.isVideo);  // ✅ r2_video_url bhi check

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  const thumbUrl = isMeta
    ? (r2ImageUrl || proxyImageUrl(rawImageUrl, libraryId))
    : fixImageUrl(rawImageUrl);

  // Video ke liye: agar thumb nahi to video ka poster dynamically generate karo
  const [videoPoster, setVideoPoster] = React.useState(null);

  React.useEffect(() => {
    // Sirf tab run karo jab hasVideo ho aur thumbUrl nahi ho ya fail ho
    if (!hasVideo || !rawVideoUrl || thumbUrl) return;
    // Canvas se video first frame capture karo
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.muted = true;
    vid.preload = 'metadata';
    vid.src = rawVideoUrl;
    vid.addEventListener('loadeddata', () => {
      vid.currentTime = 0.5;
    });
    vid.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = vid.videoWidth  || 720;
        canvas.height = vid.videoHeight || 405;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        setVideoPoster(canvas.toDataURL('image/jpeg', 0.85));
      } catch(e) {}
    });
    vid.addEventListener('error', () => {});
  }, [hasVideo, rawVideoUrl, thumbUrl]);

  const refreshCredits = () => {
    api.get('/user/profile').then(res => {
      const u = res.data?.usage;
      if (u) {
        setUserCredits({ remaining: u.creditsRemaining, costs: u.creditCosts || {} });
        window.dispatchEvent(new Event('credits-updated')); // Navbar update karo
      }
    }).catch(() => {});
  };

  const isLocked = ad.isLocked === true;

  const saveAd = async (e) => {
    e.stopPropagation();
    if (isLocked) return;

    // Already saved — unsave karo
    if (saved) {
      setSaved(false);
      try {
        await api.delete('/ads/save/' + adId);
        toast.success('Removed');
      } catch (err) {
        setSaved(true); // rollback
        toast.error('Unsave fail');
      }
      return;
    }

    if (!canSave) return; // Credits khatam — silent, no toast, no navigation
    setSaved(true); // optimistic — turant UI update, network ka wait nahi
    try {
      await api.post('/ads/save', { adId, adData: { title, brand, cover: thumbUrl, platform } });
      toast.success('Saved!');
      refreshCredits(); // credits update karo after save
    } catch (err) {
      setSaved(false); // fail hua to wapas rollback karo
      if (err.response?.data?.upgrade) {
        toast.error('Credits khatam! Upgrade karo.');
      } else {
        toast.error(err.response?.data?.message || 'Save fail');
      }
    }
  };


  const openDetail = (e) => {
    e.stopPropagation();
    if (isLocked || !canSave) return; // Credits khatam — silent, page open nahi hoga
    navigate('/ad/' + adId, { state: { ad } });
  };

  return (
    <div
      style={s.card}
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
        {(thumbUrl && !thumbError) || videoPoster ? (
          <>
            <div style={{ ...s.blurBg, backgroundImage: 'url(' + (thumbUrl && !thumbError ? thumbUrl : videoPoster) + ')' }} />
            <img
              src={thumbUrl && !thumbError ? thumbUrl : videoPoster}
              alt={title}
              style={s.img}
              loading="lazy"
              onError={() => {
                setThumbError(true);
              }}
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

        {/* Video badge — sirf video ads pe */}
        {hasVideo && <span style={s.vidBadge}>▶ Video</span>}

        {/* Play button — SIRF video ads pe, image pe NAHI */}
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
              <div style={s.stat}>
                <span style={s.statIcon}>🕐</span>
                <span style={s.statVal}>{mtStartDate}</span>
                <span style={s.statKey}>Started</span>
              </div>
              <div style={s.stat}><span style={s.statIcon}>{countryFlag}</span><span style={s.statVal}>{countryLabel}</span></div>
            </>
          ) : (
            <>
              <div style={s.stat}><span style={s.statIcon}>💰</span><span style={s.statVal}>{ttEstSpend}</span><span style={s.statKey}>Spend</span></div>
              <div style={s.stat}><span style={s.statIcon}>👁</span><span style={s.statVal}>{ttReach}</span><span style={s.statKey}>Reach</span></div>
              <div style={s.stat}>
                <span style={s.statIcon}>🕐</span>
                <span style={s.statVal}>{ttDaysDisplay}</span>
                <span style={s.statKey}>Duration</span>
              </div>
              <div style={s.stat}><span style={s.statIcon}>{COUNTRY_FLAGS[ttCountryCode] || '🌐'}</span><span style={s.statVal}>{SHOWN_COUNTRIES.includes(ttCountryCode) ? (ttCountryCode === 'GB' ? 'UK' : ttCountryCode) : ''}</span></div>
            </>
          )}
        </div>

        <div style={s.actions}>
          <button
            style={{
              ...s.saveBtn,
              ...(saved ? s.savedBtn : {}),
            }}
            onClick={saveAd}
            aria-label={saved ? 'Saved' : 'Save'}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              style={{ transition: 'fill .3s ease', display: 'block' }}
            >
              <path d="M6 2a2 2 0 0 0-2 2v17a1 1 0 0 0 1.6.8L12 17l6.4 4.8A1 1 0 0 0 20 21V4a2 2 0 0 0-2-2H6Z" />
            </svg>
            {saved && (
              <span style={s.saveBurst}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * 2 * Math.PI;
                  const dist = 18;
                  return (
                    <span
                      key={i}
                      style={{
                        ...s.burstDot,
                        '--bx': Math.cos(angle) * dist + 'px',
                        '--by': Math.sin(angle) * dist + 'px',
                      }}
                    />
                  );
                })}
              </span>
            )}
          </button>
          <button
            style={s.detailBtn}
            onClick={openDetail}
          >
            🔍 Detail
          </button>
        </div>
      </div>
    </div>
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
  saveBtn: { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(108,71,255,.3)', background: 'rgba(108,71,255,.15)', color: '#8b6bff', fontSize: '.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' },
  savedBtn: { background: 'rgba(108,71,255,.15)', color: '#8b6bff', border: '1px solid rgba(108,71,255,.3)' },
  detailBtn: { flex: 1, padding: '.42rem', borderRadius: '7px', border: '1px solid rgba(108,71,255,.3)', background: 'rgba(108,71,255,.15)', color: '#8b6bff', fontSize: '.76rem', cursor: 'pointer', fontWeight: 700 },
  saveBurst: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  burstDot: { position: 'absolute', top: '50%', left: '50%', width: '4px', height: '4px', borderRadius: '50%', background: '#8b6bff', animation: 'advaultSaveBurst .5s ease-out forwards' },
  lockedBtn: { opacity: 0.45, cursor: 'not-allowed', border: '1px solid rgba(255,255,255,.05)' },
};
a(255,255,255,.05)' },
};
