// VerifyEmailPage.jsx
import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authApi } from '../../api/index';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await authApi.verifyEmail({ userId: state?.userId, otp: code });
      toast.success('Email verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOTP({ userId: state?.userId });
      toast.success('New OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '40px 36px', maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: '#EEF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mail size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Verify your email</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            We sent a 6-digit OTP to <strong>{state?.email || 'your email'}</strong>. Enter it below to verify.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              style={{
                width: 50, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 10, outline: 'none', transition: 'border-color var(--transition)',
                fontFamily: 'var(--font-display)',
              }}
            />
          ))}
        </div>

        <button onClick={handleVerify} className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: 16 }}>
          {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Verifying...</> : 'Verify Email'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Didn't receive it?{' '}
          <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
