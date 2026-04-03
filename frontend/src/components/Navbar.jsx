import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">SkinSights</span>
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
          <Link to="/analyze" className={`nav-link ${isActive('/analyze')}`}>Analyze</Link>
          <Link to="/history" className={`nav-link ${isActive('/history')}`}>History</Link>
          <Link to="/recommendations" className={`nav-link ${isActive('/recommendations')}`}>For You</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className={`nav-link nav-link-admin ${isActive('/admin')}`}>Admin</Link>
          )}
        </div>

        <div className="navbar-right">
          <Link to="/profile" className="nav-avatar" title={user.name}>
            <span>{user.name?.charAt(0).toUpperCase()}</span>
          </Link>
          <button onClick={handleLogout} className="nav-logout">Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
