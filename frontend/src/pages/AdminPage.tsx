import React, { useState, useEffect } from 'react';

interface UserRecord {
  ID: number;
  sec_token: string;
  ip_add: string;
  host_name: string;
  dev_user: string;
  os_name_ver: string;
  latlong: string;
  city: string;
  state: string;
  country: string;
  act_name: string;
  act_mail: string;
  act_mob: string;
  Name: string;
  Email_ID: string;
  resume_score: string;
  Timestamp: string;
  Page_no: string;
  Predicted_Field: string;
  User_level: string;
  Actual_skills: string;
  Recommended_skills: string;
  Recommended_courses: string;
  pdf_name: string;
}

interface FeedbackRecord {
  ID: number;
  feed_name: string;
  feed_email: string;
  feed_score: string;
  comments: string;
  Timestamp: string;
}

interface AdminData {
  users: UserRecord[];
  feedbacks: FeedbackRecord[];
  stats: {
    total_users: number;
    fields_distribution: Record<string, number>;
    levels_distribution: Record<string, number>;
    scores_distribution: Record<string, number>;
    ip_distribution: Record<string, number>;
    city_distribution: Record<string, number>;
    state_distribution: Record<string, number>;
    country_distribution: Record<string, number>;
  };
}

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '');
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Login failed');

      setToken(body.token);
      sessionStorage.setItem('admin_token', body.token);
    } catch (err: any) {
      setError(err.message || 'Wrong credentials');
    }
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        const body = await res.json();
        setData(body);
      } else {
        setToken('');
        sessionStorage.removeItem('admin_token');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem('admin_token');
    setData(null);
  };

  const handleDownload = () => {
    window.open('/api/admin/download', '_blank');
  };

  // Helper to render inline SVG pie charts
  const renderSVGPieChart = (distribution: Record<string, number>, title: string) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return <p style={{ color: 'var(--text-muted)' }}>No data available.</p>;

    let accumulatedPercentage = 0;
    const colors = ['#2dd4bf', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#a855f7', '#6366f1', '#ef4444'];

    const slices = Object.entries(distribution).map(([key, count], i) => {
      const percent = (count / total) * 100;
      const startAngle = (accumulatedPercentage * 360) / 100;
      const endAngle = ((accumulatedPercentage + percent) * 360) / 100;
      accumulatedPercentage += percent;

      const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 70 + 80;
      const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 70 + 80;
      const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * 70 + 80;
      const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * 70 + 80;

      const largeArc = percent > 50 ? 1 : 0;
      const color = colors[i % colors.length];

      return {
        path: `M80 80 L${x1} ${y1} A70 70 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color,
        name: key,
        percent: percent.toFixed(1),
        count
      };
    });

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.25rem',
        background: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--stroke-subtle)',
        gap: '1rem',
        minWidth: '220px'
      }}>
        <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)', textAlign: 'center' }}>{title}</h4>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke="var(--surface-card)"
              strokeWidth="1.5"
              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.setAttribute('opacity', '0.85')}
              onMouseLeave={(e) => e.currentTarget.setAttribute('opacity', '1')}
            />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', fontSize: '0.75rem', maxHeight: '100px', overflowY: 'auto' }}>
          {slices.map((slice, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: slice.color, flexShrink: 0 }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{slice.name}</span>
              </div>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>{slice.percent}% ({slice.count})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!token) {
    return (
      <div className="animate-fade" style={{ maxWidth: '400px', margin: '6rem auto 0 auto' }}>
        <form onSubmit={handleLogin} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'center', color: 'var(--accent-solid)' }}>Admin Panel Login</h2>
          
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Loading Dashboard Data...</h3>
      </div>
    );
  }

  const filteredUsers = data?.users.filter(user => 
    user.act_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.Predicted_Field.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-solid)', margin: '0 0 0.25rem 0' }}>Admin Console Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Review all candidate analyses, system feedbacks, and geo analytics charts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={handleDownload}>📊 Download Report CSV</button>
          <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      {data && (
        <>
          {/* Welcome Statistics */}
          <section className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Welcome Admin!</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Total submissions in database</p>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-solid)' }}>
              {data.stats.total_users}
            </div>
          </section>

          {/* Analytics Pie Charts */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Aggregated Usage Charts</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem'
            }}>
              {renderSVGPieChart(data.stats.fields_distribution, 'Predicted Field Recommendations')}
              {renderSVGPieChart(data.stats.levels_distribution, 'User Experience Levels')}
              {renderSVGPieChart(data.stats.city_distribution, 'Usage based on City')}
              {renderSVGPieChart(data.stats.state_distribution, 'Usage based on State')}
              {renderSVGPieChart(data.stats.country_distribution, 'Usage based on Country')}
            </div>
          </section>

          {/* User Submissions Search & Grid */}
          <section className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>User's Submissions Data</h3>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: '300px' }}
                placeholder="Search by name or field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--stroke-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Mobile</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Predicted Field</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Level</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>City</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>OS / Platform</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--stroke-subtle)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{user.ID}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{user.act_name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{user.act_mail}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{user.act_mob}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--accent-solid)', fontWeight: 600 }}>{user.Predicted_Field}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{user.resume_score}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`badge ${user.User_level === 'Intermediate' ? 'badge-success' : 'badge-teal'}`}>{user.User_level}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{user.city}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.os_name_ver}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.Timestamp.replace('_', ' ')}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No submission logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Feedback logs */}
          <section className="glass-card">
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>User's Feedback Data</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--stroke-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Rating</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Comments</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.feedbacks.map((feed, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--stroke-subtle)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{feed.ID}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{feed.feed_name}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{feed.feed_email}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--warning)', fontWeight: 'bold' }}>{feed.feed_score} ★</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{feed.comments}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{feed.Timestamp.replace('_', ' ')}</td>
                    </tr>
                  ))}
                  {data.feedbacks.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No feedbacks registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
