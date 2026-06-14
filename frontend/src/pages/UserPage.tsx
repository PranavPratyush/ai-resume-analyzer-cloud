import React, { useState } from 'react';

interface AnalysisResult {
  name: string;
  email: string;
  mobile: string;
  degree: string;
  pages: number;
  experience_level: string;
  skills: string[];
  predicted_field: string;
  recommended_skills: string[];
  recommended_courses: Array<[string, string]> | string;
  score: number;
  score_breakdown: Record<string, boolean>;
  resume_video: string;
  interview_video: string;
  pdf_base64: string;
}

export default function UserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !mobile || !file) {
      setError('Please fill in all details and upload your PDF Resume.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', mobile);
    formData.append('resume', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-solid)', margin: '0 0 0.5rem 0' }}>AI Resume Analyzer</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Upload your resume and get smart recommendations built with natural language processing.</p>
      </header>

      {!result && (
        <form onSubmit={handleUpload} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Step 1: Enter Basic Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="e.g. John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                placeholder="e.g. john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input 
                type="tel" 
                required 
                className="form-input" 
                placeholder="e.g. +91 9876543210" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--stroke-subtle)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>Step 2: Upload Resume (PDF Format)</h2>
            <div style={{
              border: '2px dashed var(--stroke-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--surface-canvas)',
              transition: 'all var(--motion-fast) var(--motion-ease)'
            }} onClick={() => document.getElementById('resume-file')?.click()}>
              <input 
                id="resume-file" 
                type="file" 
                accept=".pdf" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                {file ? file.name : 'Click to select or drag your PDF resume here'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>PDF files only, max 5MB</p>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Cooking Magic For You... 🧑‍🍳' : 'Analyze Resume'}
          </button>
        </form>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--stroke-subtle)',
            borderTop: '4px solid var(--accent-solid)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Hang On While We Cook Magic For You...</h3>
          <p style={{ color: 'var(--text-muted)' }}>Parsing sections, analyzing skills, and preparing custom suggestions</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => { setResult(null); setFile(null); }}>
            ← Analyze Another Resume
          </button>

          {/* Intro Section */}
          <section className="glass-card" style={{ borderLeft: '5px solid var(--accent-solid)' }}>
            <h2 style={{ fontSize: '1.5rem', marginTop: 0 }}>Hello {result.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome to your resume analysis. Here is a summary of basic information extracted from your resume:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>NAME</strong>
                <span>{result.name}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>EMAIL</strong>
                <span>{result.email}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>CONTACT</strong>
                <span>{result.mobile}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>DEGREE</strong>
                <span>{result.degree}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>PAGES</strong>
                <span>{result.pages}</span>
              </div>
            </div>
          </section>

          {/* Level Prediction */}
          <section className="glass-card" style={{
            background: result.experience_level === 'Intermediate' ? 'rgba(16,185,129,0.05)' : result.experience_level === 'Experienced' ? 'rgba(245,158,11,0.05)' : 'rgba(59,130,246,0.05)',
            borderColor: result.experience_level === 'Intermediate' ? 'var(--success)' : result.experience_level === 'Experienced' ? 'var(--warning)' : 'var(--accent-solid)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Experience Level Prediction</h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: result.experience_level === 'Intermediate' ? 'var(--success)' : result.experience_level === 'Experienced' ? 'var(--warning)' : 'var(--accent-solid)' }}>
              You are at {result.experience_level} level!
            </p>
          </section>

          {/* Skills Analysis */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💡</span> Current Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {result.skills.map((skill, index) => (
                  <span key={index} className="badge badge-teal">{skill}</span>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🚀</span> Recommended Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {result.recommended_skills.map((skill, index) => (
                  <span key={index} className="badge badge-success">{skill}</span>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
                💡 Adding these skills will boost your chances of getting a {result.predicted_field || 'relevant'} Job.
              </p>
            </div>
          </section>

          {/* Predicted Field & Course Recommendations */}
          <section className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginTop: 0 }}>Job Role Prediction & Courses</h3>
            <div style={{ background: 'var(--accent-soft)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-solid)', marginBottom: '1.5rem' }}>
              <strong>Our analysis says you are looking for: </strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 750, color: 'var(--accent-solid)' }}>{result.predicted_field} Jobs</span>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Courses & Certificates Recommendations 👨‍🎓</h4>
            
            {Array.isArray(result.recommended_courses) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.recommended_courses.map((course, idx) => (
                  <a key={idx} href={course[1]} target="_blank" rel="noreferrer" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--stroke-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'all var(--motion-fast)'
                  }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-solid)'}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--stroke-subtle)'}>
                    <span style={{ fontWeight: 600 }}>({idx + 1}) {course[0]}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-solid)' }}>View Course ↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>{result.recommended_courses}</p>
            )}
          </section>

          {/* Resume Score */}
          <section className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginTop: 0 }}>Resume Writing Score 📝</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `conic-gradient(var(--accent-solid) ${result.score}%, var(--stroke-subtle) 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-soft)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--surface-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}>
                  {result.score}/100
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>Your Resume Writing Score is {result.score} / 100</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Note: This score is calculated based on presence of essential sections in your resume.
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Resume Tips & Ideas 🥂</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(result.score_breakdown).map(([section, present], idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: present ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  borderRadius: '6px',
                  border: present ? '1px solid var(--success)' : '1px solid var(--danger)',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: present ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                    {present ? '[+]' : '[-]'}
                  </span>
                  <span style={{ color: present ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {present 
                      ? `Awesome! You have added ${section}`
                      : `Please add ${section} details to stand out to recruiters`
                    }
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Videos Recommendation */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>Bonus Video for Resume Writing Tips💡</h3>
              <iframe
                title="Resume Tips"
                src={getEmbedUrl(result.resume_video)}
                style={{ width: '100%', height: '220px', border: 'none', borderRadius: 'var(--radius-sm)' }}
                allowFullScreen
              />
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>Bonus Video for Interview Tips💡</h3>
              <iframe
                title="Interview Tips"
                src={getEmbedUrl(result.interview_video)}
                style={{ width: '100%', height: '220px', border: 'none', borderRadius: 'var(--radius-sm)' }}
                allowFullScreen
              />
            </div>
          </section>

          {/* PDF Viewer */}
          <section className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>Resume Preview</h3>
            <iframe
              src={`data:application/pdf;base64,${result.pdf_base64}`}
              style={{ width: '100%', height: '600px', border: 'none', borderRadius: 'var(--radius-sm)' }}
              title="Resume Preview"
            />
          </section>
        </div>
      )}
    </div>
  );
}
