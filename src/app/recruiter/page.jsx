"use client";
import Link from 'next/link';

export default function RecruiterDashboard() {
  return (
    <section className="section active">
      <div className="recruiter-container">
        <div className="recruiter-header">
          <h2><i className="fas fa-briefcase"></i> Recruiter Dashboard</h2>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <i className="fas fa-sync"></i> Generate Sample Data
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div className="stat-info">
              <span className="stat-value">10</span>
              <span className="stat-label">Total Applicants</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user-check"></i>
            <div className="stat-info">
              <span className="stat-value">1</span>
              <span className="stat-label">Shortlisted</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-comments"></i>
            <div className="stat-info">
              <span className="stat-value">3</span>
              <span className="stat-label">Interview Ready</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-trophy"></i>
            <div className="stat-info">
              <span className="stat-value">4</span>
              <span className="stat-label">Selected</span>
            </div>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search by name, skills, or location..." />
          </div>
          
          <select className="filter-select" defaultValue="all">
            <option value="all">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Ready">Interview Ready</option>
            <option value="Selected">Selected</option>
          </select>

          <select className="filter-select" defaultValue="score">
            <option value="score">Sort by Score</option>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="candidates-list">
          {/* Mock candidate card for visuals */}
          <div className="candidate-card">
            <div className="candidate-info">
              <div className="candidate-avatar" style={{background: 'linear-gradient(135deg, #00d9ff, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', fontWeight: 'bold'}}>
                SJ
              </div>
              <div>
                <h3>Sarah Johnson</h3>
                <div className="candidate-meta">
                  <span><i className="fas fa-envelope"></i> sarah.j@email.com</span>
                  <span><i className="fas fa-map-marker-alt"></i> Berlin, Germany</span>
                </div>
                <div className="skill-tags">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Node.js</span>
                </div>
              </div>
            </div>
            <div className="candidate-score">
              <div className="score-value">84</div>
              <div className="score-label">Match Score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
