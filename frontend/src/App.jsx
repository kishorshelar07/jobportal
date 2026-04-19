import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import JobsPage from './pages/jobseeker/JobsPage';
import JobDetailPage from './pages/jobseeker/JobDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Job Seeker pages
import JSDashboard from './pages/jobseeker/Dashboard';
import ProfilePage from './pages/jobseeker/ProfilePage';
import ApplicationsPage from './pages/jobseeker/ApplicationsPage';
import ApplicationDetailPage from './pages/jobseeker/ApplicationDetailPage';
import SavedJobsPage from './pages/jobseeker/SavedJobsPage';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import ApplicantsPage from './pages/recruiter/ApplicantsPage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';

// Guards
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner spinner-dark" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const dest = user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
      <Route path="/jobs" element={<AppLayout><JobsPage /></AppLayout>} />
      <Route path="/jobs/:id" element={<AppLayout><JobDetailPage /></AppLayout>} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      {/* Job Seeker */}
      <Route path="/dashboard" element={<ProtectedRoute role="jobseeker"><AppLayout><JSDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="jobseeker"><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute role="jobseeker"><AppLayout><ApplicationsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute role="jobseeker"><AppLayout><ApplicationDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/saved-jobs" element={<ProtectedRoute role="jobseeker"><AppLayout><SavedJobsPage /></AppLayout></ProtectedRoute>} />

      {/* Recruiter */}
      <Route path="/recruiter" element={<ProtectedRoute role="recruiter"><AppLayout><RecruiterDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/recruiter/post-job" element={<ProtectedRoute role="recruiter"><AppLayout><PostJobPage /></AppLayout></ProtectedRoute>} />
      <Route path="/recruiter/post-job/:id" element={<ProtectedRoute role="recruiter"><AppLayout><PostJobPage /></AppLayout></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute role="recruiter"><AppLayout><MyJobsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute role="recruiter"><AppLayout><ApplicantsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/recruiter/company" element={<ProtectedRoute role="recruiter"><AppLayout><CompanyProfilePage /></AppLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute role="admin"><AppLayout><AdminCompanies /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute role="admin"><AppLayout><AdminJobs /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
