import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, Clock, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge, JobTypeBadge, WorkModeBadge, Avatar, SkillMatchChip } from '../ui/index';
import { formatSalary, timeAgo } from '../../utils/index';
import { jobsApi } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function JobCard({ job, onSaveToggle }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(job.isSaved || false);
  const [savingLoading, setSavingLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please log in to save jobs'); return; }
    setSavingLoading(true);
    try {
      const { data } = await jobsApi.toggleSave(job._id);
      setSaved(data.data.saved);
      toast.success(data.data.saved ? 'Job saved!' : 'Job removed from saved');
      onSaveToggle?.(job._id, data.data.saved);
    } catch {
      toast.error('Could not save job');
    } finally {
      setSavingLoading(false);
    }
  };

  const company = job.companyId || {};
  const daysAgo = timeAgo(job.createdAt);
  const isExpired = job.deadline && new Date() > new Date(job.deadline);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.18 }}
      className="card"
      style={{ padding: 20, position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {isExpired && (
        <div style={{ position: 'absolute', top: 14, left: 14, background: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: '1px solid #FECACA' }}>
          Expired
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={savingLoading}
        style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--primary)' : 'var(--text-muted)', padding: 4, transition: 'color var(--transition)' }}
      >
        {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingRight: 32 }}>
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', border: '1px solid var(--border)', padding: 4, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={20} color="var(--primary)" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/jobs/${job._id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', display: 'block', marginBottom: 2, lineHeight: 1.3 }}
            onMouseEnter={e => e.target.style.color = 'var(--primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text)'}
          >
            {job.title}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{company.name}</span>
            {company.isVerified && <span style={{ fontSize: 10, background: '#EEF4FF', color: 'var(--primary)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>✓ Verified</span>}
          </div>
        </div>
      </div>

      {/* Location + Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {job.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <MapPin size={12} /> {job.location}
          </span>
        )}
        <JobTypeBadge type={job.jobType} />
        <WorkModeBadge mode={job.workMode} />
        {job.skillMatch !== undefined && job.skillMatch > 0 && <SkillMatchChip percent={job.skillMatch} />}
      </div>

      {/* Salary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
          {formatSalary(job.minSalary, job.maxSalary, job.salaryDisclosed)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <Clock size={12} /> {daysAgo}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <Users size={12} /> {job.openings} opening{job.openings !== 1 ? 's' : ''}
        </span>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">View & Apply</Link>
      </div>
    </motion.div>
  );
}
