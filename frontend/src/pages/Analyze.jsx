import { useState } from 'react';
import { extractTextFromImage } from './OCR';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Analyze.css';

const VERDICT_CONFIG = {
  'Suitable': { label: 'Suitable', className: 'suitable', color: '#2E7D52', bg: '#E8F7EE' },
  'Use with caution': { label: 'Use with Caution', className: 'caution', color: '#8B6A00', bg: '#FEF9E7' },
  'Not suitable': { label: 'Not Suitable', className: 'unsuitable', color: '#C0392B', bg: '#FDEAEA' }
};

const SAMPLE_INGREDIENTS = [
  'Water, Glycerin, Niacinamide, Sodium Hyaluronate, Panthenol, Allantoin, Centella Asiatica Extract, Ceramide NP, Tocopherol',
  'Water, Alcohol Denat, Fragrance, Glycerin, Salicylic Acid, Sodium Lauryl Sulfate, Methylparaben',
  'Water, Glycerin, Retinol, Jojoba Oil, Vitamin C, Hyaluronic Acid, Ferulic Acid, Squalane'
];

export default function Analyze() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [productName, setProductName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!ingredients.trim()) { setError('Please paste an ingredient list.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/analysis', { ingredients, productName });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setIngredients(sample);
    setResult(null);
    setError('');
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setOcrLoading(true);
  setError('');

  try {
    const cleaned = await extractTextFromImage(file);
    setIngredients(cleaned);
  } catch {
    setError('Could not read image. Please try a clearer photo.');
  } finally {
    setOcrLoading(false);
    e.target.value = '';
  }
};

  const config = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div className="analyze-page">
      <div className="container">
        <div className="analyze-header fade-in">
          <h1 className="analyze-title">Ingredient Analyzer</h1>
          <p className="analyze-subtitle">
            Paste any skincare product's ingredient list to see if it's safe for your <strong>{user?.skinType || 'your'}</strong> skin.
          </p>
        </div>

        <div className="analyze-grid">
          <div className="card analyze-input-card">
            <div className="form-group">
              <label>Product Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. CeraVe Moisturizing Cream"
                value={productName}
                onChange={e => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="ocr-upload-section">
                <label className="ocr-upload-btn" style={{ opacity: ocrLoading ? 0.6 : 1 }}>
                  {ocrLoading ? 'Reading image...' : 'Upload Label Image'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    disabled={ocrLoading}
                  />
                </label>
                {ocrLoading && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Scanning ingredient label... this takes a few seconds.
                  </p>
                )}
                {!ocrLoading && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Make sure the image is clear and contains only ingredient text. Extra symbols or non-ingredient words may increase unknown count.
                  </p>
                )}
              </div>

              <label>Ingredient List</label>
              <textarea
                className="ingredients-textarea"
                placeholder="Paste the full ingredient list here, separated by commas...
e.g. Water, Glycerin, Niacinamide, Salicylic Acid..."
                value={ingredients}
                onChange={e => { setIngredients(e.target.value); setError(''); }}
                rows={10}
              />
            </div>

            <div className="sample-section">
              <p className="sample-label">Try a sample:</p>
              <div className="sample-btns">
                {['Safe Formula', 'Risky Formula', 'Mixed Formula'].map((label, i) => (
                  <button key={i} className="sample-btn" onClick={() => loadSample(SAMPLE_INGREDIENTS[i])}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn-primary analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <span className="analyzing-text">
                  <span className="dot-flashing" /> Analyzing...
                </span>
              ) : 'Analyze Ingredients'}
            </button>
          </div>

          <div className="analyze-results">
            {!result && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">Analysis will appear here</div>
                <h3>Awaiting Input</h3>
                <p>Paste an ingredient list or upload a label image to get a verdict for your {user?.skinType || 'your'} skin.</p>
              </div>
            )}

            {loading && (
              <div className="results-placeholder">
                <div className="spinner" />
                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '8px' }}>
                  Scanning ingredients & generating explanation...
                </p>
              </div>
            )}

            {result && config && (
              <div className="results-content fade-in">
                <div
                  className={`verdict-banner verdict-${config.className}`}
                  style={{ background: config.bg, borderColor: config.color + '33' }}
                >
                  <div>
                    <div className="verdict-label" style={{ color: config.color }}>{config.label}</div>
                    <div className="verdict-sub">
                      for {result.skinType || 'your'} skin · {result.summary?.total || 0} ingredients analyzed
                    </div>
                  </div>
                </div>

                {result.summary && (
                  <div className="result-stats">
                    <div className="result-stat">
                      <span className="rs-num green">{result.summary.beneficial || 0}</span>
                      <span className="rs-label">Beneficial</span>
                    </div>
                    <div className="result-stat">
                      <span className="rs-num red">{result.summary.risky || 0}</span>
                      <span className="rs-label">Risky</span>
                    </div>
                    <div className="result-stat">
                      <span className="rs-num gray">{result.summary.unknown || 0}</span>
                      <span className="rs-label">Unknown</span>
                    </div>
                  </div>
                )}

                {result.explanation && (
                  <div className="explanation-card">
                    <div className="explanation-header">AI Explanation</div>
                    <p className="explanation-text">{result.explanation}</p>
                  </div>
                )}

                {result.riskyIngredients?.length > 0 && (
                  <div className="ingredients-section">
                    <h4 className="ing-section-title risky-title">Risky Ingredients ({result.riskyIngredients.length})</h4>
                    {result.riskyIngredients.map((ing, i) => (
                      <div key={i} className="ingredient-pill risky-pill">
                        <div className="ing-name">{ing.name}</div>
                        <div className="ing-reason">{ing.reason}</div>
                        <span className={`severity-badge sev-${ing.severity}`}>{ing.severity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.beneficialIngredients?.length > 0 && (
                  <div className="ingredients-section">
                    <h4 className="ing-section-title safe-title">Beneficial Ingredients ({result.beneficialIngredients.length})</h4>
                    <div className="benefits-grid">
                      {result.beneficialIngredients.slice(0, 6).map((ing, i) => (
                        <div key={i} className="benefit-pill">
                          <div className="ing-name">{ing.name}</div>
                          <div className="ing-reason">{ing.benefit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}