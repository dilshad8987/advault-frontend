import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'copy',     icon: '✍️', label: 'Ad Copy Generator',     desc: 'Winning ad copy banao AI se' },
  { id: 'hook',     icon: '🎣', label: 'Hook Analyzer',         desc: 'Pehle 3 second ka hook analyze karo' },
  { id: 'audience', icon: '🎯', label: 'Audience Suggester',    desc: 'Best target audience dhundo' },
  { id: 'niche',    icon: '🔭', label: 'Niche Explorer',        desc: 'Trending niches aur competitors' },
];

const TONES = ['persuasive', 'funny', 'urgent', 'emotional', 'educational', 'bold'];

export default function AITools() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('copy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Copy generator
  const [copyTitle, setCopyTitle] = useState('');
  const [copyIndustry, setCopyIndustry] = useState('');
  const [copyTone, setCopyTone] = useState('persuasive');

  // Hook analyzer
  const [hookText, setHookText] = useState('');
  const [hookIndustry, setHookIndustry] = useState('');

  // Audience suggester
  const [audTitle, setAudTitle] = useState('');
  const [audIndustry, setAudIndustry] = useState('');

  // Niche explorer
  const [nicheKeyword, setNicheKeyword] = useState('');

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTool === 'copy') {
        if (!copyTitle && !copyIndustry) { toast.error('Title ya industry daalo'); setLoading(false); return; }
        res = await api.post('/ai/copy', { adTitle: copyTitle, industry: copyIndustry, tone: copyTone, count: 3 });
      } else if (activeTool === 'hook') {
        if (!hookText) { toast.error('Hook text daalo'); setLoading(false); return; }
        res = await api.post('/ai/hook', { hook: hookText, industry: hookIndustry });
      } else if (activeTool === 'audience') {
        if (!audTitle && !audIndustry) { toast.error('Title ya industry daalo'); setLoading(false); return; }
        res = await api.post('/ai/audience', { adTitle: audTitle, industry: audIndustry });
      } else if (activeTool === 'niche') {
        if (!nicheKeyword) { toast.error('Keyword daalo'); setLoading(false); return; }
        res = await api.post('/ai/niche', { keyword: nicheKeyword });
      }
      setResult(res.data.data);
      toast.success('Analysis ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis fail');
    }
    setLoading(false);
  };

  const scoreColor = (score) => score >= 70 ? '#4cff8f' : score >= 40 ? '#ffb700' : '#ff4f87';
  const gradeColor = (g) => ({ A: '#4cff8f', B: '#00d4aa', C: '#ffb700', D: '#ff9d00', F: '#ff4f87' }[g] || '#8888aa');

  return (
    <div style={{ minHeight: '100vh', background: '#08080f' }}>
      <Navbar />
      <div style={s.page}>

        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <h1 style={s.title}>🤖 AI Tools</h1>
          <p style={s.sub}>AI se ads analyze karo, copy banao aur audience dhundo</p>
        </div>

        {/* Tool selector */}
        <div style={s.toolGrid}>
          {TOOLS.map(t => (
            <button key={t.id}
              style={{ ...s.toolBtn, ...(activeTool === t.id ? s.toolBtnActive : {}) }}
              onClick={() => { setActiveTool(t.id); setResult(null); }}>
              <span style={s.toolIcon}>{t.icon}</span>
              <span style={s.toolLabel}>{t.label}</span>
              <span style={s.toolDesc}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={s.inputCard}>

          {/* Copy Generator */}
          {activeTool === 'copy' && (
            <>
              <div style={s.field}>
                <label style={s.label}>Ad Topic / Title</label>
                <input style={s.input} placeholder="e.g. Wireless Earbuds, Skincare Serum..." value={copyTitle} onChange={e => setCopyTitle(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Industry</label>
                <input style={s.input} placeholder="e.g. electronics, beauty, fitness..." value={copyIndustry} onChange={e => setCopyIndustry(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Tone</label>
                <div style={s.chips}>
                  {TONES.map(t => (
                    <button key={t} style={{ ...s.chip, ...(copyTone === t ? s.chipActive : {}) }}
                      onClick={() => setCopyTone(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Hook Analyzer */}
          {activeTool === 'hook' && (
            <>
              <div style={s.field}>
                <label style={s.label}>Hook Text (pehle 3 second)</label>
                <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }}
                  placeholder="e.g. POV: You just discovered the product that changed my life..."
                  value={hookText} onChange={e => setHookText(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Industry (optional)</label>
                <input style={s.input} placeholder="e.g. beauty, fitness..." value={hookIndustry} onChange={e => setHookIndustry(e.target.value)} />
              </div>
            </>
          )}

          {/* Audience Suggester */}
          {activeTool === 'audience' && (
            <>
              <div style={s.field}>
                <label style={s.label}>Ad Topic / Title</label>
                <input style={s.input} placeholder="e.g. Anti-aging cream for women..." value={audTitle} onChange={e => setAudTitle(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Industry</label>
                <input style={s.input} placeholder="e.g. beauty, dropshipping..." value={audIndustry} onChange={e => setAudIndustry(e.target.value)} />
              </div>
            </>
          )}

          {/* Niche Explorer */}
          {activeTool === 'niche' && (
            <div style={s.field}>
              <label style={s.label}>Niche / Industry Keyword</label>
              <input style={s.input} placeholder="e.g. sustainable fashion, home gym, pet care..."
                value={nicheKeyword} onChange={e => setNicheKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()} />
            </div>
          )}

          <button style={{ ...s.runBtn, opacity: loading ? .7 : 1 }} onClick={run} disabled={loading}>
            {loading ? '⏳ Analyzing...' : '🤖 Run AI Analysis'}
          </button>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div style={s.resultCard}>

            {/* Copy Generator Result */}
            {activeTool === 'copy' && result.copies && (
              <>
                <div style={s.resultTitle}>✍️ Generated Ad Copies</div>
                {result.copies.map((copy, i) => (
                  <div key={i} style={s.copyBlock}>
                    <div style={s.copyNum}>Copy #{i + 1} — <span style={{ color: copy.estimated_ctr === 'high' ? '#4cff8f' : copy.estimated_ctr === 'medium' ? '#ffb700' : '#ff4f87' }}>CTR: {copy.estimated_ctr}</span></div>
                    <div style={s.copyHook}>🎣 Hook: {copy.hook}</div>
                    <div style={s.copyBody}>{copy.body}</div>
                    <div style={s.copyCta}>📣 CTA: {copy.cta}</div>
                    <div style={s.copyTags}>{copy.hashtags?.join(' ')}</div>
                    <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(`${copy.hook}\n\n${copy.body}\n\n${copy.cta}\n\n${copy.hashtags?.join(' ')}`); toast.success('Copied!'); }}>
                      📋 Copy Text
                    </button>
                  </div>
                ))}
                {result.tips && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>💡 Pro Tips</div>
                    {result.tips.map((t, i) => <div key={i} style={s.tipItem}>• {t}</div>)}
                  </div>
                )}
              </>
            )}

            {/* Hook Analyzer Result */}
            {activeTool === 'hook' && result.score !== undefined && (
              <>
                <div style={s.resultTitle}>🎣 Hook Analysis</div>
                <div style={s.scoreRow}>
                  <div style={s.bigScore}>
                    <span style={{ ...s.scoreNum, color: scoreColor(result.score) }}>{result.score}</span>
                    <span style={s.scoreLabel}>/ 100</span>
                  </div>
                  <div style={{ ...s.gradeBadge, color: gradeColor(result.grade), borderColor: gradeColor(result.grade) }}>
                    Grade: {result.grade}
                  </div>
                  <div style={{ ...s.verdictBadge, color: scoreColor(result.score) }}>{result.verdict}</div>
                </div>

                <div style={s.miniScores}>
                  {[['Stop Scroll', result.stop_scroll_power, 10], ['Curiosity', result.curiosity_factor, 10], ['Clarity', result.clarity, 10]].map(([label, val, max]) => (
                    <div key={label} style={s.miniScore}>
                      <div style={s.miniLabel}>{label}</div>
                      <div style={s.miniBar}>
                        <div style={{ ...s.miniBarFill, width: `${(val / max) * 100}%`, background: scoreColor((val / max) * 100) }} />
                      </div>
                      <div style={{ ...s.miniVal, color: scoreColor((val / max) * 100) }}>{val}/{max}</div>
                    </div>
                  ))}
                </div>

                <div style={s.infoGrid}>
                  <div style={s.infoBlock}><div style={s.infoLabel}>Emotion Trigger</div><div style={s.infoVal}>🧠 {result.emotion_trigger}</div></div>
                  <div style={s.infoBlock}><div style={s.infoLabel}>Best Audience</div><div style={s.infoVal}>👥 {result.best_audience}</div></div>
                </div>

                {result.improved_versions && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>✨ Better Versions</div>
                    {result.improved_versions.map((v, i) => (
                      <div key={i} style={s.improvedItem}>
                        <span style={s.improvedNum}>{i + 1}.</span>
                        <span style={s.improvedText}>"{v}"</span>
                        <button style={s.microCopyBtn} onClick={() => { navigator.clipboard.writeText(v); toast.success('Copied!'); }}>📋</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Audience Suggester Result */}
            {activeTool === 'audience' && result.primary_audience && (
              <>
                <div style={s.resultTitle}>🎯 Target Audience</div>
                <div style={s.audCard}>
                  <div style={s.audTitle}>Primary Audience</div>
                  <div style={s.audRow}><span style={s.audKey}>Age</span><span style={s.audVal}>{result.primary_audience.age_range}</span></div>
                  <div style={s.audRow}><span style={s.audKey}>Gender</span><span style={s.audVal}>{result.primary_audience.gender}</span></div>
                  <div style={s.audRow}><span style={s.audKey}>Income</span><span style={s.audVal}>{result.primary_audience.income_level}</span></div>
                  <div style={s.audInterests}>
                    {result.primary_audience.interests?.map(i => (
                      <span key={i} style={s.interestTag}>{i}</span>
                    ))}
                  </div>
                  <div style={s.audPsycho}>{result.primary_audience.psychographics}</div>
                </div>

                {result.tiktok_targeting && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>🎵 TikTok Targeting</div>
                    <div style={s.audRow}><span style={s.audKey}>Best Time</span><span style={s.audVal}>{result.best_time_to_run}</span></div>
                    <div style={s.audRow}><span style={s.audKey}>Budget</span><span style={s.audVal}>{result.budget_recommendation}</span></div>
                    <div style={s.tagCloud}>
                      {result.tiktok_targeting.hashtags_to_target?.map(t => (
                        <span key={t} style={{ ...s.interestTag, background: 'rgba(108,71,255,.12)', color: '#8b6bff' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Niche Explorer Result */}
            {activeTool === 'niche' && result.niche_score !== undefined && (
              <>
                <div style={s.resultTitle}>🔭 Niche Analysis: {nicheKeyword}</div>
                <div style={s.nicheScoreRow}>
                  <div style={s.bigScore}>
                    <span style={{ ...s.scoreNum, color: scoreColor(result.niche_score) }}>{result.niche_score}</span>
                    <span style={s.scoreLabel}>/ 100</span>
                  </div>
                  <div style={s.nicheMeta}>
                    <div style={{ ...s.nicheBadge, color: result.trending ? '#4cff8f' : '#8888aa' }}>{result.trending ? '🔥 Trending' : '📉 Not Trending'}</div>
                    <div style={{ ...s.nicheBadge, color: result.competition_level === 'low' ? '#4cff8f' : result.competition_level === 'medium' ? '#ffb700' : '#ff4f87' }}>
                      Competition: {result.competition_level}
                    </div>
                    <div style={s.nicheBadge}>Audience: {result.audience_size}</div>
                    <div style={s.nicheBadge}>CPM: {result.cpm_estimate}</div>
                  </div>
                </div>

                <div style={s.nicheSummary}>{result.summary}</div>

                {result.sub_niches && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>📂 Sub-Niches</div>
                    {result.sub_niches.map((n, i) => (
                      <div key={i} style={s.subNicheItem}>
                        <div style={s.subNicheName}>{n.name}</div>
                        <div style={{ ...s.subNicheScore, color: scoreColor(n.score) }}>{n.score}</div>
                      </div>
                    ))}
                  </div>
                )}

                {result.winning_angles && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>🎯 Winning Ad Angles</div>
                    {result.winning_angles.map((a, i) => <div key={i} style={s.tipItem}>• {a}</div>)}
                  </div>
                )}

                {result.best_products && (
                  <div style={s.tipsBox}>
                    <div style={s.tipsTitle}>🛒 Best Products to Sell</div>
                    {result.best_products.map((p, i) => <div key={i} style={s.tipItem}>• {p}</div>)}
                  </div>
                )}
              </>
            )}
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
  title: { fontSize: '1.6rem', fontWeight: 900, color: '#f0f0f8', margin: 0 },
  sub: { color: '#8888aa', fontSize: '.83rem', marginTop: '.25rem' },

  toolGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginBottom: '1.25rem' },
  toolBtn: { display: 'flex', flexDirection: 'column', gap: '.2rem', padding: '.85rem .75rem', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: '14px', background: 'rgba(255,255,255,.03)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' },
  toolBtnActive: { background: 'rgba(108,71,255,.1)', borderColor: 'rgba(108,71,255,.4)' },
  toolIcon: { fontSize: '1.3rem' },
  toolLabel: { color: '#f0f0f8', fontSize: '.82rem', fontWeight: 700 },
  toolDesc: { color: '#8888aa', fontSize: '.72rem' },

  inputCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' },
  field: { marginBottom: '.9rem' },
  label: { display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.35rem' },
  input: { width: '100%', padding: '.75rem', background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '9px', color: '#f0f0f8', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '.4rem' },
  chip: { padding: '.35rem .7rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '999px', color: '#8888aa', fontSize: '.78rem', cursor: 'pointer', textTransform: 'capitalize' },
  chipActive: { background: 'rgba(108,71,255,.15)', borderColor: 'rgba(108,71,255,.4)', color: '#8b6bff' },
  runBtn: { width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,71,255,.25)' },

  resultCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.07)', borderRadius: '14px', padding: '1.25rem' },
  resultTitle: { fontSize: '.95rem', fontWeight: 800, color: '#f0f0f8', marginBottom: '1rem' },

  // Copy
  copyBlock: { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '10px', padding: '.9rem', marginBottom: '.75rem' },
  copyNum: { fontSize: '.72rem', fontWeight: 700, color: '#8888aa', marginBottom: '.5rem', textTransform: 'uppercase' },
  copyHook: { color: '#8b6bff', fontSize: '.85rem', fontWeight: 700, marginBottom: '.4rem' },
  copyBody: { color: '#c8c8e0', fontSize: '.83rem', lineHeight: 1.5, marginBottom: '.4rem' },
  copyCta: { color: '#ffb700', fontSize: '.82rem', fontWeight: 600, marginBottom: '.4rem' },
  copyTags: { color: '#8888aa', fontSize: '.75rem', marginBottom: '.5rem' },
  copyBtn: { padding: '.35rem .75rem', background: 'rgba(108,71,255,.1)', border: '1px solid rgba(108,71,255,.2)', borderRadius: '7px', color: '#8b6bff', fontSize: '.75rem', cursor: 'pointer' },

  // Hook
  scoreRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  bigScore: { display: 'flex', alignItems: 'baseline', gap: '.2rem' },
  scoreNum: { fontSize: '2.5rem', fontWeight: 900 },
  scoreLabel: { color: '#8888aa', fontSize: '.85rem' },
  gradeBadge: { padding: '.3rem .7rem', border: '1px solid', borderRadius: '8px', fontWeight: 800, fontSize: '.9rem' },
  verdictBadge: { fontWeight: 800, fontSize: '.9rem' },
  miniScores: { marginBottom: '1rem' },
  miniScore: { display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' },
  miniLabel: { color: '#8888aa', fontSize: '.75rem', width: '80px', flexShrink: 0 },
  miniBar: { flex: 1, height: '6px', background: 'rgba(255,255,255,.08)', borderRadius: '3px', overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: '3px', transition: 'width .3s' },
  miniVal: { fontSize: '.75rem', fontWeight: 700, width: '30px', textAlign: 'right', flexShrink: 0 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginBottom: '1rem' },
  infoBlock: { background: 'rgba(255,255,255,.03)', borderRadius: '9px', padding: '.7rem' },
  infoLabel: { color: '#8888aa', fontSize: '.68rem', textTransform: 'uppercase', marginBottom: '.2rem' },
  infoVal: { color: '#f0f0f8', fontSize: '.82rem', fontWeight: 600 },
  improvedItem: { display: 'flex', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' },
  improvedNum: { color: '#8b6bff', fontWeight: 700, flexShrink: 0 },
  improvedText: { color: '#c8c8e0', fontSize: '.83rem', flex: 1, fontStyle: 'italic' },
  microCopyBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '.85rem', flexShrink: 0 },

  // Audience
  audCard: { background: 'rgba(255,255,255,.03)', borderRadius: '10px', padding: '.9rem', marginBottom: '.75rem' },
  audTitle: { color: '#8b6bff', fontWeight: 700, fontSize: '.82rem', marginBottom: '.6rem' },
  audRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' },
  audKey: { color: '#8888aa', fontSize: '.78rem' },
  audVal: { color: '#f0f0f8', fontSize: '.78rem', fontWeight: 600, textAlign: 'right' },
  audInterests: { display: 'flex', flexWrap: 'wrap', gap: '.35rem', margin: '.5rem 0' },
  interestTag: { padding: '.2rem .55rem', background: 'rgba(255,183,0,.12)', color: '#ffb700', borderRadius: '6px', fontSize: '.72rem', fontWeight: 600 },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginTop: '.5rem' },
  audPsycho: { color: '#8888aa', fontSize: '.78rem', fontStyle: 'italic', marginTop: '.4rem', lineHeight: 1.4 },

  // Niche
  nicheScoreRow: { display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  nicheMeta: { display: 'flex', flexWrap: 'wrap', gap: '.4rem', flex: 1 },
  nicheBadge: { padding: '.25rem .6rem', background: 'rgba(255,255,255,.05)', borderRadius: '7px', fontSize: '.74rem', fontWeight: 600, color: '#c8c8e0' },
  nicheSummary: { color: '#c8c8e0', fontSize: '.83rem', lineHeight: 1.6, marginBottom: '.75rem' },
  subNicheItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px solid rgba(255,255,255,.05)' },
  subNicheName: { color: '#f0f0f8', fontSize: '.82rem' },
  subNicheScore: { fontWeight: 800, fontSize: '.85rem' },

  tipsBox: { background: 'rgba(255,255,255,.03)', borderRadius: '10px', padding: '.9rem', marginTop: '.75rem' },
  tipsTitle: { color: '#f0f0f8', fontWeight: 700, fontSize: '.82rem', marginBottom: '.6rem' },
  tipItem: { color: '#c8c8e0', fontSize: '.8rem', marginBottom: '.3rem', lineHeight: 1.4 },
};
