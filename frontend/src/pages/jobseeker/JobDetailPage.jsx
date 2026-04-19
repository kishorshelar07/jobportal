import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  MapPin, Briefcase, Clock, Users, Globe, Building2,
  Bookmark, BookmarkCheck, CheckCircle, Upload, X, Eye,
} from 'lucide-react';
import { jobsApi } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { JobTypeBadge, WorkModeBadge, LoadingPage, ConfirmModal } from '../../components/ui/index';
import JobCard from '../../components/jobs/JobCard';
import { formatSalary, formatDate, timeAgo } from '../../utils/index';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await jobsApi.getById(id);
        setJob(data.data.job);
        setIsSaved(data.data.isSaved);
        setHasApplied(data.data.hasApplied);
        setSimilarJobs(data.data.similarJobs || []);
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!user) { toast.info('Please log in to save jobs'); return; }
    setSavingLoading(true);
    try {
      const { data } = await jobsApi.toggleSave(id);
      setIsSaved(data.data.saved);
      toast.success(data.data.saved ? 'Job saved!' : 'Removed from saved');
    } catch { toast.error('Failed to save job'); }
    finally { setSavingLoading(false); }
  };

  const handleApply = async () => {
    if (!user) { toast.info('Please log in to apply'); navigate('/login'); return; }
    if (user.role !== 'jobseeker') { toast.error('Only job seekers can apply'); return; }
    setApplyLoading(true);
    try {
      const formData = new FormData();
      if (coverLetter) formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);
      await jobsApi.apply(id, formData);
      toast.success('Application submitted successfully! 🎉');
      setHasApplied(true);
      setApplyOpen(false);
      setCoverLetter('');
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div className="page-container"><LoadingPage /></div>;
  if (!job) return null;

  const company = job.companyId || {};
  const isExpired = job.deadline && new Date() > new Date(job.deadline);

  return (
    <div className="page-container">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Job header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                {company.logoUrl
                  ? <img src={company.logoUrl} alt={company.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'contain', border: '1px solid var(--border)', padding: 4, flexShrink: 0 }} />
                  : <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={32} color="var(--primary)" /></div>
                }
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{job.title}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{company.name}</span>
                    {company.isVerified && <span style={{ background: '#EEF4FF', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>✓ Verified</span>}
                    {isExpired && <span style={{ background: '#FEF2F2', color: 'var(--danger)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Expired</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><MapPin size={15} />{job.location}</span>}
                <JobTypeBadge type={job.jobType} />
                <WorkModeBadge mode={job.workMode} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><Clock size={15} />Posted {timeAgo(job.createdAt)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}><Users size={15} />{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Salary', value: formatSalary(job.minSalary, job.maxSalary, job.salaryDisclosed) },
                  { label: 'Experience', value: `${job.experienceMin || 0}–${job.experienceMax || '10+'} years` },
                  { label: 'Deadline', value: job.deadline ? formatDate(job.deadline) : 'No deadline' },
                  { label: 'Views', value: `${job.viewsCount || 0} views` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            {[
              { title: 'Job Description', content: job.description },
              { title: 'Responsibilities', content: job.responsibilities },
              { title: 'Requirements', content: job.requirements },
            ].filter(({ content }) => content).map(({ title, content }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{content}</div>
              </motion.div>
            ))}

            {/* Skills */}
            {job.skillsRequired?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Skills Required</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.skillsRequired.map((skill) => (
                    <span key={skill} style={{ padding: '6px 14px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, fontSize: 13, fontWeight: 600, border: '1px solid #BFDBFE' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Company info */}
            {company.description && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>About {company.name}</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 16 }}>{company.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {company.industry && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🏭 {company.industry}</span>}
                  {company.size && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👥 {company.size} employees</span>}
                  {company.location && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {company.location}</span>}
                  {company.website && <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={13} />Website</a>}
                </div>
              </motion.div>
            )}

            {/* Similar jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Similar Jobs</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {similarJobs.map((j) => <JobCard key={j._id} job={j} />)}
                </div>
              </div>
            )}
          </div>

          {/* Sticky apply card */}
          <div style={{ position: 'sticky', top: 84 }}>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                  {formatSalary(job.minSalary, job.maxSalary, job.salaryDisclosed)}
                </p>
                {job.deadline && (
                  <p style={{ fontSize: 13, color: isExpired ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {isExpired ? '⚠️ Deadline passed' : `⏰ Closes ${formatDate(job.deadline)}`}
                  </p>
                )}
              </div>

              {hasApplied ? (
                <div style={{ background: '#ECFDF5', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <CheckCircle size={28} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: '#065F46' }}>Applied Successfully</p>
                  <p style={{ fontSize: 13, color: '#6EE7B7', marginTop: 4 }}>Track your application status</p>
                  <Link to="/applications" className="btn btn-outline btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                    View Application
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setApplyOpen(true)}
                    disabled={isExpired || job.status !== 'active'}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  >
                    {isExpired ? 'Deadline Passed' : 'Apply Now'}
                  </button>
                  <button onClick={handleSave} disabled={savingLoading} className="btn btn-outline btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {isSaved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save Job</>}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setApplyOpen(false)}>
            <motion.div className="modal-box" style={{ maxWidth: 520 }}
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '28px 28px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>Apply for this Role</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{job.title} at {company.name}</p>
                  </div>
                  <button onClick={() => setApplyOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Resume upload */}
                  <div className="form-group">
                    <label className="form-label">Resume</label>
                    {resumeFile ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid var(--success)', borderRadius: 8, background: '#ECFDF5' }}>
                        <CheckCircle size={16} color="var(--success)" />
                        <span style={{ fontSize: 13, flex: 1, color: '#065F46', fontWeight: 500 }}>{resumeFile.name}</span>
                        <button onClick={() => setResumeFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1.5px dashed var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', width: '100%', color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
                        <Upload size={18} /> Upload Resume (PDF, max 5MB) — or use saved resume
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files[0]) setResumeFile(e.target.files[0]); }} />
                    <p className="form-hint">Leave empty to use your profile's saved resume</p>
                  </div>

                  {/* Cover letter */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="form-label">Cover Letter <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                      <span style={{ fontSize: 12, color: coverLetter.length > 450 ? 'var(--danger)' : 'var(--text-muted)' }}>{coverLetter.length}/500</span>
                    </div>
                    <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value.slice(0, 500))}
                      placeholder="Tell the recruiter why you're a great fit for this role..."
                      className="form-textarea" style={{ minHeight: 120 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                    <button onClick={() => setApplyOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleApply} disabled={applyLoading} className="btn btn-primary" style={{ flex: 2 }}>
                      {applyLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : '🚀 Submit Application'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
