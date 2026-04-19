import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, ArrowRight, Building2 } from 'lucide-react';
import { recruiterApi } from '../../api/index';
import { PageHeader, StatusBadge, Avatar, LoadingPage } from '../../components/ui/index';
import { timeAgo } from '../../utils/index';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await recruiterApi.getDashboard();
        setData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="page-container"><LoadingPage /></div>;

  const stats = data?.stats || {};
  const topJobs = data?.topJobs || [];
  const recentApplicants = data?.recentApplicants || [];
  const weeklyApps = data?.weeklyApplications || [];

  const barData = {
    labels: weeklyApps.map((d) => DAYS[(d._id - 1) % 7] || ''),
    datasets: [{
      label: 'Applications',
      data: weeklyApps.map((d) => d.count),
      backgroundColor: '#1558D620',
      borderColor: '#1558D6',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const pieData = {
    labels: ['Active', 'Closed', 'Draft'],
    datasets: [{
      data: [stats.activeJobs || 0, stats.closedJobs || 0, stats.draftJobs || 0],
      backgroundColor: ['#16A34A', '#DC2626', '#D97706'],
      borderWidth: 0,
    }],
  };

  const chartOptions = { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F1F5F9' }, ticks: { stepSize: 1 } } } };

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Recruiter Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          <Link to="/recruiter/post-job" className="btn btn-primary">
            <Plus size={16} /> Post a Job
          </Link>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: Briefcase, label: 'Total Jobs', value: stats.totalJobs || 0, color: '#1558D6', bg: '#EEF4FF', link: '/recruiter/jobs' },
            { icon: Users, label: 'Total Applications', value: stats.totalApplications || 0, color: '#7C3AED', bg: '#F5F3FF' },
            { icon: TrendingUp, label: 'Active Jobs', value: stats.activeJobs || 0, color: '#16A34A', bg: '#ECFDF5', link: '/recruiter/jobs?status=active' },
            { icon: CheckCircle, label: 'Hired', value: stats.hiredCount || 0, color: '#059669', bg: '#D1FAE5' },
          ].map(({ icon: Icon, label, value, color, bg, link }) => (
            <motion.div key={label} whileHover={{ y: -2 }} className="stat-card">
              {link ? (
                <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div><div className="stat-value" style={{ fontSize: 26 }}>{value}</div><div className="stat-label">{label}</div></div>
                </Link>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div><div className="stat-value" style={{ fontSize: 26 }}>{value}</div><div className="stat-label">{label}</div></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 28 }}>
          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>Applications This Week</h2>
            <div style={{ height: 240 }}>
              {weeklyApps.length > 0
                ? <Bar data={barData} options={chartOptions} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No applications this week</div>
              }
            </div>
          </motion.div>

          {/* Pie chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card" style={{ padding: 28 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>Jobs by Status</h2>
            <div style={{ height: 180 }}>
              <Doughnut data={pieData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } } }, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Top jobs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 28 }}>
            <div className="section-header">
              <h2 className="section-title">Top Jobs by Applications</h2>
              <Link to="/recruiter/jobs" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all</Link>
            </div>
            {topJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>No jobs posted yet.<br /><Link to="/recruiter/post-job" style={{ color: 'var(--primary)' }}>Post your first job →</Link></div>
            ) : topJobs.map((j, i) => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topJobs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{j.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.views} views</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{j.count}</span>
              </div>
            ))}
          </motion.div>

          {/* Recent applicants */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: 28 }}>
            <div className="section-header">
              <h2 className="section-title">Recent Applicants</h2>
            </div>
            {recentApplicants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>No applications yet</div>
            ) : recentApplicants.map((app) => (
              <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <Avatar name={app.jobSeekerId?.name} src={app.jobSeekerId?.profilePicture} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.jobSeekerId?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.jobId?.title}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <StatusBadge status={app.status} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(app.appliedAt)}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
