import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  FileText, Briefcase, Star, TrendingUp, ArrowRight,
  CheckCircle, Clock, AlertCircle, MapPin, Building2,
} from 'lucide-react';
import { jobsApi } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge, SkeletonCard, LoadingPage } from '../../components/ui/index';
import ProfileCompletionRing from '../../components/profile/CompletionRing';
import { formatDate, timeAgo, formatSalary } from '../../utils/index';
import { STATUS_CONFIG } from '../../constants/index';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatCard = ({ icon: Icon, label, value, color, bg, link }) => (
  <motion.div whileHover={{ y: -2 }} className="stat-card" style={{ cursor: link ? 'pointer' : 'default' }}>
    {link ? (
      <Link to={link} style={{ display: 'contents', textDecoration: 'none' }}>
        <StatCardInner Icon={Icon} label={label} value={value} color={color} bg={bg} />
      </Link>
    ) : (
      <StatCardInner Icon={Icon} label={label} value={value} color={color} bg={bg} />
    )}
  </motion.div>
);

const StatCardInner = ({ Icon, label, value, color, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div className="stat-value" style={{ fontSize: 28 }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await jobsApi.getDashboard();
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page-container"><div className="page-content"><LoadingPage /></div></div>;

  const stats = data?.stats || {};
  const profile = data?.profile || {};
  const recentApps = data?.recentApplications || [];
  const recommendedJobs = data?.recommendedJobs || [];

  const donutData = {
    labels: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
    datasets: [{
      data: [stats.applied || 0, stats.screening || 0, stats.interview || 0, stats.offer || 0, stats.rejected || 0],
      backgroundColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const donutOptions = {
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12, family: 'Inter' } } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0]}! 👋`}
            subtitle="Here's what's happening with your job search today."
          />
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}
        >
          <StatCard icon={FileText} label="Total Applied" value={stats.total || 0} color="#1558D6" bg="#EEF4FF" link="/applications" />
          <StatCard icon={Clock} label="Under Review" value={(stats.applied || 0) + (stats.screening || 0)} color="#D97706" bg="#FFFBEB" link="/applications?status=screening" />
          <StatCard icon={AlertCircle} label="Interviews" value={stats.interview || 0} color="#8B5CF6" bg="#F5F3FF" link="/applications?status=interview" />
          <StatCard icon={Star} label="Offers" value={stats.offer || 0} color="#16A34A" bg="#ECFDF5" link="/applications?status=offer" />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 32 }}>
          {/* Applications Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: 28 }}>
            <div className="section-header">
              <h2 className="section-title">Applications by Status</h2>
              <Link to="/applications" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {stats.total === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600 }}>No applications yet</p>
                <p style={{ fontSize: 13 }}>Start applying to track your progress here</p>
                <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Browse Jobs</Link>
              </div>
            ) : (
              <div style={{ height: 280 }}>
                <Doughnut data={donutData} options={donutOptions} />
              </div>
            )}
          </motion.div>

          {/* Profile Completion */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 28 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>Profile Strength</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <ProfileCompletionRing percent={profile.completion || 0} size={120} strokeWidth={10} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {profile.completion >= 80 ? 'Strong Profile!' : profile.completion >= 50 ? 'Good Progress' : 'Needs Attention'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {profile.completion >= 80
                    ? 'Your profile stands out to recruiters.'
                    : 'Complete your profile to get more visibility.'}
                </p>
              </div>

              {profile.completion < 100 && (
                <div style={{ width: '100%' }}>
                  {[
                    { label: 'Add a headline', done: !!profile.headline },
                    { label: 'Upload resume', done: profile.completion >= 40 },
                    { label: 'Add skills', done: (profile.skillsCount || 0) > 0 },
                  ].map(({ label, done }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <CheckCircle size={14} color={done ? 'var(--success)' : 'var(--text-muted)'} fill={done ? 'var(--success)' : 'none'} />
                      <span style={{ fontSize: 13, color: done ? 'var(--text-secondary)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                    </div>
                  ))}
                  <Link to="/profile" className="btn btn-outline" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 28, marginBottom: 32 }}>
          <div className="section-header">
            <h2 className="section-title">Recent Applications</h2>
            <Link to="/applications" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p>No applications yet. <Link to="/jobs" style={{ color: 'var(--primary)' }}>Find your first job →</Link></p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Job Title', 'Company', 'Status', 'Applied', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0 12px 12px 0', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app) => (
                    <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 12px 14px 0' }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{app.jobId?.title || '—'}</p>
                      </td>
                      <td style={{ padding: '14px 12px 14px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {app.jobId?.companyId?.logoUrl
                            ? <img src={app.jobId.companyId.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--border)' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={14} color="var(--primary)" /></div>
                          }
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.jobId?.companyId?.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px 14px 0' }}>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ padding: '14px 12px 14px 0', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(app.appliedAt)}
                      </td>
                      <td style={{ padding: '14px 0' }}>
                        <Link to={`/applications/${app._id}`} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Recommended Jobs */}
        {recommendedJobs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="section-header">
              <h2 className="section-title">Recommended for You</h2>
              <Link to="/jobs" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Browse all <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {recommendedJobs.map((job) => (
                <motion.div key={job._id} whileHover={{ y: -2 }} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    {job.companyId?.logoUrl
                      ? <img src={job.companyId.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)', padding: 2 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={18} color="var(--primary)" /></div>
                    }
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{job.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.companyId?.name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <MapPin size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.location || 'Remote'}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
                    {formatSalary(job.minSalary, job.maxSalary, job.salaryDisclosed)}
                  </p>
                  <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View Job
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
