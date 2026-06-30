import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    num: 'Section 1', title: 'Acceptance of Terms',
    content: [
      'By accessing or using AdVault ("Service," "Platform," "we," "us"), you agree to be legally bound by these Terms of Service. If you do not agree, do not use the Service.',
      'These Terms apply to all users including visitors, registered accounts, and paying subscribers. Using AdVault on behalf of a company means you represent that you have authority to bind that company to these Terms.',
    ],
  },
  {
    num: 'Section 2', title: 'Eligibility & Account',
    content: [
      'By registering, you confirm that all information you provide is accurate and up-to-date, and that you have the legal capacity to enter into a binding agreement with AdVault.',
      'You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. AdVault accounts are non-transferable — you may not share, sell, or sublicense access to any third party.',
      'If you suspect unauthorized use of your account, notify us immediately at support@advault.in.',
    ],
  },
  {
    num: 'Section 3', title: 'License & Permitted Use',
    content: [
      'When you use the Services provided by AdVault, unless otherwise agreed, AdVault hereby grants you a limited, non-transferable, non-sub-licensable, revocable license to use the software, platform, and reports included in the Services for your own internal business or research purposes, subject to these Terms.',
    ],
  },
  {
    num: 'Section 4', title: 'Prohibited Conduct',
    content: [
      'When you use AdVault, you may not transfer, sell, rent, or sublicense the service or any part of the software, platform, or data contained therein, nor modify, edit, or create derivative works from any reports or materials you access. Scraping, crawling, or bulk-downloading data through automated tools is not permitted, and you may not transfer data to others or "mirror" it on any other server. You also may not reverse engineer or otherwise attempt to extract the source code of any software on the platform, remove or alter copyright and other proprietary markings from materials, or use AdVault to build a competing product or service. Circumventing account limits, paywalls, or access controls, and uploading or transmitting malicious code, viruses, or otherwise harmful content, are likewise prohibited.',
      'As a condition of using AdVault, you agree that your use will comply with applicable laws and regulations and will not involve any infringing, illegal, or criminal activity, nor assist others in such activity. You agree to indemnify and hold AdVault, its team, and affiliates harmless from any claims, damages, losses, or expenses (including legal fees) arising out of your use of the Service, your violation of these Terms, or your violation of any third-party right. Violation of these rules may result in immediate account suspension without refund.',
    ],
  },
  {
    num: 'Section 5', title: 'Data & Privacy',
    content: [
      'Your use of AdVault is subject to our Privacy Policy, which is incorporated into these Terms by reference. We collect and process data as described therein.',
      'Ad creatives and metadata displayed on AdVault are sourced from public advertising libraries. AdVault does not claim ownership of third-party ad content. All rights remain with the respective advertisers and platforms.',
    ],
  },
  {
    num: 'Section 6', title: 'Subscriptions & Billing',
    content: [
      'AdVault offers free and paid subscription plans, billed on a monthly or annual basis depending on your selection at checkout. Subscriptions automatically renew unless cancelled before the renewal date, and all payments are processed securely and are non-refundable except where required by law. Plan downgrades take effect at the start of the next billing cycle, and AdVault reserves the right to modify pricing at any time, with reasonable advance notice provided where possible.',
      'Credits allocated under your subscription must be used within the same monthly billing cycle. Unused credits do not roll over and are forfeited at the end of each cycle, with no exceptions or extensions. If a payment fails, access to paid features may be restricted until the outstanding balance is resolved, and AdVault is not required to refund any membership fee already charged.',
    ],
  },
  {
    num: 'Section 7', title: 'Intellectual Property',
    content: [
      'All AdVault software, UI design, logos, trademarks, and proprietary data are the exclusive property of AdVault and protected by applicable intellectual property law. Nothing in these Terms transfers any ownership rights to you.',
      'Any feedback, suggestions, or ideas you submit to AdVault may be used by us freely without compensation or attribution.',
    ],
  },
  {
    num: 'Section 8', title: 'Disclaimers',
    content: [
      'AdVault is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or that ad data will be complete, accurate, or current.',
      'AdVault is a research and intelligence tool. Decisions made based on data from AdVault are solely your responsibility. We are not liable for business outcomes resulting from your use of the platform.',
    ],
  },
  {
    num: 'Section 9', title: 'Limitation of Liability',
    content: [
      'To the maximum extent permitted by law, AdVault and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including lost profits, data loss, or business interruption — arising out of or related to your use of the Service.',
      'Our total liability to you for any claim shall not exceed the amount you paid to AdVault in the three (3) months preceding the event giving rise to the claim.',
    ],
  },
  {
    num: 'Section 10', title: 'Termination',
    content: [
      'You may cancel your account at any time from your account settings. AdVault reserves the right to suspend or terminate your account — without prior notice — if you breach these Terms or engage in conduct we determine to be harmful to the platform or other users.',
      'Upon termination, your right to access AdVault ceases immediately. Provisions of these Terms that by their nature should survive (including IP rights, disclaimers, and liability limits) will remain in effect.',
    ],
  },
  {
    num: 'Section 11', title: 'Force Majeure',
    content: [
      'AdVault will not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to hacker attacks, computer virus intrusion, denial-of-service events, internet or hosting infrastructure outages, third-party platform changes, government action, or other force majeure events affecting the normal operation of the Service. If the Service must be suspended for scheduled maintenance or upgrades, we will provide advance notice where reasonably possible.',
    ],
  },
  {
    num: 'Section 12', title: 'Governing Law & Dispute Resolution',
    content: [
      'These Terms are governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. Any dispute, controversy, or claim arising out of or relating to these Terms or your use of AdVault shall be subject to the exclusive jurisdiction of the courts located in India, and you consent to personal jurisdiction in such courts.',
    ],
  },
  {
    num: 'Section 13', title: 'Severability & Entire Agreement',
    content: [
      'If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.',
      'These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and AdVault regarding the Service, and supersede any prior agreements or understandings, whether written or oral, relating to the same subject matter.',
    ],
  },
  {
    num: 'Section 14', title: 'Changes to Terms',
    content: [
      'We may update these Terms at any time. When we do, we\'ll revise the "Last Updated" date above and notify active subscribers via email or in-app notice. Continued use of AdVault after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    num: 'Section 15', title: 'Contact Us',
    content: [
      'If you have any questions about these Terms of Service, please contact us at support@advault.in.',
    ],
  },
];

export default function TermsOfService() {
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
        <div style={s.navTag}>Terms of Service</div>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroGlow} />
        <div style={s.badge}>Legal</div>
        <h1 style={s.h1}>Terms of Service</h1>
        <div style={s.meta}>Last Updated: June 29, 2026 · advault.in</div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        <div style={s.intro}>
          <p style={s.introP}>Welcome to AdVault. These Terms of Service govern your access to and use of our website, platform, and Services. Please read them carefully before using AdVault.</p>
          <p style={{ ...s.introP, marginBottom: 0 }}>By accessing or using the Service in any way — browsing, registering, or subscribing — you agree to be bound by these Terms and our Privacy Policy.</p>
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
