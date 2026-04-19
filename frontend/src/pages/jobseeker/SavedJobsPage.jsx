import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkCheck } from 'lucide-react';
import { jobsApi } from '../../api/index';
import { PageHeader, EmptyState, LoadingPage } from '../../components/ui/index';
import JobCard from '../../components/jobs/JobCard';
import { toast } from 'react-toastify';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await jobsApi.getSaved();
        setJobs(data.data.jobs);
      } catch { toast.error('Failed to load saved jobs'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUnsave = (jobId) => {
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
  };

  if (loading) return <div className="page-container"><LoadingPage /></div>;

  return (
    <div className="page-container">
      <div className="page-content">
        <PageHeader
          title="Saved Jobs"
          subtitle={`${jobs.length} job${jobs.length !== 1 ? 's' : ''} saved`}
        />

        {jobs.length === 0 ? (
          <EmptyState
            icon={BookmarkCheck}
            title="No saved jobs yet"
            text="Save jobs you're interested in so you can apply later."
            action={() => {}} actionLabel="Browse Jobs"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {jobs.map((job, i) => (
              <motion.div key={job._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <JobCard job={{ ...job, isSaved: true }} onSaveToggle={(id, saved) => { if (!saved) handleUnsave(id); }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
