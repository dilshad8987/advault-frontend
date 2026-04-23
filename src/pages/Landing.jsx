import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🔍</div>
          Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#pricing" style={s.navLink}>Pricing</a>
          <a href="#platforms" style={s.navLink}>Platforms</a>
        </div>
        <div style={s.navRight}>
          <Link to="/login" style={s.loginBtn}>Login</Link>
          <Link to="/register" style={s.signupBtn}>Start Free Trial</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroGlow}></div>
        <div style={s.badge}>✦ Trusted by 50,000+ marketers worldwide</div>
        <h1 style={s.h1}>
          Spy on <span style={s.grad}>Winning Ads</span><br />
          Before Your Competitors Do
        </h1>
        <p style={s.heroSub}>
          Discover top-performing creatives across TikTok, Facebook, Instagram & more.
          Find your next winning product in minutes.
        </p>
        <div style={s.heroBtns}>
          <Link to="/register" style={s.btnPrimary}>🚀 Start Free Trial</Link>
          <Link to="/login" style={s.btnGhost}>Login →</Link>
        </div>
        <div style={s.stats}>
          {[['250M+','Ads Indexed'],['12','Platforms'],['98%','Accuracy'],['50K+','Users']].map(([n,l]) => (
            <div key={l} style={s.stat}>
              <div style={s.statNum}>{n}</div>
              <div style={s.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={s.section}>
        <div style={s.sectionHeader}>
          <div style={s.tag}>Why AdVault</div>
          <h2 style={s.h2}>Everything You Need to Win</h2>
          <p style={s.sectionSub}>A complete intelligence suite for e-commerce and performance marketers</p>
        </div>
        <div style={s.featGrid}>
          {[
            ['🔮','Winning Product Finder','AI-ranked products sorted by ad performance signals and engagement velocity.'],
            ['🎥','Creative Intelligence','Break down hooks, copy angles and CTAs of best-performing creatives in your niche.'],
            ['📊','Deep Analytics','Track likes, shares, saves, engagement rate and estimated spend across every ad.'],
            ['🏪','Store Intelligence','See any store\'s top sellers, traffic sources and monthly revenue estimates.'],
            ['🚨','Trend Alerts','Get notified the moment a product starts going viral in your saved niches.'],
            ['💾','Ad Collections','Save and organise ads into swipe-file folders. Share with your team in one click.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={s.featCard}>
              <div style={s.featIcon}>{icon}</div>
              <div style={s.featTitle}>{title}</div>
              <div style={s.featDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PLATFORMS */}
      <div id="platforms" style={{ ...s.section, background: '#0f0f1a' }}>
        <div style={s.sectionHeader}>
          <div style={s.tag}>Coverage</div>
          <h2 style={s.h2}>12 Platforms. One Dashboard.</h2>
        </div>
        <div style={s.platformGrid}>
          {[
            ['#1877f2','Facebook'],
            ['#e1306c','Instagram'],
            ['#fff','TikTok'],
            ['#f00','YouTube'],
            ['#bd081c','Pinterest'],
            ['#0a66c2','LinkedIn'],
            ['#1da1f2','Twitter / X'],
            ['#ff6900','Snapchat'],
            ['#25d366','WhatsApp Ads'],
            ['#e60023','Native Ads'],
            ['#4bc0c0','Google Display'],
            ['#a855f7','Taboola'],
          ].map(([color, name]) => (
            <div key={name} style={s.platformChip}>
              <span style={{ ...s.dot, background: color }}></span>
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={s.section}>
        <div style={s.sectionHeader}>
          <div style={s.tag}>Pricing</div>
          <h2 style={s.h2}>Simple, Transparent Plans</h2>
          <p style={s.sectionSub}>Start free. Upgrade when you're ready.</p>
        </div>
        <div style={s.pricingGrid}>
          {/* Starter */}
          <div style={s.priceCard}>
            <div style={s.planName}>Starter</div>
            <div style={s.planPrice}>$29<span style={s.planPer}>/mo</span></div>
            <p style={s.planDesc}>Perfect for solo dropshippers testing the waters.</p>
            <ul style={s.planFeatures}>
              {['5 Platforms','500 Ad searches/day','50 Saved ads','Basic analytics'].map(f => (
                <li key={f} style={s.planFeat}>✓ {f}</li>
              ))}
            </ul>
            <Link to="/register" style={s.btnGhost}>Get Started</Link>
          </div>

          {/* Pro */}
          <div style={{ ...s.priceCard, border: '1px solid #6c47ff', boxShadow: '0 0 40px rgba(108,71,255,.2)', position: 'relative' }}>
            <div style={s.popularBadge}>⭐ Most Popular</div>
            <div style={s.planName}>Pro</div>
            <div style={s.planPrice}>$79<span style={s.planPer}>/mo</span></div>
            <p style={s.planDesc}>For serious marketers who want an edge.</p>
            <ul style={s.planFeatures}>
              {['All 12 Platforms','Unlimited searches','Unlimited saved ads','Advanced analytics','Store intelligence','Trend alerts'].map(f => (
                <li key={f} style={s.planFeat}>✓ {f}</li>
              ))}
            </ul>
            <Link to="/register" style={s.btnPrimary}>Start Free Trial</Link>
          </div>

          {/* Agency */}
          <div style={s.priceCard}>
            <div style={s.planName}>Agency</div>
            <div style={s.planPrice}>$199<span style={s.planPer}>/mo</span></div>
            <p style={s.planDesc}>For agencies running multiple client accounts.</p>
            <ul style={s.planFeatures}>
              {['Everything in Pro','AI creative insights','5 team seats','Priority alerts','Dedicated support'].map(f => (
                <li key={f} style={s.planFeat}>✓ {f}</li>
              ))}
            </ul>
            <Link to="/register" style={s.btnGhost}>Contact Sales</Link>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ ...s.section, background: '#0f0f1a' }}>
        <div style={s.sectionHeader}>
          <div style={s.tag}>Reviews</div>
          <h2 style={s.h2}>Loved by 50,000+ Marketers</h2>
        </div>
        <div style={s.testimGrid}>
          {[
            { text: 'Found 3 winning products in my first week. AdVault paid for itself 20x over in Q1 alone.', name: 'Jake Morrison', role: 'Dropshipping Store Owner', color: '#6c47ff' },
            { text: 'The creative intelligence feature is insane. I can immediately see why an ad is converting.', name: 'Priya Nair', role: 'Performance Marketer', color: '#e1306c' },
            { text: 'Switched from Minea and never looked back. The TikTok database is 3x larger.', name: 'Carlos Mendez', role: 'Media Buyer', color: '#ff6900' },
            { text: 'Our agency uses AdVault for every client. Saves us 10+ hours per week on research.', name: 'Sophie Laurent', role: 'Agency Director', color: '#1877f2' },
            { text: 'The store intelligence tool let me reverse-engineer my competitor\'s entire funnel.', name: 'Ben Wu', role: 'E-com Entrepreneur', color: '#25d366' },
            { text: 'Best investment for my brand. Trend alerts are pure gold — I always launch first.', name: 'Amara Osei', role: 'DTC Brand Founder', color: '#a855f7' },
          ].map((t) => (
            <div key={t.name} style={s.testimCard}>
              <div style={s.stars}>★★★★★</div>
              <p style={s.testimText}>"{t.text}"</p>
              <div style={s.testimAuthor}>
                <div style={{ ...s.testimAvatar, background: t.color }}>{t.name[0]}</div>
                <div>
                  <div style={s.testimName}>{t.name}</div>
                  <div style={s.testimRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <div style={s.tag}>Get Started Today</div>
        <h2 style={{ ...s.h2, marginTop: '.75rem' }}>Start Finding Winning Ads<br />in the Next 5 Minutes</h2>
        <p style={{ color: '#8888aa', margin: '.75rem 0 2rem', lineHeight: 1.6 }}>No credit card required. 7-day free trial. Cancel anytime.</p>
        <Link to="/register" style={s.btnPrimary}>🚀 Try AdVault Free</Link>
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={{ ...s.logo, fontSize: '1.2rem' }}>
              <div style={s.logoIcon}>🔍</div>
              Ad<span style={{ color: '#8b6bff' }}>Vault</span>
            </div>
            <p style={s.footerDesc}>The #1 ad intelligence platform for e-commerce marketers worldwide.</p>
          </div>
          {[
            { title: 'Product', links: ['Ad Library','Product Finder','Store Intelligence','Pricing'] },
            { title: 'Company', links: ['About','Blog','Careers','Affiliates'] },
            { title: 'Support', links: ['Help Center','Community','Tutorials','Contact'] },
          ].map(col => (
            <div key={col.title}>
              <div style={s.footerColTitle}>{col.title}</div>
              {col.links.map(l => <div key={l} style={s.footerLink}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={s.footerBottom}>
          <span>© 2026 AdVault Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={s.footerLink}>Privacy</span>
            <span style={s.footerLink}>Terms</span>
            <span style={s.footerLink}>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#08080f', color: '#f0f0f8', fontFamily: 'Inter,-apple-system,sans-serif', overflowX: 'hidden' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(1rem,4vw,3rem)', height: '64px', background: 'rgba(8,8,15,.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,.08)' },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0f8', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem' },
  navLinks: { display: 'flex', gap: '1.5rem' },
  navLink: { color: '#8888aa', fontSize: '.9rem', fontWeight: 500, textDecoration: 'none' },
  navRight: { display: 'flex', gap: '.75rem', alignItems: 'center' },
  loginBtn: { padding: '.45rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: '7px', color: '#8888aa', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' },
  signupBtn: { padding: '.45rem 1rem', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', borderRadius: '7px', color: '#fff', fontSize: '.85rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 16px rgba(108,71,255,.4)' },
  hero: { position: 'relative', padding: '140px clamp(1rem,5vw,4rem) 100px', textAlign: 'center', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', background: 'radial-gradient(ellipse,rgba(108,71,255,.18) 0%,transparent 70%)', pointerEvents: 'none' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.35rem .9rem', borderRadius: '999px', background: 'rgba(108,71,255,.12)', border: '1px solid rgba(108,71,255,.3)', fontSize: '.8rem', fontWeight: 600, color: '#8b6bff', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.03em', maxWidth: '820px', margin: '0 auto .5rem' },
  grad: { background: 'linear-gradient(90deg,#8b6bff,#ff4f87)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { fontSize: 'clamp(.95rem,2vw,1.15rem)', color: '#8888aa', maxWidth: '560px', margin: '.8rem auto 2.5rem', lineHeight: 1.7 },
  heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.85rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg,#6c47ff,#8b6bff)', color: '#fff', fontWeight: 700, fontSize: '.95rem', textDecoration: 'none', boxShadow: '0 0 24px rgba(108,71,255,.45)', border: 'none', cursor: 'pointer' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.85rem 2rem', borderRadius: '10px', background: 'transparent', color: '#8888aa', fontWeight: 600, fontSize: '.95rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer' },
  stats: { display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem,4vw,3.5rem)', flexWrap: 'wrap', marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,.08)' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800 },
  statLabel: { fontSize: '.8rem', color: '#8888aa', marginTop: '.2rem' },
  section: { padding: '80px clamp(1rem,5vw,4rem)' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  tag: { display: 'inline-block', padding: '.3rem .8rem', borderRadius: '999px', background: 'rgba(108,71,255,.1)', border: '1px solid rgba(108,71,255,.25)', fontSize: '.78rem', fontWeight: 600, color: '#8b6bff', marginBottom: '.75rem' },
  h2: { fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.2 },
  sectionSub: { color: '#8888aa', marginTop: '.6rem', fontSize: '1rem', lineHeight: 1.6 },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px,100%),1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' },
  featCard: { padding: '1.75rem', background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px' },
  featIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108,71,255,.12)', border: '1px solid rgba(108,71,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' },
  featTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem' },
  featDesc: { fontSize: '.875rem', color: '#8888aa', lineHeight: 1.65 },
  platformGrid: { display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' },
  platformChip: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.7rem 1.4rem', borderRadius: '999px', background: '#161625', border: '1px solid rgba(255,255,255,.08)', fontSize: '.9rem', fontWeight: 600 },
  dot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' },
  priceCard: { background: '#0f0f1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '2rem' },
  popularBadge: { position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#6c47ff,#ff4f87)', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '.25rem .9rem', borderRadius: '999px', whiteSpace: 'nowrap' },
  planName: { fontSize: '.9rem', fontWeight: 600, color: '#8888aa', marginBottom: '.5rem' },
  planPrice: { fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 },
  planPer: { fontSize: '1rem', fontWeight: 500, color: '#8888aa' },
  planDesc: { fontSize: '.85rem', color: '#8888aa', margin: '.5rem 0 1.5rem', lineHeight: 1.5 },
  planFeatures: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.75rem', padding: 0 },
  planFeat: { fontSize: '.85rem', color: '#8888aa' },
  testimGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' },
  testimCard: { background: '#161625', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '1.5rem' },
  stars: { color: '#f5a623', fontSize: '.85rem', marginBottom: '.75rem' },
  testimText: { fontSize: '.9rem', lineHeight: 1.65, color: '#8888aa', marginBottom: '1rem' },
  testimAuthor: { display: 'flex', alignItems: 'center', gap: '.6rem' },
  testimAvatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 700, color: '#fff', flexShrink: 0 },
  testimName: { fontSize: '.85rem', fontWeight: 600 },
  testimRole: { fontSize: '.75rem', color: '#8888aa' },
  ctaSection: { padding: '80px clamp(1rem,5vw,4rem)', textAlign: 'center', background: 'linear-gradient(135deg,rgba(108,71,255,.08),rgba(255,79,135,.06))', borderTop: '1px solid rgba(255,255,255,.06)' },
  footer: { background: '#0f0f1a', borderTop: '1px solid rgba(255,255,255,.08)', padding: '3rem clamp(1rem,5vw,4rem) 2rem' },
  footerTop: { display: 'grid', gridTemplateColumns: '2fr repeat(3,1fr)', gap: '2rem', maxWidth: '1100px', margin: '0 auto', flexWrap: 'wrap' },
  footerDesc: { fontSize: '.85rem', color: '#8888aa', marginTop: '.75rem', lineHeight: 1.65, maxWidth: '260px' },
  footerColTitle: { fontSize: '.85rem', fontWeight: 700, marginBottom: '.75rem' },
  footerLink: { fontSize: '.83rem', color: '#8888aa', marginBottom: '.45rem', cursor: 'pointer' },
  footerBottom: { maxWidth: '1100px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', fontSize: '.8rem', color: '#8888aa' },
};
