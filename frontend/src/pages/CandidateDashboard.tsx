import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface Application {
  id: string;
  status: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED';
  matchScore: number | null;
  aiAnalysis: string | null;
  createdAt: string;
  resumeUrl: string;
  coverLetter: string | null;
  job: {
    id: string;
    title: string;
    employmentType: string;
    location: string | null;
    company: { name: string; logoUrl: string | null } | null;
  };
}

const STATUS_CONFIG = {
  APPLIED:   { label: 'Applied',    color: 'var(--color-accent-primary)',   bg: 'rgba(245,166,35,0.12)' },
  REVIEWING: { label: 'Reviewing',  color: 'var(--color-accent-tertiary)', bg: 'rgba(78,205,196,0.12)' },
  INTERVIEW: { label: 'Interview',  color: '#3b82f6',                       bg: 'rgba(59,130,246,0.12)' },
  REJECTED:  { label: 'Rejected',   color: 'var(--color-accent-secondary)', bg: 'rgba(232,59,47,0.12)'  },
  ACCEPTED:  { label: 'Accepted',   color: '#22c55e',                       bg: 'rgba(34,197,94,0.12)'  },
};

async function fetchMyApplications(token: string): Promise<Application[]> {
  const res = await fetch('/api/applications/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load applications');
  const data = await res.json();
  return data.applications;
}

export default function CandidateDashboard() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('ALL');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => fetchMyApplications(token!),
    enabled: !!token,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to withdraw application');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Application withdrawn successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-badge">✏️ Candidate Hub</div>
            <h1 className="dashboard-title">My Applications</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || user?.email?.split('@')[0]} 👋</p>
          </div>
          <a href="/jobs" className="btn btn-primary">Browse Jobs →</a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="stat-card" style={{ borderColor: cfg.color }}>
            <span className="stat-card-num" style={{ color: cfg.color }}>{counts[key] || 0}</span>
            <span className="stat-card-label">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? `All (${applications.length})` : `${STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label} (${counts[s]})`}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="skeleton-list">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>{filter === 'ALL' ? "You haven't applied to any jobs yet." : `No applications with status "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label}".`}</p>
          <a href="/jobs" className="btn btn-primary">Find Jobs</a>
        </div>
      ) : (
        <div className="application-list">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="application-card">
                <div className="app-card-left">
                  <div className="company-logo-wrap">
                    {app.job.company?.logoUrl
                      ? <img src={app.job.company.logoUrl} alt={app.job.company.name} className="company-logo" />
                      : <div className="company-logo-placeholder">{app.job.company?.name?.[0] || '?'}</div>
                    }
                  </div>
                  <div className="app-card-info">
                    <h3 className="app-job-title">{app.job.title}</h3>
                    <p className="app-company">{app.job.company?.name || 'Company'}</p>
                    <div className="app-meta">
                      {app.job.location && <span>📍 {app.job.location}</span>}
                      <span>🗓 {new Date(app.createdAt).toLocaleDateString()}</span>
                      {app.matchScore != null && (
                        <span className="match-score">⚡ {app.matchScore}% match</span>
                      )}
                    </div>
                    {app.aiAnalysis && (
                      <div className="ai-insight">
                        <span className="ai-insight-icon">🤖</span>
                        <span className="ai-insight-text">{app.aiAnalysis}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="app-card-right">
                  <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn-icon-small" title="View Resume">📄</a>
                  {app.status === 'APPLIED' && (
                    <button
                      className="btn-icon-small btn-icon-danger"
                      title="Withdraw"
                      onClick={() => withdrawMutation.mutate(app.id)}
                    >✕</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
