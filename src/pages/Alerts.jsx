import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [alertType, setAlertType] = useState('competitor');
  const [alertValue, setAlertValue] = useState('');
  const [alertPlatform, setAlertPlatform] = useState('tiktok');
  const [creating, setCreating] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data || []);
    } catch { toast.error('Alerts load nahi hui'); }
    setLoading(false);
  };

  const createAlert = async () => {
    if (!alertValue.trim()) return toast.error('Value daalo');
    setCreating(true);
    try {
      const res = await api.post('/alerts', { type: alertType, value: alertValue, platform: alertPlatform });
      setAlerts(prev => [...prev, res.data.data]);
      setAlertValue(''); setShowCreate(false);
      toast.success('Alert set ho gaya! 🔔');
    } catch (err) {
      if (err.response?.data?.upgrade) { toast.error('Pro plan mein zyada alerts'); navigate('/upgrade'); }
      else toast.error(err.response?.data?.message || 'Create fail');
    }
    setCreating(false);
  };

  const toggleAlert = async (id) => {
    try {
      const res = await api.patch(`/alerts/${id}/toggle`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: res.data.active } : a));
      toast(res.data.active ? '🔔 Alert on' : '🔕 Alert off');
    } catch { toast.error('Toggle fail'); }
  };

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert delete ho gaya');
    } catch { toast.error('Delete fail'); }
  };

  const checkAlert = async (alert) => {
    setCheckingId(alert.id);
    try {
      const res = await api.post(`/alerts/${alert.id}/check`);
      setResults(prev => ({ ...prev, [alert.id]: res.data }));
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, lastChecked: new Date().toISOString() } : a));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check fail');
    }
    setCheckingId(null);
  };

  const timeAgo = (iso) => {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={s.page}>

        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <div style={s.headerRow}>
            <div>
              <h1 style={s.title}>🔔 Alerts</h1>
              <p style={s.sub}>Competitor aur niche alerts — naye ads aane par notify karo</p>
            </div>
            <button style={s.addBtn} onClick={() => setShowCreate(true)}>+ New Alert</button>
          </div>
        </div>

        {/* Create Alert Modal */}
        {showCreate && (
          <div style={s.overlay} onClick={() => setShowCreate(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>🔔 New Alert</div>

              <div style={s.fieldLabel}>Alert Type</div>
              <div style={s.typeBtns}>
                <button style={{ ...s.typeBtn, ...(alertType === 'competitor' ? s.typeBtnActive : {}) }}
                  onClick={() => setAlertType('competitor')}>
                  <span>🏢</span> Competitor Brand
                </button>
                <button style={{ ...s.typeBtn, ...(alertType === 'niche' ? s.typeBtnActive : {}) }}
                  onClick={() => setAlertType('niche')}>
                  <span>🎯</span> Niche Keyword
                </button>
              </div>

              <div style={s.fieldLabel}>{alertType === 'competitor' ? 'Brand Name' : 'Niche Keyword'}</div>
              <input style={s.input}
                placeholder={alertType === 'competitor' ? 'e.g. Nike, Shein, GymShark...' : 'e.g. skincare, dropshipping, fitness...'}
                value={alertValue} onChange={e => setAlertValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createAlert()} autoFocus />

              <div style={s.fieldLabel}>Platform</div>
              <div style={s.typeBtns}>
                {['tiktok', 'all'].map(p => (
                  <button key={p} style={{ ...s.typeBtn, ...(alertPlatform === p ? s.typeBtnActive : {}) }}
                    onClick={() => setAlertPlatform(p)}>
                    {p === 'tiktok' ? '🎵 TikTok' : '🌐 All Platforms'}
                  </button>
                ))}
              </div>

              <button style={{ ...s.addBtn, width: '100%', marginTop: '1rem', opacity: creating ? .7 : 1 }}
                onClick={createAlert} disabled={creating}>
                {creating ? 'Setting...' : '✅ Set Alert'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={s.loader}>⏳ Loading...</div>
        ) : alerts.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🔕</div>
            <div style={s.emptyTitle}>Koi alert nahi hai</div>
            <div style={s.emptySub}>Competitor ya niche track karo — naye ads aane par pata chalega</div>
            <button style={{ ...s.addBtn, marginTop: '1rem' }} onClick={() => setShowCreate(true)}>+ First Alert</button>
          </div>
        ) : (
          <div style={s.alertsList}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ ...s.alertCard, opacity: alert.active ? 1 : .5 }}>
                <div style={s.alertTop}>
                  <div style={s.alertIcon}>
                    {alert.type === 'competitor' ? '🏢' : '🎯'}
                  </div>
                  <div style={s.alertInfo}>
                    <div style={s.alertValue}>{alert.value}</div>
                    <div style={s.alertMeta}>
                      <span style={{ ...s.alertTypeBadge, background: alert.type === 'competitor' ? 'rgba(108,71,255,.15)' : 'rgba(255,183,0,.15)', color: alert.type === 'competitor' ? '#8b6bff' : '#ffb700' }}>
                        {alert.type === 'competitor' ? 'Competitor' : 'Niche'}
                      </span>
                      <span style={s.alertMuted}>🎵 {alert.platform}</span>
                      <span style={s.alertMuted}>Checked: {timeAgo(alert.lastChecked)}</span>
                    </div>
                  </div>
                  <div style={s.alertActions}>
                    <button style={{ ...s.iconBtn, color: alert.active ? '#4cff8f' : '#8888aa' }}
                      onClick={() => toggleAlert(alert.id)} title="Toggle">
                      {alert.active ? '🔔' : '🔕'}
                    </button>
                    <button style={{ ...s.iconBtn, color: '#ff4f87' }}
                      onClick={() => deleteAlert(alert.id)} title="Delete">🗑</button>
                  </div>
                </div>

                {/* Check button */}
                <button style={s.checkBtn} onClick={() => checkAlert(alert)} disabled={checkingId === alert.id}>
                  {checkingId === alert.id ? '⏳ Checking...' : '🔍 Check Now'}
                </button>

                {/* Results */}
                {results[alert.id] && (
                  <div style={s.results}>
                    <div style={s.resultsTitle}>
                      {results[alert.id].found > 0 ? `✅ ${results[alert.id].found} ads mile!` : '📭 Koi naye ads nahi mile'}
                    </div>
                    {results[alert.id].data?.slice(0, 3).map((ad, i) => (
                      <div key={i} style={s.resultItem}
                        onClick={() => navigate(`/ad/${ad.material_id || ad.id}`)}>
                        {ad.video_info?.cover && (
                          <img src={ad.video_info.cover} alt="" style={s.resultCover} />
                        )}
                        <span style={s.resultTitle}>{ad.ad_title || ad.title || 'Ad #' + (i + 1)}</span>
                        <span style={s.resultArrow}>→</span>
                      </div>
                    ))}
                  </div>
                )}

                {alert.triggeredCount > 0 && !results[alert.id] && (
                  <div style={s.triggeredNote}>⚡ {alert.triggeredCount} baar ads mile abhi tak</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '72px 1rem 3rem', maxWidth: '600px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '.85rem', padding: 0, marginBottom: '.5rem' },
  headerRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' },
  title: { fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f8', margin: 0 },
  sub: { color: '#8888aa', fontSize: '.83rem', marginTop: '.25rem' },
  addBtn: { padding: '.6rem 1.1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '340px' },
  modalTitle: { fontSize: '1rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '1rem' },
  fieldLabel: { fontSize: '.7rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.07em', margin: '.8rem 0 .4rem' },
  typeBtns: { display: 'flex', gap: '.5rem' },
  typeBtn: { flex: 1, padding: '.6rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#8888aa', fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' },
  typeBtnActive: { background: 'rgba(108,71,255,.15)', borderColor: 'rgba(108,71,255,.4)', color: '#8b6bff' },
  input: { width: '100%', padding: '.75rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },

  alertsList: { display: 'flex', flexDirection: 'column', gap: '.75rem' },
  alertCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '1rem' },
  alertTop: { display: 'flex', alignItems: 'flex-start', gap: '.75rem', marginBottom: '.75rem' },
  alertIcon: { fontSize: '1.5rem', flexShrink: 0 },
  alertInfo: { flex: 1 },
  alertValue: { color: '#f0f0f8', fontWeight: 700, fontSize: '.92rem', marginBottom: '.3rem' },
  alertMeta: { display: 'flex', flexWrap: 'wrap', gap: '.4rem', alignItems: 'center' },
  alertTypeBadge: { fontSize: '.7rem', fontWeight: 700, padding: '.15rem .5rem', borderRadius: '6px' },
  alertMuted: { color: '#8888aa', fontSize: '.72rem' },
  alertActions: { display: 'flex', gap: '.3rem', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '.2rem' },

  checkBtn: { width: '100%', padding: '.6rem', background: 'rgba(108,71,255,.1)', border: '1px solid rgba(108,71,255,.2)', borderRadius: '9px', color: '#8b6bff', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer' },

  results: { marginTop: '.75rem', background: 'rgba(255,255,255,.03)', borderRadius: '9px', padding: '.75rem' },
  resultsTitle: { color: '#f0f0f8', fontSize: '.82rem', fontWeight: 700, marginBottom: '.5rem' },
  resultItem: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 0', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer' },
  resultCover: { width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
  resultTitle: { flex: 1, color: '#c8c8e0', fontSize: '.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resultArrow: { color: '#6c47ff', fontSize: '.85rem' },
  triggeredNote: { marginTop: '.6rem', color: '#ffb700', fontSize: '.75rem' },

  empty: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '.75rem' },
  emptyTitle: { color: '#f0f0f8', fontWeight: 700, fontSize: '1rem', marginBottom: '.3rem' },
  emptySub: { color: '#8888aa', fontSize: '.82rem' },
  loader: { textAlign: 'center', color: '#8888aa', padding: '3rem' },
};
