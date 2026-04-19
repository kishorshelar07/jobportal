import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 96, fontWeight: 900, color: 'var(--border)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary btn-lg"><Home size={18} /> Go Home</Link>
          <Link to="/jobs" className="btn btn-outline btn-lg"><Search size={18} /> Browse Jobs</Link>
        </div>
      </motion.div>
    </div>
  );
}
