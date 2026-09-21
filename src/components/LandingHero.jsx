export default function LandingHero({ onNavigate }) {
  return (
    <div className="landing-hero">
      <div className="ai-avatar-container">
        <div className="ai-avatar">
          <i className="fas fa-robot"></i>
          <div className="avatar-pulse"></div>
        </div>
      </div>
      
      <h1 className="hero-title">
        Your Virtual Recruiter
        <span className="gradient-text">Powered by AI</span>
      </h1>
      
      <p className="hero-subtitle">
        Experience the future of recruitment with our AI-powered intelligent screening system
      </p>
      
      <div className="cta-buttons">
        <button className="btn btn-primary" onClick={() => onNavigate('applicationForm')}>
          <i className="fas fa-briefcase"></i>
          Apply for Job
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('candidateLogin')}>
          <i className="fas fa-user"></i>
          Candidate Login
        </button>
        <button className="btn btn-accent" onClick={() => onNavigate('recruiterDashboard')}>
          <i className="fas fa-chart-line"></i>
          Recruiter View
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <i className="fas fa-brain"></i>
          <h3>AI-Powered Screening</h3>
          <p>Intelligent resume analysis and skill matching</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-comments"></i>
          <h3>Virtual Interviews</h3>
          <p>Interactive chat with AI recruiter</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-chart-pie"></i>
          <h3>Smart Analytics</h3>
          <p>Comprehensive candidate scoring</p>
        </div>
      </div>
    </div>
  );
}
