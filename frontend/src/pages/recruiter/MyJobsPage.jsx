import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Eye, Pencil, Copy, Trash2, Users, MoreVertical, Building2 } from 'lucide-react';
import { recruiterApi } from '../../api/index';
import { PageHeader, StatusBadge, EmptyState, ConfirmModal, LoadingPage } from '../../components/ui/index';
import { formatDate, timeAgo } from '../../utils/index';

export function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await recruiterApi.getMyJobs(params);
      setJobs(data.data.jobs);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDuplicate = async (id) => {
    try {
      await recruiterApi.duplicateJob(id);
      toast.success('Job duplicated as draft');
      load();
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleStatusToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await recruiterApi.updateJob(job._id, { status: newStatus });
      toast.success(`Job ${newStatus === 'active' ? 'reopened' : 'closed'}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await recruiterApi.deleteJob(deleteId);
      toast.success('Job deleted');
      setJobs((prev) => prev.filter((j) => j._id !== deleteId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete job with applications');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const statusColors = { active: 'var(--success)', closed: 'var(--danger)', draft: '#D97706' };
  const statusBgs = { active: '#ECFDF5', closed: '#FEF2F2', draft: '#FFFBEB' };

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader
          title="My Job Postings"
          subtitle={`${jobs.length} job${jobs.length !== 1 ? 's' : ''} posted`}
          action={<Link to="/recruiter/post-job" className="btn btn-primary"><Plus size={16} /> Post a Job</Link>}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'active', 'closed', 'draft'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '7px 16px', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-body)', background: filter === s ? 'var(--primary)' : 'white', color: filter === s ? 'white' : 'var(--text-secondary)', border: `1.5px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}` }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <LoadingPage /> : jobs.length === 0 ? (
          <EmptyState icon={Building2} title="No jobs yet" text="Post your first job to start receiving applications."
            action={() => navigate('/recruiter/post-job')} actionLabel="Post a Job" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map((job, i) => (
              <motion.div key={job._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</h3>
                      <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: statusBgs[job.status], color: statusColors[job.status] }}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📋 {job.applicationsCount || 0} applications</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👁 {job.viewsCount || 0} views</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {job.location || 'Remote'}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Posted {timeAgo(job.createdAt)}</span>
                      {job.deadline && <span style={{ fontSize: 13, color: new Date() > new Date(job.deadline) ? 'var(--danger)' : 'var(--text-muted)' }}>⏰ Closes {formatDate(job.deadline)}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-ghost btn-sm">
                      <Users size={14} /> Applicants ({job.applicationsCount || 0})
                    </Link>
                    <Link to={`/recruiter/post-job/${job._id}`} className="btn btn-ghost btn-sm"><Pencil size={14} /> Edit</Link>
                    <button onClick={() => handleDuplicate(job._id)} className="btn btn-ghost btn-sm"><Copy size={14} /></button>
                    <button onClick={() => handleStatusToggle(job)} className={`btn btn-sm ${job.status === 'active' ? '' : 'btn-primary'}`}
                      style={job.status === 'active' ? { background: '#FEF2F2', color: 'var(--danger)', border: '1px solid #FECACA' } : {}}>
                      {job.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                    <button onClick={() => setDeleteId(job._id)} className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Delete Job" message="Are you sure you want to delete this job? This cannot be undone. Jobs with applications cannot be deleted."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleteLoading} confirmText="Delete" />
    </div>
  );
}

export function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterApi.getCompany().then(({ data }) => {
      setCompany(data.data.company);
      setForm(data.data.company);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await recruiterApi.updateCompany(form);
      setCompany(data.data.company);
      setEditing(false);
      toast.success('Company profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-container"><LoadingPage /></div>;

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: 700 }}>
        <PageHeader title="Company Profile"
          action={<button onClick={() => setEditing(!editing)} className={`btn ${editing ? 'btn-ghost' : 'btn-outline'}`}>{editing ? 'Cancel' : <><Pencil size={14} /> Edit Profile</>}</button>} />

        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28 }}>
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', border: '1px solid var(--border)', padding: 4 }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={36} color="var(--primary)" /></div>
            )}
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{company?.name}</h2>
              {company?.isVerified && <span style={{ background: '#ECFDF5', color: '#065F46', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>✓ Verified Company</span>}
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{company?.industry} • {company?.size} employees</p>
            </div>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['name', 'Company Name'], ['website', 'Website'], ['location', 'Location']].map(([key, label]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="form-input" />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="form-select">
                    {['Technology','Finance','Healthcare','Education','E-Commerce','Manufacturing','Consulting','Media & Entertainment','Real Estate','Logistics','Other'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select value={form.size || ''} onChange={(e) => setForm({ ...form, size: e.target.value })} className="form-select">
                    {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">About Company</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-textarea" style={{ minHeight: 120 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          ) : (
            <div>
              {company?.description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>{company.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Location', company?.location || '—'],
                  ['Website', company?.website || '—'],
                  ['Industry', company?.industry || '—'],
                  ['Size', company?.size ? `${company.size} employees` : '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJobsPage;
