import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import UserPage from './pages/UserPage';
import FeedbackPage from './pages/FeedbackPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'User', icon: '👤' },
    { path: '/feedback', label: 'Feedback', icon: '💬' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/admin', label: 'Admin', icon: '🔒' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-canvas)' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--stroke-subtle)',
        background: 'var(--surface-card)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--stroke-subtle)' }}>
          <span style={{ fontSize: '1.75rem' }}>📄</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Resume Analyzer</h1>
            <small style={{ color: 'var(--text-muted)' }}>Cloud Powered Tool</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 0.5rem 0.5rem' }}>Choose Something...</h2>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent-solid)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all var(--motion-fast) var(--motion-ease)',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <footer style={{ borderTop: '1px solid var(--stroke-subtle)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Built with 🤍 for Career Guidance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-elevated)', padding: '0.5rem', borderRadius: '4px' }}>
              <span>👥</span>
              <span>Visitors Count: <span style={{ color: 'var(--accent-solid)', fontWeight: 'bold' }}>1,540+</span></span>
            </div>
          </div>
        </footer>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', maxHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<UserPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
