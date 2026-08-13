import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">🏥 Hospital Management System</div>
      <div className="navbar-user">
        {user && (
          <>
            <span className="navbar-username">
              {user.name} <span className={`role-pill role-${user.role}`}>{user.role}</span>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
