import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './JobsList.css';

interface Job {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  recruiter: { name: string | null; email: string };
  company: { name: string; logoUrl: string | null; location: string | null } | null;
  _count: { applications: number };
}

interface JobsResponse {
  jobs: Job[];
  pagination: { page: number; pages: number; total: number };
}

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];

async function fetchJobs(params: Record<string, string>): Promise<JobsResponse> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/jobs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return '';
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}/yr`;
  if (min) return `${fmt(min)}+/yr`;
  return `Up to ${fmt(max!)}/yr`;
}

export default function JobsList() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as Record<string, number>)._searchTimer);
    (window as unknown as Record<string, number>)._searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const params: Record<string, string> = { page: page.toString(), limit: '12' };
  if (debouncedSearch) params.search = debouncedSearch;
  if (employmentType) params.employmentType = employmentType;
  if (location) params.location = location;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', params],
    queryFn: () => fetchJobs(params),
  });

  const savedJobIds = useQuery<string[]>({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
      return [];
    },
    enabled: !!token,
  });

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1 className="jobs-title">Find Your <span className="gradient-text">Dream Job</span></h1>
        <p className="jobs-subtitle">{data?.pagination.total ?? '...'} opportunities waiting for you</p>
      </div>

      {/* Filters */}
      <div className="jobs-filters">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search jobs, skills, company…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <select className="filter-select" value={employmentType} onChange={e => { setEmploymentType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input
          className="filter-input"
          placeholder="📍 Location"
          value={location}
          onChange={e => { setLocation(e.target.value); setPage(1); }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="jobs-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card skeleton-job-card" />)}
        </div>
      ) : isError ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>Failed to load jobs. Please try again.</p>
        </div>
      ) : data?.jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No jobs found matching your criteria.</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setDebouncedSearch(''); setEmploymentType(''); setLocation(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {data!.jobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="job-card">
                <div className="job-card-header">
                  <div className="company-logo-wrap">
                    {job.company?.logoUrl
                      ? <img src={job.company.logoUrl} alt={job.company.name} className="company-logo" />
                      : <div className="company-logo-placeholder">{(job.company?.name || job.recruiter.name || '?')[0]}</div>
                    }
                  </div>
                  <div className="job-card-company">
                    <span className="company-name">{job.company?.name || job.recruiter.name || 'Company'}</span>
                    {(job.company?.location || job.location) && (
                      <span className="company-location">📍 {job.company?.location || job.location}</span>
                    )}
                  </div>
                </div>

                <h3 className="job-card-title">{job.title}</h3>
                <p className="job-card-desc">{job.description.slice(0, 120)}…</p>

                <div className="job-card-tags">
                  {job.techStack.slice(0, 4).map(t => (
                    <span key={t} className="skill-chip">{t}</span>
                  ))}
                  {job.techStack.length > 4 && <span className="skill-chip skill-chip--more">+{job.techStack.length - 4}</span>}
                </div>

                <div className="job-card-footer">
                  <span className="employment-badge">{job.employmentType.replace('_', ' ')}</span>
                  {formatSalary(job.salaryMin, job.salaryMax) && (
                    <span className="salary-badge">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  )}
                  <span className="applicant-count">{job._count.applications} applied</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data!.pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="page-info">Page {page} of {data!.pagination.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === data!.pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
