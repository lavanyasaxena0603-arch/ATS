"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// We need a shared supabase instance or we can just initialize here for UI
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  };

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <nav className="navbar">
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <i className="fas fa-robot"></i>
        <span>AI Recruiter</span>
      </Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/recruiter">Recruiter</Link>
        
        <button 
          onClick={toggleTheme}
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-primary)', 
            cursor: 'pointer', marginLeft: '1rem', display: 'flex', alignItems: 'center' 
          }}
          title="Toggle Theme"
        >
          <i className="fas fa-moon"></i>
        </button>

        <div className="nav-profile-container" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
          <Link href="/candidate" style={{ textDecoration: 'none' }}>
            <div id="navProfileContent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user ? (
                <>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', border: '2px solid var(--primary)' }}>
                      {initial}
                    </div>
                  )}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
                </>
              ) : (
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
