import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { jobsApi } from '../../api/index';
import JobCard from '../../components/jobs/JobCard';
import { SkeletonCard, EmptyState } from '../../components/ui/index';
import { debounce } from '../../utils/index';
import { JOB_TYPES, WORK_MODES, DATE_POSTED_OPTIONS } from '../../constants/index';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', paddingTop: 12 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckboxFilter = ({ label, value, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(value, e.target.checked)}
      style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
    {label}
  </label>
);

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: [],
    workMode: [],
    datePosted: '',
    minSalary: '',
    maxSalary: '',
    sort: 'createdAt',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const [locationInput, setLocationInput] = useState(filters.location);

  const fetchJobs = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = { ...f };
      if (f.jobType?.length) params.jobType = f.jobType.join(',');
      if (f.workMode?.length) params.workMode = f.workMode.join(',');
      const { data } = await jobsApi.getAll(params);
      setJobs(data.data.jobs);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(filters); }, [filters]);

  const debouncedSearch = useCallback(debounce((val) => {
    setFilters((f) => ({ ...f, search: val, page: 1 }));
  }, 400), []);

  const debouncedLocation = useCallback(debounce((val) => {
    setFilters((f) => ({ ...f, location: val, page: 1 }));
  }, 400), []);

  const toggleArrayFilter = (key, val, checked) => {
    setFilters((f) => ({
      ...f,
      [key]: checked ? [...(f[key] || []), val] : (f[key] || []).filter((v) => v !== val),
      page: 1,
    }));
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => {
    setFilters({ search: '', location: '', jobType: [], workMode: [], datePosted: '', minSalary: '', maxSalary: '', sort: 'createdAt', page: 1 });
    setSearchInput('');
    setLocationInput('');
  };

  const hasActiveFilters = filters.jobType?.length || filters.workMode?.length || filters.datePosted || filters.minSalary || filters.maxSalary;

  const Sidebar = () => (
    <div className="card" style={{ padding: 24, position: 'sticky', top: 84, height: 'fit-content' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Job Type">
        {JOB_TYPES.map(({ value, label }) => (
          <CheckboxFilter key={value} label={label} value={value}
            checked={filters.jobType?.includes(value)}
            onChange={(v, c) => toggleArrayFilter('jobType', v, c)} />
        ))}
      </FilterSection>

      <FilterSection title="Work Mode">
        {WORK_MODES.map(({ value, label }) => (
          <CheckboxFilter key={value} label={label} value={value}
            checked={filters.workMode?.includes(value)}
            onChange={(v, c) => toggleArrayFilter('workMode', v, c)} />
        ))}
      </FilterSection>

      <FilterSection title="Date Posted">
        {DATE_POSTED_OPTIONS.map(({ value, label }) => (
          <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            <input type="radio" name="datePosted" value={value}
              checked={filters.datePosted === value}
              onChange={() => setFilter('datePosted', value)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
            {label}
          </label>
        ))}
        {filters.datePosted && (
          <button onClick={() => setFilter('datePosted', '')} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>Clear</button>
        )}
      </FilterSection>

      <FilterSection title="Salary Range (LPA)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="Min" value={filters.minSalary}
            onChange={(e) => setFilter('minSalary', e.target.value)}
            className="form-input" style={{ width: '50%' }} />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input type="number" placeholder="Max" value={filters.maxSalary}
            onChange={(e) => setFilter('maxSalary', e.target.value)}
            className="form-input" style={{ width: '50%' }} />
        </div>
      </FilterSection>

      <FilterSection title="Experience (Years)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="Min" value={filters.experienceMin || ''}
            onChange={(e) => setFilter('experienceMin', e.target.value)}
            className="form-input" style={{ width: '50%' }} />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input type="number" placeholder="Max" value={filters.experienceMax || ''}
            onChange={(e) => setFilter('experienceMax', e.target.value)}
            className="form-input" style={{ width: '50%' }} />
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="page-container">
      {/* Search header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 2, minWidth: 240, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); debouncedSearch(e.target.value); }}
                placeholder="Job title, skills, keywords..."
                className="form-input" style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
              <input value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); debouncedLocation(e.target.value); }}
                placeholder="Location or Remote"
                className="form-input" />
            </div>
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 160 }}>
              <option value="createdAt">Newest First</option>
              <option value="salary_high">Salary: High–Low</option>
              <option value="salary_low">Salary: Low–High</option>
              <option value="relevance">Most Relevant</option>
            </select>
            <button className="btn btn-ghost hide-mobile" onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal size={16} /> Filters {hasActiveFilters ? `(${[...(filters.jobType || []), ...(filters.workMode || [])].length + (filters.datePosted ? 1 : 0)})` : ''}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28, alignItems: 'start' }}>
          {/* Sidebar - desktop */}
          <div className="hide-mobile"><Sidebar /></div>

          {/* Jobs list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {loading ? 'Searching...' : `${total.toLocaleString()} job${total !== 1 ? 's' : ''} found`}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                text="Try adjusting your search terms or filters to find more results."
                action={clearFilters}
                actionLabel="Clear Filters"
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {jobs.map((job, i) => (
                  <motion.div key={job._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  className="btn btn-ghost btn-sm" style={{ minWidth: 36 }}>
                  ← Prev
                </button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const pg = i + 1;
                  return (
                    <button key={pg} onClick={() => setFilters((f) => ({ ...f, page: pg }))}
                      className="btn btn-sm"
                      style={{ minWidth: 36, background: filters.page === pg ? 'var(--primary)' : 'white', color: filters.page === pg ? 'white' : 'var(--text)', border: '1.5px solid var(--border)' }}>
                      {pg}
                    </button>
                  );
                })}
                <button disabled={filters.page >= totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  className="btn btn-ghost btn-sm" style={{ minWidth: 36 }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
