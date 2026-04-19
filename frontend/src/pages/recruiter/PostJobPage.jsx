import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Check, ChevronRight, ChevronLeft, Briefcase, FileText, Eye, X, Plus } from 'lucide-react';
import { recruiterApi } from '../../api/index';
import { JobTypeBadge, WorkModeBadge, LoadingPage } from '../../components/ui/index';
import { JOB_TYPES, WORK_MODES, INDUSTRIES } from '../../constants/index';
import { formatSalary } from '../../utils/index';

const STEPS = [
  { label: 'Basic Info', icon: Briefcase },
  { label: 'Details & Skills', icon: FileText },
  { label: 'Preview & Publish', icon: Eye },
];

const defaultForm = {
  title: '', description: '', requirements: '', responsibilities: '',
  jobType: 'full-time', workMode: 'hybrid', location: '',
  minSalary: '', maxSalary: '', salaryDisclosed: true,
  experienceMin: 0, experienceMax: 5,
  skillsRequired: [], openings: 1,
  deadline: '', status: 'active',
};

export default function PostJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      recruiterApi.getJob(id).then(({ data }) => {
        const j = data.data.job;
        setForm({
          title: j.title, description: j.description, requirements: j.requirements || '',
          responsibilities: j.responsibilities || '', jobType: j.jobType, workMode: j.workMode,
          location: j.location || '', minSalary: j.minSalary || '', maxSalary: j.maxSalary || '',
          salaryDisclosed: j.salaryDisclosed, experienceMin: j.experienceMin || 0,
          experienceMax: j.experienceMax || 5, skillsRequired: j.skillsRequired || [],
          openings: j.openings || 1, deadline: j.deadline ? j.deadline.split('T')[0] : '',
          status: j.status,
        });
        setPageLoading(false);
      }).catch(() => { toast.error('Job not found'); navigate('/recruiter/jobs'); });
    }
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skillsRequired.includes(s)) return;
    set('skillsRequired', [...form.skillsRequired, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => set('skillsRequired', form.skillsRequired.filter((x) => x !== s));

  const handlePublish = async (asDraft = false) => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); setStep(0); return; }
    setLoading(true);
    try {
      const payload = { ...form, status: asDraft ? 'draft' : 'active' };
      if (id) {
        await recruiterApi.updateJob(id, payload);
        toast.success('Job updated!');
      } else {
        await recruiterApi.createJob(payload);
        toast.success(asDraft ? 'Saved as draft!' : 'Job published!');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="page-container"><LoadingPage /></div>;

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: 760 }}>
        {/* Step header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
          {STEPS.map(({ label, icon: Icon }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: i <= step ? 'pointer' : 'default' }}
                onClick={() => i <= step && setStep(i)}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? 'var(--primary)' : i === step ? 'var(--primary)' : 'var(--border)',
                  color: i <= step ? 'white' : 'var(--text-muted)', transition: 'all 0.3s',
                }}>
                  {i < step ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: i <= step ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', margin: '0 12px', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Basic Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Job Title <span className="required">*</span></label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Senior Frontend Developer" className="form-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select value={form.jobType} onChange={(e) => set('jobType', e.target.value)} className="form-select">
                      {JOB_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Mode</label>
                    <select value={form.workMode} onChange={(e) => set('workMode', e.target.value)} className="form-select">
                      {WORK_MODES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bangalore (leave empty for remote)" className="form-input" />
                </div>
                <div>
                  <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Salary Range (LPA)</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <input type="number" value={form.minSalary} onChange={(e) => set('minSalary', e.target.value)} placeholder="Min" className="form-input" />
                    <span style={{ color: 'var(--text-muted)' }}>–</span>
                    <input type="number" value={form.maxSalary} onChange={(e) => set('maxSalary', e.target.value)} placeholder="Max" className="form-input" />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={!form.salaryDisclosed} onChange={(e) => set('salaryDisclosed', !e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                    Hide salary (Not Disclosed)
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[['experienceMin', 'Min Experience (yrs)'], ['experienceMax', 'Max Experience (yrs)'], ['openings', 'Number of Openings']].map(([key, label]) => (
                    <div key={key} className="form-group">
                      <label className="form-label" style={{ fontSize: 13 }}>{label}</label>
                      <input type="number" min="0" value={form[key]} onChange={(e) => set(key, parseInt(e.target.value))} className="form-input" />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className="form-input" min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={() => { if (!form.title) { toast.error('Job title is required'); return; } setStep(1); }} className="btn btn-primary">
                  Next: Job Details <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details & Skills */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Job Details & Skills</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Job Description <span className="required">*</span></label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe the role, team, and what the candidate will work on..." className="form-textarea" style={{ minHeight: 140 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Responsibilities</label>
                  <textarea value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)}
                    placeholder="List key responsibilities (one per line)..." className="form-textarea" style={{ minHeight: 100 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea value={form.requirements} onChange={(e) => set('requirements', e.target.value)}
                    placeholder="List qualifications and requirements (one per line)..." className="form-textarea" style={{ minHeight: 100 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Type a skill and press Enter or Add" className="form-input" />
                    <button onClick={addSkill} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}><Plus size={14} /> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.skillsRequired.map((s) => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                        {s}
                        <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', lineHeight: 1, padding: 0 }}><X size={12} /></button>
                      </span>
                    ))}
                    {form.skillsRequired.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added yet</p>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button onClick={() => setStep(0)} className="btn btn-ghost"><ChevronLeft size={16} /> Back</button>
                <button onClick={() => { if (!form.description) { toast.error('Description is required'); return; } setStep(2); }} className="btn btn-primary">
                  Preview <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="card" style={{ padding: 32, marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Preview</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>This is how your job posting will appear to candidates.</p>

                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{form.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                    <JobTypeBadge type={form.jobType} />
                    <WorkModeBadge mode={form.workMode} />
                    {form.location && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {form.location}</span>}
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{formatSalary(form.minSalary, form.maxSalary, form.salaryDisclosed)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👥 {form.openings} opening{form.openings !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>💼 {form.experienceMin}–{form.experienceMax} yrs exp</span>
                  </div>
                  {form.description && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontWeight: 700, marginBottom: 8 }}>Description</p>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{form.description}</p>
                    </div>
                  )}
                  {form.skillsRequired.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 8 }}>Skills Required</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {form.skillsRequired.map((s) => <span key={s} style={{ padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <button onClick={() => setStep(1)} className="btn btn-ghost"><ChevronLeft size={16} /> Edit</button>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handlePublish(true)} disabled={loading} className="btn btn-ghost">
                      Save as Draft
                    </button>
                    <button onClick={() => handlePublish(false)} disabled={loading} className="btn btn-primary btn-lg">
                      {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Publishing...</> : '🚀 Publish Job'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
