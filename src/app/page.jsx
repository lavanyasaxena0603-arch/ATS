"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <section id="landingPage" className="section active">
      <div className="particles" id="particles"></div>
      
      <div className="landing-hero">
        <div className="ai-avatar-container">
          <div className="ai-avatar">
            <i className="fas fa-robot"></i>
            <div className="avatar-pulse"></div>
          </div>
        </div>
        
        <h1 className="hero-title">
          Your Virtual Recruiter
          <br/>
          <span className="gradient-text">Powered by AI</span>
        </h1>
        
        <p className="hero-subtitle">
          Experience the future of recruitment with our AI-powered intelligent screening system
        </p>
        
        <div className="cta-buttons">
          <Link href="/apply" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <i className="fas fa-briefcase"></i>
            Apply for Job
          </Link>
          <Link href="/candidate" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <i className="fas fa-user"></i>
            Candidate Login
          </Link>
          <Link href="/recruiter" className="btn btn-accent" style={{ textDecoration: 'none' }}>
            <i className="fas fa-chart-line"></i>
            Recruiter View
          </Link>
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
    </section>
  );
}
