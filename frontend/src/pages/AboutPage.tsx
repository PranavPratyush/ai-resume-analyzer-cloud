export default function AboutPage() {
  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-solid)', margin: '0 0 0.5rem 0' }}>About The Tool — AI Resume Analyzer</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Natural Language Processing based career alignment and resume parser.</p>
      </header>

      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          This resume analyzer parses information from a resume using Natural Language Processing (spaCy & NLTK) to find keywords, cluster them onto job sectors, and generate custom recommendations, score tips, and educational links.
        </p>

        <div style={{ borderTop: '1px solid var(--stroke-subtle)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginTop: 0, color: 'var(--accent-solid)' }}>How to Use:</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>👤</span>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>User Mode</strong>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Select "User" on the sidebar navigation, fill in the required contact information, and upload your resume in PDF format. The system will process your details and instantly yield recommendation scores, tip guides, courses, and helpful tips.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>💬</span>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Feedback</strong>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Drop comments, suggestions, or ratings in the Feedback page to help us upgrade features. Review historical submissions and average user ratings directly on the page.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔒</span>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Admin Console</strong>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Log in using <strong>admin</strong> as username and <strong>admin@resume-analyzer</strong> as password to view parsed statistics, download user logs in CSV, and inspect detailed submission metadata.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--stroke-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.95rem' }}>
            Built with 🤍 for Career Guidance
          </div>
        </div>
      </section>
    </div>
  );
}
