import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Recommendations.css';

const TYPE_ICONS = {
  Cleanser: '🫧', Toner: '💧', Serum: '✨', Moisturizer: '🌿',
  Sunscreen: '☀️', Mask: '🎭', Exfoliant: '🔬', 'Eye Cream': '👁',
  Treatment: '💊', Other: '🧴'
};

export default function Recommendations() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/recommendations')
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const types = ['All', ...new Set(products.map(p => p.productType))];
  const filtered = filter === 'All' ? products : products.filter(p => p.productType === filter);

  if (loading) return <div className="spinner" style={{ marginTop: '80px' }} />;

  return (
    <div className="recs-page">
      <div className="container">
        <div className="recs-header fade-in">
          <div>
            <h1 className="recs-title">Recommended for You</h1>
            <p className="recs-sub">
              Curated products for <strong>{user?.skinType}</strong> skin, hand-picked by our team.
            </p>
          </div>
        </div>

        <div className="filter-tabs">
          {types.map(type => (
            <button
              key={type}
              className={`filter-tab ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {TYPE_ICONS[type] || '🧴'} {type}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌿</div>
            <h3 style={{ color: 'var(--text-mid)' }}>No recommendations yet</h3>
            <p>Check back soon — our team is curating products for your skin type!</p>
          </div>
        ) : (
          <div className="products-grid fade-in">
            {filtered.map(product => (
              <div key={product._id} className="product-card card">
                <div className="product-type-badge">
                  {TYPE_ICONS[product.productType] || '🧴'} {product.productType}
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-compatibility">
                  {product.skinTypeCompatibility.map(type => (
                    <span key={type} className="compat-tag">{type}</span>
                  ))}
                </div>
                {product.buyLink && (
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-buy-btn"
                  >
                    Shop Now →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
