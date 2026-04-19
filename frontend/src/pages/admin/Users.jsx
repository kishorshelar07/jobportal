import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Search, CheckCircle, XCircle, Shield, Building2, Briefcase } from 'lucide-react';
import { adminApi } from '../../api/index';
import { PageHeader, Avatar, StatusBadge, LoadingPage } from '../../components/ui/index';
import { formatDate, timeAgo } from '../../utils/index';

// ─── Users Page ─────────────────────────────────────
export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers({ search, role });
      setUsers(data.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, search ? 400 : 0); return () => clearTimeout(t); }, [search, role]);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggleUserActive(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.data.user.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader title="Users Management" subtitle={`${users.length} users`} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input" style={{ paddingLeft: 38 }} />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select" style={{ width: 'auto' }}>
            <option value="">All Roles</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="recruiter">Recruiters</option>
          </select>
        </div>

        {loading ? <LoadingPage /> : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  {['User', 'Role', 'Joined', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} src={u.profilePicture} size={36} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'capitalize', background: u.role === 'recruiter' ? '#F5F3FF' : '#EEF4FF', color: u.role === 'recruiter' ? '#6D28D9' : '#1558D6' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: u.isActive ? 'var(--success)' : 'var(--danger)' }}>
                        {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleToggle(u._id)}
                        className="btn btn-sm"
                        style={{ background: u.isActive ? '#FEF2F2' : '#ECFDF5', color: u.isActive ? 'var(--danger)' : 'var(--success)', border: 'none' }}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Companies Page ─────────────────────────────────
export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getCompanies({ search });
      setCompanies(data.data.companies);
    } catch { toast.error('Failed to load companies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, search ? 400 : 0); return () => clearTimeout(t); }, [search]);

  const handleVerify = async (id) => {
    try {
      const { data } = await adminApi.verifyCompany(id);
      setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, isVerified: data.data.company.isVerified } : c));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader title="Companies Management" subtitle={`${companies.length} companies`} />
        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="form-input" style={{ paddingLeft: 38 }} />
        </div>

        {loading ? <LoadingPage /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companies.map((c) => (
              <div key={c._id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                {c.logoUrl ? <img src={c.logoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'contain', border: '1px solid var(--border)' }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} color="var(--primary)" /></div>}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</p>
                    {c.isVerified && <span style={{ background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>✓ Verified</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.industry} • {c.size} employees • {c.location}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recruiter: {c.recruiterId?.name} ({c.recruiterId?.email})</p>
                </div>
                <button onClick={() => handleVerify(c._id)}
                  className="btn btn-sm"
                  style={{ background: c.isVerified ? '#FEF2F2' : '#ECFDF5', color: c.isVerified ? 'var(--danger)' : 'var(--success)', border: 'none', whiteSpace: 'nowrap' }}>
                  {c.isVerified ? 'Remove Verification' : '✓ Verify Company'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Jobs Page ──────────────────────────────────────
export function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getJobs({ search, status });
      setJobs(data.data.jobs);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, search ? 400 : 0); return () => clearTimeout(t); }, [search, status]);

  const handleClose = async (id) => {
    try {
      await adminApi.closeJob(id);
      setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: 'closed' } : j));
      toast.success('Job closed');
    } catch { toast.error('Failed'); }
  };

  const statusBgs = { active: '#ECFDF5', closed: '#FEF2F2', draft: '#FFFBEB' };
  const statusColors = { active: 'var(--success)', closed: 'var(--danger)', draft: '#D97706' };

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader title="Jobs Management" subtitle={`${jobs.length} jobs`} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="form-input" style={{ paddingLeft: 38 }} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select" style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? <LoadingPage /> : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  {['Job Title', 'Company', 'Recruiter', 'Status', 'Applications', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{j.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.location} • {j.workMode}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>{j.companyId?.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{j.recruiterId?.name}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'capitalize', background: statusBgs[j.status], color: statusColors[j.status] }}>{j.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600 }}>{j.applicationsCount || 0}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {j.status === 'active' && (
                        <button onClick={() => handleClose(j._id)} className="btn btn-sm" style={{ background: '#FEF2F2', color: 'var(--danger)', border: 'none' }}>
                          Close Job
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
