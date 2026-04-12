import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Job {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  createdAt: string;
  recruiter: { id: string; name: string | null; email: string };
  company: { id: string; name: string; logoUrl: string | null; website: string | null; description: string | null; location: string | null } | null;
  _count: { applications: number };
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / year`;
  if (min) return `${fmt(min)}+ / year`;
  return `Up to ${fmt(max!)} / year`;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { data, isLoading, isError } = useQuery<{ job: Job }>({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`);
      if (!res.ok) throw new Error('Job not found');
      return res.json();
    },
  });

  // Check if candidate has already applied to this job
  const { data: myAppsData } = useQuery<{ applications: { jobId: string; status: string }[] }>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/applications/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return { applications: [] };
      return res.json();
    },
    enabled: !!token && user?.role === 'CANDIDATE',
  });

  const hasApplied = myAppsData?.applications.some(app => app.jobId === id) ?? false;

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Please log in to apply');
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      if (coverLetter) formData.append('coverLetter', coverLetter);

      const res = await fetch(`${API_BASE}/api/applications/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Application failed');
      return d;
    },
    onSuccess: (data) => {
      // Invalidate cache so dashboard immediately shows the new application
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Application submitted! 🎉');
      // Warn if the PDF couldn't be read as text (e.g. scanned/image PDF)
      if (resumeFile && data.pdfExtracted === false) {
        toast.warn('⚠️ Your PDF could not be parsed as text (it may be image-based or scanned). Match score was calculated using your profile skills only. For best results, upload a text-based PDF.', { autoClose: 8000 });
      }
      setShowApplyModal(false);
      navigate('/dashboard');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-skeleton">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-block" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="job-detail-page">
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <p>Job not found or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  const { job } = data;
  const daysSince = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="job-detail-page">
      <button className="back-btn" onClick={() => navigate('/jobs')}>← Back to Jobs</button>

      <div className="job-detail-layout">
        {/* Main content */}
        <div className="job-detail-main">
          <div className="job-detail-header">
            <div className="company-logo-wrap company-logo-wrap--lg">
              {job.company?.logoUrl
                ? <img src={job.company.logoUrl} alt={job.company.name} className="company-logo" />
                : <div className="company-logo-placeholder company-logo-placeholder--lg">{(job.company?.name || '?')[0]}</div>
              }
            </div>
            <div className="job-detail-title-block">
              <h1 className="job-detail-title">{job.title}</h1>
              <div className="job-detail-meta">
                <span className="company-name-lg">{job.company?.name || job.recruiter.name}</span>
                {job.location && <span>📍 {job.location}</span>}
                <span>🕐 {daysSince === 0 ? 'Today' : `${daysSince}d ago`}</span>
                <span>👥 {job._count.applications} applicants</span>
              </div>
            </div>
          </div>

          <div className="job-detail-badges">
            <span className="employment-badge">{job.employmentType.replace('_', ' ')}</span>
            <span className="salary-badge">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            {job.status !== 'OPEN' && <span className="status-badge status-badge--closed">Closed</span>}
          </div>

          <div className="job-section">
            <h2>About the Role</h2>
            <div className="job-description">
              {job.description.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)}
            </div>
          </div>

          <div className="job-section">
            <h2>Tech Stack Required</h2>
            <div className="skill-chips">
              {job.techStack.map(t => <span key={t} className="skill-chip skill-chip--lg">{t}</span>)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="job-detail-sidebar">
          {job.company && (
            <div className="sidebar-card">
              <h3>About the Company</h3>
              <p className="company-desc">{job.company.description || 'No description provided.'}</p>
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🌐 Visit Website</a>
              )}
            </div>
          )}

          <div className="sidebar-card apply-card">
            <div className="apply-salary">{formatSalary(job.salaryMin, job.salaryMax)}</div>
            {user?.role === 'CANDIDATE' && job.status === 'OPEN' ? (
              hasApplied ? (
                <div className="already-applied-badge">
                  <span className="already-applied-icon">✅</span>
                  <div>
                    <strong>Already Applied</strong>
                    <p>You've submitted an application for this role. Check your dashboard for status updates.</p>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary btn-full" onClick={() => setShowApplyModal(true)}>
                  Apply Now →
                </button>
              )
            ) : !user ? (
              <button className="btn btn-primary btn-full" onClick={() => navigate('/')}>
                Sign In to Apply
              </button>
            ) : user.role === 'RECRUITER' ? (
              <p className="apply-note">Recruiter accounts cannot apply to jobs.</p>
            ) : (
              <p className="apply-note">This job is not accepting applications.</p>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to {job.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); applyMutation.mutate(); }} className="apply-form">
              <div className="form-field">
                <label>Resume (PDF) {user?.resumeUrl ? '(Optional)' : '*'}</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setResumeFile(e.target.files?.[0] || null)}
                  className="file-input"
                  required={!user?.resumeUrl}
                />
                <p className="field-hint">Max 5MB PDF. If no file is uploaded, we'll use the resume URL from your profile.</p>
              </div>
              <div className="form-field">
                <label>Cover Letter (optional)</label>
                <textarea
                  rows={5}
                  placeholder="Tell the recruiter why you're a great fit…"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
