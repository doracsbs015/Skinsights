import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const SKIN_TIPS = {
  Oily: ['Use oil-free, non-comedogenic moisturizers', 'Cleanse twice daily — but not more!', 'Niacinamide is your best friend for pore control', 'Never skip SPF — use gel-based sunscreen'],
  Dry: ['Layer serums before moisturizer while skin is damp', 'Look for ceramides, hyaluronic acid, glycerin', 'Avoid hot water when cleansing', 'Use a richer cream at night'],
  Combination: ['Use lightweight moisturizer all over', 'Target oily zones with niacinamide', 'Hydrate dry cheeks with a separate richer cream', 'Gentle exfoliation 2x per week'],
  Sensitive: ['Always patch test new products (48 hours)', 'Fragrance-free is non-negotiable', 'Introduce one new product at a time', 'Look for soothing ingredients: centella, aloe, allantoin']
};

export default function Dashboard() {
  const { user } = useAuth();
  const [recentHistory, setRecentHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, suitable: 0, caution: 0, unsuitable: 0 });

  useEffect(() => {
    api.get('/history?limit=3').then(res => {
      const analyses = res.data.analyses || [];
      setRecentHistory(analyses);
      setStats({
        total: res.data.pagination?.total || 0,
        suitable: analyses.filter(a => a.verdict === 'Suitable').length,
        caution: analyses.filter(a => a.verdict === 'Use with caution').length,
        unsuitable: analyses.filter(a => a.verdict === 'Not suitable').length
      });
    }).catch(() => {});
  }, []);

  const tips = SKIN_TIPS[user?.skinType] || [];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const verdictBadge = (verdict) => {
    if (verdict === 'Suitable') return 'badge badge-suitable';
    if (verdict === 'Use with caution') return 'badge badge-caution';
    return 'badge badge-unsuitable';
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Hero */}
        <div className="dashboard-hero fade-in">
          <div className="hero-text">
            <p className="hero-greeting">{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
            <h1 className="hero-title">Your Skin Dashboard</h1>
            <p className="hero-sub">
              Skin type: <strong>{user?.skinType}</strong> · Ready to analyze your next product?
            </p>
          </div>
          <Link to="/analyze" className="btn-primary hero-cta">
            Analyze Ingredients ✦
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">Products Analyzed</div>
          </div>
          <div className="stat-card stat-suitable">
            <div className="stat-num">{stats.suitable}</div>
            <div className="stat-label">Suitable</div>
          </div>
          <div className="stat-card stat-caution">
            <div className="stat-num">{stats.caution}</div>
            <div className="stat-label">With Caution</div>
          </div>
          <div className="stat-card stat-unsuitable">
            <div className="stat-num">{stats.unsuitable}</div>
            <div className="stat-label">Not Suitable</div>
          </div>
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          {/* Recent analyses */}
          <div className="card dash-section">
            <div className="section-header">
              <h3>Recent Analyses</h3>
              <Link to="/history" className="section-link">View all →</Link>
            </div>
            {recentHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <p>No analyses yet. Try analyzing your first product!</p>
                <Link to="/analyze" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Start Analyzing</Link>
              </div>
            ) : (
              <div className="history-list">
                {recentHistory.map(item => (
                  <div key={item._id} className="history-item">
                    <div className="history-item-left">
                      <div className="history-product">{item.productName || 'Unnamed Product'}</div>
                      <div className="history-date">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <span className={verdictBadge(item.verdict)}>
                      {item.verdict === 'Suitable' ? '✓' : item.verdict === 'Use with caution' ? '⚠' : '✗'} {item.verdict}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skin tips */}
          <div className="card dash-section skin-tips-card">
            <div className="section-header">
              <h3>Tips for {user?.skinType} Skin</h3>
            </div>
            <div className="tips-list">
              {tips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-bullet">✦</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
            <Link to="/recommendations" className="btn-secondary tips-cta">See Product Picks →</Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          <Link to="/analyze" className="quick-action-card">
           
            <div className="qa-text">
              <strong>Analyze Ingredients</strong>
              <span>Paste any ingredient list</span>
            </div>
          </Link>
          <Link to="/history" className="quick-action-card">
            <div className="qa-icon"></div>
            <div className="qa-text">
              <strong>View History</strong>
              <span>Your past analyses</span>
            </div>
          </Link>
          <Link to="/recommendations" className="quick-action-card">
            
            <div className="qa-text">
              <strong>Recommendations</strong>
              <span>Products for your skin</span>
            </div>
          </Link>
          <Link to="/profile" className="quick-action-card">
            
            <div className="qa-text">
              <strong>My Profile</strong>
              <span>Manage your account</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
