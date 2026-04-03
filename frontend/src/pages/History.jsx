import { useState, useEffect } from 'react';
import api from '../utils/api';
import './History.css';

const VERDICT_CONFIG = {
  'Suitable': { icon: '✓', cls: 'badge badge-suitable' },
  'Use with caution': { icon: '⚠', cls: 'badge badge-caution' },
  'Not suitable': { icon: '✗', cls: 'badge badge-unsuitable' }
};

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/history?page=${p}&limit=8`);
      setAnalyses(res.data.analyses);
      setPagination(res.data.pagination);
      setPage(p);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this analysis?')) return;
    await api.delete(`/history/${id}`);
    setAnalyses(prev => prev.filter(a => a._id !== id));
    if (expanded === id) setExpanded(null);
  };

  if (loading) return <div className="spinner" style={{ marginTop: '80px' }} />;

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header fade-in">
          <h1 className="history-title">Analysis History</h1>
          <p className="history-sub">All your past ingredient analyses, saved for reference.</p>
        </div>

        {analyses.length === 0 ? (
          <div className="card empty-history">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <h3>No analyses yet</h3>
            <p>Start by analyzing your first product's ingredients!</p>
          </div>
        ) : (
          <div className="history-list-page">
            {analyses.map(item => {
              const vc = VERDICT_CONFIG[item.verdict];
              const isOpen = expanded === item._id;
              return (
                <div key={item._id} className={`history-card card ${isOpen ? 'history-card-open' : ''}`}>
                  <div className="history-card-top" onClick={() => setExpanded(isOpen ? null : item._id)}>
                    <div className="history-card-left">
                      <div className="history-product-name">{item.productName || 'Unnamed Product'}</div>
                      <div className="history-meta">
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="meta-sep">·</span>
                        <span>{item.parsedIngredients?.length || 0} ingredients</span>
                        <span className="meta-sep">·</span>
                        <span>{item.skinType} skin</span>
                      </div>
                    </div>
                    <div className="history-card-right">
                      <span className={vc.cls}>{vc.icon} {item.verdict}</span>
                      <span className="expand-toggle">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="history-card-body fade-in">
                      {item.explanation && (
                        <div className="history-explanation">
                          <strong>AI Explanation:</strong>
                          <p>{item.explanation}</p>
                        </div>
                      )}

                      {item.riskyIngredients?.length > 0 && (
                        <div className="history-ing-section">
                          <div className="history-ing-title risky">⚠ Risky ({item.riskyIngredients.length})</div>
                          <div className="history-ing-tags">
                            {item.riskyIngredients.map((r, i) => (
                              <span key={i} className="ing-tag ing-tag-risky" title={r.reason}>{r.name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.beneficialIngredients?.length > 0 && (
                        <div className="history-ing-section">
                          <div className="history-ing-title safe">✓ Beneficial ({item.beneficialIngredients.length})</div>
                          <div className="history-ing-tags">
                            {item.beneficialIngredients.slice(0, 8).map((b, i) => (
                              <span key={i} className="ing-tag ing-tag-safe" title={b.benefit}>{b.name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="history-card-actions">
                        <button className="btn-danger" onClick={() => handleDelete(item._id)}>
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button className="btn-secondary" onClick={() => fetchHistory(page - 1)} disabled={page === 1}>← Prev</button>
                <span className="page-info">Page {page} of {pagination.pages}</span>
                <button className="btn-secondary" onClick={() => fetchHistory(page + 1)} disabled={page === pagination.pages}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
