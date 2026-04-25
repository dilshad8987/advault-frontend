import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SavedAds() {
  const [savedAds,    setSavedAds]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeFolder,setActiveFolder]= useState('All');
  const [newFolder,   setNewFolder]   = useState('');
  const [showInput,   setShowInput]   = useState(false);
  const [moving,      setMoving]      = useState(null); // adId being moved
  const navigate = useNavigate();

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ads/saved');
      setSavedAds(res.data?.data || []);
    } catch(err) {
      toast.error('Saved ads load nahi hue');
    }
    setLoading(false);
  };

  const removeAd = async (adId) => {
    try {
      await api.delete(`/ads/save/${adId}`);
      setSavedAds(prev => prev.filter(a => a.id !== adId));
      toast.success('Ad remove ho gayi');
    } catch(err) {
      toast.error('Remove fail');
    }
  };

  const moveToFolder = async (adId, folder) => {
    // Optimistic update
    setSavedAds(prev => prev.map(a => a.id === adId ? { ...a, folder } : a));
    setMoving(null);
    toast.success(`"${folder}" folder mein move ho gayi`);
    // Note: backend mein folder update API add karna hoga — abhi frontend state mein hai
  };

  // All unique folders
  const folders = ['All', ...new Set(savedAds.map(a => a.folder || 'Default'))];

  const filteredAds = activeFolder === 'All'
    ? savedAds
    : savedAds.filter(a => (a.folder || 'Default') === activeFolder);

  return (
    <div style={{ minHeight:'100vh', background:'#08080f', color:'#f0f0f8', fontFamily:'system-ui,sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .saved-card:hover { border-color:rgba(108,71,255,.35)!important; transform:translateY(-2px); box-shadow:0 8px 20px rgba(108,71,255,.1); }
        .folder-btn:hover { border-color:rgba(108,71,255,.4)!important; color:#f0f0f8!important; }
      `}</style>
      <Navbar />

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>💾 Saved Ads</h1>
            <p style={S.sub}>{savedAds.length} ads saved hain</p>
          </div>
          <button style={S.newFolderBtn} onClick={() => setShowInput(!showInput)}>
            📁 New Folder
          </button>
        </div>

        {/* New folder input */}
        {showInput && (
          <div style={S.folderInputRow}>
            <input
              style={S.folderInput}
              placeholder="Folder ka naam likho..."
              value={newFolder}
              onChange={e => setNewFolder(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newFolder.trim()) {
                  toast.success(`"${newFolder}" folder ready hai`);
                  setNewFolder('');
                  setShowInput(false);
                }
              }}
              autoFocus
            />
            <button style={S.folderCreateBtn} onClick={() => {
              if (newFolder.trim()) {
                toast.success(`"${newFolder}" folder ready hai`);
                setNewFolder('');
                setShowInput(false);
              }
            }}>Create</button>
          </div>
        )}

        {/* Folder tabs */}
        <div style={S.folderRow}>
          {folders.map(f => (
            <button
              key={f}
              className="folder-btn"
              onClick={() => setActiveFolder(f)}
              style={{ ...S.folderTab, ...(activeFolder===f ? S.folderTabActive : {}) }}
            >
              {f === 'All' ? '📋' : '📁'} {f}
              <span style={S.folderCount}>
                {f === 'All' ? savedAds.length : savedAds.filter(a=>(a.folder||'Default')===f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={S.center}>
            <div style={S.spinner}></div>
            <p style={{ color:'#8888aa', marginTop:'1rem' }}>Load ho rahe hain...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div style={S.center}>
            <p style={{ fontSize:'3rem', margin:0 }}>📭</p>
            <p style={{ color:'#8888aa', marginTop:'.5rem' }}>
              {activeFolder === 'All' ? 'Koi ad save nahi ki abhi' : `"${activeFolder}" folder khaali hai`}
            </p>
            <button style={S.goBtn} onClick={() => navigate('/dashboard')}>
              🔍 Ads Dhundo
            </button>
          </div>
        ) : (
          <>
            <p style={S.count}>✅ {filteredAds.length} ads</p>
            <div style={S.grid}>
              {filteredAds.map(ad => (
                <SavedCard
                  key={ad.id}
                  ad={ad}
                  folders={folders.filter(f => f !== 'All')}
                  moving={moving === ad.id}
                  onOpen={() => navigate(`/ad/${ad.id}`, { state: { ad } })}
                  onRemove={() => removeAd(ad.id)}
                  onMoveStart={() => setMoving(moving === ad.id ? null : ad.id)}
                  onMoveTo={(folder) => moveToFolder(ad.id, folder)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SavedCard({ ad, folders, moving, onOpen, onRemove, onMoveStart, onMoveTo }) {
  const title    = ad.title || ad.ad_title || 'Saved Ad';
  const brand    = ad.brand || 'Unknown Brand';
  const cover    = ad.cover || '';
  const folder   = ad.folder || 'Default';
  const savedAt  = ad.savedAt ? new Date(ad.savedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}) : '';

  return (
    <div className="saved-card" style={SC.card}>
      {/* Thumbnail */}
      <div style={SC.thumb} onClick={onOpen}>
        {cover
          ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'2.5rem' }}>🎵</div>
        }
        <span style={SC.folderBadge}>📁 {folder}</span>
      </div>

      {/* Body */}
      <div style={SC.body}>
        <p style={SC.title} onClick={onOpen}>{title}</p>
        <div style={SC.meta}>
          <span style={SC.brand}>🏪 {brand}</span>
          {savedAt && <span style={SC.date}>💾 {savedAt}</span>}
        </div>

        {/* Move to folder dropdown */}
        {moving && (
          <div style={SC.moveMenu}>
            <p style={{ fontSize:'.7rem', color:'#8888aa', margin:'0 0 .4rem' }}>Move to:</p>
            {['Default', ...folders.filter(f=>f!=='Default' && f!==folder)].map(f => (
              <button key={f} style={SC.moveBtn} onClick={() => onMoveTo(f)}>
                📁 {f}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={SC.actions}>
          <button style={SC.openBtn} onClick={onOpen}>🔍 Open</button>
          <button style={SC.moveToggle} onClick={onMoveStart} title="Move to folder">📂</button>
          <button style={SC.removeBtn} onClick={onRemove} title="Remove">🗑️</button>
        </div>
      </div>
    </div>
  );
}

const SC = {
  card:       { background:'#0f0f1a', border:'1px solid rgba(255,255,255,.07)', borderRadius:'12px', overflow:'hidden', transition:'all .2s', cursor:'default' },
  thumb:      { height:'150px', background:'#161625', position:'relative', overflow:'hidden', cursor:'pointer' },
  folderBadge:{ position:'absolute', bottom:'7px', left:'7px', background:'rgba(0,0,0,.75)', color:'#d0d0e8', borderRadius:'5px', padding:'.2rem .55rem', fontSize:'.65rem', fontWeight:600 },
  body:       { padding:'.85rem', display:'flex', flexDirection:'column', gap:'.5rem' },
  title:      { fontSize:'.82rem', fontWeight:600, color:'#f0f0f8', margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.4, cursor:'pointer' },
  meta:       { display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'.3rem' },
  brand:      { fontSize:'.7rem', color:'#8888aa' },
  date:       { fontSize:'.7rem', color:'#8888aa' },
  moveMenu:   { background:'#161625', borderRadius:'8px', padding:'.6rem', display:'flex', flexDirection:'column', gap:'.3rem' },
  moveBtn:    { padding:'.35rem .6rem', background:'transparent', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px', color:'#d0d0e8', fontSize:'.75rem', cursor:'pointer', textAlign:'left' },
  actions:    { display:'flex', gap:'.4rem', marginTop:'.25rem' },
  openBtn:    { flex:1, padding:'.4rem', background:'rgba(108,71,255,.15)', border:'1px solid rgba(108,71,255,.3)', borderRadius:'6px', color:'#8b6bff', fontSize:'.75rem', fontWeight:600, cursor:'pointer' },
  moveToggle: { padding:'.4rem .6rem', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'6px', fontSize:'.8rem', cursor:'pointer' },
  removeBtn:  { padding:'.4rem .6rem', background:'rgba(255,79,135,.08)', border:'1px solid rgba(255,79,135,.15)', borderRadius:'6px', fontSize:'.8rem', cursor:'pointer' },
};

const S = {
  page:           { padding:'80px clamp(1rem,4vw,2rem) 3rem', maxWidth:'1100px', margin:'0 auto' },
  header:         { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  h1:             { fontSize:'clamp(1.4rem,4vw,2rem)', fontWeight:900, margin:0 },
  sub:            { color:'#8888aa', marginTop:'.4rem', fontSize:'.9rem', margin:0 },
  newFolderBtn:   { padding:'.55rem 1.2rem', background:'rgba(108,71,255,.15)', border:'1px solid rgba(108,71,255,.3)', borderRadius:'8px', color:'#8b6bff', fontWeight:700, fontSize:'.85rem', cursor:'pointer' },
  folderInputRow: { display:'flex', gap:'.6rem', marginBottom:'1rem', flexWrap:'wrap' },
  folderInput:    { flex:1, minWidth:'180px', padding:'.6rem 1rem', background:'#161625', border:'1px solid rgba(108,71,255,.3)', borderRadius:'8px', color:'#f0f0f8', fontSize:'.88rem', outline:'none' },
  folderCreateBtn:{ padding:'.6rem 1.2rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, cursor:'pointer' },
  folderRow:      { display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1.5rem' },
  folderTab:      { padding:'.45rem 1rem', borderRadius:'8px', border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'#8888aa', fontSize:'.82rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'.4rem', transition:'all .2s' },
  folderTabActive:{ background:'#161625', color:'#f0f0f8', border:'1px solid rgba(108,71,255,.4)', boxShadow:'0 0 12px rgba(108,71,255,.15)' },
  folderCount:    { background:'rgba(255,255,255,.08)', borderRadius:'10px', padding:'.05rem .45rem', fontSize:'.65rem', fontWeight:700 },
  grid:           { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(220px,100%),1fr))', gap:'1rem', animation:'fadeIn .3s ease' },
  count:          { color:'#8888aa', fontSize:'.83rem', marginBottom:'1rem' },
  center:         { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'300px', gap:'.75rem' },
  spinner:        { width:'36px', height:'36px', border:'3px solid rgba(108,71,255,.2)', borderTop:'3px solid #6c47ff', borderRadius:'50%', animation:'spin 1s linear infinite' },
  goBtn:          { padding:'.55rem 1.4rem', background:'linear-gradient(135deg,#6c47ff,#8b6bff)', border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, cursor:'pointer', marginTop:'.5rem' },
};
