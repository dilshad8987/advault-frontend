import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    num: 'Section 1', title: 'Consent',
    content: ['By using AdVault, you agree to this Privacy Policy and its terms.'],
  },
  {
    num: 'Section 2', title: 'Hosting & Data Storage',
    content: ['AdVault is hosted on secure cloud infrastructure. Your information is stored using industry-standard security measures to help protect it from unauthorized access.'],
  },
  {
    num: 'Section 3', title: 'Information We Collect',
    content: [
      'When you create an account, subscribe to a plan, or contact us, we may collect information such as your name, email address, business information, billing details, and any other information you choose to provide.',
      'We also collect limited technical information, including your IP address, browser, device information, pages visited, login activity, and usage data to improve our Services and maintain platform security.',
      'If you sign in with Google, we receive only the information you choose to share with us. We never receive or store your Google password.',
      'Payments are securely processed by our payment partners. AdVault does not store your complete payment card details or banking credentials.',
    ],
  },
  {
    num: 'Section 4', title: 'Use of Information',
    content: ['We use your information to provide and improve our Services, manage your account, process subscriptions, respond to support requests, personalize your experience, maintain platform security, and communicate important service-related updates.'],
  },
  {
    num: 'Section 5', title: 'Cookies',
    content: ['AdVault uses cookies and similar technologies to keep you signed in, remember your preferences, improve performance, and enhance your experience.'],
  },
  {
    num: 'Section 6', title: 'Information Sharing',
    content: [
      'We do not sell your personal information.',
      'We may share your information with trusted service providers who help us operate AdVault or when required by law.',
    ],
  },
  {
    num: 'Section 7', title: 'Data Retention',
    content: ['We retain your personal information for as long as your account remains active or as needed to provide our Services. If you close your account, we will delete your personal data within 30 days, unless we are required to retain it for legal or compliance purposes.'],
  },
  {
    num: 'Section 8', title: 'Your Rights',
    content: ['You have the right to access, correct, or delete the personal information we hold about you. You may also request that we restrict or stop processing your data. To exercise any of these rights, please contact us at support@advault.in and we will respond within 30 days.'],
  },
  {
    num: 'Section 9', title: 'Third-Party Services',
    content: ['Our Services may contain links to third-party websites or integrate with third-party providers. We are not responsible for their privacy practices and encourage you to review their privacy policies.'],
  },
  {
    num: 'Section 10', title: 'Changes to This Privacy Policy',
    content: ['We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated revision date.'],
  },
  {
    num: 'Section 11', title: 'Contact Us',
    content: ['If you have any questions about this Privacy Policy, please contact us at support@advault.in.'],
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <Link to="/" style={s.logo}>
          <div style={s.logoIcon}>🔍</div>
          Ad<span style={{ color: '#8b6bff' }}>Vault</span>
        </Link>
        <div style={s.navTag}>Privacy Policy</div>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroGlow} />
        <div style={s.badge}>Legal</div>
        <h1 style={s.h1}>Privacy Policy</h1>
        <div style={s.meta}>Last Updated: June 29, 2026 · advault.in</div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        <div style={s.intro}>
          <p style={s.introP}>At AdVault, protecting your privacy is one of our top priorities. This Privacy Policy explains what information we collect, how we use it, share it, and protect it when you use our website and Services.</p>
          <p style={{ ...s.introP, marginBottom: 0 }}>This Privacy Policy applies only to our online Services and the information you choose to share with us or that we collect while you use AdVault. It does not apply to information collected offline or through third-party websites or services.</p>
        </div>

        {sections.map((sec) => (
          <div key={sec.num} style={s.section}>
            <div style={s.secNum}>{sec.num}</div>
            <h2 style={s.secTitle}>{sec.title}</h2>
            {sec.content.map((p, i) => (
              <p key={i} style={{ ...s.secText, marginTop: i > 0 ? '8px' : 0 }}>{p}</p>
            ))}
          </div>
        ))}

      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <Link to="/" style={s.footerLogo}>
          Ad<span style={{ color: '#6c47ff' }}>Vault</span>
        </Link>
        <p style={s.footerMeta}>© 2026 AdVault. All rights reserved. · <a href="mailto:support@advault.in" style={s.footerLink}>support@advault.in</a></p>
      </footer>

    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0d0d16', color: '#9090b0', fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif', fontSize: '15px', lineHeight: 1.8 },

  nav: { background: 'rgba(13,13,22,.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.1rem', color: '#f0f0f8', textDecoration: 'none' },
  logoIcon: { width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#6c47ff,#ff4f87)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem' },
  navTag: { fontSize: '11px', fontWeight: 600, color: '#a78bff', background: 'rgba(108,71,255,.12)', border: '1px solid rgba(108,71,255,.2)', borderRadius: '100px', padding: '4px 12px', letterSpacing: '.5px', textTransform: 'uppercase' },

  hero: { padding: '72px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(108,71,255,.15) 0%,transparent 70%)', pointerEvents: 'none' },
  badge: { display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#a78bff', background: 'rgba(108,71,255,.1)', border: '1px solid rgba(108,71,255,.2)', borderRadius: '100px', padding: '4px 14px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '18px' },
  h1: { fontSize: '36px', fontWeight: 700, color: '#fff', letterSpacing: '-.4px', marginBottom: '10px' },
  meta: { fontSize: '13px', color: '#44445a' },

  content: { maxWidth: '740px', margin: '0 auto 80px', padding: '0 24px' },

  intro: { background: 'rgba(108,71,255,.06)', border: '1px solid rgba(108,71,255,.12)', borderRadius: '10px', padding: '22px 26px', marginBottom: '32px' },
  introP: { color: '#8080a8', marginBottom: '8px' },

  section: { borderTop: '1px solid rgba(255,255,255,.05)', padding: '24px 0' },
  secNum: { fontSize: '10px', fontWeight: 700, color: '#6c47ff', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' },
  secTitle: { fontSize: '15px', fontWeight: 700, color: '#e0e0f0', marginBottom: '10px' },
  secText: { color: '#6e6e90' },

  footer: { borderTop: '1px solid rgba(255,255,255,.05)', padding: '28px 24px', textAlign: 'center' },
  footerLogo: { fontSize: '15px', fontWeight: 700, color: '#fff', textDecoration: 'none', display: 'block', marginBottom: '6px' },
  footerMeta: { fontSize: '12px', color: '#3a3a55' },
  footerLink: { color: '#6c47ff', textDecoration: 'none' },
};
