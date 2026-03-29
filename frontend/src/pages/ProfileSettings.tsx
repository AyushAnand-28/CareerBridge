import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ProfileSettings.css';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  skills: string[];
  resumeUrl: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    location: string | null;
    logoUrl: string | null;
  } | null;
}

export default function ProfileSettings() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', bio: '', location: '', skills: '', resumeUrl: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', website: '', location: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ user: Profile }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      setForm({
        name: u.name || '',
        bio: u.bio || '',
        location: u.location || '',
        skills: u.skills.join(', '),
        resumeUrl: u.resumeUrl || '',
      });
      if (u.company) {
        setCompanyForm({
          name: u.company.name,
          description: u.company.description || '',
          website: u.company.website || '',
          location: u.company.location || '',
        });
      }
    }
  }, [data]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadAvatar = useMutation({
    mutationFn: async () => {
      if (!avatarFile) throw new Error('No file selected');
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated!');
      setAvatarFile(null);
      setAvatarPreview(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateCompany = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile/company', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Company profile saved!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleAvatarChange(file: File) {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-card" />)}</div>
      </div>
    );
  }

  const profile = data?.user;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="dashboard-title">Profile Settings</h1>
        <p className="dashboard-subtitle">Keep your profile up to date for better job matches</p>
      </div>

      <div className="profile-layout">
        {/* Avatar Card */}
        <div className="profile-sidebar">
          <div className="avatar-card">
            <label className="avatar-upload-label">
              <div className="avatar-circle">
                {(avatarPreview || profile?.avatarUrl) ? (
                  <img src={avatarPreview || profile!.avatarUrl!} alt="Avatar" />
                ) : (
                  <span className="avatar-initials">{(profile?.name || profile?.email || '?')[0].toUpperCase()}</span>
                )}
                <div className="avatar-overlay">📷 Change</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarChange(e.target.files[0])} />
            </label>
            {avatarFile && (
              <button className="btn btn-primary btn-sm" onClick={() => uploadAvatar.mutate()} disabled={uploadAvatar.isPending}>
                {uploadAvatar.isPending ? 'Uploading…' : 'Save Avatar'}
              </button>
            )}
            <div className="profile-info-summary">
              <strong>{profile?.name || 'No name set'}</strong>
              <span>{profile?.email}</span>
              <span className="role-tag">{profile?.role}</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          {/* Basic Info */}
          <div className="settings-section">
            <h2 className="section-title">Basic Information</h2>
            <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }}>
              <div className="form-row">
                <div className="form-field">
                  <label>Full Name</label>
                  <input placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input placeholder="e.g. New York, Remote" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Bio</label>
                <textarea rows={3} placeholder="A short introduction about yourself…" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              {user?.role === 'CANDIDATE' && (
                <>
                  <div className="form-field">
                    <label>Skills (comma-separated)</label>
                    <input placeholder="React, Node.js, TypeScript, PostgreSQL" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
                    <p className="field-hint">These are used to calculate your match score for job postings.</p>
                  </div>
                  <div className="form-field">
                    <label>Resume URL</label>
                    <input placeholder="https://drive.google.com/..." value={form.resumeUrl} onChange={e => setForm(p => ({ ...p, resumeUrl: e.target.value }))} />
                    <p className="field-hint">Used as fallback when you don't upload a PDF on apply.</p>
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Company Profile (Recruiter only) */}
          {user?.role === 'RECRUITER' && (
            <div className="settings-section">
              <h2 className="section-title">Company Profile</h2>
              <p className="section-hint">This information appears on your job listings.</p>
              <form onSubmit={e => { e.preventDefault(); updateCompany.mutate(); }}>
                <div className="form-row">
                  <div className="form-field">
                    <label>Company Name *</label>
                    <input required placeholder="Acme Corp" value={companyForm.name} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Website</label>
                    <input placeholder="https://company.com" value={companyForm.website} onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))} />
                  </div>
                </div>
                <div className="form-field">
                  <label>Company Location</label>
                  <input placeholder="San Francisco, CA" value={companyForm.location} onChange={e => setCompanyForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Tell candidates about your company…" value={companyForm.description} onChange={e => setCompanyForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={updateCompany.isPending}>
                  {updateCompany.isPending ? 'Saving…' : 'Save Company Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
