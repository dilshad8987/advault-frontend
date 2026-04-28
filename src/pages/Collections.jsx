import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMOJIS = ['📁','🔥','⭐','💎','🎯','🚀','💡','🛒','📊','🎨','👑','💰'];
const COLORS = ['#6c47ff','#ff4f87','#ffb700','#00d4aa','#ff6b35','#4fc3f7'];

export default function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [newColor, setNewColor] = useState('#6c47ff');
  const [creating, setCreating] = useState(false);
  const [activeCol, setActiveCol] = useState(null);
  const [noteAdId, setNoteAdId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareColId, setShareColId] = useState(null);

  useEffect(() => { fetchCollections(); }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get('/collections');
      setCollections(res.data.data || []);
    } catch (err) {
      toast.error('Collections load nahi hui');
    }
    setLoading(false);
  };

  const createCollection = async () => {
    if (!newName.trim()) return toast.error('Name daalo');
    setCreating(true);
    try {
      const res = await api.post('/collections', { name: newName, emoji: newEmoji, color: newColor });
      setCollections(prev => [...prev, res.data.data]);
      setNewName(''); setShowCreate(false);
      toast.success('Collection ban gayi!');
    } catch (err) {
      if (err.response?.data?.upgrade) {
        toast.error('Free plan mein sirf 3 collections. Upgrade karo!');
        navigate('/upgrade');
      } else {
        toast.error(err.response?.data?.message || 'Create fail');
      }
    }
    setCreating(false);
  };

  const deleteCollection = async (colId) => {
    if (!window.confirm('Delete karna chahte ho?')) return;
    try {
      await api.delete(`/collections/${colId}`);
      setCollections(prev => prev.filter(c => c.id !== colId));
      if (activeCol?.id === colId) setActiveCol(null);
      toast.success('Collection delete ho gayi');
    } catch (err) {
      toast.error('Delete fail');
    }
  };

  const removeAd = async (colId, adId) => {
    try {
      await api.delete(`/collections/${colId}/ads/${adId}`);
      setCollections(prev => prev.map(c => c.id === colId ? { ...c, ads: c.ads.filter(a => a.id !== adId) } : c));
      if (activeCol?.id === colId) setActiveCol(prev => ({ ...prev, ads: prev.ads.filter(a => a.id !== adId) }));
      toast.success('Ad remove ho gayi');
    } catch (err) {
      toast.error('Remove fail');
    }
  };

  const saveNote = async (colId, adId) => {
    try {
      await api.patch(`/collections/${colId}/ads/${adId}/note`, { note: noteText });
      setCollections(prev => prev.map(c => c.id === colId
        ? { ...c, ads: c.ads.map(a => a.id === adId ? { ...a, note: noteText } : a) }
        : c
      ));
      if (activeCol?.id === colId) {
        setActiveCol(prev => ({ ...prev, ads: prev.ads.map(a => a.id === adId ? { ...a, note: noteText } : a) }));
      }
      setNoteAdId(null);
      toast.success('Note save ho gaya!');
    } catch (err) {
      toast.error('Note save fail');
    }
  };

  const shareCollection = async (colId) => {
    if (!shareEmail.trim()) return toast.error('Email daalo');
    try {
      await api.post(`/collections/${colId}/share`, { email: shareEmail });
      setShareEmail(''); setShareColId(null);
      toast.success('Collection share ho gayi!');
    } catch (err) {
      if (err.response?.data?.upgrade) {
        toast.error('Team sharing Pro plan mein hai'); navigate('/upgrade');
      } else {
        toast.error(err.response?.data?.message || 'Share fail');
      }
    }
  };

  const openCollection = (col) => setActiveCol(col);

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          {activeCol ? (
            <button style={s.backBtn} onClick={() => setActiveCol(null)}>← Collections</button>
          ) : (
            <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
          )}
          <div style={s.headerRow}>
            <div>
              <h1 style={s.title}>{activeCol ? `${activeCol.emoji} ${activeCol.name}` : '📁 Collections'}</h1>
              <p style={s.sub}>{activeCol ? `${activeCol.ads?.length || 0} ads saved` : 'Apne winning ads Pinterest style organize karo'}</p>
            </div>
            {!activeCol && (
              <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ New</button>
            )}
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div style={s.modalOverlay} onClick={() => setShowCreate(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>New Collection</div>

              <input style={s.input} placeholder="Collection name..." value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCollection()} autoFocus />

              <div style={s.fieldLabel}>Emoji</div>
              <div style={s.emojiGrid}>
                {EMOJIS.map(e => (
                  <button key={e} style={{ ...s.emojiBtn, ...(newEmoji === e ? s.emojiBtnActive : {}) }}
                    onClick={() => setNewEmoji(e)}>{e}</button>
                ))}
              </div>

              <div style={s.fieldLabel}>Color</div>
              <div style={s.colorRow}>
                {COLORS.map(c => (
                  <button key={c} style={{ ...s.colorDot, background: c, ...(newColor === c ? { outline: '3px solid #fff', outlineOffset: '2px' } : {}) }}
                    onClick={() => setNewColor(c)} />
                ))}
              </div>

              <button style={{ ...s.createBtn, width: '100%', marginTop: '1rem', opacity: creating ? .7 : 1 }}
                onClick={createCollection} disabled={creating}>
                {creating ? 'Creating...' : '✅ Create Collection'}
              </button>
            </div>
          </div>
        )}

        {/* Share modal */}
        {shareColId && (
          <div style={s.modalOverlay} onClick={() => setShareColId(null)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>🤝 Share Collection</div>
              <p style={{ color: '#8888aa', fontSize: '.85rem', marginBottom: '1rem' }}>Team member ki email daalo</p>
              <input style={s.input} placeholder="email@example.com" value={shareEmail}
                onChange={e => setShareEmail(e.target.value)} type="email" />
              <button style={{ ...s.createBtn, width: '100%', marginTop: '.75rem' }}
                onClick={() => shareCollection(shareColId)}>Share</button>
            </div>
          </div>
        )}

        {/* Note modal */}
        {noteAdId && (
          <div style={s.modalOverlay} onClick={() => setNoteAdId(null)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>📝 Note</div>
              <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }}
                placeholder="Is ad ke baare mein note likho..."
                value={noteText} onChange={e => setNoteText(e.target.value)} />
              <button style={{ ...s.createBtn, width: '100%', marginTop: '.75rem' }}
                onClick={() => saveNote(activeCol?.id, noteAdId)}>Save Note</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={s.loader}>⏳ Loading...</div>
        ) : activeCol ? (
          /* ── Collection detail view ── */
          <div>
            <div style={s.colActions}>
              <button style={s.actionBtn} onClick={() => { setShareColId(activeCol.id); }}>🤝 Share</button>
              <button style={{ ...s.actionBtn, color: '#ff4f87' }} onClick={() => deleteCollection(activeCol.id)}>🗑 Delete</button>
            </div>

            {(!activeCol.ads || activeCol.ads.length === 0) ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>📭</div>
                <div style={s.emptyText}>Collection khaali hai</div>
                <div style={s.emptySub}>Ads save karte waqt is collection ko select karo</div>
              </div>
            ) : (
              <div style={s.adsGrid}>
                {activeCol.ads.map(ad => (
                  <div key={ad.id} style={s.adCard}>
                    {ad.cover || ad.video_info?.cover ? (
                      <img src={ad.cover || ad.video_info?.cover} alt="" style={s.adCover}
                        onClick={() => navigate(`/ad/${ad.id}`)} />
                    ) : (
                      <div style={s.adCoverPlaceholder} onClick={() => navigate(`/ad/${ad.id}`)}>🎵</div>
                    )}
                    <div style={s.adInfo}>
                      <div style={s.adTitle} onClick={() => navigate(`/ad/${ad.id}`)}>
                        {ad.title || ad.ad_title || 'Ad'}
                      </div>
                      {ad.note && <div style={s.adNote}>📝 {ad.note}</div>}
                      <div style={s.adBtns}>
                        <button style={s.noteBtn} onClick={() => { setNoteAdId(ad.id); setNoteText(ad.note || ''); }}>
                          {ad.note ? '✏️ Edit Note' : '📝 Add Note'}
                        </button>
                        <button style={s.removeBtn} onClick={() => removeAd(activeCol.id, ad.id)}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Collections grid ── */
          collections.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>📁</div>
              <div style={s.emptyText}>Koi collection nahi hai</div>
              <div style={s.emptySub}>Pehli collection banao!</div>
              <button style={{ ...s.createBtn, marginTop: '1rem' }} onClick={() => setShowCreate(true)}>+ New Collection</button>
            </div>
          ) : (
            <div style={s.colGrid}>
              {collections.map(col => (
                <div key={col.id} style={{ ...s.colCard, borderColor: col.color + '55' }}
                  onClick={() => openCollection(col)}>
                  <div style={{ ...s.colEmoji, background: col.color + '22', color: col.color }}>{col.emoji}</div>
                  <div style={s.colName}>{col.name}</div>
                  <div style={s.colCount}>{col.ads?.length || 0} ads</div>
                  {col.sharedWith?.length > 0 && (
                    <div style={s.colShared}>🤝 {col.sharedWith.length} members</div>
                  )}
                  <button style={s.colDelete} onClick={e => { e.stopPropagation(); deleteCollection(col.id); }}>🗑</button>
                </div>
              ))}
            </div>
          )
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
  createBtn: { padding: '.6rem 1.1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap' },

  // Modals
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '340px' },
  modalTitle: { fontSize: '1rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '1rem' },
  input: { width: '100%', padding: '.75rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
  fieldLabel: { fontSize: '.72rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.07em', margin: '.9rem 0 .4rem' },
  emojiGrid: { display: 'flex', flexWrap: 'wrap', gap: '.4rem' },
  emojiBtn: { fontSize: '1.3rem', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '.3rem .4rem', cursor: 'pointer' },
  emojiBtnActive: { background: 'rgba(108,71,255,.2)', borderColor: '#8b6bff' },
  colorRow: { display: 'flex', gap: '.5rem', flexWrap: 'wrap' },
  colorDot: { width: '26px', height: '26px', borderRadius: '50%', border: 'none', cursor: 'pointer' },

  // Collections grid
  colGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' },
  colCard: { background: '#0f0f1a', border: '1px solid', borderRadius: '14px', padding: '1.1rem', cursor: 'pointer', position: 'relative', transition: 'transform .15s' },
  colEmoji: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '.6rem' },
  colName: { fontWeight: 800, color: '#f0f0f8', fontSize: '.9rem', marginBottom: '.2rem' },
  colCount: { color: '#8888aa', fontSize: '.75rem' },
  colShared: { color: '#00d4aa', fontSize: '.72rem', marginTop: '.2rem' },
  colDelete: { position: 'absolute', top: '.6rem', right: '.6rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.85rem', opacity: .5 },

  // Collection detail
  colActions: { display: 'flex', gap: '.5rem', marginBottom: '1.25rem' },
  actionBtn: { padding: '.5rem .9rem', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#c8c8e0', fontSize: '.8rem', cursor: 'pointer' },
  adsGrid: { display: 'flex', flexDirection: 'column', gap: '.75rem' },
  adCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', overflow: 'hidden', display: 'flex', gap: '.75rem', padding: '.75rem' },
  adCover: { width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' },
  adCoverPlaceholder: { width: '64px', height: '64px', borderRadius: '8px', background: '#161625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, cursor: 'pointer' },
  adInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '.3rem' },
  adTitle: { color: '#f0f0f8', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', lineHeight: 1.3 },
  adNote: { color: '#8b6bff', fontSize: '.75rem', fontStyle: 'italic' },
  adBtns: { display: 'flex', gap: '.4rem', marginTop: 'auto' },
  noteBtn: { padding: '.3rem .6rem', background: 'rgba(108,71,255,.1)', border: '1px solid rgba(108,71,255,.2)', borderRadius: '6px', color: '#8b6bff', fontSize: '.72rem', cursor: 'pointer' },
  removeBtn: { padding: '.3rem .5rem', background: 'rgba(255,79,135,.07)', border: '1px solid rgba(255,79,135,.15)', borderRadius: '6px', color: '#ff4f87', fontSize: '.72rem', cursor: 'pointer' },

  // Empty state
  empty: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '.75rem' },
  emptyText: { color: '#f0f0f8', fontWeight: 700, fontSize: '1rem', marginBottom: '.3rem' },
  emptySub: { color: '#8888aa', fontSize: '.82rem' },

  loader: { textAlign: 'center', color: '#8888aa', padding: '3rem' },
};
