"use client";
import Link from 'next/link';

export default function ApplicationForm() {
  return (
    <section className="section active">
      <div className="form-container">
        <div className="form-header">
          <h2>Apply for Position</h2>
          <p>Fill in your details and let our AI analyze your profile</p>
        </div>

        <form className="application-form" onSubmit={(e) => { e.preventDefault(); alert('Application Submitted (Mock)'); }}>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-user"></i> Full Name</label>
              <input type="text" required placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <input type="email" required placeholder="your.email@example.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-phone"></i> Phone</label>
              <input type="tel" required placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-map-marker-alt"></i> Location</label>
              <input type="text" required placeholder="City, Country" />
            </div>
          </div>

          <div className="form-group full-width">
            <label><i className="fas fa-file-upload"></i> Upload Resume</label>
            <div className="file-upload-area">
              <input type="file" accept=".pdf,.doc,.docx" hidden />
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Drag and drop your resume here or <span className="upload-link">browse</span></p>
              <span className="file-info">Supported: PDF, DOC, DOCX (Max 5MB)</span>
            </div>
          </div>

          <div className="form-group full-width">
            <label><i className="fas fa-cogs"></i> Key Skills</label>
            <input type="text" placeholder="e.g., JavaScript, Python, React, Project Management" />
            <small>Separate skills with commas</small>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            <i className="fas fa-paper-plane"></i>
            Submit Application
          </button>
        </form>
      </div>
    </section>
  );
}
