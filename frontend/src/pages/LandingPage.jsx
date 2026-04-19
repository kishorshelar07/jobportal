import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, CheckCircle, Star, ArrowRight, Zap } from 'lucide-react';

const stats = [
  { label: 'Active Jobs', value: '50,000+', icon: Briefcase, color: '#1558D6' },
  { label: 'Companies', value: '8,000+', icon: Building2, color: '#7C3AED' },
  { label: 'Hired Monthly', value: '12,000+', icon: Users, color: '#16A34A' },
];

const howItWorks = [
  { step: '01', title: 'Create your profile', desc: 'Build a standout profile with your skills, experience, and resume. Let recruiters find you.', icon: Users },
  { step: '02', title: 'Discover opportunities', desc: 'Search and filter thousands of jobs by role, location, salary, and more to find your perfect fit.', icon: Search },
  { step: '03', title: 'Apply & get hired', desc: 'Apply with one click, track your applications, and land your dream job faster.', icon: Zap },
];

const featuredCategories = [
  { label: 'Technology', count: '12,400+ jobs', icon: '💻', color: '#EEF4FF' },
  { label: 'Finance', count: '4,200+ jobs', icon: '📊', color: '#F0FDF4' },
  { label: 'Healthcare', count: '3,800+ jobs', icon: '🏥', color: '#FDF4FF' },
  { label: 'Design', count: '2,100+ jobs', icon: '🎨', color: '#FFFBEB' },
  { label: 'Marketing', count: '3,500+ jobs', icon: '📣', color: '#FFF0F0' },
  { label: 'Education', count: '1,900+ jobs', icon: '📚', color: '#F0FDFA' },
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'Software Engineer at TechNova', text: 'Found my dream job in just 2 weeks! The skill-match feature helped me target the right roles.', avatar: '👨‍💻' },
  { name: 'Priya Patel', role: 'Product Manager at FinTech Co.', text: 'As a recruiter, JobPortal cut our hiring time by 60%. The applicant filtering is outstanding.', avatar: '👩‍💼' },
  { name: 'Rahul Kumar', role: 'Data Scientist at HealthAI', text: 'The profile completion guidance really helped me stand out. Got 3 offers in a month!', avatar: '👨‍🔬' },
];

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div style={{ paddingTop: 64 }}>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1558D6 60%, #7C3AED 100%)',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', padding: '6px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
              🚀 India's #1 Job Platform
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
              Find Your Next<br />
              <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dream Career
              </span>
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Connect with top companies, discover opportunities that match your skills, and take the next step in your career.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ background: 'white', borderRadius: 16, padding: '8px 8px 8px 20px', display: 'flex', gap: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 2, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skills, or company"
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', fontFamily: 'var(--font-body)' }}
              />
            </div>
            <div style={{ width: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or remote"
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', fontFamily: 'var(--font-body)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '12px 28px', fontSize: 15 }}>
              Search Jobs
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 16 }}
          >
            Popular: React Developer · Product Manager · Data Scientist · UI/UX Designer
          </motion.p>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 16, borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Explore by Category</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Find jobs in your preferred industry</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {featuredCategories.map(({ label, count, icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
              >
                <Link to={`/jobs?industry=${label}`} className="card" style={{ padding: '28px 20px', display: 'block', textAlign: 'center', background: color, border: 'none' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────────── */}
      <section style={{ background: 'var(--navy)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>Get Hired in 3 Steps</h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>Simple, fast, and effective</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {howItWorks.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-display)' }}>{step}</span>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color="white" />
                  </div>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: 14 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Loved by Job Seekers & Recruiters</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#F59E0B" color="#F59E0B" />)}
              <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 14 }}>4.9/5 from 12,000+ reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {testimonials.map(({ name, role, text, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={{ padding: 28 }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{avatar}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 16 }}>Ready to start your journey?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 36 }}>Join 500,000+ professionals who found their career on JobPortal</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: 'white', color: 'var(--primary)', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Get Started — Free <ArrowRight size={18} />
              </Link>
              <Link to="/jobs" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, border: '1.5px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Browse Jobs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
