import { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminDashboard.css';

const PRODUCT_TYPES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Mask', 'Exfoliant', 'Eye Cream', 'Treatment', 'Other'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'All'];

const EMPTY_FORM = { name: '', productType: 'Serum', skinTypeCompatibility: [], description: '', buyLink: '', imageUrl: '' };

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProducts = () => {
    api.get('/admin/products').then(res => setProducts(res.data));
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleSkinType = (type) => {
    setForm(prev => ({
      ...prev,
      skinTypeCompatibility: prev.skinTypeCompatibility.includes(type)
        ? prev.skinTypeCompatibility.filter(t => t !== type)
        : [...prev.skinTypeCompatibility, type]
    }));
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    setForm({ ...product });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
    flash('Product deleted.');
  };

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || form.skinTypeCompatibility.length === 0) {
      alert('Please fill name, description, and select at least one skin type.');
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, form);
        flash('Product updated!');
      } else {
        await api.post('/admin/products', form);
        flash('Product created!');
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header fade-in">
          <div>
            <h1 className="admin-title">👑 Admin Panel</h1>
            <p className="admin-sub">Manage recommended skincare products</p>
          </div>
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY_FORM); }}>
            {showForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {msg && <div className="admin-flash">{msg}</div>}

        {/* Product Form */}
        {showForm && (
          <div className="card admin-form fade-in">
            <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CeraVe Hydrating Cleanser" />
              </div>
              <div className="form-group">
                <label>Product Type *</label>
                <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })}>
                  {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Compatible Skin Types *</label>
              <div className="skin-type-toggles">
                {SKIN_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`skin-toggle ${form.skinTypeCompatibility.includes(type) ? 'selected' : ''}`}
                    onClick={() => toggleSkinType(type)}
                  >{type}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the product and its key benefits..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Buy Link <span className="optional">(optional)</span></label>
                <input value={form.buyLink} onChange={e => setForm({ ...form, buyLink: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Image URL <span className="optional">(optional)</span></label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
              <button className="btn-secondary" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="admin-products-grid">
          {products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px', gridColumn: '1/-1' }}>
              <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first recommendation!</p>
            </div>
          ) : products.map(product => (
            <div key={product._id} className="card admin-product-card">
              <div className="admin-product-header">
                <div className="admin-product-type">{product.productType}</div>
                <div className="admin-product-actions">
                  <button className="btn-secondary admin-edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
              <h4 className="admin-product-name">{product.name}</h4>
              <p className="admin-product-desc">{product.description}</p>
              <div className="product-compatibility">
                {product.skinTypeCompatibility.map(t => (
                  <span key={t} className="compat-tag">{t}</span>
                ))}
              </div>
              {product.buyLink && (
                <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="admin-link">
                  🔗 {product.buyLink.slice(0, 40)}...
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
