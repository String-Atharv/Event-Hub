import { Link } from 'react-router-dom';
import './OrganiserLandingPage.css';

export const OrganiserLandingPage = () => {
  return (
    <div className="organiser-landing">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">Welcome to Event Platform</div>
          <h1 className="hero-title">
            Create & Manage
            <span className="title-highlight"> Unforgettable Events</span>
          </h1>
          <p className="hero-description">
            Transform your ideas into extraordinary experiences. Sell tickets, manage attendees,
            and grow your event business with our powerful platform.
          </p>
          
          <div className="hero-actions">
            <Link to="/events/create" className="btn-primary btn-create">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
            
            <Link to="/dashboard" className="btn-primary btn-browse">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">🎫</div>
            <div className="card-text">Ticket Sales</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📊</div>
            <div className="card-text">Analytics</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✨</div>
            <div className="card-text">Manage Events</div>
          </div>
        </div>
      </div>
      
      <div className="landing-features">
        <div className="feature-item">
          <div className="feature-icon">🚀</div>
          <h3 className="feature-title">Quick Setup</h3>
          <p className="feature-description">Get started in minutes with our intuitive interface</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">💰</div>
          <h3 className="feature-title">Easy Payments</h3>
          <p className="feature-description">Secure payment processing with instant payouts</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📈</div>
          <h3 className="feature-title">Real-time Analytics</h3>
          <p className="feature-description">Track sales, attendance, and revenue in real-time</p>
        </div>
      </div>
    </div>
  );
};