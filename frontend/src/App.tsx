import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import AuthModal from './components/AuthModal';
import AppFooter from './components/AppFooter';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProfileSettings from './pages/ProfileSettings';
import './App.css';

// ─── Landing Page (inlined, was the original App content) ──────────────────
function LandingPage({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="app">
      <div className="sketch-bg" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="sketchGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#f5a623" strokeWidth="0.6" />
            </pattern>
            <pattern id="smallDot" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#f5a623" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sketchGrid)" />
          <rect width="100%" height="100%" fill="url(#smallDot)" />
          <line x1="0" y1="33%" x2="100%" y2="33%" stroke="#f5a623" strokeWidth="0.4" strokeDasharray="8,16" opacity="0.4" />
          <line x1="0" y1="66%" x2="100%" y2="66%" stroke="#f5a623" strokeWidth="0.4" strokeDasharray="8,16" opacity="0.4" />
        </svg>
      </div>

      <section className="hero">
        <div className="studio-corner studio-corner--tl" aria-hidden="true"></div>
        <div className="studio-corner studio-corner--tr" aria-hidden="true"></div>
        <div className="studio-corner studio-corner--bl" aria-hidden="true"></div>
        <div className="studio-corner studio-corner--br" aria-hidden="true"></div>
        <div className="hero-grid-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Trusted by 50,000+ professionals</span>
          </div>

          <h1 className="hero-title">
            Your Next Big <br />
            <span className="gradient-text">Career Move</span> Starts<br />
            Right Here
          </h1>

          <p className="hero-subtitle">
            CareerBridge connects ambitious candidates with forward-thinking companies.
            AI-powered matching, real-time applications, and seamless hiring — all in one place.
          </p>

          <div className="hero-cta">
            <button id="hero-cta-candidate" className="btn btn-primary btn-lg" onClick={onRegister}>
              <span>Find Your Dream Job</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button id="hero-cta-recruiter" className="btn btn-ghost btn-lg" onClick={onRegister}>
              I'm a Recruiter →
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item"><span className="stat-number">50K+</span><span className="stat-label">Active Candidates</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-number">3,200+</span><span className="stat-label">Partner Companies</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-number">98%</span><span className="stat-label">Match Accuracy</span></div>
          </div>
        </div>

        <div className="hero-floating-card card-1">
          <div className="floating-card-icon">🎉</div>
          <div><div className="floating-card-title">New Match!</div><div className="floating-card-sub">Senior React Dev at Stripe</div></div>
        </div>
        <div className="hero-floating-card card-2">
          <div className="floating-card-icon">⚡</div>
          <div><div className="floating-card-title">Interview Scheduled</div><div className="floating-card-sub">Tomorrow at 2:00 PM</div></div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="trust-inner">
          <p className="trust-label">Trusted by teams at</p>
          <div className="trust-logos">
            {['Google', 'Stripe', 'Notion', 'Vercel', 'Linear', 'Figma', 'Airbnb'].map(co => (
              <span key={co} className="trust-logo">{co}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-container">
          <div className="section-tag">Why CareerBridge</div>
          <h2 className="features-title">Everything you need to <span className="gradient-text">land the role</span></h2>
          <div className="features-grid">
            <div className="feature-card feature-card--large">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap"><span className="feature-icon">🎯</span></div>
              <h3 className="feature-title">AI-Powered Matching</h3>
              <p className="feature-description">Semantic match engine analyses your skills against job requirements to surface the best opportunities.</p>
              <div className="feature-tags"><span className="tag">Smart Score</span><span className="tag">98% accuracy</span></div>
            </div>
            <div className="feature-card">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap"><span className="feature-icon">⚡</span></div>
              <h3 className="feature-title">One-Click Apply</h3>
              <p className="feature-description">Apply to multiple jobs with your pre-filled profile and resume in seconds.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap"><span className="feature-icon">📊</span></div>
              <h3 className="feature-title">Live Tracking</h3>
              <p className="feature-description">Track your application stages from Applied to Accepted in a beautiful dashboard.</p>
            </div>
            <div className="feature-card feature-card--accent">
              <div className="feature-card-glow feature-card-glow--accent"></div>
              <div className="feature-icon-wrap"><span className="feature-icon">🤝</span></div>
              <h3 className="feature-title">Recruiter Hub</h3>
              <p className="feature-description">Post jobs, manage applications, and find the best candidates — all in one place.</p>
              <div className="feature-tags"><span className="tag">ATS Built-in</span><span className="tag">Team Collab</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-container">
          <div className="section-tag">Simple Process</div>
          <h2 className="hiw-title">Get hired in <span className="gradient-text">3 easy steps</span></h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Build Your Profile</h3>
              <p className="step-desc">Create a rich candidate profile with your skills, experience, and upload your resume. Takes less than 5 minutes.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Get Matched Instantly</h3>
              <p className="step-desc">Our AI engine scans thousands of open roles and surfaces your best-fit opportunities, ranked by match score.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Apply & Get Hired</h3>
              <p className="step-desc">One-click apply with your pre-filled profile. Track every application stage in real-time from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="features" id="categories" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="features-container">
          <div className="section-tag">Explore Roles</div>
          <h2 className="features-title">Browse by <span className="gradient-text">category</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '3px', background: 'rgba(245,166,35,0.12)', border: '2px solid rgba(245,166,35,0.2)', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
            {[
              { icon: '💻', label: 'Engineering', count: '1,240+ jobs' },
              { icon: '🎨', label: 'Design & UX', count: '380+ jobs' },
              { icon: '📈', label: 'Marketing', count: '510+ jobs' },
              { icon: '💼', label: 'Product', count: '290+ jobs' },
              { icon: '🔐', label: 'Security', count: '175+ jobs' },
              { icon: '📊', label: 'Data Science', count: '620+ jobs' },
              { icon: '☁️', label: 'DevOps & Cloud', count: '430+ jobs' },
              { icon: '🤝', label: 'Sales', count: '340+ jobs' },
            ].map(cat => (
              <div key={cat.label} className="feature-card" style={{ cursor: 'pointer' }} onClick={onRegister}>
                <div className="feature-icon-wrap"><span className="feature-icon">{cat.icon}</span></div>
                <h3 className="feature-title">{cat.label}</h3>
                <p className="feature-description" style={{ fontSize: '0.78rem', color: 'var(--color-accent-primary)', fontWeight: 700 }}>{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials" id="testimonials">
        <div className="testimonials-container">
          <div className="section-tag">Success Stories</div>
          <h2 className="testimonials-title">Loved by <span className="gradient-text">thousands</span></h2>
          <div className="testimonials-grid">
            <div className="testimonial-card testimonial-card--featured">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"CareerBridge's AI matched me to a Senior React role I never would have found on my own. The match score told me exactly where I stood before I even applied. Got the offer in 2 weeks."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--1">AS</div>
                <div>
                  <div className="author-name">Ananya Sharma</div>
                  <div className="author-role">Senior Frontend Engineer @ Stripe</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"As a recruiter, the built-in ATS and AI candidate ranking saved our team 15+ hours a week. We filled 3 senior roles in under a month."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--2">MR</div>
                <div>
                  <div className="author-name">Marcus Rodriguez</div>
                  <div className="author-role">Engineering Lead @ Vercel</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The recommended jobs tab is incredibly accurate. It showed me roles I was actually qualified for — no more wading through irrelevant listings. Landed a dream job in 3 weeks."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--3">PK</div>
                <div>
                  <div className="author-name">Priya Kulkarni</div>
                  <div className="author-role">Full-Stack Engineer @ Notion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <div className="cta-inner">
            <div className="section-tag">Get Started Today</div>
            <h2 className="cta-title">Your next chapter is<br /><span className="gradient-text">one click away</span></h2>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={onRegister}>
                <span>Start as a Candidate</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <button className="btn btn-outline btn-lg" onClick={onRegister}>Post a Job as Recruiter</button>
            </div>
            <p className="cta-note">No credit card required · Free for candidates · Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="nav-logo" style={{ marginBottom: '0.25rem' }}>
            <span className="logo-icon">✏️</span>
            <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
          </div>
          <p className="footer-tagline">Connecting talent with opportunity.</p>
          <p className="footer-copy">© 2026 CareerBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Persistent Navbar (for authenticated pages) ───────────────────────────
function AppNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  if (isLanding && !user) return null;

  const dashboardLink = user?.role === 'RECRUITER' ? '/recruiter' : '/dashboard';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar--app">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">✏️</span>
          <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
        </Link>
        <div className="nav-links">
          {user?.role !== 'RECRUITER' && (
            <Link to="/jobs" className={`nav-link ${location.pathname === '/jobs' ? 'nav-link--active' : ''}`}>Browse Jobs</Link>
          )}
          <Link to={dashboardLink} className={`nav-link ${location.pathname === dashboardLink ? 'nav-link--active' : ''}`}>Dashboard</Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'nav-link--active' : ''}`}>Profile</Link>
        </div>
        <div className="nav-actions">
          <span className="nav-user-greeting">👋 {user?.name || user?.email?.split('@')[0]}</span>
          <button id="nav-logout" className="btn btn-ghost" onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </nav>
  );
}

// ─── Root with routing ─────────────────────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');

  const openLogin = () => { setModalTab('login'); setModalOpen(true); };
  const openRegister = () => { setModalTab('register'); setModalOpen(true); };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <Routes>
        {/* Public landing — redirects to dashboard for logged-in users */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'RECRUITER' ? '/recruiter' : '/dashboard'} replace />
            ) : (
              <>
                <nav className="navbar">
                  <div className="navbar-inner">
                    <div className="nav-logo">
                      <span className="logo-icon">✏️</span>
                      <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
                    </div>
                    <div className="nav-links">
                      <a href="#features" className="nav-link">Features</a>
                      <a href="#how-it-works" className="nav-link">How It Works</a>
                      <a href="#categories" className="nav-link">Categories</a>
                      <a href="#testimonials" className="nav-link">Testimonials</a>
                    </div>
                    <div className="nav-actions">
                      <button id="nav-login" className="btn btn-ghost" onClick={openLogin}>Log In</button>
                      <button id="nav-get-started" className="btn btn-primary btn-sm" onClick={openRegister}>Get Started →</button>
                    </div>
                  </div>
                </nav>
                <LandingPage onRegister={openRegister} />
                {modalOpen && <AuthModal onClose={() => setModalOpen(false)} defaultTab={modalTab} />}
              </>
            )
          }
        />

        {/* Public job board */}
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Protected: Candidate */}
        <Route path="/dashboard" element={
          <AuthGuard allowedRoles={['CANDIDATE']}><CandidateDashboard /></AuthGuard>
        } />

        {/* Protected: Recruiter */}
        <Route path="/recruiter" element={
          <AuthGuard allowedRoles={['RECRUITER']}><RecruiterDashboard /></AuthGuard>
        } />

        {/* Protected: Any authenticated user */}
        <Route path="/profile" element={
          <AuthGuard><ProfileSettings /></AuthGuard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppFooterConditional />
    </>
  );
}

// ─── Footer: shown on all inner pages, hidden on landing ───────────────────
function AppFooterConditional() {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <AppFooter />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
