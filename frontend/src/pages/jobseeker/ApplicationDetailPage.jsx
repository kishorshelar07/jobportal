import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Download, CheckCircle, Clock, Circle } from 'lucide-react';
import { jobsApi } from '../../api/index';
import { StatusBadge, JobTypeBadge, WorkModeBadge, LoadingPage } from '../../components/ui/index';
import { formatDate, formatSalary, timeAgo } from '../../utils/index';
import { STATUS_CONFIG } from '../../constants/index';

const STATUS_ORDER = ['applied', 'screening', 'interview', 'offer', 'hired'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await jobsApi.getApplication(id);
        setApp(data.data.application);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="page-container"><LoadingPage /></div>;
  if (!app) return null;

  const job = app.jobId || {};
  const company = job.companyId || {};
  const isRejected = app.status === 'rejected';
  const currentIdx = STATUS_ORDER.indexOf(app.status);

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: 800 }}>
        <Link to="/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Applications
        </Link>

        {/* Job info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
            {company.logoUrl
              ? <img src={company.logoUrl} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'contain', border: '1px solid var(--border)', padding: 4 }} />
              : <div style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={26} color="var(--primary)" /></div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{company.name}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}><MapPin size={13} />{job.location}</span>}
            {job.jobType && <JobTypeBadge type={job.jobType} />}
            {job.workMode && <WorkModeBadge mode={job.workMode} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{formatSalary(job.minSalary, job.maxSalary, job.salaryDisclosed)}</span>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Application Timeline</h2>

            {isRejected ? (
              <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #FECACA' }}>
                <p style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Application Not Selected</p>
                <p style={{ fontSize: 13, color: '#991B1B' }}>Unfortunately, this application was not moved forward. Keep applying!</p>
              </div>
            ) : null}

            {/* Progress steps */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              {STATUS_ORDER.map((status, i) => {
                const config = STATUS_CONFIG[status];
                const isDone = i <= currentIdx && !isRejected;
                const isCurrent = i === currentIdx && !isRejected;
                return (
                  <div key={status} style={{ display: 'flex', gap: 16, marginBottom: i < STATUS_ORDER.length - 1 ? 0 : 0, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDone ? config.color : 'white',
                        border: `2px solid ${isDone ? config.color : 'var(--border)'}`,
                        flexShrink: 0, zIndex: 1, transition: 'all 0.3s',
                      }}>
                        {isDone ? <CheckCircle size={16} color="white" fill="white" /> : <Circle size={16} color="var(--border)" />}
                      </div>
                      {i < STATUS_ORDER.length - 1 && (
                        <div style={{ width: 2, height: 48, background: i < currentIdx && !isRejected ? 'var(--primary)' : 'var(--border)', margin: '4px 0', transition: 'background 0.3s' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < STATUS_ORDER.length - 1 ? 36 : 0, paddingTop: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: isDone ? 'var(--text)' : 'var(--text-muted)' }}>{config.label}</p>
                      {isCurrent && (
                        <span style={{ fontSize: 11, background: config.bg, color: config.text, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Current Status</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* History entries */}
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 20 }}>Status History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(app.statusHistory || []).map((entry, i) => {
                const config = STATUS_CONFIG[entry.status];
                return (
                  <div key={i} style={{ padding: '12px 16px', borderRadius: 10, background: config?.bg || 'var(--bg)', border: `1px solid ${config?.border || 'var(--border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <StatusBadge status={entry.status} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(entry.changedAt)}</span>
                    </div>
                    {entry.note && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>{entry.note}</p>}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(entry.changedAt)}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Sidebar info */}
          <div>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Application Details</h3>
              {[
                { label: 'Applied', value: formatDate(app.appliedAt) },
                { label: 'Status', value: <StatusBadge status={app.status} /> },
                { label: 'Viewed by Recruiter', value: app.viewedByRecruiter ? '✅ Yes' : '⏳ Not yet' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </motion.div>

            {app.resumeUrl && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Submitted Resume</h3>
                <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  <Download size={16} /> Download Resume
                </a>
              </motion.div>
            )}

            {app.coverLetter && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Cover Letter</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{app.coverLetter}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
