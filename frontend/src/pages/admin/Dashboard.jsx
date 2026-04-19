import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Users, Briefcase, Building2, TrendingUp, Shield } from 'lucide-react';
import { adminApi } from '../../api/index';
import { LoadingPage } from '../../components/ui/index';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(({ data: res }) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><LoadingPage /></div>;

  const stats = data?.stats || {};
  const monthlySignups = data?.monthlySignups || [];

  const lineData = {
    labels: monthlySignups.map((d) => MONTHS[(d._id.month - 1)] || ''),
    datasets: [{
      label: 'New Signups',
      data: monthlySignups.map((d) => d.count),
      borderColor: '#1558D6',
      backgroundColor: 'rgba(21,88,214,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1558D6',
    }],
  };

  const chartOptions = { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F1F5F9' } } } };

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="var(--danger)" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Panel</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Platform overview and management</p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers || 0, sub: `+${stats.newSignupsThisMonth || 0} this month`, color: '#1558D6', bg: '#EEF4FF', link: '/admin/users' },
            { icon: Briefcase, label: 'Total Jobs', value: stats.totalJobs || 0, sub: 'Active postings', color: '#7C3AED', bg: '#F5F3FF', link: '/admin/jobs' },
            { icon: Building2, label: 'Companies', value: stats.totalCompanies || 0, sub: 'Registered', color: '#16A34A', bg: '#ECFDF5', link: '/admin/companies' },
            { icon: TrendingUp, label: 'Applications', value: stats.totalApplications || 0, sub: 'All time', color: '#D97706', bg: '#FFFBEB' },
          ].map(({ icon: Icon, label, value, sub, color, bg, link }) => (
            <motion.div key={label} whileHover={{ y: -2 }} className="stat-card">
              {link ? (
                <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={color} /></div>
                  <div><div className="stat-value" style={{ fontSize: 26 }}>{value.toLocaleString()}</div><div className="stat-label">{label}</div><div style={{ fontSize: 11, color: color, marginTop: 2, fontWeight: 600 }}>{sub}</div></div>
                </Link>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={color} /></div>
                  <div><div className="stat-value" style={{ fontSize: 26 }}>{value.toLocaleString()}</div><div className="stat-label">{label}</div></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>User Signups — Last 6 Months</h2>
          <div style={{ height: 260 }}>
            {monthlySignups.length > 0 ? <Line data={lineData} options={chartOptions} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>}
          </div>
        </motion.div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { to: '/admin/users', label: 'Manage Users', desc: 'Activate or deactivate accounts', icon: Users, color: '#1558D6' },
            { to: '/admin/companies', label: 'Verify Companies', desc: 'Grant verified badges to companies', icon: Building2, color: '#16A34A' },
            { to: '/admin/jobs', label: 'Moderate Jobs', desc: 'Review and close inappropriate jobs', icon: Briefcase, color: '#7C3AED' },
          ].map(({ to, label, desc, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} className="card" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color={color} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
