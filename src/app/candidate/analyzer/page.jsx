"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [mode, setMode] = useState('general');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });
    }
  }, []);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    
    if (uploadedFile.type === 'application/pdf') {
      try {
        const fileUrl = URL.createObjectURL(uploadedFile);
        const pdf = await pdfjsLib.getDocument({ url: fileUrl }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\\n';
        }
        setResumeText(text);
        URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.error("PDF Parsing error:", err);
        alert("Failed to parse PDF. Please paste the text manually.");
      }
    } else {
      alert("Only PDF extraction is fully supported right now. For DOCX, please paste the text below temporarily.");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText) return alert('Please upload a resume or paste your resume text');
    setIsAnalyzing(true);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription, mode })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);

      if (user && supabase) {
        // Save to history
        await supabase.from('resume_analyses').insert({
          user_id: user.id,
          resume_name: file ? file.name : 'Pasted Resume',
          resume_text: resumeText,
          analysis_mode: mode,
          job_description: jobDescription,
          overall_score: data.overall_score,
          ats_score: data.ats_score,
          jd_match_score: data.jd_match_score || null,
          analysis_json: data
        });
      }
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="section active">
      <div className="form-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="form-header">
          <h2><i className="fas fa-magic"></i> AI Resume Analyzer</h2>
          <p>Get instant feedback on your resume</p>
        </div>

        {!result && (
          <div className="application-form" style={{ display: 'block' }}>
            <div className="form-group full-width" style={{ marginBottom: '2rem' }}>
              <label>Analysis Mode</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className={`btn ${mode === 'general' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMode('general')}
                  style={{ flex: 1 }}
                >
                  <i className="fas fa-file-alt"></i> General Evaluation
                </button>
                <button 
                  className={`btn ${mode === 'tailored' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMode('tailored')}
                  style={{ flex: 1 }}
                >
                  <i className="fas fa-bullseye"></i> Job Tailored
                </button>
              </div>
            </div>

            <div className="form-group full-width">
              <label><i className="fas fa-file-upload"></i> Upload Resume (PDF)</label>
              <div className="file-upload-area" onClick={() => document.getElementById('resumeUpload').click()}>
                <input type="file" id="resumeUpload" accept=".pdf" hidden onChange={handleFileUpload} />
                <i className="fas fa-cloud-upload-alt"></i>
                <p>{file ? file.name : "Drag and drop your resume here or click to browse"}</p>
                <span className="file-info">Supported: PDF</span>
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: '1rem' }}>
              <label>Resume Text (Extracted automatically or paste manually)</label>
              <textarea 
                value={resumeText} 
                onChange={(e) => setResumeText(e.target.value)} 
                rows={5} 
                style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                placeholder="Paste your resume content here if upload fails..."
              />
            </div>

            {mode === 'tailored' && (
              <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                <label>Job Description</label>
                <textarea 
                  value={jobDescription} 
                  onChange={(e) => setJobDescription(e.target.value)} 
                  rows={5} 
                  style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  placeholder="Paste the target job description here..."
                />
              </div>
            )}

            <button 
              className="btn btn-primary btn-large" 
              style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }} 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
            >
              <i className={isAnalyzing ? "fas fa-spinner fa-spin" : "fas fa-magic"}></i>
              {isAnalyzing ? " Analyzing..." : " Analyze Resume"}
            </button>
          </div>
        )}

        {result && (
          <div className="dashboard-container" style={{ margin: '0', padding: '0', background: 'transparent', boxShadow: 'none' }}>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Your Profile Analysis</h2>
                <p>AI-generated compatibility report</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setResult(null)}>
                <i className="fas fa-redo"></i> Analyze Another
              </button>
            </div>

            <div className="score-grid">
              <div className="score-card">
                <div className="score-icon"><i className="fas fa-bullseye"></i></div>
                <h3>Overall Score</h3>
                <div className="circular-progress" style={{background: `conic-gradient(var(--primary) ${result.overall_score}%, var(--bg-card) 0)`}}>
                  <div className="score-text" style={{background: 'var(--bg-secondary)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{result.overall_score}%</div>
                </div>
              </div>

              <div className="score-card">
                <div className="score-icon"><i className="fas fa-chart-line"></i></div>
                <h3>ATS Score</h3>
                <div className="circular-progress" style={{background: `conic-gradient(var(--success) ${result.ats_score}%, var(--bg-card) 0)`}}>
                  <div className="score-text" style={{background: 'var(--bg-secondary)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{result.ats_score}%</div>
                </div>
              </div>

              {result.jd_match_score && (
                <div className="score-card">
                  <div className="score-icon"><i className="fas fa-briefcase"></i></div>
                  <h3>JD Match</h3>
                  <div className="circular-progress" style={{background: `conic-gradient(var(--accent) ${result.jd_match_score}%, var(--bg-card) 0)`}}>
                    <div className="score-text" style={{background: 'var(--bg-secondary)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{result.jd_match_score}%</div>
                  </div>
                </div>
              )}
            </div>

            <div className="detailed-analysis">
              <div className="analysis-section">
                <h3><i className="fas fa-star" style={{ color: 'var(--warning)' }}></i> Strengths</h3>
                <div className="analysis-list">
                  {result.strengths?.map((s, i) => (
                    <div key={i} className="analysis-item">
                      <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h3><i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)' }}></i> Areas for Improvement</h3>
                <div className="analysis-list">
                  {result.areas_for_improvement?.map((a, i) => (
                    <div key={i} className="analysis-item">
                      <i className="fas fa-times" style={{ color: 'var(--danger)' }}></i>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h3><i className="fas fa-lightbulb" style={{ color: 'var(--primary)' }}></i> AI Recommendations</h3>
                <div className="analysis-list">
                  {result.recommendations?.map((r, i) => (
                    <div key={i} className="analysis-item">
                      <i className="fas fa-arrow-right" style={{ color: 'var(--primary)' }}></i>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
