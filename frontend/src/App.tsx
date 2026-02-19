import './App.css'

function App() {
  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-logo">
            <span className="logo-icon">⟡</span>
            <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#testimonials" className="nav-link">Success Stories</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost">Log In</button>
            <button className="btn btn-primary btn-sm">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        {/* Animated background blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Grid overlay */}
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
            <button className="btn btn-primary btn-lg">
              <span>Find Your Dream Job</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-lg">
              I'm a Recruiter →
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Candidates</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">3,200+</span>
              <span className="stat-label">Partner Companies</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>
          </div>
        </div>

        {/* Floating Card */}
        <div className="hero-floating-card card-1">
          <div className="floating-card-icon">🎉</div>
          <div>
            <div className="floating-card-title">New Match!</div>
            <div className="floating-card-sub">Senior React Dev at Stripe</div>
          </div>
        </div>
        <div className="hero-floating-card card-2">
          <div className="floating-card-icon">⚡</div>
          <div>
            <div className="floating-card-title">Interview Scheduled</div>
            <div className="floating-card-sub">Tomorrow at 2:00 PM</div>
          </div>
        </div>
      </section>

      {/* Logos / Trust Strip */}
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

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <div className="section-tag">Why CareerBridge</div>
          <h2 className="features-title">
            Everything you need to <span className="gradient-text">land the role</span>
          </h2>
          <p className="features-description">
            A complete platform built for modern job seekers and hiring teams — fast, intelligent, and beautifully simple.
          </p>

          <div className="features-grid">
            <div className="feature-card feature-card--large">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <span className="feature-icon">🎯</span>
              </div>
              <h3 className="feature-title">AI-Powered Matching</h3>
              <p className="feature-description">
                Our semantic AI engine analyzes your skills, experience, and culture preferences to surface roles with the highest success probability — not just keyword matches.
              </p>
              <div className="feature-tags">
                <span className="tag">GPT-4 Powered</span>
                <span className="tag">98% accuracy</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <span className="feature-icon">⚡</span>
              </div>
              <h3 className="feature-title">One-Click Apply</h3>
              <p className="feature-description">
                Apply to multiple jobs in seconds with your pre-filled profile. Recruiters get everything they need instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <span className="feature-icon">📊</span>
              </div>
              <h3 className="feature-title">Live Analytics</h3>
              <p className="feature-description">
                Track your application stages, profile views, and match scores in real time with a beautiful dashboard.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <span className="feature-icon">🔒</span>
              </div>
              <h3 className="feature-title">Enterprise-Grade Security</h3>
              <p className="feature-description">
                Bank-level encryption protects your personal data. You decide who sees your profile — always.
              </p>
            </div>

            <div className="feature-card feature-card--accent">
              <div className="feature-card-glow feature-card-glow--accent"></div>
              <div className="feature-icon-wrap">
                <span className="feature-icon">🤝</span>
              </div>
              <h3 className="feature-title">Recruiter Hub</h3>
              <p className="feature-description">
                Post jobs, manage applications, schedule interviews, and collaborate with your team — all in a single streamlined workspace.
              </p>
              <div className="feature-tags">
                <span className="tag">ATS Built-in</span>
                <span className="tag">Team Collab</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-container">
          <div className="section-tag">How it Works</div>
          <h2 className="hiw-title">From profile to offer in <span className="gradient-text">3 steps</span></h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Build Your Profile</h3>
              <p className="step-desc">Import your LinkedIn or fill in your skills, experience, and dream role in minutes.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="12" viewBox="0 0 40 12" fill="none"><path d="M0 6h38M32 1l6 5-6 5" stroke="rgba(99,102,241,0.5)" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Get Matched</h3>
              <p className="step-desc">Our AI surfaces the top jobs tailored to you daily. Browse or let opportunities come to you.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="12" viewBox="0 0 40 12" fill="none"><path d="M0 6h38M32 1l6 5-6 5" stroke="rgba(99,102,241,0.5)" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Land the Offer</h3>
              <p className="step-desc">Apply with one click, track your progress, and celebrate your new role with CareerBridge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="testimonials-container">
          <div className="section-tag">Success Stories</div>
          <h2 className="testimonials-title">Loved by candidates & <span className="gradient-text">recruiters alike</span></h2>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"I found my dream job at a Series B startup within 2 weeks. The AI match was scary accurate — it knew I'd love the culture before I even interviewed."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--1">SK</div>
                <div>
                  <div className="author-name">Shreya K.</div>
                  <div className="author-role">Frontend Engineer @ Notion</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card testimonial-card--featured">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"We cut our time-to-hire from 6 weeks to under 10 days. CareerBridge's candidate pipeline is exceptional — quality over quantity, every single time."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--2">RV</div>
                <div>
                  <div className="author-name">Rahul V.</div>
                  <div className="author-role">Head of Talent @ Razorpay</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The one-click apply and real-time tracking made the whole process so much less stressful. I always knew exactly where I stood."</p>
              <div className="testimonial-author">
                <div className="author-avatar author-avatar--3">AM</div>
                <div>
                  <div className="author-name">Ananya M.</div>
                  <div className="author-role">Product Manager @ Swiggy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-blob cta-blob-1"></div>
        <div className="cta-blob cta-blob-2"></div>
        <div className="cta-container">
          <div className="cta-inner">
            <div className="section-tag">Get Started Today</div>
            <h2 className="cta-title">
              Your next chapter is<br /><span className="gradient-text">one click away</span>
            </h2>
            <p className="cta-description">
              Join 50,000+ professionals who've found their perfect match on CareerBridge. Free forever for candidates.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg">
                <span>Start as a Candidate</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className="btn btn-outline btn-lg">
                Post a Job as Recruiter
              </button>
            </div>
            <p className="cta-note">No credit card required · Free for candidates · Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">⟡</span>
            <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
          </div>
          <p className="footer-tagline">Connecting talent with opportunity.</p>
          <p className="footer-copy">© 2026 CareerBridge. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default App
