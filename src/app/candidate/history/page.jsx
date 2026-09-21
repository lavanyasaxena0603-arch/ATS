"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setHistory(data);
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <section className="section active"><p style={{textAlign: 'center', marginTop: '5rem'}}>Loading history...</p></section>;
  }

  return (
    <section className="section active">
      <div className="dashboard-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <h2><i className="fas fa-history"></i> Analysis History</h2>
          <p>Track your resume improvements over time</p>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
            <h3>No history found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven't analyzed any resumes yet.</p>
            <Link href="/candidate/analyzer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <i className="fas fa-magic"></i> Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((item) => (
              <div key={item.id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    {item.resume_name} (v{item.resume_version})
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span><i className="fas fa-calendar"></i> {new Date(item.created_at).toLocaleDateString()}</span>
                    <span><i className="fas fa-tag"></i> Mode: {item.analysis_mode}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                      {item.overall_score}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Score</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert('View detailed view is under construction!')}>
                    <i className="fas fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
