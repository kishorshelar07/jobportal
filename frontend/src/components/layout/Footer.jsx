import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: 'white', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>J</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>JobPortal</span>
            </div>
            <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>Connecting India's top talent with the best opportunities. Build your career with confidence.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <button key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8'; }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {[
            { title: 'For Job Seekers', links: [['Find Jobs', '/jobs'], ['Create Profile', '/register'], ['Saved Jobs', '/saved-jobs'], ['Applications', '/applications']] },
            { title: 'For Employers', links: [['Post a Job', '/recruiter/post-job'], ['Browse Talent', '/recruiter'], ['Company Profile', '/recruiter/company'], ['Dashboard', '/recruiter']] },
            { title: 'Company', links: [['About Us', '/'], ['Blog', '/'], ['Careers', '/'], ['Contact', '/']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'white' }}>{title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(([label, to]) => (
                  <Link key={label} to={to} style={{ fontSize: 14, color: '#94A3B8', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#64748B' }}>© 2024 JobPortal. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
              <Link key={label} to="/" style={{ fontSize: 13, color: '#64748B', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#94A3B8'}
                onMouseLeave={e => e.target.style.color = '#64748B'}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
