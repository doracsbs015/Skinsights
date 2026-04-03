import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', age: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile').then(res => {
      setProfile(res.data);
      setForm({ name: res.data.name, age: res.data.age || '' });
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/profile', { name: form.name, age: form.age ? parseInt(form.age) : null });
      updateUser({ name: form.name, age: form.age });
      setProfile(prev => ({ ...prev, name: form.name, age: form.age }));
      setEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    }
  };

  const SKIN_COLORS = { Oily: '#4CAF50', Dry: '#2196F3', Combination: '#FF9800', Sensitive: '#E91E63' };

  if (!profile) return <div className="spinner" style={{ marginTop: '80px' }} />;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-grid">
          {/* Profile Card */}
          <div className="card profile-card fade-in">
            <div className="profile-avatar">
              <span>{profile.name?.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>

            {profile.skinType && (
              <div className="skin-type-badge" style={{ background: SKIN_COLORS[profile.skinType] + '22', color: SKIN_COLORS[profile.skinType], border: `1.5px solid ${SKIN_COLORS[profile.skinType]}44` }}>
                {profile.skinType} Skin
              </div>
            )}

            <div className="profile-stats">
              <div className="pstat">
                <div className="pstat-num">{profile.totalAnalyses}</div>
                <div className="pstat-label">Total Analyses</div>
              </div>
              <div className="pstat">
                <div className="pstat-num">{profile.age || '—'}</div>
                <div className="pstat-label">Age</div>
              </div>
              <div className="pstat">
                <div className="pstat-num">{profile.role === 'admin' ? '👑' : '🌸'}</div>
                <div className="pstat-label">{profile.role}</div>
              </div>
            </div>

            <div className="profile-since">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Edit Form */}
          <div className="card profile-edit-card">
            <div className="section-header">
              <h3>Account Details</h3>
              {!editing && (
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {msg && <div className="success-msg">{msg}</div>}
            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label>Full Name</label>
              {editing ? (
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : (
                <div className="profile-field-value">{profile.name}</div>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="profile-field-value muted">{profile.email} <span className="locked-badge">🔒 locked</span></div>
            </div>

            <div className="form-group">
              <label>Age</label>
              {editing ? (
                <input type="number" min="10" max="100" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Optional" />
              ) : (
                <div className="profile-field-value">{profile.age || <span className="muted">Not set</span>}</div>
              )}
            </div>

            <div className="form-group">
              <label>Skin Type</label>
              <div className="profile-field-value">{profile.skinType || 'Not determined yet'} <span className="locked-badge">🔒 from quiz</span></div>
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                <button className="btn-secondary" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
