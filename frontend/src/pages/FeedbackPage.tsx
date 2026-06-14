import React, { useState, useEffect } from 'react';

interface FeedbackComment {
  feed_name: string;
  comments: string;
  Timestamp: string;
}

interface FeedbackData {
  ratings: Record<string, number>;
  comments: FeedbackComment[];
}

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ ratings: {}, comments: [] });

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !comments) return;

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, comments })
      });

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setComments('');
        setRating(5);
        fetchFeedback();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // SVG Pie Chart Generator
  const renderPieChart = () => {
    const ratings = feedbackData.ratings;
    const total = Object.values(ratings).reduce((a, b) => a + b, 0);
    if (total === 0) return <p style={{ color: 'var(--text-muted)' }}>No feedback ratings yet.</p>;

    let accumulatedPercentage = 0;
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#14b8a6']; // 1 to 5 stars colors

    const slices = Object.entries(ratings).map(([score, count]) => {
      const percent = (count / total) * 100;
      const startAngle = (accumulatedPercentage * 360) / 100;
      const endAngle = ((accumulatedPercentage + percent) * 360) / 100;
      accumulatedPercentage += percent;

      // Convert angles to polar coordinates
      const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 80 + 100;
      const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 80 + 100;
      const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * 80 + 100;
      const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * 80 + 100;

      const largeArc = percent > 50 ? 1 : 0;
      const color = colors[parseInt(score) - 1] || '#ccc';

      return {
        path: `M100 100 L${x1} ${y1} A80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color,
        score,
        percent: percent.toFixed(1),
        count
      };
    });

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke="var(--surface-card)"
              strokeWidth="2"
              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.setAttribute('opacity', '0.85')}
              onMouseLeave={(e) => e.currentTarget.setAttribute('opacity', '1')}
            >
              <title>{`Rating ${slice.score}: ${slice.percent}%`}</title>
            </path>
          ))}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {slices.map((slice, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: slice.color }} />
              <strong style={{ minWidth: '60px' }}>{slice.score} Star:</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{slice.count} votes ({slice.percent}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-solid)', margin: '0 0 0.5rem 0' }}>Share Your Feedback</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Help us improve the tool by sending us your reviews and feature recommendations.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Feedback form</h2>

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rate Us From 1 - 5 ({rating} Stars)</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              style={{ width: '100%', accentColor: 'var(--accent-solid)', cursor: 'pointer' }}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>1 (Terrible)</span>
              <span>3 (Average)</span>
              <span>5 (Excellent)</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comments</label>
            <textarea
              required
              className="form-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you think of the analysis?"
            />
          </div>

          {success && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.9rem' }}>
              🎉 Thanks! Your Feedback was recorded.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        {/* Ratings Chart Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, textAlign: 'center' }}>Past User Ratings</h2>
          {renderPieChart()}
        </div>
      </div>

      {/* Comment history table */}
      <section className="glass-card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>User Comments</h2>
        
        {feedbackData.comments && feedbackData.comments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--stroke-subtle)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>User</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Comment</th>
                  <th style={{ padding: '1rem 0.5rem', width: '150px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.comments.map((comment, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--stroke-subtle)', fontSize: '0.95rem' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{comment.feed_name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{comment.comments}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {comment.Timestamp.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>No comments submitted yet.</p>
        )}
      </section>
    </div>
  );
}
