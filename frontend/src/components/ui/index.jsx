import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { STATUS_CONFIG, JOB_TYPE_COLORS, WORK_MODE_COLORS } from '../../constants/index';
import { getInitials, avatarColor } from '../../utils/index';

// ─── Status Badge ──────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {};
  return (
    <span className="badge" style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.color, display: 'inline-block' }} />
      {config.label || status}
    </span>
  );
};

// ─── Job Type Badge ────────────────────────────────────
export const JobTypeBadge = ({ type }) => {
  const c = JOB_TYPE_COLORS[type] || {};
  const labels = { 'full-time': 'Full Time', 'part-time': 'Part Time', contract: 'Contract', internship: 'Internship' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {labels[type] || type}
    </span>
  );
};

// ─── Work Mode Badge ───────────────────────────────────
export const WorkModeBadge = ({ mode }) => {
  const c = WORK_MODE_COLORS[mode] || {};
  const labels = { remote: '🌐 Remote', onsite: '🏢 Onsite', hybrid: '⚡ Hybrid' };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {labels[mode] || mode}
    </span>
  );
};

// ─── Avatar ────────────────────────────────────────────
export const Avatar = ({ src, name = '', size = 40, style: sx = {} }) => {
  if (src) {
    return <img src={src} alt={name} className="avatar" style={{ width: size, height: size, ...sx }} />;
  }
  return (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.35, background: avatarColor(name), ...sx }}>
      {getInitials(name)}
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 16, rounded = false, style: sx = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius: rounded ? 99 : 6, ...sx }} />
);

export const SkeletonCard = () => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
      <Skeleton width={48} height={48} style={{ borderRadius: 10 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={18} width="60%" />
        <Skeleton height={13} width="40%" />
      </div>
    </div>
    <Skeleton height={13} style={{ marginBottom: 8 }} />
    <Skeleton height={13} width="80%" style={{ marginBottom: 16 }} />
    <div style={{ display: 'flex', gap: 8 }}>
      <Skeleton height={24} width={80} rounded />
      <Skeleton height={24} width={80} rounded />
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, text, action, actionLabel }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{Icon && <Icon size={36} />}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-text">{text}</p>
    {action && (
      <button onClick={action} className="btn btn-primary" style={{ marginTop: 24 }}>
        {actionLabel}
      </button>
    )}
  </div>
);

// ─── Confirm Modal ─────────────────────────────────────
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'Confirm', danger = true }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="modal-box"
          style={{ maxWidth: 440 }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
              {danger && (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={22} color="var(--danger)" />
                </div>
              )}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onCancel} className="btn btn-ghost" disabled={loading}>Cancel</button>
              <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing...</> : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Page Header ───────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Loading Spinner Page ──────────────────────────────
export const LoadingPage = () => (
  <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
    </div>
  </div>
);

// ─── Skill Match Chip ──────────────────────────────────
export const SkillMatchChip = ({ percent }) => {
  const color = percent >= 70 ? '#16A34A' : percent >= 40 ? '#D97706' : '#94A3B8';
  const bg = percent >= 70 ? '#ECFDF5' : percent >= 40 ? '#FFFBEB' : '#F8FAFC';
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, border: `1px solid ${color}22`, borderRadius: 99, padding: '2px 8px' }}>
      {percent}% match
    </span>
  );
};
