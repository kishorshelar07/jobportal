import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name}!`);
      const dest = user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/dashboard';
      navigate(dest);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22 }}>J</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--navy)' }}>JobPortal</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '40px 36px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: 38 }}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password <span className="required">*</span></label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
                : <><span>Sign In</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one free</Link>
          </p>

          {/* Demo credentials */}
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', marginTop: 20, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo Credentials</p>
            {[
              { label: 'Admin', email: 'admin@jobportal.com', pwd: 'Admin@1234' },
              { label: 'Recruiter', email: 'recruiter1@jobportal.com', pwd: 'Recruiter@1234' },
              { label: 'Job Seeker', email: 'seeker1@jobportal.com', pwd: 'Seeker@1234' },
            ].map(({ label, email }) => (
              <div key={label} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{label}:</span> {email}
              </div>
            ))}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Password: [Role]@1234 (e.g. Admin@1234)</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
