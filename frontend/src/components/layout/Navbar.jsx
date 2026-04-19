import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, LogOut, User, Briefcase, LayoutDashboard,
  BookmarkCheck, FileText, Building2, Menu, X, Settings, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/index';
import { timeAgo, getInitials, avatarColor } from '../../utils/index';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsApi.getAll({ limit: 8 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = user?.role === 'jobseeker'
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
        { to: '/applications', label: 'Applications', icon: FileText },
        { to: '/saved-jobs', label: 'Saved Jobs', icon: BookmarkCheck },
      ]
    : user?.role === 'recruiter'
    ? [
        { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
        { to: '/recruiter/post-job', label: 'Post a Job', icon: FileText },
        { to: '/recruiter/company', label: 'Company', icon: Building2 },
      ]
    : user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/users', label: 'Users', icon: User },
        { to: '/admin/companies', label: 'Companies', icon: Building2 },
        { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
      ]
    : [
        { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
      ];

  const profileLink = user?.role === 'jobseeker' ? '/profile' : user?.role === 'recruiter' ? '/recruiter/company' : '/admin';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      height: 64,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--primary)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)',
          }}>J</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--navy)', letterSpacing: '-0.5px' }}>JobPortal</span>
        </Link>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24, flex: 1 }}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: location.pathname === to ? 'var(--primary)' : 'var(--text-secondary)',
              background: location.pathname === to ? 'var(--primary-light)' : 'transparent',
              transition: 'all var(--transition)',
            }}
              onMouseEnter={e => { if (location.pathname !== to) e.target.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { if (location.pathname !== to) e.target.style.background = 'transparent'; }}
            >{label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {user ? (
            <>
              {/* Notifications bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
                  style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'var(--danger)', color: 'white',
                      fontSize: 10, fontWeight: 700, borderRadius: 99,
                      minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        background: 'white', borderRadius: 14, border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-dropdown)', width: 360, zIndex: 200, overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                            No notifications yet
                          </div>
                        ) : notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleMarkRead(n._id)}
                            style={{
                              padding: '14px 20px', borderBottom: '1px solid #F8FAFC',
                              background: n.isRead ? 'white' : '#F0F6FF', cursor: 'pointer',
                              transition: 'background var(--transition)',
                            }}
                          >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User avatar menu */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid var(--border)', borderRadius: 10, padding: '5px 10px 5px 5px', cursor: 'pointer', transition: 'all var(--transition)' }}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="avatar" style={{ width: 30, height: 30 }} />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: 30, height: 30, fontSize: 12, background: avatarColor(user.name) }}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        background: 'white', borderRadius: 12, border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-dropdown)', width: 220, zIndex: 200, overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                      </div>
                      {[
                        { to: profileLink, label: 'Profile', Icon: User },
                        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel', Icon: Shield }] : []),
                      ].map(({ to, label, Icon }) => (
                        <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'background var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Icon size={16} color="var(--text-muted)" />
                          {label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <button onClick={handleLogout}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--danger)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'background var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="show-mobile btn btn-ghost btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'white', borderTop: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: location.pathname === to ? 'var(--primary)' : 'var(--text)', background: location.pathname === to ? 'var(--primary-light)' : 'transparent', fontWeight: 600, fontSize: 14 }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link to="/login" className="btn btn-ghost" style={{ marginTop: 8, justifyContent: 'center' }}>Log In</Link>
                  <Link to="/register" className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>
                </>
              )}
              {user && (
                <button onClick={handleLogout} className="btn btn-ghost" style={{ marginTop: 8, color: 'var(--danger)', justifyContent: 'center' }}>
                  <LogOut size={16} /> Log Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
