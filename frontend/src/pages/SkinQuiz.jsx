import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './SkinQuiz.css';

const SKIN_TYPE_INFO = {
  Oily: { emoji: '💧', desc: 'Your skin produces excess sebum. Look for lightweight, oil-free products.' },
  Dry: { emoji: '🌸', desc: 'Your skin needs extra hydration. Focus on rich, nourishing formulas.' },
  Combination: { emoji: '⚖️', desc: 'Your skin needs zone-specific care — oily T-zone, normal-to-dry elsewhere.' },
  Sensitive: { emoji: '🌿', desc: 'Your skin is reactive. Gentle, fragrance-free products are your best friends.' }
};

export default function SkinQuiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/quiz/questions').then(res => setQuestions(res.data));
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  const handleBack = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/quiz/submit', { answers });
      setResult(res.data);
      updateUser({ skinType: res.data.skinType, quizCompleted: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting quiz.');
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length) return <div className="spinner" />;

  if (result) {
    const info = SKIN_TYPE_INFO[result.skinType];
    return (
      <div className="quiz-result-page fade-in">
        <div className="quiz-result-card">
          <div className="result-confetti">✦ ✦ ✦</div>
          <div className="result-emoji">{info?.emoji}</div>
          <h2 className="result-title">Your skin type is</h2>
          <div className="result-skin-type">{result.skinType}</div>
          <p className="result-desc">{result.description}</p>
          <div className="result-tip">{info?.desc}</div>
          <button className="btn-primary result-btn" onClick={() => navigate('/dashboard')}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answered = answers[q?.id];
  const isLast = current === questions.length - 1;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1 className="quiz-brand">✦ Skin Type Quiz</h1>
          <p className="quiz-intro">Answer honestly — there are no wrong answers!</p>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">Question {current + 1} of {questions.length}</span>
        </div>

        <div className="quiz-card card fade-in" key={current}>
          <div className="question-num">Q{current + 1}</div>
          <h2 className="question-text">{q?.question}</h2>

          <div className="options-grid">
            {q?.options.map(opt => (
              <button
                key={opt.value}
                className={`option-btn ${answered === opt.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(q.id, opt.value)}
              >
                <span className="option-letter">{opt.value.toUpperCase()}</span>
                <span className="option-label">{opt.label}</span>
              </button>
            ))}
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="quiz-nav">
            <button className="btn-secondary" onClick={handleBack} disabled={current === 0}>
              ← Back
            </button>
            {isLast ? (
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !answered}
              >
                {loading ? 'Analyzing...' : 'See My Results ✦'}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!answered}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        <div className="quiz-dots">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === current ? 'dot-current' : ''} ${answers[questions[i]?.id] ? 'dot-answered' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
