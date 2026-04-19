import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Pencil, Plus, Trash2, Upload, Link as LinkIcon, Github, Linkedin,
  Globe, MapPin, Briefcase, GraduationCap, Zap, Check, X, Eye, EyeOff,
} from 'lucide-react';
import { profileApi } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { Avatar, PageHeader, LoadingPage, ConfirmModal } from '../../components/ui/index';
import ProfileCompletionRing from '../../components/profile/CompletionRing';
import { formatDate, getInitials, avatarColor } from '../../utils/index';
import { NOTICE_PERIODS, PROFICIENCY_LEVELS } from '../../constants/index';

const proficiencyColors = { Beginner: '#F59E0B', Intermediate: '#3B82F6', Expert: '#10B981' };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const picInputRef = useRef();
  const resumeInputRef = useRef();

  const loadProfile = async () => {
    try {
      const { data } = await profileApi.get();
      setProfile(data.data.profile);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handlePicUpload = async (file) => {
    if (!file) return;
    if (file.size > 2097152) { toast.error('Image must be under 2MB'); return; }
    setUploadingPic(true);
    const fd = new FormData();
    fd.append('profilePicture', file);
    try {
      const { data } = await profileApi.uploadPicture(fd);
      updateUser({ profilePicture: data.data.profilePicture });
      toast.success('Profile picture updated!');
      loadProfile();
    } catch { toast.error('Upload failed'); }
    finally { setUploadingPic(false); }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    if (file.size > 5242880) { toast.error('Resume must be under 5MB'); return; }
    setUploadingResume(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await profileApi.uploadResume(fd);
      toast.success('Resume uploaded successfully!');
      loadProfile();
    } catch { toast.error('Upload failed'); }
    finally { setUploadingResume(false); }
  };

  if (loading) return <div className="page-container"><LoadingPage /></div>;
  if (!profile) return null;

  const completion = profile.profileCompletion || 0;

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: 900 }}>
        <PageHeader title="My Profile" subtitle="Manage your professional profile and resume" />

        {/* Profile header card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: avatarColor(user?.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 800, border: '3px solid var(--border)' }}>
                  {getInitials(user?.name || '')}
                </div>
              )}
              <button onClick={() => picInputRef.current?.click()} disabled={uploadingPic}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {uploadingPic ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Pencil size={12} color="white" />}
              </button>
              <input ref={picInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePicUpload(e.target.files[0])} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>{user?.name}</h2>
                {profile.isOpenToWork && (
                  <span style={{ background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: '1px solid #A7F3D0' }}>
                    #OpenToWork
                  </span>
                )}
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>{profile.headline || 'No headline yet'}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}><MapPin size={13} />{profile.location}</span>}
                {profile.experienceYears > 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>💼 {profile.experienceYears} yrs experience</span>}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--primary)' }}><Linkedin size={13} />LinkedIn</a>}
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--primary)' }}><Github size={13} />GitHub</a>}
              </div>
            </div>

            {/* Completion ring */}
            <div style={{ textAlign: 'center' }}>
              <ProfileCompletionRing percent={completion} size={88} strokeWidth={8} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Profile Strength</p>
            </div>
          </div>

          {/* Edit basic info */}
          <button onClick={() => setEditSection(editSection === 'basic' ? null : 'basic')}
            className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>
            <Pencil size={14} /> Edit Profile Info
          </button>

          <AnimatePresence>
            {editSection === 'basic' && (
              <BasicInfoForm profile={profile} onSave={loadProfile} onClose={() => setEditSection(null)} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Resume section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>📄 Resume</h3>
            <button onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume} className="btn btn-outline btn-sm">
              <Upload size={14} /> {uploadingResume ? 'Uploading...' : profile.resumeUrl ? 'Update Resume' : 'Upload Resume'}
            </button>
            <input ref={resumeInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handleResumeUpload(e.target.files[0])} />
          </div>
          {profile.resumeUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#ECFDF5', borderRadius: 10, border: '1px solid #A7F3D0' }}>
              <Check size={18} color="var(--success)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#065F46', flex: 1 }}>Resume uploaded</span>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No resume uploaded yet. Recruiters need your resume to process your application.</p>
          )}
        </motion.div>

        {/* Skills */}
        <ProfileSection title="Skills" icon={Zap} onEdit={() => setEditSection(editSection === 'skills' ? null : 'skills')} delay={0.1}>
          {profile.skills?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map((s) => (
                <span key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: proficiencyColors[s.proficiency] + '18', border: `1px solid ${proficiencyColors[s.proficiency]}44`, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: proficiencyColors[s.proficiency] }} />
                  {s.name}
                  <span style={{ fontSize: 10, color: proficiencyColors[s.proficiency], fontWeight: 500 }}>{s.proficiency}</span>
                </span>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills added yet.</p>}
          <AnimatePresence>
            {editSection === 'skills' && <SkillsForm profile={profile} onSave={loadProfile} onClose={() => setEditSection(null)} />}
          </AnimatePresence>
        </ProfileSection>

        {/* Work Experience */}
        <ProfileSection title="Work Experience" icon={Briefcase} onEdit={() => setEditSection(editSection === 'exp' ? null : 'exp')} delay={0.15}>
          {profile.workExperience?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profile.workExperience.map((exp) => (
                <ExperienceCard key={exp._id} exp={exp} onDelete={async () => { await profileApi.deleteExperience(exp._id); loadProfile(); toast.success('Removed'); }} />
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No work experience added yet.</p>}
          <AnimatePresence>
            {editSection === 'exp' && <ExperienceForm onSave={async (d) => { await profileApi.addExperience(d); loadProfile(); toast.success('Experience added'); setEditSection(null); }} onClose={() => setEditSection(null)} />}
          </AnimatePresence>
        </ProfileSection>

        {/* Education */}
        <ProfileSection title="Education" icon={GraduationCap} onEdit={() => setEditSection(editSection === 'edu' ? null : 'edu')} delay={0.2}>
          {profile.education?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profile.education.map((edu) => (
                <EducationCard key={edu._id} edu={edu} onDelete={async () => { await profileApi.deleteEducation(edu._id); loadProfile(); toast.success('Removed'); }} />
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No education added yet.</p>}
          <AnimatePresence>
            {editSection === 'edu' && <EducationForm onSave={async (d) => { await profileApi.addEducation(d); loadProfile(); toast.success('Education added'); setEditSection(null); }} onClose={() => setEditSection(null)} />}
          </AnimatePresence>
        </ProfileSection>
      </div>
    </div>
  );
}

const ProfileSection = ({ title, icon: Icon, children, onEdit, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card" style={{ padding: 28, marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
      </div>
      <button onClick={onEdit} className="btn btn-ghost btn-sm"><Plus size={14} /> Add / Edit</button>
    </div>
    {children}
  </motion.div>
);

const ExperienceCard = ({ exp, onDelete }) => (
  <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 15 }}>{exp.title}</p>
        <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>{exp.company}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {exp.startDate ? formatDate(exp.startDate) : ''} — {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
          {exp.location && ` • ${exp.location}`}
        </p>
        {exp.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{exp.description}</p>}
      </div>
      <button onClick={onDelete} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
    </div>
  </div>
);

const EducationCard = ({ edu, onDelete }) => (
  <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 15 }}>{edu.degree} in {edu.fieldOfStudy}</p>
        <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>{edu.institution}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{edu.startYear} — {edu.endYear || 'Present'}{edu.grade && ` • ${edu.grade}`}</p>
      </div>
      <button onClick={onDelete} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
    </div>
  </div>
);

const BasicInfoForm = ({ profile, onSave, onClose }) => {
  const [form, setForm] = useState({ headline: profile.headline || '', summary: profile.summary || '', location: profile.location || '', experienceYears: profile.experienceYears || 0, noticePeriod: profile.noticePeriod || '1 month', expectedSalary: profile.expectedSalary || '', linkedinUrl: profile.linkedinUrl || '', githubUrl: profile.githubUrl || '', portfolioUrl: profile.portfolioUrl || '', isOpenToWork: profile.isOpenToWork || false });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try { await profileApi.update(form); onSave(); toast.success('Profile updated!'); onClose(); }
    catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
      <div style={{ marginTop: 20, padding: 20, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { key: 'headline', label: 'Headline', placeholder: 'e.g. Senior Frontend Developer | React Expert' },
          { key: 'location', label: 'Location', placeholder: 'e.g. Bangalore, India' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="form-group">
            <label className="form-label">{label}</label>
            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="form-input" />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Summary</label>
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Tell recruiters about yourself..." className="form-textarea" style={{ minHeight: 80 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Experience (Years)</label>
            <input type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Expected Salary (LPA)</label>
            <input type="number" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} className="form-input" placeholder="e.g. 18" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notice Period</label>
          <select value={form.noticePeriod} onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })} className="form-select">
            {NOTICE_PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        {[['linkedinUrl', 'LinkedIn URL'], ['githubUrl', 'GitHub URL'], ['portfolioUrl', 'Portfolio URL']].map(([key, label]) => (
          <div key={key} className="form-group">
            <label className="form-label">{label}</label>
            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="form-input" placeholder={`https://...`} />
          </div>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isOpenToWork} onChange={(e) => setForm({ ...form, isOpenToWork: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Open to Work</span>
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </motion.div>
  );
};

const SkillsForm = ({ profile, onSave, onClose }) => {
  const [skills, setSkills] = useState(profile.skills?.map((s) => ({ name: s.name, proficiency: s.proficiency })) || []);
  const [newSkill, setNewSkill] = useState('');
  const [newProf, setNewProf] = useState('Intermediate');
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) return;
    setSkills([...skills, { name: newSkill.trim(), proficiency: newProf }]);
    setNewSkill('');
  };

  const save = async () => {
    setSaving(true);
    try { await profileApi.updateSkills(skills); onSave(); toast.success('Skills updated!'); onClose(); }
    catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
      <div style={{ marginTop: 20, padding: 20, background: 'var(--bg)', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="Add skill..." className="form-input" style={{ flex: 1, minWidth: 140 }} />
          <select value={newProf} onChange={(e) => setNewProf(e.target.value)} className="form-select" style={{ width: 'auto' }}>
            {PROFICIENCY_LEVELS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button onClick={addSkill} className="btn btn-primary btn-sm"><Plus size={14} /> Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {skills.map((s, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 99, fontSize: 13 }}>
              {s.name} <span style={{ fontSize: 10, color: proficiencyColors[s.proficiency] }}>{s.proficiency}</span>
              <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', lineHeight: 1 }}><X size={12} /></button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Save Skills'}</button>
        </div>
      </div>
    </motion.div>
  );
};

const ExperienceForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ company: '', title: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [saving, setSaving] = useState(false);
  const save = async () => { if (!form.company || !form.title) { toast.error('Company and title required'); return; } setSaving(true); try { await onSave(form); } finally { setSaving(false); } };
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
      <div style={{ marginTop: 20, padding: 20, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['title', 'Job Title *', 'e.g. Senior Developer'], ['company', 'Company *', 'Company name'], ['location', 'Location', 'e.g. Bangalore'], ['startDate', 'Start Date', '']].map(([key, label, ph]) => (
            <div key={key} className="form-group">
              <label className="form-label" style={{ fontSize: 13 }}>{label}</label>
              <input type={key.includes('Date') ? 'date' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="form-input" />
            </div>
          ))}
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
          Currently working here
        </label>
        {!form.isCurrent && (
          <div className="form-group"><label className="form-label" style={{ fontSize: 13 }}>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="form-input" /></div>
        )}
        <div className="form-group"><label className="form-label" style={{ fontSize: 13 }}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-textarea" style={{ minHeight: 70 }} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Add Experience'}</button>
        </div>
      </div>
    </motion.div>
  );
};

const EducationForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ degree: '', institution: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' });
  const [saving, setSaving] = useState(false);
  const save = async () => { if (!form.degree || !form.institution) { toast.error('Degree and institution required'); return; } setSaving(true); try { await onSave(form); } finally { setSaving(false); } };
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
      <div style={{ marginTop: 20, padding: 20, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['degree', 'Degree *', 'e.g. B.Tech'], ['institution', 'Institution *', 'College/University'], ['fieldOfStudy', 'Field of Study', 'e.g. Computer Science'], ['grade', 'Grade / CGPA', 'e.g. 8.5 / 10']].map(([key, label, ph]) => (
            <div key={key} className="form-group">
              <label className="form-label" style={{ fontSize: 13 }}>{label}</label>
              <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="form-input" />
            </div>
          ))}
          {[['startYear', 'Start Year'], ['endYear', 'End Year']].map(([key, label]) => (
            <div key={key} className="form-group">
              <label className="form-label" style={{ fontSize: 13 }}>{label}</label>
              <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="form-input" placeholder="YYYY" />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Add Education'}</button>
        </div>
      </div>
    </motion.div>
  );
};
