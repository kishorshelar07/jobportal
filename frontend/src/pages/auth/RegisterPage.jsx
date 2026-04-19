// RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Mail, Lock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../../api/index';

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('jobseeker');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ defaultValues: { role: 'jobseeker' } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authApi.register({ ...data, role });
      toast.success('Account created! Please check your email for the OTP.');
      navigate('/verify-email', { state: { userId: res.data.userId, email: data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20 }}>J</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--navy)' }}>JobPortal</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '36px 32px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Join thousands of professionals on JobPortal</p>

          {/* Role selector */}
          <div className="tab-nav" style={{ marginBottom: 24 }}>
            <button type="button" className={`tab-btn ${role === 'jobseeker' ? 'active' : ''}`} onClick={() => setRole('jobseeker')} style={{ flex: 1 }}>
              👤 Job Seeker
            </button>
            <button type="button" className={`tab-btn ${role === 'recruiter' ? 'active' : ''}`} onClick={() => setRole('recruiter')} style={{ flex: 1 }}>
              🏢 Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  placeholder="Your full name" className={`form-input ${errors.name ? 'error' : ''}`} style={{ paddingLeft: 38 }} />
              </div>
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            {role === 'recruiter' && (
              <div className="form-group">
                <label className="form-label">Company Name <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input {...register('companyName', { required: role === 'recruiter' ? 'Company name is required' : false })}
                    placeholder="Your company name" className={`form-input ${errors.companyName ? 'error' : ''}`} style={{ paddingLeft: 38 }} />
                </div>
                {errors.companyName && <span className="form-error">{errors.companyName.message}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com" className={`form-input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 38 }} />
              </div>
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /(?=.*[A-Za-z])(?=.*\d)/, message: 'Must contain letters and numbers' } })}
                  type={showPwd ? 'text' : 'password'} placeholder="Min 8 chars with letters & numbers"
                  className={`form-input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
