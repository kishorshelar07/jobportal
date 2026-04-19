import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FileText, Building2, ChevronRight, AlertTriangle } from 'lucide-react';
import { jobsApi } from '../../api/index';
import { PageHeader, StatusBadge, EmptyState, SkeletonCard, ConfirmModal } from '../../components/ui/index';
import { formatDate, timeAgo } from '../../utils/index';
import { STATUS_CONFIG } from '../../constants/index';

const STATUS_TABS = ['all', 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = activeTab !== 'all' ? { status: activeTab } : {};
        const { data } = await jobsApi.getMyApplications(params);
        setApps(data.data.applications);
      } catch { toast.error('Failed to load applications'); }
      finally { setLoading(false); }
    };
    load();
  }, [activeTab]);

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      await jobsApi.withdraw(withdrawId);
      toast.success('Application withdrawn');
      setApps((prev) => prev.filter((a) => a._id !== withdrawId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawLoading(false);
      setWithdrawId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader title="My Applications" subtitle="Track and manage all your job applications" />

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
          {STATUS_TABS.map((tab) => {
            const config = STATUS_CONFIG[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', borderRadius: 99, cursor: 'pointer',
                  fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
                  background: activeTab === tab ? (config?.color || 'var(--primary)') : 'white',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${activeTab === tab ? (config?.color || 'var(--primary)') : 'var(--border)'}`,
                  transition: 'all var(--transition)',
                }}>
                {tab === 'all' ? 'All Applications' : config?.label || tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 12 }}>{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : apps.length === 0 ? (
          <EmptyState icon={FileText} title="No applications found"
            text={activeTab === 'all' ? "You haven't applied to any jobs yet." : `No applications with "${activeTab}" status.`}
            action={activeTab !== 'all' ? () => setActiveTab('all') : undefined}
            actionLabel="View all applications" />
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    {['Job Title', 'Company', 'Status', 'Applied', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, i) => (
                    <motion.tr key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{app.jobId?.title || '—'}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {app.jobId?.workMode} • {app.jobId?.jobType?.replace('-', ' ')}
                        </p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {app.jobId?.companyId?.logoUrl
                            ? <img src={app.jobId.companyId.logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)' }} />
                            : <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={14} color="var(--primary)" /></div>
                          }
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{app.jobId?.companyId?.name || '—'}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.jobId?.location}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}><StatusBadge status={app.status} /></td>
                      <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(app.appliedAt)}
                        <br />
                        <span style={{ fontSize: 11 }}>{formatDate(app.appliedAt)}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/applications/${app._id}`} className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                            View <ChevronRight size={14} />
                          </Link>
                          {app.status === 'applied' && (
                            <button onClick={() => setWithdrawId(app._id)} className="btn btn-sm"
                              style={{ background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--danger)', whiteSpace: 'nowrap' }}>
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!withdrawId}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawId(null)}
        loading={withdrawLoading}
        confirmText="Withdraw"
      />
    </div>
  );
}
