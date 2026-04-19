import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Download, ChevronRight, X } from 'lucide-react';
import { recruiterApi } from '../../api/index';
import { StatusBadge, Avatar, SkillMatchChip, EmptyState, LoadingPage } from '../../components/ui/index';
import { timeAgo, formatDate } from '../../utils/index';
import { STATUS_CONFIG } from '../../constants/index';

const STATUS_OPTIONS = ['screening', 'interview', 'offer', 'rejected', 'hired'];

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await recruiterApi.getApplicants(jobId, params);
      setApplicants(data.data.applicants);
      setJob(data.data.job);
    } catch { toast.error('Failed to load applicants'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await recruiterApi.updateStatus(appId, { status: newStatus, note });
      toast.success(`Status updated to "${newStatus}"`);
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a));
      if (selected?._id === appId) setSelected((s) => ({ ...s, status: newStatus }));
      setNote('');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return <div className="page-container"><LoadingPage /></div>;

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Jobs
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{job?.title} — Applicants</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'applied', ...STATUS_OPTIONS].map((s) => {
            const config = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '6px 14px', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-body)', background: statusFilter === s ? (config?.color || 'var(--primary)') : 'white', color: statusFilter === s ? 'white' : 'var(--text-secondary)', border: `1.5px solid ${statusFilter === s ? (config?.color || 'var(--primary)') : 'var(--border)'}` }}>
                {s === 'all' ? 'All' : config?.label || s}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20, alignItems: 'start' }}>
          {/* List */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {applicants.length === 0 ? (
              <EmptyState icon={() => '👥'} title="No applicants" text="No one has applied to this job yet." />
            ) : (
              <div>
                {applicants.map((app, i) => (
                  <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(app)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?._id === app._id ? 'var(--primary-light)' : 'white', transition: 'background var(--transition)' }}
                    onMouseEnter={e => { if (selected?._id !== app._id) e.currentTarget.style.background = '#FAFAFA'; }}
                    onMouseLeave={e => { if (selected?._id !== app._id) e.currentTarget.style.background = 'white'; }}
                  >
                    <Avatar name={app.jobSeekerId?.name} src={app.jobSeekerId?.profilePicture} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{app.jobSeekerId?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.profile?.headline || app.jobSeekerId?.email}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {app.profile?.experienceYears > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.profile.experienceYears} yrs exp</span>}
                        {app.skillMatch > 0 && <SkillMatchChip percent={app.skillMatch} />}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge status={app.status} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(app.appliedAt)}</span>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="card" style={{ padding: 24, position: 'sticky', top: 84 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Applicant Profile</h3>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                </div>

                {/* Profile header */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <Avatar name={selected.jobSeekerId?.name} src={selected.jobSeekerId?.profilePicture} size={56} />
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16 }}>{selected.jobSeekerId?.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.profile?.headline}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.jobSeekerId?.email}</p>
                  </div>
                </div>

                {/* Profile details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, padding: '14px 16px', background: 'var(--bg)', borderRadius: 10 }}>
                  {[
                    ['Experience', `${selected.profile?.experienceYears || 0} years`],
                    ['Location', selected.profile?.location || '—'],
                    ['Applied', timeAgo(selected.appliedAt)],
                    ['Skill Match', selected.skillMatch ? `${selected.skillMatch}%` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {selected.profile?.skills?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.profile.skills.slice(0, 8).map((s) => (
                        <span key={s.name} style={{ padding: '3px 10px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover letter */}
                {selected.coverLetter && (
                  <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Cover Letter</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.coverLetter}</p>
                  </div>
                )}

                {/* Resume */}
                {selected.resumeUrl && (
                  <a href={selected.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
                    <Download size={14} /> Download Resume
                  </a>
                )}

                {/* Status update */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    Update Status <StatusBadge status={selected.status} />
                  </p>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note to candidate..." className="form-textarea"
                    style={{ minHeight: 60, marginBottom: 10 }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STATUS_OPTIONS.filter((s) => s !== selected.status).map((s) => {
                      const config = STATUS_CONFIG[s];
                      return (
                        <button key={s} onClick={() => handleStatusChange(selected._id, s)}
                          disabled={updatingId === selected._id}
                          style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${config.border}`, background: config.bg, color: config.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
