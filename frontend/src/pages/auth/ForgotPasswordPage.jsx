import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authApi } from '../../api/index';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '40px 36px', maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: '#EEF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <KeyRound size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {sent ? "We've sent a reset link to your email. Please check your inbox." : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com" className={`form-input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 38 }} />
              </div>
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#ECFDF5', borderRadius: 10, padding: '16px 20px', marginBottom: 20, color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>
              ✓ Reset link sent successfully!
            </div>
            <button onClick={() => setSent(false)} className="btn btn-outline btn-lg" style={{ width: '100%' }}>Try again</button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: 16 }}>Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '40px 36px', maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: '#EEF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Set New Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter and confirm your new password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">New Password <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /(?=.*[A-Za-z])(?=.*\d)/, message: 'Must contain letters and numbers' } })}
                type={showPwd ? 'text' : 'password'} placeholder="Min 8 chars"
                className={`form-input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 38, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
