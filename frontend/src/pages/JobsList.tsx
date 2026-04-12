import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import searchIcon from '../assets/icons8-search.svg';
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
  matchScore?: number; // present only in recommended feed
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
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECOMMENDED'>('ALL');
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
    queryKey: activeTab === 'ALL' ? ['jobs', params] : ['recommended-jobs'],
    queryFn: async () => {
      if (activeTab === 'ALL') return fetchJobs(params);
      const res = await fetch('/api/jobs/recommended', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch recommended jobs');
      return res.json() as Promise<JobsResponse>;
    },
  });



  return (
    <div className="jobs-page">
      <div className="jobs-hero-banner">
        <div className="jobs-header">
          <div className="jobs-badge">✏️ Open Roles</div>
          <h1 className="jobs-title">Find Your <span className="gradient-text">Dream Job</span></h1>
          <p className="jobs-subtitle">
            {activeTab === 'ALL'
              ? `${data?.pagination.total ?? '...'} opportunities waiting for you`
              : `${data?.pagination.total ?? '0'} roles recommended based on your profile skills`}
          </p>
        </div>
      </div>

      {user?.role === 'CANDIDATE' && (
        <div className="jobs-tabs">
          <button
            className={`jobs-tab-btn ${activeTab === 'ALL' ? 'jobs-tab-btn--active' : ''}`}
            onClick={() => { setActiveTab('ALL'); setPage(1); }}
          >
            All Jobs
          </button>
          <button
            className={`jobs-tab-btn ${activeTab === 'RECOMMENDED' ? 'jobs-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('RECOMMENDED')}
          >
            Recommended For You
          </button>
        </div>
      )}

      {/* Recommended context banner */}
      {activeTab === 'RECOMMENDED' && (
        <div className="recommended-banner">
          <span className="recommended-banner-icon">🧠</span>
          <span>Showing jobs that match <strong>your profile skills</strong>, sorted by best fit. Update your skills on your profile to improve results.</span>
        </div>
      )}

      {/* Filters */}
      {activeTab === 'ALL' && (
        <div className="jobs-filters">
          <div className="search-wrap">
            <img src={searchIcon} alt="Search" className="search-icon" style={{ width: '16px', height: '16px' }} />
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
      )}

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
          <img src={searchIcon} alt="Search empty state" className="empty-icon" style={{ width: '40px', height: '40px' }} />
          <p>{activeTab === 'RECOMMENDED' ? 'No recommended jobs found. Try expanding the skills on your profile.' : 'No jobs found matching your criteria.'}</p>
          {activeTab === 'ALL' && (
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setDebouncedSearch(''); setEmploymentType(''); setLocation(''); }}>
              Clear Filters
            </button>
          )}
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
                  {job.matchScore != null && (
                    <span className="match-score-badge">⚡ {job.matchScore}% match</span>
                  )}
                  <span className="applicant-count">{job._count.applications} applied</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {activeTab === 'ALL' && data!.pagination.pages > 1 && (
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
