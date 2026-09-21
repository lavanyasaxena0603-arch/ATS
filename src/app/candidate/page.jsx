"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function CandidateLogin() {
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) return alert("Supabase not configured");
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/candidate'
      }
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Supabase not configured");
    setError('');
    setIsSubmitting(true);

    if (authTab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      if (error) {
        setError(error.message);
      } else {
        alert('Signup successful! Please check your email or log in.');
        setAuthTab('login');
      }
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) return <div className="section active"><p style={{textAlign:'center', marginTop:'5rem'}}>Loading...</p></div>;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  return (
    <section className="section active">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <i className="fas fa-user-circle"></i>
            <h2>Candidate Portal</h2>
            <p>Access your application status & Resume Analyzer</p>
          </div>

          {!user ? (
            <div id="loggedOutView">
              {/* Auth Tabs */}
              <div className="auth-tabs" style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button 
                  className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} 
                  onClick={() => setAuthTab('login')} 
                  style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: authTab === 'login' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: authTab === 'login' ? '2px solid var(--primary)' : 'none' }}>
                  Login
                </button>
                <button 
                  className={`auth-tab ${authTab === 'signup' ? 'active' : ''}`} 
                  onClick={() => setAuthTab('signup')} 
                  style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: authTab === 'signup' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: authTab === 'signup' ? '2px solid var(--primary)' : 'none' }}>
                  Sign Up
                </button>
              </div>

              <form className="login-form" onSubmit={handleEmailAuth}>
                {authTab === 'signup' && (
                  <div className="form-group">
                    <label><i className="fas fa-user"></i> Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
                  </div>
                )}
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your.email@example.com" />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-lock"></i> Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
                
                <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                  <i className={authTab === 'login' ? "fas fa-sign-in-alt" : "fas fa-user-plus"}></i> 
                  {isSubmitting ? 'Processing...' : (authTab === 'login' ? 'Login' : 'Sign Up')}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>

              <button onClick={handleGoogleLogin} className="btn btn-primary btn-large" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#db4437', borderColor: '#db4437' }}>
                <i className="fab fa-google"></i>
                Continue with Google
              </button>
            </div>
          ) : (
            <div id="loggedInView" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary)' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, border: '3px solid var(--primary)' }}>
                      {initial}
                    </div>
                  )}
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>{displayName}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
              </div>
              
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}><i className="fas fa-brain"></i> AI Resume Analyzer</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Get intelligent feedback on your resume and discover how well it matches your target role.</p>
                <Link href="/candidate/analyzer" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-magic"></i> Launch Analyzer
                </Link>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link href="/candidate/history" className="btn btn-secondary" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
                    <i className="fas fa-history"></i> History
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
