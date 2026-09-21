import Link from 'next/link';

export default function About() {
  return (
    <section className="section active">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>About AI Recruiter</h2>
          <p>The next generation of applicant tracking and AI-driven screening.</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h3>Our Mission</h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            We aim to bridge the gap between talented individuals and forward-thinking companies by streamlining the hiring process with advanced artificial intelligence.
          </p>
          <h3>How It Works</h3>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Intelligent Resume Parsing</li>
            <li style={{ marginBottom: '0.5rem' }}>AI-Driven Virtual Interviews</li>
            <li style={{ marginBottom: '0.5rem' }}>Smart Candidate Scoring & Matching</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
