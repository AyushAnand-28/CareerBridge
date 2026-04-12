import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  employmentType: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  techStack: string[];
  createdAt: string;
  _count: { applications: number };
}

interface Applicant {
  id: string;
  status: string;
  matchScore: number | null;
  aiAnalysis: string | null;
  createdAt: string;
  resumeUrl: string;
  coverLetter: string | null;
  candidate: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    skills: string[];
    location: string | null;
  };
}

const JOB_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  OPEN:   { color: '#22c55e',                        bg: 'rgba(34,197,94,0.12)'  },
  DRAFT:  { color: 'var(--color-accent-primary)',    bg: 'rgba(245,166,35,0.12)' },
  CLOSED: { color: 'var(--color-text-muted)',        bg: 'rgba(122,98,72,0.12)'  },
};

const APP_STATUS_ORDER = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'ACCEPTED'] as const;

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function apiRequest(url: string, method: string, token: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Request failed'); }
  return res.json();
}

export default function RecruiterDashboard() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', techStack: '', employmentType: 'FULL_TIME',
    location: '', salaryMin: '', salaryMax: '', status: 'OPEN',
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['recruiter-jobs'],
    queryFn: () => apiRequest('/api/jobs/recruiter/mine', 'GET', token!).then(d => d.jobs),
    enabled: !!token,
  });

  const { data: applicants = [], isLoading: applicantsLoading } = useQuery<Applicant[]>({
    queryKey: ['job-applicants', selectedJobId],
    queryFn: () => apiRequest(`/api/applications/job/${selectedJobId}`, 'GET', token!).then(d => d.applications),
    enabled: !!selectedJobId && !!token,
  });

  const createJobMutation = useMutation({
    mutationFn: (data: typeof jobForm) => apiRequest('/api/jobs', 'POST', token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job posted successfully!');
      setShowJobForm(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof jobForm }) =>
      apiRequest(`/api/jobs/${id}`, 'PUT', token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
      toast.success('Job updated!');
      setEditingJob(null);
      setShowJobForm(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/jobs/${id}`, 'DELETE', token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      toast.success('Job deleted');
      if (selectedJobId) setSelectedJobId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      apiRequest(`/api/applications/${appId}/status`, 'PUT', token!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applicants', selectedJobId] });
      toast.success('Status updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setJobForm({ title: '', description: '', techStack: '', employmentType: 'FULL_TIME', location: '', salaryMin: '', salaryMax: '', status: 'OPEN' });
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description || '',
      techStack: job.techStack.join(', '),
      employmentType: job.employmentType,
      location: job.location || '',
      salaryMin: job.salaryMin?.toString() || '',
      salaryMax: job.salaryMax?.toString() || '',
      status: job.status,
    });
    setShowJobForm(true);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: jobForm });
    } else {
      createJobMutation.mutate(jobForm);
    }
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-badge">✏️ Recruiter Hub</div>
            <h1 className="dashboard-title">Recruiter Dashboard</h1>
            <p className="dashboard-subtitle">Manage your job postings and applicants, {user?.name || user?.email?.split('@')[0]}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowJobForm(true); setEditingJob(null); resetForm(); }}>
            + Post New Job
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-num">{jobs.length}</span>
          <span className="stat-card-label">Total Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-num" style={{ color: '#22c55e' }}>{jobs.filter(j => j.status === 'OPEN').length}</span>
          <span className="stat-card-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-num">{jobs.reduce((a, j) => a + j._count.applications, 0)}</span>
          <span className="stat-card-label">Total Applicants</span>
        </div>
      </div>

      <div className="recruiter-layout">
        {/* Left: Job list */}
        <div className="recruiter-jobs-panel">
          <h2 className="panel-title">Your Jobs</h2>
          {jobsLoading ? (
            <div className="skeleton-list">{[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No jobs posted yet.</p>
              <button className="btn btn-primary" onClick={() => setShowJobForm(true)}>Post a Job</button>
            </div>
          ) : (
            <div className="job-list-panel">
              {jobs.map(job => {
                const sc = JOB_STATUS_COLORS[job.status];
                return (
                  <div
                    key={job.id}
                    className={`job-list-item ${selectedJobId === job.id ? 'job-list-item--active' : ''}`}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="job-list-top">
                      <span className="job-list-title">{job.title}</span>
                      <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>{job.status}</span>
                    </div>
                    <div className="job-list-meta">
                      <span>{job.employmentType.replace('_', ' ')}</span>
                      {job.location && <span>· {job.location}</span>}
                      <span>· {job._count.applications} applicants</span>
                    </div>
                    <div className="job-list-actions">
                      <button className="btn-text" onClick={(e) => { e.stopPropagation(); openEdit(job); }}>Edit</button>
                      <button className="btn-text btn-text-danger" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this job?')) deleteJobMutation.mutate(job.id); }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Applicants panel */}
        <div className="recruiter-applicants-panel">
          {!selectedJobId ? (
            <div className="empty-state empty-state--subtle">
              <div className="empty-icon">👈</div>
              <p>Select a job to see applicants</p>
            </div>
          ) : (
            <>
              <h2 className="panel-title">Applicants — {selectedJob?.title}</h2>
              {applicantsLoading ? (
                <div className="skeleton-list">{[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}</div>
              ) : applicants.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🕐</div>
                  <p>No applications yet for this job.</p>
                </div>
              ) : (
                <div className="applicant-list">
                  {applicants.map(app => (
                    <div key={app.id} className="applicant-card">
                      <div className="applicant-top">
                        <div className="applicant-avatar">
                          {app.candidate.avatarUrl
                            ? <img src={app.candidate.avatarUrl} alt={app.candidate.name || ''} />
                            : <div className="avatar-placeholder">{(app.candidate.name || app.candidate.email)[0].toUpperCase()}</div>
                          }
                        </div>
                        <div className="applicant-info">
                          <strong>{app.candidate.name || app.candidate.email}</strong>
                          <span className="applicant-email">{app.candidate.email}</span>
                          {app.candidate.location && <span className="applicant-loc">📍 {app.candidate.location}</span>}
                        </div>
                        {app.matchScore != null && (
                          <div className="match-pill">⚡ {app.matchScore}%</div>
                        )}
                      </div>

                      {app.candidate.skills.length > 0 && (
                        <div className="skill-chips">
                          {app.candidate.skills.slice(0, 6).map(s => (
                            <span key={s} className="skill-chip">{s}</span>
                          ))}
                        </div>
                      )}

                      {app.aiAnalysis && (
                        <div className="ai-insight ai-insight--recruiter">
                          <span className="ai-insight-icon">🤖</span>
                          <span className="ai-insight-text">{app.aiAnalysis}</span>
                        </div>
                      )}

                      {app.coverLetter && (
                        <p className="cover-letter-preview">"{app.coverLetter.slice(0, 120)}…"</p>
                      )}

                      <div className="applicant-actions">
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📄 Resume</a>
                        <select
                          className="status-select"
                          value={app.status}
                          onChange={e => updateStatusMutation.mutate({ appId: app.id, status: e.target.value })}
                        >
                          {APP_STATUS_ORDER.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="modal-overlay" onClick={() => setShowJobForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job' : 'Post a New Job'}</h2>
              <button className="modal-close" onClick={() => setShowJobForm(false)}>✕</button>
            </div>
            <form className="job-form" onSubmit={handleFormSubmit}>
              <div className="form-field">
                <label>Job Title *</label>
                <input required placeholder="e.g. Senior React Developer" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Description *</label>
                <textarea required rows={5} placeholder="Describe the role, responsibilities, and requirements…" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Tech Stack (comma-separated)</label>
                  <input placeholder="React, Node.js, TypeScript" value={jobForm.techStack} onChange={e => setJobForm(p => ({ ...p, techStack: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Employment Type</label>
                  <select value={jobForm.employmentType} onChange={e => setJobForm(p => ({ ...p, employmentType: e.target.value }))}>
                    {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'].map(t => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Location</label>
                  <input placeholder="e.g. Remote, New York" value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={jobForm.status} onChange={e => setJobForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="OPEN">Open</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Min Salary (USD/yr)</label>
                  <input type="number" placeholder="60000" value={jobForm.salaryMin} onChange={e => setJobForm(p => ({ ...p, salaryMin: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Max Salary (USD/yr)</label>
                  <input type="number" placeholder="100000" value={jobForm.salaryMax} onChange={e => setJobForm(p => ({ ...p, salaryMax: e.target.value }))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowJobForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createJobMutation.isPending || updateJobMutation.isPending}>
                  {createJobMutation.isPending || updateJobMutation.isPending ? 'Saving…' : editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
