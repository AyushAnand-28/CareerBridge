import { Link } from 'react-router-dom';
import './AppFooter.css';

export default function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        {/* Brand */}
        <div className="app-footer-brand">
          <div className="app-footer-logo">
            <span className="logo-icon">✏️</span>
            <span className="logo-text">Career<span className="gradient-text">Bridge</span></span>
          </div>
          <p className="app-footer-tagline">
            Connecting talent with opportunity.<br />
            <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '1rem' }}>
              AI-powered · Real-time · Transparent
            </span>
          </p>
        </div>

        {/* Links */}
        <div className="app-footer-links">
          <div className="app-footer-col">
            <h4 className="app-footer-col-title">Platform</h4>
            <Link to="/jobs" className="app-footer-link">Browse Jobs</Link>
            <Link to="/dashboard" className="app-footer-link">My Dashboard</Link>
            <Link to="/profile" className="app-footer-link">Profile Settings</Link>
          </div>
          <div className="app-footer-col">
            <h4 className="app-footer-col-title">Company</h4>
            <a href="/#features" className="app-footer-link">Features</a>
            <a href="/#how-it-works" className="app-footer-link">How It Works</a>
            <a href="/#testimonials" className="app-footer-link">Testimonials</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="app-footer-bottom">
        <div className="app-footer-bottom-inner">
          <span>© {year} CareerBridge. All rights reserved.</span>
          <span className="app-footer-divider">·</span>
          <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Built with ✏️ &amp; ☕</span>
        </div>
      </div>
    </footer>
  );
}
